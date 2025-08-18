# api_server.py (V4 - 优化流程节奏)

import uuid
import time
import numpy as np
from threading import Thread
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
from pathlib import Path
import traceback

# --- 路径设置 ---
sys.path.append(str(Path(__file__).parent.parent / "AC"))
sys.path.append(str(Path(__file__).parent.parent / "KG"))
sys.path.append(str(Path(__file__).parent.parent / "MI_retrieve"))

# --- 模块导入 ---
from inference_api import EmotionInferenceAPI
from emotion_music_bridge import EmotionMusicBridge
from music_search_api import MusicSearchAPI

# --- Flask 应用初始化 ---
app = Flask(__name__)
# ★★★★★ 核心修复点 1: 采用更强大、明确的CORS配置 ★★★★★
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,ngrok-skip-browser-warning')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response 

# --- 核心模块初始化 ---
print("🚀 服务器启动中：正在初始化核心算法模块...")
try:
    emotion_analyzer = EmotionInferenceAPI()
    kg_bridge = EmotionMusicBridge(enable_mi_retrieve=True)
    music_retriever = MusicSearchAPI()
    print("✅ 所有模块初始化成功！")
except Exception as e:
    print(f"❌ 模块初始化失败: {e}")
    emotion_analyzer = kg_bridge = music_retriever = None

# --- 任务状态存储 ---
tasks_status = {}

def make_json_safe(data):
    if isinstance(data, dict): return {key: make_json_safe(value) for key, value in data.items()}
    if isinstance(data, list): return [make_json_safe(element) for element in data]
    if isinstance(data, np.integer): return int(data)
    if isinstance(data, np.floating): return float(data)
    if isinstance(data, np.ndarray): return data.tolist()
    return data

EMOTION_TO_KEY = {
    "钦佩": "emotion_name_admiration", "崇拜": "emotion_name_adoration", "审美欣赏": "emotion_name_aesthetic_appreciation",
    "娱乐": "emotion_name_amusement", "愤怒": "emotion_name_anger", "焦虑": "emotion_name_anxiety",
    "敬畏": "emotion_name_awe", "尴尬": "emotion_name_embarrassment", "无聊": "emotion_name_boredom",
    "平静": "emotion_name_calm", "困惑": "emotion_name_confusion", "蔑视": "emotion_name_contempt",
    "渴望": "emotion_name_desire", "失望": "emotion_name_disappointment", "厌恶": "emotion_name_disgust",
    "同情": "emotion_name_sympathy", "入迷": "emotion_name_entrancement", "嫉妒": "emotion_name_jealousy",
    "兴奋": "emotion_name_excitement", "恐惧": "emotion_name_fear", "内疚": "emotion_name_guilt",
    "恐怖": "emotion_name_horror", "兴趣": "emotion_name_interest", "快乐": "emotion_name_joy",
    "怀旧": "emotion_name_nostalgia", "浪漫": "emotion_name_romance", "悲伤": "emotion_name_sadness"
}

