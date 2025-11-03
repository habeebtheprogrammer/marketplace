// Phone number to Vendor ID mapping
 const VENDOR_PHONE_MAPPINGS = [
  {
    vendorId: "65afa65efcb2e4a192d771db",
    phone: "+2347069568209",
  },
  {
    vendorId: "66927af6eb322a27f7c6902c",
    phone: "+2349166576239",
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
    vendorId: "690081fbee8d1a8c5bbcf6ab",
    phone: "+2348142079360"
  },
  {
    vendorId: "6905e8392c471299d29c7186",
    phone: "+2349037369363"
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
