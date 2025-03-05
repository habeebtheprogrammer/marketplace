const { checkDaysMatch } = require("./utils/helpers");
const fs = require('fs');

const unfilteredplans = {
    "quickvtu": [
        {
            "plan_name": "500MB",
            "plan_id": "4",
            "amount": "313.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "5",
            "amount": "625.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "6",
            "amount": "1,250.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "3GB",
            "plan_id": "7",
            "amount": "1,875.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "10GB",
            "plan_id": "9",
            "amount": "6,250.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "7GB",
            "plan_id": "10",
            "amount": "3,030.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "7days Validity (Data 4 Us)",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "14",
            "amount": "365.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1day Validity (Data 4 Us)",
            "network": "MTN"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "15",
            "amount": "415.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1day Validity (Data 4 Us)",
            "network": "MTN"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "16",
            "amount": "1,070.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "7day Validity (Data 4 Us)",
            "network": "MTN"
        },
        {
            "plan_name": "3.2GB",
            "plan_id": "17",
            "amount": "1,070.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "2days validity (Data 4 Us)",
            "network": "MTN"
        },
        {
            "plan_name": "5GB",
            "plan_id": "18",
            "amount": "1,550.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "7days Validity (Data 4 Us)",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "19",
            "amount": "313.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "20",
            "amount": "600.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "21",
            "amount": "1,200.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "AIRTEL"
        },
        {
            "plan_name": "5GB",
            "plan_id": "22",
            "amount": "3,000.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "AIRTEL"
        },
        {
            "plan_name": "10GB",
            "plan_id": "23",
            "amount": "6,000.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "24",
            "amount": "465.00",
            "plan_type": "GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "2.9GB",
            "plan_id": "25",
            "amount": "940.00",
            "plan_type": "GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "4.1GB",
            "plan_id": "26",
            "amount": "1,300.00",
            "plan_type": "GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "5.8GB",
            "plan_id": "27",
            "amount": "1,860.00",
            "plan_type": "GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "10GB",
            "plan_id": "28",
            "amount": "3,020.00",
            "plan_type": "GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "1.1GB",
            "plan_id": "29",
            "amount": "399.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "9MOBILE"
        },
        {
            "plan_name": "2GB",
            "plan_id": "30",
            "amount": "760.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "9MOBILE"
        },
        {
            "plan_name": "300MB",
            "plan_id": "31",
            "amount": "210.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "100MB",
            "plan_id": "32",
            "amount": "150.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "33",
            "amount": "900.00",
            "plan_type": "GIFTING",
            "plan_day": "1Month",
            "network": "9MOBILE"
        },
        {
            "plan_name": "500MB",
            "plan_id": "34",
            "amount": "450.00",
            "plan_type": "GIFTING",
            "plan_day": "1 Month",
            "network": "9MOBILE"
        },
        {
            "plan_name": "500MB",
            "plan_id": "36",
            "amount": "208.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "1GB",
            "plan_id": "37",
            "amount": "415.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "2GB",
            "plan_id": "38",
            "amount": "830.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "3GB",
            "plan_id": "39",
            "amount": "1,245.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "5GB",
            "plan_id": "40",
            "amount": "2,075.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "500MB",
            "plan_id": "41",
            "amount": "145.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "9MOBILE"
        },
        {
            "plan_name": "1GB",
            "plan_id": "42",
            "amount": "280.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "9MOBILE"
        },
        {
            "plan_name": "2GB",
            "plan_id": "43",
            "amount": "560.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "9MOBILE"
        },
        {
            "plan_name": "3GB",
            "plan_id": "44",
            "amount": "840.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "9MOBILE"
        },
        {
            "plan_name": "4GB",
            "plan_id": "45",
            "amount": "1,120.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "9MOBILE"
        },
        {
            "plan_name": "5GB",
            "plan_id": "46",
            "amount": "1,400.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "9MOBILE"
        },
        {
            "plan_name": "10GB",
            "plan_id": "47",
            "amount": "4,150.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "600MB",
            "plan_id": "51",
            "amount": "225.00",
            "plan_type": "GIFTING",
            "plan_day": "Awoof 2days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "5GB",
            "plan_id": "52",
            "amount": "1,230.00",
            "plan_type": "GIFTING",
            "plan_day": "Awoof 14days  validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3GB",
            "plan_id": "53",
            "amount": "1,030.00",
            "plan_type": "GIFTING",
            "plan_day": "Awoof 7days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "7GB",
            "plan_id": "54",
            "amount": "2,080.00",
            "plan_type": "GIFTING",
            "plan_day": "Awoof 30days don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "10GB",
            "plan_id": "56",
            "amount": "3,130.00",
            "plan_type": "GIFTING",
            "plan_day": "Awoof 30days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "58",
            "amount": "325.00",
            "plan_type": "GIFTING",
            "plan_day": "Awoof 2days Validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "150MB",
            "plan_id": "59",
            "amount": "70.00",
            "plan_type": "SME",
            "plan_day": "1day validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "300MB",
            "plan_id": "60",
            "amount": "130.00",
            "plan_type": "SME",
            "plan_day": "2days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "61",
            "amount": "293.00",
            "plan_type": "SME",
            "plan_day": "7days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3GB",
            "plan_id": "62",
            "amount": "1,070.00",
            "plan_type": "SME",
            "plan_day": "7days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "7GB",
            "plan_id": "63",
            "amount": "2,075.00",
            "plan_type": "SME",
            "plan_day": "30days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "10GB",
            "plan_id": "64",
            "amount": "3,070.00",
            "plan_type": "SME",
            "plan_day": "30days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "65",
            "amount": "210.00",
            "plan_type": "SME",
            "plan_day": "1DAY VALIDITY",
            "network": "GLO"
        },
        {
            "plan_name": "2GB",
            "plan_id": "66",
            "amount": "310.00",
            "plan_type": "SME",
            "plan_day": "1DAY VALIDITY",
            "network": "GLO"
        },
        {
            "plan_name": "3.5GB",
            "plan_id": "67",
            "amount": "500.00",
            "plan_type": "SME",
            "plan_day": "2DAYS VALIDITY",
            "network": "GLO"
        },
        {
            "plan_name": "2.5GB",
            "plan_id": "69",
            "amount": "540.00",
            "plan_type": "GIFTING",
            "plan_day": "Awoof 2days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "70",
            "amount": "260.00",
            "plan_type": "GIFTING",
            "plan_day": "7days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3.5GB",
            "plan_id": "71",
            "amount": "870.00",
            "plan_type": "GIFTING",
            "plan_day": "1day validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "12GB",
            "plan_id": "72",
            "amount": "3,490.00",
            "plan_type": "GIFTING",
            "plan_day": "Awoof 30days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "73",
            "amount": "650.00",
            "plan_type": "GIFTING",
            "plan_day": "1day + 3minute",
            "network": "MTN"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "74",
            "amount": "400.00",
            "plan_type": "GIFTING",
            "plan_day": "1day Validity",
            "network": "MTN"
        },
        {
            "plan_name": "3.2GB",
            "plan_id": "75",
            "amount": "1,000.00",
            "plan_type": "GIFTING",
            "plan_day": "2days Validity",
            "network": "MTN"
        },
        {
            "plan_name": "5GB",
            "plan_id": "76",
            "amount": "1,495.00",
            "plan_type": "GIFTING",
            "plan_day": "7days Validity",
            "network": "MTN"
        },
        {
            "plan_name": "7GB",
            "plan_id": "77",
            "amount": "3,040.00",
            "plan_type": "GIFTING",
            "plan_day": "7days Validity",
            "network": "MTN"
        },
    ],
    "bilal":  [
        {
            "plan_name": "500MB",
            "plan_id": "1",
            "amount": "305.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "2",
            "amount": "605.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "3",
            "amount": "1,210.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "3GB",
            "plan_id": "4",
            "amount": "1,815.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "10GB",
            "plan_id": "6",
            "amount": "6,050.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "7",
            "amount": "295.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "8",
            "amount": "590.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "9",
            "amount": "1,180.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "5GB",
            "plan_id": "10",
            "amount": "2,950.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "11",
            "amount": "460.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "2.9GB",
            "plan_id": "12",
            "amount": "940.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "4.1GB",
            "plan_id": "13",
            "amount": "1,290.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "5.8GB",
            "plan_id": "14",
            "amount": "1,850.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "10GB",
            "plan_id": "15",
            "amount": "3,030.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "50MB",
            "plan_id": "16",
            "amount": "30.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "150MB",
            "plan_id": "17",
            "amount": "80.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "250MB",
            "plan_id": "18",
            "amount": "90.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "19",
            "amount": "133.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "20",
            "amount": "265.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "21",
            "amount": "530.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "3GB",
            "plan_id": "22",
            "amount": "795.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "5GB",
            "plan_id": "23",
            "amount": "1,325.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "10GB",
            "plan_id": "24",
            "amount": "2,650.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "1.1GB",
            "plan_id": "25",
            "amount": "400.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "10GB",
            "plan_id": "26",
            "amount": "5,900.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "27",
            "amount": "880.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "500MB",
            "plan_id": "28",
            "amount": "450.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "200MB",
            "plan_id": "29",
            "amount": "100.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "500MB",
            "plan_id": "30",
            "amount": "203.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "1GB",
            "plan_id": "31",
            "amount": "405.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "2GB",
            "plan_id": "32",
            "amount": "810.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "3GB",
            "plan_id": "33",
            "amount": "1,215.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "5GB",
            "plan_id": "34",
            "amount": "2,025.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "10GB",
            "plan_id": "35",
            "amount": "4,050.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days after redeeming",
            "network": "GLO"
        },
        {
            "plan_name": "5GB",
            "plan_id": "36",
            "amount": "1,500.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7days",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "37",
            "amount": "350.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "24hours and 3 mins call",
            "network": "MTN"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "38",
            "amount": "400.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "1 day",
            "network": "MTN"
        }, 
        {
            "plan_name": "1TB",
            "plan_id": "40",
            "amount": "97,000.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "Yearly",
            "network": "MTN"
        },
        {
            "plan_name": "3.2GB",
            "plan_id": "42",
            "amount": "1,000.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "48hours",
            "network": "MTN"
        },
        {
            "plan_name": "7GB",
            "plan_id": "43",
            "amount": "3,000.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7days",
            "network": "MTN"
        },
        {
            "plan_name": "300MB",
            "plan_id": "44",
            "amount": "200.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "100MB",
            "plan_id": "45",
            "amount": "100.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "500MB",
            "plan_id": "46",
            "amount": "137.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30 days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "1GB",
            "plan_id": "47",
            "amount": "275.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "2GB",
            "plan_id": "48",
            "amount": "550.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "3GB",
            "plan_id": "49",
            "amount": "825.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "4GB",
            "plan_id": "50",
            "amount": "1,100.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "5GB",
            "plan_id": "51",
            "amount": "1,375.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "10GB",
            "plan_id": "52",
            "amount": "2,750.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "750MB",
            "plan_id": "53",
            "amount": "480.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "54",
            "amount": "1,000.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "55",
            "amount": "1,200.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3GB",
            "plan_id": "56",
            "amount": "1,500.00",
            "plan_type": "GIFTING",
            "plan_day": "1500",
            "network": "AIRTEL"
        },
        {
            "plan_name": "4.5GB",
            "plan_id": "57",
            "amount": "2,000.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "11GB",
            "plan_id": "58",
            "amount": "4,000.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "4GB",
            "plan_id": "59",
            "amount": "1,060.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "60",
            "amount": "397.50",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "61",
            "amount": "340.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1day and 3minutes call",
            "network": "MTN"
        },
        {
            "plan_name": "400GB",
            "plan_id": "62",
            "amount": "49,000.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "90 days plan",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "63",
            "amount": "420.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "3GB",
            "plan_id": "64",
            "amount": "660.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "5GB",
            "plan_id": "65",
            "amount": "1,100.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "66",
            "amount": "130.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "150MB",
            "plan_id": "67",
            "amount": "70.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "1 day",
            "network": "AIRTEL"
        },
        {
            "plan_name": "300MB",
            "plan_id": "68",
            "amount": "130.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "2 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "69",
            "amount": "290.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "2 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "70",
            "amount": "560.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "2 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3GB",
            "plan_id": "71",
            "amount": "1,065.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "7GB",
            "plan_id": "72",
            "amount": "2,065.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "10GB",
            "plan_id": "73",
            "amount": "3,070.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3GB",
            "plan_id": "75",
            "amount": "1,770.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "76",
            "amount": "200.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "24hours",
            "network": "GLO"
        },
        {
            "plan_name": "2GB",
            "plan_id": "77",
            "amount": "300.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "24hours",
            "network": "GLO"
        },
        {
            "plan_name": "3.5GB",
            "plan_id": "78",
            "amount": "500.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "2 days",
            "network": "GLO"
        }, 
    ],
    // "mobilevtu": [
    //         {
    //             "plan": "150.00",
    //             "label": "150MB",
    //             "validity": "30",
    //             "price": "50",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "250.00",
    //             "label": "250MB",
    //             "validity": "30",
    //             "price": "110",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "500.0",
    //             "label": "500MB",
    //             "validity": "30",
    //             "price": "200",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "1000.0",
    //             "label": "1GB ",
    //             "validity": "30",
    //             "price": "320",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "2000.0",
    //             "label": "2GB",
    //             "validity": "30",
    //             "price": "650",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "3000.0",
    //             "label": "3GB",
    //             "validity": "30",
    //             "price": "1200",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "5000.0",
    //             "label": "5GB",
    //             "validity": "30",
    //             "price": "1500",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         }, 
    //         {
    //             "plan": "10000.0",
    //             "label": "10GB",
    //             "validity": "30",
    //             "price": "3000",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "6000.02",
    //             "label": "13GB",
    //             "validity": "30",
    //             "price": "4000",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         }, 
    //         {
    //             "plan": "40000.01",
    //             "label": "27GB",
    //             "validity": "30",
    //             "price": "6500",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "25000.00",
    //             "label": "25GB",
    //             "validity": "30",
    //             "price": "7000",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "50000.00",
    //             "label": "50GB",
    //             "validity": "30",
    //             "price": "14000",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "120000.01",
    //             "label": "75GB",
    //             "validity": "30",
    //             "price": "15100",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "3000.06",
    //             "label": "120GB",
    //             "validity": "30",
    //             "price": "21560",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "100000.00",
    //             "label": "100GB",
    //             "validity": "30",
    //             "price": "27000",
    //             "operator": "MTN",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "50",
    //             "label": "50MB",
    //             "validity": "30",
    //             "price": "15",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "100",
    //             "label": "100 MB",
    //             "validity": "30",
    //             "price": "25",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "500",
    //             "label": "500 MB",
    //             "validity": "30",
    //             "price": "110",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "1000",
    //             "label": "1 GB",
    //             "validity": "30",
    //             "price": "200",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "5000",
    //             "label": "5 GB",
    //             "validity": "30",
    //             "price": "900",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "1500.01",
    //             "label": "1.5GB",
    //             "validity": "30",
    //             "price": "1050",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "2000.01",
    //             "label": "2GB",
    //             "validity": "30",
    //             "price": "1250",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "3000.01",
    //             "label": "7GB",
    //             "validity": "7",
    //             "price": "1600",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "10000",
    //             "label": "10 GB",
    //             "validity": "30",
    //             "price": "1800",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "4500.01",
    //             "label": "4.5GB",
    //             "validity": "30",
    //             "price": "2050",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "11000.01",
    //             "label": "11GB",
    //             "validity": "30",
    //             "price": "4000",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "15000.01",
    //             "label": "15GB",
    //             "validity": "30",
    //             "price": "5200",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "40000.01",
    //             "label": "40GB",
    //             "validity": "30",
    //             "price": "10500",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "75000.01",
    //             "label": "75GB",
    //             "validity": "30",
    //             "price": "16000",
    //             "operator": "9mobile",
    //             "currency": "NGN"
    //         }, 
    //         {
    //             "plan": "10000",
    //             "label": "10GB",
    //             "validity": "30",
    //             "price": "3000",
    //             "operator": "Airtel",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "2999.02",
    //             "label": "8GB",
    //             "validity": "30",
    //             "price": "3200",
    //             "operator": "Airtel",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "15000",
    //             "label": "15GB",
    //             "validity": "30",
    //             "price": "4000",
    //             "operator": "Airtel",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "20000",
    //             "label": "20GB",
    //             "validity": "30",
    //             "price": "5000",
    //             "operator": "Airtel",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "9999.00",
    //             "label": "40GB",
    //             "validity": "30",
    //             "price": "10100",
    //             "operator": "Airtel",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "14999.00",
    //             "label": "75GB",
    //             "validity": "30",
    //             "price": "16000",
    //             "operator": "Airtel",
    //             "currency": "NGN"
    //         },
    //         {
    //             "plan": "19999.02",
    //             "label": "110GB",
    //             "validity": "30",
    //             "price": "20500",
    //             "operator": "Airtel",
    //             "currency": "NGN"
    //         }, 
    //     ]
}

