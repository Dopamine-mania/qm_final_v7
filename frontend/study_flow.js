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

// 1. 【新增】放在文件顶部或全局区域的辅助函数
function formatVideoTitle(filename) {
    const parts = filename.split('_'); // 例: "56_3min_09" -> ["56", "3min", "09"]
    const mainTitle = "一段专属您的心灵之旅";
    let subtitle = "疗愈方案";

    if (parts.length >= 2) {
        // 从文件名提取数字部分，组成编号
        subtitle = `疗愈方案编号：EH-${parts[0]}-${parts[2] || '00'}`;
    }
    return { mainTitle, subtitle };
}

// 【新增】一个可复用的、用于平滑处理音量淡入淡出的函数
function fadeAudio(videoElement, endVolume, duration) {
    const startVolume = videoElement.volume;
    const intervalTime = 50; // 每50毫秒调整一次音量
    const stepCount = duration / intervalTime;
    const volumeStep = (endVolume - startVolume) / stepCount;

    // 如果音量已经达到目标值，则不执行
    if (startVolume === endVolume) return;

    const fade = setInterval(() => {
        let newVolume = videoElement.volume + volumeStep;

        // 确保音量不会超出 0.0 - 1.0 的范围
        if (volumeStep > 0) { // Fade in
            if (newVolume >= endVolume) {
                newVolume = endVolume;
                clearInterval(fade);
            }
        } else { // Fade out
            if (newVolume <= endVolume) {
                newVolume = endVolume;
                clearInterval(fade);
            }
        }
        
        videoElement.volume = newVolume;

    }, intervalTime);
}

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
        const titleEl = el.querySelector('#kg-title');
        const container = el.querySelector('#cognitive-forge-container');
        const detailsEl = el.querySelector('#kg-details');

        container.innerHTML = '';
        detailsEl.innerHTML = '';
        titleEl.innerText = '';
        // 确保移除可能存在的旧样式类
        container.className = 'cognitive-forge-container';

        // 获取分析结果数据 (注意：根据您的模拟API，数据结构路径可能是 result.kgResult)
        const resultData = data.result.kgResult;
        switchToStage('step-kg-result');

        // === 恢复原版动画：第一幕: GEMS 映射 (0.5秒后开始) ===
        setTimeout(() => {
            titleEl.innerText = 'GEMS 映射原理';
            container.innerHTML = ''; // 清空舞台
            // 注意：这里的路径需要匹配您真实API的数据结构
            const topEmotions = resultData.emotion_analysis?.top_emotions.slice(0, 5) || [];
            topEmotions.forEach((emo, index) => {
                const ray = document.createElement('div');
                ray.className = 'gems-ray';
                ray.style.setProperty('--i', index);
                ray.style.setProperty('--score', emo[1]); // emo[1] 是分数
                const label = document.createElement('span');
                label.innerText = `${emo[0]} ${(emo[1] * 100).toFixed(0)}%`; // emo[0] 是名称
                ray.appendChild(label);
                container.appendChild(ray);
            });
        }, 500);

        // === 恢复原版动画：第二幕: 知识图谱节点 (4秒后开始) ===
        setTimeout(() => {
            titleEl.innerText = '知识图谱提取';
            container.innerHTML = ''; // 再次清空舞台
            container.classList.add('show-kg-background');
            const musicParams = resultData.music_parameters || {};
            const paramsToShow = ['tempo', 'mode', 'dynamics', 'harmony', 'timbre', 'register', 'density'];
            paramsToShow.forEach((key, index) => {
                if (!musicParams[key]) return;
                const param = musicParams[key];
                const node = document.createElement('div');
                node.className = 'param-node';
                node.style.setProperty('--i', index);
                node.innerHTML = `
                    <div class="param-glyph" data-type="${key}" data-value="${param}">
                        ${key === 'register' ? '<span></span>' : ''} 
                    </div>
                    <div class="param-text">
                        <strong>${key.charAt(0).toUpperCase() + key.slice(1)}</strong>
                        <span>${param} ${key === 'tempo' ? 'BPM' : ''}</span>
                    </div>
                `;
                container.appendChild(node);
            });
        }, 4000);

        // === 恢复原版动画：第三幕: 最终疗愈处方 (10秒后出现) ===
        setTimeout(() => {
            titleEl.innerText = '疗愈处方已生成';
            container.innerHTML = ''; // 最终清空舞台
            container.classList.remove('show-kg-background');
            container.classList.add('forge-final-stage');

            const summaryData = resultData.therapy_recommendation || {};
            const summaryCard = document.createElement('div');
            summaryCard.className = 'therapy-summary-card';
            summaryCard.style.opacity = '0';
            summaryCard.innerHTML = `
                <h4>疗愈焦点: ${summaryData.primary_focus || '情绪平衡'}</h4>
                <p>${summaryData.therapy_approach || '音乐引导疗愈'}</p>
            `;
            container.appendChild(summaryCard);

        }, 10000);

        // 动画结束后，恢复轮询
        setTimeout(startPolling, 13500);
    }
    else if (data.status === 'ISO_PRINCIPLE_READY') {
        clearInterval(pollingIntervalId);

        // 1. 获取所有新舞台的元素
        const el = stages['step-iso-principle'];
        const container = el.querySelector('#iso-animation-container');
        const titleEl = el.querySelector('#iso-title');
        const userWave = el.querySelector('#user-wave-path');
        const musicWave = el.querySelector('#music-wave-path');
        const description = el.querySelector('#iso-description-stage');

        // 2. 定义波形的各种状态（SVG路径数据）
        const userEmotionState = "M0,50 Q125,85 250,50 T500,50"; // 较为波动的状态
        const initialMusicState = "M0,50 Q125,15 250,50 T500,50"; // 另一个不同的状态
        const calmState = "M0,50 Q125,40 250,50 T500,50";      // 平静和谐的状态

        // 3. 定义颜色
        const userColor = "var(--text-accent)"; // 科技蓝
        const healingColor = "#a78bfa"; // 疗愈紫

        // 4. 重置舞台到初始状态
        titleEl.innerText = data.result.isoPrinciple.title;
        container.className = 'iso-animation-container';
        description.className = 'iso-description-stage';
        userWave.setAttribute('d', userEmotionState);
        musicWave.setAttribute('d', initialMusicState);
        userWave.style.stroke = userColor;
        musicWave.style.stroke = userColor;
        
        switchToStage('step-iso-principle');

        // 5. 动画三幕剧开始
        // (总时长约 12 秒)

        // --- 第一幕：情绪镜象 (0.5秒后开始, 持续4秒) ---
        setTimeout(() => {
            container.classList.add('iso-enter'); // 波形入场
            description.innerText = "第一步：情绪匹配 (Matching)\nAI正应用同质原理，用与您情绪频率相似的音乐建立共鸣。";
            description.classList.add('iso-text-visible');

            // 音乐波形开始同步为用户情绪波形
            musicWave.setAttribute('d', userEmotionState);
        }, 500);

        // --- 第二幕：疗愈之桥 (4.5秒后开始, 持续4秒) ---
        setTimeout(() => {
            description.classList.remove('iso-text-visible'); // 旧文字淡出

            setTimeout(() => { // 等待旧文字淡出后，新文字再淡入
                 description.innerText = "第二步：同频引导 (Entrainment)\n在共鸣基础上，音乐将进行转化，温柔地引导您的情绪状态。";
                 description.classList.add('iso-text-visible');
            }, 600);
           
            // 波形开始向"平静"状态过渡，颜色也转变为"疗愈"色
            userWave.setAttribute('d', calmState);
            musicWave.setAttribute('d', calmState);
            musicWave.style.stroke = healingColor;
            userWave.style.stroke = healingColor;
        }, 4500);

        // --- 第三幕：抵达新境 (8.5秒后开始, 持续4秒) ---
        setTimeout(() => {
            description.classList.remove('iso-text-visible');

            setTimeout(() => {
                description.innerText = "ISO原理应用完成，即将为您呈现专属的疗愈音乐。";
                description.classList.add('iso-text-visible');
            }, 600);

            // 最终，所有元素一起淡出
            setTimeout(() => {
                 container.classList.add('iso-exit');
                 description.classList.remove('iso-text-visible');
            }, 2000); // 在文字显示2秒后开始淡出

        }, 8500);

        // --- 剧终，准备进入下一阶段 ---
        setTimeout(() => {
            startPolling();
        }, 12500); // 在总动画时间后，继续轮询
    }
    else if (data.status === 'VIDEO_READY') {
        clearInterval(pollingIntervalId);

        const el = stages['step-video-player'];
        const mainTitleEl = el.querySelector('#video-main-title');
        const subtitleEl = el.querySelector('#video-subtitle');
        const videoPlayer = el.querySelector('#healing-video');
        const overlay = el.querySelector('#healing-overlay');
        const overlayText = overlay.querySelector('.breathing-text');

        const { mainTitle, subtitle } = formatVideoTitle(data.result.video.title);
        mainTitleEl.innerText = mainTitle;
        subtitleEl.innerText = subtitle;

        videoPlayer.src = data.result.video.url;
        // ★ 核心修改 1：让视频以 0 音量开始静音播放
        videoPlayer.volume = 0;
        videoPlayer.play(); 

        switchToStage('step-video-player');

        // --- 疗愈序章 ---
        overlayText.innerText = "请跟随光环... 深呼吸...";
        overlay.classList.remove('d-none');
        setTimeout(() => overlay.classList.add('visible'), 100);

        // 在序章视觉效果结束时，开始声音的淡入
        setTimeout(() => {
            overlay.classList.remove('visible');
            // ★ 核心修改 2：调用音量淡化函数，在2.5秒内将音量从0变为1
            fadeAudio(videoPlayer, 1, 2500);
        }, 3500);
    }
}

