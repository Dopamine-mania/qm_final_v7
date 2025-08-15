/**
 * EmoHeal 情感分析核心功能
 * 处理情感分析请求和结果展示
 */

// API配置 - 自动检测环境
function getApiBaseUrl() {
  // 如果是生产环境或已经部署，使用相对路径
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    return '/api';
  }
  
  // 本地开发环境 - 尝试不同的端口
  const possiblePorts = [5002, 5001, 5000, 8000];
  return `http://localhost:5002/api`;  // 默认使用5002端口
}

const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    ANALYZE: '/emotion/analyze-with-context'
  },
  TIMEOUT: 30000  // 30秒超时
};

// 情感分类配置
const EMOTION_CATEGORIES = {
  positive: ["快乐", "兴奋", "娱乐", "钦佩", "崇拜", "审美欣赏", "敬畏", "入迷", "兴趣", "浪漫"],
  negative: ["愤怒", "焦虑", "悲伤", "恐惧", "内疚", "恐怖", "失望", "厌恶", "嫉妒", "蔑视"],
  neutral: ["平静", "无聊", "困惑", "尴尬", "同情", "渴望", "怀旧"]
};

// 全局状态
let currentAnalysisResult = null;
let analysisChart = null;

/**
 * 初始化情感分析模块
 */
async function initEmotionAnalysis() {
  console.log('🧠 初始化情感分析模块');
  
  // 绑定事件监听器
  bindEventListeners();
  
  // 测试API连接
  await checkApiConnectionOnStartup();
}

/**
 * 启动时检查API连接
 */
async function checkApiConnectionOnStartup() {
  try {
    console.log('🔗 检查API连接...');
    const isConnected = await testApiConnection();
    
    if (isConnected) {
      console.log('✅ API连接正常');
      // 在按钮上添加连接状态指示
      updateConnectionStatus(true);
    } else {
      console.warn('⚠️ API连接失败');
      updateConnectionStatus(false);
      
      // 显示连接警告（非阻塞）
      showConnectionWarning();
    }
  } catch (error) {
    console.error('❌ 连接检查失败:', error);
    updateConnectionStatus(false);
  }
}

/**
 * 更新连接状态显示
 */
function updateConnectionStatus(isConnected) {
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    if (isConnected) {
      analyzeBtn.classList.remove('connection-error');
      analyzeBtn.title = '开始分析';
    } else {
      analyzeBtn.classList.add('connection-error');
      analyzeBtn.title = '服务器连接异常，请稍后重试';
    }
  }
}

/**
 * 显示连接警告
 */
function showConnectionWarning() {
  // 创建温和的警告提示，不阻塞用户操作
  const warningDiv = document.createElement('div');
  warningDiv.className = 'connection-warning';
  warningDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(245, 158, 11, 0.95);
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 0.875rem;
    z-index: 1000;
    max-width: 300px;
    backdrop-filter: blur(4px);
  `;
  
  warningDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <span>⚠️</span>
      <span>API服务连接异常，部分功能可能受限</span>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.1rem;
        margin-left: auto;
      ">×</button>
    </div>
  `;
  
  document.body.appendChild(warningDiv);
  
  // 5秒后自动消失
  setTimeout(() => {
    if (warningDiv.parentElement) {
      warningDiv.style.opacity = '0';
      setTimeout(() => warningDiv.remove(), 300);
    }
  }, 5000);
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
  // 分析按钮
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleAnalyzeClick);
  }
  
  // 清空按钮
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClearClick);
  }
  
  // 重试按钮
  const retryBtn = document.getElementById('retryBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', handleRetryClick);
  }
  
  // 输入框回车键支持
  const emotionInput = document.getElementById('emotionInput');
  if (emotionInput) {
    emotionInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleAnalyzeClick();
      }
    });
    
    // 输入内容变化时的处理
    emotionInput.addEventListener('input', handleInputChange);
  }
  
  // 监听语言切换事件
  window.addEventListener('languageChanged', handleLanguageChange);
}

/**
 * 处理分析按钮点击
 */