var plans = unfilteredplans.quickvtu.map(plan => {
    const mbSize = convertToMB(plan.plan_name);
    const hundreds = Math.floor(mbSize / 100);
    const originalAmount = parseFloat(plan.amount.replace(',', ''));
    const newAmount = originalAmount + hundreds;

    return {
        planName: plan.plan_name,
        planId: plan.plan_id,
        amount: newAmount.toFixed(2) ,
        planType: plan.plan_type ,
        duration: checkDaysMatch(plan.plan_day) ,
        network: plan.network ,
        vendor: 'quickvtu'
    };
})

unfilteredplans.bilal.map(plan => {
    const mbSize = convertToMB(plan.plan_name);
    const hundreds = Math.floor(mbSize / 100);
    const originalAmount = parseFloat(plan.amount.replace(",",""));
    const newAmount = originalAmount + hundreds;
    console.log( newAmount.toFixed(2), originalAmount, plan.amount)
    plans.push({
        planName: plan.plan_name,
        planId: plan.plan_id,
        amount: newAmount.toFixed(2),
        planType: plan.plan_type,
        duration: checkDaysMatch(plan.plan_day),
        network: plan.network,
        vendor: 'bilal'
    })
})


unfilteredplans?.mobilevtu?.map(plan => {

    const mbSize = convertToMB(plan.label.replace(/[" "]/g, "") );
    const hundreds = Math.floor(mbSize / 100);
    const originalAmount = parseFloat(plan.price.replace(',', ''));
    const newAmount = originalAmount + hundreds;

    plans.push({
        planName: plan.label.replace(/[" "]/g, "") ,
        planId:  plan.plan,
        amount:  newAmount.toFixed(2) ,
        planType: "PROMO",
        duration: checkDaysMatch(plan.validity + ' Days. Could take a few min to arrive.') ,
        network:  plan.operator.toUpperCase(),
        vendor: 'mobilevtu'
    })
})
// Function to convert data size to MB
function convertToMB(size) {
    const value = parseFloat(size);
    if (size.includes('TB')) return value * 1024 * 1024; // TB to MB
    if (size.includes('GB')) return value * 1024; // GB to MB
    if (size.includes('MB')) return value; // Already in MB
    return 0; // Invalid size
}


