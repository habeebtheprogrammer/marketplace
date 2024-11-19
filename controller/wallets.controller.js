const fetch =  require('node-fetch'); 

const MONIFY_API_KEY = process.env.MONIFY_API_KEY;
const MONIFY_SECRET_KEY = process.env.MONIFY_SECRET_KEY;
const MONIFY_BASE_URL = process.env.MONIFY_BASE_URL;

// Helper function to make authenticated requests to Monify API
async function monifyRequest(endpoint, method, body = null) {
  const url = `${MONIFY_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MONIFY_API_KEY}`,
  };

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
        const { userId, currency } = req.body;
        
        const walletData = {
          walletReference,
          walletName,
          customerName,
          customerEmail
          // Add any other required fields for wallet creation
        };
    
        const result = await monifyRequest('/api/v1/disbursements/wallet', 'POST', walletData);
        res.json(result);
      } catch (error) {
        console.error('Error creating wallet:', error);
        res.status(500).json({ error: 'Failed to create wallet' });
      }
} 

// Debit a wallet
exports.debit = async (req, res, next) => {
  try {
    const { walletId, amount, description } = req.body;
    
    const debitData = {
      walletId,
      amount,
      description,
      // Add any other required fields for debiting
    };

    const result = await monifyRequest('/transactions/debit', 'POST', debitData);
    res.json(result);
  } catch (error) {
    console.error('Error debiting wallet:', error);
    res.status(500).json({ error: 'Failed to debit wallet' });
  }
}

// Fund a wallet
exports.fund = async (req, res, next) => {
    try {
    const { walletId, amount, fundingSource } = req.body;
    
    const fundingData = {
      walletId,
      amount,
      fundingSource,
      // Add any other required fields for funding
    };

    const result = await monifyRequest('/transactions/fund', 'POST', fundingData);
    res.json(result);
  } catch (error) {
    console.error('Error funding wallet:', error);
    res.status(500).json({ error: 'Failed to fund wallet' });
  }
}

// Get wallet balance
exports.balance = async (req, res, next) => {
    try {
    const { accountId } = req.params;
    const result = await monifyRequest(`api/v1/disbursements/wallet/balance?accountNumber=${accountId}`, 'GET');
    res.json(result);
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    res.status(500).json({ error: 'Failed to get wallet balance' });
  }
}


// Get wallet balance
exports.history = async (req, res, next) => {
  try {
  const { accountId } = req.params;
  const result = await monifyRequest(`api/v1/disbursements/wallet/transactions?accountNumber=${accountId}`, 'GET');
  res.json(result);
} catch (error) {
  console.error('Error getting wallet balance:', error);
  res.status(500).json({ error: 'Failed to get wallet balance' });
}
}

