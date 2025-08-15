// ======================== 语言切换逻辑 ========================
document.addEventListener('DOMContentLoaded', () => {
    let currentLang = 'zh'; // 默认语言为中文
    const langSwitcher = document.getElementById('language-switcher');
    
    // 如果找不到切换按钮，就直接返回，避免报错
    if (!langSwitcher) return;

    function setLanguage(lang) {
        document.documentElement.lang = lang; // 设置页面语言属性
        currentLang = lang;
        
        // 遍历所有带 data-lang- 属性的元素
        document.querySelectorAll('[data-lang-zh], [data-lang-en]').forEach(el => {
            const text = el.getAttribute(`data-lang-${lang}`);
            if (text) {
                el.innerText = text;
            }
        });
        
        // 特殊处理 placeholder
        document.querySelectorAll('[data-lang-zh-placeholder], [data-lang-en-placeholder]').forEach(el => {
            const placeholder = el.getAttribute(`data-lang-${lang}-placeholder`);
            if (placeholder) {
                el.placeholder = placeholder;
            }
        });
        
        // 更新切换按钮的文本
        const switcherSpan = langSwitcher.querySelector('span');
        if (switcherSpan) {
            switcherSpan.innerText = lang === 'zh' ? 'English' : '中文';
        }
    }

    langSwitcher.addEventListener('click', (e) => {
        e.preventDefault(); // 阻止链接默认行为
        const newLang = currentLang === 'zh' ? 'en' : 'zh';
        setLanguage(newLang);
    });

    // 初始化页面语言
    setLanguage(currentLang);
});

// ======================== 重新开始功能 ========================
document.addEventListener('DOMContentLoaded', () => {
    const restartButton = document.getElementById('restart-button');
    
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            // 重置整个应用状态
            resetApplication();
        });
    }
});

function resetApplication() {
    // 1. 清空用户输入
    const userInput = document.getElementById('user-input');
    if (userInput) {
        userInput.value = '';
    }
    
    // 2. 隐藏所有步骤卡片
    const stepCards = document.querySelectorAll('.stage-card');
    stepCards.forEach(card => {
        card.classList.add('d-none');
        card.classList.remove('fade-in');
    });
    
    // 3. 显示输入步骤
    const stepInput = document.getElementById('step-input');
    if (stepInput) {
        stepInput.classList.remove('d-none');
        stepInput.classList.add('fade-in');
    }
    
    // 4. 重置按钮状态
    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = `
            <i class="fas fa-heart-pulse me-2"></i>
            ${document.documentElement.lang === 'zh' ? '开启疗愈之旅' : 'Start Healing Journey'}
        `;
    }
    
    // 5. 隐藏重新开始按钮
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.classList.add('d-none');
    }
    
    // 6. 停止视频播放
    const healingVideo = document.getElementById('healing-video');
    if (healingVideo) {
        healingVideo.pause();
        healingVideo.currentTime = 0;
        healingVideo.src = '';
    }
    
    // 7. 清除进度条动画
    const progressFill = document.querySelector('.healing-progress-fill');
    if (progressFill) {
        progressFill.style.animation = 'none';
        progressFill.style.width = '0%';
    }
    
    // 8. 重新聚焦到输入框
    setTimeout(() => {
        if (userInput) {
            userInput.focus();
        }
    }, 300);
    
    // 9. 滚动到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    console.log('应用已重置，准备新的疗愈之旅');
}
// ==============================================================


