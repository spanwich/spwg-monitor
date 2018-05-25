'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
var bodyParser = require('body-parser');


// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
	process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason.stack);
    // application specific logging, throwing an error, or other logic here
});

});

app.get('/', function (request, response) {
    response.send('This is SPWG monitoring application.');
});

app.get('/spwg-api', function (req, res) {
    const respText = { type: 'text', text: req.query.respText };
    client.pushMessage('Ccef68d0d971ccfd1ff091808bb24634f', respText);
	return res.sendStatus(200);
});

app.post('/spwg-api', function(req, res) {
	console.log(req.body);
    console.log(req.body.id);
    console.log(req.body.system);
    console.log(req.body.message);
	
    const respText = { type: 'text', text: req.body.message };
	client.pushMessage('Ccef68d0d971ccfd1ff091808bb24634f', 'From system' + req.body.system);
	client.pushMessage('Ccef68d0d971ccfd1ff091808bb24634f', respText);
	return res.sendStatus(200);
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  console.log(event.message.text);
  console.log(event.source.userId);
  console.log(event.source.groupId);
  // create a echoing text message
  //const echo = { type: 'text', text: event.message.text };
  //console.log(event.message.text);
  //console.log(event.source.userId);
  //console.log(event.source.groupId);
  //use reply API
  //return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(process.env.CHANNEL_ACCESS_TOKEN);
  console.log(process.env.CHANNEL_SECRET);
  console.log(`listening on ${port}`);
});
