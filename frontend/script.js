const API_URL =
    "http://localhost:8080/api/chat";

const REGENERATE_API_URL =
    "http://localhost:8080/api/chat/regenerate";

const EDIT_API_URL =
    "http://localhost:8080/api/chat/edit";

const CLEAR_API_URL =
    "http://localhost:8080/api/chat/clear";

const CONVERSATIONS_API_URL =
    "http://localhost:8080/api/conversations";


const messagesContainer =
    document.getElementById("messages");

const input =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const newChatButton =
    document.getElementById("newChatButton");

const chatHistory =
    document.getElementById("chatHistory");

const themeToggle =
    document.getElementById("themeToggle");

const clearChatButton =
    document.getElementById("clearChatButton");

const clearConfirmModal =
    document.getElementById("clearConfirmModal");

const clearConfirmCancelBtn =
    document.getElementById("clearConfirmCancel");

const clearConfirmClearBtn =
    document.getElementById("clearConfirmClear");

const deleteConversationModal =
    document.getElementById("deleteConversationModal");

const deleteConversationCancelBtn =
    document.getElementById("deleteConversationCancel");

const deleteConversationConfirmBtn =
    document.getElementById("deleteConversationConfirm");


let currentConversationId =
    null;

let isWaitingForResponse =
    false;

let isEditingMessage =
    false;


// ======================================================
// STARTUP
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        loadTheme();

        if (!messagesContainer) {

            console.error(
                "ERROR: #messages element was not found."
            );

            return;
        }

        await loadConversations();

        if (
            currentConversationId === null
        ) {

            await createNewConversation();
        }

        updateSendButtonState();

        updateInputPlaceholder();
    }
);


// ======================================================
// THEME
// ======================================================

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "ai_chatbot_theme"
        );

    if (
        savedTheme === "dark"
        && document.body
    ) {

        document.body.classList.add(
            "dark"
        );
    }
}


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );

            const isDark =
                document.body.classList.contains(
                    "dark"
                );

            localStorage.setItem(
                "ai_chatbot_theme",
                isDark
                    ? "dark"
                    : "light"
            );
        }
    );
}


// ======================================================
// LOAD CONVERSATIONS
// ======================================================

async function loadConversations() {

    try {

        const response =
            await fetch(
                CONVERSATIONS_API_URL
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load conversations."
            );
        }

        const conversations =
            await response.json();

        renderConversationList(
            conversations
        );

        if (
            conversations.length === 0
        ) {

            currentConversationId =
                null;

            return;
        }


        const savedId =
            localStorage.getItem(
                "currentConversationId"
            );


        let selectedConversation =
            conversations.find(
                conversation =>
                    String(
                        conversation.id
                    ) ===
                    String(savedId)
            );


        if (!selectedConversation) {

            selectedConversation =
                conversations[0];
        }


        await selectConversation(
            selectedConversation.id
        );

    } catch (error) {

        console.error(
            "Error loading conversations:",
            error
        );
    }
}


// ======================================================
// RENDER SIDEBAR CONVERSATIONS
// ======================================================

function renderConversationList(
    conversations
) {

    if (!chatHistory) {
        return;
    }

    chatHistory.innerHTML = "";


    conversations.forEach(
        conversation => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "history-item";


            item.dataset.id =
                conversation.id;


            item.title =
                conversation.title ||
                "New Chat";


            const titleSpan =
                document.createElement(
                    "span"
                );


            titleSpan.className =
                "history-item-title";


            titleSpan.textContent =
                conversation.title ||
                "New Chat";


            const deleteBtn =
                document.createElement(
                    "button"
                );


            deleteBtn.type =
                "button";


            deleteBtn.className =
                "history-delete-btn";


            deleteBtn.setAttribute(
                "aria-label",
                "Delete conversation"
            );


            deleteBtn.title =
                "Delete conversation";


            deleteBtn.textContent =
                "🗑";


            deleteBtn.addEventListener(
                "click",
                async (event) => {

                    event.stopPropagation();

                    await deleteConversationById(
                        conversation.id
                    );
                }
            );


            item.appendChild(
                titleSpan
            );

            item.appendChild(
                deleteBtn
            );


            if (
                String(
                    conversation.id
                ) ===
                String(
                    currentConversationId
                )
            ) {

                item.classList.add(
                    "active"
                );
            }


            item.addEventListener(
                "click",
                async () => {

                    await selectConversation(
                        conversation.id
                    );
                }
            );


            chatHistory.appendChild(
                item
            );
        }
    );
}


