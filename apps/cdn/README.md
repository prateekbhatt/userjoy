# CDN

This app contains the Javascript API exposed to the clients

## Notes

#### Modules
UserJoy allows you to categorize your app into modules, i.e. for a task management app, these could be 'Team' module, 'Task' module.

#### Events
Every module should have a set of events, i.e. for the 'Team' module, events could be  'Created New Team', 'Added Team Member' etc.


## Javascript API


### Identify

```js
userjoy.identify(properties, callback)
```

Identify the logged in user

##### Params

name       | required  | type      | description
-----      | ------    | -----     | ------
properties | yes       | Object    | Attributes of the user such as email, name, user_id etc.
callback   | no        | Function  | Optional function to be called after the `userjoy.identify` call

##### Properties

name       | required  | type      | description
-----      | ------    | ------    | ----------
email      | yes       | String    | email address of the logged in user
user_id    | no        | String    | unique user id, should be database id
name       | no        | String    | full name / username of the user
plan       | no        | String    | name of the plan
revenue    | no        | Number    | amount of revenue from this user
status     | yes       | String    | trial / free / paying / cancelled
joined     | yes       | Number    | unix timestamp (milliseconds after epoch) (if not provided, it will default to the time the user was first seen by UserJoy)
custom     | no        | Object    | key-value pairs of additional properties


##### Reserved Properties (Do Not Send)

These properties are automatically added by UserJoy. You should not send them, because they will be overwritten.

name       | description
-----      | ------
browser    | browser of the user, e.g. 'Chrome 35'
device     | the device the user is on, e.g. 'Apple iPad'
os         | the operating system the user is on, e.g. 'Windows 8'


##### Example

Please update this and pass values to identify the current logged in user.

```js
userjoy.identify({
  // TODO: pass these values below

  // email is required to identify the user and send him messages
  email: 'p@userjoy.co',

  // unique_id is required to identify user, if your app allows a user
  // to change his email address
  unique_id: '758439753849',

  // the payment status of the user (required)
  status: 'paying',

  // provide the joined date of the user (in milliseconds after epoch, required)
  joined: 1403353187345,

  // you should pass the subscription plan of the user
  // to segment by the plan name, but its optional
  plan: 'Enterprise',

  // you should provide the monthly revenue (its optional)
  revenue: 499

})
```

### Company

```js
userjoy.company(properties, callback)
```

Identify the company/team/organization that the logged in user belongs to

##### Params

name       | required  | type      | description
-----      | ------    | -----     | ------
properties | yes       | Object    | Attributes of the company such as name, members etc.
callback   | no        | Function  | Optional function to be called after the `userjoy.company` call

##### Special Properties

name       | required  | type      | description
-----      | ------    | ------    | -----
unique_id  | yes       | String    | unique company id, should be database id
name       | yes       | String    | name of the company/team/organization
plan       | no        | String    | name of the plan
revenue    | no        | Number    | amount of revenue from this user
status     | yes       | String    | trial / free / paying / cancelled

##### Example

Please update this and pass values for the company of the current logged in user. A user can belong to multiple companies, however, you should provide the company that user is currently logged into.

```js
userjoy.company({
  // TODO: pass these values below

  // unique_id is required to identify the company across multiple users
  unique_id: '43444343',

  // name of the company is also required
  name: 'DoDataDo',

  // the payment status of the company account (required)
  status: 'paying',

  // you should pass the subscription plan of the company to
  // segment by the plan name, but its optional
  plan: 'Enterprise',

  // you should provide the monthly revenue (its optional)
  revenue: 499

})
```

### Page

```js
userjoy.page(name, module, callback)
```

Track a pageview.

##### Params

name       | required  | type      | description
-----      | ------    | -----     | ------
name       | yes       | String    | Name of the event, i.e. 'Added New Member', 'Created New Task', 'Upgraded Plan' etc
module     | no        | String    | Name of the product module, i.e. 'Team', 'Tasks', 'Billing' etc.
callback   | no        | Function  | Optional function to be called after the `userjoy.track` call


##### Example

```js
userjoy.page('Team members', 'Team');
```

### Track

```js
userjoy.track(name, module, callback)
```

Track an event performed by the user.

##### Params

name       | required  | type      | description
-----      | ------    | -----     | ------
name       | yes       | String    | Name of the event, i.e. 'Added New Member', 'Created New Task', 'Upgraded Plan' etc
module     | no        | String    | Name of the product module, i.e. 'Team', 'Tasks', 'Billing' etc.
callback   | no        | Function  | Optional function to be called after the `userjoy.track` call

##### Example

```js
userjoy.track('Made Payment', 'Billing');
```

### Track_Link

```js
userjoy.track_link(links, name, module)
```

`track_link` is a helper method to help you track url clicks.

##### Params

name       | required  | type           | description
-----      | ------    | -----          | ------
links      | yes       | String / Array | id of the link, e.g. 'userjoy_blog_link'
name       | yes       | String         | Name of the event, i.e. 'Clicked Billing Link' etc
module     | no        | String         | Name of the product module, i.e. 'Team', 'Tasks', 'Billing' etc.

##### Example

```js
userjoy.track_link('blog_top_link', 'Went to UserJoy Blog', 'Navbar');
```


### Track_Form

```js
userjoy.track_form(forms, name, module)
```

`track_form` is a helper method to help you track form submissions.

##### Params

name       | required  | type           | description
-----      | ------    | -----          | ------
forms      | yes       | String / Array | Id of the form, e.g. 'signup_form'
name       | yes       | String         | Name of the event, i.e. 'Submitted Billing Form' etc
module     | no        | String         | Name of the product module, i.e. 'Team', 'Tasks', 'Billing' etc.


##### Example

```js
userjoy.track_form('add_team_member_form', 'Added team member', 'Team');
```
