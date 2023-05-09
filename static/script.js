document.addEventListener('DOMContentLoaded', function () {
    const $ = (selector) => Array.from(document.querySelectorAll(selector));

    function h(tagName, attributes, children) {
        const element = document.createElement(tagName);

        // Set attributes
        Object.keys(attributes).forEach((key) => {
            element.setAttribute(key, attributes[key]);
        });

        // Append/set children
        if ('string' === typeof children) {
            element.innerText = children;
        } else if (Array.isArray(children)) {
            children.forEach((child) => !!child && element.appendChild(child));
        } else if (!!children) {
            element.appendChild(children);
        }

        return element;
    }

    function scrollDownChat() {
        const container = $('#chat-messages-container')[0];

        // container.scrollTop = container.offsetHeight;
        container.scrollTo(0, container.scrollHeight);
    }

    function getMeFromURLParams() {
        return new URLSearchParams(window.location.search).get('me');
    }

    const me = getMeFromURLParams() || 2;

    let session = null;

    async function load() {
        session = await GET('session');

        console.warn(session);

        const users = await GET('users');

        console.warn('users', users);

        for (const user of users) {
            createContact(user);
        }
    }

    let chatId = null;
    let lastFetch = null;
    let loadTimeout = null;
    const LOAD_TIMEOUT_TIMING = 1000;

    // Aufgabe 8
    async function backgroundLoadMessages() {
        if (chatId) {
            const messages = await GET(
                `chats/${chatId}/messages?since=${lastFetch}`,
            );

            lastFetch =
                messages.length > 0
                    ? Math.max(
                          messages[messages.length - 1].deletedAt ||
                              messages[messages.length - 1].sentAt,
                      )
                    : Date.now();

            for (const message of messages) {
                if (message.deletedAt) {
                    const container = document.getElementById(
                        `message-${message.idMessage}`,
                    );

                    if (container) {
                        container.remove();
                    }
                } else {
                    const exists = document.getElementById(
                        `message-${message.idMessage}`,
                    );

                    if (exists) {
                        continue;
                    }

                    const bubble = createChatBubble(
                        message.content,
                        message.user_id != session.idUser,
                        getTimestamp(new Date(parseInt(message.sentAt))),
                        message,
                    );
                    messagesContainer.appendChild(bubble);
                }
            }
        }

        loadTimeout = setTimeout(backgroundLoadMessages, LOAD_TIMEOUT_TIMING);
    }

    function clearMessages() {
        while (messagesContainer.lastChild) {
            messagesContainer.lastChild.remove();
        }
    }

    function createContact(user) {
        const userName = `${user.firstName} ${user.lastName}`;

        // Aufgabe 1
        const element = h('a', { class: 'panel-block' }, [
            h('span', { class: 'panel-icon' }, [
                h('i', { class: 'fas fa-face-laugh' }, []),
            ]),
            h('p', {}, userName),
        ]);

        element.addEventListener('click', async (event) => {
            // Aufgabe 2
            document.getElementById('chat-name').innerText = userName;

            // Aufgabe 3
            if (!user.idChat) {
                // Aufgabe 4
                const body = await POST('chats', {
                    targetUser_id: user.idUser,
                });
                user.idChat = body.idChat;
            }

            // Set global variable for access of chat ID outside
            chatId = user.idChat;

            // Aufgabe 5
            const messages = await GET(`chats/${user.idChat}/messages`);

            clearMessages();

            lastFetch =
                messages.length > 0
                    ? Math.max(
                          messages[messages.length - 1].deletedAt ||
                              messages[messages.length - 1].sentAt,
                      )
                    : Date.now();

            for (const message of messages) {
                const bubble = createChatBubble(
                    message.content,
                    message.user_id != session.idUser,
                    getTimestamp(new Date(parseInt(message.sentAt))),
                    message,
                );
                messagesContainer.appendChild(bubble);
            }

            setTimeout(backgroundLoadMessages, LOAD_TIMEOUT_TIMING);
        });

        // Aufgabe 1
        document.getElementById('contacts').appendChild(element);
    }

    function getTimestamp(date = null) {
        const timestamp = date || new Date();

        const hours = timestamp.getHours();
        const minutes = timestamp.getMinutes();

        const time = `${hours < 10 ? '0' + hours : hours}:${
            minutes < 10 ? '0' + minutes : minutes
        }`;

        return time;
    }

    async function postMessage(message) {
        return await POST(`chats/${chatId}/messages`, {
            content: message,
        });
    }

    function createChatBubble(text, wasReceived, time, message) {
        const deleteButton = h('button', {}, 'x');

        const wrapper = h(
            'div',
            {
                class: 'chat-message-wrapper',
                id: `message-${message.idMessage}`,
            },
            [
                // 1. Element
                wasReceived ? null : h('div', { class: 'chat-message-push' }),

                // 2. Element
                h(
                    'div',
                    {
                        class:
                            'chat-message p-3 ' +
                            (wasReceived ? 'received' : 'sent'),
                    },
                    [
                        h('div', { class: 'has-text-right is-size-7' }, [
                            h('time', {}, `${time} Uhr`),
                            wasReceived ? null : deleteButton,
                        ]),

                        h('div', { class: 'chat-message-content' }, text),
                    ],
                ),
            ],
        );

        deleteButton.addEventListener('click', async function () {
            // Aufgabe 7
            await DELETE(
                `chats/${message.chat_id}/messages/${message.idMessage}`,
            );
            wrapper.remove();
        });

        return wrapper;
    }

    const messagesContainer = $('#chat-messages-container')[0];

    const form = $('#form-wrap')[0];

    form.addEventListener('submit', async function (event) {
        event.stopPropagation();
        event.preventDefault();

        const input = $('#chat-input')[0];

        if (!input.value) return;

        const createdMessage = await postMessage(input.value);

        messagesContainer.appendChild(
            createChatBubble(
                createdMessage.content,
                false,
                getTimestamp(new Date(parseInt(createdMessage.sentAt))),
                createdMessage,
            ),
        );

        input.value = '';

        setTimeout(scrollDownChat, 250);
    });

    load();
});
