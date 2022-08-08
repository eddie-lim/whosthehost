const repo = require("../repository/channel")
const logger = require("../repository/system_logs")
const CM = require("./../channel_member/handler")
const cron = require('node-cron');

async function setup() {
    channels = await repo.ReadAll()
    channels.filter(channel => channel.is_active).forEach(channel => {
        cron.schedule(channel.cron_expression, () => {
            logger.CreateLog("cron", "setup", "info", "invoking webhook: Selecting a random host for channel " + channel.name);
            CM.SelectHost(channel.id);
          });
    });
}

module.exports = {
    Setup: function(){
        setup()
    }
}