#!/usr/bin/env python3
"""
🌙 音乐疗愈AI系统 - 统一后端API服务器
整合AC（情感计算）、KG（知识图谱）、MI_retrieve（音乐检索）三大模块
为前端提供RESTful API接口
"""

import os
import sys
import json
import logging
import numpy as np
import time
from pathlib import Path
from datetime import datetime
from flask import Flask, request, jsonify, Response, make_response, send_file
from flask_cors import CORS
from typing import Dict, List, Any, Optional, Union

# 添加模块路径
sys.path.append(str(Path(__file__).parent))
sys.path.append(str(Path(__file__).parent / "AC"))
sys.path.append(str(Path(__file__).parent / "KG"))
sys.path.append(str(Path(__file__).parent / "MI_retrieve"))

# 导入核心模块
from AC.inference_api import get_emotion_api, EmotionInferenceAPI
from KG.emotion_music_bridge import EmotionMusicBridge
from MI_retrieve.music_search_api import MusicSearchAPI

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建Flask应用
app = Flask(__name__)

# 配置CORS - 允许前端访问
CORS(app, 
     origins=["http://localhost:3000", "http://127.0.0.1:3000", "null", "*"],
     allow_headers=["Content-Type", "Accept", "Origin", "X-Requested-With"],
     methods=["GET", "POST", "OPTIONS"],
     supports_credentials=True)

# 添加全局CORS处理
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in ["http://localhost:3000", "http://127.0.0.1:3000"]:
        response.headers['Access-Control-Allow-Origin'] = origin
    else:
        response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
    return response

# 全局模块实例
emotion_api: Optional[EmotionInferenceAPI] = None
emotion_bridge: Optional[EmotionMusicBridge] = None
music_api: Optional[MusicSearchAPI] = None

# API配置
API_CONFIG = {
    "version": "1.0.0",
    "name": "音乐疗愈AI系统API",
    "description": "整合情感分析、知识图谱推理和音乐检索的统一API",
    "modules": {
        "AC": "情感计算模块",
        "KG": "知识图谱与治疗推理模块",
        "MI_retrieve": "CLAMP3音乐理解与检索模块"
    }
}

def initialize_modules():
    """初始化所有模块"""
    global emotion_api, emotion_bridge, music_api
    
    try:
        logger.info("🚀 开始初始化API模块...")
        
        # 初始化AC模块
        logger.info("📊 初始化情感计算模块...")
        emotion_api = get_emotion_api(load_finetuned=False)  # 使用预训练模型
        
        # 初始化KG模块和桥接器
        logger.info("🧠 初始化知识图谱模块...")
        emotion_bridge = EmotionMusicBridge(enable_mi_retrieve=True)
        
        # 初始化MI_retrieve模块
        logger.info("🎵 初始化音乐检索模块...")
        music_api = MusicSearchAPI()
        
        logger.info("✅ 所有模块初始化完成！")
        return True
        
    except Exception as e:
        logger.error(f"❌ 模块初始化失败: {e}")
        return False

def create_api_response(success: bool, data: Any = None, error: str = None, **kwargs) -> Dict:
    """创建标准化的API响应格式"""
    response = {
        "success": success,
        "timestamp": datetime.now().isoformat()
    }
    
    if success:
        response["data"] = data
    else:
        response["error"] = error or "Unknown error"
    
    # 添加额外字段
    for key, value in kwargs.items():
        response[key] = value
    
    return response

# ==================== 情感分析端点 (AC模块) ====================

