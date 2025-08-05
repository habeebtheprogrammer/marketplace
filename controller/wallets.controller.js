const fetch = require("node-fetch");
const axios = require("axios");
const { usersService, walletsService } = require("../service");
const dataplan = require("../dataplan.json");
const { detectNetwork } = require("../utils/vtu");
const {
  generateRandomNumber,
  verifyMonnifySignature,
  calculateFee,
  isNotableEmail,
  removeCountryCode,
  combineAndSortDataPlan,
  convertToMegabytes,
} = require("../utils/helpers");
const { successResponse, errorResponse } = require("../utils/responder");
const { sendNotification } = require("../utils/onesignal");
const Wallet = require("../model/wallets.model");
const Transactions = require("../model/transactions.model");
const AppliedCoupon = require("../model/appliedCoupons.model");
const Coupon = require("../model/coupons.model");
const mongoose = require("mongoose");

// const vendor = "QUICKVTU"  //'QUICKVTU' or 'BILALSDATAHUB'

// Helper function to make authenticated requests to Monify API
async function korraPay(endpoint, method, body = null, apikey) {
  // const url = `${MONIFY_BASE_URL}${endpoint}`;
  const url = "https://api.korapay.com/merchant" + endpoint;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apikey ? apikey : process.env.KORRA_SECRET_KEY}`,
  };
  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  const response = await fetch(url, options);
  return await response.json();
}

async function quickVTU(endpoint, method, body = null, vendor) {
  // const url = `${MONIFY_BASE_URL}${endpoint}`;
  var result;
  if (vendor == "quickvtu") {
    const config = {
      headers: {
        Authorization: `Token ${process.env.QUICKVTU_TOKEN}`,
        "Content-Type": "application/json",
      },
    };
    result = await axios.post(
      "https://quickvtu.com" + endpoint,
      JSON.stringify(body),
      config
    );
  } else if (vendor == "bilal") {
    const config = {
      headers: {
        Authorization: `Token ${process.env.BILALSHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
    };
    result = await axios.post(
      "https://bilalsadasub.com" + endpoint,
      JSON.stringify(body),
      config
    );
  } else {
    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Api-Token": process.env.MOBILEVTU_API_TOKEN,
        "Request-Id": body["request-id"],
      },
    };
    var operator =
      body.network == 1
        ? "MTN"
        : body.network == 2
          ? "Airtel"
          : body.network == 3
            ? "Glo"
            : "9Mobile";
    console.log(config);
    result = await axios.post(
      `https://api.mobilevtu.com/v1/${process.env.MOBILEVTU_API_KEY}/topup`,
      `operator=${operator}&type=data&value=${body.data_plan}&phone=${body.phone}`,
      config
    );
  }

  return result.data;
}

