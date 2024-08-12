const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const emailTemplates = require("../emailTemplates");
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

exports.sendOrdersEmail = (order) => {
  emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <support@360gadgetsafrica.com>', 
      to: 'support@360gadgetsafrica.com',
      subject: "You have a new order",
      html: `Hi there, you have a new order 
      ${order}`,
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

  filters.forEach(filter => {
    const key = Object.keys(filter)[0];
    const value = filter[key];

    if (key === 'sort') {
      // Handle sorting separately
      return;
    }

    if (key === 'categoryId') {
      categoryConditions.push({ [key]: value });
    } else if (key === 'original_price' || key === 'rating') {
      if (Array.isArray(value)) {
        value.forEach(range => {
          priceConditions.push({ [key]: range });
        });
      } else {
        priceConditions.push({ [key]: value });
      }
    } else {
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
  return query.$and.length ? {...query, ...query2} : {...query2};
}