// ======================== 模拟后端API (严格遵守合同V1.2) ========================
const mockApi = {
    _mockDatabase: {}, // 模拟后端的 tasks_status

    create_session: async function(text) {
        console.log("【模拟后端】收到请求，文本:", text);
        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
        const sessionId = "mock-session-" + Date.now();
        this._mockDatabase[sessionId] = { step: 0 }; // 初始化任务步骤
        console.log("【模拟后端】创建任务成功，Session ID:", sessionId);
        return { sessionId: sessionId };
    },

    session_status: async function(sessionId) {
        console.log("【模拟后端】查询状态，Session ID:", sessionId);
        if (!this._mockDatabase[sessionId]) return { status: 'ERROR', message: 'Session not found' };

        const currentState = this._mockDatabase[sessionId];
        currentState.step++;

        let response = {};
        switch (currentState.step) {
            case 1:
                response = {
                    status: 'AC_COMPLETE',
                    result: { analysisResult: { title: "深度悲伤", description: "系统捕捉到您内心的孤独与失落感，正在为您寻找共鸣与慰藉。" } }
                };
                break;
            case 2:
                response = {
                    status: 'KG_COMPLETE',
                    result: { 
                        analysisResult: { title: "深度悲伤", description: "系统捕捉到您内心的孤独与失落感，正在为您寻找共鸣与慰藉。" },
                        kgResult: { title: "疗愈处方已生成", details: ["音乐主题: 希望与慰藉", "建议节奏: 60-80 BPM (慢板)", "调式: C大调 (温暖、稳定)"] } 
                    }
                };
                break;
            case 3:
                 response = {
                    status: 'ISO_PRINCIPLE_READY',
                    result: { 
                        analysisResult: { /* (数据省略以保持简洁) */ }, 
                        kgResult: { /* (数据省略) */ },
                        isoPrinciple: { title: "正在应用：同质原理 (ISO Principle)", description: "“同质原理”是音乐治疗的核心理念之一，意指用与您当前情绪状态相似的音乐来引导共鸣，从而达到宣泄、接受并最终转化的疗愈效果。" }
                    }
                 };
                 break;
            case 4:
                response = {
                    status: 'VIDEO_READY',
                    result: { 
                        analysisResult: { /* (数据省略) */ }, 
                        kgResult: { /* (数据省略) */ }, 
                        isoPrinciple: { /* (数据省略) */ },
                        video: { url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm', title: '《雨后的海岸线》' }
                    }
                };
                break;
            default:
                response = { status: 'PENDING', result: {} };
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟每次查询需要1.5秒
        console.log("【模拟后端】返回状态:", response);
        return response;
    }
};
// ========================================================================


// ======================== 全新！前端核心逻辑 V2 (切换版) ========================
let sessionId = null;
let pollingIntervalId = null;
let currentStageId = 'step-input'; // 记录当前显示的舞台ID

// DOM元素获取
const submitButton = document.getElementById('submit-button');
const userInput = document.getElementById('user-input');
const restartButton = document.getElementById('restart-button');

// 将所有舞台卡片存入一个对象，方便管理
const stages = {
    'step-input': document.getElementById('step-input'),
    'step-emotion-analysis': document.getElementById('step-emotion-analysis'),
    'step-kg-result': document.getElementById('step-kg-result'),
    'step-iso-principle': document.getElementById('step-iso-principle'),
    'step-video-player': document.getElementById('step-video-player'),
    'step-conclusion': document.getElementById('step-conclusion'), // 新增这一行
};

// 主提交函数
submitButton.addEventListener('click', async () => {
    const text = userInput.value;
    if (!text) { 
        alert(document.documentElement.lang === 'zh' ? "请输入你的感受！" : "Please enter how you feel!");
        return; 
    }
    
    submitButton.disabled = true;
    const analyzingText = document.documentElement.lang === 'zh' ? '分析中...' : 'Analyzing...';
    submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${analyzingText}`;
    
    // 如果当前不是输入界面，先重置回输入界面
    if (currentStageId !== 'step-input') {
        await resetUI();
    }
    
    // 替换第一处
    const createResponse = await fetch('http://127.0.0.1:5001/api/create_session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
    });
    const createData = await createResponse.json();
    
    sessionId = createData.sessionId;
    if (sessionId) startPolling();
});

// 轮询函数
function startPolling() {
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    pollingIntervalId = setInterval(async () => {
        
        // 替换第二处
        const statusResponse = await fetch(`http://127.0.0.1:5001/api/session_status?id=${sessionId}`);
        const statusData = await statusResponse.json();
        
        handleState(statusData);
    }, 2000); // 每2秒查询一次
}

// 状态处理器
function handleState(data) {
    if (data.status === 'AC_COMPLETE') {
        clearInterval(pollingIntervalId);
        const el = stages['step-emotion-analysis'];
        el.querySelector('#emotion-title').innerText = data.result.analysisResult.title;
        el.querySelector('#emotion-description').innerText = data.result.analysisResult.description;
        
        switchToStage('step-emotion-analysis');
        setTimeout(startPolling, 3500);
    } 
    else if (data.status === 'KG_COMPLETE') {
        clearInterval(pollingIntervalId);
        const el = stages['step-kg-result'];
        el.querySelector('#kg-title').innerText = data.result.kgResult.title;
        const detailsContainer = el.querySelector('#kg-details');
        detailsContainer.innerHTML = ''; // 清空旧内容
        data.result.kgResult.details.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item border-0';
            li.innerText = `✅ ${item}`;
            li.style.animationDelay = `${index * 0.1}s`; //  staggered animation
            detailsContainer.appendChild(li);
        });

        switchToStage('step-kg-result');
        setTimeout(startPolling, 4000);
    }
    else if (data.status === 'ISO_PRINCIPLE_READY') {
        clearInterval(pollingIntervalId);
        const el = stages['step-iso-principle'];
        el.querySelector('#iso-title').innerText = data.result.isoPrinciple.title;
        el.querySelector('#iso-description').innerText = data.result.isoPrinciple.description;

        switchToStage('step-iso-principle');
        setTimeout(startPolling, 5000);
    }
    else if (data.status === 'VIDEO_READY') {
        clearInterval(pollingIntervalId);
        const el = stages['step-video-player'];
        el.querySelector('#video-title').innerText = data.result.video.title;
        el.querySelector('#healing-video').src = data.result.video.url;

        switchToStage('step-video-player');
        
        // 显示重新开始按钮
        setTimeout(() => {
            const restartButton = document.getElementById('restart-button');
            if (restartButton) {
                restartButton.classList.remove('d-none');
                restartButton.classList.add('fade-in');
            }
        }, 3000); // 3秒后显示重新开始按钮
    }
}

