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

    async function load() {
        const response = await fetch('http://localhost:3000/api/messages');
        const body = await response.json();

        const messages = $('#chat-messages-container')[0];

        body.forEach((message) => {
            const bubble = createChatBubble(
                message.message,
                message.sender != me,
                message.time,
            );
            messages.appendChild(bubble);
        });

        scrollDownChat();
    }

    function getTimestamp() {
        const now = new Date();

        const hours = now.getHours();
        const minutes = now.getMinutes();

        const time = `${hours < 10 ? '0' + hours : hours}:${
            minutes < 10 ? '0' + minutes : minutes
        }`;

        return time;
    }

    async function postMessage(message, time) {
        const response = await fetch('http://localhost:3000/api/messages', {
            method: 'post',
            body: JSON.stringify({
                time,
                message,
                sender: me,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    function createChatBubble(text, wasReceived, time) {
        const deleteButton = h('button', {}, 'x');

        const wrapper = h('div', { class: 'chat-message-wrapper' }, [
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
                        deleteButton,
                    ]),

                    h('div', { class: 'chat-message-content' }, text),
                ],
            ),
        ]);

        deleteButton.addEventListener('click', function () {
            wrapper.remove();
        });

        return wrapper;
    }

    const messages = $('#chat-messages-container')[0];

    const form = $('#form-wrap')[0];

    form.addEventListener('submit', async function (event) {
        event.stopPropagation();
        event.preventDefault();

        const input = $('#chat-input')[0];
        const ts = getTimestamp();

        await postMessage(input.value, ts);

        messages.appendChild(createChatBubble(input.value, false, ts));

        input.value = '';

        setTimeout(scrollDownChat, 250);
    });

    load();
});
