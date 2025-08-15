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
                    result: { 
                        analysisResult: { 
                            title: "深度悲伤", 
                            description: "我们感受到了您内心深处的悲伤，它似乎还交织着对过往的思念...",
                            topEmotions: [
                                {"name": "悲伤", "score": 0.85},
                                {"name": "思念", "score": 0.60},
                                {"name": "疲倦", "score": 0.40},
                                {"name": "平静", "score": 0.30},
                                {"name": "孤独", "score": 0.25},
                                {"name": "失落", "score": 0.20},
                                {"name": "无助", "score": 0.15}
                            ]
                        } 
                    }
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
let emotionChart = null; // 情绪雷达图实例
let particlesInstance = null; // 粒子效果实例

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

// 状态处理器 (升级版)
function handleState(data) {
    if (data.status === 'AC_COMPLETE') {
        clearInterval(pollingIntervalId); // 暂停轮询

        const container = document.getElementById('emotion-core-container');
        const titleEl = document.getElementById('emotion-title');
        const descriptionEl = document.getElementById('emotion-description');

        // 准备工作：清空旧内容并切换舞台
        container.innerHTML = '';
        titleEl.innerText = '';
        descriptionEl.innerText = '';
        // 移除可能存在的旧抚慰文字
        const oldComfortText = document.getElementById('comfort-text');
        if(oldComfortText) oldComfortText.remove();

        switchToStage('step-emotion-analysis');

        // ================== 全新三阶段情绪解码动画 ==================
        
        // --- 阶段一: AI分析启动 (持续约 3.5 秒) ---
        const analyzerContainer = document.createElement('div');
        analyzerContainer.className = 'analyzer-text-container';
        container.appendChild(analyzerContainer);

        const analysisSteps = [
            "连接情绪神经网络...",
            "解析27维情绪向量...",
            "正在构建您的情绪图谱..."
        ];
        let stepIndex = 0;
        analyzerContainer.innerHTML = `<span class="analyzer-text">${analysisSteps[stepIndex]}</span>`;
        const typingInterval = setInterval(() => {
            stepIndex++;
            if (stepIndex < analysisSteps.length) {
                analyzerContainer.innerHTML = `<span class="analyzer-text">${analysisSteps[stepIndex]}</span>`;
            } else {
                clearInterval(typingInterval);
            }
        }, 1200);


        // --- 阶段二: 情绪图谱构建 (在阶段一结束后开始) ---
        setTimeout(() => {
            // 清理阶段一内容，准备渲染图谱
            container.innerHTML = '';

            const SWEEP_DURATION = 3000; // 雷达扫描一圈3秒

            // 渲染雷达背景和扫描指针
            const radarGrid = document.createElement('div');
            radarGrid.className = 'radar-grid';
            container.appendChild(radarGrid);

            const radarSweep = document.createElement('div');
            radarSweep.className = 'radar-sweep';
            radarSweep.style.animation = `radar-sweep-anim ${SWEEP_DURATION}ms linear 1`;
            container.appendChild(radarSweep);

            // 渲染情绪核心
            const core = document.createElement('div');
            core.className = 'emotion-core';
            container.appendChild(core);

            // 准备渲染情绪卫星
            const emotions = data.result.analysisResult.topEmotions;
            const MIN_RADIUS = 30;  // 最近半径
            const MAX_RADIUS = 115; // 最远半径

            emotions.slice(1).forEach((emo, index) => {
                const score = emo.score || 0;
                
                // ★ 核心改进: 半径由情绪分数决定
                const finalRadius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * score;
                
                const angleRad = (index / (emotions.length - 1)) * 2 * Math.PI - (Math.PI / 2);
                const angleDeg = (angleRad * 180 / Math.PI) + 90;
                
                const x = Math.cos(angleRad) * finalRadius;
                const y = Math.sin(angleRad) * finalRadius;
                const size = 5 + score * 10; // 大小也稍微和分数关联

                // 创建能量束
                const tracer = document.createElement('div');
                tracer.className = 'tracer-line';
                tracer.style.height = `${finalRadius}px`;
                tracer.style.transform = `rotate(${angleDeg - 90}deg)`;

                // 计算出现延迟
                const appearDelay = (angleDeg / 360) * SWEEP_DURATION;
                tracer.style.animation = `flash-tracer 0.6s ease-out ${appearDelay}ms forwards`;
                
                // 创建卫星容器
                const satelliteContainer = document.createElement('div');
                satelliteContainer.className = 'emotion-satellite-container';
                satelliteContainer.style.left = `calc(50% + ${x}px)`;
                satelliteContainer.style.top = `calc(50% + ${y}px)`;
                
                const satellite = document.createElement('div');
                satellite.className = 'emotion-satellite';
                satellite.style.width = `${size}px`;
                satellite.style.height = `${size}px`;
                satellite.style.animation = `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${appearDelay + 100}ms forwards`;
                
                // ★ 核心改进: 标签显示百分比
                const label = document.createElement('span');
                label.className = 'satellite-label';
                label.innerText = `${emo.name} ${Math.round(score * 100)}%`;
                label.style.animation = `fadeInLabel 0.5s ease-out ${appearDelay + 300}ms forwards`;

                container.appendChild(tracer);
                satelliteContainer.appendChild(satellite);
                satelliteContainer.appendChild(label);
                container.appendChild(satelliteContainer);
            });

            // --- 阶段三: 共情与抚慰 (在阶段二结束后开始) ---
            setTimeout(() => {
                titleEl.innerText = data.result.analysisResult.title;
                descriptionEl.innerText = data.result.analysisResult.description;
                titleEl.style.animation = 'fadeIn 0.5s forwards';
                descriptionEl.style.animation = 'fadeIn 0.5s 0.2s forwards';
                
                // ★ 新增元素: 抚慰金句
                const comfortText = document.createElement('p');
                comfortText.id = 'comfort-text';
                comfortText.className = 'healing-comfort-text';
                comfortText.innerText = "别担心，你的所有感受，都值得被看见。";
                descriptionEl.parentNode.appendChild(comfortText);
                comfortText.style.animation = 'fadeIn 1s 1s forwards';

            }, SWEEP_DURATION + 500);

            // 等待所有动画播放完毕后，继续轮询
            setTimeout(startPolling, SWEEP_DURATION + 5000);

        }, 3500); // 阶段一总时长

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

    // ★★★ 新增：销毁情绪雷达图实例 ★★★
    if (emotionChart) {
        emotionChart.destroy();
        emotionChart = null;
    }
    
    // ★★★ 新增：清理粒子效果 ★★★
    if (particlesInstance) {
        particlesInstance.destroy();
        particlesInstance = null;
    }

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

// ======================== 粒子效果初始化函数 ========================
async function initializeParticles() {
    // 清理旧的粒子实例
    if (particlesInstance) {
        particlesInstance.destroy();
        particlesInstance = null;
    }
    
    try {
        particlesInstance = await tsParticles.load("particle-canvas", {
            fpsLimit: 60,
            particles: {
                number: { 
                    value: 80, 
                    density: { 
                        enable: true, 
                        value_area: 800 
                    } 
                },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { 
                    value: 0.5, 
                    random: true 
                },
                size: { 
                    value: 1, 
                    random: { 
                        enable: true, 
                        minimumValue: 0.5 
                    } 
                },
                move: {
                    enable: true,
                    speed: 0.5,
                    direction: "none",
                    outModes: {
                        default: "out"
                    }
                },
                links: {
                    enable: true,
                    distance: 150,
                    color: "#ffffff",
                    opacity: 0.4,
                    width: 1
                }
            },
            interactivity: {
                events: {
                    onHover: { 
                        enable: true, 
                        mode: "grab" 
                    },
                    onClick: { 
                        enable: true, 
                        mode: "push" 
                    }
                },
                modes: {
                    grab: { 
                        distance: 140, 
                        links: { 
                            opacity: 1 
                        } 
                    },
                    push: { 
                        quantity: 4 
                    }
                }
            },
            detectRetina: true
        });
        
        console.log('✨ 粒子效果初始化成功');
    } catch (error) {
        console.error('粒子效果初始化失败:', error);
    }
}
// =================================================================

// ========================================================================