// ======================================================
// CREATE NEW CHAT
// ======================================================

async function createNewConversation() {

    if (isWaitingForResponse) {
        return;
    }


    try {

        const response =
            await fetch(
                CONVERSATIONS_API_URL,
                {
                    method:
                        "POST"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to create conversation."
            );
        }


        const conversation =
            await response.json();


        currentConversationId =
            Number(
                conversation.id
            );


        localStorage.setItem(
            "currentConversationId",
            String(
                currentConversationId
            )
        );


        isEditingMessage =
            false;


        clearMessagesFromScreen();

        renderEmptyState();

        await refreshConversationList();

        highlightCurrentConversation();

        updateInputPlaceholder();


        if (input) {

            input.value = "";

            autoResizeInput();

            input.focus();
        }

    } catch (error) {

        console.error(
            "Error creating conversation:",
            error
        );
    }
}


// ======================================================
// NEW CHAT BUTTON
// ======================================================

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        async () => {

            await createNewConversation();
        }
    );
}


// ======================================================
// SELECT CONVERSATION
// ======================================================

async function selectConversation(
    conversationId
) {

    if (isWaitingForResponse) {
        return;
    }


    currentConversationId =
        Number(
            conversationId
        );


    localStorage.setItem(
        "currentConversationId",
        String(
            currentConversationId
        )
    );


    isEditingMessage =
        false;


    updateInputPlaceholder();

    highlightCurrentConversation();


    await loadConversationMessages(
        currentConversationId
    );
}


// ======================================================
// HIGHLIGHT CURRENT CONVERSATION
// ======================================================

function highlightCurrentConversation() {

    if (!chatHistory) {
        return;
    }


    const items =
        chatHistory.querySelectorAll(
            ".history-item"
        );


    items.forEach(
        item => {

            item.classList.toggle(
                "active",
                String(
                    item.dataset.id
                ) ===
                String(
                    currentConversationId
                )
            );
        }
    );
}


// ======================================================
// LOAD MESSAGES
// ======================================================

async function loadConversationMessages(
    conversationId
) {

    if (!messagesContainer) {
        return;
    }


    try {

        const response =
            await fetch(
                `${CONVERSATIONS_API_URL}/${conversationId}/messages`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load messages."
            );
        }


        const messages =
            await response.json();


        clearMessagesFromScreen();


        if (
            !Array.isArray(messages)
            || messages.length === 0
        ) {

            renderEmptyState();

            return;
        }


        messages.forEach(
            message => {

                addMessage(
                    message.content,
                    message.role,
                    true
                );
            }
        );


        scrollToBottom();

    } catch (error) {

        console.error(
            "Error loading messages:",
            error
        );


        clearMessagesFromScreen();


        const errorMessage =
            document.createElement(
                "div"
            );


        errorMessage.className =
            "empty-state";


        errorMessage.innerHTML = `
            <h2>
                Unable to load conversation
            </h2>

            <p>
                Please check that the backend is running.
            </p>
        `;


        messagesContainer.appendChild(
            errorMessage
        );
    }
}


// ======================================================
// EMPTY / WELCOME STATE
// ======================================================

function renderEmptyState() {

    if (!messagesContainer) {
        return;
    }


    removeEmptyState();


    const emptyState =
        document.createElement(
            "div"
        );


    emptyState.className =
        "welcome-screen";


    emptyState.innerHTML = `
        <div class="welcome-icon">
            AI
        </div>

        <h2>
            How can I help you?
        </h2>

        <p>
            Ask a question, solve a problem,
            write something, explain a topic,
            or just have a conversation.
        </p>
    `;


    messagesContainer.appendChild(
        emptyState
    );
}


// ======================================================
// REMOVE EMPTY STATE
// ======================================================

function removeEmptyState() {

    if (!messagesContainer) {
        return;
    }


    const emptyState =
        messagesContainer.querySelector(
            ".welcome-screen, .empty-state"
        );


    if (emptyState) {

        emptyState.remove();
    }
}


// ======================================================
// CLEAR SCREEN
// ======================================================

function clearMessagesFromScreen() {

    if (!messagesContainer) {
        return;
    }


    messagesContainer.innerHTML =
        "";
}


