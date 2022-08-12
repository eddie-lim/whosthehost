const repo = require("../repository/channel")
const logger = require("../repository/system_logs")
const CM = require("./../channel_member/handler")
const cron = require('node-cron');

async function setup() {
    channels = await repo.ReadAll()
    channels.filter(channel => channel.is_active).forEach(channel => {
        logger.Info("cron", "setup", "setting up cron job for channel " + channel.name);
        cron.schedule(channel.cron_expression, () => {
            CM.SelectHost(channel.id);
          });
    });
    logger.Info("cron", "setup", "setup done");
}

module.exports = {
    Setup: function(){
        setup()
    }
}