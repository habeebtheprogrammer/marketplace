const cron = require('node-cron');
const { sendNotification } = require('../utils/onesignal');
const { getUsers } = require('../service/users.service');

class NotificationWorker {
  constructor() {
    this.repairNotifications = [
      {
        title: "Expert Repairs, Powered by A1 Info Tech",
        content: "Through our partnered repair & diagnostics provider A1 Info Tech, your devices get professional care. Click to contact now!"
      },
      {
        title: "Powered by A1 Info Tech Repairs",
        content: "From cracked screens to slow laptops, A1 Info Tech has you covered. Tap here to contact our partner now!"
      },
      {
        title: "Your Trusted Repair Partner",
        content: "Repairs and diagnostics made easy with our partner A1 Info Tech. Click to reach out and book a fix today."
      },
      {
        title: "Trusted Repairs, Fast",
        content: "From screens to batteries, A1 Info Tech handles it all. Tap to contact today."
      },
      {
        title: "Laptop Running Slow?",
        content: "Our repair partner A1 Info Tech makes it faster again. Tap to contact today."
      },
      {
        title: "Battery Issues?",
        content: "A1 Info Tech will bring your gadget back to life. Click to book your fix."
      }
    ];

    this.gadgetNotifications = [
        {
            title: "Gadgets for Every Lifestyle",
            content: "Our partner Gadgets Chamber brings you phones, laptops & accessories. Click to explore deals."
          },
          {
            title: "Exclusive Gadgets, Exclusive Partner",
            content: "Buy original gadgets only from our trusted sales partner, Gadgets Chamber. Tap to order today."
          },
          {
            title: "Your Next Laptop is Here",
            content: "Gadgets Chamber, our official sales partner, brings you reliable laptops at the best prices. Click to shop now!"
          },
          {
            title: "Accessories That Upgrade You",
            content: "Shop premium accessories from Gadgets Chamber, our partnered sales vendor. Tap to buy instantly."
          },
          {
            title: "Shop Smart, Shop Gadgets Chamber",
            content: "Get trusted gadgets through our sales partner Gadgets Chamber. Click to start shopping today!"
          },
          {
            title: "Work Smarter with New Tech",
            content: "Our sales partner Gadgets Chamber has laptops & devices for every budget. Tap to shop today."
          }
    ];
    
    this.couponNotifications = [
      {
        title: (code, discount) => `🎉 ${discount}% Off Data Purchase!`,
        content: (code, discount) => `Use code ${code} to get ${discount}% off your next data purchase. Limited time offer!`
      },
      {
        title: (code, discount) => `✨ Special ${discount}% Discount For You!`,
        content: (code, discount) => `Your exclusive code ${code} gets you ${discount}% off data purchase. Shop now!`
      },
      {
        title: (code, discount) => `🔥 Hot Deal: ${discount}% Off!`,
        content: (code, discount) => `Use code ${code} at checkout for ${discount}% off your data purchase. Limited time only!`
      }
    ];
  }

  async start() {
    // Schedule for Monday at 12 PM (repair notifications)
    cron.schedule('0 12 * * 1', async () => {
      console.log('Running repair notifications...');
      await this.sendRepairNotification();
    }, {
      timezone: 'Africa/Lagos',
      scheduled: true
    });

    // Schedule for Wednesday at 2 PM (gadget notifications)
    cron.schedule('0 16 * * 3', async () => {
      console.log('Running gadget notifications...');
      await this.sendGadgetNotification();
    }, {
      timezone: 'Africa/Lagos',
      scheduled: true
    });
    
    // Schedule for Friday at 11 AM (coupon notifications)
    cron.schedule('0 12 * * 5', async () => {
      console.log('Running coupon notifications...');
      await this.sendCouponNotification();
    }, {
      timezone: 'Africa/Lagos',
      scheduled: true
    });

    console.log('Notification worker started with schedules:');
    console.log('- Repair notifications: Monday at 12 PM');
    console.log('- Gadget notifications: Wednesday at 2 PM');
    console.log('- Coupon notifications: Friday at 11 AM');
  }

  async sendRepairNotification() {
    try {
      const notification = this.getRandomNotification(this.repairNotifications);
      await this.sendNotification({
        headings: { en: notification.title },
        contents: { en: notification.content },
        big_picture: "https://terra01.s3.amazonaws.com/images/%40a1techinstitute%20-%20R%C3%A2%C3%84%C2%93Download.JPEG",
        url: "https://360gadgetsafrica.com/technicians/A1-infotech"
      });
      console.log('Repair notification sent:', notification.title);
    } catch (error) {
      console.error('Error sending repair notification:', error);
    }
  }

  async sendGadgetNotification() {
    try {
      const notification = this.getRandomNotification(this.gadgetNotifications);
      await this.sendNotification({
        headings: { en: notification.title },
        contents: { en: notification.content },
        big_picture: "https://terra01.s3.amazonaws.com/images/SmIUhMrL_400x400.jpg",
        url: "gadgetsafrica://home"
      });
      console.log('Gadget notification sent:', notification.title);
    } catch (error) {
      console.error('Error sending gadget notification:', error);
    }
  }

  getRandomNotification(notifications) {
    const randomIndex = Math.floor(Math.random() * notifications.length);
    return notifications[randomIndex];
  }

  async sendNotification(notificationData) {
    try {
      const usersData = await getUsers(
        { oneSignalId: { $exists: true, $ne: null } },
        { limit: 10000 }
      );

      const users = usersData.docs || [];
      const oneSignalIds = users.map(user => user.oneSignalId);

      if (oneSignalIds.length === 0) {
        console.warn('No users with OneSignal IDs found');
        return;
      }

      console.log(`Sending notification to ${oneSignalIds.length} users`);
      
      await sendNotification({
        ...notificationData,
        include_subscription_ids: oneSignalIds
      });
    } catch (error) {
      console.error('Error in sendNotification:', error);
      throw error;
    }
  }
  
  async sendCouponNotification() {
    try {
      // Get current date to filter active coupons
      const now = new Date();
      
      // Find an active coupon
      const Coupon = require('../model/coupons.model');
      const activeCoupon = await Coupon.findOne({
        isActive: true,
        startDate: { $lte: now },
        expiryDate: { $gt: now },
        usageLimit: { $gt: 0 }
      }).sort({ createdAt: -1 });
      
      if (!activeCoupon) {
        console.log('No active coupons found');
        return;
      }
      
      const template = this.getRandomNotification(this.couponNotifications);
      
      await this.sendNotification({
        headings: { en: template.title(activeCoupon.code, activeCoupon.discount) },
        contents: { en: template.content(activeCoupon.code, activeCoupon.discount) },
        big_picture: "https://terra01.s3.amazonaws.com/images/SmIUhMrL_400x400.jpg",
        url: "gadgetsafrica://home",
        buttons: [{
          id: "use_coupon",
          text: `Use Code: ${activeCoupon.code}`,
          url: "gadgetsafrica://home"
        }]
      });
      
      console.log('Coupon notification sent with code:', activeCoupon.code);
    } catch (error) {
      console.error('Error sending coupon notification:', error);
    }
  }
}

module.exports = new NotificationWorker();
