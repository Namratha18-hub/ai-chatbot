# AI Chatbot

A full-stack AI chatbot built with **Java Spring Boot**, **Google Gemini**, **MySQL**, and a responsive **HTML/CSS/JavaScript** frontend.

The application supports AI conversations, conversation history, editing, regeneration, clearing conversations, theme switching, and persistent storage.

## 🚀 Live Demo

**Frontend:**  
https://ai-chatbot-frontend-y23w.onrender.com/

**Backend API:**  
https://ai-chatbot-a8it.onrender.com

> The backend root URL may display a Spring Boot Whitelabel 404 page because there is no `/` route. The API endpoints are working normally.

---

## ✨ Features

- 🤖 AI-powered chat using Google Gemini
- 💬 Send and receive AI messages
- 🆕 Create new conversations
- 🗂️ Conversation history
- 🗑️ Delete conversations
- ✏️ Edit previously sent messages
- 🔄 Regenerate AI responses
- 🧹 Clear conversation messages
- 📋 Copy AI responses
- 🌙 Light and dark theme
- 💾 Persistent conversation storage using MySQL
- 🌐 Deployed frontend and backend
- 🔐 Environment-variable based configuration
- 🔗 REST API architecture
- 📱 Responsive frontend UI

---

## 🛠️ Technologies Used

### Backend

- Java 21
- Spring Boot 4
- Spring Web
- Spring Data JPA
- Hibernate
- Maven
- MySQL
- Google Gemini API

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API

### Deployment

- GitHub
- Render
- Aiven MySQL

---

## 📁 Project Structure

```text
chatbot/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── chatbot/
│       │           └── chatbot/
│       │               ├── ChatbotApplication.java
│       │               ├── ChatController.java
│       │               ├── ConversationController.java
│       │               ├── Conversation.java
│       │               ├── ConversationRepository.java
│       │               ├── Message.java
│       │               ├── MessageRepository.java
│       │               ├── GeminiService.java
│       │               └── CorsConfig.java
│       │
│       └── resources/
│           └── application.properties
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── Dockerfile
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .gitignore
└── README.md

⚙️ Backend Configuration

The application uses environment variables for sensitive configuration.

Example:

spring.application.name=chatbot

spring.datasource.url=${MYSQL_URL:jdbc:mysql://localhost:3306/ai_chatbot?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true}
spring.datasource.username=${MYSQL_USERNAME:root}
spring.datasource.password=${MYSQL_PASSWORD:}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
Required Environment Variables
GEMINI_API_KEY
MYSQL_URL
MYSQL_USERNAME
MYSQL_PASSWORD

For local development, these values can be configured using environment variables.

Do not commit API keys or database passwords to GitHub.

🗄️ Database

The application uses MySQL to persist:

Conversations
User messages
AI responses
Conversation titles
Message timestamps

The production database is hosted on Aiven MySQL.

🔌 API Endpoints
Conversations
Get all conversations
GET /api/conversations
Create a conversation
POST /api/conversations
Get conversation messages
GET /api/conversations/{id}/messages
Delete a conversation
DELETE /api/conversations/{id}
Chat
Send a message
POST /api/chat?conversationId={id}
Regenerate response
POST /api/chat/regenerate?conversationId={id}
Edit message
POST /api/chat/edit?conversationId={id}
Clear conversation
POST /api/chat/clear?conversationId={id}
💻 Run Locally
1. Clone the repository
git clone https://github.com/Namratha18-hub/ai-chatbot.git
cd ai-chatbot
2. Configure the database and Gemini API

Set the required environment variables:

GEMINI_API_KEY
MYSQL_URL
MYSQL_USERNAME
MYSQL_PASSWORD
3. Start the backend

On Windows:

.\mvnw.cmd spring-boot:run

The backend will run on:

http://localhost:8080
4. Start the frontend

Open another terminal:

cd frontend
python -m http.server 5500

Then open:

http://localhost:5500
🐳 Docker

The application can also be built and run using Docker.

Build the image:

docker build -t ai-chatbot .

Run the container:

docker run -p 8080:8080 ai-chatbot

Environment variables should be provided when running the container.

🌐 Deployment

The project is deployed using:

GitHub
   │
   ├── Frontend → Render Static Site
   │
   └── Backend → Render Web Service
                    │
                    └── Aiven MySQL
Production Frontend
https://ai-chatbot-frontend-y23w.onrender.com/
Production Backend
https://ai-chatbot-a8it.onrender.com

The frontend communicates with the production backend through REST API requests.

🔐 Security

Sensitive information should be stored in environment variables rather than source code.

Do not commit:

Gemini API keys
Database passwords
.env files
Private certificates
Other credentials

The repository includes a .gitignore to help prevent sensitive files from being committed.

📌 Important Note

The backend does not provide a webpage at /.

Therefore, opening:

https://ai-chatbot-a8it.onrender.com/

may display:

Whitelabel Error Page
404 Not Found

This is expected.

The backend is an API service and is accessed through endpoints such as:

/api/chat
/api/conversations

The user-facing application is the frontend:

https://ai-chatbot-frontend-y23w.onrender.com/
👩‍💻 Author

Namratha

GitHub:

https://github.com/Namratha18-hub
## 📄 License

This project is intended for educational and demonstration purposes.
