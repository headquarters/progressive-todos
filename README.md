# Progressive TODOs
## A TODO list webapp full of progressive enhancements.

### Notes
For clients that don't support HEAD/DELETE/PUT, use POST with the header `X-HTTP-Method-Override` set to the actual method.
Replication is used to keep two databases in sync, even remotely. But continuous replication can be costly in time and space, so it's disabled
by default. This should be called whenever the local state changes in the user's copy of the DB.

Each user gets their own database (e.g. list). This makes the most sense for replication.
Todos are documents in the databases.

Server has to create user, then create their DB, and pass this info back
to the client. 