// UI核心切换函数
function switchToStage(nextStageId) {
    updateBackground(nextStageId); // ★ 在切换舞台时，立即调用背景更新函数 ★

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

    // ★★★ 新增的核心修复代码 ★★★
    // 在UI重置后，重新初始化情感视界背景特效
    initializeEmotionalHorizon();
    
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

// ✅ 用这段代码，替换掉你旧的 initializeParticles 函数
async function initializeEmotionalHorizon() {
    if (particlesInstance) {
        particlesInstance.destroy();
    }
    try {
        particlesInstance = await tsParticles.load("particle-canvas", {
            fpsLimit: 60,
            particles: {
                number: { value: 120, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: { min: 0.1, max: 0.4 } },
                size: { value: { min: 1, max: 3 } },
                links: {
                    enable: false, 
                    distance: 150,
                    color: "#ffffff",
                    opacity: 0.3,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.5, 
                    direction: "none",
                    outModes: { default: "out" }
                }
            },
            interactivity: { events: { onHover: { enable: true, mode: "grab" } } },
            detectRetina: true,
            background: { color: "transparent" }
        });
        console.log('✨ Emotional Horizon initialized successfully.');
        updateBackground('step-input'); // 初始化后立即设置一次默认状态
    } catch (error) {
        console.error('Error initializing Emotional Horizon:', error);
    }
}
// 确保在DOM加载后调用
document.addEventListener('DOMContentLoaded', initializeEmotionalHorizon);

// ✅ 将这个全新的函数，粘贴到 initializeEmotionalHorizon 之后
function updateBackground(stage) {
    if (!particlesInstance) return;

    const root = document.documentElement;
    let particleOptions = {};
    let auraColors = {};

    console.log(`Updating background for stage: ${stage}`);

    switch (stage) {
        case 'step-emotion-analysis':
            auraColors = { '--aura-color1': '#00d4ff', '--aura-color2': '#6366f1', '--aura-color3': '#0066ff' };
            particleOptions = { links: { enable: true, opacity: 0.4 }, move: { speed: 1.5 } };
            break;
        case 'step-kg-result':
        case 'step-iso-principle':
            auraColors = { '--aura-color1': '#a78bfa', '--aura-color2': '#34d399', '--aura-color3': '#fbbf24' };
            particleOptions = { links: { enable: true, opacity: 0.15 }, move: { speed: 0.8 } };
            break;
        case 'step-video-player':
            auraColors = { '--aura-color1': '#a78bfa', '--aura-color2': '#fbbf24', '--aura-color3': '#f472b6' };
            particleOptions = { links: { enable: false }, move: { speed: 0.3 } };
            break;
        case 'step-input':
        default:
            auraColors = { '--aura-color1': '#0066ff', '--aura-color2': '#8b5cf6', '--aura-color3': '#00d4ff' };
            particleOptions = { links: { enable: false }, move: { speed: 0.5 } };
            break;
    }

    // 应用颜色和粒子变化
    for (const [key, value] of Object.entries(auraColors)) {
        root.style.setProperty(key, value);
    }
    if (Object.keys(particleOptions).length > 0) {
        particlesInstance.options.particles.load(particleOptions);
        particlesInstance.refresh();
    }
}
// =================================================================

// 3. 【新增】放在文件最底部的事件监听逻辑
const videoPlayerForEvents = document.getElementById('healing-video');
let epilogueTriggered = false; // 确保"尾声"只触发一次

function startHealingEpilogue() {
    if (epilogueTriggered) return;
    epilogueTriggered = true;

    const overlay = document.getElementById('healing-overlay');
    const overlayText = overlay.querySelector('.breathing-text');
    const videoPlayer = document.getElementById('healing-video'); // 重新获取以确保准确

    // ★ 核心修改 1：在视觉淡出开始时，立即调用音量淡出函数
    // 在4秒内将音量从当前值降到0
    fadeAudio(videoPlayer, 0, 4000); 

    // 视觉效果同步进行
    videoPlayer.classList.add('fade-out');
    overlayText.innerText = "让这份平静，缓缓融入您的呼吸。";
    overlay.classList.remove('d-none');
    setTimeout(() => overlay.classList.add('visible'), 100);

    // "尾声"结束后，切换到最终选择卡片
    setTimeout(() => {
        // ★ 核心修改 2：在所有动画结束后，暂停视频以停止播放
        videoPlayer.pause();
        switchToStage('step-conclusion');
        
        // 重置所有状态... (这部分不变)
        videoPlayer.classList.remove('fade-out');
        videoPlayer.style.opacity = 1;
        overlay.classList.remove('visible');
        overlay.classList.add('d-none');
        epilogueTriggered = false;
    }, 5000); // "尾声"持续5秒
}

// 监听播放进度，在视频结束前4秒触发"尾声"
videoPlayerForEvents.addEventListener('timeupdate', () => {
    if (videoPlayerForEvents.duration && videoPlayerForEvents.currentTime > videoPlayerForEvents.duration - 4) {
        startHealingEpilogue();
    }
});

// 为防止意外，如果视频直接结束了也触发"尾声"
videoPlayerForEvents.addEventListener('ended', startHealingEpilogue);

// 每次加载新视频时，重置触发器
videoPlayerForEvents.addEventListener('loadstart', () => {
    epilogueTriggered = false;
});

// ======================== 最终版情绪解码动画系统 (13.5秒总时长) ========================
function startFinalCognitiveForgeAnimation(kgData, container, titleEl, detailsEl) {
    console.log('🧠 开始最终版情绪解码动画 - 13.5秒总时长');
    
    // 清理旧元素
    const existingElements = container.querySelectorAll('.cognitive-forge-stage');
    existingElements.forEach(el => el.remove());
    
    // 获取音乐参数数据，提供更好的错误处理
    const musicParams = kgData?.music_parameters || {};
    const therapy = kgData?.therapy_recommendation || {};
    
    // 阶段1: 情绪解构 (0.5s延迟开始)
    setTimeout(() => {
        console.log('🔬 阶段1: 情绪解构 (0.5s)');
        container.innerHTML = `
            <div class="cognitive-forge-stage deconstruction-stage">
                <div class="neural-network">
                    <div class="network-node primary-node" data-emotion="主要情绪"></div>
                    <div class="network-node secondary-node" data-emotion="次要情绪"></div>
                    <div class="network-node tertiary-node" data-emotion="背景情绪"></div>
                    <div class="connection-line line1"></div>
                    <div class="connection-line line2"></div>
                    <div class="connection-line line3"></div>
                </div>
                <div class="stage-label">情绪解构分析中...</div>
            </div>
        `;
        
        // 阶段2: GEMS映射 (3.5s后开始)
        setTimeout(() => {
            console.log('💎 阶段2: GEMS映射 (3.5s)');
            container.innerHTML = `
                <div class="cognitive-forge-stage gems-mapping-stage">
                    <div class="gems-container">
                        <div class="music-param-node tempo-node" data-value="${musicParams.tempo || '60-80 BPM'}" title="节奏">♩</div>
                        <div class="music-param-node mode-node" data-value="${musicParams.mode || '大调'}" title="调式">♪</div>
                        <div class="music-param-node dynamics-node" data-value="${musicParams.dynamics || '中等'}" title="动态">♫</div>
                        <div class="music-param-node harmony-node" data-value="${musicParams.harmony || '协和'}" title="和声">♬</div>
                        <div class="music-param-node timbre-node" data-value="${musicParams.timbre || '温暖'}" title="音色">♭</div>
                        <div class="music-param-node register-node" data-value="${musicParams.register || '中音'}" title="音域">♯</div>
                        <div class="music-param-node density-node" data-value="${musicParams.density || '中等'}" title="密度">♮</div>
                    </div>
                    <div class="stage-label">GEMS参数映射中...</div>
                </div>
            `;
            
            // 阶段3: 知识图谱提取 (6.5s后开始)
            setTimeout(() => {
                console.log('🕸️ 阶段3: 知识图谱提取 (6.5s)');
                container.innerHTML = `
                    <div class="cognitive-forge-stage knowledge-extraction-stage">
                        <div class="kg-web">
                            <div class="kg-node central" data-type="central">情绪核心</div>
                            <div class="kg-node emotion" data-type="emotion">情绪分析</div>
                            <div class="kg-node music" data-type="music">音乐参数</div>
                            <div class="kg-node therapy" data-type="therapy">疗愈方案</div>
                            <div class="kg-edge edge1"></div>
                            <div class="kg-edge edge2"></div>
                            <div class="kg-edge edge3"></div>
                            <div class="kg-edge edge4"></div>
                            <div class="kg-edge edge5"></div>
                            <div class="kg-edge edge6"></div>
                        </div>
                        <div class="stage-label">知识图谱构建中...</div>
                    </div>
                `;
                
                // 阶段4: 疗愈处方合成 (10s后开始)
                setTimeout(() => {
                    console.log('💊 阶段4: 疗愈处方合成 (10s)');
                    container.innerHTML = `
                        <div class="cognitive-forge-stage prescription-synthesis-stage">
                            <div class="prescription-container">
                                <div class="prescription-icon">💊</div>
                                <div class="synthesis-glow"></div>
                                <div class="prescription-details">
                                    <div class="prescription-line">焦点: ${therapy.primary_focus || '情绪平衡'}</div>
                                    <div class="prescription-line">方法: ${therapy.therapy_approach || '音乐疗愈'}</div>
                                    <div class="prescription-line">时长: ${therapy.session_duration || '20-30分钟'}</div>
                                </div>
                            </div>
                            <div class="stage-label">疗愈处方合成完成</div>
                        </div>
                    `;
                    
                    // 动画完成后显示最终结果 (13s后)
                    setTimeout(() => {
                        console.log('✅ 最终版动画完成，显示结果');
                        container.innerHTML = ''; // 清理动画容器
                        
                        // 显示标题
                        titleEl.innerText = kgData.title || '疗愈处方已生成';
                        titleEl.style.opacity = '0';
                        titleEl.style.animation = 'fadeIn 0.5s forwards';
                        
                        // 显示详细信息列表
                        const details = kgData.details || [
                            "音乐主题: 舒缓疗愈",
                            "建议节奏: 60-80 BPM",
                            "调式: 大调"
                        ];
                        
                        detailsEl.innerHTML = ''; // 清空现有内容
                        details.forEach((item, index) => {
                            const li = document.createElement('li');
                            li.className = 'list-group-item border-0';
                            li.innerHTML = `<i class="fas fa-check-circle text-success me-2"></i>${item}`;
                            li.style.opacity = '0';
                            li.style.animationDelay = `${index * 0.15}s`;
                            li.style.animation = 'fadeInUp 0.6s forwards';
                            detailsEl.appendChild(li);
                        });
                        
                    }, 3000); // 从阶段4开始后3秒显示结果
                }, 3500); // 10s - 6.5s = 3.5s
            }, 3000); // 6.5s - 3.5s = 3s  
        }, 3000); // 3.5s - 0.5s = 3s
    }, 500); // 0.5s延迟
}

// ========================================================================