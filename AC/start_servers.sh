#!/bin/bash
# EmoHeal 服务器启动脚本
# 启动情感分析API服务器和相关服务

set -e  # 遇到错误时退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 配置参数
DEFAULT_HOST="0.0.0.0"
DEFAULT_API_PORT="5000"
DEFAULT_DEBUG="false"

# 解析命令行参数
HOST=${1:-$DEFAULT_HOST}
API_PORT=${2:-$DEFAULT_API_PORT}
DEBUG=${3:-$DEFAULT_DEBUG}

# 项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AC_MODULE_DIR="$SCRIPT_DIR"

echo -e "${PURPLE}🎵 EmoHeal 情感分析系统启动脚本${NC}"
echo -e "${PURPLE}===========================================${NC}"
echo ""

# 检查Python环境
check_python_env() {
    echo -e "${BLUE}🔍 检查Python环境...${NC}"
    
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ 未找到Python 3，请确保已安装Python 3.7+${NC}"
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✅ Python版本: $PYTHON_VERSION${NC}"
    
    # 检查虚拟环境
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        echo -e "${GREEN}✅ 虚拟环境: $VIRTUAL_ENV${NC}"
    else
        echo -e "${YELLOW}⚠️  建议使用Python虚拟环境${NC}"
    fi
}

# 检查依赖包
check_dependencies() {
    echo -e "${BLUE}🔍 检查依赖包...${NC}"
    
    # 必需的包列表
    REQUIRED_PACKAGES=("flask" "flask-cors" "transformers" "torch" "numpy" "pandas")
    
    for package in "${REQUIRED_PACKAGES[@]}"; do
        if python3 -c "import $package" &> /dev/null; then
            echo -e "${GREEN}✅ $package${NC}"
        else
            echo -e "${RED}❌ $package 未安装${NC}"
            echo -e "${YELLOW}提示: pip install $package${NC}"
            MISSING_DEPS=true
        fi
    done
    
    if [[ "$MISSING_DEPS" == "true" ]]; then
        echo -e "${RED}❌ 存在缺失的依赖包，请先安装${NC}"
        exit 1
    fi
}

# 检查模型文件
check_model_files() {
    echo -e "${BLUE}🔍 检查模型文件...${NC}"
    
    MODEL_DIR="$AC_MODULE_DIR/models/finetuned_xlm_roberta"
    
    if [[ -d "$MODEL_DIR" ]]; then
        echo -e "${GREEN}✅ 发现微调模型目录${NC}"
        
        # 检查关键模型文件
        MODEL_FILES=("config.json" "model.safetensors" "tokenizer.json")
        for file in "${MODEL_FILES[@]}"; do
            if [[ -f "$MODEL_DIR/$file" ]]; then
                echo -e "${GREEN}  ✅ $file${NC}"
            else
                echo -e "${YELLOW}  ⚠️  $file 缺失${NC}"
            fi
        done
    else
        echo -e "${YELLOW}⚠️  微调模型目录不存在，将使用预训练模型${NC}"
    fi
}

# 创建必要目录
create_directories() {
    echo -e "${BLUE}📁 创建必要目录...${NC}"
    
    DIRS=("logs" "data" "models/pretrained")
    
    for dir in "${DIRS[@]}"; do
        mkdir -p "$AC_MODULE_DIR/$dir"
        echo -e "${GREEN}✅ 创建目录: $dir${NC}"
    done
}

# 检查端口占用
check_port_availability() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ 端口 $port 已被占用 ($service_name)${NC}"
        echo -e "${YELLOW}提示: 使用 lsof -Pi :$port -sTCP:LISTEN 查看占用进程${NC}"
        return 1
    else
        echo -e "${GREEN}✅ 端口 $port 可用 ($service_name)${NC}"
        return 0
    fi
}

# 启动API服务器
start_api_server() {
    echo -e "${BLUE}🚀 启动API服务器...${NC}"
    
    cd "$AC_MODULE_DIR"
    
    # 构建启动命令
    CMD="python3 api_server.py --host $HOST --port $API_PORT"
    
    if [[ "$DEBUG" == "true" ]]; then
        CMD="$CMD --debug"
        echo -e "${YELLOW}⚠️  调试模式已启用${NC}"
    fi
    
    echo -e "${GREEN}💻 执行命令: $CMD${NC}"
    echo ""
    
    # 启动服务器
    exec $CMD
}