async function handleAnalyzeClick() {
  const input = document.getElementById('emotionInput');
  const text = input?.value?.trim();
  
  if (!text) {
    showError(window.EmoHealI18n.getTranslation('error.empty_input') || '请输入一些文字来分析情感');
    return;
  }
  
  if (text.length < 5) {
    showError(window.EmoHealI18n.getTranslation('error.text_too_short') || '请输入更详细的内容以获得准确的分析结果');
    return;
  }
  
  try {
    // 显示加载状态
    showLoading();
    
    // 调用情感分析API
    const result = await analyzeEmotion(text);
    
    // 存储结果
    currentAnalysisResult = result;
    
    // 显示结果
    await displayAnalysisResult(result);
    
  } catch (error) {
    console.error('❌ 情感分析失败:', error);
    showError(error.message || '分析过程中出现错误，请稍后重试');
  }
}

/**
 * 处理清空按钮点击
 */
function handleClearClick() {
  const input = document.getElementById('emotionInput');
  if (input) {
    input.value = '';
    input.focus();
  }
  
  hideResults();
  hideError();
}

/**
 * 处理重试按钮点击
 */
function handleRetryClick() {
  hideError();
  handleAnalyzeClick();
}

/**
 * 处理输入内容变化
 */
function handleInputChange() {
  const input = document.getElementById('emotionInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  
  if (input && analyzeBtn) {
    const hasText = input.value.trim().length > 0;
    analyzeBtn.disabled = !hasText;
  }
}

/**
 * 处理语言切换
 */
function handleLanguageChange() {
  // 如果有当前分析结果，重新渲染
  if (currentAnalysisResult) {
    displayAnalysisResult(currentAnalysisResult);
  }
}

/**
 * 测试API连接
 * @returns {Promise<boolean>} 连接是否成功
 */
async function testApiConnection() {
  try {
    const healthUrl = API_CONFIG.BASE_URL.replace('/api', '') + '/api/health';
    const response = await fetch(healthUrl, {
      method: 'GET',
      timeout: 5000
    });
    
    return response.ok;
  } catch (error) {
    console.warn('⚠️ API连接测试失败:', error);
    return false;
  }
}

/**
 * 调用情感分析API
 * @param {string} text - 要分析的文本
 * @returns {Promise<Object>} 分析结果
 */
async function analyzeEmotion(text) {
  const url = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ANALYZE;
  
  const requestData = {
    text: text,
    include_suggestions: true
  };
  
  console.log('🔍 发送情感分析请求:', { text: text.substring(0, 50) + '...', url });
  
  try {
    // 使用 AbortController 实现超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('API服务不可用，请检查服务器是否正常运行');
      } else if (response.status === 500) {
        throw new Error('服务器内部错误，请稍后重试');
      } else {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
    }
    
    const result = await response.json();
    console.log('✅ 情感分析成功:', result);
    
    // 验证返回数据格式
    if (!result || !result.emotion_vector || !result.top_emotions) {
      throw new Error('API返回数据格式不正确，请联系技术支持');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ API请求错误:', error);
    
    // 根据错误类型提供友好的错误消息
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接或稍后重试');
    } else if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      // 尝试连接测试
      const isConnected = await testApiConnection();
      if (!isConnected) {
        throw new Error('无法连接到分析服务器，请确认：\n1. 后端服务是否已启动\n2. 网络连接是否正常\n3. 防火墙是否阻止了连接');
      } else {
        throw new Error('连接服务器时出现问题，请稍后重试');
      }
    } else if (error.message.includes('timeout')) {
      throw new Error('请求处理超时，请稍后重试');
    } else {
      throw error;
    }
  }
}

/**
 * 显示分析结果
 * @param {Object} result - 分析结果数据
 */
async function displayAnalysisResult(result) {
  console.log('📊 显示分析结果');
  
  try {
    // 隐藏加载状态和错误状态
    hideLoading();
    hideError();
    
    // 显示结果区域
    showResults();
    
    // 更新主要情感显示
    updatePrimaryEmotion(result);
    
    // 更新前3情感列表
    updateTopEmotionsList(result);
    
    // 更新情感平衡图表
    await updateEmotionBalanceChart(result);
    
    // 更新分析摘要
    updateAnalysisSummary(result);
    
    // 更新疗愈建议
    updateHealingSuggestions(result);
    
    // 滚动到结果区域
    scrollToResults();
    
  } catch (error) {
    console.error('❌ 显示结果失败:', error);
    showError('显示结果时出现错误: ' + error.message);
  }
}