async function monnify(endpoint, method, body = null) {
  const url = `https://api.monnify.com${endpoint}`;
  // const url = "https://api.korapay.com/merchant"+endpoint
  const base64encode = `${Buffer.from(
    `${process.env.MONIFY_API_KEY}:${process.env.MONIFY_SECRET_KEY}`
  ).toString("base64")}`;
  const requestToken = await fetch(
    "https://api.monnify.com/api/v1/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${base64encode}`,
      },
      body: {},
    }
  );

  const getToken = await requestToken.json();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken?.responseBody?.accessToken}`,
  };
  // console.log(getToken?.responseBody?.accessToken)
  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  const response = await fetch(url, options);
  return await response.json();
}

exports.fetch = async (req, res, next) => {
  try {
    var wallet = await walletsService.getWallets({ userId: req.userId });
    if (wallet.totalDocs == 0) {
      var user = await usersService.getUsers({
        $or: [{ _id: req.userId }, { email: "archive." + req.email }],
      });
      var checkForDevice = await usersService.getUsers({
        deviceid: req.headers.deviceid,
      });
      const notUsers = await usersService.getUsers({
        email: { $in: ["habibmail31@gmail.com"] },
      });
      var include_player_ids = notUsers.docs?.map?.((u) => u.oneSignalId);
      // if ((user.totalDocs == 1) && req.headers.deviceid && (checkForDevice.totalDocs == 1 && checkForDevice.docs[0]._id == req.userId)) {
      //   wallet = await walletsService.createWallet({
      //     userId: req.userId,
      //     balance: 50
      //   })
      //   const bonus = {
      //     "amount": 50,
      //     "userId": req.userId,
      //     "reference": "SignupBonus" + '--' + generateRandomNumber(10),
      //     "narration": "Signup bonus",
      //     "currency": "NGN",
      //     "type": 'credit',
      //     "status": "successful"
      //   }
      //   await walletsService.saveTransactions(bonus)
      //   sendNotification({
      //     headings: { "en": `₦50 was credited to your wallet` },
      //     contents: { "en": `Congratulations ${req.firstName}! You just earned ₦50 signup bonus. Refer more friends download 360gadgetsafrica to earn more.` },
      //     include_subscription_ids: [req.oneSignalId],
      //     url: 'gadgetsafrica://profile',
      //   })
      // } else {
      //   wallet = await walletsService.createWallet({
      //     userId: req.userId,
      //     balance: 0
      //   })
      // }
      wallet = await walletsService.createWallet({
        userId: req.userId,
        balance: 0,
      });
      console.log("is notable", req.email);
      if (
        checkForDevice.totalDocs == 1 &&
        checkForDevice.docs[0]._id == req.userId &&
        isNotableEmail(req.email)
      ) {
        if (
          user.docs[0].referredBy?._id &&
          user.docs[0].verificationCode == "" &&
          user.totalDocs == 1
        ) {
          await walletsService.updateWallet(
            { userId: user.docs[0].referredBy?._id },
            { $inc: { balance: 25 } }
          );
          const bonus1 = {
            amount: 25,
            userId: user.docs[0]?.referredBy?._id,
            reference: "Referral" + "--" + generateRandomNumber(10),
            narration: "Referral bonus for new user",
            currency: "NGN",
            type: "credit",
            status: "successful",
          };
          await walletsService.saveTransactions(bonus1);
          sendNotification({
            headings: { en: `₦25 was credited to your wallet` },
            contents: {
              en: `Congratulations ${user.docs[0].referredBy?.firstName}! You just earned ₦25 on referral bonus. Refer more friends to download 360gadgetsafrica to earn more.`,
            },
            include_subscription_ids: [
              user.docs[0].referredBy?.oneSignalId,
              ...include_player_ids,
            ],
            url: "gadgetsafrica://profile",
          });
        }
      } else if (req.headers.deviceid && user.docs[0].deviceid == "") {
        await usersService.updateUsers(
          { _id: req.userId },
          { deviceid: req.headers.deviceid }
        );
      }
    }

    var result = await monnify(
      "/api/v2/bank-transfer/reserved-accounts/" + req.userId,
      "GET"
    );
    if (!result.requestSuccessful) {
      const walletData = {
        accountName: req.firstName + " " + req.lastName,
        currencyCode: "NGN",
        contractCode: process.env.MONIFY_CONTRACT_CODE,
        customerName: req.firstName + " " + req.lastName,
        customerEmail: req.email,
        accountReference: req.userId,
        bvn: "22325291031",
      };
      result = await monnify(
        "/api/v1/bank-transfer/reserved-accounts",
        "POST",
        walletData
      );
    }
    if (result?.requestSuccessful) {
      var accounts = result.responseBody.accounts?.map((account) => ({
        accountName: result.responseBody.accountName,
        accountNumber: account.accountNumber,
        bankName: account.bankName + " (1.5% fee)",
      }));
    }
    res.json({
      balance: wallet.totalDocs == 1 ? wallet?.docs[0]?.balance : 0,
      accounts,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
};

exports.fetchTransactions = async (req, res, next) => {
  try {
    var transactions = await walletsService.fetchTransactions(
      { userId: req.userId },
      { sort: { _id: -1 }, limit: 30 }
    );
    successResponse(res, transactions);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.fetchUserTransactions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 30, type = "all" } = req.query;

    // Validate userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    const options = {
      sort: { _id: -1 },
      limit: parseInt(limit),
      page: parseInt(page),
    };

    // Build filter for transaction type
    let filter = { userId };
    if (type === "debit" || type === "credit") {
      filter.type = type;
    }

    const transactions = await walletsService.fetchTransactions(
      filter,
      options
    );

    successResponse(res, transactions);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.withdraw = async (req, res, next) => {
  try {
    const fee = req.body.fee || calculateFee(1.7, req.body.amount);
    var wallet = await walletsService.getWallets({ userId: req.userId });
    if (wallet.docs[0].balance < parseInt(req.body.amount))
      throw new Error("Insufficient balance. please fund your wallet");
    var wall = await walletsService.updateWallet(
      { userId: req.userId },
      { $inc: { balance: -(parseInt(req.body.amount) + fee) } }
    );
    const data = {
      amount: req.body.amount,
      userId: req.userId,
      fee: req.body.fee,
      reference: req.body.reference + "--" + generateRandomNumber(10),
      narration: "Withdrawal to ******" + req.body.accountNumber.substr(6),
      destinationBankCode: req.body.bankCode,
      destinationBankName: req.body.bankName,
      destinationAccountNumber: req.body.accountNumber,
      destinationAccountName: req.body.accountName,
      currency: "NGN",
      type: "debit",
      status: "pending",
    };
    const transaction = await walletsService.saveTransactions(data);
    successResponse(res, transaction);
    const notUsers = await usersService.getUsers({
      email: { $in: ["habibmail31@gmail.com"] },
    });
    var include_player_ids = notUsers.docs?.map?.((u) => u.oneSignalId);
    sendNotification({
      headings: { en: `Withdrawal request.` },
      contents: {
        en: `Hi There, You have a new withdrawal request of N${req.body.amount} to acct: ${req.body.bankName}. acctNumb:${req.body.accountNumber} `,
      },
      include_subscription_ids: [...include_player_ids],
      url: "gadgetsafrica://profile",
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};
exports.fetchDataPlan = async (req, res, next) => {
  try {
    res.json({ dataplan });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({ error: "Failed to create wallet" });
  }
};

exports.buyDataPlan = async (req, res, next) => {
  try {
    // Check for active coupon and calculate discount
    let discountAmount = 0;
    var isValidPlan = false;
    let finalAmount = parseInt(req.body.plan.amount);
    const activeCoupon = await AppliedCoupon.findOne({
      user: req.userId,
      isActive: true
    }).populate('coupon');

    // Apply coupon discount if valid
    if (activeCoupon && activeCoupon.coupon) {
      const coupon = activeCoupon.coupon;
      const now = new Date();


      const purchasedPlan = req.body.plan;

      // Check if coupon has any plan restrictions
      if (coupon.validForPlans && coupon.validForPlans.length > 0) {
        // Check if purchased plan matches any of the validForPlans
        isValidPlan = coupon.validForPlans.some(validPlan => {
          return validPlan.planId === purchasedPlan.planId &&
            validPlan.network === purchasedPlan.network &&
            validPlan.vendor === purchasedPlan.vendor;
        });
      }

      // Check if coupon is still valid
      if (now >= new Date(coupon.validFrom) && now <= new Date(coupon.expiresAt) &&
        (!coupon.maxUses || coupon.usedCount < coupon.maxUses) && isValidPlan) {

        if (coupon.discountType === 'percentage') {
          discountAmount = (finalAmount * coupon.discountValue) / 100;
          // Apply max discount if specified
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          // Fixed amount discount
          discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't make amount negative
        if (discountAmount > finalAmount) {
          discountAmount = finalAmount;
        }

        finalAmount = finalAmount - discountAmount;

        // Mark coupon as used and inactive
        await AppliedCoupon.findOneAndUpdate(
          { user: req.userId, isActive: true },
          { isActive: false },
          { new: true }
        );
      }
    }

    // Check wallet balance against final amount after discount
    var wallet = await walletsService.getWallets({ userId: req.userId });
    if (wallet.docs[0].balance < finalAmount || wallet.totalDocs == 0) {
      throw new Error("Insufficient balance. Please fund your wallet");
    }

    // Deduct final amount from wallet
    var wall = await walletsService.updateWallet(
      { userId: req.userId },
      { $inc: { balance: -finalAmount } }
    );

    const ref = "Data_" + generateRandomNumber(11);

    var plan = dataplan.find(
      (d) =>
        d.planId == req.body.plan.planId && req.body.plan.vendor == d.vendor
    );
    var net =
      plan.network == "MTN"
        ? 1
        : plan.network == "AIRTEL"
          ? 2
          : plan.network == "GLO"
            ? 3
            : 4;

    const data = {
      amount: finalAmount,
      originalAmount: req.body.plan.amount, // Store original amount
      discountApplied: discountAmount > 0 ? discountAmount : 0,
      couponUsed: discountAmount > 0 ? activeCoupon?.coupon?.code : null,
      userId: req.userId,
      reference: ref,
      narration: "Data topup to " + req.body.phone + (discountAmount > 0 ? ` (₦${discountAmount} discount applied)` : ''),
      currency: "NGN",
      type: "debit",
      network: plan.network,
      planType: plan.planType,
      dataAmount: convertToMegabytes(plan.planName),
      status: "pending",
    };
    const transaction = await walletsService.saveTransactions(data);

    var obj = {
      network: net,
      data_plan: plan.planId,
      phone: removeCountryCode(req.body.phone.replace(/\s+/g, "")),
      bypass: false,
      "request-id": ref,
    };
    console.log(obj);

    const notUsers = await usersService.getUsers({
      email: { $in: ["habibmail31@gmail.com"] },
    });
    var include_player_ids = notUsers.docs?.map?.((u) => u.oneSignalId);

    // Start time for retry window
    const startTime = Date.now();
    const retryWindow = 60 * 1000; // 60 seconds

    // Function to attempt data purchase with retries
    const attemptDataPurchase = async () => {
      var newRef = "Data_" + generateRandomNumber(11);
      try {
        const vtc = await quickVTU(
          "/api/data",
          "POST",
          { ...obj, "request-id": newRef },
          req.body.plan.vendor
        );
        console.log(vtc, obj, "resp");

        if (vtc?.status == "fail" || vtc?.status == "error") {
          // Check if we're still within the retry window
          if (Date.now() - startTime < retryWindow) {
            console.log(
              `Retry attempt. Time elapsed: ${(Date.now() - startTime) / 1000}s`
            );
            // Wait 3 seconds before retrying
            setTimeout(attemptDataPurchase, 3000);
          } else {
            // Retry window exceeded, mark as failed
            await walletsService.updateTransactions(
              { _id: transaction._id },
              { status: "failed", reference: newRef }
            );
            await walletsService.updateWallet(
              { userId: req.userId },
              { $inc: { balance: +parseInt(req.body.plan.amount) } }
            );
            await walletsService.saveTransactions({
              ...data,
              reference: "Data_" + generateRandomNumber(10),
              narration: "RVSL for Data topup ",
              status: "successful",
              type: "credit",
            });
            sendNotification({
              headings: { en: `Network issues. Try another plan` },
              contents: {
                en: `Hi ${req.firstName}, we're currently experiencing some network challenges for ${req.body.plan.planName} ${req.body.plan.network} ${req.body.plan.planType} Data. Please try another plan or try again later.`,
              },
              include_subscription_ids: [
                req.oneSignalId,
                ...include_player_ids,
              ],
              url: "gadgetsafrica://profile",
            });
          }
        } else {
          // Success case
          await walletsService.updateTransactions(
            { _id: transaction._id },
            { status: "successful", reference: newRef }
          );


          // successResponse(res, transaction)
          sendNotification({
            headings: { en: `Payment successful` },
            contents: {
              en: `Congratulations ${req.firstName}! You have successfully sent ${plan.planName} ${req.body.plan.network} ${req.body.plan.planType} data to ${req.body.phone}. Refer a friend to try our mobile app and earn ₦25`,
            },
            include_subscription_ids: [req.oneSignalId, ...include_player_ids],
            url: "gadgetsafrica://profile",
          });
          if (convertToMegabytes(plan.planName) >= 1024) {
            const bonus = (convertToMegabytes(plan.planName) / 1024) * 20;
            await walletsService.updateWallet(
              { userId: req.userId },
              { $inc: { balance: bonus } }
            );
            const cashback = {
              amount: bonus,
              userId: req.userId,
              reference: "Cashback" + "--" + generateRandomNumber(10),
              narration: "Cashback bonus for data purchase",
              currency: "NGN",
              type: "credit",
              status: "successful",
            };
            await walletsService.saveTransactions(cashback);
            sendNotification({
              headings: { en: `You've unlocked ₦${bonus} cashback` },
              contents: {
                en: `Congratulations ${req?.firstName}! You just earned ₦${bonus} cashback bonus. Refer a friend to join 360gadgetsafrica to earn more bonus.`,
              },
              include_subscription_ids: [
                req.oneSignalId,
                ...include_player_ids,
              ],
              url: "gadgetsafrica://profile",
            });
          }

          if(isValidPlan){
            await Coupon.markAsUsed(req.userId);
          }
        }
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.status == "fail") {
          await walletsService.updateTransactions(
            { _id: transaction._id },
            { status: "failed" }
          );
          await walletsService.updateWallet(
            { userId: req.userId },
            { $inc: { balance: +parseInt(req.body.plan.amount) } }
          );
          await walletsService.saveTransactions({
            ...data,
            reference: "Data" + "--" + generateRandomNumber(10),
            narration: "RVSL for Data topup ",
            status: "successful",
            type: "credit",
          });
          sendNotification({
            headings: { en: `Network issues. Try another plan` },
            contents: {
              en: `Hi ${req.firstName}, we're currently experiencing some network challenges for ${req.body.plan.planName} ${req.body.plan.network} ${req.body.plan.planType} Data. Please try another plan or try again later.`,
            },
            include_subscription_ids: [req.oneSignalId, ...include_player_ids],
            url: "gadgetsafrica://profile",
          });
        }
      }
    };

    // Start the first attempt
    attemptDataPurchase();
    successResponse(res, transaction, "Your data purchase is being processed");
  } catch (error) {
    errorResponse(res, error, error.message || "An error occurred");
  }
};
// exports.buyDataPlan = async (req, res, next) => {
//   var wallet = await walletsService.getWallets({ userId: req.userId })
//   if (wallet.docs[0].balance < parseInt(req.body.plan.amount) || wallet.totalDocs == 0) throw new Error("Insufficient balance. please fund your wallet");
//   var wall = await walletsService.updateWallet({ userId: req.userId }, { $inc: { balance: -parseInt(req.body.plan.amount) } })
//   const ref = "Data_"  + generateRandomNumber(11)
//   const data = {
//     "amount": req.body.plan.amount,
//     "userId": req.userId,
//     "reference": ref,
//     "narration": "Data topup to " + req.body.phone,
//     "currency": "NGN",
//     "type": 'debit',
//     "status": "successful"
//   }
//   const transaction = await walletsService.saveTransactions(data)

