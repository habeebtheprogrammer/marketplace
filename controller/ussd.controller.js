const { walletsService } = require('../service');
const dataplan = require('../dataplan.json');
const { errorResponse, successResponse } = require('../utils/responder');
const Wallets = require('../model/wallets.model');
const Users = require('../model/users.model');
const Transactions = require('../model/transactions.model');
const USSDTransaction = require('../model/ussdTransaction.model');
const mongoose = require('mongoose');
const axios = require('axios');
const { removeCountryCode } = require('../utils/helpers');
// Helper function to detect network from phone number
function detectNetwork(phoneNumber) {
  const mtnPrefixes = ['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906'];
  const airtelPrefixes = ['0802', '0808', '0708', '0812', '0701', '0902', '0901', '0904', '0907', '0912'];
  const gloPrefixes = ['0805', '0807', '0705', '0815', '0811', '0905', '0915'];
  const nineMobilePrefixes = ['0809', '0818', '0817', '0909', '0908'];

  const prefix = phoneNumber.substring(0, 4);
  
  if (mtnPrefixes.includes(prefix)) return 'MTN';
  if (airtelPrefixes.includes(prefix)) return 'AIRTEL';
  if (gloPrefixes.includes(prefix)) return 'GLO';
  if (nineMobilePrefixes.includes(prefix)) return '9MOBILE';
  
  return null;
}

// Helper function to format USSD response
function sendUssdResponse(text, isEnd = false) {
  let responseType = isEnd ? 'End' : 'Continue';
  return `CON ${text}`;
}

