/**
 * EmoHeal 国际化 (i18n) 支持
 * 支持中文和英文界面切换
 */

// 27个情感的中英文对照表
const EMOTIONS_I18N = {
  "钦佩": {
    en: "Admiration",
    zh: "钦佩",
    icon: "😍",
    intensity: {
      zh: ["轻微钦佩", "钦佩", "强烈钦佩"],
      en: ["Mild Admiration", "Admiration", "Strong Admiration"]
    }
  },
  "崇拜": {
    en: "Adoration",
    zh: "崇拜",
    icon: "🤩",
    intensity: {
      zh: ["轻微崇拜", "崇拜", "强烈崇拜"],
      en: ["Mild Adoration", "Adoration", "Strong Adoration"]
    }
  },
  "审美欣赏": {
    en: "Aesthetic Appreciation",
    zh: "审美欣赏",
    icon: "😌",
    intensity: {
      zh: ["轻微欣赏", "审美欣赏", "深深欣赏"],
      en: ["Light Appreciation", "Aesthetic Appreciation", "Deep Appreciation"]
    }
  },
  "娱乐": {
    en: "Amusement",
    zh: "娱乐",
    icon: "😄",
    intensity: {
      zh: ["轻微愉悦", "娱乐", "非常有趣"],
      en: ["Mild Amusement", "Amusement", "High Amusement"]
    }
  },
  "愤怒": {
    en: "Anger",
    zh: "愤怒",
    icon: "😠",
    intensity: {
      zh: ["轻微愤怒", "愤怒", "暴怒"],
      en: ["Mild Anger", "Anger", "Rage"]
    }
  },
  "焦虑": {
    en: "Anxiety",
    zh: "焦虑",
    icon: "😰",
    intensity: {
      zh: ["轻微焦虑", "焦虑", "严重焦虑"],
      en: ["Mild Anxiety", "Anxiety", "Severe Anxiety"]
    }
  },
  "敬畏": {
    en: "Awe",
    zh: "敬畏",
    icon: "😲",
    intensity: {
      zh: ["轻微敬畏", "敬畏", "深深敬畏"],
      en: ["Mild Awe", "Awe", "Deep Awe"]
    }
  },
  "尴尬": {
    en: "Embarrassment",
    zh: "尴尬",
    icon: "😳",
    intensity: {
      zh: ["有点尴尬", "尴尬", "非常尴尬"],
      en: ["Slightly Embarrassed", "Embarrassed", "Very Embarrassed"]
    }
  },
  "无聊": {
    en: "Boredom",
    zh: "无聊",
    icon: "😑",
    intensity: {
      zh: ["有点无聊", "无聊", "极度无聊"],
      en: ["Slightly Bored", "Bored", "Extremely Bored"]
    }
  },
  "平静": {
    en: "Calmness",
    zh: "平静",
    icon: "😌",
    intensity: {
      zh: ["略感平静", "平静", "非常平静"],
      en: ["Slightly Calm", "Calm", "Very Calm"]
    }
  },
  "困惑": {
    en: "Confusion",
    zh: "困惑",
    icon: "😕",
    intensity: {
      zh: ["有点困惑", "困惑", "非常困惑"],
      en: ["Slightly Confused", "Confused", "Very Confused"]
    }
  },
  "蔑视": {
    en: "Contempt",
    zh: "蔑视",
    icon: "😤",
    intensity: {
      zh: ["轻微蔑视", "蔑视", "强烈蔑视"],
      en: ["Mild Contempt", "Contempt", "Strong Contempt"]
    }
  },
  "渴望": {
    en: "Craving",
    zh: "渴望",
    icon: "🤤",
    intensity: {
      zh: ["轻微渴望", "渴望", "强烈渴望"],
      en: ["Mild Craving", "Craving", "Strong Craving"]
    }
  },
  "失望": {
    en: "Disappointment",
    zh: "失望",
    icon: "😞",
    intensity: {
      zh: ["轻微失望", "失望", "深深失望"],
      en: ["Mild Disappointment", "Disappointment", "Deep Disappointment"]
    }
  },
  "厌恶": {
    en: "Disgust",
    zh: "厌恶",
    icon: "🤢",
    intensity: {
      zh: ["轻微厌恶", "厌恶", "强烈厌恶"],
      en: ["Mild Disgust", "Disgust", "Strong Disgust"]
    }
  },
  "同情": {
    en: "Empathic Pain",
    zh: "同情",
    icon: "😢",
    intensity: {
      zh: ["轻微同情", "同情", "深切同情"],
      en: ["Mild Empathy", "Empathy", "Deep Empathy"]
    }
  },
  "入迷": {
    en: "Entrancement",
    zh: "入迷",
    icon: "😍",
    intensity: {
      zh: ["有点着迷", "入迷", "深深着迷"],
      en: ["Slightly Entranced", "Entranced", "Deeply Entranced"]
    }
  },
  "嫉妒": {
    en: "Envy",
    zh: "嫉妒",
    icon: "😒",
    intensity: {
      zh: ["轻微嫉妒", "嫉妒", "强烈嫉妒"],
      en: ["Mild Envy", "Envy", "Strong Envy"]
    }
  },
  "兴奋": {
    en: "Excitement",
    zh: "兴奋",
    icon: "🤩",
    intensity: {
      zh: ["有点兴奋", "兴奋", "极度兴奋"],
      en: ["Slightly Excited", "Excited", "Extremely Excited"]
    }
  },
  "恐惧": {
    en: "Fear",
    zh: "恐惧",
    icon: "😨",
    intensity: {
      zh: ["轻微恐惧", "恐惧", "恐慌"],
      en: ["Mild Fear", "Fear", "Terror"]
    }
  },
  "内疚": {
    en: "Guilt",
    zh: "内疚",
    icon: "😔",
    intensity: {
      zh: ["轻微内疚", "内疚", "深深内疚"],
      en: ["Mild Guilt", "Guilt", "Deep Guilt"]
    }
  },
  "恐怖": {
    en: "Horror",
    zh: "恐怖",
    icon: "😱",
    intensity: {
      zh: ["轻微恐怖", "恐怖", "极度恐怖"],
      en: ["Mild Horror", "Horror", "Extreme Horror"]
    }
  },
  "兴趣": {
    en: "Interest",
    zh: "兴趣",
    icon: "🤔",
    intensity: {
      zh: ["有点兴趣", "兴趣", "浓厚兴趣"],
      en: ["Slight Interest", "Interest", "Strong Interest"]
    }
  },
  "快乐": {
    en: "Joy",
    zh: "快乐",
    icon: "😊",
    intensity: {
      zh: ["轻微快乐", "快乐", "极度快乐"],
      en: ["Mild Joy", "Joy", "Extreme Joy"]
    }
  },
  "怀旧": {
    en: "Nostalgia",
    zh: "怀旧",
    icon: "🥺",
    intensity: {
      zh: ["轻微怀旧", "怀旧", "深深怀旧"],
      en: ["Mild Nostalgia", "Nostalgia", "Deep Nostalgia"]
    }
  },
  "浪漫": {
    en: "Romance",
    zh: "浪漫",
    icon: "😍",
    intensity: {
      zh: ["轻微浪漫", "浪漫", "深深浪漫"],
      en: ["Mild Romance", "Romance", "Deep Romance"]
    }
  },
  "悲伤": {
    en: "Sadness",
    zh: "悲伤",
    icon: "😢",
    intensity: {
      zh: ["轻微悲伤", "悲伤", "深深悲伤"],
      en: ["Mild Sadness", "Sadness", "Deep Sadness"]
    }
  }
};

