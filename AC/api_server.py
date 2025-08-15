#!/usr/bin/env python3
"""
EmoHeal API 服务器
提供情感分析REST API接口，支持前端调用
"""

import sys
import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import BadRequest, InternalServerError

# 添加项目路径
sys.path.append(str(Path(__file__).parent))

try:
    from inference_api import EmotionInferenceAPI
    from config import COWEN_KELTNER_EMOTIONS
except ImportError as e:
    print(f"⚠️ 无法导入情感分析模块: {e}")
    print("请确保AC模块正确安装和配置")

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建Flask应用
app = Flask(__name__)
app.config['SECRET_KEY'] = 'emoheal-secret-key-change-in-production'
app.config['JSON_AS_ASCII'] = False  # 支持中文JSON输出

# 启用CORS支持
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # 生产环境应该指定具体域名
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 全局变量
emotion_api: Optional[EmotionInferenceAPI] = None

def initialize_emotion_api():
    """初始化情感分析API"""
    global emotion_api
    
    try:
        logger.info("🧠 初始化情感分析API...")
        emotion_api = EmotionInferenceAPI(load_finetuned=True)
        logger.info("✅ 情感分析API初始化成功")
        return True
    except Exception as e:
        logger.error(f"❌ 情感分析API初始化失败: {e}")
        # 尝试使用预训练模型
        try:
            logger.info("🔄 尝试使用预训练模型...")
            emotion_api = EmotionInferenceAPI(load_finetuned=False)
            logger.info("✅ 预训练模型加载成功")
            return True
        except Exception as e2:
            logger.error(f"❌ 预训练模型也无法加载: {e2}")
            return False

@app.before_first_request
def startup():
    """应用启动时的初始化"""
    logger.info("🚀 启动EmoHeal API服务器")
    
    # 初始化情感分析API
    if not initialize_emotion_api():
        logger.warning("⚠️ 情感分析功能不可用，将使用模拟数据")

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    global emotion_api
    
    status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "emotion_api_available": emotion_api is not None
    }
    
    return jsonify(status), 200