// Main USSD handler
exports.handleUssd = async (req, res) => {
  try {
    console.log('USSD Request:', req.body);
    const { phoneNumber, text, sessionId } = req.body;
    const userInput = text ? text.split('*') : [];
    const step = userInput.length;
    
    // Clean phone number (remove +234 and add 0 if needed)
    let cleanPhone = phoneNumber.startsWith('+234') ? '0' + phoneNumber.substring(4) : 
                    phoneNumber.startsWith('234') ? '0' + phoneNumber.substring(3) : phoneNumber;
    
    // Log session information
    console.log('Session Info:', {
      sessionId: req.sessionID,
      originalSessionId: req.body.sessionId,
      sessionExists: !!req.session,
      sessionData: req.session
    });
    
    // Detect network
    const network = detectNetwork(cleanPhone);
    
    // Find user by phone number in the phoneNumber array
    const user = await Users.findOne({ phoneNumber: { $in: [phoneNumber] } });
    
    if (!user) {
      // If user doesn't exist, prompt them to register on the app
      return res.send(sendUssdResponse(
        'You are not registered. Please download and register on our app to use this service. Thank you!',
        true
      ));
    }
    
    // Find user's wallet
    let wallet = await Wallets.findOne({ userId: user._id });
     
    
    // USSD Menu Navigation
    if (step === 0) {
      // Main Menu
      const menu = '360GadgetsAfrica - Stay Connected!\n1. Get Emergency Airtime\n2. Get Emergency Data';
      return res.send(sendUssdResponse(menu));
    }
    
    const choice = userInput[0];
    
    if (step === 1) {
      if (choice === '1') {
        // Emergency Airtime
        return res.send(sendUssdResponse('Emergency Airtime\n1. N50 airtime'));
      } else if (choice === '2') {
        // Emergency Data - Show available data plans under N120
        const affordablePlans = dataplan
          .filter(plan => plan.network === network && plan.amount <= 120)
          .sort((a, b) => a.amount - b.amount)
          .map((plan, index) => `${index + 1}. ${plan.planName} - N${plan.amount}`)
          .join('\n');
          
        return res.send(sendUssdResponse(`Select data plan (${network}):\n${affordablePlans}`));
      } else {
        return res.send(sendUssdResponse('Invalid selection. Please try again.'));
      }
    }
    
    if (step === 2) {
      if (choice === '1') {
        // Process airtime selection - just show confirmation
        const amount = 50; 
        
        try {
          // Store transaction data in MongoDB for confirmation
          const transactionData = {
            sessionId: req.body.sessionId,
            type: 'airtime',
            amount: amount,
            phoneNumber: cleanPhone,
            network: network,
            userId: user._id,
            status: 'pending'
          };
          
          await USSDTransaction.findOneAndUpdate(
            { sessionId: req.body.sessionId },
            transactionData,
            { upsert: true, new: true }
          );
          
          // Show confirmation message
          return res.send(sendUssdResponse(
            `Confirm purchase of N${amount} airtime for ${cleanPhone} (${network}):\n` +
            '1. Confirm\n' +
            '2. Cancel',
            false
          ));
        } catch (error) {
          console.error('Error saving transaction to MongoDB:', error);
          return res.send(sendUssdResponse('An error occurred. Please try again.'));
        }
      } else if (choice === '2') {
        // Process Data Plan Selection
        const planIndex = parseInt(userInput[1]) - 1;
        const affordablePlans = dataplan
          .filter(plan => plan.network === network && plan.amount <= 120)
          .sort((a, b) => a.amount - b.amount);
          
        if (planIndex >= 0 && planIndex < affordablePlans.length) {
          const selectedPlan = affordablePlans[planIndex];
          const confirmMessage = `You are about to buy ${selectedPlan.planName} (N${selectedPlan.amount}) on ${cleanPhone}.\n1. Confirm\n2. Cancel`;
          
          try {
            // Store transaction data in MongoDB
            const transactionData = {
              sessionId: req.body.sessionId,
              type: 'data',
              plan: selectedPlan.planName,
              amount: selectedPlan.amount,
              phoneNumber: cleanPhone,
              network: network,
              userId: user._id,
              status: 'pending'
            };
            
            await USSDTransaction.findOneAndUpdate(
              { sessionId: req.body.sessionId },
              transactionData,
              { upsert: true, new: true }
            );
            
            console.log('Data plan transaction saved to MongoDB:', { 
              sessionId: req.body.sessionId,
              plan: selectedPlan.planName,
              amount: selectedPlan.amount
            });
            
            return res.send(sendUssdResponse(confirmMessage));
            
          } catch (error) {
            console.error('Error saving data plan transaction to MongoDB:', error);
            return res.send(sendUssdResponse('An error occurred. Please try again.'));
          }
        } else {
          return res.send(sendUssdResponse('Invalid selection. Please try again.'));
        }
      }
    }
    
    if (step === 3) {
      const confirmChoice = userInput[2];
      
      try {
        // Find the pending transaction in MongoDB
        const transaction = await USSDTransaction.findOne({
          sessionId: req.body.sessionId,
          status: 'pending'
        });
        
        if (!transaction) {
          console.error('No pending transaction found for session:', req.body.sessionId);
          return res.send(sendUssdResponse('Session expired or invalid. Please start again.', true));
        }
        
        console.log('Processing transaction from MongoDB:', {
          sessionId: req.body.sessionId,
          transactionId: transaction._id,
          type: transaction.type
        });
        
        if (confirmChoice === '1') {
          // Process the transaction
          const wallet = await Wallets.findOne({ userId: user._id });
          if (!wallet) {
            throw new Error('Wallet not found');
          }
          
          try {
            // Process based on transaction type
            if (transaction.type === 'airtime') {
              const ref = `Airtime_${Math.floor(10000000000 + Math.random() * 90000000000)}`;
          
              // Prepare VTU request
              const net = transaction.network === "MTN" ? 1 : 
                         transaction.network === "AIRTEL" ? 2 : 
                         transaction.network === "GLO" ? 3 : 4;
                         
              const vtuRequest = {
                network: net,
                phone: removeCountryCode(transaction.phoneNumber.replace(/\s+/g, "")),
                amount: transaction.amount,
                bypass: false,
                plan_type: "VTU",
                "request-id": ref,
              };
              
              // Process airtime purchase
              const vtc = await quickVTU("/api/topup", "POST", vtuRequest, "quickvtu");
              console.log('VTU Response:', vtc, 'Request:', vtuRequest);
              
              if (vtc?.status === "fail") {
                throw new Error(vtc.message || 'Airtime purchase failed. Please try again later');
              }
              wallet.loanBalance += transaction.amount;
              await wallet.save();
              // Create transaction record
              const txData = {
                amount: transaction.amount,
                userId: transaction.userId,
                reference: ref,
                narration: `Airtime topup to ${transaction.phoneNumber}`,
                currency: "NGN",
                type: "debit",
                status: "successful",
                network: transaction.network,
                vendorResponse: vtc
              };
              
              // Save transaction using the same service as wallet controller
              await walletsService.saveTransactions(txData);
              
              // Update USSD transaction status
              transaction.status = 'successful';
              transaction.reference = ref;
              await transaction.save();
              
              return res.send(sendUssdResponse(
                `Success! You have purchased N${transaction.amount} airtime for ${transaction.phoneNumber}. Thank you for using our service.`,
                true
              ));
              
              
            } else if (transaction.type === 'data') {
              // Process data plan purchase with quickVTU
              const ref = `USSD_DATA_${Date.now()}`;
              const net = 
                transaction.network === 'MTN' ? 1 :
                transaction.network === 'AIRTEL' ? 2 :
                transaction.network === 'GLO' ? 3 : 4;
              
              // Find the plan details
              const plan = dataplan.find(p => p.planName === transaction.plan);
              if (!plan) throw new Error('Plan not found');
              
              // Prepare request object for quickVTU
              const obj = {
                network: net,
                data_plan: plan.planId,
                phone: removeCountryCode(transaction.phoneNumber.replace(/\s+/g, "")),

                bypass: false,
                'request-id': ref,
              };
              
              // Call quickVTU
              const vtc = await quickVTU(
                "/api/data",
                "POST",
                obj,
                plan.vendor || 'quickvtu' // Default to quickvtu if vendor not specified
              );
              
              console.log('quickVTU response:', vtc);
              
              if (vtc?.status === 'success' || vtc?.status === 'successful') {
                // Deduct from wallet
                wallet.loanBalance += transaction.amount;
                await wallet.save();
                
                // Create transaction record matching wallet controller pattern
                const txData = {
                  amount: transaction.amount,
                  userId: user._id,
                  reference: ref,
                  narration: `Data topup to ${transaction.phoneNumber}`,
                  currency: "NGN",
                  type: "debit",
                  status: "successful",
                  network: transaction.network,
                  planType: 'DATA',
                  dataPlan: transaction.plan,
                  dataAmount: transaction.plan.split(' ')[0], // Extract data amount from plan name
                  vendorResponse: vtc
                };
                
                // Save transaction using the same service as wallet controller
                await walletsService.saveTransactions(txData);
                
                // Update USSD transaction status
                transaction.status = 'successful';
                transaction.reference = ref;
                await transaction.save();
                
                return res.send(sendUssdResponse(
                  `Your ${transaction.plan} data plan has been activated! ` +
                  `Ref: ${ref}. Thank you for using our service.`,
                  true
                ));
              } else {
                // Check for specific error message from vendor
                const errorMessage = vtc?.message || vtc?.response?.data?.message || 'Purchase failed';
                console.error('VTU Error:', errorMessage, 'Response:', JSON.stringify(vtc, null, 2));
                throw new Error(errorMessage);
              }
            }
            
          } catch (error) {
            console.error('Error processing transaction:', error);
            
            // Mark the current transaction as failed
            transaction.status = 'failed';
            await transaction.save().catch(saveError => {
              console.error('Error saving failed transaction:', saveError);
            });
            
            // On transaction failure, go back to step 0 (main menu) with the exact initial prompt format
            return res.send(sendUssdResponse(
              `Transaction failed: ${error.message || 'Unknown error'}\n\n`,
              false
            ));
          }
          
        } else if (confirmChoice === '2') {
          // User cancelled the transaction
          transaction.status = 'cancelled';
          await transaction.save();
          
          return res.send(sendUssdResponse('Transaction cancelled. Thank you for using our service.', true));
          
        } else {
          return res.send(sendUssdResponse('Invalid choice. Please try again.'));
        }
        
      } catch (error) {
        console.error('Error in transaction processing:', error);
        return res.send(sendUssdResponse('An error occurred. Please try again.', true));
      }
    }
    
    // Fallback for any unhandled cases
    return res.send(sendUssdResponse('Invalid input. Please try again.'));
    
  } catch (error) {
    console.error('USSD Error:', error);
    return res.send(sendUssdResponse('An error occurred. Please try again later.', true));
  }
};

