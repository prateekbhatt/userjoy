# API

This app contains an expressjs api which exposes a rest interface for the db.

## Notes

###### Definitions

Show the list of defined features, actions and sent events for an app

###### Query engine

The user event data will be exposed using [express-restify-mongoose](https://github.com/florianholzapfel/express-restify-mongoose) package

Primary Collections for segmentation:

- User
- Company
- Session (Events)

Types of queries on Session:

- count
- exists (findOne with projection (_id: 1))
- does not exist (findOne with projection (_id: 1))

###### Visits

A 'Visit' can be defined as a 30-minute long session. Any event that occurs for a user within 30 minutes of his previous session will be added to the previous session.

###### Events & Visits

For the above, 'Events' can be embedded documents in the 'Session' collection **OR** the session document could have an array of object ids of all the events belonging to it

UPDATE: Will go on with the first approach and store events in an embedded document inside the session schema

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
- tags [] stores all tags that the app has used for its users
- customKeysUser [] stores all the keys of custom data that the app is passing
- customKeysCompany [] stores all the keys of custom data that the app is passing
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
- user_id (to allow the app to recognize a user even if the user changes email/username)
- email (required)
- name
- username
- meta (object containing additonal info about users)
- unsubscribed (boolean)
- unsubscribedOn (date)
- unsubscribedThrough (messageId)
- createdAt
- updatedAt
- firstSessionAt
- totalSessions
- lastContactedAt
- lastSessionAt
- lastHeardFrom
- healthScore (latest value from User Health)
- tags [] Stores tags for categorizing users
- notes
- status (Free, Paying, Cancelled)
- companies [{companyId, companyName, billing{}, healthScore, totalSessions}]
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

- User can belong to multiple companies (In our case, a user can belong to multiple apps)
  If so, we need to calculate the following attribute of a user on a per company basis:
    - healthScore
    - totalSessions
    - billing

- Billing status must be one of [trial, free, paying, cancelled]
- The firstSessionAt attribute is added when a new user is created
- createdAt property needs to be provided to the js snippet
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


### User Health

Stores the healtscore of a user for a specific company

- appId
- companyId
- userId
- score
- createdAt

##### Notes:

- Cron job should update a user's health score daily for each company that he belongs to
- Storing data in this manner will allow us to visualize the trend in an user's health over a period of time

### Companies

Stores companies of a specific account

##### Columns:

- appId
- company_id (similar to user_id)
- name
- totalSessions
- meta (object containing additonal info about users)
- createdAt (should be passed by js snippet)
- updatedAt
- tags [] just like user tags
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
- createdAt property should not be automatically added on company creation



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
- platform
- country
- city
- ip
- os
- browser
- browserVersion
- deviceType (desktop, mobile, tablet)
- createdAt
- updatedAt

##### Notes

- Get city, country data from (api.hostinfo or Maxmind)
- Can add user data (name / email) to sessions
- Session time needs to be updated when a new event is created


### Events

Stores events happening on an app

##### Columns:

- appId
- userId
- sessionId
- type (feature, pageview)
- featureId
- actionId
- domain
- path
- title
- createdAt
- updatedAt

##### Notes:

Ignoring the following:

- type (click, submit, change)
- targetTag
- targetId
- targetClass
- targetText


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
