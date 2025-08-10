window.EXPERIMENT_CONFIG = {
  // 🌍 全球访问 - ngrok隧道地址
  apiBaseUrl: "https://e5c21bcb9eb0.ngrok-free.app", // 数据收集服务器 (端口5000)
  emotionApiUrl: "https://eb39c261f0a0.ngrok-free.app" // 情感分析服务器 (端口5001)
};

// 添加全局变量兼容性补丁 - 解决变量名称不匹配问题
window.API_BASE = window.API_BASE || window.EXPERIMENT_CONFIG.apiBaseUrl;
window.EMOTION_API_BASE = window.EMOTION_API_BASE || window.EXPERIMENT_CONFIG.emotionApiUrl;