# 显示服务信息
show_service_info() {
    echo -e "${PURPLE}🌐 服务信息${NC}"
    echo -e "${PURPLE}===============${NC}"
    echo -e "主机地址: ${GREEN}$HOST${NC}"
    echo -e "API端口:   ${GREEN}$API_PORT${NC}"
    echo -e "调试模式: ${GREEN}$DEBUG${NC}"
    echo ""
    echo -e "${PURPLE}📡 API端点${NC}"
    echo -e "${PURPLE}============${NC}"
    echo -e "健康检查:     ${GREEN}GET  http://$HOST:$API_PORT/api/health${NC}"
    echo -e "情感分析:     ${GREEN}POST http://$HOST:$API_PORT/api/emotion/analyze-with-context${NC}"
    echo -e "情感列表:     ${GREEN}GET  http://$HOST:$API_PORT/api/emotion/emotions-list${NC}"
    echo -e "批量分析:     ${GREEN}POST http://$HOST:$API_PORT/api/emotion/batch-analyze${NC}"
    echo ""
    echo -e "${PURPLE}🎯 前端配置${NC}"
    echo -e "${PURPLE}============${NC}"
    echo -e "API基础URL:   ${GREEN}http://$HOST:$API_PORT/api${NC}"
    echo -e "CORS设置:     ${GREEN}已启用 (允许所有源)${NC}"
    echo -e "超时设置:     ${GREEN}30秒${NC}"
    echo ""
    if [[ "$HOST" == "0.0.0.0" ]]; then
        LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
        echo -e "${YELLOW}💡 提示: 服务器绑定到所有接口${NC}"
        echo -e "   本地访问: ${GREEN}http://localhost:$API_PORT${NC}"
        echo -e "   局域网访问: ${GREEN}http://$LOCAL_IP:$API_PORT${NC}"
    fi
    echo ""
}

# 信号处理 - 优雅关闭
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 收到关闭信号，正在清理...${NC}"
    
    # 关闭后台进程
    if [[ ! -z "$API_PID" ]]; then
        kill $API_PID 2>/dev/null || true
        echo -e "${GREEN}✅ API服务器已关闭${NC}"
    fi
    
    echo -e "${GREEN}✅ 清理完成${NC}"
    exit 0
}

# 设置信号处理
trap cleanup SIGTERM SIGINT

# 主函数
main() {
    echo -e "${BLUE}开始启动序列...${NC}"
    echo ""
    
    # 环境检查
    check_python_env
    check_dependencies
    check_model_files
    create_directories
    
    # 端口检查
    echo -e "${BLUE}🔍 检查端口可用性...${NC}"
    if ! check_port_availability $API_PORT "EmoHeal API"; then
        echo -e "${RED}❌ 端口冲突，启动失败${NC}"
        exit 1
    fi
    
    echo ""
    show_service_info
    
    echo -e "${GREEN}🎉 所有检查通过，启动服务器...${NC}"
    echo -e "${YELLOW}按 Ctrl+C 停止服务器${NC}"
    echo ""
    
    # 启动API服务器
    start_api_server
}

# 显示帮助信息
show_help() {
    echo "EmoHeal 服务器启动脚本"
    echo ""
    echo "用法: $0 [HOST] [API_PORT] [DEBUG]"
    echo ""
    echo "参数:"
    echo "  HOST      服务器监听地址 (默认: $DEFAULT_HOST)"
    echo "  API_PORT  API服务器端口 (默认: $DEFAULT_API_PORT)"
    echo "  DEBUG     调试模式 (true/false, 默认: $DEFAULT_DEBUG)"
    echo ""
    echo "示例:"
    echo "  $0                              # 使用默认配置"
    echo "  $0 localhost 8000 true         # 本地调试模式"
    echo "  $0 0.0.0.0 5000 false          # 生产模式"
    echo ""
    echo "环境变量:"
    echo "  VIRTUAL_ENV                     # Python虚拟环境路径"
    echo ""
    exit 0
}

# 解析帮助参数
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    show_help
fi

# 运行主函数
main "$@"