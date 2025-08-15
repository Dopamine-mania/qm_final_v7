/**
 * EmoHeal UI交互处理
 * 处理用户界面的各种交互效果和动画
 */

// 交互配置
const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  SCROLL_OFFSET: 80,
  TYPING_DELAY: 50,
  FADE_DELAY: 100
};

/**
 * 初始化UI交互
 */
function initUIInteractions() {
  console.log('✨ 初始化UI交互效果');
  
  // 初始化各种交互效果
  initCardAnimations();
  initInputEnhancements();
  initScrollEffects();
  initTooltips();
  initProgressAnimations();
  initResponsiveAdaptation();
}

/**
 * 初始化卡片动画效果
 */
function initCardAnimations() {
  const cards = document.querySelectorAll('.card-base, .input-card, .primary-emotion-card');
  
  cards.forEach((card, index) => {
    // 添加入场动画
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    // 使用Intersection Observer实现滚动动画
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.transition = 'all 0.6s ease';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100); // 错开动画时间
          
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    observer.observe(card);
    
    // 添加悬停效果增强
    card.addEventListener('mouseenter', () => {
      if (!card.classList.contains('no-hover')) {
        card.style.transform = 'translateY(-4px) scale(1.01)';
        card.style.transition = 'all 0.3s ease';
      }
    });
    
    card.addEventListener('mouseleave', () => {
      if (!card.classList.contains('no-hover')) {
        card.style.transform = 'translateY(0) scale(1)';
      }
    });
  });
}

/**
 * 初始化输入框增强效果
 */
function initInputEnhancements() {
  const emotionInput = document.getElementById('emotionInput');
  if (!emotionInput) return;
  
  // 字符计数器
  const maxChars = 500;
  const counterElement = createCharCounter();
  emotionInput.parentNode.appendChild(counterElement);
  
  // 实时字符计数
  emotionInput.addEventListener('input', (e) => {
    const currentLength = e.target.value.length;
    updateCharCounter(counterElement, currentLength, maxChars);
    
    // 动态调整输入框高度
    adjustTextareaHeight(emotionInput);
  });
  
  // 输入框聚焦效果
  emotionInput.addEventListener('focus', () => {
    emotionInput.parentNode.classList.add('input-focused');
    addInputFocusEffect(emotionInput);
  });
  
  emotionInput.addEventListener('blur', () => {
    emotionInput.parentNode.classList.remove('input-focused');
    removeInputFocusEffect(emotionInput);
  });
  
  // 粘贴内容处理
  emotionInput.addEventListener('paste', (e) => {
    setTimeout(() => {
      adjustTextareaHeight(emotionInput);
      const currentLength = e.target.value.length;
      updateCharCounter(counterElement, currentLength, maxChars);
    }, 0);
  });
}

/**
 * 创建字符计数器
 * @returns {HTMLElement} 计数器元素
 */
function createCharCounter() {
  const counter = document.createElement('div');
  counter.className = 'char-counter';
  counter.style.cssText = `
    position: absolute;
    bottom: 8px;
    right: 12px;
    font-size: 0.75rem;
    color: #718096;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 6px;
    border-radius: 4px;
    backdrop-filter: blur(4px);
    transition: all 0.3s ease;
  `;
  return counter;
}

/**
 * 更新字符计数器
 * @param {HTMLElement} counterElement - 计数器元素
 * @param {number} currentLength - 当前字符数
 * @param {number} maxChars - 最大字符数
 */
function updateCharCounter(counterElement, currentLength, maxChars) {
  counterElement.textContent = `${currentLength}/${maxChars}`;
  
  // 根据字符数量调整颜色
  if (currentLength > maxChars * 0.9) {
    counterElement.style.color = '#ef4444';
  } else if (currentLength > maxChars * 0.7) {
    counterElement.style.color = '#f59e0b';
  } else {
    counterElement.style.color = '#718096';
  }
}

/**
 * 动态调整文本框高度
 * @param {HTMLElement} textarea - 文本框元素
 */
function adjustTextareaHeight(textarea) {
  textarea.style.height = 'auto';
  const newHeight = Math.min(textarea.scrollHeight, 200);
  textarea.style.height = newHeight + 'px';
}

