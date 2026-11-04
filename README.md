# AI Chatbot

A full-stack AI chatbot built with **Java Spring Boot**, **Google Gemini**, **MySQL**, and a responsive **HTML/CSS/JavaScript** frontend.

The app supports AI conversations, conversation history, message editing, response regeneration, conversation clearing, a light/dark theme, and persistent storage.

---

## 🚀 Live Demo

| Part | URL |
|---|---|
| Frontend | https://YOUR-FRONTEND-URL.onrender.com |
| Backend API | https://ai-chatbot-e8u1.onrender.com |

> **Note:** The backend runs on a free Render instance, which sleeps when idle. The first request after a period of inactivity can take **about 50 seconds**. After that it responds normally.
>
> Opening the backend root URL shows a Spring Boot "Whitelabel Error Page" (404). This is expected, because the backend is an API with no page at `/`.

---

## ✨ Features

- 🤖 AI chat powered by Google Gemini (`gemini-2.5-flash`)
- 🆕 Create new conversations
- 🗂️ Conversation history
- 🗑️ Delete conversations
- ✏️ Edit previously sent messages
- 🔄 Regenerate AI responses
- 🧹 Clear conversation messages
- 📋 Copy AI responses
- 🌙 Light and dark theme
- 💾 Persistent storage with MySQL
- 🔐 Environment-variable based configuration
- 🔗 REST API architecture
- 📱 Responsive UI

---

## 🛠️ Technologies Used

**Backend**
- Java 21
- Spring Boot 4
- Spring Web
- Spring Data JPA / Hibernate
- Maven
- MySQL
- Google Gemini API

**Frontend**
- HTML5
- CSS3
- JavaScript (Fetch API)
- marked.js (Markdown rendering)

**Deployment**
- GitHub
- Render (backend web service and frontend static site)
- Aiven (managed MySQL)
- Docker

---

## 📁 Project Structure

```
ai-chatbot/
├── src/
│   └── main/
│       ├── java/com/chatbot/chatbot/
│       │   ├── ChatbotApplication.java
│       │   ├── ChatController.java
│       │   ├── ChatService.java
│       │   ├── ChatRequest.java
│       │   ├── ChatMessage.java
│       │   ├── ChatMessageRepository.java
│       │   ├── Conversation.java
│       │   ├── ConversationController.java
│       │   ├── ConversationService.java
│       │   ├── ConversationRepository.java
│       │   ├── GeminiService.java
│       │   ├── GeminiApiException.java
│       │   ├── GeminiAuthenticationException.java
│       │   ├── GeminiQuotaException.java
│       │   └── CorsConfig.java
│       └── resources/
│           └── application.properties
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── marked.min.js
├── Dockerfile
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

The backend reads its configuration from environment variables.

| Variable | Description | Example |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key from [Google AI Studio](https://aistudio.google.com) | `AIza...` |
| `MYSQL_URL` | JDBC connection URL for MySQL | `jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED` |
| `MYSQL_USERNAME` | Database username | `avnadmin` |
| `MYSQL_PASSWORD` | Database password | `your_password` |
| `FRONTEND_URL` | Allowed frontend origin for CORS (no trailing `/`) | `https://your-frontend.onrender.com` |

If not set, these defaults apply for local development:

- `MYSQL_URL` → `jdbc:mysql://localhost:3306/ai_chatbot?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true`
- `MYSQL_USERNAME` → `root`
- `MYSQL_PASSWORD` → empty
- `FRONTEND_URL` → `http://localhost:5500`

`GEMINI_API_KEY` has no default and must always be set.

---

## 🔌 API Endpoints

### Conversations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/conversations` | Get all conversations |
| POST | `/api/conversations` | Create a conversation |
| GET | `/api/conversations/{id}/messages` | Get messages of a conversation |
| DELETE | `/api/conversations/{id}` | Delete a conversation |

