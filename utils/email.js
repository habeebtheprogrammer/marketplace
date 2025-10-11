const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const emailTransporter = nodemailer.createTransport({
  // service: "Outlook365",
 host:  process.env.SMTP4_HOST,
port: 465,
secure: true,
  auth: {
    user:  process.env.SMTP4_USER, // generated ethereal user
    pass:  process.env.SMTP4_PASSWORD, // generated ethereal password
  },
});

/**
 * Send an email to multiple recipients
 * @param {Array<string>} to - Array of recipient email addresses
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @param {string} [from] - Sender email address (defaults to SMTP_USER)
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendEmail = async (to, subject, html, from = "hello@360gadgetsafrica.com") => {
    try {
        const mailOptions = {
            from: `"${'360GadgetsAfrica'}" <${from}>`,
            to: to,
            subject,
            html,
        };

        const info = await emailTransporter.sendMail(mailOptions);
        console.log(info)
        return {
            success: true,
            messageId: info.messageId,
            response: info.response,
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

module.exports = {
    sendEmail,
    emailTransporter
};
