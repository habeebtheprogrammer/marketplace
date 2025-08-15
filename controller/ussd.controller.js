const { walletsService } = require('../service');
const dataplan = require('../dataplan.json');
const { errorResponse, successResponse } = require('../utils/responder');
const Wallets = require('../model/wallets.model');
const Users = require('../model/users.model');
const Transactions = require('../model/transactions.model');
const USSDTransaction = require('../model/ussdTransaction.model');
const mongoose = require('mongoose');
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
        return res.send(sendUssdResponse('Emergency Airtime\n1. N100 airtime'));
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
        // Process airtime selection
        const amount = parseInt(userInput[1]);
        if (isNaN(amount) || amount <= 0) {
          return res.send(sendUssdResponse('Invalid amount. Please enter a valid number.'));
        }
        
        // Validate amount based on user's tier
        const userTier = calculateUserTier(user);
        const maxAmount = getMaxAmountForTier(userTier);
        
        if (amount > maxAmount) {
          return res.send(sendUssdResponse(`Amount exceeds your limit of N${maxAmount}. Please enter a lower amount.`));
        }
        
        const confirmMessage = `You are about to buy N${amount} airtime for ${cleanPhone} (${network}).\n1. Confirm\n2. Cancel`;
        
        try {
          // Store transaction data in MongoDB
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
          
          console.log('Transaction data saved to MongoDB:', { sessionId: req.body.sessionId });
          return res.send(sendUssdResponse(confirmMessage));
          
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
              // Add to loan balance
              wallet.loanBalance += transaction.amount;
              await wallet.save();
              
              // Create transaction record
              const tx = new Transactions({
                userId: user._id,
                amount: transaction.amount,
                reference: `Airtime_${Date.now()}`,
                narration: `Emergency airtime purchase on ${transaction.phoneNumber}`,
                planType: 'AIRTIME',
                network: transaction.network,
                status: 'successful',
                type: "Debit"
              });
              await tx.save();
              
              // Update transaction status
              transaction.status = 'completed';
              await transaction.save();
              
              return res.send(sendUssdResponse('Your airtime purchase was successful! Thank you for using our service.', true));
              
            } else if (transaction.type === 'data') {
              // Add to loan balance
              wallet.loanBalance += transaction.amount;
              await wallet.save();
              
              // Create transaction record
              const tx = new Transactions({
                userId: user._id,
                amount: transaction.amount,
                reference: `DATA_${Date.now()}`,
                narration: `Emergency data purchase (${transaction.plan}) on ${transaction.phoneNumber}`,
                planType: 'DATA',
                dataPlan: transaction.plan,
                network: transaction.network,
                status: 'successful',
                type: "debit"
              });
              await tx.save();
              
              // Update transaction status
              transaction.status = 'completed';
              await transaction.save();
              
              return res.send(sendUssdResponse(`Your ${transaction.plan} data plan has been activated! Thank you for using our service.`, true));
            }
            
          } catch (error) {
            // Update transaction status to failed
            transaction.status = 'failed';
            try {
              await transaction.save();
            } catch (saveError) {
              console.error('Error updating transaction status to failed:', saveError);
            }
            
            console.error('Error processing transaction:', error);
            return res.send(sendUssdResponse('An error occurred while processing your transaction. Please try again.', true));
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