### Chat

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat?conversationId={id}` | Send a message |
| POST | `/api/chat/regenerate?conversationId={id}` | Regenerate the last AI response |
| POST | `/api/chat/edit?conversationId={id}` | Edit a message |
| POST | `/api/chat/clear?conversationId={id}` | Clear all messages in a conversation |

---

## 💻 Run Locally

### Prerequisites
- Java 21
- MySQL running locally
- A Gemini API key
- Python 3 (only to serve the frontend, any static server works)

### 1. Clone the repository
```bash
git clone https://github.com/Namratha18-hub/ai-chatbot.git
cd ai-chatbot
```

### 2. Create the database
```sql
CREATE DATABASE ai_chatbot;
```
Tables are created automatically on first start (`spring.jpa.hibernate.ddl-auto=update`).

### 3. Set environment variables

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your_gemini_api_key"
$env:MYSQL_USERNAME="root"
$env:MYSQL_PASSWORD="your_mysql_password"
```

**macOS / Linux:**
```bash
export GEMINI_API_KEY="your_gemini_api_key"
export MYSQL_USERNAME="root"
export MYSQL_PASSWORD="your_mysql_password"
```

### 4. Start the backend
```bash
# Windows
.\mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```
The backend runs at `http://localhost:8080`.

### 5. Point the frontend at your local backend
In `frontend/script.js`, change the backend URL at the top of the file from the deployed URL to:
```
http://localhost:8080
```
(Change it back to your deployed backend URL before pushing to production.)

### 6. Start the frontend
In a second terminal:
```bash
cd frontend
python -m http.server 5500
```
Open **http://localhost:5500**.

---

## 🐳 Docker

Build the image:
```bash
docker build -t ai-chatbot .
```

Run the container:
```bash
docker run -p 8080:8080 \
  -e GEMINI_API_KEY=your_key \
  -e MYSQL_URL="jdbc:mysql://HOST:PORT/DB?sslMode=REQUIRED" \
  -e MYSQL_USERNAME=your_user \
  -e MYSQL_PASSWORD=your_password \
  -e FRONTEND_URL=http://localhost:5500 \
  ai-chatbot
```

---

## 🌐 Deployment Guide

```
GitHub
  ├── Frontend → Render Static Site
  └── Backend  → Render Web Service (Docker) → Aiven MySQL
```

### 1. Database (Aiven)
1. Create a free **MySQL** service on [Aiven](https://aiven.io) and wait for it to be **Running**.
2. Copy the host, port, user, password, and database name.
3. Build the JDBC URL:
   ```
   jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED
   ```

### 2. Backend (Render Web Service)
1. On [Render](https://render.com), click **New → Web Service** and select this repository.
2. Set **Language** to **Docker**, **Branch** to `main`, and **Instance Type** to **Free**.
3. Add the environment variables: `GEMINI_API_KEY`, `MYSQL_URL`, `MYSQL_USERNAME`, `MYSQL_PASSWORD`.
4. Deploy, then verify it works by opening `https://YOUR-BACKEND-URL/api/conversations`. It should return `[]`.

### 3. Frontend (Render Static Site)
1. In `frontend/script.js`, set every API URL to your backend URL, then commit and push.
2. On Render, click **New → Static Site** and select this repository.
3. Set **Root Directory** to `frontend`, leave **Build Command** empty, and set **Publish Directory** to `.`.
4. Deploy and copy the frontend URL.

### 4. Connect them (CORS)
Add `FRONTEND_URL` to the backend's environment variables with your frontend URL (no trailing `/`), then save so the backend redeploys.

### Updating the deployed app
```bash
git add .
git commit -m "Describe your change"
git push
```
Render redeploys automatically after each push.

---

## 🧰 Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| First message takes about 50 seconds | Normal. The free Render instance is waking up. |
| CORS error in the browser console | `FRONTEND_URL` doesn't exactly match the frontend URL (check `https://` and that there is no trailing `/`). |
| `GEMINI_API_KEY environment variable is not set` | Add the variable to the backend's environment settings. |
| Database connection errors | Check `MYSQL_URL`, username, and password, and confirm the Aiven service is running. |
| Quota or authentication error in chat | The Gemini free-tier limit was reached, or the API key is invalid. |
| Frontend can't reach the backend | The API URLs in `frontend/script.js` don't point to the current backend. |

---

## 🔐 Security

Never commit any of the following to GitHub:

- Gemini API keys
- Database passwords
- `.env` files
- Private certificates or other credentials

Use environment variables instead. The repository includes a `.gitignore` and a `.env.example` file to help with this.

---

## 👩‍💻 Author

**Namratha**
GitHub: [@Namratha18-hub](https://github.com/Namratha18-hub)

---

## 📄 License

This project is intended for educational and demonstration purposes.
