const axios = require('axios');

function hook(base_url, path, member_name) {
    url = base_url + "/" + path
    // url = process.env.HOOK_URL
    axios.post(url, {
        test: member_name
    })
    .then(function (response) {
        console.log("res", response.statusText);
    })
    .catch(function (error) {
        console.log("err", error.statusText);
    });
}

module.exports = {
    Hook: function (base_url, path, member_name){
        return hook(base_url, path, member_name)
    }
}