const repo = require("../repository/channel_member")
const client = require("../client/handler");
const helper = require("../utils/helper");

// selectHost will get all available members in a channel
// and randomly pick a member as the host
async function selectHost(channel_id) {
    channel_members = await getChannelMembers(channel_id)
    if (Object.keys(channel_members).length == 0){
        repo.UpdateAllChannelIsActive(channel_id, 1)
    }
    processChannelMembers(channel_members)
}

// getChannelMembers retrieves a specific channel and the linked members from `channel_members` table
// filters away the non-active statuses
// returns a mapped channels with members data populated in each channel object
async function getChannelMembers(channel_id){
    channel_members = await repo.Read(channel_id)

    let channels = {}

    channel_members.filter(channel_member => channel_member.is_channel_member_active && channel_member.is_channel_active && channel_member.is_member_active).forEach(channel_member => {
        let mapped_members = channels[channel_member.channel_id]?.members
        let channel = {
            "name": channel_member.channel_name,
            "hook_base_url": channel_member.hook_base_url,
            "hook_path": channel_member.hook_path,
            "members" : [
                {
                    "id": channel_member.member_id,
                    "name": channel_member.member_name
                }
            ]
        }
        if (mapped_members != undefined){
            channel.members = channel.members.concat(mapped_members)
        }
        channels[channel_member.channel_id] = channel
    });

    return channels
}

// processChannelMembers loops through all the channels and randomly pick a member to be the host
/// when a member is picked, the webhook will be called and the channel_members.is_active is updated to false
function processChannelMembers(channel_members) {
    for (const [channel_id, channel_member] of Object.entries(channel_members)) {
        let random_member = channel_member.members[Math.floor(Math.random()*channel_member.members.length)];
        capitalized_name = helper.CapitalizeFirstLetter(random_member.name)
        client.Hook(channel_member.hook_base_url, channel_member.hook_path, capitalized_name, channel_member.messenger_user_id)
        repo.UpdateIsActive(channel_id, random_member.id, 0)
    }
}


module.exports = {
    SelectHost: function(channel_id){
        selectHost(channel_id)
    }
}