// EmoHeal API 配置模板
// 将 YOUR_NGROK_URL 替换为实际的ngrok隧道地址

window.EXPERIMENT_CONFIG = {
  // 数据收集服务器 (端口5002) 
  apiBaseUrl: "https://YOUR_NGROK_URL_5002", 
  
  // 情感分析服务器 (端口5001)
  emotionApiUrl: "https://YOUR_NGROK_URL_5001"
};

// 全局变量兼容性补丁
window.API_BASE = window.API_BASE || window.EXPERIMENT_CONFIG.apiBaseUrl;
window.EMOTION_API_BASE = window.EMOTION_API_BASE || window.EXPERIMENT_CONFIG.emotionApiUrl;

// 调试信息
console.log("🌍 EmoHeal Global API Configuration:");
console.log("📡 Data Collection API:", window.EXPERIMENT_CONFIG.apiBaseUrl);
console.log("🧠 Emotion Analysis API:", window.EXPERIMENT_CONFIG.emotionApiUrl);