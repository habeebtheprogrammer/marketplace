const cron = require('node-cron');
const dataplans = require('../dataplan.json');
const { sendNotification } = require('../utils/onesignal');
const { getUsers } = require('../service/users.service');


class DailyDataPlanWorker {
  constructor() {
    this.job = null;
    this.schedule = '0 7 * * *'; // 8 AM daily
    this.networks = ['MTN', 'AIRTEL', 'GLO'];
  }

  /**
   * Start the daily data plan worker
   * @param {string} schedule - Cron schedule string (default: 0 8 * * * - 8 AM daily)
   */
  start(schedule) {
    if (this.job) {
      console.log('Daily data plan worker is already running');
      return;
    }

    if (schedule) this.schedule = schedule;
    // this.sendDailyDataPlanNotification().catch(console.error);
    
    console.log(`Starting daily data plan worker with schedule: ${this.schedule}`);
    
    this.job = cron.schedule(this.schedule, async () => {
      try {
        console.log('Running daily data plan notification job');
        await this.sendDailyDataPlanNotification();
      } catch (error) {
        console.error('Error in daily data plan notification job:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Africa/Lagos'
    });
  }

  /**
   * Check if a plan's duration matches the desired criteria
   * @param {string} duration - The duration string to check
   * @returns {boolean} - True if duration matches criteria
   */
  isValidDuration(duration) {
    if (!duration) return false;
    const normalized = duration.toLowerCase().trim();
    return (
      normalized.includes('1day') ||
      normalized.includes('2days') ||
      normalized.includes('24hours') ||
      normalized.includes('1month') ||
      normalized === '30days' ||
      normalized === '30 days' ||
      normalized === '1 day' ||
      normalized === '2 days'
    );
  }

  /**
   * Get all data plans for a network starting from 1GB, sorted by size
   * Only includes plans with valid durations and keeps the cheapest option per plan name
   * @param {string} network - Network name
   * @returns {Array} - Array of data plans, sorted by size (smallest to largest)
   */
  getDataPlansFrom1GB(network) {
    // Create a map to store the cheapest plan for each unique plan name
    const plansMap = new Map();

    // Process all plans
    dataplans
      .filter(plan => 
        plan.network === network && 
        this.getDataSizeInMB(plan.planName) >= 1024 && // At least 1GB (1024MB)
        this.isValidDuration(plan.duration) // Only include plans with valid durations
      )
      .forEach(plan => {
        const amount = parseFloat(plan.amount);
        const existingPlan = plansMap.get(plan.planName);
        
        // If we don't have this plan name yet, or this one is cheaper, store it
        if (!existingPlan || amount < parseFloat(existingPlan.amount)) {
          plansMap.set(plan.planName, { ...plan });
        }
      });

    // Convert map values to array and sort by data size (smallest to largest)
    return Array.from(plansMap.values())
      .sort((a, b) => {
        const sizeA = this.getDataSizeInMB(a.planName);
        const sizeB = this.getDataSizeInMB(b.planName);
        return sizeA - sizeB;
      });
  }

  /**
   * Convert data size string to MB
   * @param {string} sizeString - Size string (e.g., "1GB", "500MB")
   * @returns {number} - Size in MB
   */
  getDataSizeInMB(sizeString) {
    const match = sizeString.match(/^(\d+(\.\d+)?)\s*(GB|MB)$/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[3].toUpperCase();

    return unit === 'GB' ? value * 1024 : value;
  }

  /**
   * Format amount to currency
   * @param {string} amount - Amount as string
   * @returns {string} - Formatted currency string
   */
  formatCurrency(amount) {
    return '₦' + parseFloat(amount).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Format a list of plans into a readable string
   * @param {Array} plans - Array of data plans
   * @returns {string} - Formatted message
   */
  formatPlansList(plans) {
    return plans.map(plan => 
      `${plan.planName} - ${this.formatCurrency(plan.amount)}`
    ).join(', ');
  }

  /**
   * Send daily data plan notification with list of plans
   */
  async sendDailyDataPlanNotification() {
    try {
      // Select a random network
      const randomNetwork = this.networks[Math.floor(Math.random() * this.networks.length)];
      console.log(`Selected network for daily data plan: ${randomNetwork}`);

      // Get all plans starting from 1GB for the selected network
      const plans = this.getDataPlansFrom1GB(randomNetwork);
      if (plans.length === 0) {
        console.log(`No suitable data plans found for ${randomNetwork}`);
        return;
      }

      // Limit to first 5 plans to keep the notification concise
      const topPlans = plans.slice(0, 5);
      
      // Prepare notification message
      const message = `${this.formatPlansList(topPlans)} And you still get to earn ₦20 Cashback per GB you purchase`;
      const usersData = await getUsers(
        { oneSignalId: { $exists: true, $ne: null } }, 
        { limit: 10000 } // adjust limit or paginate properly
      );
      
      // Get the array of users from docs
      const users = usersData.docs || [];
      
      // Extract just the IDs
      const oneSignalIds = users.map(user => user.oneSignalId);
      console.log( oneSignalIds.length)
      // Send notification
      await sendNotification({
        headings: { en: `${randomNetwork} Data Deals! 👋` },
        contents: { en: message },
        include_subscription_ids: oneSignalIds,
        url: "gadgetsafrica://topup",
      });

      console.log('Daily data plan notification sent for:', randomNetwork);
    } catch (error) {
      console.error('Error sending daily data plan notification:', error);
      throw error;
    }
  }

  /**
   * Stop the worker
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.job = null;
      console.log('Daily data plan worker stopped');
    }
  }
}

// Export a singleton instance
module.exports = new DailyDataPlanWorker();
