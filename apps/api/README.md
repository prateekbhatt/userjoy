# API

This app contains an expressjs api which exposes a rest interface for the db.

## Notes

###### Key Reference

| key   | def                   |
| ----- | --------------------- |
| accid | account id            |
| aid   | app id                |
| amId  | automessage id        |
| br    | browser               |
| brv   | browser version       |
| ci    | city                  |
| cid   | company id            |
| co    | country               |
| coId  | conversation id       |
| ct    | created at timestamp  |
| d     | domain                |
| dv    | device type           |
| h     | health                |
| ip    | ip address            |
| mId   | message id            |
| op    | operator (and / or)   |
| p     | path (event url)      |
| pl    | platform              |
| sid   | segment id            |
| sname | sender name (message) |
| sub   | email subject         |
| t     | type (event)          |
| uid   | user id               |
| ut    | updated at timestamp  |


###### Definitions

Show the list of defined modules, actions and sent events for an app

###### Query engine

Primary Collections for segmentation:

- User
- Company
- Events

Types of queries:

- count
- hasdone
- hasnotdone
- attr


###### Apps

A account on Userjoy can have multiple apps.

###### Mailgun and Mailer

Every app has a default inbound email address which is "aid@mail.userjoy.co", where aid is primary key of the app on mongodb. e.g. "UserJoy <1234@mail.userjoy.co>", where aid = 1234

To create threads, we append the parent message id to the app email address, and create the reply-ro email. e.g. "Reply to UserJoy <1234+5678@mail.userjoy.co>" where aid = 1234 and message id = 5678. So, we know that the inbound message is a reply to message with id 5678

###### Custom MetaData

