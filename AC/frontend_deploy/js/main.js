/**
 * EmoHeal 主应用入口
 * 负责初始化所有模块和全局配置
 */

// 应用配置
const APP_CONFIG = {
  VERSION: '1.0.0',
  NAME: 'EmoHeal',
  DEBUG: true, // 生产环境设置为 false
  API_TIMEOUT: 30000,
  MAX_RETRIES: 3
};

// 全局状态管理
const AppState = {
  initialized: false,
  currentLanguage: 'zh',
  theme: 'light',
  analysisInProgress: false,
  lastAnalysisTime: null
};

/**
 * 应用主入口函数
 */
async function initApp() {
  try {
    console.log(`🚀 启动 ${APP_CONFIG.NAME} v${APP_CONFIG.VERSION}`);
    
    // 显示加载屏幕
    showInitializationLoader();
    
    // 检查浏览器兼容性
    if (!checkBrowserCompatibility()) {
      showBrowserCompatibilityWarning();
      return;
    }
    
    // 初始化错误处理
    initErrorHandling();
    
    // 初始化各个模块
    await initializeModules();
    
    // 设置全局事件监听器
    setupGlobalEventListeners();
    
    // 初始化性能监控
    initPerformanceMonitoring();
    
    // 应用就绪
    AppState.initialized = true;
    
    // 隐藏加载屏幕
    hideInitializationLoader();
    
    // 显示欢迎信息
    if (APP_CONFIG.DEBUG) {
      console.log('✅ EmoHeal 初始化完成');
      logSystemInfo();
    }
    
    // 触发应用就绪事件
    window.dispatchEvent(new CustomEvent('appReady', {
      detail: { version: APP_CONFIG.VERSION }
    }));
    
  } catch (error) {
    console.error('❌ 应用初始化失败:', error);
    showInitializationError(error);
  }
}

/**
 * 初始化所有模块
 */
async function initializeModules() {
  const modules = [
    {
      name: '国际化支持',
      init: () => window.EmoHealI18n?.init(),
      required: true
    },
    {
      name: 'UI交互效果',
      init: () => window.UIInteractions?.init(),
      required: false
    },
    {
      name: '情感分析核心',
      init: () => window.EmotionAnalysis?.init(),
      required: true
    }
  ];
  
  for (const module of modules) {
    try {
      console.log(`🔧 初始化${module.name}...`);
      
      if (module.init) {
        await module.init();
      }
      
      console.log(`✅ ${module.name}初始化完成`);
      
    } catch (error) {
      console.error(`❌ ${module.name}初始化失败:`, error);
      
      if (module.required) {
        throw new Error(`必需模块"${module.name}"初始化失败: ${error.message}`);
      }
    }
  }
}

/**
 * 检查浏览器兼容性
 */
function checkBrowserCompatibility() {
  const requiredFeatures = [
    'fetch',
    'Promise',
    'IntersectionObserver',
    'CustomEvent'
  ];
  
  const missing = requiredFeatures.filter(feature => {
    return typeof window[feature] === 'undefined';
  });
  
  if (missing.length > 0) {
    console.warn('⚠️ 浏览器缺少必需功能:', missing);
    return false;
  }
  
  // 检查CSS功能
  const testElement = document.createElement('div');
  const cssFeatures = [
    'grid',
    'flexbox',
    'customProperties'
  ];
  
  const supportGrid = CSS.supports('display', 'grid');
  const supportFlexbox = CSS.supports('display', 'flex');
  const supportCustomProps = CSS.supports('color', 'var(--test)');
  
  if (!supportGrid || !supportFlexbox || !supportCustomProps) {
    console.warn('⚠️ 浏览器CSS功能支持不完整');
    return false;
  }
  
  return true;
}

/**
 * 显示浏览器兼容性警告
 */
function showBrowserCompatibilityWarning() {
  const warning = document.createElement('div');
  warning.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: system-ui, sans-serif;
  `;
  
  warning.innerHTML = `
    <div style="text-align: center; max-width: 500px; padding: 2rem;">
      <h2>⚠️ 浏览器兼容性提醒</h2>
      <p>抱歉，您的浏览器版本较旧，可能无法正常使用本应用的全部功能。</p>
      <p>建议升级到最新版本的 Chrome、Firefox、Safari 或 Edge 浏览器。</p>
      <button onclick="location.reload()" style="
        background: #667eea;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        cursor: pointer;
        margin-top: 1rem;
      ">重新加载</button>
    </div>
  `;
  
  document.body.appendChild(warning);
}

/**
 * 显示初始化加载屏幕
 */
function showInitializationLoader() {
  const loader = document.createElement('div');
  loader.id = 'app-loader';
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    color: white;
    font-family: 'Inter', sans-serif;
  `;
  
  loader.innerHTML = `
    <div style="text-align: center;">
      <div style="
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255,255,255,0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1.5rem;
      "></div>
      <h2 style="margin: 0 0 0.5rem 0; font-weight: 600;">🎵 EmoHeal</h2>
      <p style="margin: 0; opacity: 0.9;">正在初始化情感疗愈系统...</p>
    </div>
  `;
  
  // 添加旋转动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(loader);
}

/**
 * 隐藏初始化加载屏幕
 */
function hideInitializationLoader() {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 500);
  }
}

/**
 * 显示初始化错误
 */