//   var plan =  dataplan.find(d => (d.planId == req.body.plan.planId && req.body.plan.vendor  == d.vendor))
//   var net = plan.network == 'MTN' ? 1 : plan.network == "AIRTEL" ? 2 : plan.network == "GLO" ? 3 : 4
//   var obj = {
//     network: net,
//     data_plan: plan.planId,
//     phone: removeCountryCode(req.body.phone.replace(/\s+/g, "")),
//     bypass: false,
//     'request-id': ref,
//   }
//   console.log(obj)

//   const notUsers = await usersService.getUsers({ email: { $in: ['habibmail31@gmail.com'] } });
//   var include_player_ids = notUsers.docs?.map?.(u => u.oneSignalId)

//   try {
//     const vtc = await quickVTU('/api/data', "POST", obj, req.body.plan.vendor )
//     console.log(vtc, obj, 'resp')

//     if (vtc?.status == 'fail' || vtc?.status == 'error' ) {
//       res.status(500).json({ errors: ['Network failed. Try another plan'] });
//       await walletsService.updateTransactions({ _id: transaction._id }, { status: 'failed' })
//       await walletsService.updateWallet({ userId: req.userId }, { $inc: { balance: +parseInt(req.body.plan.amount) } })
//       await walletsService.saveTransactions({
//         ...data,
//         "reference": "Data_" +   generateRandomNumber(10),
//         "narration": "RVSL for Data topup ",
//         "status": 'successful', type: 'credit'
//       })
//       sendNotification({
//         headings: { "en": `Network issues. Try another plan` },
//         contents: { "en": `Hi ${req.firstName}, we're currently experiencing some network challenges for ${req.body.plan.planName} ${req.body.plan.network} ${req.body.plan.planType} Data. Please try another plan or try again later.` },
//         include_subscription_ids: [req.oneSignalId, ...include_player_ids],
//         url: 'gadgetsafrica://profile',
//       })
//     } else {
//       successResponse(res, transaction)
//       sendNotification({
//         headings: { "en": `Payment successful` },
//         contents: { "en": `Congratulations ${req.firstName}! Your have successfully sent ${plan.planName} ${req.body.plan.network} ${req.body.plan.planType} data to ${req.body.phone}. Refer a friend to try our mobile app and earn ₦50` },
//         include_subscription_ids: [req.oneSignalId, ...include_player_ids],
//         url: 'gadgetsafrica://profile',
//       })
//     }

