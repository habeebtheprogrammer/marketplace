const moment = require("moment")
module.exports = {
    welcome_email: function () {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>360GadgetsAfrica - Why Choose Us</title>
  <style>
    @media screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .mobile-padding {
        padding: 20px !important;
      }
      .force-row {
        display: table !important;
        width: 100% !important;
      }
      .force-cell {
        display: table-cell !important;
        width: 100% !important;
        vertical-align: top !important;
      }
      .text-col {
        width: 80% !important;
      }
      .img-col {
        width: 20% !important;
      }
      .img-col-img {
        width: 100% !important;
        height: auto !important;
      }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f8f9fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

  <!-- Main Container -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8f9fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <!-- Email Content Container -->
        <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <tr>
                <td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td class="logo" style="text-align: center;">
                                <a href="https://360gadgetsafrica.com"><img width="50px"  object-fit="contain"
                                        src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1735744097/360/zpibebpd5dopnxvttltd.png"></a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr><!-- end tr -->
          <!-- Title -->
          <tr>
            <td class="mobile-padding" style="padding:10px 40px 30px 40px; text-align:center;">
              <h1 style="margin:0; font-size:30px; font-weight:700; color:#292929; line-height:1.2; font-family:'Playfair Display', Georgia, serif;">
                Why 360GadgetsAfrica?
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-bottom:1px solid #e6e6e6;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Highlights -->
          <tr>
            <td class="mobile-padding" style="padding:30px 40px 20px 40px;">
              <h2 style="margin:0; font-size:16px; font-weight:600; color:#292929; text-transform:uppercase; letter-spacing:0.5px;">
                Our Value Proposition
              </h2>
            </td>
          </tr>

          <!-- Point 1 -->
          <tr>
            <td class="mobile-padding" style="padding:0 40px 30px 40px;">
              <table role="presentation" class="force-row" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="force-cell text-col" style="vertical-align:top; padding-right:20px;">
                    <h3 style="margin:0 0 12px 0; font-size:18px; font-weight:700; color:#292929; line-height:1.3;">
                      Genuine Gadgets, No Fakes 
                    </h3>
                    <p style="margin:0 0 16px 0; font-size:14px; color:#757575; line-height:1.5;">
                        Connect with reliable sellers across Nigeria each vendor is vetted to ensure quality, trust, and timely delivery.
                    </p>
                  </td>
                  <td class="force-cell img-col" style="vertical-align:top;">
                    <img class="img-col-img" src="https://terra01.s3.amazonaws.com/images/997419969080492.jpeg" alt="Genuine gadgets" width="100"  style="width:100%; max-width:120px; border-radius:4px; display:block;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Point 2 -->
          <tr>
            <td class="mobile-padding" style="padding:0 40px 30px 40px;">
              <table role="presentation" class="force-row" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="force-cell text-col" style="vertical-align:top; padding-right:20px;">
                    <h3 style="margin:0 0 12px 0; font-size:18px; font-weight:700; color:#292929; line-height:1.3;">
                      Repairs You Can Trust 
                    </h3>
                    <p style="margin:0 0 16px 0; font-size:14px; color:#757575; line-height:1.5;">
                      From cracked screens to battery swaps, our certified technicians restore your gadgets with speed and care.
                    </p>
                  </td>
                  <td class="force-cell img-col" style="vertical-align:top;">
                    <img class="img-col-img" src="https://terra01.s3.amazonaws.com/images/PhotoJul19115520PM.jpg" alt="Repair services" width="100"  style="width:100%; max-width:120px; border-radius:4px; display:block;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Point 3 -->
          <tr>
            <td class="mobile-padding" style="padding:0 40px 30px 40px;">
              <table role="presentation" class="force-row" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="force-cell text-col" style="vertical-align:top; padding-right:20px;">
                    <h3 style="margin:0 0 12px 0; font-size:18px; font-weight:700; color:#292929; line-height:1.3;">
                      Top-Up & Data Made Easy 
                    </h3>
                    <p style="margin:0 0 16px 0; font-size:14px; color:#757575; line-height:1.5;">
                      Instantly recharge airtime, buy data bundles, and pay for services all within our app. Convenience at your fingertips.
                    </p>
                  </td>
                  <td class="force-cell img-col" style="vertical-align:top;">
                    <img class="img-col-img" src="https://terra01.s3.amazonaws.com/images/Gadgets%20Payment%20November%2028%2C%202023%20%287%29.png" alt="Top-up services" width="100"  style="width:100%; max-width:120px; border-radius:4px; display:block;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Outline Button -->
          <tr>
            <td align="center" bgcolor="#ffffff" style="padding: 0px 40px 30px;">
              <p style="border:1px solid #000; border-radius:6px; padding:12px 28px; display:inline-block; margin:0;">
                <a href="https://360gadgetsafrica.com" target="_blank" 
                  style="font-size:16px; font-weight:600; text-decoration:none; color:#000; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Shop Now
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:40px; background-color:#f8f9fa; border-top:1px solid #e6e6e6; text-align:center;">
              <p style="margin:0 0 16px 0; font-size:14px; color:#757575; line-height:1.5;">
                We power smarter shopping, seamless payments, and instant access to the gadgets you love.
              </p>
              <p style="margin:0; font-size:13px; color:#999;">
                <a href="https://360gadgetsafrica.com" style="color:#000; text-decoration:none;">Unsubscribe</a> · 
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
    },
    otpCode: function (code) {
        return `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
        xmlns:o="urn:schemas-microsoft-com:office:office">

    <head>
    <meta charset="utf-8"> <!-- utf-8 works for most cases -->
    <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
    <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
    <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->

    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">

    <!-- CSS Reset : BEGIN -->
    <style>
        /* What it does: Remove spaces around the email design added by some email clients. */
        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
        html,
        body {
            margin: 0 auto !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
            background: #f1f1f1;
        }

        /* What it does: Stops email clients resizing small text. */
        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        /* What it does: Centers email on Android 4.4 */
        div[style*="margin: 16px 0"] {
            margin: 0 !important;
        }

        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }

        /* What it does: Fixes webkit padding issue. */
        table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
        }

        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
            -ms-interpolation-mode: bicubic;
        }

        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
        a {
            text-decoration: none;
        }

        /* What it does: A work-around for email clients meddling in triggered links. */
        *[x-apple-data-detectors],
        /* iOS */
        .unstyle-auto-detected-links *,
        .aBn {
            border-bottom: 0 !important;
            cursor: default !important;
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
        .a6S {
            display: none !important;
            opacity: 0.01 !important;
        }

        /* What it does: Prevents Gmail from changing the text color in conversation threads. */
        .im {
            color: inherit !important;
        }

        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img+div {
            display: none !important;
        }

        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
        /* Create one of these media queries for each additional viewport size you'd like to fix */

        /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
        @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
            u~div .email-container {
                min-width: 320px !important;
            }
        }

        /* iPhone 6, 6S, 7, 8, and X */
        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
            u~div .email-container {
                min-width: 375px !important;
            }
        }

        /* iPhone 6+, 7+, and 8+ */
        @media only screen and (min-device-width: 414px) {
            u~div .email-container {
                min-width: 414px !important;
            }
        }
    </style>

    <!-- CSS Reset : END -->

    <!-- Progressive Enhancements : BEGIN -->
    <style>
        .primary {
            background: #ff4b2b;
        }

        .bg_white {
            background: #ffffff;
        }

        .bg_light {
            background: #fafafa;
        }

        .bg_black {
            background: #000000;
        }

        .bg_dark {
            background: rgba(0, 0, 0, .8);
        }

        .email-section {
            padding: 2.5em;
        }

        /*BUTTON*/
        .btn {
            padding: 5px 15px;
            display: inline-block;
        }

        .btn.btn-primary {
            border-radius: 5px;
            background: #ff4b2b;
            color: #ffffff;
        }

        .btn.btn-white {
            border-radius: 5px;
            background: #ffffff;
            color: #000000;
        }

        .btn.btn-white-outline {
            border-radius: 5px;
            background: transparent;
            border: 1px solid #fff;
            color: #fff;
        }

        .btn.btn-black-outline {
            border-radius: 0px;
            background: transparent;
            border: 2px solid #000;
            color: #000;
            font-weight: 700;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            font-family: 'Lato', sans-serif;
            color: #000000;
            margin-top: 0;
            font-weight: 400;
        }

        body {
            font-family: 'Lato', sans-serif;
            font-weight: 400;
            font-size: 15px;
            line-height: 1.8;
            color: rgba(0, 0, 0, .4);
        }

        a {
            color: #ff4b2b;
        }

        table {}

        /*LOGO*/

        .logo h1 {
            margin: 0;
        }

        .logo h1 a {
            color: #000000;
            font-size: 20px;
            font-weight: 700;
            text-transform: uppercase;
            font-family: 'Lato', sans-serif;
            border: 2px solid #000;
            padding: .2em 1em;
        }

        .navigation {
            padding: 0;
            padding: 1em 0;
            /*background: rgba(0,0,0,1);*/
            border-top: 1px solid rgba(0, 0, 0, .05);
            border-bottom: 1px solid rgba(0, 0, 0, .05);
        }

        .navigation li {
            list-style: none;
            display: inline-block;
            ;
            margin-left: 5px;
            margin-right: 5px;
            font-size: 13px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .navigation li a {
            color: rgba(0, 0, 0, 1);
        }

        /*HERO*/
        .hero {
            position: relative;
            z-index: 0;
        }

        .hero .text {
            color: rgba(0, 0, 0, .3);
        }

        .hero .text h2 {
            color: #000;
            font-size: 30px;
            margin-bottom: 0;
            font-weight: 300;
        }

        .hero .text h2 span {
            font-weight: 600;
            color: #ff4b2b;
        }


        /*HEADING SECTION*/
        .heading-section {}

        .heading-section h2 {
            color: #000000;
            font-size: 28px;
            margin-top: 0;
            line-height: 1.4;
            font-weight: 400;
        }

        .heading-section .subheading {
            margin-bottom: 20px !important;
            display: inline-block;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(0, 0, 0, .4);
            position: relative;
        }

        .heading-section .subheading::after {
            position: absolute;
            left: 0;
            right: 0;
            bottom: -10px;
            content: '';
            width: 100%;
            height: 2px;
            background: #ff4b2b;
            margin: 0 auto;
        }

        .heading-section-white {
            color: rgba(255, 255, 255, .8);
        }

        .heading-section-white h2 {
            font-family:
                line-height: 1;
            padding-bottom: 0;
        }

        .heading-section-white h2 {
            color: #ffffff;
        }

        .heading-section-white .subheading {
            margin-bottom: 0;
            display: inline-block;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(255, 255, 255, .4);
        }


        ul.social {
            padding: 0;
        }

        ul.social li {
            display: inline-block;
            margin-right: 10px;
        }

        /*FOOTER*/

        .footer {
            border-top: 1px solid rgba(0, 0, 0, .05);
            color: rgba(0, 0, 0, .5);
        }

        .footer .heading {
            color: #000;
            font-size: 20px;
        }

        .footer ul {
            margin: 0;
            padding: 0;
        }

        .footer ul li {
            list-style: none;
            margin-bottom: 10px;
        }

        .footer ul li a {
            color: rgba(0, 0, 0, 1);
        }


        @media screen and (max-width: 500px) {}
    </style>


</head>

<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #222222;">
    <center style="width: 100%; background-color: #f1f1f1;">
        <div
            style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
            &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
        </div>
        <div style="max-width: 600px; margin: 0 auto;" class="email-container">
            <!-- BEGIN BODY -->
            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                style="margin: auto;">
                <tr>
                    <td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td class="logo" style="text-align: center;">
                                    <a href="#"><img width="50px"
                                            src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1735744097/360/zpibebpd5dopnxvttltd.png"></a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr><!-- end tr -->
                <tr>
                    <td valign="top" class="bg_white" style="padding: 0;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td width="60%" class="logo" style="text-align: center;">
                                    <ul class="navigation">
                                        <li><a href="https://360gadgetsafrica.com/product-listing?categoryId=6693a207de54aec5bdcdac71">Iphones</a></li>
                                        <li><a href="https://360gadgetsafrica.com/product-listing?categoryId=66bdb30df477a40cd5597863">Samsung</a></li>
                                        <li><a href="https://360gadgetsafrica.com/product-listing?categoryId=66bc53fcf477a40cd559785a">Google Pixel</a></li>
                                        <li><a href="https://360gadgetsafrica.com/product-listing?categoryId=6693a1b7eae4b1d9160fa213">Laptops</a></li>
                                        <li><a href="https://360gadgetsafrica.com/product-listing?categoryId=66939b495f023a03cf476d45">Accessories</a></li>
                                    </ul>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr><!-- end tr -->
                <tr>
                    <td valign="middle" class="hero hero-2 bg_white" style="padding: 2em 0 2em 0;">
                        <table>
                            <tr>
                                <td>
                                    <div class="text" style="padding: 0 2.5em; text-align: center;">
                                        <h2>Complete your <span>sign-in</span> by entering the <span>OTP</span> </h2>
                                    </div>
                                </td>
                            </tr>
                            <tr>

                                <td>
                                    <div  style="padding: 0 2.5em;  color: #424242;  font-size: 20px; margin-top: 18px; text-align: center; letter-spacing: 10px;"> <b>${code}</b> </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr><!-- end tr -->
                <tr>
                    <td valign="middle" class="bg_white" style="padding: 0em 0 1em;">
                        <table>
                            <tr>
                                <td>
                                    <div class="text" style="padding: 0 2.5em; text-align: center;">
                                        <p><a href="https://360gadgetsafrica.com" class="btn btn-black-outline">Continue!</a></p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr><!-- end tr -->
                <!-- 1 Column Text + Button : END -->
            </table>
            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                style="margin: auto;">
                <tr>
                    <td valign="middle" class="bg_white footer">
                        <table>
                            <tr style="text-align: center;">
                                <!-- <td valign="middle" width="60%" style="padding-top: 20px">
                                    <h3 class="heading">Stay Updated On Our Shopping</h3>
                                </td> -->
                                <td valign="middle" width="100%" style="padding-top: 20px; text-align: right;">
                                    <ul class="social">
                                        <li>   <a href="https://apps.apple.com/app/360gadgetsafrica/id6736353137?platform=iphone" target="_blank">
                                            <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731154161/ntsv2brfd8lboncvjavk.png"
                                                 alt="Download on the App Store"
                                                 style="width: 100px;" />
                                          </a>
                                        </li>
                                        <li> <a href="https://play.google.com/store/apps/details?id=com.gadgetsafrica.gadgetsafrica" target="_blank">
                                            <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731153650/ibfyv6toskeeikywuuv5.webp" 
                                                 alt="Download on Google Play"
                                                 style="width: 100px;" />
                                          </a>
                                        </li> 
                                    </ul>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr><!-- end: tr -->
                <tr>
                    <td class="bg_light" style="text-align: center; padding-left: 20px; padding-right: 20px;">
                        <p>No longer want to receive these email? You can <a href="$[LI:UNSUBSCRIBE]$ or $[LI:SUB_PREF]$"
                                style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
                    </td>
                </tr>
            </table>

        </div>
    </center>
</body>

</html>`
    },
    orderConfirmation: function ({ order, address, pickup }) {
        return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>360 Gadgets Africa – Your Ultimate Tech Destination!</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
    
            .header {
                text-align: center;
                padding-bottom: 20px;
            }
    
            .header img {
                max-width: 150px;
            }
    
            .content {
                padding: 20px;
            }
    
            .content h1 {
                font-size: 24px;
                color: #333;
                text-align: center;
            }
    
            .content p {
                font-size: 16px;
                line-height: 1.6;
                margin: 10px 0;
            }
    
            .content .credentials {
                background-color: #f9f9f9;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                font-family: monospace;
            }
    
            .content .credentials p {
                margin: 5px 0;
            }
    
            .content .button-container {
                text-align: center;
                margin-top: 20px;
            }
    
            .content .button-container a {
                display: inline-block;
                padding: 10px 20px;
                background-color: #FF4B2B;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
            }
    
            .footer {
                text-align: center;
                padding: 20px;
                font-size: 14px;
                color: #777;
            }
    
            .footer a {
                color: #FF4B2B;
                text-decoration: none;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <div class="content"> 
                <p>Dear our beloved customer, </p>
                <p>Thank you for shopping with us! We are excited to confirm that we have received your order. Below are the details of your purchase:
                <div class="credentials">
                    <ul style="margin: 0; padding-left: 2em;">
                       ${order.map((item) =>
            ` <li>
                            <p><strong>${item?.productId?.title} ${item?.size && item?.size}- </strong> <span> ₦${item?.productId?.discounted_price} x ${item?.qty}</span></p>
                        </li>`
        )}
                    </ul>
                </div>
              
                <div class="button-container">
                    <a href="https://360gadgetsafrica.com/profile" target="_blank">View your order</a>
                </div>
                <p>${pickup ? "Pickup " : "Shipping "} Address: </p>
                <p>${address?.name}, ${address?.street},</p>
                <p>${address?.state}, ${address.phone}.</p>
                <br />

                <p>Support team,</p>
                <p>360gadgetsafrica.</p>
            </div>
            <div class="footer">
                <p>360gadgetsafrica | <a href="https://360gadgetsafrica.com">www.360gadgetsafrica.com</a></p>
            </div>
        </div>
    </body>
    
    </html> `
    },
    newOrder: function ({ order, address, pickup, deliveryMethod }) {
        return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>360 Gadgets Africa – Your Ultimate Tech Destination!</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
    
            .header {
                text-align: center;
                padding-bottom: 20px;
            }
    
            .header img {
                max-width: 150px;
            }
    
            .content {
                padding: 20px;
            }
    
            .content h1 {
                font-size: 24px;
                color: #333;
                text-align: center;
            }
    
            .content p {
                font-size: 16px;
                line-height: 1.6;
                margin: 10px 0;
            }
    
            .content .credentials {
                background-color: #f9f9f9;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                font-family: monospace;
            }
    
            .content .credentials p {
                margin: 5px 0;
            }
    
            .content .button-container {
                text-align: center;
                margin-top: 20px;
            }
    
            .content .button-container a {
                display: inline-block;
                padding: 10px 20px;
                background-color: #FF4B2B;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
            }
    
            .footer {
                text-align: center;
                padding: 20px;
                font-size: 14px;
                color: #777;
            }
    
            .footer a {
                color: #FF4B2B;
                text-decoration: none;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <div class="content"> 
                <p>Hello 👋 </p>
                <p>We are excited to let you know that you have received a new order. Below are the details of the purchase:
                <div class="credentials">
                    <ul style="margin: 0; padding-left: 2em;">
                       ${order.map((item) =>
            ` <li>
                            <p><strong>${item?.productId?.title} ${item?.size && item?.size}- </strong> <span> ₦${item?.productId?.discounted_price} x ${item?.qty}</span></p>
                        </li>`
        )}
                    </ul>
                </div>
              
              
                <p>${pickup ? "Pickup " : "Shipping "} Address: </p>
                <p>${address?.name}, ${address?.street},</p>
                <p>${address?.state}, ${address.phone}.</p>
                <p>${deliveryMethod.deliveryType}</p>
                <br />

                <p>Support team,</p>
                <p>360gadgetsafrica.</p>
            </div>
            <div class="footer">
                <p>360gadgetsafrica | <a href="https://360gadgetsafrica.com">www.360gadgetsafrica.com</a></p>
            </div>
        </div>
    </body>
    
    </html> `
    },
    requestUpdate: function ({ title, description, slug, img }) {
        return `
    <!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <meta charset="utf-8"> <!-- utf-8 works for most cases -->
    <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
    <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
    <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->

    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">

    <!-- CSS Reset : BEGIN -->
    <style>
        /* What it does: Remove spaces around the email design added by some email clients. */
        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
        html,
        body {
            margin: 0 auto !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
            background: #f1f1f1;
        }

        /* What it does: Stops email clients resizing small text. */
        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        /* What it does: Centers email on Android 4.4 */
        div[style*="margin: 16px 0"] {
            margin: 0 !important;
        }

        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }

        /* What it does: Fixes webkit padding issue. */
        table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
        }

        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
            -ms-interpolation-mode: bicubic;
        }

        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
        a {
            text-decoration: none;
        }

        /* What it does: A work-around for email clients meddling in triggered links. */
        *[x-apple-data-detectors],
        /* iOS */
        .unstyle-auto-detected-links *,
        .aBn {
            border-bottom: 0 !important;
            cursor: default !important;
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
        .a6S {
            display: none !important;
            opacity: 0.01 !important;
        }

        /* What it does: Prevents Gmail from changing the text color in conversation threads. */
        .im {
            color: inherit !important;
        }

        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img+div {
            display: none !important;
        }

        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
        /* Create one of these media queries for each additional viewport size you'd like to fix */

        /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
        @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
            u~div .email-container {
                min-width: 320px !important;
            }
        }

        /* iPhone 6, 6S, 7, 8, and X */
        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
            u~div .email-container {
                min-width: 375px !important;
            }
        }

        /* iPhone 6+, 7+, and 8+ */
        @media only screen and (min-device-width: 414px) {
            u~div .email-container {
                min-width: 414px !important;
            }
        }
    </style>

    <!-- CSS Reset : END -->

    <!-- Progressive Enhancements : BEGIN -->
    <style>
        .primary {
            background: #ff4b2b;
        }

        .bg_white {
            background: #ffffff;
        }

        .bg_light {
            background: #fafafa;
        }

        .bg_black {
            background: #000000;
        }

        .bg_dark {
            background: rgba(0, 0, 0, .8);
        }

        .email-section {
            padding: 2.5em;
        }

        /*BUTTON*/
        .btn {
            padding: 5px 15px;
            display: inline-block;
        }

        .btn.btn-primary {
            border-radius: 5px;
            background: #ff4b2b;
            color: #ffffff;
        }

        .btn.btn-white {
            border-radius: 5px;
            background: #ffffff;
            color: #000000;
        }

        .btn.btn-white-outline {
            border-radius: 5px;
            background: transparent;
            border: 1px solid #fff;
            color: #fff;
        }

        .btn.btn-black-outline {
            border-radius: 0px;
            background: transparent;
            border: 2px solid #000;
            color: #000;
            font-weight: 700;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            font-family: 'Lato', sans-serif;
            color: #000000;
            margin-top: 0;
            font-weight: 400;
        }

        body {
            font-family: 'Lato', sans-serif;
            font-weight: 400;
            font-size: 15px;
            line-height: 1.8;
            color: rgba(0, 0, 0, .4);
        }

        a {
            color: #ff4b2b;
        }

        table {}

        /*LOGO*/

        .logo h1 {
            margin: 0;
        }

        .logo h1 a {
            color: #000000;
            font-size: 20px;
            font-weight: 700;
            text-transform: uppercase;
            font-family: 'Lato', sans-serif;
            border: 2px solid #000;
            padding: .2em 1em;
        }

        .navigation {
            padding: 0;
            padding: 1em 0;
            /*background: rgba(0,0,0,1);*/
            border-top: 1px solid rgba(0, 0, 0, .05);
            border-bottom: 1px solid rgba(0, 0, 0, .05);
        }

        .navigation li {
            list-style: none;
            display: inline-block;
            ;
            margin-left: 5px;
            margin-right: 5px;
            font-size: 13px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .navigation li a {
            color: rgba(0, 0, 0, 1);
        }

        /*HERO*/
        .hero {
            position: relative;
            z-index: 0;
        }

        .hero .text {
            color: rgba(0, 0, 0, .3);
        }

        .hero .text h2 {
            color: #000;
            font-size: 30px;
            margin-bottom: 0;
            font-weight: 300;
        }

        .hero .text h2 span {
            font-weight: 600;
            color: #ff4b2b;
        }


        /*HEADING SECTION*/
        .heading-section {}

        .heading-section h2 {
            color: #000000;
            font-size: 28px;
            margin-top: 0;
            line-height: 1.4;
            font-weight: 400;
        }

        .heading-section .subheading {
            margin-bottom: 20px !important;
            display: inline-block;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(0, 0, 0, .4);
            position: relative;
        }

        .heading-section .subheading::after {
            position: absolute;
            left: 0;
            right: 0;
            bottom: -10px;
            content: '';
            width: 100%;
            height: 2px;
            background: #ff4b2b;
            margin: 0 auto;
        }

        .heading-section-white {
            color: rgba(255, 255, 255, .8);
        }

        .heading-section-white h2 {
            font-family:
                line-height: 1;
            padding-bottom: 0;
        }

        .heading-section-white h2 {
            color: #ffffff;
        }

        .heading-section-white .subheading {
            margin-bottom: 0;
            display: inline-block;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(255, 255, 255, .4);
        }


        ul.social {
            padding: 0;
        }

        ul.social li {
            display: inline-block;
            margin-right: 10px;
        }

        /*FOOTER*/

        .footer {
            border-top: 1px solid rgba(0, 0, 0, .05);
            color: rgba(0, 0, 0, .5);
        }

        .footer .heading {
            color: #000;
            font-size: 20px;
        }

        .footer ul {
            margin: 0;
            padding: 0;
        }

        .footer ul li {
            list-style: none;
            margin-bottom: 10px;
        }

        .footer ul li a {
            color: rgba(0, 0, 0, 1);
        }


        @media screen and (max-width: 500px) {}
    </style>


</head>

<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #222222;">
    <center style="width: 100%; background-color: #f1f1f1;">
        <div
            style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
            &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
        </div>
        <div style="max-width: 600px; margin: 0 auto;" class="email-container">
            <!-- BEGIN BODY -->
            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                style="margin: auto;">
                <tr>
                    <td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td class="logo" style="text-align: center;">
                                    <a href="#"><img width="50px"
                                            src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1735744097/360/zpibebpd5dopnxvttltd.png"></a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr><!-- end tr -->
                <tr>
                    <td valign="top" class="bg_white" style="padding: 0;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td width="60%" class="logo" style="text-align: center;">
                                    <ul class="navigation">
                                        <li><a href="https://360gadgetsafrica.com/product-listing?categoryId=6693a207de54aec5bdcdac71">Iphones</a></li>
                                        <li><a href="https://360gadgetsafrica.com/product-listing?categoryId=66bdb30df477a40cd5597863">Samsung</a></li>
                                        <li><a href="https://360gadgetsafrica.com/product-listing?categoryId=66bc53fcf477a40cd559785a">Google Pixel</a></li>
                                        <li><a href="https://360gadgetsafrica.com/product-listing?categoryId=6693a1b7eae4b1d9160fa213">Laptops</a></li>
                                        <li><a href="https://360gadgetsafrica.com/product-listing?categoryId=66939b495f023a03cf476d45">Accessories</a></li>
                                    </ul>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr><!-- end tr -->
                <tr>
                    <td valign="middle" class="hero hero-2 bg_white" style="padding: 2em 0 4em 0;">
                        <table>
                            <tr>
                                <td>
                                    <div class="text" style="padding: 0 2.5em; text-align: center;">
                                        <h2>We have an <span>Update</span> for <span>You :)</span> </h2>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr><!-- end tr -->
                <tr>
                    <td class="bg_white">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td class="bg_light email-section" style="padding: 0; width: 100%;">
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="middle" width="50%">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0"
                                                    width="100%">
                                                    <tr>
                                                        <td class="text-services"
                                                            style="text-align: left; padding: 20px 30px;">
                                                            <div class="heading-section">
                                                                <h2 style="font-size: 22px;">${title}</h2>
                                                                <p>${description}</p>
                                                                <p><a href="https://360gadgetsafrica.com/product-details/${slug}" class="btn btn-primary">See more</a></p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                            <td valign="middle" width="50%">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0"
                                                    width="100%">
                                                    <tr>
                                                        <td>
                                                            <img src="${img}" alt=""
                                                                style="width: 100%; max-width: 600px; height: auto; margin: auto; display: block;">
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr><!-- end: tr -->
                        </table>
                    </td>
                </tr><!-- end:tr -->
                <tr>
                    <td valign="middle" class="bg_white" style="padding: 2em 0;">
                        <table>
                            <tr>
                                <td>
                                    <div class="text" style="padding: 0 2.5em; text-align: center;">
                                        <p><a href="https://360gadgetsafrica.com" class="btn btn-black-outline">Continue Shopping</a></p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr><!-- end tr -->
                <!-- 1 Column Text + Button : END -->
            </table>
            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                style="margin: auto;">
                <tr>
                    <td valign="middle" class="bg_white footer">
                        <table>
                            <tr style="text-align: center;">
                                <!-- <td valign="middle" width="60%" style="padding-top: 20px">
                                    <h3 class="heading">Stay Updated On Our Shopping</h3>
                                </td> -->
                                <td valign="middle" width="100%" style="padding-top: 20px; text-align: right;">
                                    <ul class="social">
                                        <li>   <a href="https://apps.apple.com/app/360gadgetsafrica/id6736353137?platform=iphone" target="_blank">
                                            <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731154161/ntsv2brfd8lboncvjavk.png"
                                                 alt="Download on the App Store"
                                                 style="width: 100px;" />
                                          </a>
                                        </li>
                                        <li> <a href="https://play.google.com/store/apps/details?id=com.gadgetsafrica.gadgetsafrica" target="_blank">
                                            <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731153650/ibfyv6toskeeikywuuv5.webp" 
                                                 alt="Download on Google Play"
                                                 style="width: 100px;" />
                                          </a>
                                        </li> 
                                    </ul>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr><!-- end: tr -->
                <tr>
                    <td class="bg_light" style="text-align: center; padding-left: 20px; padding-right: 20px;">
                        <p>No longer want to receive these email? You can <a href="$[LI:UNSUBSCRIBE]$ or $[LI:SUB_PREF]$"
                                style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
                    </td>
                </tr>
            </table>

        </div>
    </center>
</body>

</html>`
    }
}