// ======================================================
// CLEAR CONVERSATION CONFIRM MODAL
// ======================================================

function openClearConfirmModal() {

    return new Promise((resolve) => {

        if (
            !clearConfirmModal ||
            !clearConfirmCancelBtn ||
            !clearConfirmClearBtn
        ) {

            resolve(
                window.confirm(
                    "Are you sure you want to clear this conversation?"
                )
            );

            return;
        }


        function cleanup(result) {

            clearConfirmModal.hidden =
                true;

            clearConfirmCancelBtn.removeEventListener(
                "click",
                onCancel
            );

            clearConfirmClearBtn.removeEventListener(
                "click",
                onClear
            );

            clearConfirmModal.removeEventListener(
                "click",
                onOverlayClick
            );

            document.removeEventListener(
                "keydown",
                onKeydown
            );

            resolve(result);
        }


        function onCancel() {

            cleanup(false);
        }


        function onClear() {

            cleanup(true);
        }


        function onOverlayClick(event) {

            if (event.target === clearConfirmModal) {

                cleanup(false);
            }
        }


        function onKeydown(event) {

            if (event.key === "Escape") {

                cleanup(false);
            }
        }


        clearConfirmCancelBtn.addEventListener(
            "click",
            onCancel
        );

        clearConfirmClearBtn.addEventListener(
            "click",
            onClear
        );

        clearConfirmModal.addEventListener(
            "click",
            onOverlayClick
        );

        document.addEventListener(
            "keydown",
            onKeydown
        );

        clearConfirmModal.hidden =
            false;

        clearConfirmClearBtn.focus();
    });
}


// ======================================================
// DELETE CONVERSATION CONFIRM MODAL
// ======================================================

function openDeleteConfirmModal() {

    return new Promise((resolve) => {

        if (
            !deleteConversationModal ||
            !deleteConversationCancelBtn ||
            !deleteConversationConfirmBtn
        ) {

            resolve(
                window.confirm(
                    "Are you sure you want to delete this conversation?"
                )
            );

            return;
        }


        function cleanup(result) {

            deleteConversationModal.hidden =
                true;

            deleteConversationCancelBtn.removeEventListener(
                "click",
                onCancel
            );

            deleteConversationConfirmBtn.removeEventListener(
                "click",
                onConfirm
            );

            deleteConversationModal.removeEventListener(
                "click",
                onOverlayClick
            );

            document.removeEventListener(
                "keydown",
                onKeydown
            );

            resolve(result);
        }


        function onCancel() {

            cleanup(false);
        }


        function onConfirm() {

            cleanup(true);
        }


        function onOverlayClick(event) {

            if (event.target === deleteConversationModal) {

                cleanup(false);
            }
        }


        function onKeydown(event) {

            if (event.key === "Escape") {

                cleanup(false);
            }
        }


        deleteConversationCancelBtn.addEventListener(
            "click",
            onCancel
        );

        deleteConversationConfirmBtn.addEventListener(
            "click",
            onConfirm
        );

        deleteConversationModal.addEventListener(
            "click",
            onOverlayClick
        );

        document.addEventListener(
            "keydown",
            onKeydown
        );

        deleteConversationModal.hidden =
            false;

        deleteConversationConfirmBtn.focus();
    });
}


// ======================================================
// DELETE A SINGLE CONVERSATION
// ======================================================

async function deleteConversationById(
    conversationId
) {

    const confirmed =
        await openDeleteConfirmModal();


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `${CONVERSATIONS_API_URL}/${encodeURIComponent(conversationId)}`,
                {
                    method:
                        "DELETE"
                }
            );


        const responseText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                responseText ||
                "Failed to delete conversation."
            );
        }


        const wasCurrent =
            String(conversationId) ===
            String(currentConversationId);


        if (wasCurrent) {

            currentConversationId =
                null;

            localStorage.removeItem(
                "currentConversationId"
            );

            isEditingMessage =
                false;

            clearMessagesFromScreen();

            renderEmptyState();

            updateInputPlaceholder();
        }


        await loadConversations();


        if (
            currentConversationId === null
        ) {

            await createNewConversation();
        }

    } catch (error) {

        console.error(
            "Delete conversation error:",
            error
        );


        alert(
            "Unable to delete the conversation. Please try again."
        );
    }
}


// ======================================================
// CLEAR CURRENT CONVERSATION
// ======================================================

