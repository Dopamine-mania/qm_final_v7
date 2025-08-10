#!/bin/bash

# EmoHeal研究系统 - 服务器启动脚本
# 同时启动数据收集服务器(5000)和情感分析API服务器(5001)

echo "🎵 EmoHeal研究系统 - 启动服务器"
echo "=================================="
echo ""

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3，请先安装Python 3.8+"
    exit 1
fi

# 检查依赖
echo "📦 检查依赖..."
python3 -c "import flask, flask_cors" 2>/dev/null || {
    echo "❌ 缺少Flask依赖，请安装: pip install flask flask-cors"
    exit 1
}

# 设置环境变量
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# 停止已存在的服务器
echo "🔄 停止已存在的服务器..."
pkill -f "python3.*data_collection_server.py" 2>/dev/null
pkill -f "python3.*api_server.py" 2>/dev/null
sleep 2

echo ""
echo "🚀 启动服务器..."

# 启动数据收集服务器 (5000端口)
echo "📊 启动数据收集服务器 (端口: 5000)"
python3 data_collection_server.py > data_server.log 2>&1 &
DATA_SERVER_PID=$!

# 等待一秒
sleep 1

# 启动情感分析API服务器 (5001端口)
echo "🎵 启动情感分析API服务器 (端口: 5001)"  
python3 api_server.py > api_server.log 2>&1 &
API_SERVER_PID=$!

# 等待服务器启动
sleep 3

echo ""
echo "✅ 服务器启动完成！"
echo "📊 数据收集服务器: http://127.0.0.1:5000 (PID: $DATA_SERVER_PID)"
echo "🎵 情感分析API服务器: http://127.0.0.1:5001 (PID: $API_SERVER_PID)"
echo ""
echo "🌐 实验入口: http://localhost:8080/experiment_portal.html"
echo "🎵 直接疗愈: http://localhost:8080/therapy_interface_bilingual.html"
echo ""
echo "📝 日志文件: data_server.log, api_server.log"
echo "⚠️  按 Ctrl+C 停止所有服务器"

# 捕获中断信号
trap 'echo ""; echo "🛑 停止服务器..."; kill $DATA_SERVER_PID $API_SERVER_PID 2>/dev/null; exit 0' INT

# 保持脚本运行
while true; do
    sleep 1
done