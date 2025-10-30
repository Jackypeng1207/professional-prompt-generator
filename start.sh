#!/bin/bash

# 专业提示词生成器启动脚本
# 支持硅基流动API（DeepSeek/千文/Kimi等大模型）

echo "🚀 启动专业提示词生成器..."
echo "================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    echo "下载地址：https://nodejs.org/"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请检查Node.js安装"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

# 检查环境配置文件
if [ ! -f ".env.local" ]; then
    echo "⚠️  未找到.env.local文件，将使用默认配置"
    echo "💡 提示：您可以在.env.local中设置API密钥"
fi

echo ""
echo "🔧 配置说明："
echo "   1. 首次使用时，请在浏览器中打开设置界面配置API密钥"
echo "   2. 硅基流动API密钥获取：https://siliconflow.cn"
echo "   3. 支持模型：DeepSeek-V3、千文2.5-72B、Kimi等"
echo ""

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "   应用将在 http://localhost:5173 运行"
echo "   按 Ctrl+C 停止服务器"
echo ""

npm run dev