#!/usr/bin/env python3
"""
AC情感分析模块深度诊断脚本

分析模型功能失效的根本原因：
1. 模型权重加载验证
2. 推理流程完整性检查
3. 输出分布异常检测
4. 梯度和激活值分析
5. 配置兼容性验证
"""

import sys
import os
import torch
import numpy as np
import pandas as pd
import logging
from pathlib import Path
from typing import Dict, Any, List, Tuple

# 添加AC模块路径
sys.path.insert(0, str(Path(__file__).parent.parent))

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EmotionModelDiagnosis:
    """情感模型深度诊断器"""
    
    def __init__(self):
        """初始化诊断器"""
        self.ac_root = Path(__file__).parent.parent
        self.diagnosis_results = {}
        
    def run_complete_diagnosis(self) -> Dict[str, Any]:
        """运行完整诊断流程"""
        logger.info("🔍 开始AC情感模型完整诊断...")
        
        # 1. 环境和配置检查
        self.diagnosis_results['environment'] = self._check_environment()
        
        # 2. 模型文件完整性检查
        self.diagnosis_results['model_files'] = self._check_model_files()
        
        # 3. 配置一致性检查
        self.diagnosis_results['config_consistency'] = self._check_config_consistency()
        
        # 4. 模型加载和权重检查
        self.diagnosis_results['model_loading'] = self._check_model_loading()
        
        # 5. 推理流程诊断
        self.diagnosis_results['inference_flow'] = self._check_inference_flow()
        
        # 6. 输出分布分析
        self.diagnosis_results['output_analysis'] = self._analyze_model_outputs()
        
        # 7. 权重和梯度分析
        self.diagnosis_results['weight_analysis'] = self._analyze_model_weights()
        
        # 8. 生成诊断报告
        report = self._generate_diagnosis_report()
        
        return report
    
    def _check_environment(self) -> Dict[str, Any]:
        """检查环境配置"""
        logger.info("📋 检查环境配置...")
        
        env_info = {
            'python_version': sys.version,
            'torch_version': torch.__version__,
            'cuda_available': torch.cuda.is_available(),
            'mps_available': hasattr(torch.backends, 'mps') and torch.backends.mps.is_available(),
            'device_count': torch.cuda.device_count() if torch.cuda.is_available() else 0
        }
        
        # 检查transformers版本
        try:
            import transformers
            env_info['transformers_version'] = transformers.__version__
        except ImportError:
            env_info['transformers_version'] = 'Not installed'
        
        # 检查numpy版本
        env_info['numpy_version'] = np.__version__
        
        logger.info(f"   PyTorch: {env_info['torch_version']}")
        logger.info(f"   Transformers: {env_info['transformers_version']}")
        logger.info(f"   CUDA可用: {env_info['cuda_available']}")
        logger.info(f"   MPS可用: {env_info['mps_available']}")
        
        return env_info
    
    def _check_model_files(self) -> Dict[str, Any]:
        """检查模型文件完整性"""
        logger.info("📁 检查模型文件完整性...")
        
        model_dir = self.ac_root / "models" / "finetuned_xlm_roberta"
        
        required_files = [
            'config.json',
            'model.safetensors', 
            'tokenizer.json',
            'tokenizer_config.json',
            'sentencepiece.bpe.model'
        ]
        
        file_status = {}
        total_size = 0
        
        for filename in required_files:
            filepath = model_dir / filename
            if filepath.exists():
                size = filepath.stat().st_size
                file_status[filename] = {
                    'exists': True,
                    'size_bytes': size,
                    'size_mb': round(size / (1024*1024), 2)
                }
                total_size += size
            else:
                file_status[filename] = {'exists': False, 'size_bytes': 0}
        
        result = {
            'model_directory': str(model_dir),
            'directory_exists': model_dir.exists(),
            'file_status': file_status,
            'total_size_mb': round(total_size / (1024*1024), 2),
            'all_files_present': all(status['exists'] for status in file_status.values())
        }
        
        logger.info(f"   模型目录: {model_dir}")
        logger.info(f"   总大小: {result['total_size_mb']} MB")
        logger.info(f"   完整性: {'✅ 完整' if result['all_files_present'] else '❌ 缺失文件'}")
        
        return result
    
    def _check_config_consistency(self) -> Dict[str, Any]:
        """检查配置一致性"""
        logger.info("⚙️  检查配置一致性...")
        
        result = {}
        
        # 检查AC模块配置
        try:
            from config import MODEL_CONFIG, COWEN_KELTNER_EMOTIONS, MODEL_PATHS
            result['ac_config'] = {
                'model_name': MODEL_CONFIG['model_name'],
                'num_labels': MODEL_CONFIG['num_labels'],
                'max_length': MODEL_CONFIG['max_length'],
                'ck_emotions_count': len(COWEN_KELTNER_EMOTIONS),
                'model_path': str(MODEL_PATHS['finetuned_model'])
            }
        except Exception as e:
            result['ac_config_error'] = str(e)
        
        # 检查实际模型配置
        try:
            import json
            model_config_path = self.ac_root / "models" / "finetuned_xlm_roberta" / "config.json"
            if model_config_path.exists():
                with open(model_config_path) as f:
                    model_config = json.load(f)
                
                result['model_config'] = {
                    'architectures': model_config.get('architectures', []),
                    'num_labels': len(model_config.get('id2label', {})),
                    'problem_type': model_config.get('problem_type'),
                    'hidden_size': model_config.get('hidden_size'),
                    'vocab_size': model_config.get('vocab_size')
                }
        except Exception as e:
            result['model_config_error'] = str(e)
        
        # 一致性检查
        if 'ac_config' in result and 'model_config' in result:
            result['consistency_check'] = {
                'num_labels_match': result['ac_config']['num_labels'] == result['model_config']['num_labels'],
                'architecture_correct': 'XLMRobertaForSequenceClassification' in result['model_config']['architectures'],
                'problem_type_correct': result['model_config']['problem_type'] == 'multi_label_classification'
            }
        
        logger.info(f"   配置模型标签数: {result.get('ac_config', {}).get('num_labels', 'N/A')}")
        logger.info(f"   实际模型标签数: {result.get('model_config', {}).get('num_labels', 'N/A')}")
        
        return result
    
    def _check_model_loading(self) -> Dict[str, Any]:
        """检查模型加载过程"""
        logger.info("🔄 检查模型加载过程...")
        
        result = {}
        
        try:
            # 尝试加载分词器
            from transformers import AutoTokenizer
            model_path = self.ac_root / "models" / "finetuned_xlm_roberta"
            
            tokenizer = AutoTokenizer.from_pretrained(str(model_path))
            result['tokenizer_loading'] = {
                'success': True,
                'vocab_size': tokenizer.vocab_size,
                'model_max_length': tokenizer.model_max_length
            }
            logger.info("   ✅ 分词器加载成功")
            
        except Exception as e:
            result['tokenizer_loading'] = {
                'success': False,
                'error': str(e)
            }
            logger.error(f"   ❌ 分词器加载失败: {e}")
        
        try:
            # 尝试加载模型
            from transformers import AutoModelForSequenceClassification
            model_path = self.ac_root / "models" / "finetuned_xlm_roberta"
            
            model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
            
            result['model_loading'] = {
                'success': True,
                'num_parameters': sum(p.numel() for p in model.parameters()),
                'model_dtype': str(model.dtype),
                'classifier_out_features': model.classifier.out_features if hasattr(model, 'classifier') else 'N/A'
            }
            
            # 检查分类器层结构
            if hasattr(model, 'classifier'):
                classifier = model.classifier
                result['classifier_structure'] = {
                    'type': type(classifier).__name__,
                    'in_features': getattr(classifier, 'in_features', 'N/A'),
                    'out_features': getattr(classifier, 'out_features', 'N/A')
                }
            
            logger.info("   ✅ 模型加载成功")
            logger.info(f"   参数数量: {result['model_loading']['num_parameters']:,}")
            
            # 保存模型引用用于后续测试
            self.loaded_model = model
            self.loaded_tokenizer = tokenizer
            
        except Exception as e:
            result['model_loading'] = {
                'success': False,
                'error': str(e)
            }
            logger.error(f"   ❌ 模型加载失败: {e}")
        
        return result
    
    def _check_inference_flow(self) -> Dict[str, Any]:
        """检查推理流程"""
        logger.info("🧠 检查推理流程...")
        
        result = {}
        
        if not hasattr(self, 'loaded_model') or not hasattr(self, 'loaded_tokenizer'):
            result['error'] = "模型或分词器未加载"
            return result
        
        test_texts = [
            "我今天很开心",
            "I am feeling sad", 
            "This is frustrating",
            "",  # 空文本测试
            "a" * 1000  # 长文本测试
        ]
        
        inference_results = []
        
        for i, text in enumerate(test_texts):
            try:
                # 分词
                inputs = self.loaded_tokenizer(
                    text,
                    padding=True,
                    truncation=True,
                    max_length=512,
                    return_tensors="pt"
                )
                
                # 推理
                self.loaded_model.eval()
                with torch.no_grad():
                    outputs = self.loaded_model(**inputs)
                    logits = outputs.logits
                    probs = torch.sigmoid(logits)
                
                # 分析输出
                test_result = {
                    'text_length': len(text),
                    'input_ids_shape': inputs['input_ids'].shape,
                    'logits_shape': logits.shape,
                    'logits_mean': float(logits.mean()),
                    'logits_std': float(logits.std()),
                    'logits_min': float(logits.min()),
                    'logits_max': float(logits.max()),
                    'probs_mean': float(probs.mean()),
                    'probs_std': float(probs.std()),
                    'probs_sum': float(probs.sum()),
                    'active_outputs': int(torch.sum(probs > 0.1)),
                    'logits_sample': logits[0][:5].tolist(),  # 前5个logits
                    'probs_sample': probs[0][:5].tolist()    # 前5个概率
                }
                
                inference_results.append(test_result)
                
            except Exception as e:
                inference_results.append({
                    'text_length': len(text),
                    'error': str(e)
                })
        
        result['test_results'] = inference_results
        
        # 检查输出异常模式
        valid_results = [r for r in inference_results if 'error' not in r]
        if valid_results:
            logits_means = [r['logits_mean'] for r in valid_results]
            probs_means = [r['probs_mean'] for r in valid_results]
            
            result['output_patterns'] = {
                'logits_variance': float(np.var(logits_means)),
                'probs_variance': float(np.var(probs_means)),
                'consistent_outputs': np.var(logits_means) < 0.01,  # 输出过于一致
                'avg_active_outputs': np.mean([r['active_outputs'] for r in valid_results])
            }
        
        logger.info(f"   测试样本: {len(test_texts)}")
        logger.info(f"   成功推理: {len(valid_results)}")
        if 'output_patterns' in result:
            logger.info(f"   输出一致性: {'❌ 异常' if result['output_patterns']['consistent_outputs'] else '✅ 正常'}")
        
        return result
    
    def _analyze_model_outputs(self) -> Dict[str, Any]:
        """分析模型输出分布"""
        logger.info("📊 分析模型输出分布...")
        
        result = {}
        
        if not hasattr(self, 'loaded_model') or not hasattr(self, 'loaded_tokenizer'):
            result['error'] = "模型或分词器未加载"
            return result
        
        # 准备多样化测试数据
        diverse_texts = [
            # 明确的情感表达
            "I am extremely happy and joyful today!",
            "我感到非常愤怒和生气",
            "This makes me incredibly sad and depressed",
            "I feel anxious and worried about tomorrow",
            "这音乐让我感到平静和放松",
            
            # 混合情感
            "I'm excited but also nervous about the presentation",
            "Happy memories mixed with sadness",
            
            # 中性文本
            "The weather is cloudy today",
            "Please pass the salt",
            "Technical documentation for the API",
            
            # 不同语言
            "Je suis très heureux aujourd'hui",
            "Estoy muy triste por las noticias",
            
            # 极端情况
            "!!!AMAZING WONDERFUL FANTASTIC!!!",
            "terrible awful horrible disgusting",
            "okay fine whatever sure"
        ]
        
        all_outputs = []
        all_logits = []
        
        self.loaded_model.eval()
        
        for text in diverse_texts:
            try:
                inputs = self.loaded_tokenizer(
                    text,
                    padding=True,
                    truncation=True,
                    max_length=512,
                    return_tensors="pt"
                )
                
                with torch.no_grad():
                    outputs = self.loaded_model(**inputs)
                    logits = outputs.logits[0]  # 取第一个样本
                    probs = torch.sigmoid(logits)
                
                all_outputs.append(probs.numpy())
                all_logits.append(logits.numpy())
                
            except Exception as e:
                logger.warning(f"处理文本失败: {text[:30]}... -> {e}")
        
        if all_outputs:
            outputs_array = np.array(all_outputs)  # (N, 27)
            logits_array = np.array(all_logits)    # (N, 27)
            
            # 分析输出分布
            result['distribution_analysis'] = {
                'num_samples': len(all_outputs),
                'output_shape': outputs_array.shape,
                
                # 按样本分析
                'sample_statistics': {
                    'mean_per_sample': outputs_array.mean(axis=1).tolist(),
                    'std_per_sample': outputs_array.std(axis=1).tolist(),
                    'max_per_sample': outputs_array.max(axis=1).tolist(),
                    'active_emotions_per_sample': (outputs_array > 0.1).sum(axis=1).tolist()
                },
                
                # 按维度分析
                'dimension_statistics': {
                    'mean_per_dim': outputs_array.mean(axis=0).tolist(),
                    'std_per_dim': outputs_array.std(axis=0).tolist(),
                    'activation_rate_per_dim': (outputs_array > 0.1).mean(axis=0).tolist()
                },
                
                # 整体统计
                'overall_statistics': {
                    'global_mean': float(outputs_array.mean()),
                    'global_std': float(outputs_array.std()),
                    'zero_ratio': float((outputs_array == 0).mean()),
                    'low_activation_ratio': float((outputs_array < 0.01).mean())
                },
                
                # logits分析
                'logits_statistics': {
                    'mean': float(logits_array.mean()),
                    'std': float(logits_array.std()),
                    'min': float(logits_array.min()),
                    'max': float(logits_array.max())
                }
            }
            
            # 检测异常模式
            result['anomaly_detection'] = {
                'all_outputs_identical': np.allclose(outputs_array, outputs_array[0], atol=1e-6),
                'extremely_low_variance': outputs_array.std() < 1e-4,
                'dominated_by_zeros': (outputs_array == 0).mean() > 0.9,
                'single_dimension_dominance': outputs_array.max(axis=1).mean() > 0.9,
                'logits_collapsed': abs(logits_array.std()) < 0.1
            }
            
            logger.info(f"   分析样本数: {len(all_outputs)}")
            logger.info(f"   全局均值: {result['distribution_analysis']['overall_statistics']['global_mean']:.4f}")
            logger.info(f"   全局标准差: {result['distribution_analysis']['overall_statistics']['global_std']:.4f}")
            
            # 异常检测结果
            anomalies = [k for k, v in result['anomaly_detection'].items() if v]
            if anomalies:
                logger.warning(f"   ⚠️ 检测到异常: {anomalies}")
            else:
                logger.info("   ✅ 输出分布正常")
        
        return result
    
    def _analyze_model_weights(self) -> Dict[str, Any]:
        """分析模型权重"""
        logger.info("⚖️  分析模型权重...")
        
        result = {}
        
        if not hasattr(self, 'loaded_model'):
            result['error'] = "模型未加载"
            return result
        
        try:
            # 分析分类器权重
            if hasattr(self.loaded_model, 'classifier'):
                classifier = self.loaded_model.classifier
                
                if hasattr(classifier, 'weight'):
                    weight = classifier.weight.data
                    bias = classifier.bias.data if hasattr(classifier, 'bias') else None
                    
                    result['classifier_weights'] = {
                        'weight_shape': list(weight.shape),
                        'weight_mean': float(weight.mean()),
                        'weight_std': float(weight.std()),
                        'weight_min': float(weight.min()),
                        'weight_max': float(weight.max()),
                        'weight_zeros': int((weight == 0).sum()),
                        'weight_norm': float(weight.norm()),
                    }
                    
                    if bias is not None:
                        result['classifier_bias'] = {
                            'bias_shape': list(bias.shape),
                            'bias_mean': float(bias.mean()),
                            'bias_std': float(bias.std()),
                            'bias_min': float(bias.min()),
                            'bias_max': float(bias.max())
                        }
                    
                    # 检查权重是否被正确初始化/微调
                    result['weight_analysis'] = {
                        'weights_initialized': not torch.allclose(weight, torch.zeros_like(weight)),
                        'reasonable_scale': 0.001 < weight.std() < 10.0,
                        'symmetric_distribution': abs(weight.mean()) < weight.std(),
                    }
            
            # 检查一些关键层的权重统计
            layer_stats = {}
            for name, param in self.loaded_model.named_parameters():
                if 'classifier' in name or 'pooler' in name:
                    layer_stats[name] = {
                        'shape': list(param.shape),
                        'mean': float(param.mean()),
                        'std': float(param.std()),
                        'requires_grad': param.requires_grad
                    }
            
            result['key_layers'] = layer_stats
            
            logger.info("   ✅ 权重分析完成")
            if 'classifier_weights' in result:
                logger.info(f"   分类器权重形状: {result['classifier_weights']['weight_shape']}")
                logger.info(f"   权重标准差: {result['classifier_weights']['weight_std']:.6f}")
            
        except Exception as e:
            result['error'] = str(e)
            logger.error(f"   ❌ 权重分析失败: {e}")
        
        return result
    
    def _generate_diagnosis_report(self) -> Dict[str, Any]:
        """生成诊断报告"""
        logger.info("📋 生成诊断报告...")
        
        # 综合分析问题
        issues = []
        recommendations = []
        severity_score = 0  # 0-100, 100最严重
        
        # 检查各个诊断结果
        if not self.diagnosis_results.get('model_files', {}).get('all_files_present', False):
            issues.append("❌ 模型文件不完整")
            recommendations.append("重新下载或训练模型文件")
            severity_score += 30
        
        config_check = self.diagnosis_results.get('config_consistency', {}).get('consistency_check', {})
        if not config_check.get('num_labels_match', True):
            issues.append("❌ 配置标签数不匹配")
            recommendations.append("检查config.py中的标签数设置")
            severity_score += 25
        
        if not config_check.get('problem_type_correct', True):
            issues.append("❌ 问题类型配置错误")
            recommendations.append("确保模型配置为多标签分类")
            severity_score += 20
        
        # 检查模型加载
        if not self.diagnosis_results.get('model_loading', {}).get('model_loading', {}).get('success', False):
            issues.append("❌ 模型加载失败")
            recommendations.append("检查模型文件格式和transformers版本")
            severity_score += 40
        
        # 检查推理异常
        inference_patterns = self.diagnosis_results.get('inference_flow', {}).get('output_patterns', {})
        if inference_patterns.get('consistent_outputs', False):
            issues.append("❌ 模型输出过于一致，可能未正确加载权重")
            recommendations.append("检查模型权重是否正确加载和初始化")
            severity_score += 35
        
        # 检查输出分布异常
        anomalies = self.diagnosis_results.get('output_analysis', {}).get('anomaly_detection', {})
        if anomalies.get('all_outputs_identical', False):
            issues.append("❌ 所有输入产生相同输出 - 权重加载问题")
            recommendations.append("重新加载或重新训练模型")
            severity_score += 50
        
        if anomalies.get('logits_collapsed', False):
            issues.append("❌ Logits分布坍塌 - 模型退化")
            recommendations.append("检查训练过程或使用备份模型")
            severity_score += 45
        
        # 权重分析
        weight_analysis = self.diagnosis_results.get('weight_analysis', {}).get('weight_analysis', {})
        if not weight_analysis.get('weights_initialized', True):
            issues.append("❌ 分类器权重未初始化")
            recommendations.append("检查模型保存和加载过程")
            severity_score += 40
        
        # 生成最终报告
        report = {
            'diagnosis_summary': {
                'total_issues': len(issues),
                'severity_score': min(severity_score, 100),
                'status': 'CRITICAL' if severity_score > 70 else 'WARNING' if severity_score > 30 else 'OK',
                'primary_issues': issues[:5],  # 最重要的5个问题
                'recommendations': recommendations[:5]
            },
            'detailed_results': self.diagnosis_results,
            'conclusion': self._generate_conclusion(issues, severity_score)
        }
        
        # 输出报告摘要
        logger.info("="*60)
        logger.info("🎯 诊断报告摘要")
        logger.info("="*60)
        logger.info(f"严重程度: {report['diagnosis_summary']['status']} (评分: {severity_score}/100)")
        logger.info(f"发现问题: {len(issues)} 个")
        
        for i, issue in enumerate(issues[:3], 1):
            logger.info(f"{i}. {issue}")
        
        logger.info("\n💡 主要建议:")
        for i, rec in enumerate(recommendations[:3], 1):
            logger.info(f"{i}. {rec}")
        
        return report
    
    def _generate_conclusion(self, issues: List[str], severity_score: int) -> str:
        """生成诊断结论"""
        if severity_score > 70:
            return "模型存在严重问题，需要立即修复。主要问题集中在模型权重加载和配置不匹配。"
        elif severity_score > 30:
            return "模型存在中等问题，建议优先修复权重和配置相关问题。"
        else:
            return "模型整体状态良好，可能存在轻微调优空间。"
    
    def save_diagnosis_report(self, report: Dict[str, Any], filename: str = "diagnosis_report.json"):
        """保存诊断报告"""
        output_path = Path(__file__).parent / filename
        
        import json
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        logger.info(f"📄 诊断报告已保存: {output_path}")

def main():
    """运行完整诊断"""
    print("🔍 AC情感分析模块深度诊断")
    print("="*60)
    
    # 创建诊断器
    diagnosis = EmotionModelDiagnosis()
    
    # 运行完整诊断
    report = diagnosis.run_complete_diagnosis()
    
    # 保存报告
    diagnosis.save_diagnosis_report(report)
    
    print("\n" + "="*60)
    print("✅ 诊断完成！请查看详细报告。")
    
    return report

if __name__ == "__main__":
    main()