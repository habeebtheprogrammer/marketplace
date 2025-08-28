const EventEmitter = require('events');

class EventService extends EventEmitter {}

const eventService = new EventService();

// Set max listeners to a higher number if needed
eventService.setMaxListeners(20);

module.exports = eventService;
