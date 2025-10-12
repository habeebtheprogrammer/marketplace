const cron = require('node-cron');
const { getBlogPosts } = require('../service/blogposts.service');
const { getUsers } = require('../service/users.service');
const { sendEmail } = require('../utils/email');
const emailTemplates = require('../emailTemplates');
const { sendNotification } = require('../utils/onesignal');

class BlogWorker {
  constructor() {
    this.job = null;
    this.schedule = '28 12 * * *'; // Run at 12 PM daily
    this.batchSize = 100;
  }

  async processDailyBlogDigest() {
    try {
      console.log('Running daily blog digest job...');
      
      // Get today's blog posts
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // Start of next day
      
      const posts = await getBlogPosts({
        query: {
          createdAt: { $gte: today, $lt: tomorrow },
          archive: false
        },
        options: { sort: { createdAt: -1 } }
      });
  
      if (!posts.docs.length) {
        console.log('No new blog posts today. Skipping digest.');
        return { sent: 0, skipped: 0 };
      }
  
      // Get all active users with Gmail addresses
      let page = 1;
      let totalSent = 0;
      let hasMore = true;
  
      while (hasMore) {
        const users = await getUsers(
          { 
             unsubscribe: { $not: { $eq: true } } 
            // $and: [
            //   { email: /@gmail\.com$/i },
            //   { email: { $not: /archived/i } },
            //   {
            //     $or: [
            //       { verificationCode: { $exists: false } }, // field doesn’t exist
            //       { verificationCode: null },               // explicitly null
            //       { verificationCode: '' }                  // empty string
            //     ]
            //   }
            // ],
            // userType: { $in: ['superuser', 'user'] }

          },
          { 
            page, 
            limit: this.batchSize,
            select: 'email firstName oneSignalId',
            // sort: { createdAt: -1 }
          }
        );
        console.log(users.totalDocs)
        if (!users.docs.length) {
          hasMore = false;
          continue;
        }
  
        // Send emails sequentially (1 per second)
        for (const user of users.docs) {
          try {
            // Push notification
            // await sendNotification({
            //   headings: { "en": posts?.docs?.[0]?.title },
            //   contents: { "en": `${posts?.docs?.[0]?.excerpt}` },
            //   include_subscription_ids: [user?.oneSignalId],
            //   url: `https://360gadgetsafrica.com/blog/${posts?.docs?.[0]?.slug}`,
            //   big_picture: posts?.docs?.[0]?.coverImage,
            // });
  
            // // Email
            await sendEmail({
              from: '"360GadgetsAfrica" <hello@360gadgetsafrica.com>',
              to: user.email,
              subject: posts.docs?.[0]?.excerpt || 
                       `Daily Digest: ${posts.docs.length} New Blog ${posts.docs.length > 1 ? 'Posts' : 'Post'}`,
              html: emailTemplates.daily_blog_digest({ posts: posts.docs })
            });
  
            totalSent++;
            console.log(`Sent email to ${user.email}`);
  
            // Delay 1 second before next send
            await new Promise(resolve => setTimeout(resolve, 1000));
  
          } catch (error) {
            console.error(`Error sending to ${user.email}:`, error);
          }
        }
  
        console.log(`Completed batch ${page}, sent ${users.docs.length} emails.`);
        
        page++;
        hasMore = users.hasNextPage;
      }
  
      console.log(`Daily blog digest completed. Sent ${totalSent} emails.`);
      return { sent: totalSent, skipped: 0 };
    } catch (error) {
      console.error('Error in daily blog digest job:', error);
      throw error;
    }
  }
  

  start() {
    if (this.job) {
      console.log('Blog worker is already running');
      return;
    }

    console.log('Starting blog worker with schedule:', this.schedule);
    
    // Initial run
    // this.processDailyBlogDigest().catch(console.error);
    
    // Schedule daily job
    this.job = cron.schedule(this.schedule, () => {
      console.log('Running scheduled blog digest job');
      this.processDailyBlogDigest().catch(console.error);
    }, {
      timezone: 'Africa/Lagos'
    });
  }

  stop() {
    if (this.job) {
      this.job.stop();
      this.job = null;
      console.log('Blog worker stopped');
    }
  }
}

// Export a singleton instance
module.exports = new BlogWorker();
