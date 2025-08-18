# knowledge_graph.py (V3 - 最终确认版)

import numpy as np
import logging
from typing import Dict, List, Tuple, Any, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MusicRule:
    def __init__(self, key: str, name: str, conditions: Dict[str, float], 
                 parameters: Dict[str, Any], priority: str = "medium"):
        self.key = key
        self.name = name
        self.conditions = conditions
        self.parameters = parameters
        self.priority_weights = {"critical": 4, "high": 3, "medium": 2, "low": 1}
    
    def evaluate(self, emotion_dict: Dict[str, float]) -> Tuple[bool, float]:
        total_match_strength, matched_conditions = 0.0, 0
        if not self.conditions: return False, 0.0
        for emotion_name, threshold in self.conditions.items():
            if emotion_name in emotion_dict and emotion_dict[emotion_name] >= threshold:
                total_match_strength += emotion_dict[emotion_name] - threshold
                matched_conditions += 1
            else:
                return False, 0.0
        if matched_conditions == len(self.conditions):
            avg_match_strength = total_match_strength / len(self.conditions)
            return True, avg_match_strength * self.priority_weights[self.priority]
        return False, 0.0

class KnowledgeGraph:
    def __init__(self):
        self.emotion_names = [
            "钦佩", "崇拜", "审美欣赏", "娱乐", "愤怒", "焦虑", "敬畏", "尴尬", "无聊", "平静", 
            "困惑", "蔑视", "渴望", "失望", "厌恶", "同情", "入迷", "嫉妒", "兴奋", "恐惧", 
            "内疚", "恐怖", "兴趣", "快乐", "怀旧", "浪漫", "悲伤"
        ]
        self.default_music_parameters = {
            'tempo': 80.0, 'mode': 0.5, 'dynamics': 0.5, 'harmony_consonance': 0.5,
            'timbre_preference': 'neutral_pad', 'pitch_register': 0.5, 'density': 0.5,
        }
        self.rules = []
        self._initialize_gems_rules()
        logger.info(f"✅ 知识图谱初始化完成. 规则数量: {len(self.rules)}")
    
    def _initialize_gems_rules(self):
        self.rules.append(MusicRule("anxiety_relief_critical", "极度焦虑缓解", {"焦虑": 0.8}, {'tempo': 60.0, 'mode': 0.7, 'dynamics': 0.3, 'harmony_consonance': 0.8, 'timbre_preference': 'warm_pad'}, "critical"))
        self.rules.append(MusicRule("anger_release", "愤怒情绪疏导", {"愤怒": 0.8}, {'tempo': 90.0, 'mode': 0.4, 'dynamics': 0.6, 'harmony_consonance': 0.3, 'timbre_preference': 'expressive_strings'}, "critical"))
        self.rules.append(MusicRule("fear_soothing", "恐惧安抚", {"恐惧": 0.8}, {'tempo': 55.0, 'mode': 0.8, 'dynamics': 0.2, 'harmony_consonance': 0.9, 'timbre_preference': 'soft_choir'}, "critical"))
        self.rules.append(MusicRule("calm_maintenance", "平静状态维持", {"平静": 0.7}, {'tempo': 65.0, 'mode': 0.6, 'dynamics': 0.4, 'harmony_consonance': 0.7, 'timbre_preference': 'nature_sounds'}, "high"))
        self.rules.append(MusicRule("sadness_support", "悲伤情感支持", {"悲伤": 0.7}, {'tempo': 70.0, 'mode': 0.3, 'dynamics': 0.4, 'harmony_consonance': 0.6, 'timbre_preference': 'gentle_piano'}, "high"))
        self.rules.append(MusicRule("joy_energy", "快乐能量维持", {"快乐": 0.7}, {'tempo': 100.0, 'mode': 0.8, 'dynamics': 0.7, 'harmony_consonance': 0.8, 'timbre_preference': 'bright_ensemble'}, "high"))
        self.rules.append(MusicRule("anxiety_relief_moderate", "中度焦虑缓解", {"焦虑": 0.5}, {'tempo': 75.0, 'mode': 0.6, 'dynamics': 0.4, 'harmony_consonance': 0.7, 'timbre_preference': 'ambient_pad'}, "medium"))
        self.rules.append(MusicRule("positive_excitement", "积极兴奋状态", {"兴奋": 0.6, "快乐": 0.5}, {'tempo': 110.0, 'mode': 0.8, 'dynamics': 0.7, 'harmony_consonance': 0.7, 'timbre_preference': 'energetic_mix'}, "medium"))
        self.rules.append(MusicRule("nostalgia_comfort", "怀旧情感抚慰", {"怀旧": 0.6}, {'tempo': 85.0, 'mode': 0.5, 'dynamics': 0.5, 'harmony_consonance': 0.6, 'timbre_preference': 'vintage_warmth'}, "medium"))
        self.rules.append(MusicRule("interest_sparking", "兴趣激发", {"无聊": 0.4}, {'tempo': 95.0, 'mode': 0.6, 'dynamics': 0.6, 'harmony_consonance': 0.6, 'timbre_preference': 'interesting_textures'}, "low"))

    def _vector_to_emotion_dict(self, emotion_vector: np.ndarray) -> Dict[str, float]:
        return {name: float(emotion_vector[i]) for i, name in enumerate(self.emotion_names)}

    def get_initial_music_parameters(self, emotion_vector: np.ndarray) -> Tuple[Dict[str, Any], Optional[str]]:
        """
        V3 - 最终增强版：扩大动态调整的覆盖范围，解决medium问题
        """
        try:
            emotion_dict = self._vector_to_emotion_dict(np.clip(np.array(emotion_vector), 0, 1))
            best_rule, best_match_strength = None, -1.0
            
            for rule in self.rules:
                is_match, match_strength = rule.evaluate(emotion_dict)
                if is_match and match_strength > best_match_strength:
                    best_match_strength, best_rule = match_strength, rule
            
            music_params, best_rule_key = self.default_music_parameters.copy(), None
            
            if best_rule:
                logger.info(f"🎯 匹配特定规则: {best_rule.name} (Key: {best_rule.key}, 强度: {best_match_strength:.3f})")
                music_params.update(best_rule.parameters)
                best_rule_key = best_rule.key
            else:
                logger.info("🔍 未找到特定规则，启动增强版动态参数调整...")
                
                # ★★★★★ 核心升级：将7种基础情绪扩展映射到全部27种情绪 ★★★★★
                
                # 1. 定义7种基石情绪的调整因子
                base_factors = {
                    'joy':      [ 0.3,  0.4,  0.3,  0.3,  0.2,  0.2], # 快乐
                    'excitement': [ 0.4,  0.3,  0.4,  0.2,  0.3,  0.3], # 兴奋
                    'calm':     [-0.3,  0.2, -0.4,  0.4, -0.2, -0.4], # 平静
                    'sadness':  [-0.2, -0.3, -0.2,  0.1, -0.3, -0.2], # 悲伤
                    'anger':    [ 0.2, -0.2,  0.4, -0.4,  0.1,  0.3], # 愤怒
                    'anxiety':  [ 0.1, -0.1,  0.1, -0.3,  0.2,  0.2], # 焦虑
                    'fear':     [-0.1,  0.1, -0.3,  0.2,  0.1, -0.3], # 恐惧
                }

                # 2. 构建一个从27种情绪到7种基石情绪的映射
                emotion_mapping = {
                    # 映射到 'joy'
                    "快乐": 'joy', "钦佩": 'joy', "崇拜": 'joy', "娱乐": 'joy', "浪漫": 'joy',
                    # 映射到 'excitement'
                    "兴奋": 'excitement', "兴趣": 'excitement', "入迷": 'excitement', "审美欣赏": 'excitement',
                    # 映射到 'calm'
                    "平静": 'calm',
                    # 映射到 'sadness'
                    "悲伤": 'sadness', "失望": 'sadness', "内疚": 'sadness', "同情": 'sadness', "怀旧": 'sadness',
                    # 映射到 'anger'
                    "愤怒": 'anger', "厌恶": 'anger', "蔑视": 'anger', "嫉妒": 'anger',
                    # 映射到 'anxiety'
                    "焦虑": 'anxiety', "渴望": 'anxiety',
                    # 映射到 'fear'
                    "恐惧": 'fear', "恐怖": 'fear', "尴尬": 'fear',
                    # 中性或复杂情绪，暂不施加影响
                    "敬畏": None, "困惑": None, "无聊": None 
                }

                # 3. 基于Top 3情绪及其映射进行加权调整
                sorted_emotions = sorted(emotion_dict.items(), key=lambda item: item[1], reverse=True)
                total_weight, adjustments = 0, np.zeros(6)
                
                for emotion_name, score in sorted_emotions[:3]:
                    if score > 0.1:
                        base_emotion_key = emotion_mapping.get(emotion_name)
                        if base_emotion_key: # 如果该情绪有对应的基石情绪
                            factors = np.array(base_factors[base_emotion_key])
                            adjustments += factors * score
                            total_weight += score

                if total_weight > 0:
                    final_adjustments = adjustments / total_weight
                    music_params['tempo'] += final_adjustments[0] * 50
                    music_params['mode'] = 0.5 + final_adjustments[1]
                    music_params['dynamics'] = 0.5 + final_adjustments[2]
                    music_params['harmony_consonance'] = 0.5 + final_adjustments[3]
                    music_params['pitch_register'] = 0.5 + final_adjustments[4]
                    music_params['density'] = 0.5 + final_adjustments[5]
                    logger.info(f"🔧 动态调整完成. Top1情绪: {sorted_emotions[0][0]}, 调整量: {final_adjustments.round(2)}")
            
            for key, value in music_params.items():
                if isinstance(value, (int, float)):
                    if key == 'tempo':
                        music_params[key] = np.clip(value, 40, 160)
                    else:
                        music_params[key] = np.clip(value, 0, 1)
            
            return music_params, best_rule_key
            
        except Exception as e:
            logger.error(f"❌ 获取音乐参数失败: {e}")
            return self.default_music_parameters.copy(), None

    def get_music_search_parameters(self, emotion_vector: np.ndarray) -> Dict[str, Any]:
        music_params, matched_rule_key = self.get_initial_music_parameters(emotion_vector)
        structured_params = {
            "tempo": music_params['tempo'],
            "mode": "major" if music_params['mode'] > 0.6 else "minor" if music_params['mode'] < 0.4 else "neutral",
            "dynamics": "loud" if music_params['dynamics'] > 0.7 else "soft" if music_params['dynamics'] < 0.3 else "medium",
            "harmony": "consonant" if music_params['harmony_consonance'] > 0.7 else "dissonant" if music_params['harmony_consonance'] < 0.3 else "mixed",
            "timbre": music_params['timbre_preference'],
            "register": "high" if music_params['pitch_register'] > 0.7 else "low" if music_params['pitch_register'] < 0.3 else "medium",
            "density": "dense" if music_params['density'] > 0.7 else "sparse" if music_params['density'] < 0.3 else "medium"
        }
        emotion_context = {"matched_rule_key": matched_rule_key}
        return {
            "text_description": self._generate_text_description(music_params),
            "structured_params": structured_params,
            "emotion_context": emotion_context
        }
            
    def _generate_text_description(self, music_params: Dict[str, Any]) -> str:
        tempo, mode, harmony = music_params['tempo'], music_params['mode'], music_params['harmony_consonance']
        tempo_desc = f"节奏{'非常缓慢' if tempo < 60 else '缓慢放松' if tempo < 80 else '适中稳定' if tempo < 100 else '明快活泼'} ({tempo:.0f} BPM)"
        mode_desc = f"调式{'大调，明亮积极' if mode > 0.7 else '小调，深沉内敛' if mode < 0.3 else '中性'}"
        harmony_desc = f"和声{'高度协和' if harmony > 0.8 else '相对协和'}"
        return f"{tempo_desc}，{mode_desc}，{harmony_desc}"

    def analyze_emotion_vector(self, emotion_vector: np.ndarray) -> Dict[str, Any]:
        emotion_dict = self._vector_to_emotion_dict(emotion_vector)
        sorted_emotions = sorted(emotion_dict.items(), key=lambda x: x[1], reverse=True)
        positive_emotions = ["快乐", "兴奋", "娱乐", "钦佩", "崇拜", "审美欣赏", "入迷", "兴趣", "浪漫", "平静"]
        negative_emotions = ["愤怒", "焦虑", "悲伤", "恐惧", "内疚", "恐怖", "失望", "厌恶", "嫉妒", "蔑视", "无聊", "尴尬", "困惑"]
        complex_emotions = ["敬畏", "同情", "渴望", "怀旧"]
        return {
            "max_emotion": sorted_emotions[0],
            "emotion_balance": {
                "positive": sum(emotion_dict.get(e, 0) for e in positive_emotions),
                "negative": sum(emotion_dict.get(e, 0) for e in negative_emotions),
                "complex": sum(emotion_dict.get(e, 0) for e in complex_emotions)
            }
        }