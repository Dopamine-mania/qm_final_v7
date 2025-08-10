window.EXPERIMENT_CONFIG = {
  apiBaseUrl: "http://127.0.0.1:5000", // 本地数据收集服务器
  emotionApiUrl: "http://127.0.0.1:5001" // 本地情感分析服务器
};

// 添加全局变量兼容性补丁 - 解决变量名称不匹配问题
window.API_BASE = window.API_BASE || window.EXPERIMENT_CONFIG.apiBaseUrl;
window.EMOTION_API_BASE = window.EMOTION_API_BASE || window.EXPERIMENT_CONFIG.emotionApiUrl;