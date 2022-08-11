const axios = require('axios');

function hook(base_url, path, member_name, messenger_user_id) {
    url = base_url + "/" + path
    // url = process.env.HOOK_URL
    axios.post(url, {
        "name": member_name,
        "messenger_user_id": messenger_user_id
    })
    .then(function (response) {
        console.log("res", response);
    })
    .catch(function (error) {
        console.log("err", error);
    });
}

module.exports = {
    Hook: function (base_url, path, member_name, messenger_user_id){
        return hook(base_url, path, member_name, messenger_user_id)
    }
}