// 界面文本的中英文对照
const UI_TRANSLATIONS = {
  zh: {
    // 应用标题
    "app.title": "EmoHeal",
    "app.subtitle": "情感疗愈分析系统",
    
    // 输入区域
    "input.title": "表达你的感受",
    "input.description": "分享你当前的心情、想法或感受，我们将为你提供专业的情感分析和疗愈建议",
    "input.placeholder": "请告诉我你现在的感受...比如：我今天感到很焦虑，工作压力很大，难以放松...",
    "input.analyze": "开始分析",
    "input.clear": "清空",
    
    // 结果展示
    "results.primary.title": "主要情感",
    "results.top3.title": "情感成分分析",
    "results.balance.title": "情感平衡",
    "results.balance.positive": "积极情感",
    "results.balance.negative": "消极情感",
    "results.balance.neutral": "中性情感",
    "results.summary.title": "情感分析摘要",
    "results.summary.intensity": "总强度",
    "results.summary.active": "活跃情感",
    "results.summary.dominance": "情感主导性",
    "results.healing.title": "个性化疗愈建议",
    "results.healing.music": "音乐疗愈",
    "results.healing.mindfulness": "冥想练习",
    "results.healing.reflection": "情感反思",
    
    // 加载和错误状态
    "loading.analyzing": "正在分析你的情感...",
    "error.retry": "重新分析",
    
    // 页脚
    "footer.powered": "技术支持",
    "footer.system": "情感疗愈系统",
    "footer.note": "基于Cowen & Keltner 27维情感模型和XLM-RoBERTa多语言分析",
    
    // 情感强度描述
    "intensity.low": "轻微",
    "intensity.medium": "中等", 
    "intensity.high": "强烈",
    
    // 情感分类描述
    "category.positive": "积极情感",
    "category.negative": "消极情感", 
    "category.neutral": "中性情感",
    
    // 疗愈建议文本
    "healing.music.anxiety": "基于你的焦虑情绪，推荐聆听舒缓的古典音乐或自然声音来平静心灵",
    "healing.music.sadness": "当感到悲伤时，轻柔的器乐曲可以帮助你处理和释放这些情绪",
    "healing.music.anger": "愤怒时可以先听一些节奏缓慢的音乐来平复情绪，然后逐渐转向更平和的旋律",
    "healing.music.joy": "保持这种快乐的情绪！可以听一些轻快的音乐来延续这种积极状态",
    "healing.music.default": "根据你的情感状态，建议选择与当前心境相匹配的音乐来支持情绪调节",
    
    "healing.mindfulness.anxiety": "尝试4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒，重复5次",
    "healing.mindfulness.sadness": "进行慈爱冥想，对自己说：'愿我平安，愿我快乐，愿我远离痛苦'",
    "healing.mindfulness.anger": "练习身体扫描冥想，从头到脚感受身体的紧张并逐一放松",
    "healing.mindfulness.joy": "享受当下的正念练习，专注于此刻的美好感受，让它充满你的身心",
    "healing.mindfulness.default": "花5-10分钟进行深呼吸练习，专注于呼吸的自然节奏",
    
    "healing.reflection.anxiety": "思考：什么具体的情况引发了我的焦虑？我可以采取哪些实际步骤来应对？",
    "healing.reflection.sadness": "允许自己感受悲伤，同时反思这种情绪想要告诉你什么重要信息",
    "healing.reflection.anger": "问自己：这种愤怒背后隐藏着什么需求或价值观没有被满足？",
    "healing.reflection.joy": "记住此刻的感受，思考是什么带来了这种快乐，如何在未来重现这种体验",
    "healing.reflection.default": "花一些时间静心思考，观察自己的情绪而不加以评判"
  },
  
  en: {
    // App title
    "app.title": "EmoHeal", 
    "app.subtitle": "Emotional Healing Analysis System",
    
    // Input section
    "input.title": "Express Your Feelings",
    "input.description": "Share your current mood, thoughts, or feelings, and we'll provide professional emotional analysis and healing recommendations",
    "input.placeholder": "Please tell me how you're feeling right now... For example: I feel very anxious today, work stress is overwhelming, and I can't relax...",
    "input.analyze": "Start Analysis",
    "input.clear": "Clear",
    
    // Results section
    "results.primary.title": "Primary Emotion",
    "results.top3.title": "Emotion Component Analysis", 
    "results.balance.title": "Emotional Balance",
    "results.balance.positive": "Positive Emotions",
    "results.balance.negative": "Negative Emotions",
    "results.balance.neutral": "Neutral Emotions",
    "results.summary.title": "Emotional Analysis Summary",
    "results.summary.intensity": "Total Intensity",
    "results.summary.active": "Active Emotions",
    "results.summary.dominance": "Emotional Dominance",
    "results.healing.title": "Personalized Healing Suggestions",
    "results.healing.music": "Music Therapy",
    "results.healing.mindfulness": "Mindfulness Practice", 
    "results.healing.reflection": "Emotional Reflection",
    
    // Loading and error states
    "loading.analyzing": "Analyzing your emotions...",
    "error.retry": "Retry Analysis",
    
    // Footer
    "footer.powered": "Powered by",
    "footer.system": "Emotional Healing System", 
    "footer.note": "Based on Cowen & Keltner 27-dimensional emotion model and XLM-RoBERTa multilingual analysis",
    
    // Intensity descriptions
    "intensity.low": "Mild",
    "intensity.medium": "Moderate",
    "intensity.high": "Strong",
    
    // Emotion category descriptions
    "category.positive": "Positive Emotions",
    "category.negative": "Negative Emotions",
    "category.neutral": "Neutral Emotions",
    
    // Healing suggestions
    "healing.music.anxiety": "Based on your anxiety, we recommend listening to soothing classical music or nature sounds to calm your mind",
    "healing.music.sadness": "When feeling sad, gentle instrumental music can help you process and release these emotions",
    "healing.music.anger": "When angry, start with slow-tempo music to calm emotions, then gradually transition to more peaceful melodies",
    "healing.music.joy": "Maintain this joyful mood! Listen to upbeat music to extend this positive state",
    "healing.music.default": "Based on your emotional state, choose music that matches your current mood to support emotional regulation",
    
    "healing.mindfulness.anxiety": "Try the 4-7-8 breathing technique: inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds, repeat 5 times",
    "healing.mindfulness.sadness": "Practice loving-kindness meditation, say to yourself: 'May I be safe, may I be happy, may I be free from suffering'",
    "healing.mindfulness.anger": "Practice body scan meditation, feel tension from head to toe and release each area gradually",
    "healing.mindfulness.joy": "Enjoy mindful presence, focus on the beautiful feelings of this moment, let it fill your mind and body",
    "healing.mindfulness.default": "Spend 5-10 minutes on deep breathing exercises, focusing on the natural rhythm of your breath",
    
    "healing.reflection.anxiety": "Reflect: What specific situation triggered my anxiety? What practical steps can I take to cope?",
    "healing.reflection.sadness": "Allow yourself to feel sad, while reflecting on what important message this emotion wants to tell you",
    "healing.reflection.anger": "Ask yourself: What needs or values behind this anger are not being met?",
    "healing.reflection.joy": "Remember this feeling, think about what brought this happiness, how to recreate this experience in the future",
    "healing.reflection.default": "Take some time to reflect quietly, observe your emotions without judgment"
  }
};

