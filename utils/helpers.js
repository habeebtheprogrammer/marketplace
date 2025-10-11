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


exports.emailTransporter = nodemailer.createTransport({
  // service: "Outlook365",
  host:  process.env.SMTP4_HOST,
port: 465,
secure: true,
  auth: {
    user:  process.env.SMTP4_USER, // generated ethereal user
    pass:  process.env.SMTP4_PASSWORD, // generated ethereal password
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
  this.emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <hello@360gadgetsafrica.com>', 
      to: email,
      subject: "Welcome to 360gadgetsafrica! Connect with reliable sellers across Nigeria",
      html: emailTemplates.welcome_email(),
    })
    .then((suc) => {
      console.log(suc);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.sendOtpCode = (email, code) => {
  this.emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <hello@360gadgetsafrica.com>', 
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
  this.emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <hello@360gadgetsafrica.com>', 
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

exports.sendOrdersEmail = ({order,address, pickup, deliveryMethod}) => {
  this.emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <hello@360gadgetsafrica.com>', 
      to: ['hello@360gadgetsafrica.com', 'habeeb@360gadgetsafrica.com', 'gadgetchamberteam@gmail.com'],
      subject: "You have a new order",
      html:  emailTemplates.newOrder({order, address, pickup, deliveryMethod})
    })
    .then((suc) => {
      console.log(suc);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.sendOrderConfirmationEmail = ({email, order, address}) => {
  this.emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <hello@360gadgetsafrica.com>', 
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

exports.sendPasswordResetEmail = async (email, resetLink) => {
  console.log(email, resetLink)
  try {
    await this.emailTransporter.sendMail({
      from: '"360gadgetsafrica" <hello@360gadgetsafrica.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <p>Best regards,<br>The 360gadgetsafrica Team</p>
        </div>
      `
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

exports.sendSwapEmail = (order) => {
  this.emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <hello@360gadgetsafrica.com>', 
      to: 'hello@360gadgetsafrica.com',
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
  this.emailTransporter
    .sendMail({
      from:   '"360gadgetsafrica" <hello@360gadgetsafrica.com>', 
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

exports.slugify = (text) => {
  return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters except space and hyphen
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Remove duplicate hyphens
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

exports.isNotableEmail = (email) => {
  const notableProviders = [
      "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", 
      "icloud.com", "aol.com", "protonmail.com", "zoho.com", 
      "yandex.com", "mail.com", "gmx.com", "live.com"
  ];

  // Extract domain from email
  const domain = email.split("@")[1]?.toLowerCase();

  // Check if domain is in the notable providers list
  return notableProviders.includes(domain);
}

exports.removeCountryCode = (phoneNumber, countryCode = "+234") => {
  // Ensure the phone number starts with the country code
  if (phoneNumber.startsWith(countryCode)) {
      phoneNumber = phoneNumber.slice(countryCode.length); // Remove country code
  }

  // Ensure the number starts with '0'
  if (!phoneNumber.startsWith("0")) {
      phoneNumber = "0" + phoneNumber;
  }

  return phoneNumber;
}

exports.combineAndSortDataPlan = (array1, array2) => {
  // Combine the arrays
  const combinedArray = [...array1, ...array2];

  // Function to extract numeric value from plan name for sorting (converting to MB)
  function extractSize(planName) {
    const value = parseFloat(planName);
    if (planName.includes('TB')) return value * 1024 * 1024;
    if (planName.includes('GB')) return value * 1024;
    if (planName.includes('MB')) return value;
    return 0;
  }

  // Sort first by network then by data size in planName
  return combinedArray.sort((a, b) => {
    // Compare network names (case insensitive)
    const networkA = a.network.toUpperCase();
    const networkB = b.network.toUpperCase();
    if (networkA < networkB) return -1;
    if (networkA > networkB) return 1;

    // If networks are the same, compare plan names based on data size
    const planA = a.planName || a.plan_name || "";
    const planB = b.planName || b.plan_name || "";
    const sizeA = extractSize(planA);
    const sizeB = extractSize(planB);
    
    return sizeA - sizeB;
  });
}

exports.checkDaysMatch = (str) => {
  const lowerStr = str.toLowerCase();
  
  // if (lowerStr.includes('30day') || lowerStr.includes('30 days') || lowerStr.includes('30days')|| lowerStr.includes('1month')) {
  //     return '1 Month';
  // }
  
  // const match = lowerStr.match(/(\d+)\s*days?/);
  
  // if (match) {
  //     return `${match[1]} Day${match[1] > 1 ? 's' : ''}`;
  // } else console.log(str)
  
  return lowerStr; // or handle invalid cases
}

exports.convertToMegabytes = (dataString) => {
  const unitsToMB = {
    B: 1 / (1024 * 1024),
    KB: 1 / 1024,
    MB: 1,
    GB: 1024,
    TB: 1024 * 1024,
  };

  const match = dataString.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  return value * unitsToMB[unit];
}