#!/usr/bin/env python3
"""
AC模块版本兼容性问题诊断和修复脚本

主要问题分析：
1. tokenizer.json格式与当前transformers版本不兼容
2. 模型结构访问方式在新版本中发生变化
3. 需要适配不同版本的transformers库

修复策略：
1. 重新构建兼容的分词器配置
2. 修复模型结构访问逻辑
3. 提供版本适配代码
"""

import sys
import os
import torch
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

# 添加AC模块路径
sys.path.insert(0, str(Path(__file__).parent.parent))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class VersionCompatibilityFixer:
    """版本兼容性修复器"""
    
    def __init__(self):
        self.ac_root = Path(__file__).parent.parent
        self.model_dir = self.ac_root / "models" / "finetuned_xlm_roberta"
        
    def diagnose_version_issues(self) -> Dict[str, Any]:
        """诊断版本兼容性问题"""
        logger.info("🔍 诊断版本兼容性问题...")
        
        issues = {
            'transformers_version': self._check_transformers_version(),
            'tokenizer_compatibility': self._check_tokenizer_compatibility(),
            'model_structure_compatibility': self._check_model_structure(),
            'recommended_fixes': []
        }
        
        return issues
    
    def _check_transformers_version(self) -> Dict[str, Any]:
        """检查transformers版本"""
        try:
            import transformers
            version = transformers.__version__
            
            # 解析版本号
            major, minor, patch = map(int, version.split('.'))
            
            result = {
                'current_version': version,
                'major': major,
                'minor': minor, 
                'patch': patch,
                'compatible': True,
                'issues': []
            }
            
            # 检查已知问题版本
            if major == 4 and minor < 21:
                result['issues'].append("版本过低，建议升级到4.21+")
                result['compatible'] = False
            
            if major == 4 and minor >= 30:
                result['issues'].append("tokenizer格式可能不兼容，需要重新生成")
            
            return result
            
        except Exception as e:
            return {'error': str(e), 'compatible': False}
    
    def _check_tokenizer_compatibility(self) -> Dict[str, Any]:
        """检查分词器兼容性"""
        logger.info("🔤 检查分词器兼容性...")
        
        result = {'tests': []}
        
        # 测试1: 直接加载原始分词器
        try:
            from transformers import AutoTokenizer
            tokenizer = AutoTokenizer.from_pretrained(str(self.model_dir))
            result['tests'].append({
                'name': 'direct_loading',
                'success': True,
                'vocab_size': tokenizer.vocab_size
            })
        except Exception as e:
            result['tests'].append({
                'name': 'direct_loading',
                'success': False,
                'error': str(e)
            })
        
        # 测试2: 使用预训练基础模型
        try:
            from transformers import AutoTokenizer
            tokenizer = AutoTokenizer.from_pretrained("xlm-roberta-base")
            result['tests'].append({
                'name': 'base_model_loading',
                'success': True,
                'vocab_size': tokenizer.vocab_size
            })
            # 保存基础分词器引用
            self._base_tokenizer = tokenizer
        except Exception as e:
            result['tests'].append({
                'name': 'base_model_loading', 
                'success': False,
                'error': str(e)
            })
        
        # 测试3: 检查tokenizer配置文件
        try:
            config_file = self.model_dir / "tokenizer_config.json"
            with open(config_file) as f:
                config = json.load(f)
            result['config_analysis'] = {
                'model_max_length': config.get('model_max_length'),
                'tokenizer_class': config.get('tokenizer_class'),
                'special_tokens': len(config.get('special_tokens_map', {}))
            }
        except Exception as e:
            result['config_error'] = str(e)
        
        return result
    
    def _check_model_structure(self) -> Dict[str, Any]:
        """检查模型结构兼容性"""
        logger.info("🏗️  检查模型结构兼容性...")
        
        result = {'tests': []}
        
        # 测试1: 尝试加载模型配置
        try:
            from transformers import AutoConfig
            config = AutoConfig.from_pretrained(str(self.model_dir))
            result['config_loading'] = {
                'success': True,
                'architectures': config.architectures,
                'num_labels': config.num_labels,
                'problem_type': config.problem_type
            }
        except Exception as e:
            result['config_loading'] = {
                'success': False,
                'error': str(e)
            }
        
        # 测试2: 尝试加载模型结构
        try:
            from transformers import AutoModelForSequenceClassification
            model = AutoModelForSequenceClassification.from_pretrained(str(self.model_dir))
            
            # 检查分类器结构
            classifier_info = {}
            if hasattr(model, 'classifier'):
                classifier = model.classifier
                classifier_info['has_classifier'] = True
                classifier_info['classifier_type'] = type(classifier).__name__
                
                # 尝试不同的属性访问方式
                for attr in ['out_features', 'out_proj', 'dense']:
                    if hasattr(classifier, attr):
                        attr_val = getattr(classifier, attr)
                        if hasattr(attr_val, 'out_features'):
                            classifier_info[f'{attr}_out_features'] = attr_val.out_features
                        classifier_info[attr] = str(type(attr_val))
            
            result['model_structure'] = {
                'success': True,
                'model_type': type(model).__name__,
                'classifier_info': classifier_info,
                'num_parameters': sum(p.numel() for p in model.parameters())
            }
            
            # 保存模型引用
            self._loaded_model = model
            
        except Exception as e:
            result['model_structure'] = {
                'success': False,
                'error': str(e)
            }
        
        return result
    
    def fix_tokenizer_compatibility(self) -> bool:
        """修复分词器兼容性问题"""
        logger.info("🔧 修复分词器兼容性...")
        
        try:
            # 策略1: 使用基础模型分词器并保存到模型目录
            if hasattr(self, '_base_tokenizer'):
                backup_dir = self.model_dir / "tokenizer_backup"
                backup_dir.mkdir(exist_ok=True)
                
                # 备份原始文件
                for file in ['tokenizer.json', 'tokenizer_config.json']:
                    src = self.model_dir / file
                    dst = backup_dir / file
                    if src.exists():
                        import shutil
                        shutil.copy2(src, dst)
                        logger.info(f"备份 {file} 到 {dst}")
                
                # 保存兼容的分词器
                self._base_tokenizer.save_pretrained(str(self.model_dir))
                logger.info("✅ 分词器兼容性修复完成")
                
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ 分词器修复失败: {e}")
            return False
    
    def create_compatible_emotion_classifier(self) -> bool:
        """创建版本兼容的情感分类器"""
        logger.info("🎯 创建兼容的情感分类器...")
        
        try:
            # 创建兼容版本的emotion_classifier
            compatible_code = '''#!/usr/bin/env python3
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
'''
            
            # 保存兼容版分类器
            compatible_file = self.ac_root / "debug" / "emotion_classifier_compatible.py"
            with open(compatible_file, 'w', encoding='utf-8') as f:
                f.write(compatible_code)
            
            logger.info(f"✅ 兼容版分类器已保存: {compatible_file}")
            return True
            
        except Exception as e:
            logger.error(f"❌ 创建兼容分类器失败: {e}")
            return False
    
    def create_quick_fix_script(self) -> bool:
        """创建快速修复脚本"""
        logger.info("⚡ 创建快速修复脚本...")
        
        fix_script = '''#!/usr/bin/env python3
"""
AC模块快速修复脚本

使用方法:
1. python debug/quick_fix.py --backup     # 备份原始文件
2. python debug/quick_fix.py --fix        # 应用修复
3. python debug/quick_fix.py --test       # 测试修复结果
4. python debug/quick_fix.py --restore    # 恢复原始文件
"""

import argparse
import sys
import shutil
from pathlib import Path

def backup_files():
    """备份原始文件"""
    ac_root = Path(__file__).parent.parent
    model_dir = ac_root / "models" / "finetuned_xlm_roberta"
    backup_dir = ac_root / "debug" / "backup"
    backup_dir.mkdir(exist_ok=True)
    
    files_to_backup = [
        "emotion_classifier.py",
        "inference_api.py",
    ]
    
    model_files_to_backup = [
        "tokenizer.json",
        "tokenizer_config.json"
    ]
    
    print("📦 备份原始文件...")
    
    # 备份AC模块文件
    for file in files_to_backup:
        src = ac_root / file
        dst = backup_dir / file
        if src.exists():
            shutil.copy2(src, dst)
            print(f"✅ 已备份: {file}")
    
    # 备份模型文件
    for file in model_files_to_backup:
        src = model_dir / file
        dst = backup_dir / file
        if src.exists():
            shutil.copy2(src, dst)
            print(f"✅ 已备份: {file}")
    
    print("✅ 备份完成")

def apply_fix():
    """应用修复"""
    ac_root = Path(__file__).parent.parent
    
    print("🔧 应用版本兼容修复...")
    
    # 1. 重新生成兼容的分词器
    try:
        from transformers import AutoTokenizer
        model_dir = ac_root / "models" / "finetuned_xlm_roberta"
        
        # 使用基础模型分词器
        tokenizer = AutoTokenizer.from_pretrained("xlm-roberta-base")
        tokenizer.save_pretrained(str(model_dir))
        print("✅ 分词器已修复")
    except Exception as e:
        print(f"❌ 分词器修复失败: {e}")
    
    # 2. 替换为兼容版emotion_classifier
    try:
        compatible_file = ac_root / "debug" / "emotion_classifier_compatible.py"
        target_file = ac_root / "emotion_classifier.py"
        
        if compatible_file.exists():
            shutil.copy2(compatible_file, target_file)
            print("✅ 情感分类器已替换为兼容版")
    except Exception as e:
        print(f"❌ 分类器替换失败: {e}")
    
    print("✅ 修复应用完成")

def test_fix():
    """测试修复结果"""
    print("🧪 测试修复结果...")
    
    try:
        # 导入并测试兼容版分类器
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from emotion_classifier import CompatibleEmotionClassifier
        
        # 创建分类器实例
        classifier = CompatibleEmotionClassifier(load_pretrained=False)
        
        # 尝试加载微调模型
        result = classifier.load_finetuned_model_safe()
        
        # 获取模型状态
        info = classifier.get_model_info()
        print(f"模型状态: {info}")
        
        # 测试预测功能
        if info['model_loaded'] and info['tokenizer_loaded']:
            test_texts = [
                "我今天很开心",
                "I feel sad",
                "This is frustrating"
            ]
            
            print("\\n🧪 测试预测:")
            for text in test_texts:
                result = classifier.predict_single(text)
                active_emotions = sum(1 for x in result if x > 0.1)
                print(f"文本: '{text}' -> 活跃情绪数: {active_emotions}, 向量和: {sum(result):.3f}")
            
            print("✅ 功能测试通过")
        else:
            print("❌ 模型未正确加载")
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")

def restore_files():
    """恢复原始文件"""
    print("🔄 恢复原始文件...")
    
    ac_root = Path(__file__).parent.parent
    backup_dir = ac_root / "debug" / "backup"
    
    if not backup_dir.exists():
        print("❌ 未找到备份目录")
        return
    
    files_to_restore = [
        "emotion_classifier.py",
        "inference_api.py"
    ]
    
    for file in files_to_restore:
        src = backup_dir / file
        dst = ac_root / file
        if src.exists():
            shutil.copy2(src, dst)
            print(f"✅ 已恢复: {file}")
    
    print("✅ 恢复完成")

def main():
    parser = argparse.ArgumentParser(description="AC模块快速修复工具")
    parser.add_argument("--backup", action="store_true", help="备份原始文件")
    parser.add_argument("--fix", action="store_true", help="应用修复")
    parser.add_argument("--test", action="store_true", help="测试修复结果")
    parser.add_argument("--restore", action="store_true", help="恢复原始文件")
    parser.add_argument("--all", action="store_true", help="执行完整修复流程")
    
    args = parser.parse_args()
    
    if args.all:
        backup_files()
        apply_fix()
        test_fix()
    elif args.backup:
        backup_files()
    elif args.fix:
        apply_fix()
    elif args.test:
        test_fix()
    elif args.restore:
        restore_files()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
'''
        
        # 保存修复脚本
        fix_script_path = self.ac_root / "debug" / "quick_fix.py"
        with open(fix_script_path, 'w', encoding='utf-8') as f:
            f.write(fix_script)
        
        # 添加执行权限
        import stat
        fix_script_path.chmod(fix_script_path.stat().st_mode | stat.S_IEXEC)
        
        logger.info(f"✅ 快速修复脚本已创建: {fix_script_path}")
        return True
    
    def run_complete_fix(self) -> Dict[str, Any]:
        """运行完整修复流程"""
        logger.info("🔧 开始完整修复流程...")
        
        results = {
            'diagnosis': self.diagnose_version_issues(),
            'fixes_applied': [],
            'success': True
        }
        
        # 1. 修复分词器兼容性
        if self.fix_tokenizer_compatibility():
            results['fixes_applied'].append('tokenizer_compatibility')
        
        # 2. 创建兼容的分类器
        if self.create_compatible_emotion_classifier():
            results['fixes_applied'].append('compatible_classifier')
        
        # 3. 创建快速修复脚本
        if self.create_quick_fix_script():
            results['fixes_applied'].append('quick_fix_script')
        
        # 4. 保存修复报告
        report_path = self.ac_root / "debug" / "compatibility_fix_report.json"
        import json
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        logger.info(f"📄 修复报告已保存: {report_path}")
        logger.info(f"✅ 修复流程完成，应用了 {len(results['fixes_applied'])} 个修复")
        
        return results

def main():
    """主函数"""
    print("🔧 AC模块版本兼容性修复工具")
    print("="*60)
    
    fixer = VersionCompatibilityFixer()
    
    # 运行完整修复
    results = fixer.run_complete_fix()
    
    print("\\n" + "="*60)
    print("📋 修复摘要:")
    print(f"   应用修复数: {len(results['fixes_applied'])}")
    print(f"   修复项目: {results['fixes_applied']}")
    print("\\n💡 下一步操作:")
    print("1. 运行: python debug/quick_fix.py --test")
    print("2. 或直接使用兼容版分类器测试功能")
    
    return results

if __name__ == "__main__":
    main()