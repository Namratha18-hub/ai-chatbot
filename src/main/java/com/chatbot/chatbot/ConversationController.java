package com.chatbot.chatbot;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5500")
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(
            ConversationService conversationService
    ) {
        this.conversationService = conversationService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllConversations() {

        List<Conversation> conversations =
                conversationService.getAllConversations();

        List<Map<String, Object>> result = new ArrayList<>();

        for (Conversation conversation : conversations) {

            Map<String, Object> item = new HashMap<>();

            item.put("id", conversation.getId());
            item.put("title", conversation.getTitle());
            item.put("createdAt", conversation.getCreatedAt());
            item.put("updatedAt", conversation.getUpdatedAt());

            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createConversation() {

        Conversation conversation =
                conversationService.createConversation();

        Map<String, Object> result = new HashMap<>();

        result.put("id", conversation.getId());
        result.put("title", conversation.getTitle());
        result.put("createdAt", conversation.getCreatedAt());
        result.put("updatedAt", conversation.getUpdatedAt());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(result);
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<Map<String, Object>>> getMessages(
            @PathVariable Long id
    ) {

        try {

            List<ChatMessage> messages =
                    conversationService.getMessages(id);

            List<Map<String, Object>> result = new ArrayList<>();

            for (ChatMessage message : messages) {

                Map<String, Object> item = new HashMap<>();

                item.put("id", message.getId());
                item.put("role", message.getRole());
                item.put("content", message.getContent());
                item.put("createdAt", message.getCreatedAt());

                result.add(item);
            }

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(List.of());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteConversation(
            @PathVariable Long id
    ) {

        try {

            conversationService.deleteConversation(id);

            return ResponseEntity.ok(
                    "Conversation deleted."
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Conversation not found.");
        }
    }
}