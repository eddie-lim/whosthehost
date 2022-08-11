const repo = require("../repository/channel")
const logger = require("../repository/system_logs")
const CM = require("./../channel_member/handler")
const cron = require('node-cron');

async function setup() {
    console.log("setting up~")
    channels = await repo.ReadAll()
    channels.filter(channel => channel.is_active).forEach(channel => {
        cron.schedule(channel.cron_expression, () => {
            logger.Info("cron", "webhook", "invoking webhook: Selecting a random host for channel " + channel.name);
            CM.SelectHost(channel.id);
          });
    });
    console.log("setup done")
}

module.exports = {
    Setup: function(){
        setup()
    }
}