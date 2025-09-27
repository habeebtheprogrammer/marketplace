const moment = require("moment")

const calculateReadTime = (text, wordsPerMinute = 200) => {
  if (!text) return "0 min read";
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  return `${minutes} min read`;
}

module.exports = {
  welcome_email: function () {
    return ` <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>360GadgetsAfrica - Why Choose Us</title>
  <style>

ul.social {
            padding: 0;
        }

        ul.social li {
            display: inline-block;
            margin-right: 10px;
        }

     
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

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8f9fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
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
            </tr>
          <tr>
            <td class="mobile-padding" style="padding:10px 40px 30px 40px; text-align:center;">
              <h1 style="margin:0; font-size:30px; font-weight:700; color:#292929; line-height:1.2; font-family:'Playfair Display', Georgia, serif;">
                Why Choose Us?
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-bottom:1px solid #e6e6e6;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="mobile-padding" style="padding:30px 40px 20px 40px;">
              <h2 style="margin:0; font-size:16px; font-weight:600; color:#292929; text-transform:uppercase; letter-spacing:0.5px;">
                Our Value Proposition:
              </h2>
            </td>
          </tr>

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
                    <img class="img-col-img" src="https://terra01.s3.amazonaws.com/images/vtu.png" alt="Top-up services" width="100"  style="width:100%; max-width:120px; border-radius:4px; display:block;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" bgcolor="#ffffff" style="padding: 0px 40px 30px;">
              <p style="border:1px solid #000; border-radius:6px; padding:12px 28px; display:inline-block; margin:0;">
                <a href="https://360gadgetsafrica.com" target="_blank" 
                  style="font-size:16px; font-weight:600; text-decoration:none; color:#000; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  SHOP NOW
                </a>
              </p>
            </td>
          </tr>


          <tr>
          <td class="mobile-padding" style="padding: 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffd93d; border-radius: 6px;">
                  <tr>
                      <td style="padding: 20px; text-align: center;">
                          <p style="margin: 0; font-size: 12px; color: #e91e63; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">NEED HELP?</p>
                          <h2 class="mobile-h2" style="margin: 0; font-size: 18px; font-weight: bold; color: #292929; line-height: 1.2;">If you have any questions, reply to this email our team is always ready to help.</h2>
                      </td>
                  </tr>
              </table>
          </td>
      </tr>
          <tr >
            <td valign="middle" width="100%" style="padding: 20px 30px 0px; border-top: 1px solid #e0e0e0; background-color: #f8f9fa;">
                <ul  style="padding: 0;">
                    <li style="display: inline-block; margin-right: 10px;">   <a href="https://apps.apple.com/app/360gadgetsafrica/id6736353137?platform=iphone" target="_blank">
                        <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731154161/ntsv2brfd8lboncvjavk.png"
                             alt="Download on the App Store"
                             style="width: 100px;" />
                      </a>
                    </li>
                    <li style="display: inline-block; margin-right: 10px;"> <a href="https://play.google.com/store/apps/details?id=com.gadgetsafrica.gadgetsafrica" target="_blank">
                        <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731153650/ibfyv6toskeeikywuuv5.webp" 
                             alt="Download on Google Play"
                             style="width: 100px;" />
                      </a>
                    </li> 
                </ul>
            </td>
        </tr>
        <tr >
            <td style="padding: 20px 30px;background-color: #f8f9fa; ">
                
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.4;">
                    © 2025 Team 360 Ventures RC 7927753. All rights reserved
                </p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                    At 360GadgetsAfrica, we power smarter shopping, and instant access to the gadgets you love. 
                </p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                     No longer want to receive these email? You can <a href="https://360gadgetsafrica.com/unsubscribe"
                    style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
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
  ambassador_program_invite: function ({ fullName = "there" } = {}) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>360GadgetsAfrica - Student Ambassador Program</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; border-radius: 0 !important; }
      .mobile-padding { padding: 20px !important; }
    }
  </style>
  <!--[if mso]>
  <style>
    .fallback-button { background:#000 !important; }
  </style>
  <![endif]-->
  </head>
  <body style="margin:0; padding:0; background-color:#f8f9fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8f9fa;">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <tr>
              <td valign="top" style="padding: 16px 40px 0; text-align:center;">
                <a href="https://360gadgetsafrica.com"><img width="50" src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1735744097/360/zpibebpd5dopnxvttltd.png" alt="360GadgetsAfrica"></a>
              </td>
            </tr>
            <tr>
              <td class="mobile-padding" style="padding:10px 40px 10px; text-align:center;">
                <h1 style="margin:0; font-size:26px; font-weight:700; color:#292929; line-height:1.2; font-family:'Playfair Display', Georgia, serif;">
                  You're Invited, ${fullName}!
                </h1>
                <p style="margin:10px 0 0; font-size:14px; color:#666;">Join the 360 Gadgets Africa Student Ambassador Program</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px;">
                <table role="presentation" width="100%"><tr><td style="border-bottom:1px solid #e6e6e6;"></td></tr></table>
              </td>
            </tr>
            <tr>
              <td class="mobile-padding" style="padding:20px 40px 10px;">
                <p style="margin:0 0 14px; font-size:15px; color:#333; line-height:1.6;">
                  Do you love gadgets, technology, and connecting with people? 360 Gadgets Africa is launching a Student Ambassador Program and we’re looking for energetic, influential students from your campus to join us!
                </p>
                <h3 style="margin:16px 0 10px; font-size:16px; font-weight:700; color:#292929;">What’s in it for you?</h3>
                <ul style="margin:0; padding-left:18px; font-size:14px; color:#555; line-height:1.7;">
                  <li>Be recognized as an official 360 Gadgets Africa Student Ambassador</li>
                  <li>Gain leadership and marketing experience that stands out on your CV</li>
                  <li>Get exclusive rewards from discounts to commissions and more</li>
                  <li>Access to exciting events, giveaways, and insider perks</li>
                </ul>
                <h3 style="margin:16px 0 10px; font-size:16px; font-weight:700; color:#292929;">Your Role</h3>
                <p style="margin:0 0 14px; font-size:15px; color:#333; line-height:1.6;">
                  Use your influence to represent 360 Gadgets Africa in your school — helping students discover how to buy, repair, finance, and top-up their gadgets with ease.
                </p>
                <div style="margin:18px 0 22px; text-align:center;">
                  <a href="https://chat.whatsapp.com/H19qwMrILUrGP6o9I58puP" target="_blank" style="background:#000; color:#fff; text-decoration:none; padding:12px 22px; border-radius:6px; font-weight:600; display:inline-block;">Join Now</a>
                </div>
                <p style="margin:0; font-size:12px; color:#777; line-height:1.6;">
                  By applying to or participating in the Student Ambassador Program, you agree to comply with the Terms of Use and any program-specific guidelines communicated to you. Participation is voluntary and may be modified or discontinued at any time at the discretion of 360GadgetsAfrica.
                </p>
              </td>
            </tr>
            <tr>
              <td class="mobile-padding" style="padding: 25px 40px 10px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffd93d; border-radius: 6px;">
                  <tr>
                    <td style="padding: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #e91e63; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">NEED HELP?</p>
                      <h2 class="mobile-h2" style="margin: 0; font-size: 18px; font-weight: bold; color: #292929; line-height: 1.2;">If you have any questions, reply to this email — our team is always ready to help.</h2>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 30px 25px; background-color: #f8f9fa;">
                <ul style="padding:0; margin:0; list-style:none; text-align:left;">
                  <li style="display:inline-block; margin-right:10px;">
                    <a href="https://apps.apple.com/app/360gadgetsafrica/id6736353137?platform=iphone" target="_blank">
                      <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731154161/ntsv2brfd8lboncvjavk.png" alt="Download on the App Store" style="width:100px;" />
                    </a>
                  </li>
                  <li style="display:inline-block; margin-right:10px;">
                    <a href="https://play.google.com/store/apps/details?id=com.gadgetsafrica.gadgetsafrica" target="_blank">
                      <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731153650/ibfyv6toskeeikywuuv5.webp" alt="Download on Google Play" style="width:100px;" />
                    </a>
                  </li>
                </ul>
                <p style="margin: 12px 0 8px; font-size: 12px; color: #999999; line-height: 1.4;">© 2025 Team 360 Ventures RC 7927753. All rights reserved</p>
                <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.5;">At 360GadgetsAfrica, we power smarter shopping, seamless payments, and instant access to the gadgets you love.</p>
                <p style="margin: 8px 0 0; font-size: 12px; color: #999999; line-height: 1.5;">No longer want to receive these email? You can <a href="https://360gadgetsafrica.com/terms" style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
  },
  getting_started: function () {
    return `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>How It Works - Email Template</title>
    <style>
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        ul.social {
            padding: 0;
        }

        ul.social li {
            display: inline-block;
            margin-right: 10px;
        }

     

        /* Mobile styles */
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                max-width: 100% !important;
            }
            
            .mobile-padding {
                padding: 20px !important;
            }
            
            .mobile-stack {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
            }
            
            .mobile-center {
                text-align: center !important;
            }
            
            .step-table {
                width: 100% !important;
            }
            
            .step-cell {
                display: block !important;
                width: 100% !important;
                padding: 0 0 30px 0 !important;
            }
            
            .mobile-h1 {
                font-size: 28px !important;
                line-height: 1.2 !important;
            }
            
            .mobile-h2 {
                font-size: 20px !important;
                line-height: 1.3 !important;
            }
            
            .mobile-button {
                padding: 12px 24px !important;
                font-size: 14px !important;
            }
        }
        
        /* Outlook fixes */
        .ExternalClass {
            width: 100%;
        }
        
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: 100%;
        }
    </style>
    <!--[if mso]>
    <nxml:namespace xmlns:nxml="http://www.w3.org/1999/xhtml" />
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
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
                    </tr>
                    <tr>
                        <td class="mobile-padding" style="padding:20px 40px 20px; text-align:center;">
                          <h1 class="mobile-h1" style="margin:0; font-size:30px; font-weight:700; color:#292929; line-height:1.2; font-family:'Playfair Display', Georgia, serif;">
                            Shopping for gadgets has never been easier:
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 40px;">
                          <table role="presentation" width="100%">
                            <tr><td style="border-bottom:1px solid #e6e6e6;"></td></tr>
                          </table>
                        </td>
                      </tr>
              
                    <tr>
                        <td class="mobile-padding" style="padding: 50px 40px 20px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="step-table">
                                <tr>
                                    <!-- Step 1 -->
                                    <td class="step-cell mobile-center" width="25%" style="vertical-align: top; text-align: center; padding: 0 10px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="50" align="center" style="margin-bottom: 15px;">
                                            <tr>
                                                <td style="background-color: #eee; width: 40px; height: 50px; border-radius: 55%; text-align: center; vertical-align: middle; font-size: 16px; font-weight: bold; color: #000;">1</td>
                                            </tr>
                                        </table>
                                        <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #292929; line-height: 1.3;">Browse & Discover</h3>
                                        <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.4;">Explore a wide range of smartphones, gadgets, and accessories tailored to your needs.</p>
                                    </td>
                                    
                                    <!-- Step 2 -->
                                    <td class="step-cell mobile-center" width="25%" style="vertical-align: top; text-align: center; padding: 0 10px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="50" align="center" style="margin-bottom: 15px;">
                                            <tr>
                                                <td style="background-color: #000; width: 50px; height: 50px; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 20px; font-weight: bold; color: #ffffff;">2</td>
                                            </tr>
                                        </table>
                                        <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #292929; line-height: 1.3;">Add to Cart</h3>
                                        <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.4;">Add your desired items to your cart and proceed to checkout.</p>
                                    </td>
                                    
                                  <!-- Step 1 -->
                                  <td class="step-cell mobile-center" width="25%" style="vertical-align: top; text-align: center; padding: 0 10px;">
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="50" align="center" style="margin-bottom: 15px;">
                                        <tr>
                                            <td style="background-color: #eee; width: 40px; height: 50px; border-radius: 55%; text-align: center; vertical-align: middle; font-size: 16px; font-weight: bold; color: #000;">3</td>
                                        </tr>
                                    </table>
                                    <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #292929; line-height: 1.3;">Secure Checkout with Wallet</h3>
                                    <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.4;">Pay securely using your wallet and receive your order within 24 hours.</p>
                                </td>
                                    
                                
                                </tr>
                            </table>
                        </td>
                    </tr>

                 

                    <tr>
                        <td class="mobile-padding" style="padding: 30px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffd93d; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <p style="margin: 0; font-size: 12px; color: #e91e63; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">NEED HELP?</p>
                                        <h2 class="mobile-h2" style="margin: 0; font-size: 18px; font-weight: bold; color: #292929; line-height: 1.2;">If you have any questions, reply to this email our team is always ready to help.</h2>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 20px 30px 40px; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                                <tr>
                                    <td style="background-color: #000; border-radius: 6px;">
                                        <a href="https://360gadgetsafrica.com" class="mobile-button" style="display: inline-block; color: #ffffff; text-decoration: none; padding: 15px 30px; font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">GET STARTED</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr >
                        <td valign="middle" width="100%" style="padding: 20px 30px 0px; border-top: 1px solid #e0e0e0; background-color: #f8f9fa;">
                            <ul  style="padding: 0;">
                                <li style="display: inline-block; margin-right: 10px;">   <a href="https://apps.apple.com/app/360gadgetsafrica/id6736353137?platform=iphone" target="_blank">
                                    <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731154161/ntsv2brfd8lboncvjavk.png"
                                         alt="Download on the App Store"
                                         style="width: 100px;" />
                                  </a>
                                </li>
                                <li style="display: inline-block; margin-right: 10px;"> <a href="https://play.google.com/store/apps/details?id=com.gadgetsafrica.gadgetsafrica" target="_blank">
                                    <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731153650/ibfyv6toskeeikywuuv5.webp" 
                                         alt="Download on Google Play"
                                         style="width: 100px;" />
                                  </a>
                                </li> 
                            </ul>
                        </td>
                    </tr>
                    <tr >
                        <td style="padding: 20px 30px;background-color: #f8f9fa; ">
                            
                            <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.4;">
                                © 2025 Team 360 Ventures RC 7927753. All rights reserved
                            </p>
                            <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                                At 360GadgetsAfrica, we power smarter shopping, and instant access to the gadgets you love. 
                            </p>
                            <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                                 No longer want to receive these email? You can <a href="https://360gadgetsafrica.com/terms"
                                style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
                        </td>
                    </tr>
                  
                </table>
                
            </td>
        </tr>
    </table>

    <!--[if !mso]><!-->
    <style>
        @media only screen and (max-width: 480px) {
            .step-container {
                display: block !important;
                width: 100% !important;
                margin-bottom: 30px !important;
            }
        }
    </style>
    <!--<![endif]-->

