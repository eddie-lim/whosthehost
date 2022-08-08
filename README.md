# whosthehost
Tired of finding out who is the host in the rotation for meetings like sprint ceremonies (planning/retrospective/grooming/stand-up) or even team bonding events?

### Requirement
- This service will need a webhook to call to tell them who is the host!

# Phases
## Phase 1 (Big Bang)
_Get the most fundamental features out_
- Manually store list of names in DB via `INSERT` SQL command.
- Set up cron job to trigger at specific time of day
- Query list of names from DB, and randomly pick 1 that has `is_active == true`.
- POST to webhook with the selected host name
- Set the selected host `is_active = true`

## Phase 2 (One For All)
_Have 1 service to cater to multiple recipients_
- Able to cater to multiple rotation list for different webhook that triggers at different timing

## Phase 3 (Zen)
_Ease of use_
- Have simple UI to
  - manage different list of names
  - manage different webhook URL
