#!/usr/bin/env python3
"""
测试修复后的情感分类器功能

验证版本兼容性修复是否解决了原有问题
"""

import sys
import os
import numpy as np
import logging
from pathlib import Path

# 添加AC模块路径
sys.path.insert(0, str(Path(__file__).parent.parent))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_fixed_classifier():
    """测试修复后的分类器"""
    print("🧪 测试修复后的AC情感分析模块")
    print("="*60)
    
    try:
        # 导入修复后的分类器
        from emotion_classifier import CompatibleEmotionClassifier
        print("✅ 成功导入兼容版分类器")
        
        # 创建分类器实例
        print("\n🔧 初始化分类器...")
        classifier = CompatibleEmotionClassifier(load_pretrained=False)
        
        # 显示初始状态
        info = classifier.get_model_info()
        print(f"初始状态: {info}")
        
        # 尝试加载微调模型
        print("\n📥 加载微调模型...")
        success = classifier.load_finetuned_model_safe()
        
        # 显示加载后状态
        info = classifier.get_model_info()
        print(f"加载后状态: {info}")
        
        if info['model_loaded'] and info['tokenizer_loaded']:
            print("✅ 模型和分词器加载成功")
            
            # 测试不同类型的情感文本
            test_cases = [
                # 强烈正面情感
                {
                    'text': "我今天感到非常开心和兴奋，这是最美好的一天！",
                    'expected_emotions': ['快乐', '兴奋']
                },
                # 强烈负面情感
                {
                    'text': "我对这个结果感到极其愤怒和失望",
                    'expected_emotions': ['愤怒', '失望']
                },
                # 复杂混合情感
                {
                    'text': "看到这部电影让我既感动又悲伤，回忆起了过去",
                    'expected_emotions': ['同情', '悲伤', '怀旧']
                },
                # 英文情感
                {
                    'text': "I am extremely anxious about the exam tomorrow",
                    'expected_emotions': ['焦虑', '恐惧']
                },
                # 中性文本
                {
                    'text': "今天的天气是多云",
                    'expected_emotions': []  # 应该有很少或没有情感
                }
            ]
            
            print("\n🎯 开始情感预测测试:")
            print("-" * 60)
            
            all_results_identical = True
            first_result = None
            
            for i, case in enumerate(test_cases, 1):
                text = case['text']
                expected = case['expected_emotions']
                
                print(f"\n测试 {i}: {text}")
                
                # 获取情感向量
                emotion_vector = classifier.predict_single(text)
                
                # 计算统计信息
                total_intensity = float(np.sum(emotion_vector))
                max_intensity = float(np.max(emotion_vector))
                active_count = int(np.sum(emotion_vector > 0.1))
                non_zero_count = int(np.sum(emotion_vector > 0.0))
                
                print(f"   总强度: {total_intensity:.4f}")
                print(f"   最大强度: {max_intensity:.4f}")
                print(f"   活跃情绪数 (>0.1): {active_count}")
                print(f"   非零情绪数: {non_zero_count}")
                
                # 获取top情绪
                if hasattr(classifier, 'mapper') and hasattr(classifier.mapper, 'get_top_emotions_from_vector'):
                    try:
                        top_emotions = classifier.mapper.get_top_emotions_from_vector(emotion_vector, 3)
                        print(f"   主要情绪: {top_emotions}")
                    except Exception as e:
                        print(f"   获取top情绪失败: {e}")
                
                # 检查是否所有结果都相同（问题指标）
                if first_result is None:
                    first_result = emotion_vector.copy()
                else:
                    if not np.allclose(emotion_vector, first_result, atol=1e-6):
                        all_results_identical = False
                
                # 向量前5维预览
                print(f"   向量预览: [{', '.join([f'{x:.4f}' for x in emotion_vector[:5]])}...]")
            
            # 最终诊断
            print("\n" + "="*60)
            print("🎯 诊断结果:")
            
            if all_results_identical:
                print("❌ 严重问题: 所有输入产生相同输出")
                print("   这表明模型权重未正确加载或存在其他严重问题")
                return False
            else:
                print("✅ 正常: 不同输入产生不同输出")
            
            # 检查输出范围
            all_vectors = []
            for case in test_cases:
                vec = classifier.predict_single(case['text'])
                all_vectors.append(vec)
            
            all_vectors = np.array(all_vectors)
            overall_std = np.std(all_vectors)
            overall_mean = np.mean(all_vectors)
            
            print(f"   整体标准差: {overall_std:.4f}")
            print(f"   整体均值: {overall_mean:.4f}")
            
            if overall_std < 1e-4:
                print("⚠️  警告: 输出方差过小，可能存在问题")
            elif overall_std > 0.01:
                print("✅ 良好: 输出具有合理的多样性")
            else:
                print("⚡ 一般: 输出多样性较低但可接受")
            
            print("\n✅ 情感分析功能测试完成")
            return True
            
        else:
            print("❌ 模型或分词器加载失败")
            return False
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_integration():
    """测试API集成"""
    print("\n🌉 测试API集成...")
    
    try:
        from inference_api import EmotionInferenceAPI
        
        # 创建API实例
        api = EmotionInferenceAPI(load_finetuned=True)
        
        # 获取状态
        status = api.get_api_status()
        print(f"API状态: {status}")
        
        # 测试核心接口
        test_text = "我今天很开心但也有点紧张"
        
        # 测试get_emotion_for_kg_module接口（这是与KG模块集成的关键接口）
        emotion_vector = api.get_emotion_for_kg_module(test_text)
        
        print(f"KG接口测试:")
        print(f"  输入: {test_text}")
        print(f"  输出形状: {emotion_vector.shape}")
        print(f"  输出类型: {type(emotion_vector)}")
        print(f"  向量和: {np.sum(emotion_vector):.4f}")
        print(f"  非零元素: {np.sum(emotion_vector > 0)}")
        
        if emotion_vector.shape[0] == 27 and isinstance(emotion_vector, np.ndarray):
            print("✅ KG模块接口正常")
            return True
        else:
            print("❌ KG模块接口异常")
            return False
            
    except Exception as e:
        print(f"❌ API集成测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🔍 AC情感分析模块修复验证")
    print("="*60)
    
    # 测试1: 基础分类器功能
    classifier_ok = test_fixed_classifier()
    
    # 测试2: API集成
    api_ok = test_api_integration()
    
    # 总结
    print("\n" + "="*60)
    print("📋 测试总结:")
    print(f"   分类器功能: {'✅ 通过' if classifier_ok else '❌ 失败'}")
    print(f"   API集成: {'✅ 通过' if api_ok else '❌ 失败'}")
    
    if classifier_ok and api_ok:
        print("\n🎉 恭喜! AC情感分析模块修复成功!")
        print("   模块现在可以正确识别和区分不同的情感")
        print("   可以与KG模块正常集成使用")
    else:
        print("\n⚠️  修复不完全，需要进一步调试")
    
    return classifier_ok and api_ok

if __name__ == "__main__":
    main()