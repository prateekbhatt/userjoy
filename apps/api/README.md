# API

This app contains an expressjs api which exposes a rest interface for the db.

## Notes

###### Query engine

The user event data will be exposed using [express-restify-mongoose](https://github.com/florianholzapfel/express-restify-mongoose) package

###### Visits

A 'Visit' can be defined as a 30-minute long session. Any event that occurs for a user within 30 minutes of his previous session will be added to the previous session.

###### Events & Visits

For the above, 'Events' can be embedded documents in the 'Session' collection **OR** the session document could have an array of object ids of all the events belonging to it

###### Apps

Allow multiple 'Apps' per account ?

## Models

### Accounts (DoDataDo)

Stores accounts on DoDataDo

##### Columns:

- email
- name
- password
- verifyToken
- emailVerified (boolean)
- passwordResetToken
- createdAt
- updatedAt

##### Notes:

- No need to store the reporting hour

##### Embedded Documents:

> ### Account Tokens
>
> Stores the password reset tokens, and email confirmation > tokens
>
> ##### Columns:
>
> - type (reset, confirmation)
> - token
> - createdAt
>
> ##### Notes:
>
> - Should be valid for 24 hours since createdAt.
> - Cron job should delete tokens older than 24 hours.
> - UPDATE: Currently tokens are being stored in Account Model in `verifyToken` and `passwordResetToken` fields
>
> ### Account Sessions
>
> Stores sessions on DoDataDo dashboard of an account.
> Would be used to enable remember me feature
>
> ##### Notes:
>
> Initially this can be implemented using a Redis store and > adding max-age (?)

### Apps (DoDataDo)

Stores all apps belonging to accounts on DoDataDo

##### Columns:

- name
- admin (accountId)
- team [accountIds of team]
- testKey
- liveKey
- createdAt
- updatedAt

##### Notes:

- Admin can add / remove access to team members
- On adding / removing access both Accounts and Apps collections have to be updated
- The Account should also be notified by email
- Keys should be used because they can be easily switched
- test key should be used in test environment
- live key should be used in production environment

### Features

Stores features defined by an account

Should be features be an embedded document inside Apps?

##### Columns:

- appId
- name
- actions []

### Users

Stores users of a specific account

Create new user for every new unique identifier for an app

##### Columns:

- appId
- email (required)
- name
- username
- meta (object containing additonal info about users)
- unsubscribed (boolean)
- unsubscribedOn (date)
- unsubscribedThrough (messageId)
- createdAt
- updatedAt
- country
- city
- ip
- totalSessions
- lastContacted
- lastSession
- lastHeardFrom
- os
- browser
- browserVersion
- deviceType (desktop, mobile, tablet)
- healthScore (latest value from User Health)
- tags [all tags this user belongs to]
- notes
- status (Free, Paying, Cancelled)
- companyId

##### Notes:

- Get city, country data from (api.hostinfo or Maxmind)

- Health score should be calculated based on total sessions in last 30 days, total time spent on site [?]

- Ignoring: user acquisition data like (since we do not have data for non loggedin users):
    - referredBy (document.referrer or $Direct)
    - search_keyword
    - utm_campaign
    - utm_content
    - utm_medium
    - utm_source
    - utm_term


##### Embedded Documents:

> ### User Notes
>
> Stores notes related to a user
>
> Columns:
>
> - note
> - createdBy (accountId)
> - createdAt
> - updatedAt
>
> Notes:
>
> - This should be an embedded document in the Users model

### User Tags

Stores tags for categorizing users

##### Columns:

- appId
- name
- users [userIds of all users belonging to this tag]
- createdAt
- updatedAt

### User Health

Stores the healtscore of a user

- appId
- userId
- score
- createdAt

##### Notes:

- Cron job should update a user's health score daily
- Storing data in this manner will allow us to visualize the trend in an user's health over a period of time

### Companies

Stores companies of a specific account

##### Columns:

- appId
- name
- total sessions
- meta (object containing additonal info about users)

### Segments

Stores all the segments defined for an app

appId
query: {
  where: {
      and: [{
          "scalar": {
              "type": "field",
              "name": "name",
              "custom": "user"
          },
          "op": "contains",
          "val": "P"
      }, {
          "scalar": {
              "type": "field",
              "name": "joindate",
              "custom": ""
          },
          "op": "<=",
          "val": 1393871400000
      }]
  },
  "main": {
      "type": "object",
      "name": "Phone Users"
  },
  "page": {
      "num": 1,
      "size": 10
  }
},
"type": "empty",
"time": 1394720988005


### User Sessions

Create a new session if the user does not have any events in the last 30 minutes

##### Columns:

- appId
- userId
- total sessions
- country
- platform
- createdAt
- updatedAt

### Events

Stores events happening on an app

##### Columns:

- appId
- type (feature)
- featureId
- actionId

##### Notes:

Ignoring the following:

- sessionId
- type (click, submit, pageview, change)
- targetTag
- targetId
- targetClass
- targetText
- domain
- path
- title


### Message Templates

Stores the templates of the messages to be sent

##### Columns:

- appId
- createdBy (accountId)
- type (email / notification)
- template
- title
- subject (for email type)
- trigger [TODO]
- total_sent
- total_seen
- total_replied
- total_clicked
- createdAt
- updatedAt

### Messages

Stores the messages between users and accounts

##### Columns:

- conversationId
- accountId (sent to/from account)
- type (email / notification)
- text
- sent (boolean)
- seen (boolean)
- replied (boolean)
- clicked (boolean)
- createdAt
- createdBy

### Conversations

Stores conversation threads between users and accounts

##### Columns:

- appId (sent to/from app)
- userId (sent to/from user)
- auto (boolean)
- templateId (if automated else null)
- subject (for email)
- closed (boolean)
- assigned [accounts assigned to this conversation]
- createdAt
- updatedAt
- createdBy

### Invites

Stores tokens of team members that have been invited to use an app

##### Columns:

- to (email)
- by (accountId)
- for (appId)
- token
- createdAt
- status (pending / cancelled / joined)

##### Notes:

- Invites should be deleted once accepted (?)

#### TODO

- How to store plan, license, amount info?
- How to store customer journey info?
- What event data to store?
- How to handle conversations and messages?
- How to store queries (segments)?
