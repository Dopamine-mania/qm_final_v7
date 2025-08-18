# emotion_music_bridge.py (V4 - 疗愈机理文字解耦版)

import sys
import numpy as np
import logging
from pathlib import Path
from typing import Dict, Any
import traceback

sys.path.append(str(Path(__file__).parent.parent / "MI_retrieve"))
from knowledge_graph import KnowledgeGraph

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmotionMusicBridge:
    def __init__(self, enable_mi_retrieve: bool = True):
        self.kg = KnowledgeGraph()
        self.enable_mi_retrieve = enable_mi_retrieve
        self.mi_retrieve_api = None
        if enable_mi_retrieve:
            try:
                from music_search_api import MusicSearchAPI
                self.mi_retrieve_api = MusicSearchAPI()
                logger.info("✅ MI_retrieve模块加载成功")
            except ImportError as e:
                logger.warning(f"⚠️  MI_retrieve模块加载失败: {e}")
                self.enable_mi_retrieve = False
        logger.info("🌉 情绪-音乐桥接器初始化完成")

    def get_therapy_parameters_only(self, emotion_vector: np.ndarray) -> Dict[str, Any]:
        try:
            emotion_vector = np.array(emotion_vector)
            if emotion_vector.shape[0] != 27: raise ValueError("情绪向量维度错误")
            
            emotion_analysis = self.kg.analyze_emotion_vector(emotion_vector)
            search_params = self.kg.get_music_search_parameters(emotion_vector)
            therapy_recommendation = self._generate_therapy_recommendation(emotion_analysis)
            
            return {
                "success": True,
                "emotion_analysis": emotion_analysis,
                "structured_params": search_params["structured_params"],
                "therapy_recommendation": therapy_recommendation,
                "text_description": search_params["text_description"],
                "emotion_context": search_params["emotion_context"]
            }
        except Exception as e:
            logger.error(f"❌ 获取治疗参数失败: {e}")
            traceback.print_exc()
            return {"success": False, "error": str(e)}

    # ★★★★★ 核心修改点 ★★★★★
    def _generate_therapy_recommendation(self, emotion_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        修改版：返回疗愈机理的Key，而不是硬编码的中文文本
        """
        max_emotion_name, _ = emotion_analysis["max_emotion"]
        
        # 默认推荐
        recommendations = {
            "primary_focus_key": "focus_balance",
            "therapy_approach_key": "approach_integration"
        }
        
        if max_emotion_name in ["焦虑", "恐惧", "恐怖"]:
            recommendations["primary_focus_key"] = "focus_anxiety_relief"
            recommendations["therapy_approach_key"] = "approach_anxiety_relief"
        elif max_emotion_name in ["愤怒", "厌恶", "蔑视"]:
            recommendations["primary_focus_key"] = "focus_anger_release"
            recommendations["therapy_approach_key"] = "approach_anger_release"
        elif max_emotion_name in ["悲伤", "失望", "内疚"]:
            recommendations["primary_focus_key"] = "focus_sadness_support"
            recommendations["therapy_approach_key"] = "approach_sadness_support"
        elif max_emotion_name in ["快乐", "兴奋", "娱乐"]:
            recommendations["primary_focus_key"] = "focus_positive_maintenance"
            recommendations["therapy_approach_key"] = "approach_positive_maintenance"
            
        return recommendations

    def analyze_emotion_and_recommend_music(self, emotion_vector: np.ndarray, 
                                          duration: str = "3min", 
                                          top_k: int = 5) -> Dict[str, Any]:
        try:
            full_params = self.get_therapy_parameters_only(emotion_vector)
            if not full_params["success"]:
                raise Exception(full_params.get("error", "获取治疗参数失败"))
            result = {**full_params, "music_search_results": None}
            if self.enable_mi_retrieve and self.mi_retrieve_api:
                search_result = self.mi_retrieve_api.search_by_description(description=full_params["text_description"], duration=duration, top_k=top_k)
                if search_result["success"]: result["music_search_results"] = search_result
                else: result["music_search_error"] = search_result["error"]
            return result
        except Exception as e:
            logger.error(f"❌ 情绪音乐分析失败: {e}")
            return {"success": False, "error": str(e)}