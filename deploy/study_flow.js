// study_flow.js (V13 - 最终完整、稳定、未经删减版)

const langResources = {
    zh: {
        analyzing: '分析中...', startJourney: '开启疗愈之旅', input_alert: "请输入你的感受！", unit_bpm: "BPM",
        analysis_step1: "连接情绪神经网络...", analysis_step2: "解析27维情绪向量...", analysis_step3: "正在构建您的情绪图谱...",
        stage_emotion_analysis: '情绪解码', comfort_text: '别担心，你的所有感受，都值得被看见。',
        emotion_name_admiration: '钦佩', emotion_name_adoration: '崇拜', emotion_name_aesthetic_appreciation: '审美欣赏', emotion_name_amusement: '娱乐', emotion_name_anger: '愤怒', emotion_name_anxiety: '焦虑', emotion_name_awe: '敬畏', emotion_name_embarrassment: '尴尬', emotion_name_boredom: '无聊', emotion_name_calm: '平静', emotion_name_confusion: '困惑', emotion_name_contempt: '蔑视', emotion_name_desire: '渴望', emotion_name_disappointment: '失望', emotion_name_disgust: '厌恶', emotion_name_sympathy: '同情', emotion_name_entrancement: '入迷', emotion_name_jealousy: '嫉妒', emotion_name_excitement: '兴奋', emotion_name_fear: '恐惧', emotion_name_guilt: '内疚', emotion_name_horror: '恐怖', emotion_name_interest: '兴趣', emotion_name_joy: '快乐', emotion_name_nostalgia: '怀旧', emotion_name_romance: '浪漫', emotion_name_sadness: '悲伤', emotion_name_unknown: '复杂感受',
        desc_admiration: '您的文字中充满了钦佩。欣赏他人的优点，也能激励我们自己变得更好。', desc_adoration: '我们感受到了崇拜的情感，这是一种强烈而积极的联结。', desc_aesthetic_appreciation: '您展现了对美的欣赏。感受美、欣赏美是生活中非常重要的疗愈力量。', desc_amusement: '您的文字中充满了娱乐和趣味，轻松的心情是最好的解压药。', desc_anger: '我们识别到了您心中的愤怒。愤怒是情绪的警报，提醒我们有些东西需要被关注和理解。', desc_anxiety: '我们察觉到了您当下的焦虑。请记得深呼吸，专注于此刻，一切都会过去。', desc_awe: '我们捕捉到了敬畏的情感。当面对宏大或壮丽时，敬畏之心油然而生。', desc_embarrassment: '您似乎感到有些尴尬。这是正常的社交情绪，帮助我们更好地融入群体。', desc_boredom: '我们察觉到了一丝无聊的情绪。也许这是一个信号，提示您去寻找新的挑战或兴趣。', desc_calm: '您的内心似乎处于一种平静的状态。愿您能享受这份宁静与和谐。', desc_confusion: '您的思绪似乎有些困惑。没关系，让我们一起在这片迷雾中寻找方向。', desc_contempt: '我们识别到了蔑视的情绪，它通常源于复杂的比较和判断。', desc_desire: '您的文字中充满了渴望。渴望是我们行动的动力，指引着我们去追求目标。', desc_disappointment: '我们感受到了您的失望。当现实未及预期，感到失望是人之常情。', desc_disgust: '我们感受到了您对某些事物的厌恶。这是一种强烈的信号，帮助我们建立边界。', desc_sympathy: '您的文字展现了很强的同情心。能够共情他人的感受，是一种宝贵的能力。', desc_entrancement: '您似乎正处于一种入迷的状态，专注是通往内心世界的一扇门。', desc_jealousy: '我们捕捉到了嫉妒的情绪。它常常指向我们内心深处所渴望的东西。', desc_excitement: '我们感受到了您内心的兴奋与激动，期待美好的事情发生总是令人愉悦。', desc_fear: '我们察觉到了您内心的恐惧。请记住，感到恐惧是正常的，重要的是我们如何面对它。', desc_guilt: '您似乎正被内疚感所困扰。内疚提醒我们关注自己的行为，并给予我们成长的机会。', desc_horror: '我们察觉到了恐怖的情绪。请确保您当前处于一个安全的环境中。', desc_interest: '我们看到了您对事物的兴趣，这是探索和学习的开始。', desc_joy: '我们捕捉到了您心中的喜悦之情！愿这份快乐如同阳光，照亮您的一天。', desc_nostalgia: '怀旧的情绪悄然浮现。过去的回忆，无论是甜是苦，都塑造了今天的我们。', desc_romance: '浪漫的情愫在您的文字中弥漫，这是一种深刻而美好的情感体验。', desc_sadness: '我们感受到了您内心的悲伤。请允许自己慢慢体会这份情绪，所有感受都值得被温柔以待。',
        stage_gems_mapping: '情绪音乐 GEMS 映射', stage_kg_extraction: '知识图谱提取',
        "prescription_title": "您的专属疗愈处方", "section_title_params": "音乐处方参数", "section_title_rationale": "疗愈机理阐述", "section_title_practice": "引导性聆听建议", "practice_text_default": "建议佩戴耳机，在一个安静的环境中完整聆听。尝试将注意力放在音乐的流动上，跟随旋律进行4秒吸气、6秒呼气的腹式呼吸。",
        iso_title: "正在应用：同质原理", iso_step1_desc: "第一步：情绪匹配\nAI正应用同质原理，用与您情绪频率相似的音乐建立共鸣。", iso_step2_desc: "第二步：同频引导\n在共鸣基础上，音乐将进行转化，温柔地引导您的情绪状态。", iso_step3_desc: "ISO原理应用完成，即将为您呈现专属的疗愈音乐。",
        video_main_title: "一段专属您的心灵之旅", video_subtitle_prefix: "疗愈方案编号", video_title_generic: "这段疗愈旅程，专属于你", video_title_fallback: "疗愈之声 (备用)", prelude_text: "请跟随光环... 深呼吸...", epilogue_text: "让这份平静，缓缓融入您的呼吸。",
        "connection_lost": "与服务器的连接丢失，请刷新重试。", "protocol_activated_template": "{protocolName} 已激活",
        "protocol_anxiety_relief_critical": "深度焦虑舒缓协议", "protocol_anger_release": "愤怒情绪疏导协议", "protocol_fear_soothing": "恐惧情绪安抚协议", "protocol_calm_maintenance": "深度平静维持协议", "protocol_sadness_support": "悲伤情感支持协议", "protocol_joy_energy": "快乐能量维持协议", "protocol_anxiety_relief_moderate": "中度焦虑缓解协议", "protocol_positive_excitement": "积极能量激活协议", "protocol_nostalgia_comfort": "怀旧情感抚慰协议", "protocol_interest_sparking": "内在兴趣激发协议", "protocol_default": "基础情绪平衡协议",
        "value_major": "大调", "value_minor": "小调", "value_neutral": "中性", "value_loud": "强", "value_soft": "弱", "value_medium": "中等", "value_consonant": "协和", "value_dissonant": "不协和", "value_mixed": "混合", "value_high": "高音域", "value_low": "低音域", "value_dense": "密集", "value_sparse": "稀疏",
        "value_warm_pad": "温暖铺底", "value_expressive_strings": "表现力弦乐", "value_soft_choir": "轻柔合唱", "value_nature_sounds": "自然之声", "value_gentle_piano": "柔和钢琴", "value_bright_ensemble": "明亮合奏", "value_ambient_pad": "氛围铺底", "value_energetic_mix": "活力律动", "value_vintage_warmth": "复古温暖", "value_interesting_textures": "趣味织体", "value_neutral_pad": "中性铺底",
        "approach_integration": "采用中性、平衡的音乐促进情绪整合与自我觉察。", "approach_anxiety_relief": "采用缓慢、协和的音乐逐步降低生理激活水平，营造安全感。", "approach_anger_release": "先用匹配情绪能量的音乐建立连接，再逐步引导到更平静的状态。", "approach_sadness_support": "从共情音乐开始，逐步引入温暖、上升的音乐元素，给予希望感。", "approach_positive_maintenance": "维持积极状态，同时通过稳定的节奏和结构避免过度兴奋。"
    },
    en: {
        analyzing: 'Analyzing...', startJourney: 'Start Healing Journey', input_alert: "Please enter how you feel!", unit_bpm: "BPM",
        analysis_step1: "Connecting to emotional neural network...", analysis_step2: "Parsing 27-dimensional emotion vectors...", analysis_step3: "Constructing your emotional profile...",
        stage_emotion_analysis: 'Emotion Decoding', comfort_text: 'Don\'t worry, all of your feelings are valid and deserve to be seen.',
        emotion_name_admiration: 'Admiration', emotion_name_adoration: 'Adoration', emotion_name_aesthetic_appreciation: 'Aesthetic Appreciation', emotion_name_amusement: 'Amusement', emotion_name_anger: 'Anger', emotion_name_anxiety: 'Anxiety', emotion_name_awe: 'Awe', emotion_name_embarrassment: 'Embarrassment', emotion_name_boredom: 'Boredom', emotion_name_calm: 'Calm', emotion_name_confusion: 'Confusion', emotion_name_contempt: 'Contempt', emotion_name_desire: 'Desire', emotion_name_disappointment: 'Disappointment', emotion_name_disgust: 'Disgust', emotion_name_sympathy: 'Sympathy', emotion_name_entrancement: 'Entrancement', emotion_name_jealousy: 'Jealousy', emotion_name_excitement: 'Excitement', emotion_name_fear: 'Fear', emotion_name_guilt: 'Guilt', emotion_name_horror: 'Horror', emotion_name_interest: 'Interest', emotion_name_joy: 'Joy', emotion_name_nostalgia: 'Nostalgia', emotion_name_romance: 'Romance', emotion_name_sadness: 'Sadness', emotion_name_unknown: 'Complex Feelings',
        desc_admiration: 'Your words are filled with admiration. Appreciating the strengths of others can also inspire us to become better.', desc_adoration: 'We sense a feeling of adoration, which is a strong and positive connection.', desc_aesthetic_appreciation: 'You demonstrate an appreciation for beauty. Feeling and appreciating beauty is a vital healing force in life.', desc_amusement: 'Your words are full of amusement and fun; a lighthearted mood is the best medicine for stress.', desc_anger: 'We recognize the anger within you. Anger is an emotional alarm, alerting us that something needs attention and understanding.', desc_anxiety: 'We have detected your current anxiety. Remember to take a deep breath, focus on the present moment, and know that this too shall pass.', desc_awe: 'We\'ve captured a sense of awe. When faced with the vast or magnificent, a feeling of awe naturally arises.', desc_embarrassment: 'You seem to be feeling some embarrassment. This is a normal social emotion that helps us better integrate into groups.', desc_boredom: 'We\'ve detected a hint of boredom. Perhaps this is a signal prompting you to find new challenges or interests.', desc_calm: 'Your inner world appears to be in a state of calm. May you enjoy this tranquility and harmony.', desc_confusion: 'Your thoughts seem a bit confused. It\'s okay; let\'s find a way through this fog together.', desc_contempt: 'We recognize the emotion of contempt, which often stems from complex comparisons and judgments.', desc_desire: 'Your words are filled with desire. Desire is our motivation to act, guiding us toward our goals.', desc_disappointment: 'We sense your disappointment. It\'s natural to feel this way when reality doesn\'t meet expectations.', desc_disgust: 'We sense your aversion to something. This is a strong signal that helps us establish our boundaries.', desc_sympathy: 'Your words show great sympathy. The ability to empathize with others\' feelings is a precious quality.', desc_entrancement: 'You seem to be in a state of entrancement; focus is a gateway to the inner world.', desc_jealousy: 'We\'ve captured the emotion of jealousy. It often points to what we deeply desire in our hearts.', desc_excitement: 'We sense the excitement and thrill within you; anticipating good things is always a pleasure.', desc_fear: 'We have detected a sense of fear. Please remember, feeling fear is normal; what matters is how we face it.', desc_guilt: 'You seem to be troubled by guilt. Guilt reminds us to pay attention to our actions and gives us an opportunity to grow.', desc_horror: 'We have detected an emotion of horror. Please ensure that you are currently in a safe environment.', desc_interest: 'We see your interest in things, which is the beginning of exploration and learning.', desc_joy: 'We\'ve captured the joy in your heart! May this happiness shine like the sun and brighten your day.', desc_nostalgia: 'A feeling of nostalgia has gently surfaced. Memories of the past, whether sweet or bitter, have shaped who we are today.', desc_romance: 'A sense of romance permeates your words; it is a profound and beautiful emotional experience.', desc_sadness: 'We sense the sadness within you. Please allow yourself to gently experience this emotion; all feelings deserve to be treated with tenderness.',
        stage_gems_mapping: 'Emotion-Music GEMS Mapping', stage_kg_extraction: 'Knowledge Graph Extraction',
        "prescription_title": "Your Personal Healing Prescription", "section_title_params": "Musical Prescription Parameters", "section_title_rationale": "Therapeutic Rationale", "section_title_practice": "Guided Listening Practice", "practice_text_default": "It is recommended to use headphones and listen in a quiet environment. Try to focus on the flow of the music, and practice diaphragmatic breathing with a 4-second inhale and 6-second exhale.",
        iso_title: "Applying: ISO Principle", iso_step1_desc: "Step 1: Matching\nThe AI is applying the ISO principle...", iso_step2_desc: "Step 2: Entrainment\nBased on resonance, the music will subtly transform...", iso_step3_desc: "ISO principle application complete. Preparing your music...",
        video_main_title: "A Mindful Journey, Just For You", video_subtitle_prefix: "Healing Protocol ID", video_title_generic: "This Healing Journey, Is Just For You", video_title_fallback: "Sound of Healing (Fallback)", prelude_text: "Please follow the halo... and breathe deeply...", epilogue_text: "Let this peace slowly merge with your breath.",
        "connection_lost": "Connection to the server was lost. Please refresh and try again.", "protocol_activated_template": "{protocolName} Activated",
        "protocol_anxiety_relief_critical": "Deep Anxiety Relief Protocol", "protocol_anger_release": "Anger Release Protocol", "protocol_fear_soothing": "Fear Soothing Protocol", "protocol_calm_maintenance": "Deep Calm Maintenance Protocol", "protocol_sadness_support": "Sadness Support Protocol", "protocol_joy_energy": "Joyful Energy Protocol", "protocol_anxiety_relief_moderate": "Moderate Anxiety Relief Protocol", "protocol_positive_excitement": "Positive Excitement Protocol", "protocol_nostalgia_comfort": "Nostalgia Comfort Protocol", "protocol_interest_sparking": "Interest Sparking Protocol", "protocol_default": "Basic Emotional Balance Protocol",
        "value_major": "Major", "value_minor": "Minor", "value_neutral": "Neutral", "value_loud": "Loud", "value_soft": "Soft", "value_medium": "Medium", "value_consonant": "Consonant", "value_dissonant": "Dissonant", "value_mixed": "Mixed", "value_high": "High", "value_low": "Low", "value_dense": "Dense", "value_sparse": "Sparse",
        "value_warm_pad": "Warm Pad", "value_expressive_strings": "Expressive Strings", "value_soft_choir": "Soft Choir", "value_nature_sounds": "Nature Sounds", "value_gentle_piano": "Gentle Piano", "value_bright_ensemble": "Bright Ensemble", "value_ambient_pad": "Ambient Pad", "value_energetic_mix": "Energetic Mix", "value_vintage_warmth": "Vintage Warmth", "value_interesting_textures": "Interesting Textures", "value_neutral_pad": "Neutral Pad",
        "approach_integration": "Utilizing neutral, balanced music to promote emotional integration and self-awareness.", "approach_anxiety_relief": "Employing slow, consonant music to gradually reduce physiological arousal and create a sense of safety.", "approach_anger_release": "Initiating with music that matches the emotional energy to establish a connection, then gradually guiding towards a calmer state.", "approach_sadness_support": "Starting with empathetic music and progressively introducing warm, ascending musical elements to instill a sense of hope.", "approach_positive_maintenance": "Maintaining a positive state while avoiding over-stimulation through stable rhythms and structure."
    }
};