We allow the apps to pass 'custom' attributes related to users and companies. These attributes should be stored in a 'custom' metadata field using (```custom: [{ k: 'key', v: 'value'}]```) array. [Reference](http://calv.info/indexing-schemaless-documents-in-mongo/)

> #### Schema

> ##### Columns:
>
> - k (key)
> - v (value)
>
> ##### Notes:
>
> - Disabled creating an id for each subdocument
>


###### Query

- Run count query and attr query separately. This it to ensure 'AND/OR' work as expected across count and attr queries
- hasnotdone: query events by time
cases:
- Edge cases
1. sometimes hasdone event + hasnotdone event =/= total users



###### Email Types

- behavioral (segments, interval-hourly/daily, initially  just daily): for each segment, a user can get this message only once
- transactional (immediate): userjoy is not meant to send transactional messages
- newsletter (once, manual): will deal with this later. we already allow the user to send manual messages, just need to also allow him to customize the templates.

## Models


name          | embedded documents      | description
-----         | ----------------------  | -----------
Account       |                         | accounts on Userjoy
App           | team                    | apps belonging to an account
AutoMessage   |                         | automated messages
Company       |                         | companies of a specific account
Conversation  | Message                 | conversation threads between users and accounts
DailyReport   |                         | the score, usage of a user for a specific company (monthly)
Event         |                         | events belonging to a user
Invite        |                         | tokens of team members that have been invited to use an app
Notification  |                         | notifications to be shown to the user (only auto)
Segment       | filters                 | all the segments defined for an app
User          | companies               | users of a specific app. create a new user for every new unique identifier for an app
UserNote      |                         | notes created by team members about a specific user



### Account

##### Columns:

- email (required)
- name (required)
- password (required)
- verifyToken
- emailVerified (boolean)
- passwordResetToken
- ct
- ut


##### Indexes:

- email


##### Notes:

- No need to store the reporting hour

### App

##### Columns:

- color (hex color code for notifications / feedback)
- ct
- isActive (boolean)
- name
- queuedHealth (when was the health queue last queued)
- queuedScore (when was the score queue last queued)
- queuedUsage (when was the usage queue last queued)
- team [{accId, admin}]
- x tags [] stores all tags that the app has used for its users
- url (domain url)
- ut


##### Indexes:

- team.accid


##### Notes:

- Admin can add / remove access to team members. On adding / removing access both Accounts and Apps collections have to be updated. The Account should also be notified by email.
- Update 10-06-2014: Earlier, there were three additional keys (`live`, `liveKey`, `testKey`) to switch between live and test modes. Removed them because they were not helping in segregating data in a simple way across the User, Company and Event models. It would be preferable to have an array (embedded documents) of environments instead, and make all queries in the context of an `environment-id` rather than an `app-id`.

### User

##### Columns:

- aid
- user_id (to allow the app to recognize a user even if the user changes email/username)
- email (required)
- browser ("Chrome 35" etc.)
- country (2 letter ISO-3166-1 country code, [REF](https://github.com/bluesmoon/node-geoip#looking-up-an-ip-address)
- custom (object containing additonal info about users)
- device ('Apple iPad')
- name
- firstName
- lastName
- ct
- ut
- health (latest health status of the user, defaults to average for new user)
- joined (when did the user join the service)
- os ('iOS 5.0')
- plan
- revenue
- score (latest engagement score of user, defaults to 50 for new user)
- status
- lastContactedAt
- lastSession (timestamp of last session of user)
- lastHeardAt
- ip
- x tags [] Stores tags for categorizing users
- companies [{cid, name}]


##### Indexes:

- aid
- companies.cid
- email
- user_id


##### Notes:

- User can belong to multiple companies (In Userjoy's case, a user can belong to multiple apps)
  If so, we need to calculate the following attribute of a user on a per company basis:
    - healthScore
    - billing

- status must be one of [trial, free, paying, cancelled]
- Engagement score is calculated based on total usage in last 14 days, normalized to 100

- Ignoring: user acquisition data like (since we do not have data for non loggedin users):
    - referredBy (document.referrer or $Direct)
    - search_keyword
    - utm_campaign
    - utm_content
    - utm_medium
    - utm_source
    - utm_term

- utm data could be added to sessions

##### Embedded Documents:


### UserNote

##### Columns:

- aid
- creator (accountId)
- ct
- note
- uid (user id)
- ut


##### Indexes:

- aid
- uid


### DailyReport

##### Columns:

- aid
- cid
- ct
- ds_{{date}} (score in the day, e.g. "du_23: 43")
- du_{{date}} (usage in minutes for the day, e.g. "du_23: 455")
- y (year: 2014-2100)
- m (month: 1-100)
- uid

##### Notes:

- We upsert the usage / score data on a monthly basis. Only one document per user-company per month.
Data is preallocated on first creation (from du_1 ... du_31, ds_1 ... ds_31). Usage / score default to 0
- Cron job should update a user's health score daily for each company that he belongs to
- Storing data in this manner will allow us to visualize the trend in an user's health over a period of time

### Company

##### Columns:

- aid
- company_id (required, similar to user_id)
- name (required)
- ct (should be passed by js snippet)
- custom (object containing additonal info about users)
- ut
- plan
- revenue
- status
- x tags [] just like user tags

##### Indexes:

- aid
- company_id
- name

##### Notes:

- status must be one of [trial, free, paying, cancelled]
- ct property should not be automatically added on company creation



### Segment

##### Columns:

 - aid
 - creator (account id)
 - ct
 - filters (embedded documents)
 - fromAgo (optional, number of days since when count queries should be run)
 - health (good/average/bad, for predefined health segments)
 - list (to unix timestamp for count queries)
 - name
 - op
 - predefined (boolean, true if defined at the start of the app)
 - toAgo (optional, number of days till when count queries should be run)
 - ut

##### Indexes:

- aid

##### Embedded Documents:

> ### Filter
>
> Columns:
>
> - method
> - type
> - name
> - module
> - op
> - val (Schema.Types.Mixed - to allow integer/string etc types)


### Event

##### Columns:

- aid (required)
- amId (required for automessage events)
- amState (clicked,sent,seen,replied)
- cid
- ct
- module
- name (required)
- type (required)
- uid (required)


##### Indexes:

- aid
- cid
- type
- uid
- ct

##### Notes:

- 'amId' and 'amState' must be required for 'automessage' events


### AutoMessage

##### Columns:

- active (boolean)
- aid (required)
- body (required)
- clicked
- creator (account id) (required)
- ct
- lastQueued (timestamp)
- replied
- seen
- sender (account id)
- sent
- sid
- sub (for email type)
- title (required)
- type (email / notification) (required)
- ut

##### Indexes:

- aid

### Notification

##### Columns:

- amId
- body
- ct
- senderEmail (required, to show gravatar in notification)
- senderName (required)
- title (Required, automessage title)
- uid

##### Indexes:

- uid

##### Notes:

- Only auto notifications are stored in this. Manually created notifications are not allowed now.
- A notification would be deleted once it has been seen by the user

### Conversation

##### Columns:

- aid
- amId (present if conversation was started as a reply to an automessage)
- assignee (account id)
- closed (boolean)
- ct
- sub
- uid
- ut

##### Indexes:

- aid
- uid
- closed

##### Notes:

- assignee should not be required. It is possible that the conversation is a new one and is not assigned to any team member. In this case we will send emails to all team members/ only admin (?)

##### Embedded Documents:

> ### Message
>
> ##### Columns:
>
> - accid
> - body
> - clicked (boolean)
> - ct
> - from (enum: [user, account]) (is it sent from a 'user' or an 'account')
> - seen (boolean)
> - sent (boolean)
> - sName
> - type (email / notification)
>
> ##### Notes:
>
> - accid is required only when the message is created by an account. If a user has sent the message, then it is not required for the message to have an accid


### Invite

##### Columns:

- aid (required)
- ct
- from (accountId) (required)
- status (pending / cancelled / joined)
- toEmail (required)
- toName (required)
- ut

##### Notes:

- Invites should be deleted once accepted (?)
- Use mongo objectId as invite token

#### PONDER

- How to store plan, license, amount info?
- How to store customer journey info?
- How to handle conversations and messages?
- Using Mailgun, it is possible to assign unique readable email ids for each team member of an app, e.g. "prateek@dodatado.mail.userjoy.co"


## API (To be updated)

### Message

#### POST /apps/:aid/messages

##### Request

```js
{
  sName: 'Prateek Bhatt',
  sub: 'Welcome to UserJoy!',
  body: 'This is the message you want to send',
  type: 'email',
  uid: '535e5aafddda18934d1a2c6f'
}
```

##### Response

```js
{
  sName: 'Prateek Bhatt',
  sub: 'Welcome to UserJoy!',
  body: 'This is the message I want to send',
  type: 'email',
  uid: '535e5aafddda18934d1a2c6f',
  from: 'account',
  accid: '535e5aaeddda18934d1a2c66',
  aid: '535e5aafddda18934d1a2c68',
  coId: '535e5aafddda18934d1a2c70',
  _id: '535e5aafddda18934d1a2c71',
  ut: '2014-04-28T13:42:07.353Z',
  sent: false,
  seen: false,
  replied: false,
  ct: '2014-04-28T13:42:07.352Z',
  clicked: false
}
```

#### POST /apps/:aid/messages/:mId

##### Request

```js
{
  sName: 'John Sender',
  body: 'This is the message I want to send'
}
```

##### Response

```js
{
  __v: 0,
  body: 'This is the message I want to send',
  type: 'email',
  accid: '535e67a2455135db1815b072',
  aid: '535e67a2455135db1815b074',
  coId: '535e67a2455135db1815b078',
  from: 'account',
  sub: 'New Subject',
  uid: '535e67a1455135db1815b06f',
  _id: '535e67a2455135db1815b07b',
  ut: 'Mon Apr 28 2014 20:07:22 GMT+0530 (IST)',
  sent: false,
  seen: false,
  replied: false,
  ct: 'Mon Apr 28 2014 20:07:22 GMT+0530 (IST)',
  clicked: false
}
```