//   } catch (error) {
//     console.log(error)
//     if (error?.response?.data?.status == "fail") {
//       res.status(500).json({ errors: ['Network failed. Try another plan'] });
//       await walletsService.updateTransactions({ _id: transaction._id }, { status: 'failed' })
//       await walletsService.updateWallet({ userId: req.userId }, { $inc: { balance: +parseInt(req.body.plan.amount) } })
//       await walletsService.saveTransactions({
//         ...data,
//         "reference": "Data" + '--' + generateRandomNumber(10),
//         "narration": "RVSL for Data topup ",
//         "status": 'successful', type: 'credit'
//       })
//       sendNotification({
//         headings: { "en": `Network issues. Try another plan` },
//         contents: { "en": `Hi ${req.firstName}, we're currently experiencing some network challenges for ${req.body.plan.planName} ${req.body.plan.network} ${req.body.plan.planType} Data. Please try another plan or try again later.` },
//         include_subscription_ids: [req.oneSignalId, ...include_player_ids],
//         url: 'gadgetsafrica://profile',
//       })
//     } else errorResponse(res, error, "Transaction failed due to network. please try again")
//   }
// }

exports.buyAirtime = async (req, res, next) => {
  try {
    // Validate amount
    if (parseInt(req.body.amount) > 500) {
      return errorResponse(res, null, "The maximum amount is ₦500.", 400);
    }
    
    // Check wallet balance
    const wallet = await walletsService.getWallets({ userId: req.userId });
    if (wallet.totalDocs === 0 || wallet.docs[0].balance < parseInt(req.body.amount)) {
      return errorResponse(res, null, "Insufficient balance. Please fund your wallet", 400);
    }
    
    // Deduct from wallet
    await walletsService.updateWallet(
      { userId: req.userId },
      { $inc: { balance: -parseInt(req.body.amount) } }
    );
    
    const ref = `Airtime_${generateRandomNumber(11)}`;
    const data = {
      amount: req.body.amount,
      userId: req.userId,
      reference: ref,
      narration: `Airtime topup to ${req.body.phone}`,
      currency: "NGN",
      type: "debit",
      status: "successful",
    };
    
    // Save transaction
    await walletsService.saveTransactions(data);

    // Determine network provider
    const provider = detectNetwork(req.body.phone);
    const net = provider === "MTN" ? 1 : 
               provider === "AIRTEL" ? 2 : 
               provider === "GLO" ? 3 : 4;
               
    const obj = {
      network: net,
      phone: removeCountryCode(req.body.phone.replace(/\s+/g, "")),
      amount: req.body.amount,
      bypass: false,
      plan_type: "VTU",
      "request-id": ref,
    };
    
    // Get admin users for notification
    const notUsers = await usersService.getUsers({
      email: { $in: ["habibmail31@gmail.com"] },
    });
    const includePlayerIds = notUsers.docs?.map?.((u) => u.oneSignalId);

    // Process airtime purchase
    try {
      const vtc = await quickVTU("/api/topup", "POST", obj, "quickvtu");
      console.log('VTU Response:', vtc, 'Request:', obj);
      
      if (vtc?.status === "fail") {
        // Update transaction status to failed
        await walletsService.updateTransactions(
          { reference: ref },
          { status: "failed" }
        );
        
        // Refund user's wallet
        await walletsService.updateWallet(
          { userId: req.userId },
          { $inc: { balance: +parseInt(req.body.amount) } }
        );
        
        // Create reversal transaction
        await walletsService.saveTransactions({
          ...data,
          reference: `Airtime_Reversal_${generateRandomNumber(10)}`,
          narration: "Reversal for failed airtime topup",
          status: "successful",
          type: "credit",
        });
        
        // Send failure notification
        sendNotification({
          headings: { en: "Transaction Failed" },
          contents: {
            en: `Hi ${req.firstName}, we couldn't process your airtime purchase. Your account has been refunded.`,
          },
          include_subscription_ids: [req.oneSignalId, ...(includePlayerIds || [])],
          url: "gadgetsafrica://profile",
        });
        
        return errorResponse(res, null, "Transaction failed. Please try again later.", 400);
      }
      
      // If we get here, the transaction was successful
      successResponse(res, { message: "Airtime purchase successful", reference: ref });
      
      // Send success notification
      sendNotification({
        headings: { en: "Payment Successful" },
        contents: {
          en: `Congratulations ${req.firstName}! You have successfully sent ₦${req.body.amount} airtime to ${req.body.phone}.`,
        },
        include_subscription_ids: [req.oneSignalId, ...(includePlayerIds || [])],
        url: "gadgetsafrica://profile",
      });
      
    } catch (error) {
      console.error('Error processing airtime purchase:', error);
      
      try {
        // Update transaction status to failed
        await walletsService.updateTransactions(
          { reference: ref },
          { status: "failed" }
        );
        
        // Refund user's wallet
        await walletsService.updateWallet(
          { userId: req.userId },
          { $inc: { balance: +parseInt(req.body.amount) } }
        );
        
        // Create reversal transaction
        await walletsService.saveTransactions({
          ...data,
          reference: `Airtime_Reversal_${generateRandomNumber(10)}`,
          narration: "Reversal for failed airtime topup",
          status: "successful",
          type: "credit",
        });
        
        // Send error notification
        sendNotification({
          headings: { en: "Transaction Error" },
          contents: {
            en: `Hi ${req.firstName}, there was an error processing your airtime purchase. Your account has been refunded.`,
          },
          include_subscription_ids: [req.oneSignalId, ...(includePlayerIds || [])],
          url: "gadgetsafrica://profile",
        });
      } catch (dbError) {
        console.error('Error handling transaction failure:', dbError);
        // Log to error tracking service if available
      }
      
      errorResponse(
        res,
        error,
        "Transaction failed due to a network error. Please try again later."
      );
    }
  } catch (error) {
    console.error('Error in buyAirtime:', error);
    errorResponse(
      res,
      error,
      "An unexpected error occurred while processing your request. Please try again later."
    );
  }
};
exports.fetchBanks = async (req, res, next) => {
  try {
    const listOfBanks = await monnify("/api/v1/banks", "GET");
    if (listOfBanks.requestSuccessful) {
      successResponse(res, listOfBanks.responseBody);
    } else throw Error("Error fetching banks");
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.verifyBank = async (req, res, next) => {
  try {
    const { bankCode, accountNumber } = req.body;
    const verifyAcct = await monnify(
      `/api/v1/disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode.replace(
        /^0+/,
        ""
      )}`,
      "GET"
    );
    console.log(verifyAcct);
    if (verifyAcct.requestSuccessful) {
      successResponse(res, verifyAcct?.responseBody);
    } else throw Error(verifyAcct?.responseMessage);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.webhook = async (req, res, next) => {
  try {
    const signature = req.headers["monnify-signature"];
    const payload = req.body;
    const trans = await walletsService.fetchTransactions({
      reference: payload.eventData.transactionReference,
    });
    // Verify the signature
    if (!verifyMonnifySignature(payload, signature)) {
      return res.status(401).json({ message: "Invalid signature" });
    }
    if (trans.totalDocs != 0) {
      return res.status(200).json({ message: "Webhook received successfully" });
    }

    // Extract payment details from the webhook payload

    const {
      eventType,
      eventData: {
        settlementAmount,
        product,
        amountPaid,
        transactionReference,
        destinationAccountInformation: { bankCode, bankName, accountNumber },
      },
    } = payload;
    // Process the reserved account payment
    if (
      req.body.eventType === "SUCCESSFUL_TRANSACTION" &&
      product.type == "RESERVED_ACCOUNT"
    ) {
      var user = await usersService.getUsers({ _id: product.reference });

      if (user.totalDocs) {
        const data = {
          amount: Math.round(settlementAmount),
          userId: user.docs[0]._id,
          reference: transactionReference,
          narration: "Wallet funding",
          destinationBankCode: bankCode,
          destinationBankName: bankName,
          destinationAccountNumber: accountNumber,
          // "destinationAccountName": req.body.accountName,
          currency: "NGN",
          type: "credit",
          status: "successful",
        };
        await walletsService.saveTransactions(data);
        await walletsService.updateWallet(
          { userId: user.docs[0]._id },
          { $inc: { balance: Math.round(settlementAmount) } }
        );
        sendNotification({
          headings: { en: `₦${Math.round(settlementAmount)} was credited to your wallet` },
          contents: {
            en: `Congratulations ${user.docs[0].firstName}! You have successfully funded your wallet with ₦${Math.round(settlementAmount)}. Refer a friend to try our mobile app and earn ₦30 bonus per GB Your Referral buys.`,
          },
          include_subscription_ids: [user.docs[0].oneSignalId],
          url: "gadgetsafrica://transactions",
        });
      }
    } else {
      console.log(`Event received but not handled: ${eventType}`);
    }

    // Send a response to Monnify
    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    console.log(error);
  }
};

// Webhook Endpoint
exports.flwhook = async (req, res, next) => {
  console.log("received");
  // Verify the request is from Flutterwave
  const signature = req.headers["verif-hash"]; // Flutterwave sends this
  if (!signature || signature !== process.env.FLW_SECRET_HASH) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const payload = req.body;

  // Process the event based on its type
  if (
    payload.event === "charge.completed" &&
    payload.data.status == "successful"
  ) {
    var { customer, created_at, charged_amount, amount, id, tx_ref } =
      payload.data;
    console.log("Received Flutterwave webhook:", id);

    var headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    };
    try {
      // const res = await axios({ method: 'get', url: `https://api.flutterwave.com/v3/transactions/${id}/verify`, data: {}, headers, json: true });
      // const result = res && res.data;
      // if ((result.status == 'success' || result.status == 'successful') &&  result?.data?.meta?.type == 'funding') {
      // var {bankname, originatoraccountnumber, } = result?.data?.meta
      var user = await usersService.getUsers({ email: customer.email });
      if (user.totalDocs) {
        const data = {
          amount: amount,
          userId: user.docs[0]._id,
          reference: tx_ref,
          narration: "Wallet funding",
          destinationBankCode: "N/A",
          destinationBankName: "N/A",
          destinationAccountNumber: "N/A",
          // "destinationAccountName": req.body.accountName,
          currency: "NGN",
          type: "credit",
          status: "successful",
        };
        await walletsService.saveTransactions(data);
        await walletsService.updateWallet(
          { userId: user.docs[0]._id },
          { $inc: { balance: parseInt(amount) } }
        );
        sendNotification({
          headings: { en: `₦${amount} was credited to your wallet` },
          contents: {
            en: `Congratulations ${user.docs[0].firstName}! You have successfully funded your wallet with ₦${amount}. Refer a friend to try our mobile app and earn ₦25.`,
          },
          include_subscription_ids: [user.docs[0].oneSignalId],
          url: "gadgetsafrica://transactions",
        });
      }
      res.status(200);
      // }
    } catch (error) {
      console.log(error);
    }

    // Update your database, send emails, etc.
  } else if (payload.event === "transfer.completed") {
    console.log("Transfer completed:", payload.data);
  }

  // Send a response to acknowledge receipt
  res.status(200).json({ message: "Webhook received successfully" });
};

// Admin Functions
exports.manualRefund = async (req, res, next) => {
  try {
    const { transactionId, reason, amount } = req.body;

    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }

    // Fetch the transaction
    const transaction = await walletsService.fetchTransactions({
      _id: transactionId,
    });
    if (!transaction || transaction.totalDocs === 0) {
      throw new Error("Transaction not found");
    }

    const originalTransaction = transaction.docs[0];

    // Validate transaction status
    if (originalTransaction.status === "refunded") {
      throw new Error("Transaction has already been refunded");
    }

    // Determine refund amount
    const refundAmount = amount || originalTransaction.amount;

    // Refund the amount back to wallet
    await walletsService.updateWallet(
      { userId: originalTransaction.userId },
      { $inc: { balance: +parseInt(refundAmount) } }
    );

    // Create a reversal transaction
    const refundTransaction = {
      amount: refundAmount,
      userId: originalTransaction.userId,
      reference: "RSVL_" + generateRandomNumber(10),
      narration: `Reversal: ${reason || "No reason provided"}`,
      currency: "NGN",
      type: "credit",
      status: "successful",
      originalTransactionId: transactionId,
    };

    await walletsService.saveTransactions(refundTransaction);

    successResponse(res, {
      message: "Refund processed successfully",
      refundTransaction,
    });
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.retryTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.body;

    // Fetch the failed transaction
    const transaction = await walletsService.fetchTransactions({
      _id: transactionId,
    });
    if (!transaction || transaction.totalDocs === 0) {
      throw new Error("Transaction not found");
    }

    const failedTransaction = transaction.docs[0];

    // Check if transaction is eligible for retry
    if (failedTransaction.status !== "failed") {
      throw new Error("Only failed transactions can be retried");
    }

    // Retry logic based on transaction type
    if (failedTransaction.narration.includes("Data topup")) {
      // Retry data purchase
      const plan = dataplan.find((d) => d.planId === failedTransaction.planId);
      const retryRequest = {
        plan,
        phone: failedTransaction.phone,
        vendor: failedTransaction.vendor,
      };

      // Call the original buyDataPlan function with the retry request
      await this.buyDataPlan(
        { body: retryRequest, userId: failedTransaction.userId },
        res
      );
    } else if (failedTransaction.narration.includes("Airtime topup")) {
      // Retry airtime purchase
      const retryRequest = {
        amount: failedTransaction.amount,
        phone: failedTransaction.phone,
      };

      // Call the original buyAirtime function with the retry request
      await this.buyAirtime(
        { body: retryRequest, userId: failedTransaction.userId },
        res
      );
    } else {
      throw new Error("Transaction type not supported for retry");
    }
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.adminFetchTransactions = async (req, res, next) => {
  try {
    // Get filters from query params
    const { page = 1, limit = 30, type, status, search } = req.query;
    const filter = {};
    if (type && type !== "All") {
      filter.type = type;
    }
    if (status && status !== "All") {
      filter.status = status;
    }
    if (search) {
      // Search by reference, narration, or user fields
      filter.$or = [
        { reference: { $regex: search, $options: "i" } },
        { narration: { $regex: search, $options: "i" } },
      ];
    }
    // Fetch with pagination and filters
    const transactions = await walletsService.fetchTransactions(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { _id: -1 },
      populate: [{ path: "userId", select: "firstName lastName email" }],
    });
    // Map userId to user for frontend compatibility
    transactions.docs = transactions.docs.map((t) => {
      const user = t.userId
        ? {
          firstName: t.userId.firstName,
          lastName: t.userId.lastName,
          email: t.userId.email,
        }
        : undefined;
      return { ...t.toObject(), user };
    });
    res.json({ data: transactions });
  } catch (error) {
    errorResponse(res, error, "Failed to fetch transactions");
  }
};

exports.adminFetchWallets = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, minBalance, maxBalance, search } = req.query;

    const filter = {};

    if (minBalance !== undefined || maxBalance !== undefined) {
      filter.balance = {};
      if (minBalance !== undefined)
        filter.balance.$gte = parseFloat(minBalance);
      if (maxBalance !== undefined)
        filter.balance.$lte = parseFloat(maxBalance);
    }

    if (search) {
      filter.$or = [
        { "userId.email": { $regex: search, $options: "i" } },
        { "userId.firstName": { $regex: search, $options: "i" } },
        { "userId.lastName": { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { balance: -1 },
      populate: ["userId"],
    };

    const wallets = await walletsService.getWallets(filter, options);
    successResponse(res, wallets);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.adminUpdateTransaction = async (req, res, next) => {
  try {
    const { transactionId, updates } = req.body;

    // Validate updates
    const allowedUpdates = ["status", "narration", "fee"];
    const isValidUpdate = Object.keys(updates).every((key) =>
      allowedUpdates.includes(key)
    );

    if (!isValidUpdate) {
      throw new Error("Invalid update fields");
    }

    const updatedTransaction = await walletsService.updateTransactions(
      { _id: transactionId },
      updates
    );

    successResponse(res, updatedTransaction);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.getDashboardData = async (req, res, next) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fetchTransactions = async () => {
      const transactions = await Transactions.find({
        createdAt: { $gte: today, $lt: tomorrow },
        narration: { $regex: "Data topup", $options: "i" },
        status: "successful",
      });
      return transactions;
    };

    const dataTransactions = await fetchTransactions();

    // Calculate total data sold and profit
    const totalDataSold = dataTransactions.reduce((sum, transaction) => {
      return (
        sum +
        (transaction.type === "debit" && transaction.status === "successful"
          ? transaction.dataAmount
          : 0)
      );
    }, 0);

    const totalProfit = (totalDataSold / 1024) * 10; // 10 times the total data sold
    const totalDataSoldGB = (totalDataSold / 1024).toFixed(2); // Convert to GB

    // Get total successful and failed transactions
    const successfulTransactions = await walletsService.fetchTransactions({
      createdAt: { $gte: today, $lt: tomorrow },
      status: "successful",
    });

    const failedTransactions = await walletsService.fetchTransactions({
      createdAt: { $gte: today, $lt: tomorrow },
      status: "failed",
    });

    // Get recent transactions
    const recentTransactions = await walletsService.fetchTransactions(
      {},
      {
        sort: { createdAt: -1 },
        limit: 5,
        populate: ["userId"],
      }
    );

    // Get recent users
    const recentUsers = await usersService.getUsers({});

    // console.log("Recent users", recentUsers);

    successResponse(res, {
      stats: {
        totalDataSold: totalDataSoldGB,
        totalProfit,
        successfulTransactions: successfulTransactions.totalDocs,
        failedTransactions: failedTransactions.totalDocs,
      },
      recentTransactions: recentTransactions.docs,
      recentUsers: recentUsers.docs,
    });
  } catch (error) {
    errorResponse(res, error);
  }
};

// Admin get wallet balance of a particular user
exports.adminGetWalletBalance = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Fetch the wallet balance for the specified user
    const wallet = await walletsService.getWallets({ userId });

    if (!wallet || wallet.totalDocs === 0) {
      throw new Error("Wallet not found for the specified user");
    }

    successResponse(res, wallet.docs[0]);
  } catch (error) {
    errorResponse(res, error);
  }
};