@app.route('/api/emotion/analyze', methods=['POST'])
def analyze_emotion():
    """分析文本情感 - 返回详细的情感分析结果"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify(create_api_response(False, error="Missing 'text' parameter")), 400
        
        text = data['text']
        output_format = data.get('output_format', 'context')
        
        if output_format == 'context':
            # 获取带上下文的完整分析
            result = emotion_api.analyze_emotion_with_context(text)
            return jsonify(create_api_response(True, data=result))
        else:
            # 获取简单结果
            emotion_vector = emotion_api.analyze_single_text(text, output_format='vector')
            emotion_dict = emotion_api.analyze_single_text(text, output_format='dict')
            top_emotions = emotion_api.analyze_single_text(text, output_format='top_k')
            
            result = {
                "input_text": text,
                "emotion_vector": emotion_vector.tolist(),
                "emotion_dict": emotion_dict,
                "top_emotions": top_emotions,
                "primary_emotion": top_emotions[0] if top_emotions else ("平静", 0.0)
            }
            
            return jsonify(create_api_response(True, data=result))
            
    except Exception as e:
        logger.error(f"情感分析错误: {e}")
        return jsonify(create_api_response(False, error=str(e))), 500

@app.route('/api/emotion/vector', methods=['POST'])
def get_emotion_vector():
    """获取27维情感向量 - 专门为KG模块提供"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify(create_api_response(False, error="Missing 'text' parameter")), 400
        
        text = data['text']
        
        # 使用KG接口获取标准化的27维向量
        emotion_vector = emotion_api.get_emotion_for_kg_module(text)
        
        result = {
            "vector": emotion_vector.tolist(),
            "shape": emotion_vector.shape,
            "sum": float(np.sum(emotion_vector))
        }
        
        return jsonify(create_api_response(True, data=result))
        
    except Exception as e:
        logger.error(f"情感向量获取错误: {e}")
        return jsonify(create_api_response(False, error=str(e))), 500

