const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const emailTemplates = require("../emailTemplates");
const AWS = require("aws-sdk")
const crypto = require("crypto");
const { getCategories } = require("../service/categories.service");
exports.s3Bucket = process.env.AWS_BUCKET;

exports.s3 = new AWS.S3({
  // accessKeyId: "DO00ZKFKZUK9KBM9UVGD",
  // secretAccessKey: "BNuZl6+BfUYJG7iEcmWwjp76M6PnJDWx9N20iBRF7hQ",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

const emailTransporter = nodemailer.createTransport({
  // service: "Outlook365",
  host:  process.env.SMTP_HOST,
  port: "587",
  tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
  },
  auth: {
    user:  process.env.SMTP_EMAIL, // generated ethereal user
    pass:  process.env.SMTP_PASSWORD, // generated ethereal password
  },
});
exports.generateRandomNumber = (n) => {
  return Math.floor(Math.random() * (9 * Math.pow(10, n - 1))) + Math.pow(10, n - 1);
}

exports.createToken = (data) => {
  var token = jwt.sign(data, process.env.JWT_SECRET);
  return token;
};

exports.sendSignupMail = (email) => {
  emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <support@360gadgetsafrica.com>', 
      to: email,
      subject: "Welcome to 360 Gadgets Africa – Your Ultimate Tech Destination!",
      html: emailTemplates.signup(),
    })
    .then((suc) => {
      console.log(suc);
    })
    .catch((err) => {
      console.log(err);
    });
};


exports.sendOtpCode = (email, code) => {
  emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <support@360gadgetsafrica.com>', 
      to: email,
      subject: "Verify your account",
      html: emailTemplates.otpCode(code),
    })
    .then((suc) => {
      console.log(suc);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.sendErrorEmail = (error) => {
  emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <support@360gadgetsafrica.com>', 
      to: 'habibmail31@gmail.com',
      subject: "An error has occured",
      html: `${error}`,
    })
    .then((suc) => {
      console.log(suc);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.sendOrdersEmail = ({order,address, pickup}) => {
  emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <support@360gadgetsafrica.com>', 
      to: ['support@360gadgetsafrica.com', 'habeeb@360gadgetsafrica.com', 'gadgetchamberteam@gmail.com'],
      subject: "You have a new order",
      html:  emailTemplates.newOrder({order, address, pickup})
    })
    .then((suc) => {
      console.log(suc);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.sendOrderConfirmationEmail = ({email, order, address}) => {
  emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <support@360gadgetsafrica.com>', 
      to:  email,
      subject: "Order Confirmation - 360gadgetsafrica",
      html:  emailTemplates.orderConfirmation({order,address})
    })
    .then((suc) => {
      console.log(suc);
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.sendSwapEmail = (order) => {
  emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <support@360gadgetsafrica.com>', 
      to: 'support@360gadgetsafrica.com',
      subject: "You have a new swap order",
      html: `Hi there, you have a new swap order 
      ${JSON.stringify(order)}`,
    })
    .then((suc) => {
      console.log(suc);
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.sendRequestUpdateEmail = ({subject,title,description,slug,img, email}) => {
  emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <support@360gadgetsafrica.com>', 
      to: email,
      subject,
      html:  emailTemplates.requestUpdate({title,description,slug,img}),
    })
    .then((suc) => {
      console.log(suc);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.buildFilterQuery = async (reqQuery) => {
  let filters = [];
  
  for (const key of Object.keys(reqQuery)) {
    if (reqQuery[key] !== "" && key !== "limit" && key !== "page") {
      let lists = reqQuery[key].split(",").map(i => {
        let val = i;
        
        if (key === 'original_price') {
          const arr = i.split('--');
          val = { "$gte": parseInt(arr[0]), "$lte": parseInt(arr[1]) };
        } else if (key === 'rating') {
          val = { "$gte": i, "$lte": 5 };
        }

        return { [key]: val };
      });

      filters.push(...lists);
    }
  }

  const query = { $and: [] };
  const query2 = {};

  // Containers for different query conditions
  let categoryConditions = [];
  let priceConditions = [];
  let ratingConditions = [];
  let searchConditions = [];

  for (const filter of filters) {
    const key = Object.keys(filter)[0];
    let value = key === 'slug' ? decodeURIComponent(filter[key]) : filter[key];

    if (key === 'sort') {
      continue; // Skip sorting here
    }
    
    if (key === 'title') {
      searchConditions.push({ $search: value });
    } else if (key === 'categoryId') {
      categoryConditions.push({ [key]: value });
    } else if (key === 'category') {
      // Await category fetch and update the condition
    const cat = await getCategories({ slug: value });
      if (cat.totalDocs && cat.docs.length > 0) {
        console.log(cat.totalDocs,'totaldocs')
        categoryConditions.push({ categoryId: cat.docs[0]._id });
      }
    } else if (key === 'original_price' || key === 'rating') {
      if (Array.isArray(value)) {
        value.forEach(range => priceConditions.push({ [key]: range }));
      } else {
        priceConditions.push({ [key]: value });
      }
    } else if (key !== 'fbclid') {
      query2[key] = value;
    }
  }

  // Add conditions to the query
  if (categoryConditions.length > 0) query.$and.push({ $or: categoryConditions });
  if (priceConditions.length > 0) query.$and.push({ $or: priceConditions });
  if (ratingConditions.length > 0) query.$and.push({ $or: ratingConditions });
  if (searchConditions.length > 0) query2['$text'] = searchConditions[0];
  console.log(query, query2)

  return query.$and.length ? { ...query, ...query2 } : { ...query2 };
};

exports.isAppleRelayEmail = (email) => {
  // Regular expression to match random strings followed by @privaterelay.appleid.com
  const appleRelayPattern = /^[a-z0-9._%+-]+@privaterelay\.appleid\.com$/i;
  return appleRelayPattern.test(email);
};
 
// Function to verify the HMAC signature
exports.verifyMonnifySignature = (payload, signature) => {
  const hash = crypto
    .createHmac("sha512", process.env.MONIFY_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest("hex");
  return hash === signature;
}

exports.calculateFee = (initFee = 1.7, amount)=>{
  const feePercentage = initFee/100; 
  const maxFee = 2000; // Maximum fee
  const minFee = 100; // Minimum fee
  const calculatedFee = amount * feePercentage;
  const fee = Math.max(minFee, Math.min(calculatedFee, maxFee)); // Ensures fee is between minFee and maxFee
  return Math.round(fee * 10) / 10; // Rounds to 1 decimal place
}