function parseDataSize(planName) {
    const match = planName.match(/([\d.]+)(TB|GB|MB)/i); // Supports decimals

    if (!match) return 0;
    let size = parseFloat(match[1]);
    if (match[2].toUpperCase() === 'TB') {
        size *= 1024 * 1024; // Convert TB to MB
    } else if (match[2].toUpperCase() === 'GB') {
        size *= 1024; // Convert GB to MB
    }
    return size;
}

function sortByPlanNameAndNetwork(plans) {
    return plans.sort((a, b) => {
        // First, sort by network name alphabetically
        const networkComparison = a.network.localeCompare(b.network);
        if (networkComparison !== 0) {
            return networkComparison;
        }

        // Then, sort by data size numerically
        const sizeA = parseDataSize(a.planName);
        const sizeB = parseDataSize(b.planName);
        return sizeA - sizeB;
    });
}


function removePlans(plans, filters) {
    return plans.filter(plan => {
        return !filters.some(filter =>
            plan.vendor === filter.vendor &&
            plan.network === filter.network &&
            plan.planType === filter.planToRemove
        );
    });
}


const filters = [
    { vendor: 'quickvtu', network: 'GLO', planToRemove: 'GIFTING' },
    { vendor: 'quickvtu', network: 'GLO', planToRemove: 'SME' },
    { vendor: 'quickvtu', network: 'GLO', planToRemove: 'GIFTING PROMO' },
    { vendor: 'quickvtu', network: '9MOBILE', planToRemove: 'GIFTING' },
    { vendor: 'quickvtu', network: '9MOBILE', planToRemove: 'SME' },
    { vendor: 'quickvtu', network: 'AIRTEL', planToRemove: 'COOPERATE GIFTING' },
    { vendor: 'bilal', network: 'MTN', planToRemove: 'GIFTING' },
    { vendor: 'bilal', network: 'MTN', planToRemove: 'COOPERATE GIFTING' },
    { vendor: 'bilal', network: 'AIRTEL', planToRemove: 'GIFTING' },
    { vendor: 'bilal', network: 'AIRTEL', planToRemove: 'SME' },
    { vendor: 'bilal', network: '9MOBILE', planToRemove: 'GIFTING' },
    { vendor: 'bilal', network: '9MOBILE', planToRemove: 'SME' },
    { vendor: 'bilal', network: '9MOBILE', planToRemove: 'GIFTING PROMO' },
];

const filteredPlans = removePlans(plans, filters);
const sortedPlans = sortByPlanNameAndNetwork(filteredPlans);

fs.writeFileSync('dataplan.json', JSON.stringify(sortedPlans, null, 2));

// Output the filtered results