/**
 * 更新主要情感显示
 * @param {Object} result - 分析结果
 */
function updatePrimaryEmotion(result) {
  const primaryEmotion = result.top_emotions[0];
  if (!primaryEmotion) return;
  
  const [emotionName, intensity] = primaryEmotion;
  const lang = window.EmoHealI18n.getCurrentLanguage();
  
  // 更新情感图标
  const iconElement = document.getElementById('primaryEmotionIcon');
  if (iconElement) {
    iconElement.textContent = window.EmoHealI18n.getEmotionIcon(emotionName);
  }
  
  // 更新情感名称
  const nameElement = document.getElementById('primaryEmotionName');
  if (nameElement) {
    nameElement.textContent = window.EmoHealI18n.getEmotionName(emotionName, lang);
  }
  
  // 更新强度显示
  const intensityElement = document.getElementById('primaryEmotionIntensity');
  if (intensityElement) {
    const intensityDesc = window.EmoHealI18n.getEmotionIntensityDescription(emotionName, intensity, lang);
    const percentage = Math.round(intensity * 100);
    intensityElement.textContent = `${intensityDesc} (${percentage}%)`;
  }
  
  // 更新情感描述
  const descElement = document.getElementById('primaryEmotionDescription');
  if (descElement) {
    descElement.textContent = generateEmotionDescription(emotionName, intensity, lang);
  }
}

/**
 * 更新前3情感列表
 * @param {Object} result - 分析结果
 */
function updateTopEmotionsList(result) {
  const listElement = document.getElementById('topEmotionsList');
  if (!listElement) return;
  
  const lang = window.EmoHealI18n.getCurrentLanguage();
  const topEmotions = result.top_emotions.slice(0, 3);
  
  listElement.innerHTML = '';
  
  topEmotions.forEach(([emotionName, intensity], index) => {
    const percentage = Math.round(intensity * 100);
    const translatedName = window.EmoHealI18n.getEmotionName(emotionName, lang);
    const icon = window.EmoHealI18n.getEmotionIcon(emotionName);
    
    const itemElement = document.createElement('div');
    itemElement.className = 'emotion-item';
    itemElement.innerHTML = `
      <div class="emotion-item-info">
        <span class="emotion-item-icon">${icon}</span>
        <span class="emotion-item-name">${translatedName}</span>
      </div>
      <span class="emotion-item-percentage">${percentage}%</span>
      <div class="emotion-progress">
        <div class="emotion-progress-fill" style="width: ${percentage}%"></div>
      </div>
    `;
    
    listElement.appendChild(itemElement);
  });
}

/**
 * 更新情感平衡图表
 * @param {Object} result - 分析结果
 */
async function updateEmotionBalanceChart(result) {
  const canvas = document.getElementById('balanceChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const balance = result.statistics?.emotion_balance;
  
  if (!balance) {
    console.warn('⚠️ 缺少情感平衡数据');
    return;
  }
  
  const positiveValue = Math.round(balance.positive * 100);
  const negativeValue = Math.round(balance.negative * 100);  
  const neutralValue = Math.round(balance.neutral * 100);
  
  // 更新图例数值
  const positiveElement = document.getElementById('positiveValue');
  const negativeElement = document.getElementById('negativeValue');
  const neutralElement = document.getElementById('neutralValue');
  
  if (positiveElement) positiveElement.textContent = `${positiveValue}%`;
  if (negativeElement) negativeElement.textContent = `${negativeValue}%`;
  if (neutralElement) neutralElement.textContent = `${neutralValue}%`;
  
  // 销毁之前的图表
  if (analysisChart) {
    analysisChart.destroy();
  }
  
  // 创建新的饼图
  analysisChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [
        window.EmoHealI18n.getTranslation('results.balance.positive'),
        window.EmoHealI18n.getTranslation('results.balance.negative'),
        window.EmoHealI18n.getTranslation('results.balance.neutral')
      ],
      datasets: [{
        data: [positiveValue, negativeValue, neutralValue],
        backgroundColor: [
          'rgb(16, 185, 129)',  // 积极情感 - 绿色
          'rgb(239, 68, 68)',   // 消极情感 - 红色  
          'rgb(139, 92, 246)'   // 中性情感 - 紫色
        ],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false  // 使用自定义图例
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed + '%';
            }
          }
        }
      }
    }
  });
}

