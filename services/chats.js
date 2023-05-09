const { CHAT_NOT_FOUND, MESSAGE_NOT_FOUND } = require('./constants');

exports.createChat = async function (targetUser_id, session, db) {
    const idUser = session.idUser;

    const chatExists = await db('Chat')
        .where({ fromUser_id: idUser, toUser_id: targetUser_id })
        .orWhere({ toUser_id: idUser, fromUser_id: targetUser_id })
        .first('idChat');

    if (chatExists) {
        return chatExists;
    }

    const created = await db('Chat')
        .insert({
            fromUser_id: idUser,
            toUser_id: targetUser_id,
        })
        .returning('idChat');

    return created[0];
};

exports.chatForUser = async function (idChat, session, db) {
    const chat = await db('Chat').where({ idChat }).first();

    if (
        !chat ||
        (chat.toUser_id !== session.idUser &&
            chat.fromUser_id !== session.idUser)
    ) {
        throw new Error(CHAT_NOT_FOUND);
    }

    return chat;
};

exports.createMessage = async function (idChat, content, session, db) {
    const chat = await exports.chatForUser(idChat, session, db);

    const created = await db('Message')
        .insert({
            chat_id: chat.idChat,
            user_id: session.idUser,
            content,
            sentAt: Date.now(),
        })
        .returning('*');

    return created[0];
};

exports.getMessages = async function (idChat, session, db, since = null) {
    const chat = await exports.chatForUser(idChat, session, db);

    const prom = db('Message').where({ chat_id: chat.idChat }).select();

    if (since && !isNaN(parseInt(since))) {
        prom.where((qb) =>
            qb.where('sentAt', '>', since).orWhere('deletedAt', '>', since),
        );
    } else {
        prom.whereNull('deletedAt');
    }

    console.log(prom.toString());

    return prom;
};

exports.deleteMessage = async function (idChat, idMessage, session, db) {
    const chat = await exports.chatForUser(idChat, session, db);
    const now = Date.now();

    const message = await db('Message')
        .where({ chat_id: chat.idChat, idMessage, user_id: session.idUser })
        .first('idMessage')
        .whereNull('deletedAt');

    if (!message) {
        throw new Error(MESSAGE_NOT_FOUND);
    }

    await db('Message').where({ idMessage }).update({ deletedAt: now });
};
