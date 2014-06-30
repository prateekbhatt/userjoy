Workers
=======

Workers are run from a separate app, 'workers', not from the 'api' app.

If a queue is empty, then the next fetch request is made after 1 hour, if it is not empty then the next request is made immediately. In case of automessage-consumer, the queue is checked after 5 minutes to check if any automessages have been made live now.