if (clearChatButton) {

    clearChatButton.addEventListener(
        "click",
        async () => {

            await clearCurrentConversation();
        }
    );
}


async function clearCurrentConversation() {

    if (isWaitingForResponse) {

        return;
    }


    if (
        currentConversationId === null
    ) {

        return;
    }


    const confirmed =
        await openClearConfirmModal();


    if (!confirmed) {

        return;
    }


    try {

        clearChatButton.disabled =
            true;


        const response =
            await fetch(
                `${CLEAR_API_URL}?conversationId=${encodeURIComponent(currentConversationId)}`,
                {
                    method:
                        "POST"
                }
            );


        const responseText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                responseText ||
                "Failed to clear conversation."
            );
        }


        isEditingMessage =
            false;


        if (input) {

            input.value = "";

            autoResizeInput();
        }


        updateInputPlaceholder();


        clearMessagesFromScreen();

        renderEmptyState();


        await refreshConversationList();

        highlightCurrentConversation();


        if (input) {

            input.focus();
        }


    } catch (error) {

        console.error(
            "Clear conversation error:",
            error
        );


        alert(
            "Unable to clear the conversation. Please try again."
        );

    } finally {

        clearChatButton.disabled =
            false;
    }
}


// ======================================================
// SEND MESSAGE
// ======================================================

async function sendMessage() {

    if (isWaitingForResponse) {
        return;
    }


    if (!input) {
        return;
    }


    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    if (currentConversationId === null) {

        await createNewConversation();


        if (
            currentConversationId === null
        ) {

            return;
        }
    }


    /*
       If the user clicked Edit,
       send through the edit endpoint
       instead of creating a new message.
    */

    if (isEditingMessage) {

        await submitEditedMessage(
            message
        );

        return;
    }


    removeEmptyState();


    addMessage(
        message,
        "user",
        true
    );


    input.value = "";

    autoResizeInput();


    showTypingIndicator();


    isWaitingForResponse =
        true;


    updateSendButtonState();


    try {

        const response =
            await fetch(
                `${API_URL}?conversationId=${encodeURIComponent(currentConversationId)}`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message:
                                message
                        })
                }
            );


        const responseText =
            await response.text();


        removeTypingIndicator();


        if (!response.ok) {

            addMessage(
                responseText ||
                "Something went wrong.",
                "assistant",
                false
            );

            return;
        }


        addMessage(
            responseText,
            "assistant",
            true
        );


        await refreshConversationList();

        highlightCurrentConversation();

    } catch (error) {

        removeTypingIndicator();


        addMessage(
            "Unable to connect to the backend. Make sure the Spring Boot server is running.",
            "assistant",
            false
        );


        console.error(
            "Send message error:",
            error
        );

    } finally {

        isWaitingForResponse =
            false;


        updateSendButtonState();


        if (input) {
            input.focus();
        }
    }
}


// ======================================================
// SEND BUTTON
// ======================================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );
}


// ======================================================
// TEXTAREA
// ======================================================

if (input) {

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
                && !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }
        }
    );


    input.addEventListener(
        "input",
        autoResizeInput
    );
}


// ======================================================
// AUTO RESIZE INPUT
// ======================================================

function autoResizeInput() {

    if (!input) {
        return;
    }


    input.style.height =
        "auto";


    input.style.height =
        Math.min(
            input.scrollHeight,
            180
        ) + "px";
}


// ======================================================
// INPUT PLACEHOLDER
// ======================================================

function updateInputPlaceholder() {

    if (!input) {
        return;
    }


    if (isEditingMessage) {

        input.placeholder =
            "Edit your message...";

    } else {

        input.placeholder =
            "Message AI Assistant...";
    }
}


// ======================================================
// ADD MESSAGE
// ======================================================

function addMessage(
    text,
    role,
    showActions = true
) {

    if (!messagesContainer) {
        return null;
    }


    removeEmptyState();


    const row =
        document.createElement(
            "div"
        );


    row.className =
        `message-row ${role}`;


    const group =
        document.createElement(
            "div"
        );


    group.className =
        "message-group";


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "message";


    if (role === "assistant") {

        bubble.innerHTML =
            renderMarkdown(
                text
            );

    } else {

        bubble.textContent =
            text;
    }


    group.appendChild(
        bubble
    );


    if (showActions) {

        const actions =
            createMessageActions(
                text,
                role
            );


        group.appendChild(
            actions
        );
    }


    row.appendChild(
        group
    );


    messagesContainer.appendChild(
        row
    );


    if (
        role === "assistant"
    ) {

        highlightCodeBlocks(
            bubble
        );
    }


    scrollToBottom();


    return row;
}