@app.route('/api/emotion/analyze-with-context', methods=['POST', 'OPTIONS'])
def analyze_emotion_with_context():
    """
    情感分析接口 - 带上下文信息
    
    请求格式:
    {
        "text": "用户输入的文本",
        "include_suggestions": true
    }
    
    返回格式:
    {
        "input_text": "原始文本",
        "emotion_vector": [27维情感向量],
        "emotion_dict": {"情感名": 强度值},
        "top_emotions": [["情感名", 强度值], ...],
        "statistics": {
            "total_intensity": 总强度,
            "max_intensity": 最大强度,
            "active_emotions_count": 活跃情感数量,
            "emotion_balance": {
                "positive": 积极情感比例,
                "negative": 消极情感比例,
                "neutral": 中性情感比例
            }
        },
        "primary_emotion": ["主要情感", 强度],
        "analysis_timestamp": "分析时间戳"
    }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # 验证请求数据
        if not request.is_json:
            raise BadRequest("请求必须是JSON格式")
        
        data = request.get_json()
        if not data:
            raise BadRequest("请求数据不能为空")
        
        text = data.get('text', '').strip()
        if not text:
            raise BadRequest("文本内容不能为空")
        
        if len(text) < 2:
            raise BadRequest("文本内容太短，至少需要2个字符")
        
        if len(text) > 1000:
            raise BadRequest("文本内容太长，最多支持1000个字符")
        
        logger.info(f"🔍 分析请求: {text[:50]}...")
        
        # 调用情感分析
        if emotion_api:
            # 使用真实的情感分析API
            result = emotion_api.analyze_emotion_with_context(text)
        else:
            # 使用模拟数据
            logger.warning("⚠️ 使用模拟情感分析数据")
            result = generate_mock_emotion_analysis(text)
        
        # 确保返回数据格式正确
        validated_result = validate_analysis_result(result)
        
        logger.info("✅ 情感分析完成")
        
        return jsonify(validated_result), 200
        
    except BadRequest as e:
        logger.warning(f"⚠️ 请求错误: {e.description}")
        return jsonify({
            "error": "请求错误", 
            "message": e.description
        }), 400
        
    except Exception as e:
        logger.error(f"❌ 分析过程发生错误: {e}")
        return jsonify({
            "error": "分析失败",
            "message": "服务器内部错误，请稍后重试"
        }), 500

@app.route('/api/emotion/emotions-list', methods=['GET'])
def get_emotions_list():
    """获取支持的情感列表"""
    try:
        emotions_info = []
        
        for emotion_zh in COWEN_KELTNER_EMOTIONS:
            emotion_info = {
                "zh": emotion_zh,
                "en": get_emotion_english_name(emotion_zh),
                "category": get_emotion_category(emotion_zh)
            }
            emotions_info.append(emotion_info)
        
        return jsonify({
            "emotions": emotions_info,
            "total_count": len(emotions_info),
            "categories": {
                "positive": ["快乐", "兴奋", "娱乐", "钦佩", "崇拜", "审美欣赏", "敬畏", "入迷", "兴趣", "浪漫"],
                "negative": ["愤怒", "焦虑", "悲伤", "恐惧", "内疚", "恐怖", "失望", "厌恶", "嫉妒", "蔑视"],
                "neutral": ["平静", "无聊", "困惑", "尴尬", "同情", "渴望", "怀旧"]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"❌ 获取情感列表失败: {e}")
        return jsonify({"error": "获取情感列表失败"}), 500

@app.route('/api/emotion/batch-analyze', methods=['POST'])
def batch_analyze_emotions():
    """批量情感分析接口"""
    try:
        if not request.is_json:
            raise BadRequest("请求必须是JSON格式")
        
        data = request.get_json()
        texts = data.get('texts', [])
        
        if not texts or not isinstance(texts, list):
            raise BadRequest("texts字段必须是非空数组")
        
        if len(texts) > 10:
            raise BadRequest("批量分析最多支持10个文本")
        
        results = []
        for text in texts:
            if not isinstance(text, str) or not text.strip():
                continue
                
            if emotion_api:
                result = emotion_api.analyze_emotion_with_context(text.strip())
            else:
                result = generate_mock_emotion_analysis(text.strip())
            
            results.append(validate_analysis_result(result))
        
        return jsonify({
            "results": results,
            "count": len(results),
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except BadRequest as e:
        return jsonify({"error": e.description}), 400
    except Exception as e:
        logger.error(f"❌ 批量分析失败: {e}")
        return jsonify({"error": "批量分析失败"}), 500

def generate_mock_emotion_analysis(text: str) -> Dict[str, Any]:
    """生成模拟的情感分析结果"""
    import random
    import numpy as np
    
    # 简单的关键词情感映射
    emotion_keywords = {
        "快乐": ["开心", "高兴", "快乐", "愉悦", "happy", "joy", "glad"],
        "悲伤": ["悲伤", "难过", "伤心", "痛苦", "sad", "sorrow", "grief"],
        "愤怒": ["愤怒", "生气", "愤恨", "愤慨", "angry", "mad", "furious"],
        "焦虑": ["焦虑", "紧张", "担心", "不安", "anxiety", "worried", "nervous"],
        "恐惧": ["害怕", "恐惧", "恐慌", "恐怖", "fear", "scared", "afraid"],
        "平静": ["平静", "安静", "宁静", "放松", "calm", "peaceful", "serene"]
    }
    
    # 检测文本中的情感关键词
    detected_emotions = {}
    text_lower = text.lower()
    
    for emotion, keywords in emotion_keywords.items():
        score = 0
        for keyword in keywords:
            if keyword in text_lower:
                score += 0.3 + random.random() * 0.5
        
        if score > 0:
            detected_emotions[emotion] = min(score, 1.0)
    
    # 如果没有检测到关键词，生成随机情感
    if not detected_emotions:
        primary_emotion = random.choice(list(emotion_keywords.keys()))
        detected_emotions[primary_emotion] = 0.4 + random.random() * 0.4
    
    # 生成27维向量
    emotion_vector = np.zeros(27, dtype=np.float32)
    emotion_dict = {}
    
    for i, emotion_name in enumerate(COWEN_KELTNER_EMOTIONS):
        if emotion_name in detected_emotions:
            intensity = detected_emotions[emotion_name]
        else:
            intensity = random.random() * 0.2  # 低强度随机值
        
        emotion_vector[i] = intensity
        emotion_dict[emotion_name] = float(intensity)
    
    # 获取前5个最强的情感
    top_emotions = sorted(emotion_dict.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # 计算统计信息
    total_intensity = float(np.sum(emotion_vector))
    max_intensity = float(np.max(emotion_vector))
    active_emotions = len([x for x in emotion_vector if x > 0.1])
    
    # 情感平衡计算
    positive_emotions = ["快乐", "兴奋", "娱乐", "钦佩", "崇拜", "审美欣赏", "敬畏", "入迷", "兴趣", "浪漫"]
    negative_emotions = ["愤怒", "焦虑", "悲伤", "恐惧", "内疚", "恐怖", "失望", "厌恶", "嫉妒", "蔑视"]
    
    positive_score = sum(emotion_dict.get(e, 0) for e in positive_emotions)
    negative_score = sum(emotion_dict.get(e, 0) for e in negative_emotions)
    neutral_score = total_intensity - positive_score - negative_score
    
    return {
        "input_text": text,
        "emotion_vector": emotion_vector.tolist(),
        "emotion_dict": emotion_dict,
        "top_emotions": top_emotions,
        "statistics": {
            "total_intensity": total_intensity,
            "max_intensity": max_intensity,
            "active_emotions_count": active_emotions,
            "emotion_balance": {
                "positive": positive_score,
                "negative": negative_score,
                "neutral": max(neutral_score, 0)
            }
        },
        "primary_emotion": top_emotions[0] if top_emotions else ["平静", 0.5],
        "analysis_timestamp": datetime.now().isoformat()
    }

def validate_analysis_result(result: Dict[str, Any]) -> Dict[str, Any]:
    """验证和规范化分析结果"""
    # 确保必需字段存在
    required_fields = [
        'input_text', 'emotion_vector', 'emotion_dict', 
        'top_emotions', 'statistics', 'primary_emotion'
    ]
    
    for field in required_fields:
        if field not in result:
            raise ValueError(f"分析结果缺少必需字段: {field}")
    
    # 验证emotion_vector长度
    if len(result['emotion_vector']) != 27:
        raise ValueError("情感向量长度必须是27")
    
    # 验证statistics结构
    stats = result['statistics']
    required_stats = ['total_intensity', 'max_intensity', 'active_emotions_count', 'emotion_balance']
    
    for stat in required_stats:
        if stat not in stats:
            raise ValueError(f"统计信息缺少字段: {stat}")
    
    # 验证emotion_balance结构
    balance = stats['emotion_balance']
    required_balance = ['positive', 'negative', 'neutral']
    
    for bal in required_balance:
        if bal not in balance:
            raise ValueError(f"情感平衡信息缺少字段: {bal}")
    
    return result

def get_emotion_english_name(chinese_name: str) -> str:
    """获取中文情感对应的英文名称"""
    emotion_mapping = {
        "钦佩": "Admiration",
        "崇拜": "Adoration", 
        "审美欣赏": "Aesthetic Appreciation",
        "娱乐": "Amusement",
        "愤怒": "Anger",
        "焦虑": "Anxiety",
        "敬畏": "Awe",
        "尴尬": "Embarrassment",
        "无聊": "Boredom",
        "平静": "Calmness",
        "困惑": "Confusion",
        "蔑视": "Contempt",
        "渴望": "Craving",
        "失望": "Disappointment",
        "厌恶": "Disgust",
        "同情": "Empathic Pain",
        "入迷": "Entrancement",
        "嫉妒": "Envy",
        "兴奋": "Excitement",
        "恐惧": "Fear",
        "内疚": "Guilt",
        "恐怖": "Horror",
        "兴趣": "Interest",
        "快乐": "Joy",
        "怀旧": "Nostalgia",
        "浪漫": "Romance",
        "悲伤": "Sadness"
    }
    
    return emotion_mapping.get(chinese_name, chinese_name)

def get_emotion_category(emotion_name: str) -> str:
    """获取情感类别"""
    positive_emotions = ["快乐", "兴奋", "娱乐", "钦佩", "崇拜", "审美欣赏", "敬畏", "入迷", "兴趣", "浪漫"]
    negative_emotions = ["愤怒", "焦虑", "悲伤", "恐惧", "内疚", "恐怖", "失望", "厌恶", "嫉妒", "蔑视"]
    
    if emotion_name in positive_emotions:
        return "positive"
    elif emotion_name in negative_emotions:
        return "negative"
    else:
        return "neutral"

@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify({
        "error": "接口不存在",
        "message": f"请求的路径 {request.path} 不存在"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    return jsonify({
        "error": "服务器内部错误",
        "message": "服务器遇到了问题，请稍后重试"
    }), 500

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='EmoHeal API Server')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=5000, help='Port to bind to')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    print(f"""
🎵 EmoHeal API Server
====================
Host: {args.host}
Port: {args.port}
Debug: {args.debug}
    
API Endpoints:
- GET  /api/health                     - 健康检查
- POST /api/emotion/analyze-with-context - 情感分析
- GET  /api/emotion/emotions-list      - 情感列表
- POST /api/emotion/batch-analyze      - 批量分析

Frontend URL: http://{args.host}:{args.port}/
API Base URL: http://{args.host}:{args.port}/api/
""")
    
    app.run(
        host=args.host,
        port=args.port,
        debug=args.debug,
        use_reloader=args.debug
    )