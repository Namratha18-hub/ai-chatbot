package com.chatbot.chatbot;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    public ConversationService(
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    /*
     * =====================================================
     * GET ALL CONVERSATIONS
     * =====================================================
     */

    @Transactional(readOnly = true)
    public List<Conversation> getAllConversations() {

        return conversationRepository.findAll();
    }

    /*
     * =====================================================
     * CREATE NEW CONVERSATION
     * =====================================================
     */

    public Conversation createConversation() {

        Conversation conversation =
                new Conversation("New Chat");

        return conversationRepository.save(conversation);
    }

    /*
     * =====================================================
     * GET ONE CONVERSATION
     * =====================================================
     */

    @Transactional(readOnly = true)
    public Conversation getConversation(Long id) {

        return conversationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Conversation not found."
                        )
                );
    }

    /*
     * =====================================================
     * GET MESSAGES
     * =====================================================
     */

    @Transactional(readOnly = true)
    public List<ChatMessage> getMessages(Long conversationId) {

        if (!conversationRepository.existsById(conversationId)) {

            throw new IllegalArgumentException(
                    "Conversation not found."
            );
        }

        return chatMessageRepository
                .findByConversationIdOrderByCreatedAtAsc(
                        conversationId
                );
    }

    /*
     * =====================================================
     * DELETE CONVERSATION
     * =====================================================
     */

    @Transactional
    public void deleteConversation(Long id) {

        Conversation conversation =
                conversationRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Conversation not found."
                                )
                        );

        conversationRepository.delete(conversation);
    }
}