// 当前语言状态
let currentLanguage = 'zh';

/**
 * 初始化国际化系统
 */
function initI18n() {
  // 从localStorage获取保存的语言设置
  const savedLanguage = localStorage.getItem('emoheal-language');
  if (savedLanguage && ['zh', 'en'].includes(savedLanguage)) {
    currentLanguage = savedLanguage;
  } else {
    // 根据浏览器语言自动检测
    const browserLang = navigator.language || navigator.userLanguage;
    currentLanguage = browserLang.startsWith('zh') ? 'zh' : 'en';
  }
  
  // 应用语言设置
  applyLanguage(currentLanguage);
  
  // 更新语言切换按钮
  updateLanguageToggle();
}

/**
 * 应用语言设置到整个页面
 * @param {string} lang - 语言代码 ('zh' 或 'en')
 */
function applyLanguage(lang) {
  currentLanguage = lang;
  
  // 更新HTML lang属性
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
  
  // 更新所有带有 data-i18n 属性的元素
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getTranslation(key, lang);
    if (translation) {
      element.textContent = translation;
    }
  });
  
  // 更新所有带有 data-i18n-placeholder 属性的元素
  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    const translation = getTranslation(key, lang);
    if (translation) {
      element.placeholder = translation;
    }
  });
  
  // 保存语言设置
  localStorage.setItem('emoheal-language', lang);
}

