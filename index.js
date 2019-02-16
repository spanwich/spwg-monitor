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
// webhook callback
//app.post('/callback', line.middleware(config), (req, res) => {
//    console.log(req);
//    if (req.body.destination) {
//        console.log("Destination User ID: " + req.body.destination);
//    }

//    // req.body.events should be an array of events
//    if (!Array.isArray(req.body.events)) {
//        return res.status(500).end();
//    }

//    // handle events separately
//    Promise.all(req.body.events.map(handleEvent))
//        .then(() => res.end())
//        .catch((err) => {
//            console.error(err);
//            res.status(500).end();
//        });
//});

app.post('/callback', (req, res) => {
    console.log(req.body);
    if (req.body.destination) {
        console.log("Destination User ID: " + req.body.destination);
        const respText = { type: 'text', text: "Destination User ID: " + req.body.destination };
        //notify me user that added to app.
        client.pushMessage('U08cc847af72b7afcf541853331020d58', respText);
    }

    // req.body.events should be an array of events
    if (!Array.isArray(req.body.events)) {
        return res.status(500).end();
    }

    // handle events separately
    Promise.all(req.body.events.map(handleEvent))
        .then(() => res.end())
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

app.get('/', function (request, response) {
    response.send('This is SPWG monitoring application.');
});

//app.get('/lzd-notify', function (req, res) {
//    const respText = { type: 'text', text: req.query.respText };
//    client.pushMessage('Ccef68d0d971ccfd1ff091808bb24634f', respText);
//	return res.sendStatus(200);
//});

app.post('/lzd-notify', function (req, res) {
    console.log(req.body)
    const respText = { type: 'text', text: req.body.message };
    client.pushMessage(req.body.accountid, respText);
	return res.sendStatus(200);
});

// event handler
// simple reply function
const replyText = (token, texts) => {
    texts = Array.isArray(texts) ? texts : [texts];
    return client.replyMessage(
        token,
        texts.map((text) => ({ type: 'text', text }))
    );
};

// callback function to handle a single event
function handleEvent(event) {
    if (event.replyToken && event.replyToken.match(/^(.)\1*$/)) {
        return console.log("Test hook recieved: " + JSON.stringify(event.message));
    }

    switch (event.type) {
        case 'message':
            const message = event.message;
            switch (message.type) {
                case 'text':
                    return handleText(message, event.replyToken, event.source);
                case 'image':
                    return handleImage(message, event.replyToken);
                case 'video':
                    return handleVideo(message, event.replyToken);
                case 'audio':
                    return handleAudio(message, event.replyToken);
                case 'location':
                    return handleLocation(message, event.replyToken);
                case 'sticker':
                    return handleSticker(message, event.replyToken);
                default:
                    throw new Error(`Unknown message: ${JSON.stringify(message)}`);
            }

        case 'follow':
            return replyText(event.replyToken, 'Got followed event');

        case 'unfollow':
            return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

        case 'join':
            return replyText(event.replyToken, `Joined ${event.source.type}`);

        case 'leave':
            return console.log(`Left: ${JSON.stringify(event)}`);

        case 'postback':
            let data = event.postback.data;
            if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
                data += `(${JSON.stringify(event.postback.params)})`;
            }
            return replyText(event.replyToken, `Got postback: ${data}`);

        case 'beacon':
            return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);

        default:
            throw new Error(`Unknown event: ${JSON.stringify(event)}`);
    }
}