// Helper function to call VTU service
async function quickVTU(endpoint, method, body = null, vendor = 'quickvtu') {
  let result;
  
  try {
    if (vendor === 'quickvtu') {
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
    } else if (vendor === 'bilal') {
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
      // Fallback to mobilevtu
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Api-Token": process.env.MOBILEVTU_API_TOKEN,
          "Request-Id": body["request-id"],
        },
      };
      const operator =
        body.network === 1 ? "MTN" :
        body.network === 2 ? "Airtel" :
        body.network === 3 ? "Glo" : "9Mobile";
        
      if (endpoint === '/api/data') {
        result = await axios.post(
          `https://api.mobilevtu.com/v1/${process.env.MOBILEVTU_API_KEY}/topup`,
          `operator=${operator}&type=data&value=${body.data_plan}&phone=${body.phone}`,
          config
        );
      } else if (endpoint === '/api/airtime') {
        result = await axios.post(
          `https://api.mobilevtu.com/v1/${process.env.MOBILEVTU_API_KEY}/topup`,
          `operator=${operator}&type=airtime&amount=${body.amount}&phone=${body.phone}`,
          config
        );
      }
    }
    
    return result.data;
  } catch (error) {
    console.error('quickVTU API Error:', {
      endpoint,
      vendor,
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    
    // Return a consistent error format
    return {
      status: 'error',
      message: error.response?.data?.message || 'VTU service unavailable',
      vendorResponse: error.response?.data || error.message
    };
  }
}
