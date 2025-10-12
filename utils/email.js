const nodemailer = require('nodemailer');
const usersService = require('../service/users.service');
// Apple ID patterns to exclude
const UNWANTED_PATTERNS = [
    /@privaterelay\.appleid\.com$/i,
    /@icloud\.com$/i,
    /@me\.com$/i,
    /@mac\.com$/i,
    /@wlsom\.com$/i,
    /@webscash\.com$/i,
    /archive\.com$/i,
];

function isUnwanted(email) {
    return UNWANTED_PATTERNS.some(pattern => pattern.test(email));
}

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

// Helper: normalize recipients to a unique string array
function normalizeRecipients(to) {
  if (!to) return [];
  const arr = Array.isArray(to) ? to : [to];
  return Array.from(new Set(arr.map(String).filter(Boolean)));
}

// Helper: mark a batch of emails unsubscribed (best-effort)
async function markUnsubscribed(emails) {
  if (!emails || emails.length === 0) return;
  try {
    await Promise.all(
      emails.map((email) => usersService.updateUsers({ email }, { unsubscribed: true }))
    );
  } catch (e) {
    console.error('Failed to mark unsubscribed:', e?.message || e);
  }
}

// Helper: return subset of input emails that are already unsubscribed in DB
async function findAlreadyUnsubscribed(emails) {
  if (!emails || emails.length === 0) return [];
  try {
    const res = await usersService.getUsers(
      { email: { $in: emails }, unsubscribed: true },
      { select: 'email', limit: emails.length }
    );
    return (res?.docs || []).map((u) => u.email);
  } catch (e) {
    console.error('Failed to query unsubscribed users:', e?.message || e);
    return [];
  }
}

/**
 * Send an email to multiple recipients
 * @param {Array<string>} to - Array of recipient email addresses
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @param {string} [from] - Sender email address (defaults to SMTP_USER)
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendEmail = async ({to, subject, html, from = "hello@360gadgetsafrica.com"}) => {
  // 1) Normalize and split by unwanted pattern
  const recipients = normalizeRecipients(to);
  const unwanted = recipients.filter(isUnwanted);
  const candidates = recipients.filter((e) => !isUnwanted(e));

  // 2) Auto-unsubscribe unwanted immediately
  await markUnsubscribed(unwanted);

  // 3) Exclude already unsubscribed from candidates
  const alreadyUnsub = await findAlreadyUnsubscribed(candidates);
  const validRecipients = candidates.filter((e) => !alreadyUnsub.includes(e));

  if (validRecipients.length === 0) {
    return { success: false, error: 'No valid recipients (unwanted or unsubscribed).' };
  }

  // 4) Send
  try {
    const mailOptions = {
      from: `"${'360GadgetsAfrica'}" <${from}>`,
      to: validRecipients,
      subject,
      html,
    };
    const info = await emailTransporter.sendMail(mailOptions);
    console.log(info)
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (error) {
    console.error('Error sending email:', error);
    // On SMTP 550, unsubscribe attempted recipients
    if (error?.responseCode === 550) {
      await markUnsubscribed(validRecipients);
    }
    return { success: false, error: error.message };
  }
};

module.exports = {
    sendEmail,
    emailTransporter
};
