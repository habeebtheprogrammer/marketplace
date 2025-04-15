const { checkDaysMatch } = require("./utils/helpers");
const fs = require('fs');

const unfilteredplans = {
    "quickvtu": [
        {
            "plan_name": "1GB",
            "plan_id": "5",
            "amount": "830.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "6",
            "amount": "1,660.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "3GB",
            "plan_id": "7",
            "amount": "2,490.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "5GB",
            "plan_id": "8",
            "amount": "4,150.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "19",
            "amount": "460.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "20",
            "amount": "920.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "21",
            "amount": "1,840.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "AIRTEL"
        },
        {
            "plan_name": "5GB",
            "plan_id": "22",
            "amount": "4,600.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "AIRTEL"
        },
        {
            "plan_name": "10GB",
            "plan_id": "23",
            "amount": "9,200.00",
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
            "plan_name": "200MB",
            "plan_id": "35",
            "amount": "95.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "500MB",
            "plan_id": "36",
            "amount": "213.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "1GB",
            "plan_id": "37",
            "amount": "425.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "2GB",
            "plan_id": "38",
            "amount": "850.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "3GB",
            "plan_id": "39",
            "amount": "1,275.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "5GB",
            "plan_id": "40",
            "amount": "2,125.00",
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
            "amount": "4,250.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1Month",
            "network": "GLO"
        },
        {
            "plan_name": "600MB",
            "plan_id": "51",
            "amount": "250.00",
            "plan_type": "SME",
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
            "amount": "2,060.00",
            "plan_type": "GIFTING",
            "plan_day": "Awoof 30days don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "10GB",
            "plan_id": "56",
            "amount": "3,100.00",
            "plan_type": "GIFTING",
            "plan_day": "Awoof 30days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "58",
            "amount": "570.00",
            "plan_type": "SME",
            "plan_day": "Awoof 2days Validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "150MB",
            "plan_id": "59",
            "amount": "75.00",
            "plan_type": "SME",
            "plan_day": "1day validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "300MB",
            "plan_id": "60",
            "amount": "140.00",
            "plan_type": "SME",
            "plan_day": "2days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "61",
            "amount": "370.00",
            "plan_type": "SME",
            "plan_day": "3days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3GB",
            "plan_id": "62",
            "amount": "1,150.00",
            "plan_type": "SME",
            "plan_day": "7days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "7GB",
            "plan_id": "63",
            "amount": "2,150.00",
            "plan_type": "SME",
            "plan_day": "7days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "10GB",
            "plan_id": "64",
            "amount": "3,150.00",
            "plan_type": "SME",
            "plan_day": "30days validity don't buy if owing",
            "network": "AIRTEL"
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
            "amount": "3,460.00",
            "plan_type": "GIFTING",
            "plan_day": "Awoof 30days validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "750MB",
            "plan_id": "79",
            "amount": "205.00",
            "plan_type": "SME",
            "plan_day": "1day validty",
            "network": "GLO"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "80",
            "amount": "305.00",
            "plan_type": "SME",
            "plan_day": "1day validty",
            "network": "GLO"
        },
        {
            "plan_name": "2.5GB",
            "plan_id": "81",
            "amount": "495.00",
            "plan_type": "SME",
            "plan_day": "2days validity",
            "network": "GLO"
        },
        {
            "plan_name": "10GB",
            "plan_id": "82",
            "amount": "1,980.00",
            "plan_type": "SME",
            "plan_day": "7days validity",
            "network": "GLO"
        },
        {
            "plan_name": "75MB",
            "plan_id": "83",
            "amount": "75.00",
            "plan_type": "GIFTING",
            "plan_day": "1day Validity",
            "network": "MTN"
        },
        {
            "plan_name": "230MB",
            "plan_id": "84",
            "amount": "200.00",
            "plan_type": "GIFTING",
            "plan_day": "1day validity",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "85",
            "amount": "490.00",
            "plan_type": "GIFTING",
            "plan_day": "1day validity",
            "network": "MTN"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "86",
            "amount": "552.00",
            "plan_type": "GIFTING",
            "plan_day": "2days validity",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "87",
            "amount": "735.00",
            "plan_type": "GIFTING",
            "plan_day": "2days validity",
            "network": "MTN"
        },
        {
            "plan_name": "2.5GB",
            "plan_id": "88",
            "amount": "883.00",
            "plan_type": "GIFTING",
            "plan_day": "1days validity",
            "network": "MTN"
        },
        {
            "plan_name": "2.5GB",
            "plan_id": "89",
            "amount": "877.00",
            "plan_type": "GIFTING",
            "plan_day": "2days validity",
            "network": "MTN"
        },
        {
            "plan_name": "3.2GB",
            "plan_id": "90",
            "amount": "970.00",
            "plan_type": "GIFTING",
            "plan_day": "2days validity",
            "network": "MTN"
        },
        {
            "plan_name": "6GB",
            "plan_id": "91",
            "amount": "2,445.00",
            "plan_type": "GIFTING",
            "plan_day": "7days validity",
            "network": "MTN"
        },
        {
            "plan_name": "11GB",
            "plan_id": "92",
            "amount": "3,420.00",
            "plan_type": "GIFTING",
            "plan_day": "7days validity",
            "network": "MTN"
        },
        {
            "plan_name": "10GB",
            "plan_id": "93",
            "amount": "4,400.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity + 10mins",
            "network": "MTN"
        },
        {
            "plan_name": "12.5GB",
            "plan_id": "94",
            "amount": "5,335.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "MTN"
        },
        {
            "plan_name": "16.5GB",
            "plan_id": "95",
            "amount": "6,305.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "MTN"
        },
        {
            "plan_name": "20GB",
            "plan_id": "96",
            "amount": "7,275.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "MTN"
        },
        {
            "plan_name": "25GB",
            "plan_id": "97",
            "amount": "8,730.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "MTN"
        },
        {
            "plan_name": "36GB",
            "plan_id": "98",
            "amount": "10,670.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "MTN"
        },
        {
            "plan_name": "75GB",
            "plan_id": "99",
            "amount": "17,460.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "MTN"
        },
        {
            "plan_name": "165GB",
            "plan_id": "100",
            "amount": "33,950.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "MTN"
        },
        {
            "plan_name": "250GB",
            "plan_id": "102",
            "amount": "53,350.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "1.2GB",
            "plan_id": "103",
            "amount": "730.00",
            "plan_type": "GIFTING",
            "plan_day": "7days validity",
            "network": "MTN"
        },
        {
            "plan_name": "2.7GB",
            "plan_id": "104",
            "amount": "1,940.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "4.25GB",
            "plan_id": "105",
            "amount": "2,910.00",
            "plan_type": "GIFTING",
            "plan_day": "30days validity",
            "network": "MTN"
        },
        {
            "plan_name": "7GB",
            "plan_id": "107",
            "amount": "3,410.00",
            "plan_type": "GIFTING",
            "plan_day": "30days validity",
            "network": "MTN"
        },
        {
            "plan_name": "480GB",
            "plan_id": "108",
            "amount": "87,300.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "3Month validity",
            "network": "MTN"
        },
        {
            "plan_name": "3.5GB",
            "plan_id": "109",
            "amount": "2,435.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity + 5Mins",
            "network": "MTN"
        },
        {
            "plan_name": "110MB",
            "plan_id": "110",
            "amount": "98.00",
            "plan_type": "GIFTING",
            "plan_day": "1day validity",
            "network": "MTN"
        },
        {
            "plan_name": "90GB",
            "plan_id": "111",
            "amount": "24,250.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "60days validity",
            "network": "MTN"
        },
        {
            "plan_name": "14.5GB",
            "plan_id": "112",
            "amount": "4,850.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "113",
            "amount": "343.00",
            "plan_type": "GIFTING",
            "plan_day": "1day validity",
            "network": "MTN"
        }
    ],
    "bilal":[
        {
            "plan_name": "500MB",
            "plan_id": "7",
            "amount": "493.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "7days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "8",
            "amount": "800.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "9",
            "amount": "1,500.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "4GB",
            "plan_id": "10",
            "amount": "2,525.00",
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
            "amount": "4,000.00",
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
            "amount": "110.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "500MB",
            "plan_id": "30",
            "amount": "210.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "1GB",
            "plan_id": "31",
            "amount": "420.00",
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
            "plan_name": "6GB",
            "plan_id": "36",
            "amount": "2,450.00",
            "plan_type": "SME",
            "plan_day": "7days",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "37",
            "amount": "490.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "24hours and 5 mins call",
            "network": "MTN"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "38",
            "amount": "588.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "2 days",
            "network": "MTN"
        },
        {
            "plan_name": "15GB",
            "plan_id": "39",
            "amount": "6,305.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "3.2GB",
            "plan_id": "42",
            "amount": "970.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "48hours",
            "network": "MTN"
        },
        {
            "plan_name": "8GB",
            "plan_id": "43",
            "amount": "4,365.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7days + 25 min call time",
            "network": "MTN"
        },
        {
            "plan_name": "300MB",
            "plan_id": "44",
            "amount": "300.00",
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
            "plan_name": "2GB",
            "plan_id": "70",
            "amount": "655.00",
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
            "plan_name": "25GB",
            "plan_id": "74",
            "amount": "8,000.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "18GB",
            "plan_id": "75",
            "amount": "6,000.00",
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
        {
            "plan_name": "15GB",
            "plan_id": "79",
            "amount": "1,950.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7 days",
            "network": "GLO"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "80",
            "amount": "970.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7 days + 5 mind call time",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "81",
            "amount": "784.00",
            "plan_type": "SME",
            "plan_day": "Weekly and call time",
            "network": "MTN"
        },
        {
            "plan_name": "250GB",
            "plan_id": "82",
            "amount": "53,900.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "150GB",
            "plan_id": "83",
            "amount": "34,900.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "75GB",
            "plan_id": "84",
            "amount": "19,600.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "32GB",
            "plan_id": "85",
            "amount": "10,780.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "10780",
            "network": "MTN"
        },
        {
            "plan_name": "15GB",
            "plan_id": "87",
            "amount": "6,370.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days and call time",
            "network": "MTN"
        },
        {
            "plan_name": "12.5GB",
            "plan_id": "88",
            "amount": "5,390.00",
            "plan_type": "SME",
            "plan_day": "11gb + call time monthly",
            "network": "MTN"
        },
        {
            "plan_name": "3.2GB",
            "plan_id": "91",
            "amount": "980.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "2 days",
            "network": "MTN"
        },
        {
            "plan_name": "2.5GB",
            "plan_id": "92",
            "amount": "735.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "Daily plan",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "94",
            "amount": "98.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "Beta mix bundle max",
            "network": "MTN"
        },
        {
            "plan_name": "75MB",
            "plan_id": "96",
            "amount": "74.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "Daily",
            "network": "MTN"
        },
        {
            "plan_name": "0.5MB",
            "plan_id": "97",
            "amount": "49.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "Beta mix mini",
            "network": "MTN"
        },
        {
            "plan_name": "200GB",
            "plan_id": "98",
            "amount": "49,000.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "60 days plan",
            "network": "MTN"
        },
        {
            "plan_name": "90GB",
            "plan_id": "102",
            "amount": "24,500.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "60 days plan",
            "network": "MTN"
        },
        {
            "plan_name": "7GB",
            "plan_id": "103",
            "amount": "3,430.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "3.5GB",
            "plan_id": "104",
            "amount": "2,450.00",
            "plan_type": "SME",
            "plan_day": "30days + 2gb night",
            "network": "MTN"
        },
        {
            "plan_name": "600MB",
            "plan_id": "106",
            "amount": "260.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "2 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "107",
            "amount": "360.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "3 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.2GB",
            "plan_id": "108",
            "amount": "735.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7days pulse",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "109",
            "amount": "700.00",
            "plan_type": "GIFTING",
            "plan_day": "7 days",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "110",
            "amount": "1,400.00",
            "plan_type": "GIFTING",
            "plan_day": "7days",
            "network": "MTN"
        },
        {
            "plan_name": "3GB",
            "plan_id": "111",
            "amount": "2,100.00",
            "plan_type": "GIFTING",
            "plan_day": "7 days",
            "network": "MTN"
        },
        {
            "plan_name": "11GB",
            "plan_id": "112",
            "amount": "3,430.00",
            "plan_type": "SME",
            "plan_day": "7 days",
            "network": "MTN"
        },
        {
            "plan_name": "230MB",
            "plan_id": "113",
            "amount": "196.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "24hours",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "114",
            "amount": "1,470.00",
            "plan_type": "SME",
            "plan_day": "30days + call 2m",
            "network": "MTN"
        },
        {
            "plan_name": "2.7GB",
            "plan_id": "115",
            "amount": "1,960.00",
            "plan_type": "SME",
            "plan_day": "30days + 2 mins",
            "network": "MTN"
        },
        {
            "plan_name": "110MB",
            "plan_id": "116",
            "amount": "98.00",
            "plan_type": "SME",
            "plan_day": "24hours",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "117",
            "amount": "490.00",
            "plan_type": "SME",
            "plan_day": "7days",
            "network": "MTN"
        },
        {
            "plan_name": "1.8GB",
            "plan_id": "118",
            "amount": "1,470.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days plus 1500 Airtime",
            "network": "MTN"
        },
        {
            "plan_name": "300MB",
            "plan_id": "120",
            "amount": "1,470.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days + 7500 talk time",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "121",
            "amount": "2,940.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days + 15000 talk time.",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "122",
            "amount": "350.00",
            "plan_type": "SME",
            "plan_day": "daily",
            "network": "MTN"
        },
        {
            "plan_name": "12.5GB",
            "plan_id": "123",
            "amount": "5,390.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "14.5GB",
            "plan_id": "124",
            "amount": "4,900.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "65GB",
            "plan_id": "125",
            "amount": "15,680.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "1TB",
            "plan_id": "126",
            "amount": "196,000.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1 year",
            "network": "AIRTEL"
        }
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
    // { vendor: 'quickvtu', network: 'GLO', planToRemove: 'SME' },
    { vendor: 'quickvtu', network: 'GLO', planToRemove: 'GIFTING PROMO' },
    { vendor: 'quickvtu', network: '9MOBILE', planToRemove: 'GIFTING' },
    { vendor: 'quickvtu', network: '9MOBILE', planToRemove: 'SME' },
    { vendor: 'quickvtu', network: 'AIRTEL', planToRemove: 'GIFTING' },
    { vendor: 'quickvtu', network: 'AIRTEL', planToRemove: 'COOPERATE GIFTING' },
    // { vendor: 'quickvtu', network: 'MTN', planToRemove: 'COOPERATE GIFTING' },
    // { vendor: 'quickvtu', network: 'MTN', planToRemove: 'SME' },
    // { vendor: 'bilal', network: 'MTN', planToRemove: 'SME' },
    // { vendor: 'bilal', network: 'MTN', planToRemove: 'GIFTING' },
    // { vendor: 'bilal', network: 'MTN', planToRemove: 'COOPERATE GIFTING' },
    // { vendor: 'bilal', network: 'AIRTEL', planToRemove: 'GIFTING PROMO' },
    // { vendor: 'bilal', network: 'AIRTEL', planToRemove: 'COOPERATE GIFTING' },
    { vendor: 'bilal', network: 'AIRTEL', planToRemove: 'GIFTING' },
    { vendor: 'bilal', network: 'AIRTEL', planToRemove: 'SME' },
    { vendor: 'bilal', network: '9MOBILE', planToRemove: 'GIFTING' },
    { vendor: 'bilal', network: '9MOBILE', planToRemove: 'SME' },
    { vendor: 'bilal', network: '9MOBILE', planToRemove: 'GIFTING PROMO' },
    { vendor: 'bilal', network: 'GLO', planToRemove: 'GIFTING PROMO' },
    { vendor: 'bilal', network: 'GLO', planToRemove: 'GIFTING' },
    { vendor: 'bilal', network: 'GLO', planToRemove: 'SME' },
];

const filteredPlans = removePlans(plans, filters);
const sortedPlans = sortByPlanNameAndNetwork(filteredPlans);

fs.writeFileSync('dataplan.json', JSON.stringify(sortedPlans, null, 2));

// Output the filtered results