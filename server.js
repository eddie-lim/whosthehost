const express = require('express')
const app = express()
require('dotenv').config()
const CM = require("./channel_member/handler")
const cron_handler = require("./cron/handler")
const logger = require("./repository/system_logs")

logger.Info("index", "index", "nodejs server started");
cron_handler.Setup()

// --

app.get('/', (req, res) => {
  res.send('to implement CMS using react or can try angular. hehe')
})
app.listen(3000)