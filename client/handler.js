const axios = require('axios');
const logger = require("../repository/system_logs")

function hook(base_url, path, member_name, messenger_user_id) {
    url = base_url + "/" + path
    // url = process.env.HOOK_URL
    axios.post(url, {
        "name": member_name,
        "messenger_user_id": messenger_user_id
    })
    .then(function (response) {
        console.log(response.statusText);
    })
    .catch(function (error) {
        console.log("err", error);
        logger.Error("client", "hook", "failed to call webhook: " + JSON.stringify(error));
    });
}

module.exports = {
    Hook: function (base_url, path, member_name, messenger_user_id){
        return hook(base_url, path, member_name, messenger_user_id)
    }
}