</body>
</html>
`
  },
  first_purchase_discount: function () {
    return `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>360GadgetsAfrica - VTU Promo</title>
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

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8f9fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <tr>
            <td valign="top" style="padding: 1em 2.5em 0 2.5em; text-align:center;">
              <a href="https://360gadgetsafrica.com"><img width="50px" src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1735744097/360/zpibebpd5dopnxvttltd.png" alt="360GadgetsAfrica"></a>
            </td>
          </tr>

          <tr>
            <td class="mobile-padding" style="padding:20px 40px 10px 40px; text-align:center;">
              <h1 style="margin:0; font-size:30px; font-weight:700; color:#292929; line-height:1.2; font-family:'Playfair Display', Georgia, serif;">
                🎉 Exclusive VTU Promo Just for You!
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%">
                <tr><td style="border-bottom:1px solid #e6e6e6;"></td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="mobile-padding" style="padding:30px 40px;">
              <h2 style="margin:0 0 20px 0; font-size:18px; font-weight:600; color:#292929;">
                Enjoy Airtime & Data with BIG Rewards 🚀
              </h2>
              <ul style="margin:0; padding-left:20px; font-size:15px; color:#555; line-height:1.7;">
                <li><strong>50% OFF</strong> your first data purchase with promo code: <strong style="color:#d9534f;">GANUSI</strong></li>
                <li>Earn <strong>₦20 cashback per GB</strong> you buy </li>
                <li>Get <strong>₦30 per GB</strong> whenever your referrals buy data </li>
              </ul>
            </td>
          </tr>

          <!-- Image & Highlight -->
          <tr>
            <td class="mobile-padding" style="padding:0 40px 30px 40px;">
              <table role="presentation" class="force-row" width="100%">
                <tr>
                  <td class="force-cell text-col" style="vertical-align:top; padding-right:20px;">
                    <p style="margin:0 0 16px 0; font-size:14px; color:#757575; line-height:1.6;">
                      Don’t miss this limited-time awoof offer. Save more, earn cashback, and while helping your friends stay connected!
                    </p>
                  </td>
                  <td class="force-cell img-col" style="vertical-align:top;">
                    <img class="img-col-img" src="https://terra01.s3.amazonaws.com/images/vtu.png" alt="Data top-up promo" width="100" style="border-radius:4px; display:block;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0px 40px 30px;">
              <p style="border:1px solid #000; border-radius:6px; padding:12px 28px; display:inline-block; margin:0;">
                <a href="https://360gadgetsafrica.com/vtu" target="_blank" 
                  style="font-size:16px; font-weight:600; text-decoration:none; color:#000;">
                  APPLY IT NOW
                </a>
              </p>
            </td>
          </tr>


          <tr>
          <td class="mobile-padding" style="padding: 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffd93d; border-radius: 6px;">
                  <tr>
                      <td style="padding: 20px; text-align: center;">
                          <p style="margin: 0; font-size: 12px; color: #e91e63; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">NEED HELP?</p>
                          <h2 class="mobile-h2" style="margin: 0; font-size: 18px; font-weight: bold; color: #292929; line-height: 1.2;">If you have any questions, reply to this email our team is always ready to help.</h2>
                      </td>
                  </tr>
              </table>
          </td>
      </tr>
          <tr >
            <td valign="middle" width="100%" style="padding: 20px 30px 0px; border-top: 1px solid #e0e0e0; background-color: #f8f9fa;">
                <ul  style="padding: 0;">
                    <li style="display: inline-block; margin-right: 10px;">   <a href="https://apps.apple.com/app/360gadgetsafrica/id6736353137?platform=iphone" target="_blank">
                        <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731154161/ntsv2brfd8lboncvjavk.png"
                             alt="Download on the App Store"
                             style="width: 100px;" />
                      </a>
                    </li>
                    <li style="display: inline-block; margin-right: 10px;"> <a href="https://play.google.com/store/apps/details?id=com.gadgetsafrica.gadgetsafrica" target="_blank">
                        <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731153650/ibfyv6toskeeikywuuv5.webp" 
                             alt="Download on Google Play"
                             style="width: 100px;" />
                      </a>
                    </li> 
                </ul>
            </td>
        </tr>
        <tr >
            <td style="padding: 20px 30px;background-color: #f8f9fa; ">
                
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.4;">
                    © 2025 Team 360 Ventures RC 7927753. All rights reserved
                </p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                    At 360GadgetsAfrica, we power smarter shopping, and instant access to the gadgets you love. 
                </p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                     No longer want to receive these email? You can <a href="https://360gadgetsafrica.com/terms"
                    style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
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
  cart_reminder: function ({ cartItems }) {
    return `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title> You left something behind</title>
  <style>
      body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
         
         

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
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f8f9fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8f9fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td class="mobile-padding" style="padding:40px 40px 30px 40px; text-align:center;">
              <h1 style="margin:0; font-size:30px; font-weight:700; color:#292929; line-height:1.2; font-family:'Playfair Display', Georgia, serif;">
                 You left something behind
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-bottom:1px solid #e6e6e6;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="mobile-padding" style="padding:30px 40px 20px 40px;">
              <h2 style="margin:0; font-size:16px; font-weight:600; color:#292929; text-transform:uppercase; letter-spacing:0.5px;">
                Your cart is waiting – Don’t miss out!
              </h2>
            </td>
          </tr>

          ${cartItems.map((item) => ` <tr>
            <td style="padding: 0 32px 24px 32px;" class="mobile-padding">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td width="80" style="vertical-align: top; padding-right: 16px;">
                            <img src=${item.productId?.images?.[0]} alt=${item.productId?.title} class="product-image" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;" />
                        </td>
                        <td style="vertical-align: top;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td>
                                        <h3 class="product-title" style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a; line-height: 1.3;">${item.productId?.title}</h3>
                                        <p style="margin: 0; font-size: 14px; color: #666666;">
                                            <span style="text-decoration: line-through; color: #999999;">₦${item.productId?.original_price}</span>
                                            <span class="price-text" style="font-weight: 600; color: #1a1a1a; margin-left: 8px;">₦${item.productId?.discounted_price}</span>
                                        </p>
                                    </td>
                                    
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`)}
         
          <tr>
      <td align="center" bgcolor="#ffffff" style="padding: 0px 40px 10px; " >
        <p style="border:1px solid #000; border-radius:6px; padding:12px 28px;">
            <a href="https://360gadgetsafrica.com/cart" target="_blank" 
           style="font-size:16px; font-weight:600; text-decoration:none; color:#000; display:inline-block; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          CHECKOUT
        </a>
        </p>
      </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="padding: 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffd93d; border-radius: 6px;">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #e91e63; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">NEED HELP?</p>
                            <h2 class="mobile-h2" style="margin: 0; font-size: 18px; font-weight: bold; color: #292929; line-height: 1.2;">If you have any questions, reply to this email our team is always ready to help.</h2>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
          <tr >
            <td valign="middle" width="100%" style="padding: 20px 30px 0px; border-top: 1px solid #e0e0e0; background-color: #f8f9fa;">
                <ul  style="padding: 0;">
                    <li style="display: inline-block; margin-right: 10px;">   <a href="https://apps.apple.com/app/360gadgetsafrica/id6736353137?platform=iphone" target="_blank">
                        <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731154161/ntsv2brfd8lboncvjavk.png"
                             alt="Download on the App Store"
                             style="width: 100px;" />
                      </a>
                    </li>
                    <li style="display: inline-block; margin-right: 10px;"> <a href="https://play.google.com/store/apps/details?id=com.gadgetsafrica.gadgetsafrica" target="_blank">
                        <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731153650/ibfyv6toskeeikywuuv5.webp" 
                             alt="Download on Google Play"
                             style="width: 100px;" />
                      </a>
                    </li> 
                </ul>
            </td>
        </tr>
        <tr >
            <td style="padding: 20px 30px;background-color: #f8f9fa; ">
                
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.4;">
                    © 2025 Team 360 Ventures RC 7927753. All rights reserved
                </p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                    At 360GadgetsAfrica, we power smarter shopping, and instant access to the gadgets you love. 
                </p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                     No longer want to receive these email? You can <a href="https://360gadgetsafrica.com/terms"
                    style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
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
  reviews: function () {
    return `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trends Today.</title>
  <style>
      body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
         
         
        .reviews-container {
      padding: 0 20px 40px 20px;
    }
    .review-card {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 20px;
      text-align: left;
    }
    .review-avatar {
      border-radius: 50%;
      margin-right: 12px;
    }
    .review-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .customer-name {
      font-weight: bold;
      font-size: 16px;
      color: #0f172a;
    }
    .review-text {
      font-size: 14px;
      color: #334155;
      line-height: 1.5;
    } 
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
         .stack-column,
      .stack-column td {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      .review-card {
        margin-bottom: 16px !important;
      }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f8f9fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8f9fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td class="mobile-padding" style="padding:40px 40px 30px 40px; text-align:center;">
              <h1 style="margin:0; font-size:30px; font-weight:700; color:#292929; line-height:1.2; font-family:'Playfair Display', Georgia, serif;">
                 Get to know our Customers.
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-bottom:1px solid #e6e6e6;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="mobile-padding" style="padding:30px 40px 20px 40px;">
              <h2 style="margin:0; font-size:16px; font-weight:600; color:#292929; text-transform:uppercase; letter-spacing:0.5px;">
                Why Our Customers Love Us:
              </h2>
            </td>
          </tr>

              <!-- Reviews Section -->
              <tr>
                <td class="reviews-container">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr class="stack-column">
                      <!-- Review 1 -->
                      <td width="48%" style="padding: 10px;" class="stack-column">
                        <div class="review-card">
                          <div class="review-header">
                            <img src="https://terra01.s3.amazonaws.com/images/KHAALID.jpeg" width="40" height="40" alt="Avatar" class="review-avatar">
                            <span class="customer-name">Khaalid S.</span>
                          </div>
                          <p class="review-text">
                            “I've had seamless transactions since I've downloaded the app. Also, the funding and withdrawal is seemless too. It's a very easy to use app with a user experience and a beautiful UI. I recommend”
                          </p>
                        </div>
                      </td>
        
                      <!-- Review 2 -->
                      <td width="48%" style="padding: 10px;" class="stack-column">
                        <div class="review-card">
                          <div class="review-header">
                            <img src="https://terra01.s3.amazonaws.com/images/1734540460807.jpeg" width="40" height="40" alt="Avatar" class="review-avatar">
                            <span class="customer-name">Abdullateef R.</span>
                          </div>
                          <p class="review-text">
                            “It's amazing how I get cashbacks for data and airtime purchases, to think it is also an awoof package. WOW!!!”
                          </p>
                        </div>
                      </td>
                    </tr>
        
                    <tr class="stack-column">
                      <!-- Review 3 -->
                      <td width="48%" style="padding: 10px;" class="stack-column">
                        <div class="review-card">
                          <div class="review-header">
                            <img src="https://terra01.s3.amazonaws.com/images/serifdeen-soleye.jpg" width="40" height="40" alt="Avatar" class="review-avatar">
                            <span class="customer-name">Sheriff S.</span>
                          </div>
                          <p class="review-text">
                            “I really do love this app it has a unique user interface which by the way is very easy to navigate through it also offers very fast transfer services. The cheap data feature it just awesome”
                          </p>
                        </div>
                      </td>
        
                      <!-- Review 4 -->
                      <td width="48%" style="padding: 10px;" class="stack-column">
                        <div class="review-card">
                          <div class="review-header">
                            <img src="https://terra01.s3.amazonaws.com/images/PHOTO-2025-08-20-12-05-12.jpg" width="40" height="40" alt="Avatar" class="review-avatar">
                            <span class="customer-name">Abdulgafar S.</span>
                          </div>
                          <p class="review-text">
                            "My favorite thing about the app asides the sleekness and comfortable user experience is the prompt notifications about possible downtimes and the speed of service restoration"
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
          <tr>


          <tr>
          <td class="mobile-padding" style="padding: 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffd93d; border-radius: 6px;">
                  <tr>
                      <td style="padding: 20px; text-align: center;">
                          <p style="margin: 0; font-size: 12px; color: #e91e63; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">NEED HELP?</p>
                          <h2 class="mobile-h2" style="margin: 0; font-size: 18px; font-weight: bold; color: #292929; line-height: 1.2;">If you have any questions, reply to this email our team is always ready to help.</h2>
                      </td>
                  </tr>
              </table>
          </td>
      </tr>
      <td align="center" bgcolor="#ffffff" style="padding: 0px 40px 10px; " >
        <p style="border:1px solid #000; border-radius:6px; padding:12px 28px;">
            <a href="https://360gadgetsafrica.com/blog" target="_blank" 
           style="font-size:16px; font-weight:600; text-decoration:none; color:#000; display:inline-block; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Explore More
        </a>
        </p>
      </td>
          </tr>
          <tr >
            <td valign="middle" width="100%" style="padding: 20px 30px 0px; border-top: 1px solid #e0e0e0; background-color: #f8f9fa;">
                <ul  style="padding: 0;">
                    <li style="display: inline-block; margin-right: 10px;">   <a href="https://apps.apple.com/app/360gadgetsafrica/id6736353137?platform=iphone" target="_blank">
                        <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731154161/ntsv2brfd8lboncvjavk.png"
                             alt="Download on the App Store"
                             style="width: 100px;" />
                      </a>
                    </li>
                    <li style="display: inline-block; margin-right: 10px;"> <a href="https://play.google.com/store/apps/details?id=com.gadgetsafrica.gadgetsafrica" target="_blank">
                        <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731153650/ibfyv6toskeeikywuuv5.webp" 
                             alt="Download on Google Play"
                             style="width: 100px;" />
                      </a>
                    </li> 
                </ul>
            </td>
        </tr>
        <tr >
            <td style="padding: 20px 30px;background-color: #f8f9fa; ">
                
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.4;">
                    © 2025 Team 360 Ventures RC 7927753. All rights reserved
                </p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                    At 360GadgetsAfrica, we power smarter shopping, and instant access to the gadgets you love. 
                </p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                     No longer want to receive these email? You can <a href="https://360gadgetsafrica.com/unsubscribe"
                    style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
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
  daily_blog_digest: function ({ user, posts, date }) {
    return `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trends Today.</title>
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
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f8f9fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8f9fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td class="mobile-padding" style="padding:40px 40px 30px 40px; text-align:center;">
              <h1 style="margin:0; font-size:30px; font-weight:700; color:#292929; line-height:1.2; font-family:'Playfair Display', Georgia, serif;">
                Trends Today.
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-bottom:1px solid #e6e6e6;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="mobile-padding" style="padding:30px 40px 20px 40px;">
              <h2 style="margin:0; font-size:16px; font-weight:600; color:#292929; text-transform:uppercase; letter-spacing:0.5px;">
                Today's Highlights: 
              </h2>
            </td>
          </tr>
        ${posts.map((blog) => {
      return `
          <tr>
            <td class="mobile-padding" style="padding:0 40px 30px 40px;">
              <table role="presentation" class="force-row" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="force-cell text-col" style="vertical-align:top; padding-right:20px;">
                    <h3 style="margin:0 0 12px 0; font-size:18px; font-weight:700; color:#292929; line-height:1.3;">
                      <a href="https://360gadgetsafrica.com/blog/${blog.slug}" style="color:#292929; text-decoration:none;">
                        ${blog.title}
                      </a>
                    </h3>
                    <p style="margin:0 0 16px 0; font-size:14px; color:#757575; line-height:1.5;">
                      ${blog.excerpt}
                    </p>
                    <p style="margin:0; font-size:13px; color:#757575;">
                      ⭐ ${calculateReadTime(blog.content)} 
                    </p>
                  </td>

                  <td class="force-cell img-col" style="vertical-align:top;">
                    <a href="#" style="display:block;">
                      <img src="${blog.coverImage}" alt="${blog.title}" width="100" height="90" style="width:100%; max-width:160px; border-radius:4px; display:block;">
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr> 
          `
    })}
          <tr>
            <td align="center" bgcolor="#ffffff" style="padding: 0px 40px 10px; " >
              <p style="border:1px solid #000; border-radius:6px; padding:12px 28px;">
                  <a href="https://360gadgetsafrica.com/blog" target="_blank" 
                style="font-size:16px; font-weight:600; text-decoration:none; color:#000; display:inline-block; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Explore More
              </a>
              </p>
            </td>
          </tr>

          <tr>
             <td class="mobile-padding" style="padding: 30px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffd93d; border-radius: 6px;">
                      <tr>
                          <td style="padding: 20px; text-align: center;">
                              <p style="margin: 0; font-size: 12px; color: #e91e63; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">NEED HELP?</p>
                              <h2 class="mobile-h2" style="margin: 0; font-size: 18px; font-weight: bold; color: #292929; line-height: 1.2;">If you have any questions, reply to this email our team is always ready to help.</h2>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
          <tr >
            <td valign="middle" width="100%" style="padding: 20px 30px 0px; border-top: 1px solid #e0e0e0; background-color: #f8f9fa;">
                <ul  style="padding: 0;">
                    <li style="display: inline-block; margin-right: 10px;">   <a href="https://apps.apple.com/app/360gadgetsafrica/id6736353137?platform=iphone" target="_blank">
                        <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731154161/ntsv2brfd8lboncvjavk.png"
                             alt="Download on the App Store"
                             style="width: 100px;" />
                      </a>
                    </li>
                    <li style="display: inline-block; margin-right: 10px;"> <a href="https://play.google.com/store/apps/details?id=com.gadgetsafrica.gadgetsafrica" target="_blank">
                        <img src="https://res.cloudinary.com/dnltxw2jt/image/upload/v1731153650/ibfyv6toskeeikywuuv5.webp" 
                             alt="Download on Google Play"
                             style="width: 100px;" />
                      </a>
                    </li> 
                </ul>
            </td>
        </tr>
        <tr >
            <td style="padding: 20px 30px;background-color: #f8f9fa; ">
                
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.4;">
                    © 2025 Team 360 Ventures RC 7927753. All rights reserved
                </p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                    At 360GadgetsAfrica, we power smarter shopping, and instant access to the gadgets you love. 
                </p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #999999; line-height: 1.5;">
                     No longer want to receive these email? You can <a href="https://360gadgetsafrica.com/unsubscribe"
                    style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
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
                                      <li><a href="https://360gadgetsafrica.com/gadgets/Iphones-42877">Iphones</a></li>
                                      <li><a href="https://360gadgetsafrica.com/gadgets/samsung-232323">Samsung</a></li>
                                      <li><a href="https://360gadgetsafrica.com/gadgets/pixel-42877">Google Pixel</a></li>
                                      <li><a href="https://360gadgetsafrica.com/gadgets/Macbooks-ipads-59769">Laptops</a></li>
                                      <li><a href="https://360gadgetsafrica.com/gadgets/Accessories-82240">Accessories</a></li>
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
  newOrder: function ({ order, address, pickup }) {
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
              <p>${address.deliveryType}</p>
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
                                     <li><a href="https://360gadgetsafrica.com/gadgets/Iphones-42877">Iphones</a></li>
                                      <li><a href="https://360gadgetsafrica.com/gadgets/samsung-232323">Samsung</a></li>
                                      <li><a href="https://360gadgetsafrica.com/gadgets/pixel-42877">Google Pixel</a></li>
                                      <li><a href="https://360gadgetsafrica.com/gadgets/Macbooks-ipads-59769">Laptops</a></li>
                                      <li><a href="https://360gadgetsafrica.com/gadgets/Accessories-82240">Accessories</a></li>
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