const service = require('../services/chats');
const { CHAT_NOT_FOUND, MESSAGE_NOT_FOUND } = require('../services/constants');

module.exports = async function (router) {
    router.post('/api/chats', async function (req, res) {
        try {
            const result = await service.createChat(
                req.body.targetUser_id,
                req.session,
                req.app.get('db'),
            );

            res.json(result);
        } catch (e) {
            if (e.message === CHAT_NOT_FOUND) {
                return res.status(404).json({ error: CHAT_NOT_FOUND });
            } else {
                console.log(e);
                return res.status(500).json({ error: 'Unknown' });
            }
        }
    });

    router.get('/api/chats/:id/messages', async function (req, res) {
        try {
            const messages = await service.getMessages(
                req.params.id,
                req.session,
                req.app.get('db'),
                req.query.since,
            );

            res.json(messages);
        } catch (e) {
            if (e.message === CHAT_NOT_FOUND) {
                return res.status(404).json({ error: CHAT_NOT_FOUND });
            } else {
                console.log(e);
                return res.status(500).json({ error: 'Unknown' });
            }
        }
    });

    router.post('/api/chats/:id/messages', async function (req, res) {
        try {
            const result = await service.createMessage(
                req.params.id,
                req.body.content,
                req.session,
                req.app.get('db'),
            );
            res.json(result);
        } catch (e) {
            if (e.message === CHAT_NOT_FOUND) {
                return res.status(404).json({ error: CHAT_NOT_FOUND });
            } else {
                console.log(e);
                return res.status(500).json({ error: 'Unknown', e });
            }
        }
    });

    router.delete(
        '/api/chats/:id/messages/:idMessage',
        async function (req, res) {
            try {
                await service.deleteMessage(
                    req.params.id,
                    req.params.idMessage,
                    req.session,
                    req.app.get('db'),
                );

                res.json({ ok: true });
            } catch (e) {
                if (e.message === MESSAGE_NOT_FOUND) {
                    return res.status(404).json({ error: MESSAGE_NOT_FOUND });
                } else {
                    console.log(e);
                    return res.status(500).json({ error: 'Unknown' });
                }
            }
        },
    );
};