@app.route('/api/analyze/emotion', methods=['POST'])
def analyze_emotion_detailed():
    """详细情感分析 - 返回完整分析结果供前端显示"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify(create_api_response(False, error="Missing 'text' parameter")), 400
        
        text = data['text']
        
        # 获取情感向量
        emotion_vector = emotion_api.get_emotion_for_kg_module(text)
        
        # 获取详细的情感分析
        emotion_dict = emotion_api.mapper.map_ck_vector_to_dict(emotion_vector)
        top_emotions = sorted(emotion_dict.items(), key=lambda x: x[1], reverse=True)
        
        # 构建详细结果
        result = {
            "text": text,
            "primary_emotion": top_emotions[0][0] if len(top_emotions) > 0 else "未知",
            "primary_intensity": float(top_emotions[0][1]) if len(top_emotions) > 0 else 0.0,
            "secondary_emotion": top_emotions[1][0] if len(top_emotions) > 1 else "未知",
            "secondary_intensity": float(top_emotions[1][1]) if len(top_emotions) > 1 else 0.0,
            "vector_sum": float(np.sum(emotion_vector)),
            "active_emotions_count": len([x for x in emotion_vector if x > 0.1]),
            "top_3_emotions": [
                {"name": emotion[0], "intensity": float(emotion[1])} 
                for emotion in top_emotions[:3]
            ],
            "vector": emotion_vector.tolist(),
            "vector_shape": emotion_vector.shape
        }
        
        return jsonify(create_api_response(True, data=result))
        
    except Exception as e:
        logger.error(f"详细情感分析错误: {e}")
        return jsonify(create_api_response(False, error=str(e))), 500

@app.route('/api/emotion/batch', methods=['POST'])
def analyze_batch_emotions():
    """批量情感分析"""
    try:
        data = request.get_json()
        if not data or 'texts' not in data:
            return jsonify(create_api_response(False, error="Missing 'texts' parameter")), 400
        
        texts = data['texts']
        batch_size = data.get('batch_size', 16)
        
        # 批量分析
        emotion_vectors = emotion_api.analyze_batch_texts(texts, batch_size)
        
        # 构建结果列表
        results = []
        for i, text in enumerate(texts):
            vector = emotion_vectors[i]
            emotion_dict = emotion_api.mapper.map_ck_vector_to_dict(vector)
            top_emotions = emotion_api.mapper.get_top_emotions_from_vector(vector, 5)
            
            results.append({
                "input_text": text,
                "emotion_vector": vector.tolist(),
                "emotion_dict": emotion_dict,
                "top_emotions": top_emotions,
                "primary_emotion": top_emotions[0] if top_emotions else ("平静", 0.0)
            })
        
        return jsonify(create_api_response(True, data=results))
        
    except Exception as e:
        logger.error(f"批量情感分析错误: {e}")
        return jsonify(create_api_response(False, error=str(e))), 500

# ==================== 治疗映射端点 (KG模块) ====================

@app.route('/api/therapy/map', methods=['POST'])
def map_therapy():
    """将情感映射到音乐治疗参数"""
    try:
        data = request.get_json()
        if not data or 'emotion_vector' not in data:
            return jsonify(create_api_response(False, error="Missing 'emotion_vector' parameter")), 400
        
        emotion_vector = np.array(data['emotion_vector'])
        
        # 获取治疗参数（不进行音乐检索）
        result = emotion_bridge.get_therapy_parameters_only(emotion_vector)
        
        if result["success"]:
            return jsonify(create_api_response(True, data=result))
        else:
            return jsonify(create_api_response(False, error=result.get("error", "Therapy mapping failed"))), 500
            
    except Exception as e:
        logger.error(f"治疗映射错误: {e}")
        return jsonify(create_api_response(False, error=str(e))), 500

# ==================== 音乐检索端点 (MI_retrieve模块) ====================

@app.route('/api/music/retrieve', methods=['POST'])
def retrieve_music():
    """基于情感向量检索音乐"""
    try:
        data = request.get_json()
        if not data or 'emotion_vector' not in data:
            return jsonify(create_api_response(False, error="Missing 'emotion_vector' parameter")), 400
        
        emotion_vector = np.array(data['emotion_vector'])
        settings = data.get('settings', {})
        duration = settings.get('duration', '3min')
        top_k = settings.get('segment_count', 10)
        
        # 使用桥接器进行完整的情感分析和音乐推荐
        result = emotion_bridge.analyze_emotion_and_recommend_music(
            emotion_vector=emotion_vector,
            duration=duration,
            top_k=top_k
        )
        
        if result["success"] and result.get("music_search_results"):
            # 格式化为前端期望的格式
            segments = []
            for item in result["music_search_results"].get("results", []):
                segments.append({
                    "id": f"segment_{item['video_name']}_{duration}",
                    "title": item['video_name'],
                    "artist": "疗愈音乐库",
                    "duration": _parse_duration(duration),
                    "url": item.get('video_path', ''),
                    "emotionalProfile": {
                        "energy": float(result["music_parameters"].get("energy", 0.5)),
                        "valence": float(result["music_parameters"].get("valence", 0.5)),
                        "tension": float(result["music_parameters"].get("tension", 0.5))
                    },
                    "matchScore": float(item['similarity'])
                })
            
            return jsonify(create_api_response(True, data={"segments": segments}))
        else:
            error_msg = result.get("error") or result.get("music_search_error", "Music retrieval failed")
            return jsonify(create_api_response(False, error=error_msg)), 500
            
    except Exception as e:
        logger.error(f"音乐检索错误: {e}")
        return jsonify(create_api_response(False, error=str(e))), 500

@app.route('/api/music/search-text', methods=['POST'])
def search_music_by_text():
    """基于文本语义检索音乐"""
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify(create_api_response(False, error="Missing 'query' parameter")), 400
        
        query = data['query']
        settings = data.get('settings', {})
        duration = settings.get('duration', '3min')
        max_results = settings.get('max_results', 10)
        
        # 先进行情感分析
        emotion_vector = emotion_api.get_emotion_for_kg_module(query)
        
        # 然后使用情感向量检索音乐
        result = emotion_bridge.search_music_by_emotion(
            emotion_vector=emotion_vector,
            duration=duration,
            top_k=max_results
        )
        
        if result["success"]:
            # 格式化结果
            segments = []
            for item in result.get("results", []):
                # 构建视频路径
                video_name = item['video_name']
                # 根据duration构建完整路径
                video_filename = f"{video_name}.mp4"
                video_path = f"segments_{duration}/{video_filename}"
                
                segments.append({
                    "id": f"segment_{video_name}_{duration}",
                    "title": video_name,
                    "artist": "疗愈音乐库",
                    "duration": _parse_duration(duration),
                    "url": video_path,
                    "video_path": video_path,
                    "matchScore": float(item['similarity'])
                })
            
            return jsonify(create_api_response(True, data={"segments": segments}))
        else:
            return jsonify(create_api_response(False, error=result.get("error", "Text search failed"))), 500
            
    except Exception as e:
        logger.error(f"文本音乐检索错误: {e}")
        return jsonify(create_api_response(False, error=str(e))), 500

@app.route('/api/music/search', methods=['POST'])
def search_music():
    """通用音乐搜索接口 - 支持音频文件搜索"""
    try:
        data = request.get_json()
        
        # 如果提供了描述文本，使用文本搜索
        if 'description' in data:
            return search_music_by_text()
        
        # 如果提供了音频文件路径
        if 'audio_path' in data:
            audio_path = data['audio_path']
            duration = data.get('duration', '3min')
            top_k = data.get('top_k', 5)
            
            result = music_api.search_by_audio_file(
                audio_path=audio_path,
                duration=duration,
                top_k=top_k
            )
            
            if result["success"]:
                return jsonify(create_api_response(True, data=result))
            else:
                return jsonify(create_api_response(False, error=result["error"])), 500
        
        return jsonify(create_api_response(False, error="Missing search parameters")), 400
        
    except Exception as e:
        logger.error(f"音乐搜索错误: {e}")
        return jsonify(create_api_response(False, error=str(e))), 500

# ==================== 健康检查端点 ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """通用健康检查"""
    return jsonify(create_api_response(True, data={
        "status": "healthy",
        "message": "Music Therapy API Server is running",
        "timestamp": datetime.now().isoformat()
    }))

@app.route('/api/emotion/health', methods=['GET'])
def emotion_health():
    """情感模块健康检查"""
    try:
        if emotion_api:
            status = emotion_api.get_api_status()
            return jsonify(create_api_response(True, data={"status": "healthy", "details": status}))
        else:
            return jsonify(create_api_response(False, error="Emotion module not initialized")), 503
    except Exception as e:
        return jsonify(create_api_response(False, error=str(e))), 503

@app.route('/api/music/health', methods=['GET'])
def music_health():
    """音乐模块健康检查"""
    try:
        if music_api:
            return jsonify(create_api_response(True, data={"status": "healthy"}))
        else:
            return jsonify(create_api_response(False, error="Music module not initialized")), 503
    except Exception as e:
        return jsonify(create_api_response(False, error=str(e))), 503

@app.route('/api/session/health', methods=['GET'])
def session_health():
    """会话模块健康检查"""
    try:
        if emotion_bridge:
            status = emotion_bridge.get_bridge_status()
            return jsonify(create_api_response(True, data={"status": "healthy", "details": status}))
        else:
            return jsonify(create_api_response(False, error="Session module not initialized")), 503
    except Exception as e:
        return jsonify(create_api_response(False, error=str(e))), 503

@app.route('/api/status', methods=['GET'])
def api_status():
    """获取API状态信息"""
    try:
        status = {
            "api": API_CONFIG,
            "modules": {
                "emotion": emotion_api is not None,
                "knowledge_graph": emotion_bridge is not None,
                "music_retrieval": music_api is not None
            },
            "services": {
                "emotion_analysis": emotion_api.get_api_status() if emotion_api else None,
                "therapy_mapping": emotion_bridge.get_bridge_status() if emotion_bridge else None
            }
        }
        return jsonify(create_api_response(True, data=status))
    except Exception as e:
        return jsonify(create_api_response(False, error=str(e))), 500

# ==================== 根路径 ====================

@app.route('/', methods=['GET'])
def index():
    """API根路径"""
    return jsonify({
        "name": API_CONFIG["name"],
        "version": API_CONFIG["version"],
        "description": API_CONFIG["description"],
        "endpoints": {
            "emotion": [
                "POST /api/emotion/analyze",
                "POST /api/emotion/vector",
                "POST /api/emotion/batch",
                "GET /api/emotion/health"
            ],
            "therapy": [
                "POST /api/therapy/map"
            ],
            "music": [
                "POST /api/music/retrieve",
                "POST /api/music/search-text",
                "POST /api/music/search",
                "GET /api/music/health"
            ],
            "system": [
                "GET /api/status",
                "GET /api/session/health"
            ]
        }
    })

# ==================== 工具函数 ====================

def _parse_duration(duration_str: str) -> int:
    """解析时长字符串为秒数"""
    duration_map = {
        "1min": 60,
        "3min": 180,
        "5min": 300,
        "10min": 600,
        "20min": 1200,
        "30min": 1800
    }
    return duration_map.get(duration_str, 180)

# ==================== 带进度反馈的音乐检索端点 ====================

@app.route('/api/music/search-with-progress', methods=['POST', 'OPTIONS'])
def search_music_with_progress():
    """带进度反馈的音乐检索接口"""
    # 处理 OPTIONS 请求
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        return response
        
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify(create_api_response(False, error="Missing 'query' parameter")), 400
    
    query = data['query']
    settings = data.get('settings', {})
    duration = settings.get('duration', '3min')
    max_results = settings.get('max_results', 10)
    
    def generate():
        """生成SSE事件流"""
        try:
            # 步骤1: 情感分析
            yield f"data: {json.dumps({'step': 'emotion_analysis', 'status': 'processing', 'message': '正在进行情感分析...', 'progress': 10})}\n\n"
            time.sleep(0.5)  # 模拟处理时间
            
            emotion_vector = emotion_api.get_emotion_for_kg_module(query)
            # 获取主要情绪
            emotion_dict = emotion_api.mapper.map_ck_vector_to_dict(emotion_vector)
            top_emotions = sorted(emotion_dict.items(), key=lambda x: x[1], reverse=True)[:3]
            primary_emotions_str = ', '.join([f"{emo[0]}" for emo in top_emotions])
            
            yield f"data: {json.dumps({'step': 'emotion_analysis', 'status': 'completed', 'message': f'情感分析完成，主要情绪: {primary_emotions_str}', 'progress': 30})}\n\n"
            time.sleep(0.5)
            
            # 步骤2: 情绪-音乐映射
            yield f"data: {json.dumps({'step': 'emotion_mapping', 'status': 'processing', 'message': '正在进行情绪-音乐映射推理...', 'progress': 40})}\n\n"
            time.sleep(0.5)
            
            # 通过桥接器获取音乐参数
            bridge_result = emotion_bridge.analyze_emotion_and_recommend_music(
                emotion_vector=emotion_vector,
                duration=duration,
                top_k=1  # 只需要获取音乐参数
            )
            
            if bridge_result["success"] and "music_parameters" in bridge_result:
                music_params = bridge_result["music_parameters"]
                tempo = music_params.get("tempo", "N/A")
                yield f"data: {json.dumps({'step': 'emotion_mapping', 'status': 'completed', 'message': f'映射完成，建议音乐参数: Tempo={tempo}BPM', 'progress': 60})}\n\n"
            else:
                yield f"data: {json.dumps({'step': 'emotion_mapping', 'status': 'completed', 'message': '映射完成', 'progress': 60})}\n\n"
            time.sleep(0.5)
            
            # 步骤3: 音乐检索
            yield f"data: {json.dumps({'step': 'music_retrieval', 'status': 'processing', 'message': '正在检索匹配的疗愈音乐...', 'progress': 70})}\n\n"
            time.sleep(0.5)
            
            result = emotion_bridge.search_music_by_emotion(
                emotion_vector=emotion_vector,
                duration=duration,
                top_k=max_results
            )
            
            if result["success"]:
                segments = []
                for item in result.get("results", []):
                    # 构建视频路径
                    video_name = item['video_name']
                    # 根据duration构建完整路径
                    video_filename = f"{video_name}.mp4"
                    video_path = f"segments_{duration}/{video_filename}"
                    
                    segments.append({
                        "id": f"segment_{video_name}_{duration}",
                        "title": video_name,
                        "artist": "疗愈音乐库",
                        "duration": _parse_duration(duration),
                        "url": video_path,
                        "video_path": video_path,
                        "matchScore": float(item['similarity'])
                    })
                
                yield f"data: {json.dumps({'step': 'music_retrieval', 'status': 'completed', 'message': f'检索完成，找到 {len(segments)} 首匹配音乐', 'progress': 90})}\n\n"
                time.sleep(0.5)
                
                # 步骤4: 准备播放
                yield f"data: {json.dumps({'step': 'preparation', 'status': 'processing', 'message': '正在准备疗愈音乐...', 'progress': 95})}\n\n"
                time.sleep(0.5)
                
                # 最终结果
                yield f"data: {json.dumps({'step': 'completed', 'status': 'success', 'message': '准备就绪，即将开始音乐疗愈', 'progress': 100, 'data': {'segments': segments}})}\n\n"
            else:
                yield f"data: {json.dumps({'step': 'error', 'status': 'failed', 'message': result.get('error', '音乐检索失败'), 'progress': 0})}\n\n"
                
        except Exception as e:
            logger.error(f"进度反馈错误: {e}")
            yield f"data: {json.dumps({'step': 'error', 'status': 'failed', 'message': str(e), 'progress': 0})}\n\n"
    
    response = Response(generate(), mimetype="text/event-stream")
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Cache-Control', 'no-cache')
    response.headers.add('X-Accel-Buffering', 'no')
    return response

# ==================== 视频流端点 ====================

@app.route('/api/video/<path:video_path>')
def stream_video(video_path):
    """提供视频文件流"""
    try:
        # 安全检查：确保路径不包含危险字符
        if '..' in video_path or video_path.startswith('/'):
            return jsonify(create_api_response(False, error="Invalid video path")), 400
        
        # 如果是绝对路径，直接使用
        if video_path.startswith('/'):
            full_path = video_path
        else:
            # 尝试多个可能的路径
            possible_paths = [
                os.path.join(os.path.dirname(__file__), 'MI_retrieve', 'retrieve_libraries', video_path),
                os.path.join(os.path.dirname(__file__), video_path),
                os.path.join(os.path.dirname(__file__), 'materials', video_path),
                video_path  # 如果已经是完整路径
            ]
            
            full_path = None
            for path in possible_paths:
                logger.info(f"尝试路径: {path}")
                if os.path.exists(path):
                    full_path = path
                    logger.info(f"找到视频文件: {path}")
                    break
            
            if not full_path:
                logger.error(f"视频文件不存在: {video_path}")
                logger.error(f"尝试的路径: {possible_paths}")
                return jsonify(create_api_response(False, error=f"Video not found: {video_path}")), 404
        
        # 返回视频文件
        return send_file(full_path, mimetype='video/mp4')
        
    except Exception as e:
        logger.error(f"视频流错误: {e}")
        return jsonify(create_api_response(False, error=str(e))), 500

# ==================== 错误处理 ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify(create_api_response(False, error="Endpoint not found")), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify(create_api_response(False, error="Internal server error")), 500

# ==================== 主程序 ====================

def main():
    """主函数"""
    logger.info("🌙 音乐疗愈AI系统 - 统一后端API服务器")
    logger.info("=" * 50)
    
    # 初始化模块
    if not initialize_modules():
        logger.error("❌ 模块初始化失败，退出程序")
        sys.exit(1)
    
    # 启动服务器
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"🚀 API服务器启动在端口 {port}")
    logger.info(f"📡 前端CORS已配置: http://localhost:3000")
    logger.info(f"📝 API文档: http://127.0.0.1:{port}/")
    
    app.run(
        host='127.0.0.1',
        port=port,
        debug=debug
    )

if __name__ == '__main__':
    main()