function showInitializationError(error) {
  hideInitializationLoader();
  
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #1a202c;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: system-ui, sans-serif;
  `;
  
  errorDiv.innerHTML = `
    <div style="text-align: center; max-width: 600px; padding: 2rem;">
      <h2 style="color: #ef4444;">❌ 初始化失败</h2>
      <p>应用启动时遇到错误，无法继续运行。</p>
      <details style="margin: 1rem 0; text-align: left;">
        <summary style="cursor: pointer; margin-bottom: 0.5rem;">错误详情</summary>
        <code style="
          display: block;
          background: rgba(255,255,255,0.1);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-size: 0.875rem;
        ">${error.message}</code>
      </details>
      <button onclick="location.reload()" style="
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        cursor: pointer;
        margin-right: 1rem;
      ">重新加载</button>
      <button onclick="window.location.href='/'" style="
        background: transparent;
        color: white;
        border: 2px solid white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        cursor: pointer;
      ">返回首页</button>
    </div>
  `;
  
  document.body.appendChild(errorDiv);
}

/**
 * 初始化错误处理
 */
function initErrorHandling() {
  // 全局错误处理
  window.addEventListener('error', (event) => {
    console.error('🚨 全局错误:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    
    // 在生产环境可以发送错误报告到服务器
    if (!APP_CONFIG.DEBUG) {
      reportError('javascript', event.error);
    }
  });
  
  // Promise 拒绝处理
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 未处理的Promise拒绝:', event.reason);
    
    if (!APP_CONFIG.DEBUG) {
      reportError('promise', event.reason);
    }
  });
}

/**
 * 设置全局事件监听器
 */
function setupGlobalEventListeners() {
  // 语言切换
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      window.EmoHealI18n?.toggle();
    });
  }
  
  // 键盘快捷键
  document.addEventListener('keydown', handleGlobalKeydown);
  
  // 页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 在线/离线状态
  window.addEventListener('online', handleOnlineStatusChange);
  window.addEventListener('offline', handleOnlineStatusChange);
}

/**
 * 处理全局键盘事件
 */
function handleGlobalKeydown(event) {
  // ESC 键关闭模态框或清除结果
  if (event.key === 'Escape') {
    // 可以添加ESC键功能
  }
  
  // Ctrl/Cmd + Enter 快速分析
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn && !analyzeBtn.disabled) {
      analyzeBtn.click();
    }
  }
  
  // Alt + L 切换语言
  if (event.altKey && event.key === 'l') {
    event.preventDefault();
    window.EmoHealI18n?.toggle();
  }
}

/**
 * 处理页面可见性变化
 */
function handleVisibilityChange() {
  if (document.hidden) {
    console.log('📱 页面隐藏');
  } else {
    console.log('👀 页面显示');
  }
}

/**
 * 处理在线状态变化
 */
function handleOnlineStatusChange() {
  const isOnline = navigator.onLine;
  console.log(isOnline ? '🌐 网络连接恢复' : '📡 网络连接断开');
  
  // 显示网络状态提示
  showNetworkStatus(isOnline);
}

/**
 * 显示网络状态提示
 */
function showNetworkStatus(isOnline) {
  // 移除已存在的网络状态提示
  const existingAlert = document.querySelector('.network-alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  if (!isOnline) {
    const alert = document.createElement('div');
    alert.className = 'network-alert';
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ef4444;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 0.875rem;
    `;
    
    const lang = window.EmoHealI18n?.getCurrentLanguage() || 'zh';
    const message = lang === 'zh' ? '⚠️ 网络连接断开，请检查网络设置' : '⚠️ Network disconnected, please check your connection';
    alert.textContent = message;
    
    document.body.appendChild(alert);
  }
}

/**
 * 初始化性能监控
 */
function initPerformanceMonitoring() {
  if (!APP_CONFIG.DEBUG) return;
  
  // 页面加载性能
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
      
      console.log('⚡ 性能指标:', {
        '页面加载时间': `${loadTime}ms`,
        'DOM就绪时间': `${domReadyTime}ms`,
        '首次内容绘制': getFirstContentfulPaint(),
        '内存使用': getMemoryInfo()
      });
    }, 0);
  });
}

/**
 * 获取首次内容绘制时间
 */
function getFirstContentfulPaint() {
  try {
    const perfEntries = performance.getEntriesByType('paint');
    const fcp = perfEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? `${Math.round(fcp.startTime)}ms` : 'N/A';
  } catch (e) {
    return 'N/A';
  }
}

/**
 * 获取内存信息
 */
function getMemoryInfo() {
  try {
    if (performance.memory) {
      const memory = performance.memory;
      return {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      };
    }
  } catch (e) {
    return 'N/A';
  }
  
  return 'N/A';
}

/**
 * 错误报告函数
 */
function reportError(type, error) {
  // 在实际部署时，可以将错误发送到监控服务
  const errorData = {
    type,
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
  
  console.warn('📊 错误报告:', errorData);
  
  // 示例：发送到错误监控服务
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(errorData)
  // }).catch(console.error);
}

/**
 * 记录系统信息
 */
function logSystemInfo() {
  console.log('🖥️ 系统信息:', {
    '用户代理': navigator.userAgent,
    '屏幕分辨率': `${screen.width}x${screen.height}`,
    '视口大小': `${window.innerWidth}x${window.innerHeight}`,
    '设备像素比': window.devicePixelRatio,
    '时区': Intl.DateTimeFormat().resolvedOptions().timeZone,
    '语言': navigator.language,
    '在线状态': navigator.onLine ? '在线' : '离线'
  });
}

/**
 * 获取应用状态
 */
function getAppState() {
  return { ...AppState };
}

/**
 * 更新应用状态
 */
function updateAppState(updates) {
  Object.assign(AppState, updates);
  
  // 触发状态变化事件
  window.dispatchEvent(new CustomEvent('appStateChanged', {
    detail: { state: AppState, updates }
  }));
}

// DOM加载完成后初始化应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// 导出给其他模块使用
window.EmoHealApp = {
  config: APP_CONFIG,
  state: AppState,
  getState: getAppState,
  updateState: updateAppState
};