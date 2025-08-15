# api_server.py (V2 - Polling Architecture)

import uuid
import time
from threading import Thread
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import sys
from pathlib import Path

# --- 1. 添加模块路径，确保能找到你的算法模块 ---
# (请根据你的实际文件夹结构确认路径是否正确)
sys.path.append(str(Path(__file__).parent.parent / "AC"))
sys.path.append(str(Path(__file__).parent.parent / "KG"))
sys.path.append(str(Path(__file__).parent.parent / "MI_retrieve"))

# --- 2. 导入你的算法模块的"内部API" ---
from inference_api import EmotionInferenceAPI
from emotion_music_bridge import EmotionMusicBridge
from music_search_api import MusicSearchAPI

# --- 3. Flask应用初始化 ---
app = Flask(__name__)
# 配置CORS，允许你的前端(通常在不同端口)访问后端
CORS(app) 

# --- 4. 初始化所有算法模块实例 (Level 3设计) ---
# 在服务器启动时，就一次性加载好所有模型
print("🚀 服务器启动中：正在初始化核心算法模块...")
try:
    emotion_analyzer = EmotionInferenceAPI()
    kg_bridge = EmotionMusicBridge(enable_mi_retrieve=True)
    music_retriever = MusicSearchAPI()
    print("✅ 所有模块初始化成功！")
except Exception as e:
    print(f"❌ 模块初始化失败: {e}")
    # 在实际应用中，这里应该退出程序
    emotion_analyzer = kg_bridge = music_retriever = None

# --- 5. 任务状态中心 ---
tasks_status = {}




# =================================================================
#                     后台任务 (内部API的指挥官)
# =================================================================
def background_task(session_id, text, duration="3min"):
    """
    这个函数在独立的线程中运行，负责编排和调用所有内部API。
    (最终完整版 V2 - 调整了延时以匹配前端节奏)
    """
    global tasks_status
    print(f"[{session_id}] 后台任务已启动，处理文本: '{text}'")

    try:
        # --- 步骤 1: 情感分析 ---
        tasks_status[session_id]['status'] = 'AC_PENDING'
        top_emotions = emotion_analyzer.analyze_single_text(text, output_format='top_k')
        
        primary_emotion = top_emotions[0][0] if top_emotions else "平静"
        secondary_emotion = top_emotions[1][0] if len(top_emotions) > 1 else "稳定"
        analysis_result_package = {
            "title": primary_emotion,
            "description": f"系统捕捉到您的核心情绪是“{primary_emotion}”，并伴有“{secondary_emotion}”的感觉。正在为您解码匹配的音乐密码..."
        }
        tasks_status[session_id]['result']['analysisResult'] = analysis_result_package
        tasks_status[session_id]['status'] = 'AC_COMPLETE'
        print(f"[{session_id}] 状态更新 -> AC_COMPLETE")
        
        # ★★★ 关键修改 ★★★
        # 前端在这一步会展示3.5秒，所以后端至少要停留这么久。我们设为4秒。
        time.sleep(4) 

        # --- 步骤 2: 知识图谱 ---
        tasks_status[session_id]['status'] = 'KG_PENDING'
        emotion_vector = emotion_analyzer.get_emotion_for_kg_module(text)
        kg_full_result = kg_bridge.analyze_emotion_and_recommend_music(emotion_vector=emotion_vector, duration=duration, top_k=1)
        
        music_params = kg_full_result.get("music_parameters", {})
        kg_result_package = {
            "title": "疗愈处方已生成",
            "details": [
                f"音乐主题: {music_params.get('theme', '未知')}",
                f"建议节奏: {music_params.get('tempo', '未知')}",
                f"调式: {music_params.get('mode', '未知')}"
            ]
        }
        tasks_status[session_id]['result']['kgResult'] = kg_result_package
        tasks_status[session_id]['status'] = 'KG_COMPLETE'
        print(f"[{session_id}] 状态更新 -> KG_COMPLETE")

        # ★★★ 关键修改 ★★★
        # 前端在这一步会展示4秒，所以后端至少要停留这么久。我们设为4.5秒。
        time.sleep(4.5)

        # --- 步骤 3: ISO原则 ---
        tasks_status[session_id]['status'] = 'ISO_PRINCIPLE_PENDING'
        therapy_rec = kg_full_result.get("therapy_recommendation", {})
        iso_principle_package = {
            "title": f"正在应用：{therapy_rec.get('principle', '同质原理 (ISO Principle)')}",
            "description": therapy_rec.get('explanation', "“同质原理”是音乐治疗的核心理念之一，意指用与您当前情绪状态相似的音乐来引导共鸣，从而达到宣泄、接受并最终转化的疗愈效果。")
        }
        tasks_status[session_id]['result']['isoPrinciple'] = iso_principle_package
        tasks_status[session_id]['status'] = 'ISO_PRINCIPLE_READY'
        print(f"[{session_id}] 状态更新 -> ISO_PRINCIPLE_READY")
        
        # ★★★ 关键修改 ★★★
        # 前端在这一步会展示5秒，所以后端至少要停留这么久。我们设为5.5秒。
        time.sleep(5.5)

        # --- 步骤 4: 音乐检索 ---
        tasks_status[session_id]['status'] = 'MI_PENDING'
        search_desc = kg_full_result.get("text_description", "轻松舒缓的音乐")
        music_search_result = music_retriever.search_by_description(description=search_desc, duration=duration, top_k=1)
        
        if music_search_result.get("success") and music_search_result.get("results"):
            first_song = music_search_result["results"][0]
            video_name = first_song.get("video_name", "unknown_video")
            R2_PUBLIC_URL = "https://pub-263b71ccbad648af97436d9666ca337e.r2.dev"
            full_url = f"{R2_PUBLIC_URL}/segments_{duration}/{video_name}.mp4"
            
            video_package = { "url": full_url, "title": video_name }
        else:
            video_package = { "url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm", "title": "疗愈之声 (备用)" }

        tasks_status[session_id]['result']['video'] = video_package
        tasks_status[session_id]['status'] = 'VIDEO_READY'
        print(f"[{session_id}] 状态更新 -> VIDEO_READY. 任务完成。")

    except Exception as e:
        print(f"[{session_id}] ❌ 后台任务发生错误: {e}")
        tasks_status[session_id]['status'] = 'ERROR'
        tasks_status[session_id]['error_message'] = str(e)



# =================================================================
#                       外部API (前端的唯一入口)
# =================================================================
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

# -------------------- 6. 启动服务器的“点火开关” --------------------
if __name__ == '__main__':
    # 使用一个与常见前端开发端口不同的端口，比如5001
    app.run(host='127.0.0.1', port=5001, debug=True)