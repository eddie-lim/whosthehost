const repo = require("../repository/event")
const logger = require("../repository/system_logs")
const CM = require("./../event_member/handler")
const cron = require('node-cron');

async function setup() {
    events = await repo.ReadAll()
    events.filter(event => event.is_active).forEach(event => {
        logger.Info("cron", "setup", "setting up cron job for event " + event.name);
        cron.schedule(event.cron_expression, () => {
            CM.SelectHost(event.id);
          });
    });
    logger.Info("cron", "setup", "setup done");
}

module.exports = {
    Setup: function(){
        setup()
    }
}