const { checkDaysMatch } = require("./utils/helpers");
const fs = require('fs');

const unfilteredplans = {
    "quickvtu":  [
        {
            "plan_name": "500MB",
            "plan_id": "4",
            "amount": "400.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "5",
            "amount": "520.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "6",
            "amount": "1,150.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "3GB",
            "plan_id": "7",
            "amount": "1,700.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
        },
        {
            "plan_name": "5GB",
            "plan_id": "8",
            "amount": "2,750.00",
            "plan_type": "SME",
            "plan_day": "1Month",
            "network": "MTN"
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
            "plan_name": "200MB",
            "plan_id": "118",
            "amount": "210.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "2 days validity",
            "network": "AIRTEL"
        },
        {
            "plan_name": "300MB",
            "plan_id": "119",
            "amount": "305.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "2days validity",
            "network": "AIRTEL"
        },
        {
            "plan_name": "500MB",
            "plan_id": "120",
            "amount": "510.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "7days validity",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "121",
            "amount": "810.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "7days validity",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "122",
            "amount": "1,510.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3GB",
            "plan_id": "123",
            "amount": "1,990.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "AIRTEL"
        },
        {
            "plan_name": "4GB",
            "plan_id": "124",
            "amount": "2,500.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "2550",
            "network": "AIRTEL"
        },
        {
            "plan_name": "8GB",
            "plan_id": "125",
            "amount": "3,050.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "AIRTEL"
        },
        {
            "plan_name": "10GB",
            "plan_id": "126",
            "amount": "4,000.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days validity",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.2GB",
            "plan_id": "127",
            "amount": "740.00",
            "plan_type": "GIFTING",
            "plan_day": "7days+1hr (YT\/IG\/TT) MTN PULSE WEEKLY PLAN. MIGRATE TO MTN PULSE TO BUY THIS PARTICULAR 1.2GB",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "128",
            "amount": "795.00",
            "plan_type": "GIFTING",
            "plan_day": "7days+5min (MTN GIFTING)",
            "network": "MTN"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "129",
            "amount": "995.00",
            "plan_type": "GIFTING",
            "plan_day": "7days+5min (MTN GIFTING)",
            "network": "MTN"
        },
        {
            "plan_name": "75MB",
            "plan_id": "130",
            "amount": "75.00",
            "plan_type": "GIFTING",
            "plan_day": "1day",
            "network": "MTN"
        },
        {
            "plan_name": "230MB",
            "plan_id": "131",
            "amount": "198.00",
            "plan_type": "GIFTING",
            "plan_day": "1day",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "132",
            "amount": "490.00",
            "plan_type": "GIFTING",
            "plan_day": "1day+1.5min",
            "network": "MTN"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "133",
            "amount": "592.00",
            "plan_type": "GIFTING",
            "plan_day": "2days",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "134",
            "amount": "740.00",
            "plan_type": "GIFTING",
            "plan_day": "2days",
            "network": "MTN"
        },
        {
            "plan_name": "2.5GB",
            "plan_id": "135",
            "amount": "740.00",
            "plan_type": "GIFTING",
            "plan_day": "1days",
            "network": "MTN"
        },
        {
            "plan_name": "3.2GB",
            "plan_id": "136",
            "amount": "990.00",
            "plan_type": "GIFTING",
            "plan_day": "2days",
            "network": "MTN"
        },
        {
            "plan_name": "6GB",
            "plan_id": "137",
            "amount": "2,470.00",
            "plan_type": "GIFTING",
            "plan_day": "7days (MTN GIFTING)",
            "network": "MTN"
        },
        {
            "plan_name": "11GB",
            "plan_id": "138",
            "amount": "3,450.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "7days (MTN GIFTING)",
            "network": "MTN"
        },
        {
            "plan_name": "110MB",
            "plan_id": "139",
            "amount": "95.00",
            "plan_type": "GIFTING",
            "plan_day": "1day",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "140",
            "amount": "490.00",
            "plan_type": "GIFTING",
            "plan_day": "7days (MTN GIFTING)",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "141",
            "amount": "345.00",
            "plan_type": "GIFTING",
            "plan_day": "1day (AWOOF)",
            "network": "MTN"
        },
        {
            "plan_name": "7GB",
            "plan_id": "142",
            "amount": "3,450.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "1 Month",
            "network": "MTN"
        },
        {
            "plan_name": "10GB",
            "plan_id": "143",
            "amount": "4,450.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days+25min (MTN GIFTING)",
            "network": "MTN"
        },
        {
            "plan_name": "12.5GB",
            "plan_id": "144",
            "amount": "5,420.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days +25min (MTN GIFTING)",
            "network": "MTN"
        },
        {
            "plan_name": "16.5GB",
            "plan_id": "145",
            "amount": "6,420.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days+25mins (MTN GIFTING)",
            "network": "MTN"
        },
        {
            "plan_name": "36GB",
            "plan_id": "146",
            "amount": "10,800.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days (MTN GIFTING)",
            "network": "MTN"
        },
        {
            "plan_name": "20GB",
            "plan_id": "147",
            "amount": "5,000.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "7days (AWOOF)",
            "network": "MTN"
        },
        {
            "plan_name": "25GB",
            "plan_id": "148",
            "amount": "8,890.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days (MTN GIFTING)",
            "network": "MTN"
        },
        {
            "plan_name": "150MB",
            "plan_id": "149",
            "amount": "80.00",
            "plan_type": "SME",
            "plan_day": "1day|| Don't Buy if Owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "300MB",
            "plan_id": "150",
            "amount": "130.00",
            "plan_type": "SME",
            "plan_day": "2days || Don't buy if Owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "600MB",
            "plan_id": "151",
            "amount": "220.00",
            "plan_type": "SME",
            "plan_day": "2days || Don't Buy if Owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "152",
            "amount": "430.00",
            "plan_type": "SME",
            "plan_day": "1day validity don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "153",
            "amount": "530.00",
            "plan_type": "SME",
            "plan_day": "2days || Don't Buy if Owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3GB",
            "plan_id": "155",
            "amount": "790.00",
            "plan_type": "SME",
            "plan_day": "2days || Don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "10GB",
            "plan_id": "159",
            "amount": "3,100.00",
            "plan_type": "SME",
            "plan_day": "30days || Don't buy if owing",
            "network": "AIRTEL"
        },
        {
            "plan_name": "13GB",
            "plan_id": "160",
            "amount": "5,150.00",
            "plan_type": "SME",
            "plan_day": "30days || Don't buy if owing",
            "network": "AIRTEL"
        }
    ],
    "bilal": [
        {
            "plan_name": "500MB",
            "plan_id": "1",
            "amount": "350.00",
            "plan_type": "SME",
            "plan_day": "30days to 7days",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "2",
            "amount": "500.00",
            "plan_type": "SME",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "3",
            "amount": "1,000.00",
            "plan_type": "SME",
            "plan_day": "Monthly",
            "network": "MTN"
        },
        {
            "plan_name": "3GB",
            "plan_id": "4",
            "amount": "1,500.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "5GB",
            "plan_id": "5",
            "amount": "2,500.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "10GB",
            "plan_id": "6",
            "amount": "5,000.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "7",
            "amount": "493.00",
            "plan_type": "SME",
            "plan_day": "7days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "8",
            "amount": "784.00",
            "plan_type": "SME",
            "plan_day": "7days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "9",
            "amount": "1,500.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "4GB",
            "plan_id": "10",
            "amount": "2,525.00",
            "plan_type": "SME",
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
            "plan_name": "500MB",
            "plan_id": "19",
            "amount": "400.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "20",
            "amount": "700.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "21",
            "amount": "1,660.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "5GB",
            "plan_id": "23",
            "amount": "4,150.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "10GB",
            "plan_id": "24",
            "amount": "8,300.00",
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
            "amount": "4,000.00",
            "plan_type": "SME",
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
            "amount": "200.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "1GB",
            "plan_id": "31",
            "amount": "400.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "2GB",
            "plan_id": "32",
            "amount": "800.00",
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
            "plan_type": "GIFTING PROMO",
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
            "plan_name": "10GB",
            "plan_id": "41",
            "amount": "4,365.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
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
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "100MB",
            "plan_id": "45",
            "amount": "100.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "500MB",
            "plan_id": "46",
            "amount": "180.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30 days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "1GB",
            "plan_id": "47",
            "amount": "360.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "2GB",
            "plan_id": "48",
            "amount": "720.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "3GB",
            "plan_id": "49",
            "amount": "1,080.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "9MOBILE"
        },
        {
            "plan_name": "4GB",
            "plan_id": "50",
            "amount": "1,440.00",
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
            "plan_name": "500MB",
            "plan_id": "53",
            "amount": "460.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "54",
            "amount": "920.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "55",
            "amount": "1,840.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "5GB",
            "plan_id": "56",
            "amount": "4,600.00",
            "plan_type": "COOPERATE GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "10GB",
            "plan_id": "57",
            "amount": "9,200.00",
            "plan_type": "COOPERATE GIFTING",
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
            "plan_name": "25GB",
            "plan_id": "74",
            "amount": "8,000.00",
            "plan_type": "SME",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "18GB",
            "plan_id": "75",
            "amount": "6,000.00",
            "plan_type": "SME",
            "plan_day": "7 days",
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
            "amount": "781.00",
            "plan_type": "GIFTING PROMO",
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
            "plan_name": "35GB",
            "plan_id": "86",
            "amount": "6,860.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "Postpaid monthly plan",
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
            "plan_type": "GIFTING PROMO",
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
            "plan_name": "150GB",
            "plan_id": "100",
            "amount": "39,200.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "60 days plan",
            "network": "MTN"
        },
        {
            "plan_name": "40GB",
            "plan_id": "101",
            "amount": "8,820.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "Postpaid  2 monthly plan",
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
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "3.5GB",
            "plan_id": "104",
            "amount": "2,450.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days + 2gb night",
            "network": "MTN"
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
            "plan_name": "11GB",
            "plan_id": "112",
            "amount": "3,430.00",
            "plan_type": "GIFTING PROMO",
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
            "amount": "1,460.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days + call 2m",
            "network": "MTN"
        },
        {
            "plan_name": "2.7GB",
            "plan_id": "115",
            "amount": "1,960.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days + 2 mins",
            "network": "MTN"
        },
        {
            "plan_name": "100MB",
            "plan_id": "116",
            "amount": "98.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "24hours",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "117",
            "amount": "490.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7days",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "122",
            "amount": "346.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "daily",
            "network": "MTN"
        },
        {
            "plan_name": "12.5GB",
            "plan_id": "123",
            "amount": "5,390.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "14.5GB",
            "plan_id": "124",
            "amount": "4,900.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "65GB",
            "plan_id": "125",
            "amount": "15,680.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "1TB",
            "plan_id": "126",
            "amount": "196,000.00",
            "plan_type": "SME",
            "plan_day": "1 year",
            "network": "AIRTEL"
        },
        {
            "plan_name": "40MB",
            "plan_id": "127",
            "amount": "50.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "1 day and 1 min",
            "network": "MTN"
        },
        {
            "plan_name": "750MB",
            "plan_id": "128",
            "amount": "442.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "2 days social",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "129",
            "amount": "735.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "2 days",
            "network": "MTN"
        },
        {
            "plan_name": "2.5GB",
            "plan_id": "130",
            "amount": "880.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "2 days",
            "network": "MTN"
        },
        {
            "plan_name": "3.5GB",
            "plan_id": "131",
            "amount": "1,460.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7 days",
            "network": "MTN"
        },
        {
            "plan_name": "20GB",
            "plan_id": "132",
            "amount": "5,335.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7 days",
            "network": "MTN"
        },
        {
            "plan_name": "6.75GB",
            "plan_id": "133",
            "amount": "2,910.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "16.5GB",
            "plan_id": "134",
            "amount": "6,305.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "24GB",
            "plan_id": "135",
            "amount": "7,275.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "29GB",
            "plan_id": "136",
            "amount": "8,730.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "36GB",
            "plan_id": "137",
            "amount": "10,670.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "165GB",
            "plan_id": "138",
            "amount": "33,950.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "250GB",
            "plan_id": "139",
            "amount": "53,350.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "480GB",
            "plan_id": "140",
            "amount": "87,300.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "90days",
            "network": "MTN"
        },
        {
            "plan_name": "800GB",
            "plan_id": "141",
            "amount": "121,250.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "1 year",
            "network": "MTN"
        },
        {
            "plan_name": "35GB",
            "plan_id": "145",
            "amount": "10,000.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "60GB",
            "plan_id": "146",
            "amount": "15,000.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "100GB",
            "plan_id": "147",
            "amount": "20,000.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "160GB",
            "plan_id": "148",
            "amount": "30,000.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "470MB",
            "plan_id": "149",
            "amount": "196.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "Weekly all social",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "150",
            "amount": "190.00",
            "plan_type": "SME",
            "plan_day": "14 days ,Night plan",
            "network": "GLO"
        },
        {
            "plan_name": "1GB",
            "plan_id": "151",
            "amount": "300.00",
            "plan_type": "SME",
            "plan_day": "14 days ,Night plan",
            "network": "GLO"
        },
        {
            "plan_name": "1GB",
            "plan_id": "152",
            "amount": "260.00",
            "plan_type": "SME",
            "plan_day": "3 days",
            "network": "GLO"
        },
        {
            "plan_name": "1GB",
            "plan_id": "153",
            "amount": "280.00",
            "plan_type": "SME",
            "plan_day": "7 days",
            "network": "GLO"
        },
        {
            "plan_name": "3GB",
            "plan_id": "154",
            "amount": "730.00",
            "plan_type": "SME",
            "plan_day": "3 days",
            "network": "GLO"
        },
        {
            "plan_name": "3GB",
            "plan_id": "155",
            "amount": "850.00",
            "plan_type": "SME",
            "plan_day": "7days",
            "network": "GLO"
        },
        {
            "plan_name": "3GB",
            "plan_id": "156",
            "amount": "1,000.00",
            "plan_type": "SME",
            "plan_day": "14 days night plan",
            "network": "GLO"
        },
        {
            "plan_name": "5GB",
            "plan_id": "157",
            "amount": "1,240.00",
            "plan_type": "SME",
            "plan_day": "3days",
            "network": "GLO"
        },
        {
            "plan_name": "5GB",
            "plan_id": "158",
            "amount": "1,440.00",
            "plan_type": "SME",
            "plan_day": "7 days",
            "network": "GLO"
        },
        {
            "plan_name": "5GB",
            "plan_id": "159",
            "amount": "1,480.00",
            "plan_type": "SME",
            "plan_day": "14 days Night plan",
            "network": "GLO"
        },
        {
            "plan_name": "10GB",
            "plan_id": "160",
            "amount": "2,950.00",
            "plan_type": "SME",
            "plan_day": "14 days night plan",
            "network": "GLO"
        },
        {
            "plan_name": "10GB",
            "plan_id": "164",
            "amount": "3,000.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "165",
            "amount": "780.00",
            "plan_type": "GIFTING",
            "plan_day": "7 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1GB",
            "plan_id": "166",
            "amount": "290.00",
            "plan_type": "GIFTING",
            "plan_day": "3 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "167",
            "amount": "1,425.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "500MB",
            "plan_id": "168",
            "amount": "490.00",
            "plan_type": "GIFTING",
            "plan_day": "7 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3GB",
            "plan_id": "169",
            "amount": "1,960.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3GB",
            "plan_id": "170",
            "amount": "735.00",
            "plan_type": "GIFTING",
            "plan_day": "2 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "171",
            "amount": "490.00",
            "plan_type": "GIFTING",
            "plan_day": "7 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "172",
            "amount": "980.00",
            "plan_type": "GIFTING",
            "plan_day": "7 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "173",
            "amount": "490.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "AIRTEL"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "174",
            "amount": "392.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "AIRTEL"
        },
        {
            "plan_name": "75MB",
            "plan_id": "175",
            "amount": "74.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "AIRTEL"
        },
        {
            "plan_name": "110MB",
            "plan_id": "176",
            "amount": "98.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "AIRTEL"
        },
        {
            "plan_name": "250MB",
            "plan_id": "177",
            "amount": "50.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "AIRTEL"
        },
        {
            "plan_name": "2GB",
            "plan_id": "178",
            "amount": "570.00",
            "plan_type": "GIFTING",
            "plan_day": "7 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "600MB",
            "plan_id": "179",
            "amount": "200.00",
            "plan_type": "GIFTING",
            "plan_day": "2 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3GB",
            "plan_id": "180",
            "amount": "1,960.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "4GB",
            "plan_id": "181",
            "amount": "2,450.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "8GB",
            "plan_id": "183",
            "amount": "2,970.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "10GB",
            "plan_id": "184",
            "amount": "3,920.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "13GB",
            "plan_id": "185",
            "amount": "4,900.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "25GB",
            "plan_id": "186",
            "amount": "7,840.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "35GB",
            "plan_id": "187",
            "amount": "9,800.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "60GB",
            "plan_id": "188",
            "amount": "14,700.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "100GB",
            "plan_id": "189",
            "amount": "19,600.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "300GB",
            "plan_id": "190",
            "amount": "49,000.00",
            "plan_type": "GIFTING",
            "plan_day": "90 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "350GB",
            "plan_id": "191",
            "amount": "58,800.00",
            "plan_type": "GIFTING",
            "plan_day": "120 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "685GB",
            "plan_id": "192",
            "amount": "98,000.00",
            "plan_type": "GIFTING",
            "plan_day": "1 year",
            "network": "AIRTEL"
        },
        {
            "plan_name": "40MB",
            "plan_id": "193",
            "amount": "49.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "MTN"
        },
        {
            "plan_name": "75MB",
            "plan_id": "194",
            "amount": "73.50",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "MTN"
        },
        {
            "plan_name": "100MB",
            "plan_id": "195",
            "amount": "98.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "MTN"
        },
        {
            "plan_name": "230MB",
            "plan_id": "196",
            "amount": "196.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "MTN"
        },
        {
            "plan_name": "500MB",
            "plan_id": "197",
            "amount": "343.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "MTN"
        },
        {
            "plan_name": "1GB",
            "plan_id": "198",
            "amount": "490.00",
            "plan_type": "GIFTING",
            "plan_day": "1 days",
            "network": "MTN"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "199",
            "amount": "588.00",
            "plan_type": "GIFTING",
            "plan_day": "2 days",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "200",
            "amount": "735.00",
            "plan_type": "GIFTING",
            "plan_day": "2 days",
            "network": "MTN"
        },
        {
            "plan_name": "2.5GB",
            "plan_id": "201",
            "amount": "882.00",
            "plan_type": "GIFTING",
            "plan_day": "882",
            "network": "MTN"
        },
        {
            "plan_name": "3.2GB",
            "plan_id": "202",
            "amount": "980.00",
            "plan_type": "GIFTING",
            "plan_day": "2 days",
            "network": "MTN"
        },
        {
            "plan_name": "2GB",
            "plan_id": "203",
            "amount": "1,470.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "2.7GB",
            "plan_id": "204",
            "amount": "1,960.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "3.5GB",
            "plan_id": "205",
            "amount": "2,450.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "3.5GB",
            "plan_id": "206",
            "amount": "1,470.00",
            "plan_type": "GIFTING",
            "plan_day": "7 days",
            "network": "MTN"
        },
        {
            "plan_name": "1.8GB",
            "plan_id": "207",
            "amount": "1,470.00",
            "plan_type": "GIFTING",
            "plan_day": "3 days",
            "network": "MTN"
        },
        {
            "plan_name": "7GB",
            "plan_id": "208",
            "amount": "3,430.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "7GB",
            "plan_id": "209",
            "amount": "1,764.00",
            "plan_type": "GIFTING",
            "plan_day": "2 days",
            "network": "MTN"
        },
        {
            "plan_name": "5.5GB",
            "plan_id": "210",
            "amount": "2,940.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "10GB",
            "plan_id": "211",
            "amount": "4,410.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "11GB",
            "plan_id": "212",
            "amount": "3,430.00",
            "plan_type": "GIFTING",
            "plan_day": "7 days",
            "network": "MTN"
        },
        {
            "plan_name": "12.5GB",
            "plan_id": "213",
            "amount": "5,390.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "14.5GB",
            "plan_id": "214",
            "amount": "4,900.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "16.5GB",
            "plan_id": "215",
            "amount": "6,370.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "20GB",
            "plan_id": "216",
            "amount": "7,350.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "25GB",
            "plan_id": "217",
            "amount": "6,860.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "25GB",
            "plan_id": "218",
            "amount": "8,820.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "34GB",
            "plan_id": "219",
            "amount": "9,800.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "36GB",
            "plan_id": "220",
            "amount": "10,780.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "40GB",
            "plan_id": "221",
            "amount": "8,820.00",
            "plan_type": "GIFTING",
            "plan_day": "60days",
            "network": "MTN"
        },
        {
            "plan_name": "65GB",
            "plan_id": "222",
            "amount": "15,680.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "75GB",
            "plan_id": "223",
            "amount": "17,640.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "90GB",
            "plan_id": "224",
            "amount": "24,500.00",
            "plan_type": "GIFTING",
            "plan_day": "60 days",
            "network": "MTN"
        },
        {
            "plan_name": "165GB",
            "plan_id": "225",
            "amount": "34,300.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "MTN"
        },
        {
            "plan_name": "250GB",
            "plan_id": "226",
            "amount": "53,900.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "MTN"
        },
        {
            "plan_name": "800GB",
            "plan_id": "227",
            "amount": "122,500.00",
            "plan_type": "GIFTING",
            "plan_day": "365 days",
            "network": "MTN"
        },
        {
            "plan_name": "45MB",
            "plan_id": "228",
            "amount": "49.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "GLO"
        },
        {
            "plan_name": "100MB",
            "plan_id": "229",
            "amount": "98.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "GLO"
        },
        {
            "plan_name": "200MB",
            "plan_id": "230",
            "amount": "196.00",
            "plan_type": "GIFTING",
            "plan_day": "2 day",
            "network": "GLO"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "231",
            "amount": "294.00",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "GLO"
        },
        {
            "plan_name": "2.5GB",
            "plan_id": "232",
            "amount": "490.00",
            "plan_type": "GIFTING",
            "plan_day": "2 days",
            "network": "GLO"
        },
        {
            "plan_name": "1.5GB",
            "plan_id": "233",
            "amount": "490.00",
            "plan_type": "GIFTING",
            "plan_day": "7 days",
            "network": "GLO"
        },
        {
            "plan_name": "2.6GB",
            "plan_id": "234",
            "amount": "980.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "5GB",
            "plan_id": "235",
            "amount": "1,470.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "6.15GB",
            "plan_id": "236",
            "amount": "1,960.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "7.25GB",
            "plan_id": "237",
            "amount": "2,450.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "10GB",
            "plan_id": "238",
            "amount": "2,940.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "12.5GB",
            "plan_id": "239",
            "amount": "3,920.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "16GB",
            "plan_id": "240",
            "amount": "4,900.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "20.5GB",
            "plan_id": "241",
            "amount": "5,880.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "28GB",
            "plan_id": "242",
            "amount": "7,840.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "38GB",
            "plan_id": "243",
            "amount": "9,800.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "64GB",
            "plan_id": "244",
            "amount": "14,700.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "107GB",
            "plan_id": "245",
            "amount": "19,600.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "135GB",
            "plan_id": "246",
            "amount": "24,500.00",
            "plan_type": "GIFTING",
            "plan_day": "30days",
            "network": "GLO"
        },
        {
            "plan_name": "165GB",
            "plan_id": "247",
            "amount": "29,400.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "220GB",
            "plan_id": "248",
            "amount": "39,200.00",
            "plan_type": "GIFTING",
            "plan_day": "30 days",
            "network": "GLO"
        },
        {
            "plan_name": "310GB",
            "plan_id": "249",
            "amount": "49,000.00",
            "plan_type": "GIFTING",
            "plan_day": "60 days",
            "network": "GLO"
        },
        {
            "plan_name": "355GB",
            "plan_id": "250",
            "amount": "58,000.00",
            "plan_type": "GIFTING",
            "plan_day": "90days",
            "network": "GLO"
        },
        {
            "plan_name": "475GB",
            "plan_id": "251",
            "amount": "73,500.00",
            "plan_type": "GIFTING",
            "plan_day": "90 days",
            "network": "GLO"
        },
        {
            "plan_name": "1000GB",
            "plan_id": "252",
            "amount": "147,000.00",
            "plan_type": "GIFTING",
            "plan_day": "1 year",
            "network": "GLO"
        },
        {
            "plan_name": "1000GB",
            "plan_id": "253",
            "amount": "147,000.00",
            "plan_type": "GIFTING",
            "plan_day": "1 year",
            "network": "GLO"
        },
        {
            "plan_name": "350MB",
            "plan_id": "254",
            "amount": "58.80",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "GLO"
        },
        {
            "plan_name": "750MB",
            "plan_id": "255",
            "amount": "117.60",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "GLO"
        },
        {
            "plan_name": "750MB",
            "plan_id": "256",
            "amount": "117.60",
            "plan_type": "GIFTING",
            "plan_day": "1 day",
            "network": "GLO"
        },
        {
            "plan_name": "135MB",
            "plan_id": "257",
            "amount": "49.00",
            "plan_type": "GIFTING",
            "plan_day": "3 days",
            "network": "GLO"
        },
        {
            "plan_name": "11GB",
            "plan_id": "258",
            "amount": "294.00",
            "plan_type": "GIFTING",
            "plan_day": "10 days",
            "network": "GLO"
        },
        {
            "plan_name": "6.5GB",
            "plan_id": "259",
            "amount": "980.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "7 days",
            "network": "AIRTEL"
        },
        {
            "plan_name": "3.2GB",
            "plan_id": "260",
            "amount": "490.00",
            "plan_type": "GIFTING PROMO",
            "plan_day": "3 days",
            "network": "AIRTEL"
        }
    ],
    // "mobilevtu": [ 
    //     ]
}

