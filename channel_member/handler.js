const channel_members_history_repo = require("../repository/channel_members_history")
const channel_members_repo = require("../repository/channel_members")
const client = require("../client/handler");
const helper = require("../utils/helper");
const logger = require("../repository/system_logs")

// selectHost will get all available members in a channel
// and randomly pick a member as the host
async function selectHost(channel_id) {
    let channel_members = await getChannelMembers(channel_id)
    if (Object.keys(channel_members).length == 0){
        await channel_members_repo.UpdateAllChannelIsActive(channel_id, 1)
        channel_members = await getChannelMembers(channel_id)
    }
    processChannelMembers(channel_members)
}

// getChannelMembers retrieves a specific channel and the linked members from `channel_members` table
// filters away the non-active statuses
// returns a mapped channels with members data populated in each channel object
async function getChannelMembers(channel_id){
    let channel_members = await channel_members_repo.Read(channel_id)

    let channels = {}

    channel_members.filter(channel_member => channel_member.is_channel_member_active && channel_member.is_channel_active && channel_member.is_member_active).forEach(channel_member => {
        let mapped_members = channels[channel_member.channel_id]?.members
        let channel = {
            "name": channel_member.channel_name,
            "hook_base_url": channel_member.hook_base_url,
            "hook_path": channel_member.hook_path,
            "is_fortnightly": channel_member.is_fortnightly,
            "is_fortnightly_even_week": channel_member.is_fortnightly_even_week,
            "pick_by_alphabetical": channel_member.pick_by_alphabetical,
            "members" : [
                {
                    "id": channel_member.member_id,
                    "name": channel_member.member_name,
                    "messenger_user_id": channel_member.messenger_user_id
                }
            ]
        }
        if (mapped_members != undefined){
            channel.members = [...channel.members, ...mapped_members]
        }
        channels[channel_member.channel_id] = channel
    });

    return channels
}

// processChannelMembers loops through all the channels and randomly pick a member to be the host
/// when a member is picked, the webhook will be called and the channel_members.is_active is updated to false
function processChannelMembers(channel_members) {
    for (const [channel_id, channel_member] of Object.entries(channel_members)) {
        if (channel_member.is_fortnightly && ((channel_member.is_fortnightly_even_week && helper.WeekNumber() % 2 != 0) || (!channel_member.is_fortnightly_even_week && helper.WeekNumber() % 2 == 0))){
            continue
        }
        logger.Info("channel_member", "selectHost", "eligible channel members: " + JSON.stringify(channel_members));

        choosen_member = pickMember(channel_member)

        capitalized_name = helper.CapitalizeFirstLetter(choosen_member.name)
        client.Hook(channel_member.hook_base_url, channel_member.hook_path, capitalized_name, choosen_member.messenger_user_id)

        channel_members_repo.UpdateIsActive(channel_id, choosen_member.id, 0)
        channel_members_history_repo.Create(channel_id, choosen_member.id)
        logger.Info("channel_member", "processChannelMembers", "select random member as host for " + channel_member.name + " : " + JSON.stringify(choosen_member));
    }
}

// pickMember picks a member is the list of active members, according to pick_by_alphabetical.
// pick_by_alphabetical == true, pick according to pick_by_alphabetical order ascending
// pick_by_alphabetical == false, pick randomly
function pickMember(channel_member){
    var members = channel_member.members
    if (members.length == 1) {
        return members[0]
    }
    if (channel_member.pick_by_alphabetical) {
        members.sort((a, b) => a.name.localeCompare(b.name))
        return members[0]
    } 
    return members[Math.floor(Math.random()*members.length)];
}


module.exports = {
    SelectHost: function(channel_id){
        selectHost(channel_id)
    }
}