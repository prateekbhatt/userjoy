# API

This app contains an expressjs api which exposes a rest interface for the db.

## Notes

###### Key Reference

| key   | def                   |
| ----- | --------------------- |
| accid | account id            |
| aid   | app id                |
| br    | browser               |
| brv   | browser version       |
| ci    | city                  |
| cid   | company id            |
| co    | country               |
| coId  | conversation id       |
| ct    | created at timestamp  |
| d     | domain                |
| dv    | device type           |
| ev    | events (Session)      |
| f     | feature (event)       |
| h     | health                |
| ip    | ip address            |
| n     | name (action)         |
| mId   | message id            |
| op    | operator (and / or)   |
| p     | path (event url)      |
| pl    | platform              |
| seId  | segment id            |
| sid   | session id            |
| sname | sender name (message) |
| sub   | email subject         |
| t     | type (event)          |
| tId   | templateId            |
| uid   | user id               |
| ut    | updated at timestamp  |


###### Definitions

Show the list of defined features, actions and sent events for an app

###### Query engine

Primary Collections for segmentation:

- User
- Company
- Session (Events)

Types of queries:

- count
- hasdone
- hasnotdone
- attr

###### Sessions

All events that the user triggers within a 30 minute period of each-other are part of a single session.

###### Apps

A account on Userjoy can have multiple apps.

###### Mandrill and Mailer

Every app has a default inbound email address which is "aid@mail.userjoy.co", where aid is primary key of the app on mongodb. e.g. "UserJoy <1234@mail.userjoy.co>", where aid = 1234

To create threads, we append the parent message id to the app email address, and create the reply-ro email. e.g. "Reply to UserJoy <1234+5678@mail.userjoy.co>" where aid = 1234 and message id = 5678. So, we know that the inbound message is a reply to message with id 5678

###### MetaData

