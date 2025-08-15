#!/usr/bin/env python3
"""
版本兼容的情感分类器 - 修复版

主要修复:
1. 分词器加载兼容性
2. 模型结构访问适配
3. 设备检测优化
4. 错误处理增强
"""

import torch
import torch.nn as nn
import numpy as np
import logging
from typing import Dict, List, Union, Tuple, Optional
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    AutoConfig
)

try:
    from .config import MODEL_CONFIG, MODEL_PATHS, COWEN_KELTNER_EMOTIONS, INFERENCE_CONFIG
    from .emotion_mapper import GoEmotionsMapper
except ImportError:
    from config import MODEL_CONFIG, MODEL_PATHS, COWEN_KELTNER_EMOTIONS, INFERENCE_CONFIG
    from emotion_mapper import GoEmotionsMapper

logger = logging.getLogger(__name__)

class CompatibleEmotionClassifier(nn.Module):
    """版本兼容的情感分类器"""
    
    def __init__(self, model_name: str = None, num_labels: int = 27, load_pretrained: bool = True):
        """初始化兼容版分类器"""
        super().__init__()
        
        self.model_name = model_name or MODEL_CONFIG["model_name"]
        self.num_labels = num_labels
        self.emotion_names = COWEN_KELTNER_EMOTIONS
        
        # 设备检测 - 增强兼容性
        self.device = self._detect_device()
        logger.info(f"🔧 使用设备: {self.device}")
        
        # 模型加载标志
        self.model_loaded = False
        self.tokenizer_loaded = False
        
        # 初始化模型
        if load_pretrained:
            self._load_pretrained_model_safe()
        
        # 初始化映射器
        self.mapper = GoEmotionsMapper()
        
        logger.info("✅ 兼容版情感分类器初始化完成")
    
    def _detect_device(self) -> str:
        """增强的设备检测"""
        if torch.cuda.is_available():
            return "cuda"
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            # 检查MPS实际可用性
            try:
                test_tensor = torch.randn(1).to("mps")
                return "mps"
            except:
                return "cpu"
        else:
            return "cpu"
    
    def _load_pretrained_model_safe(self):
        """安全的预训练模型加载"""
        try:
            logger.info(f"📥 尝试加载预训练模型: {self.model_name}")
            
            # 首先尝试加载配置
            config = AutoConfig.from_pretrained(
                self.model_name,
                num_labels=self.num_labels,
                problem_type="multi_label_classification",
                cache_dir=MODEL_PATHS["pretrained_cache"]
            )
            
            # 尝试加载分词器 - 多种策略
            self.tokenizer = self._load_tokenizer_safe()
            
            # 加载模型
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_name,
                config=config,
                cache_dir=MODEL_PATHS["pretrained_cache"]
            )
            
            # 移动到设备
            self.model.to(self.device)
            self.model_loaded = True
            
            logger.info("✅ 预训练模型加载成功")
            
        except Exception as e:
            logger.error(f"❌ 预训练模型加载失败: {e}")
            # 不抛出异常，保持优雅降级
    
    def _load_tokenizer_safe(self):
        """安全的分词器加载"""
        tokenizer = None
        
        # 策略1: 直接从模型路径加载
        try:
            tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.tokenizer_loaded = True
            logger.info("✅ 分词器加载成功 (策略1)")
            return tokenizer
        except Exception as e:
            logger.warning(f"分词器加载策略1失败: {e}")
        
        # 策略2: 从基础模型加载
        try:
            tokenizer = AutoTokenizer.from_pretrained("xlm-roberta-base")
            self.tokenizer_loaded = True
            logger.info("✅ 分词器加载成功 (策略2: 基础模型)")
            return tokenizer
        except Exception as e:
            logger.error(f"所有分词器加载策略失败: {e}")
            
        return tokenizer
    
    def load_finetuned_model_safe(self, model_path: str = None):
        """安全的微调模型加载"""
        try:
            model_path = model_path or MODEL_PATHS["finetuned_model"]
            logger.info(f"📥 尝试加载微调模型: {model_path}")
            
            # 检查路径存在性
            from pathlib import Path
            model_path = Path(model_path)
            if not model_path.exists():
                raise FileNotFoundError(f"模型路径不存在: {model_path}")
            
            # 策略1: 直接加载
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(str(model_path))
                self.model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
                self.model.to(self.device)
                self.model.eval()
                self.model_loaded = True
                self.tokenizer_loaded = True
                logger.info("✅ 微调模型加载成功 (策略1)")
                return True
                
            except Exception as e1:
                logger.warning(f"微调模型加载策略1失败: {e1}")
                
                # 策略2: 分别处理分词器和模型
                try:
                    # 使用基础分词器
                    self.tokenizer = AutoTokenizer.from_pretrained("xlm-roberta-base")
                    self.tokenizer_loaded = True
                    
                    # 加载微调的模型权重
                    self.model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
                    self.model.to(self.device)
                    self.model.eval()
                    self.model_loaded = True
                    
                    logger.info("✅ 微调模型加载成功 (策略2)")
                    return True
                    
                except Exception as e2:
                    logger.error(f"微调模型加载策略2失败: {e2}")
                    raise e2
            
        except Exception as e:
            logger.error(f"❌ 微调模型加载失败: {e}")
            # 回退到预训练模型
            logger.info("🔄 回退到预训练模型")
            self._load_pretrained_model_safe()
            return False
    
    def predict_single(self, text: str, return_dict: bool = False) -> Union[np.ndarray, Dict[str, float]]:
        """兼容版单文本预测"""
        try:
            # 检查模型状态
            if not self.model_loaded or not self.tokenizer_loaded:
                logger.warning("⚠️ 模型未正确加载，返回零向量")
                zero_vector = np.zeros(27, dtype=np.float32)
                return self.mapper.map_ck_vector_to_dict(zero_vector) if return_dict else zero_vector
            
            if not text or len(text.strip()) < 1:
                logger.warning("⚠️ 输入文本为空，返回零向量")
                zero_vector = np.zeros(27, dtype=np.float32)
                return self.mapper.map_ck_vector_to_dict(zero_vector) if return_dict else zero_vector
            
            # 文本预处理和分词
            inputs = self.tokenizer(
                text,
                padding=True,
                truncation=True,
                max_length=MODEL_CONFIG["max_length"],
                return_tensors="pt"
            )
            
            # 移动到设备
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # 模型推理
            self.model.eval()
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                
                # 应用sigmoid激活 (多标签分类)
                probabilities = torch.sigmoid(logits).cpu().numpy().flatten()
            
            # 确保输出维度正确
            if len(probabilities) != 27:
                logger.error(f"❌ 模型输出维度错误: 期望27维，实际{len(probabilities)}维")
                probabilities = np.zeros(27, dtype=np.float32)
            
            # 应用置信度阈值
            threshold = INFERENCE_CONFIG["confidence_threshold"]
            probabilities = np.where(probabilities > threshold, probabilities, 0.0)
            
            # 归一化到[0, 1]
            probabilities = np.clip(probabilities, 0, 1)
            
            if return_dict:
                return self.mapper.map_ck_vector_to_dict(probabilities)
            else:
                return probabilities.astype(np.float32)
                
        except Exception as e:
            logger.error(f"❌ 单文本预测失败: {e}")
            zero_vector = np.zeros(27, dtype=np.float32)
            return self.mapper.map_ck_vector_to_dict(zero_vector) if return_dict else zero_vector
    
    def get_model_info(self) -> Dict[str, Any]:
        """获取模型信息"""
        return {
            'model_loaded': self.model_loaded,
            'tokenizer_loaded': self.tokenizer_loaded,
            'device': self.device,
            'model_name': self.model_name,
            'num_labels': self.num_labels
        }

# 兼容性包装函数
def create_compatible_classifier(**kwargs):
    """创建兼容版分类器的工厂函数"""
    return CompatibleEmotionClassifier(**kwargs)

if __name__ == "__main__":
    # 测试兼容版分类器
    print("🧪 测试兼容版情感分类器")
    classifier = CompatibleEmotionClassifier(load_pretrained=True)
    
    # 尝试加载微调模型
    try:
        classifier.load_finetuned_model_safe()
    except:
        pass
    
    # 显示状态
    info = classifier.get_model_info()
    print(f"模型状态: {info}")
    
    # 测试预测
    test_text = "我今天很开心"
    result = classifier.predict_single(test_text)
    print(f"测试结果: {result[:5]}... (前5维)")
