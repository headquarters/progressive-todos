# Progressive TODOs
## A TODO list webapp full of progressive enhancements.

The TODO list app is the "Hello World" of web application development. JavaScript web frameworks even [compete on their implementations of this idea](http://todomvc.com/). 
Instead of creating yet another TODO list app with the latest and greatest framework, I wanted to put together a proof of concept
for a TODO list web application that is full of progressive enhancements. Something that, built from the server "up", handles a 
TODO list without any client-side JavaScript. When client-side JS is available, it gives the user some fancy new capabilities, such as
syncing across browser tabs/windows, offline capabilities with local storage, and quick UI updates without a page refresh. 

### Requirements
- For running locally, a Cloudant account is required to test this: cloudant.com
- Add the following ENV vars:
 - SESSION_SECRET - some lengthy alphanumeric sequence
 - CLOUDANT_USERNAME
 - CLOUDANT_PASSWORD
 - CLOUDANT_URL - i.e. https://username.cloudant.com

### Commands
Install dependencies
`npm install`

Start the app
`npm start`

### Notes
For clients that don't support HEAD/DELETE/PUT, use POST with the header `X-HTTP-Method-Override` set to the actual method.
Replication is used to keep two databases in sync, even remotely. But continuous replication can be costly in time and space, so it's disabled
by default. This should be called whenever the local state changes in the user's copy of the DB.

Each user gets their own database (e.g. list). This makes the most sense for replication.
Todos are documents in the databases.

Server has to create a user, then create their DB, and pass this info back to the client. 

