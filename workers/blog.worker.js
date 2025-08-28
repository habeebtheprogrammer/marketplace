const cron = require('node-cron');
const { getBlogPosts } = require('../service/blogposts.service');
const { getUsers } = require('../service/users.service');
const { emailTransporter } = require('../utils/helpers');
const emailTemplates = require('../emailTemplates');
const { sendNotification } = require('../utils/onesignal');

class BlogWorker {
  constructor() {
    this.job = null;
    this.schedule = '0 18 * * *'; // Run at 6 PM daily
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
      
      const posts = await getBlogPosts({query: {
        createdAt: { $gte: today, $lt: tomorrow }, // Between today 00:00 and tomorrow 00:00
        archive: false
      }, options: { 
        sort: { createdAt: -1 },
      }});

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
            email: /@gmail\.com$/i,
            userType: 'superuser'
          },
          { 
            page, 
            limit: this.batchSize,
            select: 'email firstName'
          }
        );

        if (!users.docs.length) {
          hasMore = false;
          continue;
        }
        // Send emails in parallel
        const sendPromises = users.docs.map(user => {
          try {
            sendNotification({
              headings: { "en": posts?.docs?.[0]?.title },
              contents: { "en": `${posts?.docs?.[0]?.excerpt}` },
              include_subscription_ids: [user?.oneSignalId], 
              url:  `https://360gadgetsafrica.com/blog/${posts?.docs?.[0]?.slug}`,
              buttons: [
                {
                  action: 'view',
                  text: 'Read More',
                  icon: 'https://res.cloudinary.com/dnltxw2jt/image/upload/v1738234994/logo_fvvotl.png',
                }
              ],
              big_picture: posts?.docs?.[0]?.coverImage,
            })
          } catch (error) {
            console.log(error)
          }

          return emailTransporter.sendMail({
            from: '"360GadgetsAfrica" <support@360gadgetsafrica.com>',
            to: user.email,
            subject: posts.docs?.[0]?.excerpt || `Daily Digest: ${posts.docs.length} New Blog ${posts.docs.length > 1 ? 'Posts' : 'Post'}`,
            html: emailTemplates.daily_blog_digest({posts: posts.docs})
          });
        });
    
        await Promise.all(sendPromises);
        totalSent += users.docs.length;
        console.log(`Sent ${users.docs.length} emails in batch ${page}`);
        
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
