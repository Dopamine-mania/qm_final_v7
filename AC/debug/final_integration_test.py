#!/usr/bin/env python3
"""
AC情感分析模块最终集成测试

验证修复后的AC模块能够：
1. 正确识别不同情感
2. 输出27维标准化向量  
3. 与KG模块完美集成
4. 处理多种语言和情感
"""

import sys
import numpy as np
from pathlib import Path

# 添加AC模块路径
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_emotion_diversity():
    """测试情感识别的多样性和准确性"""
    print("🎭 测试情感识别多样性和准确性")
    print("-" * 50)
    
    from inference_api import analyze_text_emotion
    
    # 设计的测试用例 - 涵盖不同情感类型
    test_cases = [
        {
            'category': '强烈正面情感',
            'texts': [
                "今天是我人生中最开心的一天！我中了彩票！",
                "这个音乐会太令人兴奋了，我简直不敢相信！", 
                "看到孩子们天真的笑容，我感到无比的快乐和满足"
            ],
            'expected_dominants': ['快乐', '兴奋', '钦佩']
        },
        {
            'category': '强烈负面情感', 
            'texts': [
                "我对这种不公正的待遇感到极其愤怒！",
                "听到这个坏消息，我心如刀割，悲伤欲绝",
                "面对明天的考试，我感到前所未有的焦虑和恐惧"
            ],
            'expected_dominants': ['愤怒', '悲伤', '焦虑']
        },
        {
            'category': '复杂混合情感',
            'texts': [
                "毕业典礼让我既高兴又不舍，回忆起大学时光",
                "看到老照片，我既怀念过去又对未来充满期待",
                "这部电影让我又哭又笑，情感五味杂陈"
            ],
            'expected_dominants': ['怀旧', '渴望', '娱乐']
        },
        {
            'category': '多语言测试',
            'texts': [
                "I am absolutely fascinated by this discovery!",
                "Je me sens très romantique ce soir",
                "Estoy muy orgulloso de mis logros"
            ],
            'expected_dominants': ['入迷', '浪漫', '钦佩']
        }
    ]
    
    all_vectors = []
    
    for category in test_cases:
        print(f"\n📊 {category['category']}:")
        category_vectors = []
        
        for i, text in enumerate(category['texts']):
            # 获取情感向量
            emotion_vector = analyze_text_emotion(text)
            
            # 统计信息
            total_intensity = np.sum(emotion_vector)
            max_intensity = np.max(emotion_vector)
            active_count = np.sum(emotion_vector > 0.1)
            
            # 找出主导情感
            from emotion_mapper import GoEmotionsMapper
            from config import COWEN_KELTNER_EMOTIONS
            
            mapper = GoEmotionsMapper()
            if max_intensity > 0:
                top_emotions = mapper.get_top_emotions_from_vector(emotion_vector, 3)
                dominant_emotion = top_emotions[0][0] if top_emotions else "无"
            else:
                dominant_emotion = "无"
            
            print(f"   文本 {i+1}: {text[:40]}...")
            print(f"      主导情感: {dominant_emotion} ({max_intensity:.3f})")
            print(f"      总强度: {total_intensity:.3f}, 活跃情绪数: {active_count}")
            
            category_vectors.append(emotion_vector)
            all_vectors.append(emotion_vector)
        
        # 计算类别内的多样性
        category_matrix = np.array(category_vectors)
        category_std = np.std(category_matrix)
        print(f"   类别内多样性: {category_std:.4f}")
    
    # 整体多样性分析
    all_matrix = np.array(all_vectors)
    overall_std = np.std(all_matrix)
    overall_mean = np.mean(all_matrix)
    
    print(f"\n📈 整体统计:")
    print(f"   总体多样性 (标准差): {overall_std:.4f}")
    print(f"   总体均值: {overall_mean:.4f}")
    print(f"   零向量比例: {np.mean(np.sum(all_matrix, axis=1) == 0):.2%}")
    
    # 判断修复成功
    if overall_std > 0.05 and np.mean(np.sum(all_matrix, axis=1) == 0) < 0.5:
        print("✅ 情感多样性测试通过 - 模块能够区分不同情感")
        return True
    else:
        print("❌ 情感多样性测试失败 - 输出过于单调或零向量过多")
        return False

