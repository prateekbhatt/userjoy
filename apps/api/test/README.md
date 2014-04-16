NOTES
======

In lib/query tests:

- while creating a user, I have hardcoded the _id value to equal to the same
value while creating sessions inside fixtures/Session.js

- this should be implemented by creating a dummy user in the main fixtures/index.js
file, and passing around that user object by attaching it to the "saved" global
object
