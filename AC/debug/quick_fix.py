#!/usr/bin/env python3
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
            
            print("\n🧪 测试预测:")
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