// ======================================================
// MARKDOWN
// ======================================================

function renderMarkdown(text) {

    if (
        typeof marked !== "undefined"
        &&
        typeof marked.parse ===
        "function"
    ) {

        return marked.parse(
            String(text)
        );
    }


    return escapeHtml(
        String(text)
    );
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}


// ======================================================
// CODE HIGHLIGHTING
// ======================================================

function highlightCodeBlocks(
    container
) {

    if (!container) {
        return;
    }


    const blocks =
        container.querySelectorAll(
            "pre code"
        );


    blocks.forEach(
        block => {

            if (
                window.hljs
                &&
                typeof
                window.hljs.highlightElement ===
                "function"
            ) {

                window.hljs.highlightElement(
                    block
                );
            }
        }
    );
}


// ======================================================
// MESSAGE ACTIONS
// ======================================================

function createMessageActions(
    text,
    role
) {

    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "message-actions";


    const copyButton =
        document.createElement(
            "button"
        );


    copyButton.type =
        "button";


    copyButton.className =
        "message-action";


    copyButton.textContent =
        "⧉";


    copyButton.title =
        "Copy";


    copyButton.setAttribute(
        "aria-label",
        "Copy"
    );


    copyButton.addEventListener(
        "click",
        async () => {

            await copyText(
                text,
                copyButton
            );
        }
    );


    actions.appendChild(
        copyButton
    );


    if (
        role === "user"
    ) {

        const editButton =
            document.createElement(
                "button"
            );


        editButton.type =
            "button";


        editButton.className =
            "message-action";


        editButton.textContent =
            "✎";


        editButton.title =
            "Edit";


        editButton.setAttribute(
            "aria-label",
            "Edit"
        );


        editButton.addEventListener(
            "click",
            () => {

                editLastUserMessage(
                    text
                );
            }
        );


        actions.appendChild(
            editButton
        );

    } else {

        const regenerateButton =
            document.createElement(
                "button"
            );


        regenerateButton.type =
            "button";


        regenerateButton.className =
            "message-action";


        regenerateButton.textContent =
            "↻";


        regenerateButton.title =
            "Regenerate";


        regenerateButton.setAttribute(
            "aria-label",
            "Regenerate"
        );


        regenerateButton.addEventListener(
            "click",
            regenerateResponse
        );


        actions.appendChild(
            regenerateButton
        );
    }


    return actions;
}


// ======================================================
// COPY
// ======================================================

async function copyText(
    text,
    button
) {

    try {

        await navigator.clipboard.writeText(
            text
        );


        const oldText =
            button.textContent;


        const oldTitle =
            button.title;


        button.textContent =
            "✓";


        button.title =
            "Copied";


        button.classList.add(
            "copied"
        );


        setTimeout(
            () => {

                button.textContent =
                    oldText;


                button.title =
                    oldTitle;


                button.classList.remove(
                    "copied"
                );

            },
            1200
        );

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );
    }
}


// ======================================================
// EDIT MESSAGE
// ======================================================

function editLastUserMessage(
    text
) {

    if (
        isWaitingForResponse
        ||
        !input
    ) {

        return;
    }


    isEditingMessage =
        true;


    input.value =
        text;


    autoResizeInput();

    updateInputPlaceholder();


    input.focus();


    input.setSelectionRange(
        input.value.length,
        input.value.length
    );
}


// ======================================================
// SUBMIT EDITED MESSAGE
// ======================================================