function getText(key) {
    const lang = 'en'; // 强制使用英文
    const resource = langResources[lang];
    return resource[key] || key;
}

document.addEventListener('DOMContentLoaded', () => {
    // 默认语言设为英文，并让按钮逻辑保持完整，以备将来恢复
    let currentLang = 'en'; 
    const langSwitcher = document.getElementById('language-switcher');
    
    function setLanguage(lang) {
        document.documentElement.lang = lang; 
        currentLang = lang;
        document.querySelectorAll('[data-lang-zh], [data-lang-en]').forEach(el => {
            const text = el.getAttribute(`data-lang-${lang}`);
            if (text) el.innerText = text;
        });
        document.querySelectorAll('[data-lang-zh-placeholder], [data-lang-en-placeholder]').forEach(el => {
            const placeholder = el.getAttribute(`data-lang-${lang}-placeholder`);
            if (placeholder) el.placeholder = placeholder;
        });
        if(langSwitcher){
            const switcherSpan = langSwitcher.querySelector('span');
            if (switcherSpan) { switcherSpan.innerText = lang === 'zh' ? 'English' : '中文'; }
        }
    }

    if (langSwitcher) {
        langSwitcher.addEventListener('click', (e) => { 
            e.preventDefault(); 
            const newLang = currentLang === 'zh' ? 'en' : 'zh';
            setLanguage(newLang);
        });
    }

    setLanguage(currentLang); // 初始化为英文
});

