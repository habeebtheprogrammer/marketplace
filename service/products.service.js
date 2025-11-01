const Products = require("../model/products.model");
const RequestsModel = require("../model/requests.model");

exports.getProducts = async ({ query = {}, options = {} }) => {
  console.log('looooooo')
  const data = await Products.paginate(query, {
    populate: [
      {
        path: "categoryId",
        select: ["title", "slug"],
      },
      {
        path: "vendorId",
        select: ["title", "phone", "videos", "address","regNum", 'image'],
      },
      {
        path: "comments.creatorId",
        select: ["firstName", "lastName"],
      },
    ],
    ...options,
  });

  if (data.totalDocs == 1) {
    await Products.findOneAndUpdate(query, { $inc: { views: 1 } });
  }
  return data;
};

exports.createProducts = async (param) => {
  const data = await Products.create(param);
  return data;
};

exports.createComments = async (comments) => {
  const data = await Products.findOneAndUpdate(
    { _id: comments.productId },
    { $addToSet: { comments } }
  );
  return data;
};
exports.updateProducts = async (param, obj) => {
  const data = await Products.findOneAndUpdate(param, obj, { new: true });
  return data;
};

exports.fetchAvailabilityRequests = async (filters = {}) => {
  const data = await RequestsModel.paginate(filters, {
    populate: ["productId", "userId"],
    sort: { _id: -1 },
  });
  return data;
};

exports.bulkUpdate = async (param, obj) => {
  const data = await Products.updateMany(param, obj);
  return data;
};

exports.deleteProduct = async (id) => {
  const data = await Products.findByIdAndUpdate(id, { archive: true });
  return data;
};

exports.getProductById = async (id) => {
  const data = await Products.findById(id).populate([
    {
      path: "categoryId",
      select: ["title", "slug"],
    },
    {
      path: "vendorId",
      select: ["title", "phone", "videos", "address","regNum", 'image'],
    },
  ]);
  if (!data) {
    throw new Error("Product not found");
  }
  return data;
};
