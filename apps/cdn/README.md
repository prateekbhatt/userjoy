# CDN

This app contains the Javascript API exposed to the clients

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

##### Special Properties

name       | required  | type      | description
-----      | ------    | ------    | ----------
email      | yes       | String    | email address of the logged in user
unique_id  | no        | String    | unique user id, should be database id
status     | yes       | String    | trial / free / paying / cancelled
plan       | no        | String    | name of the plan


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
name       | no        | String    | name of the company
status     | yes       | String    | trial / free / paying / cancelled
plan       | yes       | String    | name of the plan


### Page

```js
userjoy.page(module, name, properties, callback)
```

Track a pageview

##### Reserved Properties (Do Not Send)

name       | description
-----      | ------
name       | already being sent as the first / second param
module     | already being sent as the first param



### Track

```js
userjoy.track(module, name, properties, callback)
```

Track an event

### TrackLink

```js
userjoy.trackLink(id, callback)
```

Track a url click


### TrackForm

```js
userjoy.trackForm(id, callback)
```


Track a form submission