var plans = unfilteredplans.quickvtu.map(plan => {
    const mbSize = convertToMB(plan.plan_name);
    const hundreds = Math.floor(mbSize / 50);
    const originalAmount = parseFloat(plan.amount.replace(',', ''));
    const newAmount = originalAmount + hundreds;
    console.log( newAmount.toFixed(2) , originalAmount, plan.amount)

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
    const hundreds = Math.floor(mbSize / 50);
    const originalAmount = parseFloat(plan.amount.replace(",",""));
    const newAmount = originalAmount + hundreds;
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
    // { vendor: 'quickvtu', network: 'GLO', planToRemove: 'GIFTING PROMO' },
    { vendor: 'quickvtu', network: '9MOBILE', planToRemove: 'GIFTING' },
    { vendor: 'quickvtu', network: '9MOBILE', planToRemove: 'SME' },
    { vendor: 'quickvtu', network: 'AIRTEL', planToRemove: 'GIFTING' },
    // { vendor: 'quickvtu', network: 'AIRTEL', planToRemove: 'COOPERATE GIFTING' },
    // { vendor: 'quickvtu', network: 'MTN', planToRemove: 'COOPERATE GIFTING' },
    // { vendor: 'quickvtu', network: 'MTN', planToRemove: 'SME' },
    // { vendor: 'bilal', network: 'MTN', planToRemove: 'SME' },
    // { vendor: 'bilal', network: 'MTN', planToRemove: 'GIFTING' },
    // { vendor: 'bilal', network: 'MTN', planToRemove: 'COOPERATE GIFTING' },
    { vendor: 'bilal', network: 'MTN', planToRemove: 'GIFTING PROMO' },
    { vendor: 'bilal', network: 'AIRTEL', planToRemove: 'GIFTING PROMO' },
    { vendor: 'bilal', network: 'AIRTEL', planToRemove: 'COOPERATE GIFTING' },
    // { vendor: 'bilal', network: 'AIRTEL', planToRemove: 'GIFTING' },
    { vendor: 'bilal', network: 'AIRTEL', planToRemove: 'SME' },
    { vendor: 'bilal', network: '9MOBILE', planToRemove: 'GIFTING' },
    { vendor: 'bilal', network: '9MOBILE', planToRemove: 'SME' },
    { vendor: 'bilal', network: '9MOBILE', planToRemove: 'GIFTING PROMO' },
    { vendor: 'bilal', network: 'GLO', planToRemove: 'GIFTING PROMO' },
    // { vendor: 'bilal', network: 'GLO', planToRemove: 'GIFTING' },
    // { vendor: 'bilal', network: 'GLO', planToRemove: 'SME' },
];

const filteredPlans = removePlans(plans, filters);
const sortedPlans = sortByPlanNameAndNetwork(filteredPlans);

fs.writeFileSync('dataplan.json', JSON.stringify(sortedPlans, null, 2));

// Output the filtered results