/**
 * 更新分析摘要
 * @param {Object} result - 分析结果
 */
function updateAnalysisSummary(result) {
  const stats = result.statistics;
  if (!stats) return;
  
  // 更新统计数据
  const totalIntensityElement = document.getElementById('totalIntensity');
  if (totalIntensityElement) {
    totalIntensityElement.textContent = stats.total_intensity.toFixed(2);
  }
  
  const activeEmotionsElement = document.getElementById('activeEmotions'); 
  if (activeEmotionsElement) {
    activeEmotionsElement.textContent = stats.active_emotions_count;
  }
  
  const emotionDominanceElement = document.getElementById('emotionDominance');
  if (emotionDominanceElement) {
    const dominance = calculateEmotionDominance(stats);
    emotionDominanceElement.textContent = dominance;
  }
  
  // 更新摘要文本
  const summaryTextElement = document.getElementById('summaryText');
  if (summaryTextElement) {
    let summary = generateAnalysisSummary(result);
    
    // 添加置信度和处理时间信息
    if (result.analysis_timestamp) {
      const timestamp = new Date(result.analysis_timestamp);
      const lang = window.EmoHealI18n?.getCurrentLanguage() || 'zh';
      
      if (lang === 'zh') {
        summary += `\n\n分析于 ${timestamp.toLocaleString('zh-CN')}，基于Cowen & Keltner 27维情感模型。`;
      } else {
        summary += `\n\nAnalyzed at ${timestamp.toLocaleString('en-US')}, based on Cowen & Keltner 27-dimensional emotion model.`;
      }
    }
    
    summaryTextElement.textContent = summary;
  }
}

/**
 * 更新疗愈建议
 * @param {Object} result - 分析结果
 */
function updateHealingSuggestions(result) {
  const primaryEmotion = result.top_emotions[0]?.[0];
  const lang = window.EmoHealI18n.getCurrentLanguage();
  
  // 更新音乐疗愈建议
  const musicSuggestionElement = document.getElementById('musicSuggestion');
  if (musicSuggestionElement) {
    musicSuggestionElement.textContent = window.EmoHealI18n.getHealingSuggestion('music', primaryEmotion, lang);
  }
  
  // 更新冥想练习建议
  const mindfulnessSuggestionElement = document.getElementById('mindfulnessSuggestion');
  if (mindfulnessSuggestionElement) {
    mindfulnessSuggestionElement.textContent = window.EmoHealI18n.getHealingSuggestion('mindfulness', primaryEmotion, lang);
  }
  
  // 更新情感反思建议  
  const reflectionSuggestionElement = document.getElementById('reflectionSuggestion');
  if (reflectionSuggestionElement) {
    reflectionSuggestionElement.textContent = window.EmoHealI18n.getHealingSuggestion('reflection', primaryEmotion, lang);
  }
}

/**
 * 生成情感描述
 * @param {string} emotionName - 情感名称
 * @param {number} intensity - 强度值
 * @param {string} lang - 语言代码
 * @returns {string} 情感描述
 */
function generateEmotionDescription(emotionName, intensity, lang) {
  const translatedName = window.EmoHealI18n.getEmotionName(emotionName, lang);
  const intensityDesc = window.EmoHealI18n.getEmotionIntensityDescription(emotionName, intensity, lang);
  
  if (lang === 'zh') {
    return `你当前体验到${intensityDesc}的${translatedName}情感。这种情绪状态反映了你内心的真实感受，值得被理解和关注。`;
  } else {
    return `You are currently experiencing ${intensityDesc.toLowerCase()} ${translatedName.toLowerCase()}. This emotional state reflects your genuine inner feelings and deserves understanding and attention.`;
  }
}

/**
 * 生成分析摘要文本
 * @param {Object} result - 分析结果
 * @returns {string} 摘要文本
 */
