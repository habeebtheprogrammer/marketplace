
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
      "planType": "SME 2",
      "planName": "500MB",
      "amount": "305.00",
      // "amount": "132.00",
      "duration": "1Month",
    "vendor": "quickvtu"
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
      "planType": "SME 2",
      "planName": "1GB",
      "amount": "610.00",
      "duration": "1Month",
    "vendor": "quickvtu"
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
      "planType": "SME 2",
      "planName": "2GB",
      "amount": "1220.00",
      "duration": "1Month",
    "vendor": "quickvtu"
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
      "planType": "SME 2",
      "planName": "3GB",
      "amount": "1830.00",
      "duration": "1Month",
    "vendor": "quickvtu"
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
    // {
    //   "planId": 8,
    //   "network": "MTN",
    //   "planType": "SME",
    //   "planName": "5GB",
    //   "amount": "1315.00",
    //   "duration": "1Month"
    // },
    {
      "planId": 9,
      "network": "MTN",
      "planType": "SME 2",
      "planName": "10GB",
      "amount": "6100.00",
      "duration": "1Month",
    "vendor": "quickvtu"
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
      "planId": 35,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "200MB",
      "amount": "85.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 36,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "500MB",
      // "amount": "75.00",
      "amount": "153.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 65,
      "network": "GLO",
      "planType": "SME",
      "planName": "1GB",
      "amount": "220.00",
      "duration": "1day",
    "vendor": "quickvtu"
    },
    {
      "planId": 37,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "1GB",
      "amount": "295.00",
      "duration": "1Month",
    "vendor": "quickvtu"
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
      "amount": "580.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 66,
      "network": "GLO",
      "planType": "SME",
      "planName": "2GB",
      "amount": "320.00",
      "duration": "1day",
    "vendor": "quickvtu"
    },
    {
      "planId": 39,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "3GB",
      "amount": "865.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 67,
      "network": "GLO",
      "planType": "SME",
      "planName": "3.5GB",
      "amount": "510.00",
      "duration": "2days",
    "vendor": "quickvtu"
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
      "amount": "1445.00",
      "duration": "1Month",
    "vendor": "quickvtu"
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
      "amount": "2900.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },

    {
      "planId": 68,
      "network": "GLO",
      "planType": "SME",
      "planName": "15GB",
      "amount": "2050.00",
      "duration": "7days",
    "vendor": "quickvtu"
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
      "amount": "160.00",
      "duration": "7days",
    "vendor": "quickvtu"
    },
    {
      "planId": 59,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "150MB",
      "amount": "80.00",
      "duration": "1day",
    "vendor": "quickvtu"
    },
    {
      "planId": 60,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "300MB",
      "amount": "140.00",
      "duration": "2days",
    "vendor": "quickvtu"
    },
    {
      "planId": 31,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "300MB",
      "amount": "220.00",
      "duration": "7days",
    "vendor": "quickvtu"
    },
    {
      "planId": 19,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "500MB",
      "amount": "285.00",
      // "amount": "140.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 51,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "600MB",
      "amount": "235.00",
      "duration": "2DAYS",
    "vendor": "quickvtu"
    },
    {
      "planId": 20,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "1GB",
      "amount": "560.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 61,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "1GB",
      "amount": "303.00",
      "duration": "7days",
    "vendor": "quickvtu"
    },
    {
      "planId": 21,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "2GB",
      "amount": "1120.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 58,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "2GB",
      "amount": "335.00",
      "duration": "2Days",
    "vendor": "quickvtu"
    },
    {
      "planId": 53,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "3GB",
      "amount": "535.00",
      "duration": "7DAYS",
    "vendor": "quickvtu"
    },

    {
      "planId": 62,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "3GB",
      "amount": "1090.00",
      "duration": "7days",
    "vendor": "quickvtu"
    },
    {
      "planId": 57,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "4GB",
      "amount": "1045.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 52,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "5GB",
      "amount": "1210.00",
      "duration": "14DAYS",
    "vendor": "quickvtu"
    },
    {
      "planId": 22,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "5GB",
      "amount": "2770.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },

    {
      "planId": 63,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "7GB",
      "amount": "2125.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 54,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "7GB",
      "amount": "2300.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 23,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "10GB",
      "amount": "5550.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 56,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "10GB",
      "amount": "3180.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 64,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "10GB",
      "amount": "3120.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 42,
      "network": "9MOBILE",
      "planType": "COOPERATE",
      "planName": "1GB",
      "amount": "150.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    },
    {
      "planId": 43,
      "network": "9MOBILE",
      "planType": "COOPERATE",
      "planName": "2GB",
      "amount": "290.00",
      "duration": "1Month",
    "vendor": "quickvtu"
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
      "amount": "430.00",
      "duration": "1Month",
    "vendor": "quickvtu"
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
      "amount": "570.00",
      "duration": "1Month",
    "vendor": "quickvtu"
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
      "amount": "710.00",
      "duration": "1Month",
    "vendor": "quickvtu"
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
      "amount": "1420.00",
      "duration": "1Month",
    "vendor": "quickvtu"
    }
  ];
  
  
  
exports.bilalsvtu =  [
  // {
  //   "planName": "500MB",
  //   "planId": "28",
  //   "amount": "455.00",
  //   "planType": "GIFTING",
  //   "duration": "30 days",
  //   "network": "9MOBILE",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "500MB",
  //   "planId": "46",
  //   "amount": "75.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30 days",
  //   "network": "9MOBILE",
  //   "vendor": "bilal"

  // },
  // {
  //   "planName": "1GB",
  //   "planId": "47",
  //   "amount": "147.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days",
  //   "network": "9MOBILE",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "1.1GB",
  //   "planId": "25",
  //   "amount": "411.00",
  //   "planType": "SME",
  //   "duration": "30days",
  //   "network": "9MOBILE",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "1.5GB",
  //   "planId": "27",
  //   "amount": "895.00",
  //   "planType": "GIFTING",
  //   "duration": "30days",
  //   "network": "9MOBILE",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "2GB",
  //   "planId": "48",
  //   "amount": "300.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days",
  //   "network": "9MOBILE",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "3GB",
  //   "planId": "49",
  //   "amount": "450.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days",
  //   "network": "9MOBILE",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "4GB",
  //   "planId": "50",
  //   "amount": "700.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days",
  //   "network": "9MOBILE",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "5GB",
  //   "planId": "51",
  //   "amount": "876.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days",
  //   "network": "9MOBILE",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "10GB",
  //   "planId": "52",
  //   "amount": "1752.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days",
  //   "network": "9MOBILE",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "100MB",
  //   "planId": "45",
  //   "amount": "101.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days",
  //   "network": "AIRTEL",
  //   "vendor": "bilal"
  // },
  {
    "planName": "150MB",
    "planId": "67",
    "amount": "71.00",
    "planType": "GIFTING PROMO",
    "duration": "1 day",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "300MB",
    "planId": "44",
    "amount": "203.00",
    "planType": "COOPERATE",
    "duration": "30days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "300MB",
    "planId": "68",
    "amount": "133.00",
    "planType": "GIFTING PROMO",
    "duration": "2 days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "500MB",
    "planId": "7",
    "amount": "277.00",
    "planType": "COOPERATE",
    "duration": "30days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "1GB",
    "planId": "8",
    "amount": "554.00",
    "planType": "COOPERATE",
    "duration": "30days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "1GB",
    "planId": "69",
    "amount": "300.00",
    "planType": "GIFTING PROMO",
    "duration": "2 days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "2GB",
    "planId": "9",
    "amount": "1108.00",
    "planType": "COOPERATE",
    "duration": "30days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "2GB",
    "planId": "70",
    "amount": "580.00",
    "planType": "GIFTING PROMO",
    "duration": "2 days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "3GB",
    "planId": "71",
    "amount": "1095.00",
    "planType": "GIFTING PROMO",
    "duration": "7 days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "3GB",
    "planId": "75",
    "amount": "846.00",
    "planType": "COOPERATE",
    "duration": "30days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "5GB",
    "planId": "10",
    "amount": "2771.00",
    "planType": "COOPERATE",
    "duration": "30days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "7GB",
    "planId": "72",
    "amount": "2136.00",
    "planType": "GIFTING PROMO",
    "duration": "7days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "10GB",
    "planId": "26",
    "amount": "5542.00",
    "planType": "COOPERATE",
    "duration": "30days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "10GB",
    "planId": "73",
    "amount": "3172.00",
    "planType": "GIFTING PROMO",
    "duration": "30days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  {
    "planName": "20GB",
    "planId": "74",
    "amount": "4254.00",
    "planType": "GIFTING PROMO",
    "duration": "30days",
    "network": "AIRTEL",
    "vendor": "bilal"
  },
  // {
  //   "planName": "200MB",
  //   "planId": "29",
  //   "amount": "62.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days",
  //   "network": "GLO",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "500MB",
  //   "planId": "30",
  //   "amount": "152.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30 days",
  //   "network": "GLO",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "1GB",
  //   "planId": "31",
  //   "amount": "305.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30 days",
  //   "network": "GLO",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "2GB",
  //   "planId": "32",
  //   "amount": "560.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days",
  //   "network": "GLO",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "3GB",
  //   "planId": "33",
  //   "amount": "840.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days",
  //   "network": "GLO",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "5GB",
  //   "planId": "34",
  //   "amount": "1386.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days",
  //   "network": "GLO",
  //   "vendor": "bilal"
  // },
  // {
  //   "planName": "10GB",
  //   "planId": "35",
  //   "amount": "2772.00",
  //   "planType": "COOPERATE GIFTING",
  //   "duration": "30days after redeeming",
  //   "network": "GLO",
  //   "vendor": "bilal"
  // },
  {
    "planName": "500MB",
    "planId": "1",
    "amount": "305.00",
    "planType": "SME",
    "duration": "30days",
    "network": "MTN",
    "vendor": "bilal"
  },
  {
    "planName": "1GB",
    "planId": "2",
    "amount": "610.00",
    "planType": "SME",
    "duration": "30days",
    "network": "MTN",
    "vendor": "bilal"
  },
  {
    "planName": "2GB",
    "planId": "3",
    "amount": "1220.00",
    "planType": "SME",
    "duration": "30days",
    "network": "MTN",
    "vendor": "bilal"
  },
  {
    "planName": "3GB",
    "planId": "4",
    "amount": "1830.00",
    "planType": "SME",
    "duration": "30days",
    "network": "MTN",
    "vendor": "bilal"
  },
  {
    "planName": "7GB",
    "planId": "43",
    "amount": "3071.00",
    "planType": "GIFTING PROMO",
    "duration": "7days",
    "network": "MTN",
    "vendor": "bilal"
  },
  {
    "planName": "10GB",
    "planId": "6",
    "amount": "6100.00",
    "planType": "SME",
    "duration": "30days",
    "network": "MTN",
    "vendor": "bilal"
  }
]