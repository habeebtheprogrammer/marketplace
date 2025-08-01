const { sendEmail } = require('../utils/email');
const { validationResult } = require('express-validator');

/**
 * Send email to multiple recipients
 * @route POST /api/send-email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with success/error message
 */
const sendBulkEmail = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { emails, subject, html } = req.body;

        // Validate required fields
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Emails array is required and must not be empty',
            });
        }

        if (!html || typeof html !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'HTML template is required and must be a string',
            });
        }

        for (const email of emails) {

           try {
             // Send email
             const result = await sendEmail(
                email.email,
               subject || 'No Subject',
               html
           );

           if (result.success) {
             
           } else {
              console.log("error sending mail" , email)
           }
           } catch (error) {
            console.log("error sending mail" , email)
                
           }
        }
        return res.status(200).json({
            success: true,
            message: 'Emails sent successfully',
            data: {
                recipientCount: emails.length,
            },
        });
    } catch (error) {
        console.error('Error in sendBulkEmail:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

module.exports = {
    sendBulkEmail,
};
