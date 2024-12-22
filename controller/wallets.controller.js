const fetch = require('node-fetch');
const axios = require("axios");
const { usersService } = require('../service');
const { dataplan } = require('../utils/dataplan');
const { generateRandomNumber } = require('../utils/helpers');
const { successResponse, errorResponse } = require('../utils/responder');

const MONIFY_API_KEY = process.env.MONIFY_API_KEY;
const MONIFY_SECRET_KEY = process.env.MONIFY_SECRET_KEY;
const MONIFY_BASE_URL = process.env.MONIFY_BASE_URL;

// Helper function to make authenticated requests to Monify API
async function korraPay(endpoint, method, body = null, apikey) {
  // const url = `${MONIFY_BASE_URL}${endpoint}`;
  const url = "https://api.korapay.com/merchant" + endpoint
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apikey ? apikey : process.env.KORRA_SECRET_KEY}`,
  };
  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  const response = await fetch(url, options);
  return await response.json();
}
async function quickVTU(endpoint, method, body = null) {
  // const url = `${MONIFY_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      Authorization: 'Token 697bacbf1fc0ffd50e44bd689eba57a825d788acb5e09ec12eafc1d9c009',
      'Content-Type': 'application/json',
    },
  };
  const result = await axios.post('https://quickvtu.com' + endpoint, JSON.stringify(body), config)
  return result.data
}

async function monnify(endpoint, method, body = null) {
  const url = `https://api.monnify.com${endpoint}`;
  // const url = "https://api.korapay.com/merchant"+endpoint
  const base64encode = `${Buffer.from(`${process.env.MONIFY_API_KEY}:${process.env.MONIFY_SECRET_KEY}`).toString('base64')}`
  const requestToken = await fetch("https://api.monnify.com/api/v1/auth/login", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Basic ${base64encode}`
    },
    body: {}
  })

  const getToken = await requestToken.json()
  console.log(getToken)
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken?.responseBody?.accessToken}`,

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
// Create a new wallet

exports.create = async (req, res, next) => {
  try {

    const user = await usersService.getUsers({ _id: req.uid })
    const walletData = {
      "accountName": user[0]?.firstName + ' ' + user?.lastName,
      "currencyCode": "NGN",
      "contractCode": process.env.MONIFY_CONTRACT_CODE,
      "customerName": user[0]?.firstName + ' ' + user?.lastName,
      "customerEmail": user[0]?.email
    }
    const result = await monnify('/api/v2/bank-transfer/reserved-accounts', 'POST', walletData);
    res.json(result);
    console.log(result)
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
}


exports.fetch = async (req, res, next) => {
  try {
    const user = await usersService.getUsers({ _id: req.userId })
    if (user.docs[0]?.accountReference) {
      var result = await monnify('/api/v2/bank-transfer/reserved-accounts/' + req.userId, 'GET');
    } else if (user.docs[0]?.email) {
      const walletData = {
        "accountName": user.docs[0]?.firstName + ' ' + user.docs[0]?.lastName,
        "currencyCode": "NGN",
        "contractCode": process.env.MONIFY_CONTRACT_CODE,
        "customerName": user.docs[0]?.firstName + ' ' + user.docs[0]?.lastName,
        "customerEmail": user.docs[0]?.email,
        "accountReference": req.userId
      }
      result = await monnify('/api/v1/bank-transfer/reserved-accounts', 'POST', walletData);
      if (result?.requestSuccessful == true) {
        await usersService.updateUsers({ _id: req.userId }, { accountReference: req.userId })
      }
    }
    if (result.requestSuccessful == true) {

      // const  balance =  await monnify('/api/v2/disbursements/wallet-balance?accountNumber=' + result.responseBody.accounts[0].accountNumber, 'GET');
      res.json({
        accounts: result.responseBody.accounts[0],
        accountName: result.responseBody.accountName,
        status: result.responseBody.status,
        totalAmount: result.responseBody.totalAmount
      });
    }
    else throw Error("Error fetching wallet")
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
}


exports.withdraw = async (req, res, next) => {
  try {console.log(req.body)
    var acct = await monnify('/api/v2/bank-transfer/reserved-accounts/' + req.userId, 'GET');
    if(acct.requestSuccessful){
      const source = {
        "amount": req.body.amount,
        "reference":"referen00ce---"+generateRandomNumber(5),
        "narration":"Withrawal",
        "destinationBankCode": req.body.bankCode,
        "destinationAccountNumber": req.body.accountNumber,
        "currency": "NGN",
        "sourceAccountNumber": acct.responseBody.accounts[0].accountNumber
      }
    result = await monnify('/api/v2/disbursements/single', 'POST', source);
    console.log(result)
      if (result?.requestSuccessful == true) {
     res.json({success: true})
    }
  }
   
  
   
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
}
exports.fetchDataPlan = async (req, res, next) => {
  try {
    res.json({ dataplan });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
}


exports.buyDataPlan = async (req, res, next) => {
  try {
    console.log('buying', req.body)


    var plan = dataplan.find(d => d.planId == req.body.plan.planId);
    var net = plan.network == 'MTN' ? 1 : plan.network == "AIRTEL" ? 2 : plan.network == "GLO" ? 3 : 4
    var obj = {
      network: net,
      data_plan: plan.planId,
      phone: req.body.phone,
      bypass: false,
      'request-id': "Data_" + generateRandomNumber(11),
    }
    const vtc = await quickVTU('/api/data', "POST", obj)
    console.log(vtc, obj)
    if (vtc?.status == 'fail') {
      res.status(500).json({ errors: ['An error has occured. please try again later'] });
    } else if (vtc?.status == 'success') successResponse(res, { status: vtc?.status }, vtc?.message)
    else successResponse(res, { status: vtc?.status }, vtc?.message)
  } catch (error) {
    console.log(error?.response?.data)
    errorResponse(res, error)
  }
}
exports.fetchBanks = async (req, res, next) => {
  try {
    const listOfBanks = await monnify('/api/v1/banks', "GET")
    if (listOfBanks.requestSuccessful) {
      successResponse(res, listOfBanks.responseBody)
    } else throw Error("Error fetching banks")
  } catch (error) {
    errorResponse(res, error)
  }
}

exports.verifyBank = async (req, res, next) => {
  try {
    const {
      bankCode,
      accountNumber
    } = req.body
    console.log(req.body)
    const verifyAcct = await monnify(`/api/v1/disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode.replace(/^0+/, "")}`, "GET")
    console.log(verifyAcct)
    if (verifyAcct.requestSuccessful) {
      successResponse(res, verifyAcct?.responseBody)
    } else throw Error(verifyAcct?.responseMessage)
  } catch (error) {
    errorResponse(res, error)
  }
}

// request payout 
exports.payout = async (req, res, next) => {
  try {
    const {
      destination: {
        amount,
        currency,
        narration,
        bank_account: {
          bank,
          account,
          account_name
        }
      }
    } = req.body;


    const payload = {
      reference: generateRandomNumber(11),
      destination: {
        type: 'bank_account',
        amount: amount,
        currency: currency || 'NGN',
        narration: narration || 'Payout',
        bank_account: {
          bank,
          account,
          account_name
        }
      }
    };

    const suc = await korraPay('https://api.korapay.com/merchant/api/v1/transactions/disburse',
      "POST", payload);

    successResponse(res, suc)

  } catch (error) {
    errorResponse(res, error)
  }
}


