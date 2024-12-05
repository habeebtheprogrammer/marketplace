const fetch =  require('node-fetch'); 
const axios =  require("axios"); 
const { usersService } = require('../service');
const { dataplan } = require('../utils/dataplan');
const { generateRandomNumber } = require('../utils/helpers');
const { successResponse, errorResponse } = require('../utils/responder');

const MONIFY_API_KEY = process.env.MONIFY_API_KEY;
const MONIFY_SECRET_KEY = process.env.MONIFY_SECRET_KEY;
const MONIFY_BASE_URL = process.env.MONIFY_BASE_URL;

// Helper function to make authenticated requests to Monify API
async function walletRequest(endpoint, method, body = null, apikey) {
  // const url = `${MONIFY_BASE_URL}${endpoint}`;
  const url = "https://api.korapay.com/merchant"+endpoint
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apikey ? apikey : process.env.KORRA_SECRET_KEY}`,
  };
  const options = {
    method,
    headers,
    body : body ? JSON.stringify(body) : null,
  };

  const response = await fetch(url, options);
  return await response.json();
}
async function quickVTU(endpoint, method, body = null) {
  // const url = `${MONIFY_BASE_URL}${endpoint}`;
  console.log(body)
  const config = {
    headers: {
      Authorization: 'Token 697bacbf1fc0ffd50e44bd689eba57a825d788acb5e09ec12eafc1d9c009',
      'Content-Type': 'application/json',
    },
  };
  const result = await axios.post('https://quickvtu.com'+endpoint, JSON.stringify(body), config)
  return result.data
}
// Create a new wallet
 
exports.create = async (req, res, next) => {
    try {
    
        const user =  await usersService.getUsers({_id: req.uid})
        const walletData = {
          "account_name": user[0]?.firstName + ' ' + user?.lastName,
          "account_reference": user[0]._id,
          "permanent": true,
          "bank_code": "035",
          "customer": {
              "name": user[0]?.firstName + ' ' + user?.lastName
          }
        };
      
        const result = await walletRequest('/api/v1/virtual-bank-account', 'POST', walletData);
        res.json(result);
        console.log(result)
      } catch (error) {
        console.error('Error creating wallet:', error);
        res.status(500).json({ error: 'Failed to create wallet' });
      }
} 


exports.fetch = async (req, res, next) => {
  try {
      var result = await walletRequest('/api/v1/virtual-bank-account/'+req.userId, 'GET');
      if(result?.status === false){
        const user =  await usersService.getUsers({_id: req.userId})
        const walletData = {
          "account_name": user?.docs[0].firstName + ' ' + user?.docs[0].lastName,
          "account_reference": user.docs[0]._id,
          "permanent": true,
          "bank_code": "035",
          "customer": {
              "name": user.docs[0]?.firstName + ' ' + user?.docs[0].lastName
          }
        };
      
         result = await walletRequest('/api/v1/virtual-bank-account', 'POST', walletData);
      }
      res.json(result);
    } catch (error) {
      console.error('Error creating wallet:', error);
      res.status(500).json({ error: 'Failed to create wallet' });
    }
} 


exports.fetchDataPlan = async (req, res, next) => {
  try {
      res.json({dataplan});
    } catch (error) {
      console.error('Error creating wallet:', error);
      res.status(500).json({ error: 'Failed to create wallet' });
    }
} 


exports.buyDataPlan = async (req, res, next) => {
  try {
     console.log('buying', req.body)
     var plan = dataplan.find(d => d.planId == req.body.planId);
     var net = plan.network == 'MTN' ? 1 : plan.network == "AIRTEL" ? 2 : plan.network == "GLO" ? 3 : 4
     var obj = {
      network: net,
      data_plan: plan.planId,
      phone: req.body.phone,
      bypass: false,
      'request-id': "Data_"+generateRandomNumber(11),
     }
     const vtc = await quickVTU('/api/data', "POST", obj)
     console.log(vtc, obj)
     if(vtc?.status == 'fail') {
      res.status(500).json({ errors: ['An error has occured. please try again later'] });
     } else if(vtc?.status == 'success') successResponse(res, {status: vtc?.status}, vtc?.message)
      else   successResponse(res, {status: vtc?.status}, vtc?.message)
    } catch (error) {
      console.log(error?.response?.data)
      errorResponse(res, error)
    }
} 
exports.fetchBanks = async (req, res, next) => {
  try {
    const listOfBanks = await walletRequest('/api/v1/misc/banks?countryCode=NG', "GET", null, process.env.KORRA_API_KEY)
    successResponse(res, listOfBanks?.data)
  } catch (error) {
    errorResponse(res, error)
  }
}

exports.verifyBank = async (req, res, next) => {
  try {
   const  {
      bank,
      account
    } = req.body
    const verifyAcct = await walletRequest('/api/v1/misc/banks/resolve', "POST", {bank, account, currency: 'NGN'})
    successResponse(res, verifyAcct?.data)
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

    const suc = await  walletRequest('https://api.korapay.com/merchant/api/v1/transactions/disburse', 
      "POST", payload );

    successResponse(res, suc)

  } catch (error) {
    errorResponse(res, error)
  }
}
 