/**
 * 获取翻译文本
 * @param {string} key - 翻译键
 * @param {string} lang - 语言代码
 * @returns {string} 翻译后的文本
 */
function getTranslation(key, lang = currentLanguage) {
  const translations = UI_TRANSLATIONS[lang];
  return translations && translations[key] ? translations[key] : key;
}

/**
 * 获取情感名称的翻译
 * @param {string} emotionZh - 中文情感名称
 * @param {string} lang - 目标语言
 * @returns {string} 翻译后的情感名称
 */
function getEmotionName(emotionZh, lang = currentLanguage) {
  const emotion = EMOTIONS_I18N[emotionZh];
  return emotion ? emotion[lang] : emotionZh;
}

/**
 * 获取情感图标
 * @param {string} emotionZh - 中文情感名称
 * @returns {string} 对应的emoji图标
 */
function getEmotionIcon(emotionZh) {
  const emotion = EMOTIONS_I18N[emotionZh];
  return emotion ? emotion.icon : '😐';
}

/**
 * 获取情感强度描述
 * @param {string} emotionZh - 中文情感名称
 * @param {number} intensity - 强度值 (0-1)
 * @param {string} lang - 语言代码
 * @returns {string} 强度描述
 */
function getEmotionIntensityDescription(emotionZh, intensity, lang = currentLanguage) {
  const emotion = EMOTIONS_I18N[emotionZh];
  if (!emotion || !emotion.intensity) {
    // 使用通用强度描述
    if (intensity < 0.3) return getTranslation('intensity.low', lang);
    if (intensity < 0.7) return getTranslation('intensity.medium', lang);
    return getTranslation('intensity.high', lang);
  }
  
  const descriptions = emotion.intensity[lang];
  if (intensity < 0.3) return descriptions[0];
  if (intensity < 0.7) return descriptions[1]; 
  return descriptions[2];
}

