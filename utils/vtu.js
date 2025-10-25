
const { NETWORK_PREFIXES, ALLOWED_NETWORKS } = require('./constants')

const sanitizePhone = (phoneNumber = '') => phoneNumber.replace(/\D/g, '').replace(/^(234|\+234)/, '0')

exports.detectNetwork = (phoneNumber) => {
  // Remove any non-digit characters and ensure it starts with 0
  const cleanNumber = sanitizePhone(phoneNumber);

  if (cleanNumber.length !== 11) {
    return 'Unknown';
  }

  for (const [network, prefixes] of Object.entries(NETWORK_PREFIXES)) {
    if (prefixes.some(prefix => cleanNumber.startsWith(prefix))) {
      return network;
    }
  }

  return 'Unknown';
};

exports.isValidNigerianPhone = (phoneNumber) => {
  const cleanNumber = sanitizePhone(phoneNumber)
  if (cleanNumber.length !== 11 || !cleanNumber.startsWith('0')) {
    return false
  }
  return ALLOWED_NETWORKS.some(network =>
    NETWORK_PREFIXES[network].some(prefix => cleanNumber.startsWith(prefix))
  )
}

exports.sanitizePhone = sanitizePhone