function generateAnalysisSummary(result) {
  const lang = window.EmoHealI18n.getCurrentLanguage();
  const topEmotions = result.top_emotions.slice(0, 3);
  const stats = result.statistics;
  
  if (lang === 'zh') {
    let summary = `根据你的表达，我们检测到了${stats.active_emotions_count}种活跃的情感状态。`;
    
    if (topEmotions.length > 0) {
      const emotionNames = topEmotions.map(([name]) => window.EmoHealI18n.getEmotionName(name, lang));
      summary += `主要表现为${emotionNames.join('、')}。`;
    }
    
    const balance = stats.emotion_balance;
    if (balance.positive > balance.negative && balance.positive > balance.neutral) {
      summary += ' 整体情绪状态偏向积极，这是一个良好的心理状态。';
    } else if (balance.negative > balance.positive && balance.negative > balance.neutral) {
      summary += ' 当前情绪状态存在一些挑战，建议关注情绪调节和自我关怀。';
    } else {
      summary += ' 情绪状态较为平衡，显示出一定的情绪调节能力。';
    }
    
    return summary;
  } else {
    let summary = `Based on your expression, we detected ${stats.active_emotions_count} active emotional states.`;
    
    if (topEmotions.length > 0) {
      const emotionNames = topEmotions.map(([name]) => window.EmoHealI18n.getEmotionName(name, lang));
      summary += ` Primarily manifesting as ${emotionNames.join(', ')}.`;
    }
    
    const balance = stats.emotion_balance;
    if (balance.positive > balance.negative && balance.positive > balance.neutral) {
      summary += ' Your overall emotional state tends toward the positive, which is a healthy psychological condition.';
    } else if (balance.negative > balance.positive && balance.negative > balance.neutral) {
      summary += ' Your current emotional state presents some challenges, and we recommend focusing on emotional regulation and self-care.';
    } else {
      summary += ' Your emotional state is relatively balanced, showing some capacity for emotional regulation.';
    }
    
    return summary;
  }
}

/**
 * 计算情感主导性
 * @param {Object} stats - 统计数据
 * @returns {string} 主导性描述
 */
function calculateEmotionDominance(stats) {
  const lang = window.EmoHealI18n.getCurrentLanguage();
  const maxIntensity = stats.max_intensity;
  
  if (lang === 'zh') {
    if (maxIntensity > 0.8) return '强烈';
    if (maxIntensity > 0.6) return '显著';
    if (maxIntensity > 0.4) return '中等';
    return '温和';
  } else {
    if (maxIntensity > 0.8) return 'Strong';
    if (maxIntensity > 0.6) return 'Notable';
    if (maxIntensity > 0.4) return 'Moderate';
    return 'Mild';
  }
}

/**
 * 显示加载状态
 */
function showLoading() {
  hideResults();
  hideError();
  
  const loadingState = document.getElementById('loadingState');
  if (loadingState) {
    loadingState.style.display = 'flex';
  }
  
  // 禁用分析按钮
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.disabled = true;
  }
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
  const loadingState = document.getElementById('loadingState');
  if (loadingState) {
    loadingState.style.display = 'none';
  }
  
  // 启用分析按钮
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.disabled = false;
  }
}

/**
 * 显示结果区域
 */
function showResults() {
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.style.display = 'block';
  }
}

/**
 * 隐藏结果区域
 */
function hideResults() {
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.style.display = 'none';
  }
}

/**
 * 显示错误状态
 * @param {string} message - 错误消息
 */
function showError(message) {
  hideLoading();
  hideResults();
  
  const errorState = document.getElementById('errorState');
  const errorMessage = document.getElementById('errorMessage');
  
  if (errorState) {
    errorState.style.display = 'flex';
  }
  
  if (errorMessage) {
    errorMessage.textContent = message;
  }
}

/**
 * 隐藏错误状态
 */
function hideError() {
  const errorState = document.getElementById('errorState');
  if (errorState) {
    errorState.style.display = 'none';
  }
}

/**
 * 滚动到结果区域
 */
function scrollToResults() {
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
}

// 导出给其他模块使用
window.EmotionAnalysis = {
  init: initEmotionAnalysis,
  analyze: analyzeEmotion,
  getCurrentResult: () => currentAnalysisResult
};