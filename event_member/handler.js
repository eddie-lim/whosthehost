const event_members_history_repo = require("../repository/event_members_history")
const event_members_repo = require("../repository/event_members")
const client = require("../client/handler");
const helper = require("../utils/helper");
const logger = require("../repository/system_logs")

// selectHost will get all available members in a event
// and picks a member as the host, with respect to `pick_by_alphabetical`
// sets everyone as active again when nobody is active
async function selectHost(event_id) {
    var [event, all_event_members] = await getEventMembers(event_id);
    if (Object.keys(event).length === 0){
        await event_members_repo.UpdateAlleventIsActive(event_id, 1);
        [event, all_event_members] = await getEventMembers(event_id);
    }
    processeventMembers(event, all_event_members);
}

// getEventMembers retrieves a specific event and the linked members from `event_members` table
// filters away the non-active statuses
// returns a mapped events with members data populated in each event object
async function getEventMembers(event_id){
    let event_members = await event_members_repo.Read(event_id)

    if (event_members.length == 0){
        return null
    }
    var all_event_members = event_members

    var event = {}

    event_members.filter(event_member => event_member.is_event_member_active && event_member.is_event_active && event_member.is_member_active).forEach(event_member => {
        let mapped_members = event?.members
        let e = {
            "id": event_member.event_id,
            "name": event_member.event_name,
            "hook_base_url": event_member.hook_base_url,
            "hook_path": event_member.hook_path,
            "is_fortnightly": event_member.is_fortnightly,
            "is_fortnightly_even_week": event_member.is_fortnightly_even_week,
            "pick_by_alphabetical": event_member.pick_by_alphabetical,
            "members" : [
                {
                    "id": event_member.member_id,
                    "name": event_member.member_name,
                    "messenger_user_id": event_member.messenger_user_id
                }
            ]
        }
        if (mapped_members != undefined){
            event.members = [...mapped_members, ...e.members]
        } else {
            event = e
        }
    });

    return [event, all_event_members]
}

// processeventMembers loops through all the events and pick a member to be the host
/// when a member is picked, the webhook will be called and the event.is_active is updated to false
function processeventMembers(event, all_event_members) {
    if (event.is_fortnightly && ((event.is_fortnightly_even_week && helper.WeekNumber() % 2 != 0) || (!event.is_fortnightly_even_week && helper.WeekNumber() % 2 == 0))){
        return
    }
    logger.Info("event_member", "selectHost", "eligible event members: " + JSON.stringify(event.members));

    let [choosen_host, next_host] = pickMember(event, all_event_members)

    capitalized_name = helper.CapitalizeFirstLetter(choosen_host.name)
    client.Hook(event.hook_base_url, event.hook_path, capitalized_name, choosen_host.messenger_user_id, next_host.messenger_user_id)

    event_members_repo.UpdateIsActive(event.id, choosen_host.id, 0)
    event_members_history_repo.Create(event.id, choosen_host.id)
    logger.Info("event_member", "processeventMembers", "selected "+ JSON.stringify(choosen_host) +" as host for " + event.name + ". Next host: " + JSON.stringify(next_host));
}

// pickMember picks a member is the list of active members, according to pick_by_alphabetical.
// pick_by_alphabetical == true, pick according to pick_by_alphabetical order ascending
// pick_by_alphabetical == false, pick randomly
function pickMember(event, all_event_members){
    var members = event.members
    if (members.length == 1) {
        all_event_members.sort((a, b) => a.member_name.localeCompare(b.member_name))
        let next_member = {
            "id": all_event_members[0].member_id,
            "name": all_event_members[0].member_name,
            "messenger_user_id": all_event_members[0].messenger_user_id
        }
        return [members[0], next_member]
    }
    if (event.pick_by_alphabetical) {
        members.sort((a, b) => a.name.localeCompare(b.name))
        return [members[0], members[1]]
    } 
    return [members[Math.floor(Math.random()*members.length)], ""];
}


module.exports = {
    SelectHost: function(event_id){
        selectHost(event_id)
    }
}