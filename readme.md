# Do it Shop

# Date rules for success

when sending dates to the server, you should always getTime() before sending to server and storing.
all dates in database are ALWAYS stored in UTC time.

always send dates/times from server to client in UTC time so that they can be localized properly.

diagram to server

```js
// client
const dateString = "1987-11-20";

//before sending convert to date
const date = new Date("1987-11-20");
// zero out time if you don't care to store it
date.setHours(0, 0, 0, 0);

// get timestamp and send to server
date.getTime(); // ex: 541654165465136541
```
