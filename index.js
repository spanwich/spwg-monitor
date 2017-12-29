'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: `tvV8QGT3pkCtuY+3l15WVp5YfFiUJqlC+HzqKyXuqsB20RtF/cY4N9MggeJT1QxuCTyr3eo7gTmVgz6d8VnZozwItBVlKumLZ7e9BPkSzbYg4FvAOKj5NCJMYWJqkJ5K/H5WYEbVHIiWTU+BgeRFqgdB04t89/1O/w1cDnyilFU=`,
  channelSecret: `869e598da23336aa3c22e8c5a7309dc4`,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
