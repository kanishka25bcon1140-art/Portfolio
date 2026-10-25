const chatInput = document.getElementById("userInput");
const chatButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");
const chatStatus = document.getElementById("chatStatus");

// Temperature for Groq inference
let chatTemperature = 0.7;

function showChatMessage(role, text) {
  if (!chatMessages) return;
  const message = document.createElement("div");

  message.className =
    "chat-message " +
    (role === "user" ? "chat-user" : "chat-assistant");

  message.textContent = text;
  chatMessages.appendChild(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Disable chat when local configuration is absent
if (typeof CONFIG === "undefined" ||
  !CONFIG.apiKey ||
  CONFIG.apiKey === "YOUR_PRIVATE_GROQ_KEY" ||
  CONFIG.apiKey === "gsk_4Ml6rGZ5v0KXf98C01b6492rMAc") {
  if (chatButton) chatButton.disabled = true;
  if (chatStatus) {
    chatStatus.textContent =
      "AI chat requires a valid Groq API key in config.js.";
  }
}

async function sendChatMessage() {
  if (!chatButton || chatButton.disabled) return;
  if (!chatInput) return;

  const question = chatInput.value.trim();
  if (!question) return;

  showChatMessage("user", question);
  chatInput.value = "";

  chatButton.disabled = true;
  chatStatus.textContent = "AI is thinking...";

  const portfolioContextPrompt =
    "You are an AI assistant for Kanishka Gupta's personal portfolio website. " +
    "Kanishka is a BTech Computer Science student at University of Jaipur with skills in HTML, CSS, JavaScript, Git, Web Development, and Machine Learning. " +
    "Projects on this website include: " +
    "1. Python Programs Collection (data structures, algorithms, and machine learning). " +
    "2. Messy Python Code Improvement (refactored and corrected using Cursor AI). " +
    "3. Bug Fixing Project (logic errors diagnosed and corrected using Cursor AI). " +
    "4. Interactive Quiz Application (web quiz for testing knowledge and checking scores). " +
    "5. Reading List Application (book reading list manager deployed on Vercel). " +
    "The website also features a real-time OpenWeatherMap Weather Search widget and a dark/light mode toggle at the bottom. " +
    "Answer questions accurately, politely, and concisely about Kanishka's portfolio, skills, projects, and web development. Keep replies under 60 words.";

  try {
    const response = await fetch(
      CONFIG.baseUrl.replace(/\/$/, "") +
      "/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + CONFIG.apiKey
        },
        body: JSON.stringify({
          model: CONFIG.model || "openai/gpt-oss-20b",
          temperature: chatTemperature,
          messages: [
            {
              role: "system",
              content: portfolioContextPrompt
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      }
    );

    if (response.status === 429) {
      throw new Error("RATE_LIMIT");
    }

    if (response.status === 401) {
      throw new Error("AUTH_ERROR");
    }

    if (!response.ok) {
      throw new Error("API_ERROR");
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (typeof answer !== "string" || !answer.trim()) {
      throw new Error("INVALID_RESPONSE");
    }

    showChatMessage("assistant", answer);

  } catch (error) {
    console.error("Chat error:", error.message);

    if (error.message === "RATE_LIMIT") {
      showChatMessage(
        "assistant",
        "Too many requests. Please wait a moment and try again."
      );
    } else if (error.message === "AUTH_ERROR") {
      showChatMessage(
        "assistant",
        "Invalid API key. Please check your Groq API key in config.js."
      );
    } else if (!navigator.onLine) {
      showChatMessage(
        "assistant",
        "No internet connection. Please reconnect and try again."
      );
    } else {
      showChatMessage(
        "assistant",
        "AI service unavailable right now. Please check configuration or try again shortly."
      );
    }
  } finally {
    chatButton.disabled = false;
    chatStatus.textContent = "";
    chatInput.focus();
  }
}

if (chatButton) {
  chatButton.addEventListener("click", sendChatMessage);
}

if (chatInput) {
  chatInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendChatMessage();
    }
  });
}