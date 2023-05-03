const express = require('express');

const app = express();

app.use(express.json());
app.use(express.static('static'));

const messages = [
    { sender: 1, message: 'Hallo!', time: '11:18' },
    { sender: 2, message: 'Moin!', time: '11:19' },
    { sender: 1, message: 'Toller Chat hier', time: '11:20' },
    { sender: 2, message: 'Ja wirklich!', time: '11:22' },
    { sender: 2, message: 'Pls respond', time: '11:28' },
];

app.get('/api/messages', async function (req, res) {
    res.json(messages);
});

app.post('/api/messages', async function (req, res) {
    messages.push(req.body);
    res.json({ ok: true });
});

app.get('/api/', async function (req, res) {
    res.send({ a: 1 });
});

app.post('/api/write', async function (req, res) {
    console.log(req.body);
    res.send({ ok: true });
});

app.listen(3000, function () {
    console.log('App started on port 3000');
});
