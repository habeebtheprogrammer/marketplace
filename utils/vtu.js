
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
      "amount": "140.00",
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
      "amount": "269.00",
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
      "amount": "528.00",
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
      "amount": "787.00",
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
      "planType": "SME",
      "planName": "10GB",
      "amount": "2610.00",
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
      "planId": 35,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "200MB",
      "amount": "85.00",
      "duration": "1Month"
    },
    {
      "planId": 36,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "500MB",
      // "amount": "75.00",
      "amount": "153.00",
      "duration": "1Month"
    },
    {
      "planId": 65,
      "network": "GLO",
      "planType": "SME",
      "planName": "1GB",
      "amount": "220.00",
      "duration": "1day"
    },
    {
      "planId": 37,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "1GB",
      "amount": "295.00",
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
      "amount": "580.00",
      "duration": "1Month"
    },
    {
      "planId": 66,
      "network": "GLO",
      "planType": "SME",
      "planName": "2GB",
      "amount": "320.00",
      "duration": "1day"
    },
    {
      "planId": 39,
      "network": "GLO",
      "planType": "COOPERATE",
      "planName": "3GB",
      "amount": "865.00",
      "duration": "1Month"
    },
    {
      "planId": 67,
      "network": "GLO",
      "planType": "SME",
      "planName": "3.5GB",
      "amount": "510.00",
      "duration": "2days"
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
      "amount": "2900.00",
      "duration": "1Month"
    },

    {
      "planId": 68,
      "network": "GLO",
      "planType": "SME",
      "planName": "15GB",
      "amount": "2050.00",
      "duration": "7days"
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
      "duration": "7days"
    },
    {
      "planId": 59,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "150MB",
      "amount": "80.00",
      "duration": "1day"
    },
    {
      "planId": 60,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "300MB",
      "amount": "140.00",
      "duration": "2days"
    },
    {
      "planId": 31,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "300MB",
      "amount": "220.00",
      "duration": "7days"
    },
    {
      "planId": 19,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "500MB",
      "amount": "285.00",
      // "amount": "140.00",
      "duration": "1Month"
    },
    {
      "planId": 51,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "600MB",
      "amount": "235.00",
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
      "planId": 61,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "1GB",
      "amount": "303.00",
      "duration": "7days"
    },
    {
      "planId": 21,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "2GB",
      "amount": "1120.00",
      "duration": "1Month"
    },
    {
      "planId": 58,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "2GB",
      "amount": "335.00",
      "duration": "2Days"
    },
    {
      "planId": 53,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "3GB",
      "amount": "535.00",
      "duration": "7DAYS"
    },

    {
      "planId": 62,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "3GB",
      "amount": "1090.00",
      "duration": "7days"
    },
    {
      "planId": 57,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "4GB",
      "amount": "1045.00",
      "duration": "1Month"
    },
    {
      "planId": 52,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "5GB",
      "amount": "1210.00",
      "duration": "14DAYS"
    },
    {
      "planId": 22,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "5GB",
      "amount": "2770.00",
      "duration": "1Month"
    },

    {
      "planId": 63,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "7GB",
      "amount": "2125.00",
      "duration": "1Month"
    },
    {
      "planId": 54,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "7GB",
      "amount": "2300.00",
      "duration": "1Month"
    },
    {
      "planId": 23,
      "network": "AIRTEL",
      "planType": "COOPERATE",
      "planName": "10GB",
      "amount": "5550.00",
      "duration": "1Month"
    },
    {
      "planId": 56,
      "network": "AIRTEL",
      "planType": "GIFTING",
      "planName": "10GB",
      "amount": "3180.00",
      "duration": "1Month"
    },
    {
      "planId": 64,
      "network": "AIRTEL",
      "planType": "SME",
      "planName": "10GB",
      "amount": "3120.00",
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
      "amount": "290.00",
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
      "amount": "430.00",
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
      "amount": "570.00",
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
      "amount": "710.00",
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
      "amount": "1420.00",
      "duration": "1Month"
    }
  ];
  
  
  
