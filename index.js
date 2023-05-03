const express = require('express');

const app = express();

app.use(express.json());
app.use(express.static('static'));

const messages = [
    { sender: 1, message: 'Hallo!', time: '11:18', ts: 1683110779177 },
    { sender: 2, message: 'Moin!', time: '11:19', ts: 1683110779178 },
    { sender: 1, message: 'Toller Chat hier', time: '11:20', ts: 1683110779179 },
    { sender: 2, message: 'Ja wirklich!', time: '11:22', ts: 1683110779180 },
    { sender: 2, message: 'Pls respond', time: '11:28', ts: 1683110779181 },
];

app.get('/api/messages', async function (req, res) {
    let output = messages;

    if (req.query.since) {
        output = output.filter(m => m.ts >= parseInt(req.query.since));
    }

    res.json(output);
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