// UI核心切换函数
function switchToStage(nextStageId) {
    return new Promise(resolve => {
        const currentCard = stages[currentStageId];
        const nextCard = stages[nextStageId];

        if (currentCard) {
            currentCard.classList.add('fade-out');
            
            // 等待淡出动画结束
            setTimeout(() => {
                currentCard.classList.add('d-none');
                currentCard.classList.remove('fade-out');

                nextCard.classList.remove('d-none');
                // 触发淡入
                setTimeout(() => {
                    nextCard.classList.add('fade-in');
                    currentStageId = nextStageId;
                    resolve();
                }, 50);

            }, 600); // 必须大于或等于CSS中的动画时长
        }
    });
}

// 将所有内容重置回初始输入界面
async function resetUI() {
    // 隐藏所有非输入卡片
    for (const key in stages) {
        if (key !== 'step-input') {
            stages[key].classList.add('d-none');
            stages[key].classList.remove('fade-in');
        }
    }
    // 确保输入卡片是可见的
    stages['step-input'].classList.remove('d-none', 'fade-out', 'fade-in');
    currentStageId = 'step-input';

    // 重置视频播放器
    const videoPlayer = document.getElementById('healing-video');
    videoPlayer.src = "";
    videoPlayer.pause();
    return Promise.resolve();
}

// ======================== 重新开始按钮功能 ========================
restartButton.addEventListener('click', async () => {
    // 重置UI到初始状态
    await resetUI();
    
    // 清空输入框
    userInput.value = '';
    
    // 重置按钮状态
    const startJourneyText = document.documentElement.lang === 'zh' ? '开启疗愈之旅' : 'Start Healing Journey';
    submitButton.disabled = false;
    submitButton.innerHTML = `<i class="fas fa-heart-pulse me-2"></i> ${startJourneyText}`;
    
    // 停止任何进行中的轮询
    if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
    }
    
    // 重置会话ID
    sessionId = null;
    
    // 聚焦到输入框
    userInput.focus();
});

// ======================== 视频播放结束逻辑 ========================
const healingVideo = document.getElementById('healing-video');
healingVideo.addEventListener('ended', () => {
    console.log("视频播放结束，切换到最终选择界面。");
    // 切换到我们新增的"结束场景"
    switchToStage('step-conclusion');
});
// =================================================================

// ======================== 结束疗愈按钮功能 ========================
const endSessionButton = document.getElementById('end-session-button');
endSessionButton.addEventListener('click', () => {
    // 简单地将最后一个卡片淡出
    stages['step-conclusion'].classList.add('fade-out');
});
// =================================================================

// ========================================================================