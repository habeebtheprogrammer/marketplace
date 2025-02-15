
const networkPrefixes = {
  MTN: ['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906', '0913', '0916', '07025', '07026', '0704'],
  AIRTEL: ['0802', '0808', '0708', '0812', '0701', '0902', '0901', '0904', '0907', '0912'],
  GLO: ['0805', '0807', '0705', '0815', '0811', '0905', '0915'],
  '9MOBILE': ['0809', '0817', '0818', '0908', '0909'],
};

exports.detectNetwork = (phoneNumber) => {
  // Remove any non-digit characters and ensure it starts with 0
  const cleanNumber = phoneNumber.replace(/\D/g, '').replace(/^(234|\+234)/, '0');

  if (cleanNumber.length !== 11) {
    return 'Unknown';
  }

  for (const [network, prefixes] of Object.entries(networkPrefixes)) {
    if (prefixes.some(prefix => cleanNumber.startsWith(prefix))) {
      return network;
    }
  }

  return 'Unknown';
};

exports.dataplan = [

  // {
  //   "planId": 10,
  //   "network": "MTN",
  //   "planType": "COOPERATE",
  //   "planName": "500MB",
  //   "amount": "75.00",
  //   // "amount": "133.00",
  //   "duration": "1Month"
  // },
    {
      "planId": 4,
      "network": "MTN",
      "planType": "SME",
      "planName": "500MB",
      "amount": "75.00",
      // "amount": "132.00",
      "duration": "1Month"
    },
    // {
    //   "planId": 2,
    //   "network": "MTN",
    //   "planType": "GIFTING",
    //   "planName": "1GB",
    //   "amount": "250.00",
    //   "duration": "1Month"
    // },

    // {
    //   "planId": 14,
    //   "network": "MTN",
    //   "planType": "COOPERATE",
    //   "planName": "1GB",
    //   "amount": "265.00",
    //   "duration": "1Month"
    // },
    {
      "planId": 5,
      "network": "MTN",
      "planType": "SME",
      "planName": "1GB",
      "amount": "262.00",
      "duration": "1Month"
    },
    // {
    //   "planId": 1,
    //   "network": "MTN",
    //   "planType": "GIFTING",
    //   "planName": "2GB",
    //   "amount": "500.00",
    //   "duration": "1Month"
    // },
    // {
    //   "planId": 15,
    //   "network": "MTN",
    //   "planType": "COOPERATE",
    //   "planName": "2GB",
    //   "amount": "530.00",
    //   "duration": "1Month"
    // },
    {
      "planId": 6,
      "network": "MTN",
      "planType": "SME",
      "planName": "2GB",
      "amount": "524.00",
      "duration": "1Month"
    },
    // {
    //   "planId": 49,
    //   "network": "MTN",
    //   "planType": "GIFTING",
    //   "planName": "3GB",
    //   "amount": "750.00",
    //   "duration": "1Month"
    // },

    // {
    //   "planId": 16,
    //   "network": "MTN",
    //   "planType": "COOPERATE",
    //   "planName": "3GB",
    //   "amount": "795.00",
    //   "duration": "1Month"
    // },

    {
      "planId": 7,
      "network": "MTN",
      "planType": "SME",
      "planName": "3GB",
      "amount": "786.00",
      "duration": "1Month"
    },

    // {
    //   "planId": 50,
    //   "network": "MTN",
    //   "planType": "GIFTING",
    //   "planName": "5GB",
    //   "amount": "1250.00",
    //   "duration": "1Month"
    // },
    // {
    //   "planId": 17,
    //   "network": "MTN",
    //   "planType": "COOPERATE",
    //   "planName": "5GB",
    //   "amount": "1325.00",
    //   "duration": "1Month"
    // },
    {
      "planId": 8,
      "network": "MTN",
      "planType": "SME",
      "planName": "5GB",
      "amount": "1310.00",
      "duration": "1Month"
    },
    {
      "planId": 9,
      "network": "MTN",
      "planType": "SME",
      "planName": "10GB",
      "amount": "2620.00",
      "duration": "1Month"
    },
    // {
    //   "planId": 18,
    //   "network": "MTN",
    //   "planType": "COOPERATE",
    //   "planName": "10GB",
    //   "amount": "2650.00",
    //   "duration": "1Month"
    // },

    {
      "planId": 36,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "500MB",
      "amount": "75.00",
      // "amount": "138.00",
      "duration": "1Month"
    },
    {
      "planId": 37,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "1GB",
      "amount": "270.00",
      "duration": "1Month"
    },
    // {
    //   "planId": 24,
    //   "network": "GLO",
    //   "planType": "GIFTING",
    //   "planName": "1.5GB",
    //   "amount": "465.00",
    //   "duration": "1Month"
    // },
    {
      "planId": 38,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "2GB",
      "amount": "540.00",
      "duration": "1Month"
    },
    {
      "planId": 39,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "3GB",
      "amount": "810.00",
      "duration": "1Month"
    },
    // {
    //   "planId": 25,
    //   "network": "GLO",
    //   "planType": "GIFTING",
    //   "planName": "2.9GB",
    //   "amount": "940.00",
    //   "duration": "1Month"
    // },
    // {
    //   "planId": 26,
    //   "network": "GLO",
    //   "planType": "GIFTING",
    //   "planName": "4.1GB",
    //   "amount": "1300.00",
    //   "duration": "1Month"
    // },

    {
      "planId": 40,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "5GB",
      "amount": "1350.00",
      "duration": "1Month"
    },
    // {
    //   "planId": 27,
    //   "network": "GLO",
    //   "planType": "GIFTING",
    //   "planName": "5.8GB",
    //   "amount": "1860.00",
    //   "duration": "1Month"
    // },
    {
      "planId": 47,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "10GB",
      "amount": "2700.00",
      "duration": "1Month"
    },
    // {
    //   "planId": 28,
    //   "network": "GLO",
    //   "planType": "GIFTING",
    //   "planName": "10GB",
    //   "amount": "3020.00",
    //   "duration": "1Month"
    // },

    {
      "planId": 32,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "100MB",
      "amount": "75.00",
      "duration": "7days"
    },
    {
      "planId": 31,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "300MB",
      "amount": "110.00",
      "duration": "7days"
    },
    {
      "planId": 19,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "500MB",
      "amount": "150.00",
      // "amount": "140.00",
      "duration": "1Month"
    },
    {
      "planId": 51,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "1GB",
      "amount": "240.00",
      "duration": "2DAYS"
    },
    {
      "planId": 20,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "1GB",
      "amount": "560.00",
      "duration": "1Month"
    },
    {
      "planId": 21,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "2GB",
      "amount": "1130.00",
      "duration": "1Month"
    },
    {
      "planId": 58,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "2GB",
      "amount": "350.00",
      "duration": "2Days"
    },
    {
      "planId": 53,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "3GB",
      "amount": "550.00",
      "duration": "7DAYS"
    },
    {
      "planId": 57,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "4GB",
      "amount": "1050.00",
      "duration": "1Month"
    },
    {
      "planId": 52,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "5GB",
      "amount": "1200.00",
      "duration": "14DAYS"
    },
    {
      "planId": 22,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "5GB",
      "amount": "2810.00",
      "duration": "1Month"
    },
    {
      "planId": 23,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "10GB",
      "amount": "5610.00",
      "duration": "1Month"
    },
    {
      "planId": 54,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "10GB",
      "amount": "2300.00",
      "duration": "1Month"
    },
    {
      "planId": 56,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "15GB",
      "amount": "3150.00",
      "duration": "1Month"
    },
    {
      "planId": 42,
      "network": "9MOBILE",
      "planType": "COOPERATE",
      "planName": "1GB",
      "amount": "150.00",
      "duration": "1Month"
    },
    {
      "planId": 43,
      "network": "9MOBILE",
      "planType": "COOPERATE",
      "planName": "2GB",
      "amount": "300.00",
      "duration": "1Month"
    },
    // {
    //   "planId": 29,
    //   "network": "9MOBILE",
    //   "planType": "SME",
    //   "planName": "1.1GB",
    //   "amount": "399.00",
    //   "duration": "1Month"
    // },
    {
      "planId": 44,
      "network": "9MOBILE",
      "planType": "COOPERATE",
      "planName": "3GB",
      "amount": "450.00",
      "duration": "1Month"
    },

    // {
    //   "planId": 34,
    //   "network": "9MOBILE",
    //   "planType": "GIFTING",
    //   "planName": "500MB",
    //   "amount": "450.00",
    //   "duration": "1 Month"
    // },
    {
      "planId": 45,
      "network": "9MOBILE",
      "planType": "COOPERATE",
      "planName": "4GB",
      "amount": "600.00",
      "duration": "1Month"
    },
    // {
    //   "planId": 30,
    //   "network": "9MOBILE",
    //   "planType": "SME",
    //   "planName": "2GB",
    //   "amount": "760.00",
    //   "duration": "1Month"
    // },
    {
      "planId": 46,
      "network": "9MOBILE",
      "planType": "COOPERATE",
      "planName": "5GB",
      "amount": "750.00",
      "duration": "1Month"
    },
    // {
    //   "planId": 33,
    //   "network": "9MOBILE",
    //   "planType": "GIFTING",
    //   "planName": "1.5GB",
    //   "amount": "900.00",
    //   "duration": "1Month"
    // },
    {
      "planId": 48,
      "network": "9MOBILE",
      "planType": "COOPERATE",
      "planName": "10GB",
      "amount": "1500.00",
      "duration": "1Month"
    }
  ];
  
  
  

  