def background_task(session_id, text, duration="1min"):
    global tasks_status
    print(f"[{session_id}] 后台任务已启动...")
    try:
        # === 步骤 1: 情感分析 ===
        tasks_status[session_id]['status'] = 'AC_PENDING'
        top_emotions_raw = emotion_analyzer.analyze_single_text(text, output_format='top_k', top_k=7)
        if not top_emotions_raw: top_emotions_raw = [("平静", 0.5)]
        
        analysis_result_package = {
            "titleKey": EMOTION_TO_KEY.get(top_emotions_raw[0][0], "emotion_name_unknown"),
            "topEmotions": [{"nameKey": EMOTION_TO_KEY.get(emo[0], "emotion_name_unknown"), "score": float(emo[1])} for emo in top_emotions_raw]
        }
        tasks_status[session_id]['result']['analysisResult'] = analysis_result_package
        tasks_status[session_id]['status'] = 'AC_COMPLETE'
        print(f"[{session_id}] 状态更新 -> AC_COMPLETE")
        time.sleep(4)

        # === 步骤 2: 知识图谱 ===
        tasks_status[session_id]['status'] = 'KG_PENDING'
        emotion_vector = emotion_analyzer.get_emotion_for_kg_module(text)
        kg_full_result = kg_bridge.get_therapy_parameters_only(emotion_vector=emotion_vector)
        
        # ★★★★★ 核心修复点：修复 'tuple' object does not support item assignment 错误 ★★★★★
        if kg_full_result.get("success") and kg_full_result.get("emotion_analysis"):
            max_emotion_tuple = kg_full_result["emotion_analysis"]["max_emotion"]
            if isinstance(max_emotion_tuple, (list, tuple)) and len(max_emotion_tuple) > 0:
                # 1. 从旧元组中读取数据
                chinese_name = max_emotion_tuple[0]
                score = max_emotion_tuple[1]
                
                # 2. 获取对应的英文Key
                english_key = EMOTION_TO_KEY.get(chinese_name, "emotion_name_unknown")
                
                # 3. 创建一个可修改的新列表
                new_max_emotion_list = [english_key, score]
                
                # 4. 用这个新列表去替换整个旧的元组
                kg_full_result["emotion_analysis"]["max_emotion"] = new_max_emotion_list
        # ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

        safe_kg_result = make_json_safe(kg_full_result)
        tasks_status[session_id]['result']['kgResult'] = safe_kg_result
        tasks_status[session_id]['status'] = 'KG_COMPLETE'
        print(f"[{session_id}] 状态更新 -> KG_COMPLETE")
        time.sleep(13)

        # === 步骤 3: ISO原则 ===
        tasks_status[session_id]['status'] = 'ISO_PRINCIPLE_PENDING'
        tasks_status[session_id]['result']['isoPrinciple'] = {"titleKey": "iso_title"}
        tasks_status[session_id]['status'] = 'ISO_PRINCIPLE_READY'
        print(f"[{session_id}] 状态更新 -> ISO_PRINCIPLE_READY")
        time.sleep(13)

        # === 步骤 4: 音乐检索 ===
        tasks_status[session_id]['status'] = 'MI_PENDING'
        search_desc = kg_full_result.get("text_description", "轻松舒缓的音乐")
        music_search_result = music_retriever.search_by_description(description=search_desc, duration=duration, top_k=1)
        
        if music_search_result.get("success") and music_search_result.get("results"):
            video_name = music_search_result["results"][0].get("video_name", "unknown")
            R2_PUBLIC_URL = "https://pub-263b71ccbad648af97436d9666ca337e.r2.dev"
            video_url = f"{R2_PUBLIC_URL}/segments_{duration}/{video_name}.mp4"
            video_package = {"url": video_url, "fileName": video_name, "displayNameKey": "video_title_generic"}
        else:
            video_package = {"url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm", "fileName": "fallback_01", "displayNameKey": "video_title_fallback"}
        
        tasks_status[session_id]['result']['video'] = video_package
        tasks_status[session_id]['status'] = 'VIDEO_READY'
        print(f"[{session_id}] 状态更新 -> VIDEO_READY. 任务完成。")

    except Exception as e:
        print(f"[{session_id}] ❌ 后台任务发生错误: {e}")
        import traceback
        traceback.print_exc()
        tasks_status[session_id]['status'] = 'ERROR'
        tasks_status[session_id]['error_message'] = str(e)

@app.route('/api/create_session', methods=['POST'])
def create_session():
    text = request.json.get('text')
    if not text: return jsonify({'error': 'Missing text'}), 400
    session_id = str(uuid.uuid4())
    tasks_status[session_id] = {'status': 'PENDING', 'result': {}}
    thread = Thread(target=background_task, args=(session_id, text))
    thread.start()
    return jsonify({'sessionId': session_id})

@app.route('/api/session_status')
def get_status():
    session_id = request.args.get('id')
    if not session_id or session_id not in tasks_status:
        return jsonify({'error': 'Invalid session ID'}), 404
    return jsonify(tasks_status[session_id])

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)