exports.bilalsvtu =   [
    {
      "planName": "500MB",
      "planId": "28",
      "amount": "455.00",
      "planType": "GIFTING",
      "network": "9MOBILE"
    },
    {
      "planName": "500MB",
      "planId": "46",
      "amount": "75.00",
      "planType": "COOPERATE GIFTING",
      "network": "9MOBILE"
    },
    {
      "planName": "1GB",
      "planId": "47",
      "amount": "147.00",
      "planType": "COOPERATE GIFTING",
      "network": "9MOBILE"
    },
    {
      "planName": "1.1GB",
      "planId": "25",
      "amount": "411.00",
      "planType": "SME",
      "network": "9MOBILE"
    },
    {
      "planName": "1.5GB",
      "planId": "27",
      "amount": "895.00",
      "planType": "GIFTING",
      "network": "9MOBILE"
    },
    {
      "planName": "2GB",
      "planId": "48",
      "amount": "300.00",
      "planType": "COOPERATE GIFTING",
      "network": "9MOBILE"
    },
    {
      "planName": "3GB",
      "planId": "49",
      "amount": "450.00",
      "planType": "COOPERATE GIFTING",
      "network": "9MOBILE"
    },
    {
      "planName": "4GB",
      "planId": "50",
      "amount": "700.00",
      "planType": "COOPERATE GIFTING",
      "network": "9MOBILE"
    },
    {
      "planName": "5GB",
      "planId": "51",
      "amount": "876.00",
      "planType": "COOPERATE GIFTING",
      "network": "9MOBILE"
    },
    {
      "planName": "10GB",
      "planId": "52",
      "amount": "1752.00",
      "planType": "COOPERATE GIFTING",
      "network": "9MOBILE"
    } ,
    {
      "planName": "100MB",
      "planId": "45",
      "amount": "101.00",
      "planType": "COOPERATE GIFTING",
      "network": "AIRTEL"
    },
    {
      "planName": "150MB",
      "planId": "67",
      "amount": "71.00",
      "planType": "GIFTING PROMO",
      "network": "AIRTEL"
    },
    {
      "planName": "300MB",
      "planId": "44",
      "amount": "203.00",
      "planType": "COOPERATE GIFTING",
      "network": "AIRTEL"
    },
    {
      "planName": "300MB",
      "planId": "68",
      "amount": "133.00",
      "planType": "GIFTING PROMO",
      "network": "AIRTEL"
    },
    {
      "planName": "500MB",
      "planId": "7",
      "amount": "277.00",
      "planType": "COOPERATE GIFTING",
      "network": "AIRTEL"
    },
    // {
    //   "planName": "750MB",
    //   "planId": "53",
    //   "amount": "487.00",
    //   "planType": "GIFTING",
    //   "network": "AIRTEL"
    // },
    {
      "planName": "1GB",
      "planId": "8",
      "amount": "554.00",
      "planType": "COOPERATE GIFTING",
      "network": "AIRTEL"
    },
    {
      "planName": "1GB",
      "planId": "69",
      "amount": "300.00",
      "planType": "GIFTING PROMO",
      "network": "AIRTEL"
    },
    // {
    //   "planName": "1.5GB",
    //   "planId": "54",
    //   "amount": "1015.00",
    //   "planType": "GIFTING",
    //   "network": "AIRTEL"
    // },
    {
      "planName": "2GB",
      "planId": "9",
      "amount": "1108.00",
      "planType": "COOPERATE GIFTING",
      "network": "AIRTEL"
    },
    // {
    //   "planName": "2GB",
    //   "planId": "55",
    //   "amount": "1220.00",
    //   "planType": "GIFTING",
    //   "network": "AIRTEL"
    // },
    {
      "planName": "2GB",
      "planId": "70",
      "amount": "580.00",
      "planType": "GIFTING PROMO",
      "network": "AIRTEL"
    },
    // {
    //   "planName": "3GB",
    //   "planId": "56",
    //   "amount": "1530.00",
    //   "planType": "GIFTING",
    //   "network": "AIRTEL"
    // },
    {
      "planName": "3GB",
      "planId": "71",
      "amount": "1095.00",
      "planType": "GIFTING PROMO",
      "network": "AIRTEL"
    },
    {
      "planName": "3GB",
      "planId": "75",
      "amount": "846.00",
      "planType": "COOPERATE GIFTING",
      "network": "AIRTEL"
    },
    // {
    //   "planName": "4.5GB",
    //   "planId": "57",
    //   "amount": "2046.00",
    //   "planType": "GIFTING",
    //   "network": "AIRTEL"
    // },
    {
      "planName": "5GB",
      "planId": "10",
      "amount": "2771.00",
      "planType": "COOPERATE GIFTING",
      "network": "AIRTEL"
    },
    {
      "planName": "7GB",
      "planId": "72",
      "amount": "2136.00",
      "planType": "GIFTING PROMO",
      "network": "AIRTEL"
    },
    {
      "planName": "10GB",
      "planId": "26",
      "amount": "5542.00",
      "planType": "COOPERATE GIFTING",
      "network": "AIRTEL"
    },
    {
      "planName": "10GB",
      "planId": "73",
      "amount": "3172.00",
      "planType": "GIFTING PROMO",
      "network": "AIRTEL"
    },
    // {
    //   "planName": "11GB",
    //   "planId": "58",
    //   "amount": "4112.00",
    //   "planType": "GIFTING",
    //   "network": "AIRTEL"
    // },
    {
      "planName": "20GB",
      "planId": "74",
      "amount": "4254.00",
      "planType": "GIFTING PROMO",
      "network": "AIRTEL"
    } ,
    {
      "planName": "200MB",
      "planId": "29",
      "amount": "62.00",
      "planType": "COOPERATE GIFTING",
      "network": "GLO"
    },
    {
      "planName": "500MB",
      "planId": "30",
      "amount": "152.00",
      "planType": "COOPERATE GIFTING",
      "network": "GLO"
    },
    {
      "planName": "1GB",
      "planId": "31",
      "amount": "305.00",
      "planType": "COOPERATE GIFTING",
      "network": "GLO"
    },
    {
      "planName": "1GB",
      "planId": "76",
      "amount": "210.00",
      "planType": "GIFTING PROMO",
      "network": "GLO"
    },
    {
      "planName": "1.5GB",
      "planId": "11",
      "amount": "475.00",
      "planType": "GIFTING",
      "network": "GLO"
    },
    {
      "planName": "2GB",
      "planId": "32",
      "amount": "560.00",
      "planType": "COOPERATE GIFTING",
      "network": "GLO"
    },
    {
      "planName": "2GB",
      "planId": "77",
      "amount": "320.00",
      "planType": "GIFTING PROMO",
      "network": "GLO"
    },
    {
      "planName": "2.9GB",
      "planId": "12",
      "amount": "969.00",
      "planType": "GIFTING",
      "network": "GLO"
    },
    {
      "planName": "3GB",
      "planId": "33",
      "amount": "840.00",
      "planType": "COOPERATE GIFTING",
      "network": "GLO"
    },
    {
      "planName": "3.5GB",
      "planId": "78",
      "amount": "535.00",
      "planType": "GIFTING PROMO",
      "network": "GLO"
    },
    {
      "planName": "4.1GB",
      "planId": "13",
      "amount": "1331.00",
      "planType": "GIFTING",
      "network": "GLO"
    },
    {
      "planName": "5GB",
      "planId": "34",
      "amount": "1386.00",
      "planType": "COOPERATE GIFTING",
      "network": "GLO"
    },
    {
      "planName": "5.8GB",
      "planId": "14",
      "amount": "1909.00",
      "planType": "GIFTING",
      "network": "GLO"
    },
    {
      "planName": "10GB",
      "planId": "15",
      "amount": "3132.00",
      "planType": "GIFTING",
      "network": "GLO"
    },
    {
      "planName": "10GB",
      "planId": "35",
      "amount": "2772.00",
      "planType": "COOPERATE GIFTING",
      "network": "GLO"
    },
    {
      "planName": "15GB",
      "planId": "79",
      "amount": "2103.00",
      "planType": "GIFTING PROMO",
      "network": "GLO"
    },
    // {
    //   "planName": "50MB",
    //   "planId": "16",
    //   "amount": "30.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "150MB",
    //   "planId": "17",
    //   "amount": "81.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "250MB",
    //   "planId": "18",
    //   "amount": "92.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    {
      "planName": "500MB",
      "planId": "1",
      "amount": "305.00",
      "planType": "SME",
      "network": "MTN"
    },
    // {
    //   "planName": "500MB",
    //   "planId": "19",
    //   "amount": "138.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "500MB",
    //   "planId": "66",
    //   "amount": "135.00",
    //   "planType": "GIFTING",
    //   "network": "MTN"
    // },
    {
      "planName": "1GB",
      "planId": "2",
      "amount": "610.00",
      "planType": "SME",
      "network": "MTN"
    },
    // {
    //   "planName": "1GB",
    //   "planId": "20",
    //   "amount": "275.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "1GB",
    //   "planId": "39",
    //   "amount": "262.00",
    //   "planType": "GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "1GB",
    //   "planId": "61",
    //   "amount": "350.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "1.5GB",
    //   "planId": "60",
    //   "amount": "412.50",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    {
      "planName": "2GB",
      "planId": "3",
      "amount": "1220.00",
      "planType": "SME",
      "network": "MTN"
    },
    // {
    //   "planName": "2GB",
    //   "planId": "21",
    //   "amount": "550.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "2GB",
    //   "planId": "38",
    //   "amount": "518.00",
    //   "planType": "GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "2GB",
    //   "planId": "63",
    //   "amount": "440.00",
    //   "planType": "GIFTING",
    //   "network": "MTN"
    // },
    {
      "planName": "3GB",
      "planId": "4",
      "amount": "1830.00",
      "planType": "SME",
      "network": "MTN"
    },
    // {
    //   "planName": "3GB",
    //   "planId": "22",
    //   "amount": "825.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "3GB",
    //   "planId": "64",
    //   "amount": "690.00",
    //   "planType": "GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "4GB",
    //   "planId": "59",
    //   "amount": "1100.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "5GB",
    //   "planId": "23",
    //   "amount": "1376.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "5GB",
    //   "planId": "65",
    //   "amount": "1151.00",
    //   "planType": "GIFTING",
    //   "network": "MTN"
    // },
    {
      "planName": "7GB",
      "planId": "43",
      "amount": "3071.00",
      "planType": "GIFTING PROMO",
      "network": "MTN"
    },
    {
      "planName": "10GB",
      "planId": "6",
      "amount": "6102.00",
      "planType": "SME",
      "network": "MTN"
    },
    // {
    //   "planName": "10GB",
    //   "planId": "24",
    //   "amount": "2752.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "400GB",
    //   "planId": "62",
    //   "amount": "53096.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // },
    // {
    //   "planName": "1TB",
    //   "planId": "40",
    //   "amount": "107485.00",
    //   "planType": "COOPERATE GIFTING",
    //   "network": "MTN"
    // }
  ]