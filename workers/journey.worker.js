const cron = require('node-cron');
const { journeyService } = require('../service');
const logger = require('../utils/logger');

class JourneyWorker {
  constructor() {
    this.job = null;
    this.schedule = '*/15 * * * *'; // Every 15 minutes by default
    this.batchSize = 100;
  }

  /**
   * Start the journey worker
   * @param {string} schedule - Cron schedule string
   * @param {number} batchSize - Number of steps to process per batch
   */
  start(schedule, batchSize) {
    if (this.job) {
      logger.warn('Journey worker is already running');
      return;
    }

    if (schedule) this.schedule = schedule;
    if (batchSize) this.batchSize = batchSize;
    
    logger.info(`Starting journey worker with schedule: ${this.schedule}`);
    
    this.job = cron.schedule(this.schedule, async () => {
      try {
        logger.debug('Running journey processing job');
        const results = await journeyService.processPendingSteps(this.batchSize);
        logger.info(`Processed ${results.processed} journey steps (${results.succeeded} succeeded, ${results.failed} failed)`);
      } catch (error) {
        logger.error('Error in journey processing job:', error);
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
      logger.debug('Running initial journey processing');
      const results = await journeyService.processPendingSteps(this.batchSize);
      logger.info(`Initial run: Processed ${results.processed} journey steps`);
    } catch (error) {
      logger.error('Error in initial journey processing:', error);
    }
  }

  /**
   * Stop the worker
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.job = null;
      logger.info('Journey worker stopped');
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