function handleText(message, replyToken, source) {
    const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;

    switch (message.text) {
        case 'profile':
            if (source.userId) {
                return client.getProfile(source.userId)
                    .then((profile) => replyText(
                        replyToken,
                        [
                            `Display name: ${profile.displayName}`,
                            `Status message: ${profile.statusMessage}`,
                        ]
                    ));
            } else {
                return replyText(replyToken, 'Bot can\'t use profile API without user ID');
            }
        case 'buttons':
            return client.replyMessage(
                replyToken,
                {
                    type: 'template',
                    altText: 'Buttons alt text',
                    template: {
                        type: 'buttons',
                        thumbnailImageUrl: buttonsImageURL,
                        title: 'My button sample',
                        text: 'Hello, my button',
                        actions: [
                            { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
                            { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                            { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                            { label: 'Say message', type: 'message', text: 'Rice=米' },
                        ],
                    },
                }
            );
        case 'confirm':
            return client.replyMessage(
                replyToken,
                {
                    type: 'template',
                    altText: 'Confirm alt text',
                    template: {
                        type: 'confirm',
                        text: 'Do it?',
                        actions: [
                            { label: 'Yes', type: 'message', text: 'Yes!' },
                            { label: 'No', type: 'message', text: 'No!' },
                        ],
                    },
                }
            )
        case 'carousel':
            return client.replyMessage(
                replyToken,
                {
                    type: 'template',
                    altText: 'Carousel alt text',
                    template: {
                        type: 'carousel',
                        columns: [
                            {
                                thumbnailImageUrl: buttonsImageURL,
                                title: 'hoge',
                                text: 'fuga',
                                actions: [
                                    { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
                                    { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                                ],
                            },
                            {
                                thumbnailImageUrl: buttonsImageURL,
                                title: 'hoge',
                                text: 'fuga',
                                actions: [
                                    { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                                    { label: 'Say message', type: 'message', text: 'Rice=米' },
                                ],
                            },
                        ],
                    },
                }
            );
        case 'image carousel':
            return client.replyMessage(
                replyToken,
                {
                    type: 'template',
                    altText: 'Image carousel alt text',
                    template: {
                        type: 'image_carousel',
                        columns: [
                            {
                                imageUrl: buttonsImageURL,
                                action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
                            },
                            {
                                imageUrl: buttonsImageURL,
                                action: { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                            },
                            {
                                imageUrl: buttonsImageURL,
                                action: { label: 'Say message', type: 'message', text: 'Rice=米' },
                            },
                            {
                                imageUrl: buttonsImageURL,
                                action: {
                                    label: 'datetime',
                                    type: 'datetimepicker',
                                    data: 'DATETIME',
                                    mode: 'datetime',
                                },
                            },
                        ]
                    },
                }
            );
        case 'datetime':
            return client.replyMessage(
                replyToken,
                {
                    type: 'template',
                    altText: 'Datetime pickers alt text',
                    template: {
                        type: 'buttons',
                        text: 'Select date / time !',
                        actions: [
                            { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' },
                            { type: 'datetimepicker', label: 'time', data: 'TIME', mode: 'time' },
                            { type: 'datetimepicker', label: 'datetime', data: 'DATETIME', mode: 'datetime' },
                        ],
                    },
                }
            );
        case 'imagemap':
            return client.replyMessage(
                replyToken,
                {
                    type: 'imagemap',
                    baseUrl: `${baseURL}/static/rich`,
                    altText: 'Imagemap alt text',
                    baseSize: { width: 1040, height: 1040 },
                    actions: [
                        { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
                        { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
                        { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
                        { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
                    ],
                    video: {
                        originalContentUrl: `${baseURL}/static/imagemap/video.mp4`,
                        previewImageUrl: `${baseURL}/static/imagemap/preview.jpg`,
                        area: {
                            x: 280,
                            y: 385,
                            width: 480,
                            height: 270,
                        },
                        externalLink: {
                            linkUri: 'https://line.me',
                            label: 'LINE'
                        }
                    },
                }
            );
        case 'bye':
            switch (source.type) {
                case 'user':
                    return replyText(replyToken, 'Bot can\'t leave from 1:1 chat');
                case 'group':
                    return replyText(replyToken, 'Leaving group')
                        .then(() => client.leaveGroup(source.groupId));
                case 'room':
                    return replyText(replyToken, 'Leaving room')
                        .then(() => client.leaveRoom(source.roomId));
            }
        default:
            console.log(`Echo message to ${replyToken}: ${message.text}`);
            return replyText(replyToken, message.text);
    }
}

function handleImage(message, replyToken) {
    let getContent;
    if (message.contentProvider.type === "line") {
        const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.jpg`);
        const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

        getContent = downloadContent(message.id, downloadPath)
            .then((downloadPath) => {
                // ImageMagick is needed here to run 'convert'
                // Please consider about security and performance by yourself
                cp.execSync(`convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);

                return {
                    originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
                    previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
                };
            });
    } else if (message.contentProvider.type === "external") {
        getContent = Promise.resolve(message.contentProvider);
    }

    return getContent
        .then(({ originalContentUrl, previewImageUrl }) => {
            return client.replyMessage(
                replyToken,
                {
                    type: 'image',
                    originalContentUrl,
                    previewImageUrl,
                }
            );
        });
}

function handleVideo(message, replyToken) {
    let getContent;
    if (message.contentProvider.type === "line") {
        const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.mp4`);
        const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

        getContent = downloadContent(message.id, downloadPath)
            .then((downloadPath) => {
                // FFmpeg and ImageMagick is needed here to run 'convert'
                // Please consider about security and performance by yourself
                cp.execSync(`convert mp4:${downloadPath}[0] jpeg:${previewPath}`);

                return {
                    originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
                    previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
                }
            });
    } else if (message.contentProvider.type === "external") {
        getContent = Promise.resolve(message.contentProvider);
    }

    return getContent
        .then(({ originalContentUrl, previewImageUrl }) => {
            return client.replyMessage(
                replyToken,
                {
                    type: 'video',
                    originalContentUrl,
                    previewImageUrl,
                }
            );
        });
}

function handleAudio(message, replyToken) {
    let getContent;
    if (message.contentProvider.type === "line") {
        const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.m4a`);

        getContent = downloadContent(message.id, downloadPath)
            .then((downloadPath) => {
                return {
                    originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
                };
            });
    } else {
        getContent = Promise.resolve(message.contentProvider);
    }

    return getContent
        .then(({ originalContentUrl }) => {
            return client.replyMessage(
                replyToken,
                {
                    type: 'audio',
                    originalContentUrl,
                    duration: message.duration,
                }
            );
        });
}

function downloadContent(messageId, downloadPath) {
    return client.getMessageContent(messageId)
        .then((stream) => new Promise((resolve, reject) => {
            const writable = fs.createWriteStream(downloadPath);
            stream.pipe(writable);
            stream.on('end', () => resolve(downloadPath));
            stream.on('error', reject);
        }));
}

function handleLocation(message, replyToken) {
    return client.replyMessage(
        replyToken,
        {
            type: 'location',
            title: message.title,
            address: message.address,
            latitude: message.latitude,
            longitude: message.longitude,
        }
    );
}

function handleSticker(message, replyToken) {
    return client.replyMessage(
        replyToken,
        {
            type: 'sticker',
            packageId: message.packageId,
            stickerId: message.stickerId,
        }
    );
}

// listen on port
const port = process.env.PORT || 80;
app.listen(port, () => {
  //console.log(process.env.CHANNEL_ACCESS_TOKEN);
  //console.log(process.env.CHANNEL_SECRET);
  console.log(`listening on ${port}`);
});
