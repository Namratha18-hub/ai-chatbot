package com.chatbot.chatbot;

import com.google.genai.Client;
import com.google.genai.errors.ClientException;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GeminiService {

    private final Client client;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    public GeminiService(
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;

        String apiKey = System.getenv("GEMINI_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "GEMINI_API_KEY environment variable is not set."
            );
        }

        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    @Transactional
    public synchronized String generateResponse(
            Long conversationId,
            String message
    ) {

        Conversation conversation =
                getConversation(conversationId);

        ChatMessage userMessage =
                new ChatMessage("user", message);

        conversation.addMessage(userMessage);

        conversationRepository.save(conversation);

        updateTitleIfNeeded(conversation, message);

        try {

            String prompt =
                    buildPrompt(conversation);

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-2.5-flash",
                            prompt,
                            null
                    );

            String answer = response.text();

            if (answer == null || answer.isBlank()) {
                answer =
                        "I received an empty response from Gemini.";
            }

            ChatMessage assistantMessage =
                    new ChatMessage(
                            "assistant",
                            answer
                    );

            conversation.addMessage(assistantMessage);

            conversationRepository.save(conversation);

            return answer;

        } catch (ClientException e) {

            chatMessageRepository.delete(userMessage);
            conversation.getMessages().remove(userMessage);

            throw convertGeminiException(e);
        }
    }

    @Transactional
    public synchronized String regenerateResponse(
            Long conversationId
    ) {

        Conversation conversation =
                getConversation(conversationId);

        List<ChatMessage> messages =
                chatMessageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversationId
                        );

        if (messages.isEmpty()) {

            throw new IllegalStateException(
                    "There is no conversation to regenerate."
            );
        }

        ChatMessage previousAssistant =
                messages.get(messages.size() - 1);

        if (!"assistant".equals(
                previousAssistant.getRole()
        )) {

            throw new IllegalStateException(
                    "There is no assistant response to regenerate."
            );
        }

        chatMessageRepository.delete(previousAssistant);

        conversation.getMessages()
                .remove(previousAssistant);

        try {

            String prompt =
                    buildPrompt(conversation);

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-2.5-flash",
                            prompt,
                            null
                    );

            String answer = response.text();

            if (answer == null || answer.isBlank()) {
                answer =
                        "I received an empty response from Gemini.";
            }

            ChatMessage assistantMessage =
                    new ChatMessage(
                            "assistant",
                            answer
                    );

            conversation.addMessage(assistantMessage);

            conversationRepository.save(conversation);

            return answer;

        } catch (ClientException e) {

            conversation.addMessage(previousAssistant);

            conversationRepository.save(conversation);

            throw convertGeminiException(e);
        }
    }

    @Transactional
    public synchronized String editLastMessage(
            Long conversationId,
            String newMessage
    ) {

        Conversation conversation =
                getConversation(conversationId);

        List<ChatMessage> messages =
                chatMessageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversationId
                        );

        if (messages.isEmpty()) {

            throw new IllegalStateException(
                    "There is no message to edit."
            );
        }

        ChatMessage previousAssistant =
                messages.get(messages.size() - 1);

        if (!"assistant".equals(
                previousAssistant.getRole()
        )) {

            throw new IllegalStateException(
                    "There is no assistant response to edit."
            );
        }

        if (messages.size() < 2) {

            throw new IllegalStateException(
                    "There is no user message to edit."
            );
        }

        ChatMessage previousUser =
                messages.get(messages.size() - 2);

        if (!"user".equals(
                previousUser.getRole()
        )) {

            throw new IllegalStateException(
                    "There is no user message to edit."
            );
        }

        chatMessageRepository.delete(previousAssistant);
        chatMessageRepository.delete(previousUser);

        conversation.getMessages()
                .remove(previousAssistant);

        conversation.getMessages()
                .remove(previousUser);

        ChatMessage editedUserMessage =
                new ChatMessage(
                        "user",
                        newMessage
                );

        conversation.addMessage(
                editedUserMessage
        );

        conversationRepository.save(conversation);

        try {

            String prompt =
                    buildPrompt(conversation);

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-2.5-flash",
                            prompt,
                            null
                    );

            String answer = response.text();

            if (answer == null || answer.isBlank()) {
                answer =
                        "I received an empty response from Gemini.";
            }

            ChatMessage assistantMessage =
                    new ChatMessage(
                            "assistant",
                            answer
                    );

            conversation.addMessage(
                    assistantMessage
            );

            conversationRepository.save(conversation);

            updateTitleIfNeeded(
                    conversation,
                    newMessage
            );

            return answer;

        } catch (ClientException e) {

            chatMessageRepository.delete(
                    editedUserMessage
            );

            conversation.getMessages()
                    .remove(editedUserMessage);

            conversation.addMessage(
                    previousUser
            );

            conversation.addMessage(
                    previousAssistant
            );

            conversationRepository.save(conversation);

            throw convertGeminiException(e);
        }
    }

    @Transactional
    public synchronized void clearConversation(
            Long conversationId
    ) {

        Conversation conversation =
                getConversation(conversationId);

        List<ChatMessage> messages =
                chatMessageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversationId
                        );

        for (ChatMessage message : messages) {
            chatMessageRepository.delete(message);
        }

        conversation.getMessages().clear();

        conversation.setTitle("New Chat");

        conversationRepository.save(conversation);
    }

    private Conversation getConversation(
            Long conversationId
    ) {

        if (conversationId == null) {

            throw new IllegalArgumentException(
                    "Conversation ID is required."
            );
        }

        return conversationRepository
                .findById(conversationId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Conversation not found."
                        )
                );
    }

    private String buildPrompt(
            Conversation conversation
    ) {

        StringBuilder prompt =
                new StringBuilder();

        prompt.append("""
                You are a helpful, professional, general-purpose AI assistant.

                Use the conversation history below to understand follow-up questions.

                Answer the user's latest question directly and clearly.

                Do not mention the internal conversation history unless the user asks about it.

                When the user asks for code, provide complete and correct code when appropriate.

                Conversation history:
                """);

        List<ChatMessage> messages =
                chatMessageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversation.getId()
                        );

        for (ChatMessage message : messages) {

            if ("user".equals(
                    message.getRole()
            )) {

                prompt.append("\nUser: ")
                        .append(message.getContent());

            } else if ("assistant".equals(
                    message.getRole()
            )) {

                prompt.append("\nAssistant: ")
                        .append(message.getContent());
            }
        }

        prompt.append("\n\nAssistant:");

        return prompt.toString();
    }

    private void updateTitleIfNeeded(
            Conversation conversation,
            String message
    ) {

        if (
                conversation.getTitle() == null
                        || conversation.getTitle()
                        .equals("New Chat")
        ) {

            String title = buildConversationTitle(message);

            if (title != null && !title.isBlank()) {
                conversation.setTitle(title);
                conversationRepository.save(
                        conversation
                );
            }
        }
    }

    /*
     * Builds a short, readable sidebar title from the
     * first user message: collapses whitespace/newlines,
     * then truncates on a word boundary (instead of cutting
     * mid-word) and appends an ellipsis when shortened.
     */
    private String buildConversationTitle(
            String message
    ) {

        if (message == null) {
            return null;
        }

        String cleaned =
                message.trim()
                        .replaceAll("\\s+", " ");

        if (cleaned.isBlank()) {
            return null;
        }

        final int maxLength = 40;

        if (cleaned.length() <= maxLength) {
            return cleaned;
        }

        String truncated =
                cleaned.substring(0, maxLength);

        int lastSpace =
                truncated.lastIndexOf(' ');

        if (lastSpace >= 15) {
            truncated =
                    truncated.substring(0, lastSpace);
        }

        return truncated.trim() + "…";
    }

    private RuntimeException convertGeminiException(
            ClientException e
    ) {

        String errorMessage =
                e.getMessage();

        if (errorMessage == null) {

            return new GeminiApiException(
                    "The Gemini API could not process the request. Please try again later."
            );
        }

        String lower =
                errorMessage.toLowerCase();

        if (
                errorMessage.contains("429")
                        || lower.contains(
                        "quota exceeded"
                )
                        || lower.contains(
                        "rate limit"
                )
        ) {

            return new GeminiQuotaException(
                    "Gemini API quota has been reached. Please try again later."
            );
        }

        if (
                errorMessage.contains("401")
                        || errorMessage.contains("403")
                        || lower.contains("api key")
                        || lower.contains(
                        "authentication"
                )
        ) {

            return new GeminiAuthenticationException(
                    "There is a problem with the Gemini API key or its permissions."
            );
        }

        return new GeminiApiException(
                "The Gemini API could not process the request. Please try again later."
        );
    }
}