/**
 * 添加输入框聚焦效果
 * @param {HTMLElement} input - 输入框元素
 */
function addInputFocusEffect(input) {
  // 创建聚焦光环效果
  const focusRing = document.createElement('div');
  focusRing.className = 'focus-ring';
  focusRing.style.cssText = `
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 14px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    z-index: -1;
    opacity: 0;
    animation: focusIn 0.3s ease forwards;
  `;
  
  // 添加CSS动画
  if (!document.getElementById('focus-animations')) {
    const style = document.createElement('style');
    style.id = 'focus-animations';
    style.textContent = `
      @keyframes focusIn {
        to {
          opacity: 0.1;
          transform: scale(1.01);
        }
      }
      @keyframes focusOut {
        to {
          opacity: 0;
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  input.parentNode.style.position = 'relative';
  input.parentNode.appendChild(focusRing);
  
  // 保存引用以便后续移除
  input._focusRing = focusRing;
}

/**
 * 移除输入框聚焦效果
 * @param {HTMLElement} input - 输入框元素
 */
function removeInputFocusEffect(input) {
  if (input._focusRing) {
    input._focusRing.style.animation = 'focusOut 0.3s ease forwards';
    setTimeout(() => {
      if (input._focusRing && input._focusRing.parentNode) {
        input._focusRing.parentNode.removeChild(input._focusRing);
      }
    }, 300);
  }
}

/**
 * 初始化滚动效果
 */
function initScrollEffects() {
  // 滚动到顶部按钮
  createScrollToTopButton();
  
  // 滚动时的视差效果
  window.addEventListener('scroll', throttle(handleScroll, 16));
  
  // 平滑滚动polyfill for older browsers
  if (!('scrollBehavior' in document.documentElement.style)) {
    loadSmoothScrollPolyfill();
  }
}

/**
 * 创建滚动到顶部按钮
 */
function createScrollToTopButton() {
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-to-top';
  scrollBtn.innerHTML = '↑';
  scrollBtn.setAttribute('aria-label', '回到顶部');
  scrollBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    z-index: 1000;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  `;
  
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // 滚动时显示/隐藏按钮
  window.addEventListener('scroll', throttle(() => {
    if (window.pageYOffset > 300) {
      scrollBtn.style.opacity = '1';
      scrollBtn.style.transform = 'translateY(0)';
    } else {
      scrollBtn.style.opacity = '0';
      scrollBtn.style.transform = 'translateY(20px)';
    }
  }, 100));
  
  document.body.appendChild(scrollBtn);
}

/**
 * 处理滚动事件
 */
function handleScroll() {
  const scrollY = window.pageYOffset;
  const navbar = document.querySelector('.navbar');
  
  // 导航栏滚动效果
  if (navbar) {
    if (scrollY > 100) {
      navbar.style.backdropFilter = 'blur(10px)';
      navbar.style.background = 'rgba(102, 126, 234, 0.95)';
    } else {
      navbar.style.backdropFilter = 'none';
      navbar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }
  
  // 视差效果
  const parallaxElements = document.querySelectorAll('.parallax');
  parallaxElements.forEach(element => {
    const speed = element.dataset.speed || 0.5;
    element.style.transform = `translateY(${scrollY * speed}px)`;
  });
}

/**
 * 初始化工具提示
 */
function initTooltips() {
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
  
  tooltipTriggers.forEach(trigger => {
    let tooltip = null;
    
    trigger.addEventListener('mouseenter', () => {
      const text = trigger.dataset.tooltip;
      tooltip = createTooltip(text);
      positionTooltip(tooltip, trigger);
      document.body.appendChild(tooltip);
      
      // 动画显示
      setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(-5px)';
      }, 10);
    });
    
    trigger.addEventListener('mouseleave', () => {
      if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(0)';
        setTimeout(() => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        }, 200);
      }
    });
  });
}

/**
 * 创建工具提示元素
 * @param {string} text - 提示文本
 * @returns {HTMLElement} 提示元素
 */
function createTooltip(text) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = text;
  tooltip.style.cssText = `
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.875rem;
    white-space: nowrap;
    z-index: 10000;
    opacity: 0;
    transform: translateY(0);
    transition: all 0.2s ease;
    pointer-events: none;
    backdrop-filter: blur(4px);
  `;
  return tooltip;
}

