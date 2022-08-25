const event_members_history_repo = require("../repository/event_members_history")
const event_members_repo = require("../repository/event_members")
const client = require("../client/handler");
const helper = require("../utils/helper");
const logger = require("../repository/system_logs")

// selectHost will get all available members in a event
// and picks a member as the host, with respect to `pick_by_alphabetical`
async function selectHost(event_id) {
    let event_members = await geteventMembers(event_id)
    if (Object.keys(event_members).length == 0){
        await event_members_repo.UpdateAlleventIsActive(event_id, 1)
        event_members = await geteventMembers(event_id)
    }
    processeventMembers(event_members)
}

// geteventMembers retrieves a specific event and the linked members from `event_members` table
// filters away the non-active statuses
// returns a mapped events with members data populated in each event object
async function geteventMembers(event_id){
    let event_members = await event_members_repo.Read(event_id)

    let events = {}

    event_members.filter(event_member => event_member.is_event_member_active && event_member.is_event_active && event_member.is_member_active).forEach(event_member => {
        let mapped_members = events[event_member.event_id]?.members
        let event = {
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
            event.members = [...event.members, ...mapped_members]
        }
        events[event_member.event_id] = event
    });

    return events
}

// processeventMembers loops through all the events and randomly pick a member to be the host
/// when a member is picked, the webhook will be called and the event_members.is_active is updated to false
function processeventMembers(event_members) {
    for (const [event_id, event_member] of Object.entries(event_members)) {
        if (event_member.is_fortnightly && ((event_member.is_fortnightly_even_week && helper.WeekNumber() % 2 != 0) || (!event_member.is_fortnightly_even_week && helper.WeekNumber() % 2 == 0))){
            continue
        }
        logger.Info("event_member", "selectHost", "eligible event members: " + JSON.stringify(event_members));

        choosen_member = pickMember(event_member)

        capitalized_name = helper.CapitalizeFirstLetter(choosen_member.name)
        client.Hook(event_member.hook_base_url, event_member.hook_path, capitalized_name, choosen_member.messenger_user_id)

        event_members_repo.UpdateIsActive(event_id, choosen_member.id, 0)
        event_members_history_repo.Create(event_id, choosen_member.id)
        logger.Info("event_member", "processeventMembers", "selected "+ JSON.stringify(choosen_member) +" as host for " + event_member.name);
    }
}

// pickMember picks a member is the list of active members, according to pick_by_alphabetical.
// pick_by_alphabetical == true, pick according to pick_by_alphabetical order ascending
// pick_by_alphabetical == false, pick randomly
function pickMember(event_member){
    var members = event_member.members
    if (members.length == 1) {
        return members[0]
    }
    if (event_member.pick_by_alphabetical) {
        members.sort((a, b) => a.name.localeCompare(b.name))
        return members[0]
    } 
    return members[Math.floor(Math.random()*members.length)];
}


module.exports = {
    SelectHost: function(event_id){
        selectHost(event_id)
    }
}