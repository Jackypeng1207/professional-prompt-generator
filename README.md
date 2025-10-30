# 专业提示词生成器 (Professional Prompt Generator)

一个基于React + TypeScript + Vite构建的专业AI提示词生成工具，支持多种大模型API。

## 🌟 特性

- 🤖 **多模型支持**: 支持硅基流动API（DeepSeek-V3、千文2.5-72B、Kimi等）
- 🔄 **灵活切换**: 可在Google Gemini和硅基流动API之间自由切换
- 💬 **智能对话**: 与AI助手对话，逐步完善提示词
- 📁 **文件上传**: 支持图片和文档上传分析
- 💾 **提示词管理**: 保存和管理生成的提示词
- ⚡ **快速响应**: 基于Vite的快速开发体验

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）

```bash
# 给启动脚本添加执行权限
chmod +x start.sh

# 运行启动脚本
./start.sh
```

### 方法二：手动启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

应用将在 http://localhost:5173 运行

## 🔧 配置说明

### 1. API密钥配置

首次使用时，请在应用界面右上角点击"AI设置"按钮：

1. **选择AI服务提供商**: 硅基流动 或 Google Gemini
2. **输入API密钥**: 
   - 硅基流动: 访问 https://siliconflow.cn 获取API密钥
   - Google Gemini: 访问 https://aistudio.google.com 获取API密钥
3. **选择模型**: 根据需求选择合适的模型
4. **验证并保存**: 点击"验证密钥"确认配置正确

### 2. 环境变量配置（可选）

您也可以在 `.env.local` 文件中预设API密钥：

```env
# 硅基流动API配置
SILICONFLOW_API_KEY=your_siliconflow_api_key_here

# Google AI Studio配置（可选）
API_KEY=your_google_ai_api_key_here
```

## 📋 使用指南

### 基本使用

1. **开始对话**: 在左侧输入框输入您的需求
2. **上传文件**: 点击回形针图标上传图片或文档
3. **逐步完善**: 根据AI的建议继续对话，完善提示词
4. **保存结果**: 生成的提示词会自动显示在右侧，可复制或保存

### 支持的模型

#### 硅基流动API
- **DeepSeek-V3**: 强大的通用模型，适合各种任务
- **千文2.5-72B**: 阿里云通义千问，中文理解优秀
- **Kimi (Moonshot)**: 深度求索模型，长文本处理能力强

#### Google Gemini
- **Gemini 2.5 Pro**: Google最新模型，推理能力强
- **Gemini 2.0 Flash**: 快速响应版本

## 🛠️ 开发

### 项目结构

```
├── components/          # React组件
│   ├── ChatView.tsx     # 主聊天界面
│   ├── PromptBuilder.tsx # 提示词构建器
│   └── icons/           # 图标组件
├── services/            # API服务
│   ├── aiService.ts     # 统一AI服务接口
│   ├── geminiService.ts  # Google Gemini服务
│   └── siliconflowService.ts # 硅基流动服务
├── types.ts             # TypeScript类型定义
├── App.tsx              # 主应用组件
└── index.tsx            # 应用入口
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📝 注意事项

1. **API密钥安全**: 不要将API密钥提交到版本控制系统
2. **网络要求**: 确保可以访问硅基流动API（api.siliconflow.cn）
3. **费用说明**: 使用硅基流动API会产生费用，请关注使用量
4. **文件大小**: 上传的文件大小限制取决于浏览器和API限制

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1GPsrUviLXCVEWqu0PhTVwjBaIdd_rSZT

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