let sessionId = null, pollingIntervalId = null, currentStageId = 'step-input', particlesInstance = null;
const submitButton = document.getElementById('submit-button'), userInput = document.getElementById('user-input'), restartButton = document.getElementById('restart-button'), endSessionButton = document.getElementById('end-session-button'), healingVideo = document.getElementById('healing-video');
const stages = { 'step-input': document.getElementById('step-input'), 'step-emotion-analysis': document.getElementById('step-emotion-analysis'), 'step-kg-result': document.getElementById('step-kg-result'), 'step-iso-principle': document.getElementById('step-iso-principle'), 'step-synthesis': document.getElementById('step-synthesis'), 'step-video-player': document.getElementById('step-video-player'), 'step-conclusion': document.getElementById('step-conclusion') };

function formatVideoTitle(displayNameKey, fileName) {
    const mainTitleEl = document.getElementById('video-main-title');
    const subtitleEl = document.getElementById('video-subtitle');
    mainTitleEl.innerText = getText(displayNameKey);
    const parts = fileName.split('_'); 
    let subtitle = getText('video_subtitle_prefix');
    if (parts.length >= 2) { subtitle = `${subtitle}: EH-${parts[0]}-${parts[2] || '00'}`; }
    subtitleEl.innerText = subtitle;
}

