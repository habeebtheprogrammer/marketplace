const moment = require("moment")
module.exports = {
  signup: function(){
    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to 360 Gadgets Africa – Your Ultimate Tech Destination!</title>
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
            <div class="header">
                <img src="https://res.cloudinary.com/dzvhmiutm/image/upload/v1723338006/logo_qt3of8.png"
                    alt="360gadgetsafrica Logo">
            </div>
            <div class="content"> 
                <p>We’re thrilled to have you join our community of tech enthusiasts and savvy shoppers. Here’s what you can look forward to: </p>
                <div class="credentials">
                    <ul style="margin: 0; padding-left: 2em;">
                        <li>
                            <p><strong>Exclusive Deals and Offers:</strong> <span>Be the first to know about our special
                                    promotions and discounts tailored just for you.</span></p>
                        </li>
    
                        <li>
                            <p><strong>New Arrivals:</strong> <span>Stay ahead of the curve with updates on the newest
                                    gadgets and accessories we have in store</span></p>
                        </li>
    
                        <li>
                            <p><strong>Expert Reviews and Guides:</strong> <span>Get insights and tips from our tech experts
                                    to help you make informed decisions.</span></p>
                        </li>
                    </ul>
                </div>
              
                <div class="button-container">
                    <a href="https://360gadgetsafrica.com" target="_blank">Continue</a>
                </div>
                <p>To get started, why not explore our website and check out our current bestsellers? If you have any
                    questions or need assistance, our customer support team is here to help.</p>
                <p>Best regards,</p>
                <p>Support team,</p>
                <p>360gadgetsafrica</p>
            </div>
            <div class="footer">
                <p>360gadgetsafrica | <a href="https://360gadgetsafrica.com">www.360gadgetsafrica.com</a></p>
            </div>
        </div>
    </body>
    
    </html> `
  },
  orderConfirmation: function({order, address}){
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
                       ${order.map((item)=>
                        <li>
                            <p><strong>{item?.productId?.title} {item?.size?.title && item?.size?.title}- </strong> <span> ₦{item?.productId?.price} x {item?.qty}</span></p>
                        </li>
                       ) }
                    </ul>
                </div>
              
                <div class="button-container">
                    <a href="https://360gadgetsafrica.com/profile" target="_blank">View your order</a>
                </div>
                <p>Shipping Address: </p>
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
}