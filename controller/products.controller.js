const RequestsModel = require("../model/requests.model");
const {
  productsService,
  usersService,
  vendorsService,
  promoService,
} = require("../service");
const {
  generateRandomNumber,
  groupByOr,
  buildFilterQuery,
  s3Bucket,
  s3,
  sendRequestUpdateEmail,
} = require("../utils/helpers");
const { sendNotification } = require("../utils/onesignal");
const { successResponse, errorResponse } = require("../utils/responder");
const fs = require("fs");
const jwt = require("jsonwebtoken");

exports.createProducts = async (req, res, next) => {
  try {
    const data = await productsService.createProducts({
      ...req.body,
      slug:
        req.body.title?.replace(/[" "]/gi, "-") + "-" + generateRandomNumber(5),
    });

    successResponse(res, data);
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};
exports.createComments = async (req, res, next) => {
  try {
    const data = await productsService.createComments({
      ...req.body,
      creatorId: req.userId,
    });
    successResponse(res, data);
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};
exports.updateProducts = async (req, res, next) => {
  try {
    var updateObj = {};
    Object.keys(req.body).forEach((key) => {
      updateObj[key] = req.body[key];
    });
    updateObj.priceUpdatedAt = new Date();
    const data = await productsService.updateProducts(
      { _id: updateObj._id },
      updateObj
    );
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.getProducts = async (req, res, next) => {
  var token = req.header("authorization");
  try {
    if (token) {
      token = token.split(" ")[1];
      var data = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = data._id;
    }
  } catch (error) {
    console.log(error);
  }
  try {
    var filter = {};
    var { sort, limit = 9, page = 1, title } = req.query;

    var pagination = { limit, page };

    const query = await buildFilterQuery(req.query);
    console.log(JSON.stringify(query), limit, sort);
    var searchSortObj = title ? { score: { $meta: "textScore" } } : {};

    sort =
      sort == "highToLow"
        ? { sort: { ...searchSortObj, original_price: -1 , videoUrl: -1} }
        : sort == "lowToHigh"
        ? { sort: { ...searchSortObj, original_price: 1 , videoUrl: 1} }
        : sort == "latest" ?   { sort: { videoUrl: -1} } : 
        { sort: { ...searchSortObj,  } };

    if (title) sort.sort.score = { $meta: "textScore" };
    const options = {
      ...sort,
      ...pagination,
    };
    if (title) options.score = { $meta: "textScore" };

    const data = await productsService.getProducts({
      query: { ...query, archive: false },
      options,
    });
    if (query.slug && data.totalDocs == 1) {
      var promo = await promoService.getPromo({});
      var obj = promo.toObject();
      const applied = obj.rewards.applied
        .map((id) => id.toString())
        .includes(req.userId);
      if (
        applied &&
        data.docs[0]._id?.toString() == obj.rewards.productId._id?.toString()
      ) {
        data.docs[0].discounted_price = 0;
      }
    }
    successResponse(res, data);
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    // Handle image uploads
    console.log(req.files, 'received files')
    const images = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
      console.log('reading file')
      // Save each file and add the file path or URL to images array
      for (const key in files) {
        const fileContent = fs.readFileSync(files[key].tempFilePath);
        console.log('uploading file')
        s3.upload({
          Bucket: s3Bucket,
          Key: "images/" + files[key].name,
          ACL: "public-read",
          Body: fileContent,
          ContentType: files[key].mimetype,
        })
          .promise()
          .then((result) => {
            images.push(result.Location);
            if (files.length - 1 == key) successResponse(res, { images });
          });
      }
    }
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    // Handle image uploads
    const images = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      // Save each file and add the file path or URL to images array
      for (const key in files) {
        const fileContent = fs.readFileSync(files[key].tempFilePath);
        s3.upload({
          Bucket: s3Bucket,
          Key: "images/" + files[key].name,
          ACL: "public-read",
          Body: fileContent,
          ContentType: files[key].mimetype,
        })
          .promise()
          .then((result) => {
            images.push(result.Location);
            if (files.length - 1 == key) successResponse(res, { images });
          });
      }
    }
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};

exports.checkAvailability = async (req, res, next) => {
  try {
    // Handle image uploads
    const { variant, _id, title, vendorId, slug, images } = req.body;
    const users = await usersService.getUsers({
      email: {
        $in: [
          "habibmail31@gmail.com",
          "gadgetchamberteam@gmail.com",
          "devhabeeb@gmail.com",
        ],
      },
    });
    var include_player_ids = users.docs?.map?.((u) => u.oneSignalId);
    var product = await RequestsModel.create({
      productId: _id,
      variant,
      userId: req.userId,
      vendorId,
    });
    const text = `${
      req.firstName || "A new customer"
    } is inquiring about the availability of the ${title} ${variant}. Could you please confirm if it's in stock?`;

    sendNotification({
      // headings: { "en": `Crypto Gains Got You Feeling Rich?` },
      // contents: { "en": `If you haven't spent it, did it even happen? Time to turn those digital coins into real tech toys at 360GadgetsAfrica!` },
      // include_subscription_ids:   include_player_ids,
      // url: '360gadgetsfrica://product-description?slug=' + product?.productId?.slug
      headings: { en: `You have a new request` },
      contents: { en: text },
      include_subscription_ids: include_player_ids,
      url: "360gadgetsfrica://requests",
    });
    users.docs.map((u) => {
      sendRequestUpdateEmail({
        subject: `You have a new confimation request`,
        email: u.email,
        title,
        slug,
        img: images[0],
        description: text,
      });
    });
    successResponse(res, product);
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    // Handle image uploads
    const { title, variant, userId, _id, confirmation } = req.body;
    const users = await usersService.getUsers({ _id: userId });
    var text = confirmation
      ? `Good news, ${users.docs[0].firstName}! ${title}${
          variant && " (" + variant + ")"
        } is in stock and ready for purchase. Click add to cart and proceed to checkout. We look forward to receiving your order!`
      : `Thank you for checking with us, ${
          users.docs[0].firstName
        }! Sadly, ${title}${
          variant && " (" + variant + ")"
        } is out of stock right now. Please check back later!`;
    const product = await RequestsModel.updateOne(
      { _id },
      {
        archive: true,
        confirmation,
      }
    ).populate("productId");
    const notUsers = await usersService.getUsers({
      email: { $in: ["habibmail31@gmail.com", "devhabeeb@gmail.com"] },
    });
    var include_player_ids = notUsers.docs?.map?.((u) => u.oneSignalId);

    sendNotification({
      headings: { en: `We Have an Update For You` },
      contents: { en: text },
      include_subscription_ids: [
        users.docs[0].oneSignalId,
        ...include_player_ids,
      ],
      url:
        "360gadgetsfrica://product-description?slug=" +
        product?.productId?.slug,
    });
    sendRequestUpdateEmail({
      subject: `Hey ${users.docs[0].firstName}, You have a new notification`,
      email: users.docs[0].email,
      title: product?.productId?.title,
      slug: product?.productId?.slug,
      img: product?.productId?.images[0],
      description: text,
    });
    successResponse(res, product);
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};

exports.fetchAvailabilityRequests = async (req, res, next) => {
  try {
    const vendor = await vendorsService.getVendors({ creatorId: req.userId });
    const data = await productsService.fetchAvailabilityRequests({
      vendorId: vendor?.docs[0]?._id,
      archive: false,
    });

    successResponse(res, data);
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};

exports.bulkUpdate = async (req, res, next) => {
  try {
    const data = await productsService
      .bulkUpdate
      // {categoryId: '65b14b7105f8b5c69b5ab4e3'}, // Exclude the specific ID
      // { vendorId:  '66927af6eb322a27f7c6902c' }, // Exclude the specific ID
      // { categoryId:  '65b14b7105f8b5c69b5ab4e3' }, // Exclude the specific ID
      // { $inc: { discounted_price: -2000} } // Increment the price
      // { categoryId: { $ne: '65b14b7105f8b5c69b5ab4e3' } }, // Exclude the specific ID
      // { $inc: { discounted_price: 30000,  } } // Increment the price
      ();
    successResponse(res, data);
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await productsService.deleteProduct(id);
    successResponse(res, data);
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await productsService.getProductById(id);
    successResponse(res, data);
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    var updateObj = {};
    Object.keys(req.body).forEach((key) => {
      updateObj[key] = req.body[key];
    });
    updateObj.priceUpdatedAt = new Date();
    const data = await productsService.updateProducts({ _id: id }, updateObj);
    successResponse(res, data);
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};
