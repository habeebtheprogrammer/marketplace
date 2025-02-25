// Function to convert data size to MB
function convertToMB(size) {
    const value = parseFloat(size);
    if (size.includes('TB')) return value * 1024 * 1024; // TB to MB
    if (size.includes('GB')) return value * 1024; // GB to MB
    if (size.includes('MB')) return value; // Already in MB
    return 0; // Invalid size
  }
  
  const plans = [
    {
        "planName": "500MB",
        "planId": "1",
        "amount": "300.00",
        "planType": "SME",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "1GB",
        "planId": "2",
        "amount": "600.00",
        "planType": "SME",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "2GB",
        "planId": "3",
        "amount": "1,200.00",
        "planType": "SME",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "3GB",
        "planId": "4",
        "amount": "1,800.00",
        "planType": "SME",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "10GB",
        "planId": "6",
        "amount": "6,000.00",
        "planType": "SME",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "500MB",
        "planId": "7",
        "amount": "272.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "1GB",
        "planId": "8",
        "amount": "544.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "2GB",
        "planId": "9",
        "amount": "1,088.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "5GB",
        "planId": "10",
        "amount": "2,720.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "1.5GB",
        "planId": "11",
        "amount": "460.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "GLO"
    },
    {
        "planName": "2.9GB",
        "planId": "12",
        "amount": "940.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "GLO"
    },
    {
        "planName": "4.1GB",
        "planId": "13",
        "amount": "1,290.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "GLO"
    },
    {
        "planName": "5.8GB",
        "planId": "14",
        "amount": "1,850.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "GLO"
    },
    {
        "planName": "10GB",
        "planId": "15",
        "amount": "3,030.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "GLO"
    },
    {
        "planName": "50MB",
        "planId": "16",
        "amount": "30.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "150MB",
        "planId": "17",
        "amount": "80.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "250MB",
        "planId": "18",
        "amount": "90.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "500MB",
        "planId": "19",
        "amount": "133.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30 days",
        "network": "MTN"
    },
    {
        "planName": "1GB",
        "planId": "20",
        "amount": "265.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30 days",
        "network": "MTN"
    },
    {
        "planName": "2GB",
        "planId": "21",
        "amount": "530.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "3GB",
        "planId": "22",
        "amount": "795.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30 days",
        "network": "MTN"
    },
    {
        "planName": "5GB",
        "planId": "23",
        "amount": "1,325.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "10GB",
        "planId": "24",
        "amount": "2,650.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "1.1GB",
        "planId": "25",
        "amount": "400.00",
        "planType": "SME",
        "planDuration": "30days",
        "network": "9MOBILE"
    },
    {
        "planName": "10GB",
        "planId": "26",
        "amount": "5,440.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "1.5GB",
        "planId": "27",
        "amount": "880.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "9MOBILE"
    },
    {
        "planName": "500MB",
        "planId": "28",
        "amount": "450.00",
        "planType": "GIFTING",
        "planDuration": "30 days",
        "network": "9MOBILE"
    },
    {
        "planName": "200MB",
        "planId": "29",
        "amount": "60.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "GLO"
    },
    {
        "planName": "500MB",
        "planId": "30",
        "amount": "147.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30 days",
        "network": "GLO"
    },
    {
        "planName": "1GB",
        "planId": "31",
        "amount": "295.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30 days",
        "network": "GLO"
    },
    {
        "planName": "2GB",
        "planId": "32",
        "amount": "540.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "GLO"
    },
    {
        "planName": "3GB",
        "planId": "33",
        "amount": "810.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "GLO"
    },
    {
        "planName": "5GB",
        "planId": "34",
        "amount": "1,335.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "GLO"
    },
    {
        "planName": "10GB",
        "planId": "35",
        "amount": "2,670.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days after redeeming",
        "network": "GLO"
    },
    {
        "planName": "2GB",
        "planId": "38",
        "amount": "498.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "1GB",
        "planId": "39",
        "amount": "252.00",
        "planType": "GIFTING",
        "planDuration": "30 days",
        "network": "MTN"
    },
    {
        "planName": "1TB",
        "planId": "40",
        "amount": "97,000.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "Yearly",
        "network": "MTN"
    },
    {
        "planName": "7GB",
        "planId": "43",
        "amount": "3,000.00",
        "planType": "GIFTING PROMO",
        "planDuration": "7days",
        "network": "MTN"
    },
    {
        "planName": "300MB",
        "planId": "44",
        "amount": "200.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "100MB",
        "planId": "45",
        "amount": "100.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "500MB",
        "planId": "46",
        "amount": "70.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30 days",
        "network": "9MOBILE"
    },
    {
        "planName": "1GB",
        "planId": "47",
        "amount": "137.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "9MOBILE"
    },
    {
        "planName": "2GB",
        "planId": "48",
        "amount": "280.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "9MOBILE"
    },
    {
        "planName": "3GB",
        "planId": "49",
        "amount": "420.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "9MOBILE"
    },
    {
        "planName": "4GB",
        "planId": "50",
        "amount": "660.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "9MOBILE"
    },
    {
        "planName": "5GB",
        "planId": "51",
        "amount": "825.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "9MOBILE"
    },
    {
        "planName": "10GB",
        "planId": "52",
        "amount": "1,650.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "9MOBILE"
    },
    {
        "planName": "750MB",
        "planId": "53",
        "amount": "480.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "1.5GB",
        "planId": "54",
        "amount": "1,000.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "2GB",
        "planId": "55",
        "amount": "1,200.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "3GB",
        "planId": "56",
        "amount": "1,500.00",
        "planType": "GIFTING",
        "planDuration": "1500",
        "network": "AIRTEL"
    },
    {
        "planName": "4.5GB",
        "planId": "57",
        "amount": "2,000.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "11GB",
        "planId": "58",
        "amount": "4,000.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "4GB",
        "planId": "59",
        "amount": "1,060.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "1.5GB",
        "planId": "60",
        "amount": "397.50",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "1GB",
        "planId": "61",
        "amount": "340.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "1day and 3minutes call",
        "network": "MTN"
    },
    {
        "planName": "400GB",
        "planId": "62",
        "amount": "49,000.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "90 days plan",
        "network": "MTN"
    },
    {
        "planName": "2GB",
        "planId": "63",
        "amount": "420.00",
        "planType": "GIFTING",
        "planDuration": "30 days",
        "network": "MTN"
    },
    {
        "planName": "3GB",
        "planId": "64",
        "amount": "660.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "5GB",
        "planId": "65",
        "amount": "1,100.00",
        "planType": "GIFTING",
        "planDuration": "30 days",
        "network": "MTN"
    },
    {
        "planName": "500MB",
        "planId": "66",
        "amount": "130.00",
        "planType": "GIFTING",
        "planDuration": "30days",
        "network": "MTN"
    },
    {
        "planName": "150MB",
        "planId": "67",
        "amount": "70.00",
        "planType": "GIFTING PROMO",
        "planDuration": "1 day",
        "network": "AIRTEL"
    },
    {
        "planName": "300MB",
        "planId": "68",
        "amount": "130.00",
        "planType": "GIFTING PROMO",
        "planDuration": "2 days",
        "network": "AIRTEL"
    },
    {
        "planName": "1GB",
        "planId": "69",
        "amount": "290.00",
        "planType": "GIFTING PROMO",
        "planDuration": "2 days",
        "network": "AIRTEL"
    },
    {
        "planName": "2GB",
        "planId": "70",
        "amount": "560.00",
        "planType": "GIFTING PROMO",
        "planDuration": "2 days",
        "network": "AIRTEL"
    },
    {
        "planName": "3GB",
        "planId": "71",
        "amount": "1,065.00",
        "planType": "GIFTING PROMO",
        "planDuration": "7 days",
        "network": "AIRTEL"
    },
    {
        "planName": "7GB",
        "planId": "72",
        "amount": "2,065.00",
        "planType": "GIFTING PROMO",
        "planDuration": "7days",
        "network": "AIRTEL"
    },
    {
        "planName": "10GB",
        "planId": "73",
        "amount": "3,070.00",
        "planType": "GIFTING PROMO",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "20GB",
        "planId": "74",
        "amount": "4,050.00",
        "planType": "GIFTING PROMO",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "3GB",
        "planId": "75",
        "amount": "816.00",
        "planType": "COOPERATE GIFTING",
        "planDuration": "30days",
        "network": "AIRTEL"
    },
    {
        "planName": "1GB",
        "planId": "76",
        "amount": "200.00",
        "planType": "GIFTING PROMO",
        "planDuration": "24hours",
        "network": "GLO"
    },
    {
        "planName": "2GB",
        "planId": "77",
        "amount": "300.00",
        "planType": "GIFTING PROMO",
        "planDuration": "24hours",
        "network": "GLO"
    },
    {
        "planName": "3.5GB",
        "planId": "78",
        "amount": "500.00",
        "planType": "GIFTING PROMO",
        "planDuration": "2 days",
        "network": "GLO"
    },
    {
        "planName": "15GB",
        "planId": "79",
        "amount": "1,950.00",
        "planType": "GIFTING PROMO",
        "planDuration": "7 days",
        "network": "GLO"
    }
]
  
  // Process and sort plans
  const processedPlans = plans
    .map(plan => {
      const mbSize = convertToMB(plan.planName);
      const hundreds = Math.floor(mbSize / 100);
      const originalAmount = parseFloat(plan.amount.replace(',', ''));
      const newAmount = originalAmount + hundreds;
      
      return {
        planName: plan.planName,
        planId: plan.planId,
        amount: newAmount.toFixed(2),
        planType: plan.planType,
        duration: plan.duration,
        network: plan.network
      };
    })
    .sort((a, b) => {
      // First sort by network
      if (a.network < b.network) return -1;
      if (a.network > b.network) return 1;
      
      // Then sort by data size (converted to MB for accurate sorting)
      const aMB = convertToMB(a.planName);
      const bMB = convertToMB(b.planName);
      return aMB - bMB;
    });
  
  // Group by network for cleaner output
  const groupedPlans = processedPlans.reduce((acc, plan) => {
    if (!acc[plan.network]) {
      acc[plan.network] = [];
    }
    acc[plan.network].push(plan);
    return acc;
  }, {});
  
  // Output the grouped and sorted JSON
  console.log(JSON.stringify(groupedPlans, null, 2));