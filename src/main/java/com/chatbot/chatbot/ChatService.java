package com.chatbot.chatbot;

import org.springframework.stereotype.Service;

@Service
public class ChatService {

    public String getResponse(String message) {

        String input = message.toLowerCase().trim();

        if (input.equals("hello") || input.equals("hi") || input.equals("hey")) {
            return "Hello! How can I help you?";
        }

        if (input.contains("how are you")) {
            return "I'm doing great! Thanks for asking.";
        }

        if (input.equals("bye") || input.equals("goodbye")) {
            return "Goodbye! Have a great day!";
        }

        if (input.contains("your name")) {
            return "I'm your Java AI Chatbot.";
        }

        return "I'm still learning. Please ask me something else!";
    }
}