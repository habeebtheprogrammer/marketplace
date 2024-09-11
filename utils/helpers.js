const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const emailTemplates = require("../emailTemplates");
const AWS = require("aws-sdk")
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
      to: ['support@360gadgetsafrica.com', 'habeeb@360gadgetsafrica.com'],
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
exports.buildFilterQuery = (reqQuery) => {
  var filters = []
  Object.keys(reqQuery).forEach((key) => {
    if (reqQuery[key] !== "" && (key != "limit" && key != "page")) {
      lists = reqQuery[key].split(",")
        .map(i => {
          var val = i
          if (key == 'original_price') {
            var arr = i.split('--');
            val = { "$gte": parseInt(arr[0]), "$lte": parseInt(arr[1]) }
          } else if (key == 'rating') {
            val = { "$gte": i, "$lte": 5 }
          }
          return ({ [key]: val })
        })

      filters.push(...lists)
    }
  })
  const query = {
    $and: []
  };
  const query2 = {}

  // Initialize containers for $or conditions
  let categoryConditions = [];
  let priceConditions = [];
  let ratingConditions = [];
  let searchConditions = [];

  filters.forEach(filter => {
    const key = Object.keys(filter)[0];
    const value =   filter[key] == 'slug' ?  decodeURIComponent(filter[key]) : filter[key]

    if (key === 'sort') {
      // Handle sorting separately
      return;
    }
    if (key === 'title') {
      const words = value.split(' ').filter(word => word.length > 0);

    // Create a regex that matches any of the words
    // const regex = new RegExp(searchTerm, 'i')
    // const regex = words.map(word => new RegExp(word, 'i')); 
      // Handle sorting separately
      searchConditions.push( { $search: value } ) 
    } else if (key === 'categoryId') {
      categoryConditions.push({ [key]: value });
    } else if (key === 'original_price' || key === 'rating') {
      if (Array.isArray(value)) {
        value.forEach(range => {
          priceConditions.push({ [key]: range });
        });
      } else {
        priceConditions.push({ [key]: value });
      }
    }else if(key == 'fbclid'){} else {
      query2[key] = value
    }
  });

  // Add conditions to the query
  if (categoryConditions.length > 0) {
    query.$and.push({ $or: categoryConditions });
  }

  if (priceConditions.length > 0) {
    query.$and.push({ $or: priceConditions });
  }

  if (ratingConditions.length > 0) {
    query.$and.push({ $or: ratingConditions });
  }
  if(searchConditions.length > 0) {
    // query.$and.push({ $or: searchConditions });
  
    query2['$text'] = searchConditions[0]

  }
  return query.$and.length ? {...query, ...query2} : {...query2};
}


