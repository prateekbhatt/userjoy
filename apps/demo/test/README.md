NOTES
======

In lib/query tests:

- while creating a user, I have hardcoded the _id value to equal to the same
value while creating sessions inside fixtures/Session.js

- this should be implemented by creating a dummy user in the main fixtures/index.js
file, and passing around that user object by attaching it to the "saved" global
object


### Fixtures

#### UserFixtures

arguments: (aid, numberOfUsers, callback)

returns an array of [uids] in the callback

#### SessionFixtures

arguments: (aid, [uids], numberOfSessions, callback)

creates sessions by randomly choosing uid from the uids array
