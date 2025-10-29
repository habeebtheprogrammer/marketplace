// Phone number to Vendor ID mapping
 const VENDOR_PHONE_MAPPINGS = [
  {
    vendorId: "65afa65efcb2e4a192d771db",
    phone: "+2347069568209",
  },
  {
    vendorId: "65afa65efcb2e4a192d771db",
    phone: "+2348181362484",
  },
  {
    vendorId: "68e82894fd41671c10d501fe",
    phone: "+2347057221476"
  },
  {
    vendorId: "68e82894fd41671c10d501fe",
    phone: "+2349076087744"
  },
  {
    vendorId: "690241f550cb0546b7d882c4",
    phone: "+2348142079360"
  }
  
]

// Function to get vendor ID from phone number
function getVendorIdFromPhone(phone) {
  // Normalize phone number (add + if missing)
  const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`

  const mapping = VENDOR_PHONE_MAPPINGS.find((m) => m.phone === normalizedPhone || m.phone === phone)

  return mapping ? mapping.vendorId : null
}

// Function to check if phone number is authorized
function isPhoneAuthorized(phone) {
  return getVendorIdFromPhone(phone) !== null
}

module.exports = {
  getVendorIdFromPhone,
  isPhoneAuthorized,
}
