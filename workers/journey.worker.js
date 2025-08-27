const cron = require('node-cron');
const { journeyService } = require('../service');

class JourneyWorker {
  constructor() {
    this.job = null;
    this.schedule = '*/2 * * * *'; // Every 15 minutes by default
    this.batchSize = 100;
  }

  /**
   * Start the journey worker
   * @param {string} schedule - Cron schedule string
   * @param {number} batchSize - Number of steps to process per batch
   */
  start(schedule, batchSize) {
    if (this.job) {
      console.log('Journey worker is already running');
      return;
    }

    if (schedule) this.schedule = schedule;
    if (batchSize) this.batchSize = batchSize;
    
    console.log(`Starting journey worker with schedule: ${this.schedule}`);
    
    this.job = cron.schedule(this.schedule, async () => {
      try {
        console.log('Running journey processing job');
        const results = await journeyService.processPendingSteps(this.batchSize);
        console.log(`Processed ${results.processed} journey steps (${results.succeeded} succeeded, ${results.failed} failed)`);
      } catch (error) {
        console.log('Error in journey processing job:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Africa/Lagos'
    });
    
    // Run immediately on start
    this.runImmediately();
  }

  /**
   * Run the job immediately
   */
  async runImmediately() {
    try {
      console.log('Running initial journey processing');
      const results = await journeyService.processPendingSteps(this.batchSize);
      console.log(`Initial run: Processed ${results.processed} journey steps`);
    } catch (error) {
      console.log('Error in initial journey processing:', error);
    }
  }

  /**
   * Stop the worker
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.job = null;
      console.log('Journey worker stopped');
    }
  }

  /**
   * Restart the worker with new settings
   * @param {string} schedule - New cron schedule
   * @param {number} batchSize - New batch size
   */
  restart(schedule, batchSize) {
    this.stop();
    this.start(schedule, batchSize);
  }
}

// Export a singleton instance
module.exports = new JourneyWorker();