async function submitEditedMessage(
    message
) {

    if (
        !message
        ||
        isWaitingForResponse
        ||
        currentConversationId === null
    ) {

        return;
    }


    isEditingMessage =
        false;


    updateInputPlaceholder();


    input.value =
        "";


    autoResizeInput();


    removeLastUserAndAssistantMessages();


    addMessage(
        message,
        "user",
        true
    );


    showTypingIndicator();


    isWaitingForResponse =
        true;


    updateSendButtonState();


    try {

        const response =
            await fetch(
                `${EDIT_API_URL}?conversationId=${encodeURIComponent(currentConversationId)}`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message:
                                message
                        })
                }
            );


        const responseText =
            await response.text();


        removeTypingIndicator();


        if (!response.ok) {

            await loadConversationMessages(
                currentConversationId
            );

            return;
        }


        addMessage(
            responseText,
            "assistant",
            true
        );


        await refreshConversationList();

        highlightCurrentConversation();

    } catch (error) {

        removeTypingIndicator();


        await loadConversationMessages(
            currentConversationId
        );


        console.error(
            "Edit error:",
            error
        );

    } finally {

        isWaitingForResponse =
            false;


        updateSendButtonState();


        if (input) {
            input.focus();
        }
    }
}


// ======================================================
// REMOVE LAST USER + ASSISTANT
// ======================================================

function removeLastUserAndAssistantMessages() {

    if (!messagesContainer) {
        return;
    }


    const assistantRows =
        messagesContainer.querySelectorAll(
            ".message-row.assistant"
        );


    const userRows =
        messagesContainer.querySelectorAll(
            ".message-row.user"
        );


    if (
        assistantRows.length > 0
    ) {

        assistantRows[
            assistantRows.length - 1
        ].remove();
    }


    if (
        userRows.length > 0
    ) {

        userRows[
            userRows.length - 1
        ].remove();
    }
}


// ======================================================
// REGENERATE
// ======================================================

async function regenerateResponse() {

    if (
        isWaitingForResponse
        ||
        currentConversationId === null
    ) {

        return;
    }


    removeLastAssistantMessage();


    showTypingIndicator();


    isWaitingForResponse =
        true;


    updateSendButtonState();


    try {

        const response =
            await fetch(
                `${REGENERATE_API_URL}?conversationId=${encodeURIComponent(currentConversationId)}`,
                {
                    method:
                        "POST"
                }
            );


        const responseText =
            await response.text();


        removeTypingIndicator();


        if (!response.ok) {

            await loadConversationMessages(
                currentConversationId
            );

            return;
        }


        addMessage(
            responseText,
            "assistant",
            true
        );

    } catch (error) {

        removeTypingIndicator();


        await loadConversationMessages(
            currentConversationId
        );


        console.error(
            "Regenerate error:",
            error
        );

    } finally {

        isWaitingForResponse =
            false;


        updateSendButtonState();
    }
}


// ======================================================
// REMOVE LAST ASSISTANT MESSAGE
// ======================================================

function removeLastAssistantMessage() {

    if (!messagesContainer) {
        return;
    }


    const rows =
        messagesContainer.querySelectorAll(
            ".message-row.assistant"
        );


    if (
        rows.length === 0
    ) {

        return;
    }


    rows[
        rows.length - 1
    ].remove();
}


// ======================================================
// TYPING INDICATOR
// ======================================================

function showTypingIndicator() {

    if (!messagesContainer) {
        return;
    }


    removeTypingIndicator();


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "message-row assistant";


    row.id =
        "typingIndicator";


    const group =
        document.createElement(
            "div"
        );


    group.className =
        "message-group";


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "message typing-message";


    bubble.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    `;


    group.appendChild(
        bubble
    );


    row.appendChild(
        group
    );


    messagesContainer.appendChild(
        row
    );


    scrollToBottom();
}


// ======================================================
// REMOVE TYPING INDICATOR
// ======================================================

function removeTypingIndicator() {

    if (!messagesContainer) {
        return;
    }


    const indicator =
        messagesContainer.querySelector(
            "#typingIndicator"
        );


    if (indicator) {

        indicator.remove();
    }
}


// ======================================================
// SEND BUTTON STATE
// ======================================================

function updateSendButtonState() {

    if (!sendButton) {
        return;
    }


    sendButton.disabled =
        isWaitingForResponse;
}


// ======================================================
// SCROLL
// ======================================================

function scrollToBottom() {

    if (!messagesContainer) {
        return;
    }


    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}


// ======================================================
// REFRESH CONVERSATION LIST
// ======================================================

async function refreshConversationList() {

    try {

        const response =
            await fetch(
                CONVERSATIONS_API_URL
            );


        if (!response.ok) {
            return;
        }


        const conversations =
            await response.json();


        renderConversationList(
            conversations
        );


        highlightCurrentConversation();

    } catch (error) {

        console.error(
            "Unable to refresh conversations:",
            error
        );
    }
}