We allow the apps to pass custom attributes related to users, companies and events. These attributes should be stored in a metadata field using (```metadata: [{ key: 'key', value: 'value'}]```) array. [Reference](http://calv.info/indexing-schemaless-documents-in-mongo/)



## Models


name          | embedded documents      | description
-----         | ----------------------  | -----------
Account       |                         | accounts on Userjoy
App           | team                    | apps belonging to an account
Company       |                         | companies of a specific account
Conversation  |                         | conversation threads between users and accounts
Health        |                         | the healthscore of a user for a specific company
Invite        |                         | tokens of team members that have been invited to use an app
Message       |                         | messages between users and accounts
Segment       | filters                 | all the segments defined for an app
Session       | events (ev)             | sessions of a user, and events belonging to the session
Template      |                         | templates of the messages to be sent
Trigger       |                         | triggers for sending auto emails / notifications
User          | companies, notes        | users of a specific app. create a new user for every new unique identifier for an app



### Account

##### Columns:

- email
- name
- password
- verifyToken
- emailVerified (boolean)
- passwordResetToken
- ct
- ut

##### Notes:

- No need to store the reporting hour

### App

##### Columns:

- name
- admin (accId)
- team [accIds]
- testKey
- liveKey
- tags [] stores all tags that the app has used for its users
- ct
- ut

##### Notes:

- Admin can add / remove access to team members. On adding / removing access both Accounts and Apps collections have to be updated. The Account should also be notified by email.
- Keys should be used because they can be easily switched
- test key should be used in test environment
- live key should be used in production environment

### User

##### Columns:

- aid
- user_id (to allow the app to recognize a user even if the user changes email/username)
- email (required)
- x name
- x username
- x meta (object containing additonal info about users)
- unsubscribed (boolean)
- unsubscribedAt (date)
- unsubscribedThrough (messageId, subject)
- ct
- ut
- firstSessionAt
- totalSessions
- lastContactedAt
- lastSessionAt
- lastHeardAt
- healthScore (latest value from User Health)
- x tags [] Stores tags for categorizing users
- x notes
- companies [{cid, companyName, billing{}, healthScore, totalSessions}]
- billing {
    status,
    plan,
    currency,
    amount,
    licenses,
    usage,
    unit
  }

##### Notes:

- User can belong to multiple companies (In Userjoy's case, a user can belong to multiple apps)
  If so, we need to calculate the following attribute of a user on a per company basis:
    - healthScore
    - totalSessions
    - billing

- Billing status must be one of [trial, free, paying, cancelled]
- The firstSessionAt attribute is added when a new user is created
- ct property needs to be provided to the js snippet
- Health score should be calculated based on total sessions in last 30 days, total time spent on site [?]

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

> ### Note
>
> Columns:
>
> - note
> - createdBy (accountId)
> - ct
> - ut


### Health

##### Columns:

- aid
- cid
- ct
- h
- uid

##### Notes:

- Cron job should update a user's health score daily for each company that he belongs to
- Storing data in this manner will allow us to visualize the trend in an user's health over a period of time

### Company

##### Columns:

- aid
- company_id (similar to user_id)
- name
- totalSessions
- x meta (object containing additonal info about users)
- ct (should be passed by js snippet)
- ut
- x tags [] just like user tags
- billing {
    status,
    plan,
    currency,
    amount,
    licenses,
    usage,
    unit
  }

##### Notes:

- Billing data is stored both in Company and User models
- Billing status must be one of [trial, free, paying, cancelled]
- ct property should not be automatically added on company creation



### Segment

##### Columns:

 - aid
 - ct
 - ut
 - list
 - op
 - filters (embedded documents)

##### Embedded Documents:

> ### Filter
>
> Columns:
>
> - method
> - type
> - name
> - feature
> - op
> - val


### Session

##### Columns:

- aid
- br
- brv
- ci
- cid
- co
- ct
- dv (desktop, mobile, tablet)
- ev [EventSchema]
- ip
- pl
- uid
- ut

##### Notes

- Get city, country data from (api.hostinfo or Maxmind)
- Can add user data (name / email) to sessions
- Session time needs to be updated when a new event is created


##### Embedded documents

> ### Events
>
> Stores events happening on an app
>
> ##### Columns:
>
> - ct
> - d
> - f
> - n
> - p
> - t (feature, pageview)
>
> ##### Notes:
>
> Ignoring the following:
>
> - type (click, submit, change)
> - targetTag
> - targetId
> - targetClass
> - targetText
>

### Template

##### Columns:

- accid
- aid
- clicked
- ct
- name
- replied
- seen
- sent
- sub (for email type)
- title
- type (email / notification)
- ut

#####

- Difference between name and title?

### Message

##### Columns:

- accid
- aid
- clicked (boolean)
- coId
- ct
- from (enum: [user, account]) (is it sent from a 'user' or an 'account')
- mId (id of parent message)
- replied (boolean)
- seen (boolean)
- sent (boolean)
- sName
- sub
- text
- type (email / notification)
- uid
- ut

##### Notes:

- accid is required only when the message is created by an account. If a user has sent the message, then it is not required for the message to have an accid

### Conversation

##### Columns:

- aid
- accid
- closed (boolean)
- ct
- sub
- x tId
- uid
- ut

##### Notes:

- accId should not be required. It is possible that the conversation is a new one and is not assigned to any team member. In this case we will send emails to all team members/ only admin (?)


### Triggers

##### Columns:

- active (boolean)
- aid
- creator (accid)
- ct
- seId
- tId
- ut


### Invite

##### Columns:

- aid
- ct
- from (accountId)
- status (pending / cancelled / joined)
- to (email)
- ut

##### Notes:

- Invites should be deleted once accepted (?)
- Use mongo objectId as invite token

#### PONDER

- How to store plan, license, amount info?
- How to store customer journey info?
- How to handle conversations and messages?
- Using Mandrill, it is possible to assign unique readable email ids for each team member of an app, e.g. "prateek@dodatado.mail.userjoy.co"


## API

### Message

#### POST /apps/:aid/messages

##### Request

```js
{
  sName: 'Prateek Bhatt',
  sub: 'Welcome to UserJoy!',
  text: 'This is the message you want to send',
  type: 'email',
  uid: '535e5aafddda18934d1a2c6f'
}
```

##### Response

```js
{
  sName: 'Prateek Bhatt',
  sub: 'Welcome to UserJoy!',
  text: 'This is the message I want to send',
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
  text: 'This is the message I want to send'
}
```

##### Response

```js
{
  __v: 0,
  text: 'This is the message I want to send',
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
