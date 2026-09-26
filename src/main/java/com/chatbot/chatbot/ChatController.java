package com.chatbot.chatbot;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5500")
public class ChatController {

    private final GeminiService geminiService;

    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/api/chat")
    public ResponseEntity<String> chat(
            @RequestParam Long conversationId,
            @RequestBody ChatRequest request
    ) {

        try {

            String message = request.getMessage();

            if (message == null || message.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("Please enter a message.");
            }

            String response =
                    geminiService.generateResponse(
                            conversationId,
                            message
                    );

            return ResponseEntity.ok(response);

        } catch (GeminiQuotaException e) {

            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(e.getMessage());

        } catch (GeminiAuthenticationException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());

        } catch (GeminiApiException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(e.getMessage());

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "The server encountered an unexpected error. Please try again later."
                    );
        }
    }

    @PostMapping("/api/chat/regenerate")
    public ResponseEntity<String> regenerate(
            @RequestParam Long conversationId
    ) {

        try {

            String response =
                    geminiService.regenerateResponse(
                            conversationId
                    );

            return ResponseEntity.ok(response);

        } catch (GeminiQuotaException e) {

            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(e.getMessage());

        } catch (GeminiAuthenticationException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());

        } catch (GeminiApiException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(e.getMessage());

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "The server encountered an unexpected error. Please try again later."
                    );
        }
    }

    @PostMapping("/api/chat/edit")
    public ResponseEntity<String> editMessage(
            @RequestParam Long conversationId,
            @RequestBody ChatRequest request
    ) {

        try {

            String message = request.getMessage();

            if (message == null || message.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("Please enter a message.");
            }

            String response =
                    geminiService.editLastMessage(
                            conversationId,
                            message
                    );

            return ResponseEntity.ok(response);

        } catch (GeminiQuotaException e) {

            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(e.getMessage());

        } catch (GeminiAuthenticationException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());

        } catch (GeminiApiException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(e.getMessage());

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "The server encountered an unexpected error. Please try again later."
                    );
        }
    }

    @PostMapping("/api/chat/clear")
    public ResponseEntity<String> clearChat(
            @RequestParam Long conversationId
    ) {

        try {

            geminiService.clearConversation(
                    conversationId
            );

            return ResponseEntity.ok(
                    "Conversation cleared."
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "The server encountered an unexpected error. Please try again later."
                    );
        }
    }
}