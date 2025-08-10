window.EXPERIMENT_CONFIG = {
  // 🌍 全球访问 - ngrok隧道地址
  apiBaseUrl: "https://9f64d0a4c4b2.ngrok-free.app", // 数据收集服务器 (端口5000)
  emotionApiUrl: "https://43120a4891f4.ngrok-free.app" // 情感分析服务器 (端口5001)
};

// 添加全局变量兼容性补丁 - 解决变量名称不匹配问题
window.API_BASE = window.API_BASE || window.EXPERIMENT_CONFIG.apiBaseUrl;
window.EMOTION_API_BASE = window.EMOTION_API_BASE || window.EXPERIMENT_CONFIG.emotionApiUrl;