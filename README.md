# 📞 Anti-Fraud Call System

A proactive anti-fraud mobile application integrating speech-to-text, keyword extraction, encryption technology, and ciphertext comparison. This system simulates human alertness to sensitive words during calls, provides real-time scam risk analysis and warnings, and helps users prevent fraud.

---

## ✅ Core Features

- **Speech-to-Text**: Converts call recordings into analyzable text.
- **Keyword Extraction**: Uses NLP technology to extract potential scam-related keywords from text.
- **Ciphertext Comparison**: Encrypts keywords and compares them with a database to ensure privacy and enhance security.
- **Risk Assessment and Alerts**: Provides graded warnings to users about potential scam risks based on the proportion of detected keywords.

---

## 🖼 User Interface
![image](https://github.com/user-attachments/assets/65148ae1-558b-4aef-a9de-7adfbba199ed)

- **Figure 1:** Initial screen
  
![image](https://github.com/user-attachments/assets/a15be699-47f5-40ac-9f02-f207d9c14435)

- **Figure 2:** Analysis Result Screen

![image](https://github.com/user-attachments/assets/63c671a4-239f-4232-8504-cc505fd9ddd6)

- **Figure 3:** Alert page

---

## ⚙️ Installation Guide

Follow these steps to run the project locally.

### 📦 Environment Requirements

- Node.js v16.15.0 or above
- React Native CLI
- Android Studio + Android SDK
- JDK 11 or above
- Gradle
- Physical Android device or emulator

---

### 1️⃣ Install React Native CLI
```bash
npx @react-native-community/cli@latest init AntiFraud
```

---

### 2️⃣ Download and Install Android Studio

- Select to install **Android SDK**, **Android SDK Platform**, and **Android Virtual Device**.
- Set the `ANDROID_HOME` environment variable:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

### 3️⃣ Obtain the Project Code
```bash
git clone https://github.com/yuhsssss/AntiFraud.git
cd AntiFraud
```

---

### 4️⃣ Install Project Dependencies
```bash
npm install
```

---

### 5️⃣ Set Environment Variables

Create a `.env` file in the root directory and fill in your API keys to ensure the speech-to-text and keyword extraction features work properly:
```bash
Google Speech-to-Text Service
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SPEECH_URL=https://speech.googleapis.com/v1/speech:recognize

Azure OpenAI Keyword Extraction Settings
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
API_KEY=your_azure_openai_key
DEPLOYMENT_NAME=your-deployment-id
API_VERSION=2024-02-01
```
---

### 6️⃣ Install to Android Device
```bash
npx react-native run-android
```

> ⚠️ If using a physical device, please enable USB debugging and ensure the device is connected.

---

## ✅ After Successful Execution

You will see the application launch and enter the home screen, where you can start using the system features.

---

## 🌐 Environment Variable Description

| Variable Name         | Description                                                                                      |
|----------------------|--------------------------------------------------------------------------------------------------|
| GOOGLE_API_KEY        | Google Speech-to-Text API key, used to access the speech-to-text service                        |
| GOOGLE_SPEECH_URL     | Endpoint for Google Speech API, default: `https://speech.googleapis.com/v1/speech:recognize`    |
| AZURE_OPENAI_ENDPOINT | Endpoint URL for Azure OpenAI, e.g., `https://your-resource-name.openai.azure.com/`             |
| API_KEY               | API key for Azure OpenAI, used to authorize access to GPT models on Azure                       |
| DEPLOYMENT_NAME       | The deployment name you created on Azure OpenAI (e.g., `gpt-keyword-v1`)                        |
| API_VERSION           | Azure OpenAI API version used, e.g., `2023-12-01-preview`                                       |

**Tips:**
- Apply for a Google API key via [Google Cloud Console](https://console.cloud.google.com/).
- Apply for an Azure OpenAI key and set up deployment via [Azure Portal](https://portal.azure.com/).
- After configuration, ensure your `.env` file is in the project root directory and loaded before starting.

---

## 📁 Directory Structure

| File/Folder           | Description                                  |
|-----------------------|----------------------------------------------|
| android/              | Android-related code                         |
| server/               | Backend Node.js comparison module            |
| src/_types_/env.d.ts  | Declaration of environment variables for @env |
| App.tsx               | Main frontend application entry point         |
| FetchKeywords.js      | Keyword extraction                           |
| Transcriber.js        | Speech-to-text conversion                    |
| FraudRisks.js         | Risk assessment                              |

---

## 🧰 Technologies

- React Native
- Node.js + Express
- PKEET (Pairing-based Public Key Encryption with Equality Test) ciphertext comparison algorithm

---

## 🔗 Third-Party Services

- Google Speech-to-Text API
- Azure OpenAI API

---

## 👥 Team Members

- Wan-Ling Yeh
- Pei-Ying Yang
- Wei-Lin Chang
- Yi-Chen Li

**Advisor:** Prof. Tung-Tso Tsai (National Taiwan Ocean University)