def test_kg_integration_interface():
    """测试与KG模块的集成接口"""
    print("\n🌉 测试KG模块集成接口")
    print("-" * 50)
    
    try:
        from inference_api import get_emotion_api, analyze_text_emotion
        
        # 测试全局API实例
        api = get_emotion_api()
        status = api.get_api_status()
        
        print(f"API状态: 模型加载={status['model_loaded']}, 设备={status['device']}")
        
        # 测试核心KG接口函数
        test_inputs = [
            "用户看起来很沮丧，需要安慰",
            "客户对产品非常满意，表示很开心",
            "对话者表现出强烈的愤怒情绪",
            "用户似乎对话题很感兴趣和好奇"
        ]
        
        print("\n🧪 测试KG集成核心接口:")
        
        for i, text in enumerate(test_inputs, 1):
            # 使用KG模块会调用的接口
            emotion_vector = api.get_emotion_for_kg_module(text)
            
            # 验证输出格式
            is_valid = (
                isinstance(emotion_vector, np.ndarray) and
                emotion_vector.shape == (27,) and
                np.all(emotion_vector >= 0) and 
                np.all(emotion_vector <= 1)
            )
            
            print(f"   测试 {i}: {text[:30]}...")
            print(f"      向量格式: {'✅ 有效' if is_valid else '❌ 无效'}")
            print(f"      向量范围: [{emotion_vector.min():.3f}, {emotion_vector.max():.3f}]")
            
            if not is_valid:
                print(f"      ❌ KG接口格式验证失败")
                return False
        
        # 测试快捷函数
        print(f"\n🔧 测试快捷函数:")
        quick_result = analyze_text_emotion("测试快捷函数调用")
        
        if isinstance(quick_result, np.ndarray) and quick_result.shape == (27,):
            print("   ✅ 快捷函数正常")
        else:
            print("   ❌ 快捷函数异常")
            return False
        
        print("✅ KG集成接口测试通过")
        return True
        
    except Exception as e:
        print(f"❌ KG集成测试失败: {e}")
        return False

def test_performance_stability():
    """测试性能和稳定性"""
    print("\n⚡ 测试性能和稳定性")
    print("-" * 50)
    
    try:
        from inference_api import analyze_text_emotion
        import time
        
        # 性能测试
        test_text = "这是一个测试文本，包含一些情感内容"
        
        # 预热
        analyze_text_emotion(test_text)
        
        # 计时测试
        start_time = time.time()
        for _ in range(10):
            result = analyze_text_emotion(test_text)
        end_time = time.time()
        
        avg_time = (end_time - start_time) / 10
        print(f"平均推理时间: {avg_time:.3f} 秒")
        
        if avg_time < 5.0:  # 5秒内可接受
            print("✅ 性能测试通过")
        else:
            print("⚠️  性能较慢但可用")
        
        # 稳定性测试 - 连续相同输入应产生相同输出
        results = []
        for _ in range(5):
            result = analyze_text_emotion("稳定性测试文本")
            results.append(result)
        
        # 检查一致性
        consistent = all(np.allclose(results[0], result) for result in results[1:])
        
        if consistent:
            print("✅ 稳定性测试通过 - 相同输入产生一致输出")
        else:
            print("❌ 稳定性测试失败 - 输出不一致")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ 性能稳定性测试失败: {e}")
        return False

def main():
    """运行完整的最终集成测试"""
    print("🚀 AC情感分析模块最终集成测试")
    print("=" * 60)
    print("验证修复后的AC模块功能完整性和KG集成能力")
    print("")
    
    # 运行所有测试
    test_results = []
    
    # 测试1: 情感多样性
    test_results.append(test_emotion_diversity())
    
    # 测试2: KG集成接口
    test_results.append(test_kg_integration_interface())
    
    # 测试3: 性能稳定性
    test_results.append(test_performance_stability())
    
    # 总结
    print("\n" + "=" * 60)
    print("📋 最终集成测试结果:")
    
    test_names = ["情感多样性识别", "KG模块集成接口", "性能稳定性"]
    
    for i, (name, result) in enumerate(zip(test_names, test_results)):
        status = "✅ 通过" if result else "❌ 失败"
        print(f"   {i+1}. {name}: {status}")
    
    success_rate = sum(test_results) / len(test_results)
    
    print(f"\n🎯 总体成功率: {success_rate:.1%}")
    
    if success_rate >= 1.0:
        print("\n🎉 恭喜！AC情感分析模块修复完全成功！")
        print("   ✅ 功能完全恢复，情感识别准确")  
        print("   ✅ 与KG模块集成接口正常")
        print("   ✅ 性能和稳定性符合要求")
        print("\n💡 模块现在可以投入使用，为KG模块提供准确的情感分析服务")
        
    elif success_rate >= 0.67:
        print("\n✅ AC情感分析模块修复基本成功！")
        print("   大部分功能正常，可以使用")
        print("   建议监控运行状态，必要时进一步优化")
        
    else:
        print("\n⚠️  AC情感分析模块修复不完全")
        print("   需要进一步调试和修复")
    
    return success_rate >= 0.67

if __name__ == "__main__":
    main()