/**
 * 定位工具提示
 * @param {HTMLElement} tooltip - 提示元素
 * @param {HTMLElement} trigger - 触发元素
 */
function positionTooltip(tooltip, trigger) {
  const triggerRect = trigger.getBoundingClientRect();
  const scrollTop = window.pageYOffset;
  const scrollLeft = window.pageXOffset;
  
  tooltip.style.top = (triggerRect.bottom + scrollTop + 10) + 'px';
  tooltip.style.left = (triggerRect.left + scrollLeft + triggerRect.width / 2) + 'px';
  tooltip.style.transform = 'translateX(-50%)';
}

/**
 * 初始化进度动画
 */
function initProgressAnimations() {
  // 观察进度条元素
  const progressBars = document.querySelectorAll('.emotion-progress-fill');
  
  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateProgressBar(entry.target);
        progressObserver.unobserve(entry.target);
      }
    });
  });
  
  progressBars.forEach(bar => {
    progressObserver.observe(bar);
  });
}

/**
 * 动画化进度条
 * @param {HTMLElement} progressBar - 进度条元素
 */
function animateProgressBar(progressBar) {
  const targetWidth = progressBar.style.width;
  progressBar.style.width = '0%';
  
  setTimeout(() => {
    progressBar.style.transition = 'width 1s ease-in-out';
    progressBar.style.width = targetWidth;
  }, 100);
}

/**
 * 初始化响应式适配
 */
function initResponsiveAdaptation() {
  // 监听窗口大小变化
  window.addEventListener('resize', throttle(handleResize, 250));
  
  // 监听设备方向变化
  window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 500); // 延迟处理，等待布局完成
  });
  
  // 初始化响应式检查
  handleResize();
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  // 更新CSS自定义属性
  document.documentElement.style.setProperty('--viewport-width', viewport.width + 'px');
  document.documentElement.style.setProperty('--viewport-height', viewport.height + 'px');
  
  // 移动端适配
  if (viewport.width <= 768) {
    document.body.classList.add('mobile');
    adaptForMobile();
  } else {
    document.body.classList.remove('mobile');
    adaptForDesktop();
  }
  
  // 重新计算图表大小
  if (window.analysisChart) {
    window.analysisChart.resize();
  }
}

/**
 * 移动端适配
 */
function adaptForMobile() {
  // 调整输入框高度
  const emotionInput = document.getElementById('emotionInput');
  if (emotionInput) {
    emotionInput.style.minHeight = '100px';
  }
  
  // 调整按钮布局
  const inputActions = document.querySelector('.input-actions');
  if (inputActions) {
    inputActions.style.flexDirection = 'column';
    inputActions.style.alignItems = 'stretch';
  }
}

/**
 * 桌面端适配
 */
function adaptForDesktop() {
  // 恢复输入框高度
  const emotionInput = document.getElementById('emotionInput');
  if (emotionInput) {
    emotionInput.style.minHeight = '120px';
  }
  
  // 恢复按钮布局
  const inputActions = document.querySelector('.input-actions');
  if (inputActions) {
    inputActions.style.flexDirection = 'row';
    inputActions.style.alignItems = 'center';
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 节流限制时间
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * 加载平滑滚动polyfill
 */
function loadSmoothScrollPolyfill() {
  // 简单的平滑滚动实现
  const smoothScroll = (target, duration = 500) => {
    const targetPosition = target.offsetTop - UI_CONFIG.SCROLL_OFFSET;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
  };
  
  // 绑定到window对象
  window.smoothScrollTo = smoothScroll;
}

/**
 * 添加触摸手势支持
 */
function initTouchGestures() {
  let touchStartX = 0;
  let touchStartY = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  
  document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // 检测左右滑动手势
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // 向左滑动
        console.log('👈 向左滑动');
      } else {
        // 向右滑动
        console.log('👉 向右滑动');
      }
    }
    
    // 重置
    touchStartX = 0;
    touchStartY = 0;
  });
}

// 导出给其他模块使用
window.UIInteractions = {
  init: initUIInteractions,
  animateProgressBar,
  adjustTextareaHeight,
  throttle,
  debounce
};