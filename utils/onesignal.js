const OneSignal = require('@onesignal/node-onesignal');
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY
 
// Initialize the OneSignal client
const configuration = OneSignal.createConfiguration({
  restApiKey: ONESIGNAL_API_KEY,
});
const client = new OneSignal.DefaultApi(configuration);

async function sendNotification(data) {
  try {
var notification = new OneSignal.Notification();
    notification.app_id = ONESIGNAL_APP_ID;  
    notification.headings = data.headings
    notification.contents = data.contents
    notification.url = data.url
    // data.buttons ?  notification.buttons = data.buttons : null
    // notification.filters = data.include_subscription_ids.map(id => ({
    //   field: 'tag',
    //   key: 'include_player_ids',
    //   relation: '=',
    //   value: id
    // }));
    notification.include_subscription_ids = data.include_subscription_ids
    const response = await client.createNotification(notification);
    console.log('Notification sent successfully:');
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    // console.error('Error sending notification:', error);
  }
}

// Execute the function


// var sendNotification = function(data) {
//     data.app_id =  
//   data.target_channel = "push";
//     var headers = {
//       "Content-Type": "application/json",
//       "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`
//     };
//     console.log(headers, data)
//     var options = {
//       host: "api.onesignal.com",
//       port: 443,
//       path: "/notifications",
//       method: "POST",
//       headers: headers
//     };
//     try {
//       var https = require('https');
//       var req = https.request(options, function(res) {  
//         res.on('data', function(data) {
//           console.log("Response:");
//           console.log(JSON.parse(data));
//         });
//       });
      
//       req.on('error', function(e) {
//         console.log("ERROR:");
//         console.log(e);
//       });
      
//       req.write(JSON.stringify(data));
//       req.end();
//     } catch (error) {
//       console.log(error)
//     }
   
//   };
   

  module.exports = {
      sendNotification
  }