function fadeAudio(videoElement, endVolume, duration) {
    const startVolume = videoElement.volume;
    const intervalTime = 50;
    const stepCount = duration / intervalTime;
    const volumeStep = (endVolume - startVolume) / stepCount;
    if (startVolume === endVolume) return;
    if (videoElement.fadeInterval) { clearInterval(videoElement.fadeInterval); }
    videoElement.fadeInterval = setInterval(() => {
        if (!videoElement) { clearInterval(videoElement.fadeInterval); return; }
        let newVolume = videoElement.volume + volumeStep;
        if ((volumeStep > 0 && newVolume >= endVolume) || (volumeStep < 0 && newVolume <= endVolume)) {
            newVolume = endVolume;
            clearInterval(videoElement.fadeInterval);
            videoElement.fadeInterval = null; 
        }
        videoElement.volume = newVolume;
    }, intervalTime);
}

submitButton.addEventListener('click', async () => {
    const text = userInput.value;
    if (!text) { alert(getText('input_alert')); return; }
    submitButton.disabled = true;
    submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${getText('analyzing')}`;
    if (currentStageId !== 'step-input') { await resetUI(); }
    try {
        // ★★★★★ 核心修复点 2: 在 fetch 请求中添加 ngrok 特定的 header ★★★★★
        const headers = {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' // 这个 header 是关键！
        };
        const createResponse = await fetch('https://f0a54943db34.ngrok-free.app/api/create_session', { 
            method: 'POST', 
            headers: headers, 
            body: JSON.stringify({ text: text }) 
        });
        if (!createResponse.ok) throw new Error(`HTTP error! status: ${createResponse.status}`);
        const createData = await createResponse.json();
        sessionId = createData.sessionId;
        if (sessionId) { startPolling(); } else { throw new Error('Session ID not received.'); }
    } catch (error) {
        console.error("Error creating session:", error);
        alert(getText('connection_lost'));
        submitButton.disabled = false;
        submitButton.innerHTML = `<i class="fas fa-heart-pulse me-2"></i> ${getText('startJourney')}`;
    }
});

function startPolling() {
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    pollingIntervalId = setInterval(async () => {
        if (!sessionId) { clearInterval(pollingIntervalId); return; }
        try {
            // ★★★★★ 核心修复点 2 (同样应用于 polling): 添加 ngrok 特定的 header ★★★★★
            const headers = {
                'ngrok-skip-browser-warning': 'true'
            };
            const statusResponse = await fetch(`https://f0a54943db34.ngrok-free.app/api/session_status?id=${sessionId}`, { headers: headers });
            if (!statusResponse.ok) throw new Error(`Polling failed! status: ${statusResponse.status}`);
            const statusData = await statusResponse.json();
            if (statusData.status === 'ERROR') throw new Error(`Server error: ${statusData.error_message}`);
            handleState(statusData);
        } catch(error) {
            console.error("Polling failed:", error);
            clearInterval(pollingIntervalId);
            alert(getText('connection_lost'));
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="fas fa-heart-pulse me-2"></i> ${getText('startJourney')}`;
        }
    }, 2000); 
}

function handleState(data) {
    if (data.status === 'AC_COMPLETE') {
        clearInterval(pollingIntervalId);
        switchToStage('step-emotion-analysis');
        const container = document.getElementById('emotion-core-container'), titleEl = document.getElementById('emotion-title'), descriptionEl = document.getElementById('emotion-description');
        container.innerHTML = ''; titleEl.innerText = ''; descriptionEl.innerText = '';
        const oldComfortText = document.getElementById('comfort-text');
        if (oldComfortText) oldComfortText.remove();
        const analyzerContainer = document.createElement('div');
        analyzerContainer.className = 'analyzer-text-container';
        container.appendChild(analyzerContainer);
        const analysisSteps = [getText('analysis_step1'), getText('analysis_step2'), getText('analysis_step3')];
        let stepIndex = 0;
        analyzerContainer.innerHTML = `<span class="analyzer-text">${analysisSteps[stepIndex]}</span>`;
        const typingInterval = setInterval(() => {
            stepIndex++;
            if (stepIndex < analysisSteps.length) { analyzerContainer.innerHTML = `<span class="analyzer-text">${analysisSteps[stepIndex]}</span>`; } 
            else { clearInterval(typingInterval); }
        }, 1200);
        setTimeout(() => {
            container.innerHTML = '';
            const SWEEP_DURATION = 3000;
            const radarGrid = document.createElement('div'); radarGrid.className = 'radar-grid'; container.appendChild(radarGrid);
            const radarSweep = document.createElement('div'); radarSweep.className = 'radar-sweep'; radarSweep.style.animation = `radar-sweep-anim ${SWEEP_DURATION}ms linear 1`; container.appendChild(radarSweep);
            const core = document.createElement('div'); core.className = 'emotion-core'; container.appendChild(core);
            const emotions = data.result.analysisResult.topEmotions;
            const MIN_RADIUS = 30; const MAX_RADIUS = 115;
            const secondaryEmotions = emotions.slice(1).filter(emo => emo.score > 0.01);
            secondaryEmotions.forEach((emo, index) => {
                const score = emo.score || 0, finalRadius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * score, angleRad = (index / secondaryEmotions.length) * 2 * Math.PI - (Math.PI / 2), angleDeg = (angleRad * 180 / Math.PI), x = Math.cos(angleRad) * finalRadius, y = Math.sin(angleRad) * finalRadius, size = 5 + score * 10;
                const tracer = document.createElement('div'); tracer.className = 'tracer-line'; tracer.style.height = `${finalRadius}px`; tracer.style.transform = `rotate(${angleDeg}deg)`;
                const appearDelay = (angleDeg + 90) / 360 * SWEEP_DURATION;
                tracer.style.animation = `flash-tracer 0.6s ease-out ${appearDelay}ms forwards`;
                const satelliteContainer = document.createElement('div'); satelliteContainer.className = 'emotion-satellite-container'; satelliteContainer.style.left = `calc(50% + ${x}px)`; satelliteContainer.style.top = `calc(50% + ${y}px)`;
                const satellite = document.createElement('div'); satellite.className = 'emotion-satellite'; satellite.style.width = `${size}px`; satellite.style.height = `${size}px`; satellite.style.animation = `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${appearDelay + 100}ms forwards`;
                const label = document.createElement('span'); label.className = 'satellite-label'; label.innerText = `${getText(emo.nameKey)} ${Math.round(score * 100)}%`; label.style.animation = `fadeInLabel 0.5s ease-out ${appearDelay + 300}ms forwards`;
                container.appendChild(tracer); satelliteContainer.appendChild(satellite); satelliteContainer.appendChild(label); container.appendChild(satelliteContainer);
            });
            setTimeout(() => {
                const analysisResult = data.result.analysisResult;
                const mainEmotionKey = analysisResult.titleKey;
                titleEl.innerText = getText(mainEmotionKey);
                const descriptionKey = `desc_${mainEmotionKey.replace('emotion_name_', '')}`;
                descriptionEl.innerText = getText(descriptionKey) || '';
                titleEl.style.animation = 'fadeIn 0.5s forwards'; descriptionEl.style.animation = 'fadeIn 0.5s 0.2s forwards';
                const comfortText = document.createElement('p'); comfortText.id = 'comfort-text'; comfortText.className = 'healing-comfort-text'; comfortText.innerText = getText('comfort_text');
                descriptionEl.parentNode.appendChild(comfortText);
                comfortText.style.animation = 'fadeIn 1s 1s forwards';
            }, SWEEP_DURATION + 500);
            setTimeout(startPolling, 4000);
        }, 3500);
    } else if (data.status === 'KG_COMPLETE') {
        clearInterval(pollingIntervalId);
        switchToStage('step-kg-result');
        runKgSequence(data.result.kgResult);
        setTimeout(startPolling, 13000); 
    } else if (data.status === 'ISO_PRINCIPLE_READY') {
        clearInterval(pollingIntervalId);
        switchToStage('step-iso-principle');
        const el = stages['step-iso-principle'], titleEl = el.querySelector('#iso-title'), description = el.querySelector('#iso-description-stage');
        titleEl.innerText = getText('iso_title');
        const container = el.querySelector('#iso-animation-container'), userWave = el.querySelector('#user-wave-path'), musicWave = el.querySelector('#music-wave-path');
        const userEmotionState = "M0,50 Q125,85 250,50 T500,50", initialMusicState = "M0,50 Q125,15 250,50 T500,50", calmState = "M0,50 Q125,40 250,50 T500,50";
        const userColor = "var(--text-accent)", healingColor = "#a78bfa";
        container.className = 'iso-animation-container'; description.className = 'iso-description-stage';
        userWave.setAttribute('d', userEmotionState); musicWave.setAttribute('d', initialMusicState);
        userWave.style.stroke = userColor; musicWave.style.stroke = userColor;
        setTimeout(() => { container.classList.add('iso-enter'); description.innerText = getText('iso_step1_desc'); description.classList.add('iso-text-visible'); musicWave.setAttribute('d', userEmotionState); }, 500);
        setTimeout(() => { description.classList.remove('iso-text-visible'); setTimeout(() => { description.innerText = getText('iso_step2_desc'); description.classList.add('iso-text-visible'); }, 600); userWave.setAttribute('d', calmState); musicWave.setAttribute('d', calmState); musicWave.style.stroke = healingColor; userWave.style.stroke = healingColor; }, 4500);
        setTimeout(() => { description.classList.remove('iso-text-visible'); setTimeout(() => { description.innerText = getText('iso_step3_desc'); description.classList.add('iso-text-visible'); }, 600); setTimeout(() => { container.classList.add('iso-exit'); description.classList.remove('iso-text-visible'); }, 2000); }, 8500);
        // ★★★★★ 核心修改点 ★★★★★
        // 原来的 setTimeout(startPolling, 12500) 调整为：
        // 在ISO动画结束后（约11秒），立即切换到新的合成界面，并开始轮询。
        setTimeout(() => {
            switchToStage('step-synthesis'); // 切换到新界面
            startPolling();                 // 立刻开始轮询，让后端去处理耗时任务
        }, 11000); // 8500ms + 2000ms + 500ms buffer = 11000ms
        // ★★★★★★★★★★★★★★★★★★★★★
    } else if (data.status === 'VIDEO_READY') {
        clearInterval(pollingIntervalId);
        const el = stages['step-video-player'], videoPlayer = el.querySelector('#healing-video'), overlay = el.querySelector('#healing-overlay'), overlayText = overlay.querySelector('.breathing-text');
        const videoData = data.result.video;
        formatVideoTitle(videoData.displayNameKey, videoData.fileName);
        videoPlayer.src = videoData.url;
        videoPlayer.volume = 0;
        videoPlayer.play().catch(e => console.error("Autoplay was prevented:", e));
        switchToStage('step-video-player');
        overlayText.innerText = getText('prelude_text');
        overlay.classList.remove('d-none');
        setTimeout(() => overlay.classList.add('visible'), 100);
        setTimeout(() => { overlay.classList.remove('visible'); fadeAudio(videoPlayer, 1, 5000); }, 3500);
    }
}

function switchToStage(nextStageId) {
    updateBackground(nextStageId);
    const currentCard = stages[currentStageId]; const nextCard = stages[nextStageId];
    if (currentCard) {
        currentCard.classList.add('fade-out');
        setTimeout(() => {
            currentCard.classList.add('d-none');
            currentCard.classList.remove('fade-out');
            if(nextCard) { nextCard.classList.remove('d-none'); setTimeout(() => { nextCard.classList.add('fade-in'); currentStageId = nextStageId; }, 50); }
        }, 600);
    }
}

async function resetUI() {
    for (const key in stages) { if (key !== 'step-input') { stages[key].classList.add('d-none'); stages[key].classList.remove('fade-in'); } }
    stages['step-input'].classList.remove('d-none', 'fade-out', 'fade-in');
    currentStageId = 'step-input';
    if (particlesInstance) { particlesInstance.destroy(); particlesInstance = null; }
    const videoPlayer = document.getElementById('healing-video');
    videoPlayer.src = ""; videoPlayer.pause();
    return Promise.resolve();
}

restartButton.addEventListener('click', async () => {
    await resetUI();
    userInput.value = '';
    submitButton.disabled = false;
    submitButton.innerHTML = `<i class="fas fa-heart-pulse me-2"></i> ${getText('startJourney')}`;
    if (pollingIntervalId) { clearInterval(pollingIntervalId); pollingIntervalId = null; }
    sessionId = null;
    initializeEmotionalHorizon();
    userInput.focus();
});

endSessionButton.addEventListener('click', () => { stages['step-conclusion'].classList.add('fade-out'); });

async function initializeEmotionalHorizon() {
    if (particlesInstance) { particlesInstance.destroy(); }
    try {
        particlesInstance = await tsParticles.load("particle-canvas", {
            fpsLimit: 60,
            particles: { number: { value: 120, density: { enable: true, value_area: 800 } }, color: { value: "#ffffff" }, shape: { type: "circle" }, opacity: { value: { min: 0.1, max: 0.4 } }, size: { value: { min: 1, max: 3 } }, links: { enable: false }, move: { enable: true, speed: 0.5, direction: "none", outModes: { default: "out" } } },
            interactivity: { events: { onHover: { enable: true, mode: "grab" } } },
            detectRetina: true, background: { color: "transparent" }
        });
        updateBackground('step-input');
    } catch (error) { console.error('Error initializing Emotional Horizon:', error); }
}
document.addEventListener('DOMContentLoaded', initializeEmotionalHorizon);

function updateBackground(stage) {
    if (!particlesInstance) return;
    const root = document.documentElement;
    let particleOptions = {}; let auraColors = {};
    switch (stage) {
        case 'step-emotion-analysis':
            auraColors = { '--aura-color1': '#00d4ff', '--aura-color2': '#6366f1', '--aura-color3': '#0066ff' };
            particleOptions = { links: { enable: true, opacity: 0.4 }, move: { speed: 1.5 } }; break;
        case 'step-kg-result': case 'step-iso-principle':
            auraColors = { '--aura-color1': '#a78bfa', '--aura-color2': '#34d399', '--aura-color3': '#fbbf24' };
            particleOptions = { links: { enable: true, opacity: 0.15 }, move: { speed: 0.8 } }; break;
        case 'step-video-player':
            auraColors = { '--aura-color1': '#a78bfa', '--aura-color2': '#fbbf24', '--aura-color3': '#f472b6' };
            particleOptions = { links: { enable: false }, move: { speed: 0.3 } }; break;
        case 'step-input': default:
            auraColors = { '--aura-color1': '#0066ff', '--aura-color2': '#8b5cf6', '--aura-color3': '#00d4ff' };
            particleOptions = { links: { enable: false }, move: { speed: 0.5 } }; break;
    }
    for (const [key, value] of Object.entries(auraColors)) { root.style.setProperty(key, value); }
    if (Object.keys(particleOptions).length > 0 && particlesInstance.options) {
        particlesInstance.options.particles.load(particleOptions);
        particlesInstance.refresh();
    }
}

let epilogueTriggered = false;
function startHealingEpilogue() {
    if (epilogueTriggered) return;
    epilogueTriggered = true;
    const overlay = document.getElementById('healing-overlay'), overlayText = overlay.querySelector('.breathing-text');
    fadeAudio(healingVideo, 0, 7000);
    healingVideo.classList.add('fade-out');
    overlayText.innerText = getText('epilogue_text');
    overlay.classList.remove('d-none');
    setTimeout(() => overlay.classList.add('visible'), 100);
    setTimeout(() => {
        healingVideo.pause();
        switchToStage('step-conclusion');
        healingVideo.classList.remove('fade-out');
        overlay.classList.remove('visible');
        overlay.classList.add('d-none');
    }, 5000);
}
healingVideo.addEventListener('timeupdate', () => { if (healingVideo.duration && !epilogueTriggered && (healingVideo.currentTime > healingVideo.duration - 7)) { startHealingEpilogue(); } });
healingVideo.addEventListener('ended', startHealingEpilogue);
healingVideo.addEventListener('loadstart', () => { epilogueTriggered = false; });

function runKgSequence(kgResult) {
    const animContainer = document.getElementById('kg-animation-container');
    const cardContainer = document.getElementById('prescription-card-container');
    animContainer.classList.remove('d-none');
    cardContainer.classList.add('d-none');
    cardContainer.innerHTML = '';
    animContainer.innerHTML = `<div class="kg-animation-stage"><h5 class="kg-animation-title">${getText('stage_gems_mapping')}</h5><div class="gems-mapping-stage"><div class="music-param-node">♩</div><div class="music-param-node">♪</div><div class="music-param-node">♫</div><div class="music-param-node">♬</div><div class="music-param-node">♭</div><div class="music-param-node">♯</div></div></div>`;
    setTimeout(() => {
        animContainer.innerHTML = `<div class="kg-animation-stage"><h5 class="kg-animation-title">${getText('stage_kg_extraction')}</h5><div class="knowledge-extraction-stage"><div class="kg-node central"></div><div class="kg-node peripheral p1"></div><div class="kg-node peripheral p2"></div><div class="kg-node peripheral p3"></div><div class="kg-node peripheral p4"></div><div class="kg-node peripheral p5"></div><div class="kg-edge e1"></div><div class="kg-edge e2"></div><div class="kg-edge e3"></div><div class="kg-edge e4"></div><div class="kg-edge e5"></div></div></div>`;
    }, 4000);
    setTimeout(() => {
        animContainer.innerHTML = '';
        animContainer.classList.add('d-none');
        cardContainer.classList.remove('d-none');
        renderHealingPrescription(kgResult);
    }, 8000);
}

function renderHealingPrescription(kgResult) {
    const container = document.getElementById('prescription-card-container');
    if (!container) return;

    const emotionAnalysis = kgResult.emotion_analysis;
    const musicParams = kgResult.structured_params;
    const therapy = kgResult.therapy_recommendation;

    // ★★★★★ 核心修复点 ★★★★★
    // 后端现在直接发送英文Key，所以我们直接使用它，不再需要自己拼接
    const maxEmotionNameKey = emotionAnalysis.max_emotion[0] || 'emotion_name_unknown';
    // ★★★★★★★★★★★★★★★★★★★

    const matchedRuleKey = (kgResult.emotion_context && kgResult.emotion_context.matched_rule_key) ? kgResult.emotion_context.matched_rule_key : "default";
    const protocolName = getText(`protocol_${matchedRuleKey}`);
    const tempoValue = Math.round(musicParams.tempo);
    const protocolActivatedText = getText('protocol_activated_template').replace('{protocolName}', protocolName);
    
    const modeText = getText(`value_${(musicParams.mode || 'neutral').toLowerCase()}`);
    const harmonyText = getText(`value_${(musicParams.harmony || 'mixed').toLowerCase()}`);
    const registerText = getText(`value_${(musicParams.register || 'medium').toLowerCase()}`);
    const densityText = getText(`value_${(musicParams.density || 'medium').toLowerCase()}`);
    const timbreText = getText(`value_${(musicParams.timbre || 'neutral_pad').replace(/ /g, '_').toLowerCase()}`);
    
    const rationaleText = getText(therapy.therapy_approach_key);

    const cardHTML = `
        <div class="prescription-card">
            <div class="prescription-header">
                <div class="icon"><i class="fas fa-file-medical-alt"></i></div>
                <h4>
                    ${getText('prescription_title')}
                    <span class="prescription-pill-animation">💊</span>
                </h4>
                <p>${getText(maxEmotionNameKey)} - ${Math.round(emotionAnalysis.max_emotion[1] * 100)}%</p>
                <div class="prescription-protocol">${protocolActivatedText}</div>
            </div>
            <div class="prescription-section">
                <h5 class="prescription-section-title"><i class="fas fa-music"></i>${getText('section_title_params')}</h5>
                <div class="param-grid">
                    <div class="param-item"><div class="label">${getText('kg_param_tempo')}</div><div class="value">${tempoValue} <span>${getText('unit_bpm')}</span></div></div>
                    <div class="param-item"><div class="label">${getText('kg_param_mode')}</div><div class="value">${modeText}</div></div>
                    <div class="param-item"><div class="label">${getText('kg_param_timbre')}</div><div class="value">${timbreText}</div></div>
                    <div class="param-item"><div class="label">${getText('kg_param_harmony')}</div><div class="value">${harmonyText}</div></div>
                    <div class="param-item"><div class="label">${getText('kg_param_register')}</div><div class="value">${registerText}</div></div>
                    <div class="param-item"><div class="label">${getText('kg_param_density')}</div><div class="value">${densityText}</div></div>
                </div>
            </div>
            <div class="prescription-section">
                <h5 class="prescription-section-title"><i class="fas fa-brain"></i>${getText('section_title_rationale')}</h5>
                <p class="rationale-text">${rationaleText}</p>
            </div>
             <div class="prescription-section">
                <h5 class="prescription-section-title"><i class="fas fa-headphones-alt"></i>${getText('section_title_practice')}</h5>
                <p class="practice-text">${getText('practice_text_default')}</p>
            </div>
        </div>
    `;
    container.innerHTML = cardHTML;
}