/**
 * 切换语言
 */
function toggleLanguage() {
  const newLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
  applyLanguage(newLanguage);
  updateLanguageToggle();
  
  // 触发语言切换事件，让其他模块知道语言已改变
  window.dispatchEvent(new CustomEvent('languageChanged', {
    detail: { language: newLanguage }
  }));
}

/**
 * 更新语言切换按钮的显示状态
 */
function updateLanguageToggle() {
  const langToggle = document.getElementById('langToggle');
  if (!langToggle) return;
  
  const currentSpan = langToggle.querySelector('.lang-current');
  const altSpan = langToggle.querySelector('.lang-alt');
  
  if (currentLanguage === 'zh') {
    currentSpan.textContent = '中';
    altSpan.textContent = 'EN';
    langToggle.setAttribute('aria-label', '切换到英文');
  } else {
    currentSpan.textContent = 'EN';
    altSpan.textContent = '中';
    langToggle.setAttribute('aria-label', 'Switch to Chinese');
  }
}

/**
 * 获取当前语言
 * @returns {string} 当前语言代码
 */
function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * 获取疗愈建议文本
 * @param {string} category - 建议类别 ('music', 'mindfulness', 'reflection')
 * @param {string} primaryEmotion - 主要情感
 * @param {string} lang - 语言代码
 * @returns {string} 疗愈建议文本
 */
function getHealingSuggestion(category, primaryEmotion, lang = currentLanguage) {
  // 根据主要情感确定建议类型
  let emotionKey = 'default';
  if (['愤怒'].includes(primaryEmotion)) {
    emotionKey = 'anger';
  } else if (['焦虑', '恐惧', '恐怖'].includes(primaryEmotion)) {
    emotionKey = 'anxiety';
  } else if (['悲伤', '失望', '内疚'].includes(primaryEmotion)) {
    emotionKey = 'sadness';
  } else if (['快乐', '兴奋', '娱乐'].includes(primaryEmotion)) {
    emotionKey = 'joy';
  }
  
  const key = `healing.${category}.${emotionKey}`;
  return getTranslation(key, lang);
}

// 导出给其他模块使用
window.EmoHealI18n = {
  init: initI18n,
  apply: applyLanguage,
  toggle: toggleLanguage,
  getTranslation,
  getEmotionName,
  getEmotionIcon,
  getEmotionIntensityDescription,
  getCurrentLanguage,
  getHealingSuggestion,
  EMOTIONS_I18N,
  UI_TRANSLATIONS
};