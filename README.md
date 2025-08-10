# EmoHeal Complete Experiment Flow - qm_final5

## 📋 Overview
This is the clean version of the EmoHeal research system containing only the essential files for running the complete 6-step experiment flow.

## 🚀 Quick Start

### 本地开发环境
1. **启动后端服务器**
   ```bash
   chmod +x start_servers.sh && ./start_servers.sh
   ```
   - 情感分析API服务器: `http://127.0.0.1:5001` 
   - 数据收集服务器: `http://127.0.0.1:5002`

2. **启动前端静态服务器**
   ```bash
   python3 -m http.server 8000
   ```

3. **访问实验系统**
   ```
   http://127.0.0.1:8000/emoheal_complete_flow.html
   ```

## 📁 File Structure
```
qm_final5/
├── emoheal_complete_flow.html    # Complete single-page experiment flow
├── config.js                    # Configuration settings
├── study_flow.js                 # Study flow management
├── styles.css                    # Styling for all pages
├── api_server.py                 # Main API server (port 5001)
├── data_collection_server.py     # Data collection server (port 5002)
├── start_servers.sh              # Server startup script
├── research_data/                # Stored experiment data
├── AC/                          # Affective Computing module
├── MI_retrieve/                 # Music Information Retrieval
├── KG/                          # Knowledge Graph module
└── segments_3min/               # Music video segments (if available)
```

## 🔧 System Architecture
- **Frontend**: Single-page HTML application with 6 workflow steps
- **Backend**: Dual Flask servers (API + Data Collection)
- **AI Components**: 
  - AC: Emotion analysis using xlm-roberta-base
  - KG: Emotion-music mapping system
  - MI_retrieve: CLAMP3-based music retrieval

## 📊 Data Collection
- All participant data stored in `research_data/` as JSON files
- Session IDs follow format: `EMOHEAL_timestamp_randomid`
- Data includes participant info, therapy session, and questionnaire responses

## 🎯 Six-Step Workflow
1. **Portal**: Welcome and study introduction
2. **Participant Info**: Demographics collection
3. **Consent**: 7-point consent form
4. **Therapy**: AI-powered music therapy experience
5. **Questionnaire**: 8-question post-experience survey
6. **Thank You**: Completion and data download

## ⚡ Server Configuration
- Emotion API Server: `http://127.0.0.1:5001`
- Data Collection Server: `http://127.0.0.1:5002`
- Static File Server: `http://127.0.0.1:8000`

## 🚀 Deployment Options

### 🖥️ 本地开发部署
适用于开发测试阶段，所有服务运行在本机：
- 使用 `start_servers.sh` 启动后端API服务器
- 使用 `python3 -m http.server 8000` 启动静态文件服务器
- 所有服务在本机运行，通过localhost访问

### ☁️ 混合云端部署 (推荐生产环境)
前端部署到云端，后端保留在本机：

#### 前端云端托管选项
1. **GitHub Pages** (免费)
   - 将HTML/CSS/JS文件推送到GitHub仓库
   - 启用GitHub Pages功能
   - 自动获得 `https://username.github.io/repo-name` 域名

2. **Vercel** (免费)
   - 连接GitHub仓库，自动CI/CD部署
   - 提供自定义域名支持
   - 全球CDN加速

3. **Netlify** (免费)
   - 拖放式部署或Git集成
   - 表单处理和无服务器函数支持

4. **AWS S3 + CloudFront**
   - 企业级静态网站托管
   - 全球内容分发网络

#### 本机后端配置
1. **启动后端服务器**
   ```bash
   ./start_servers.sh  # 只启动API服务器，无需静态服务器
   ```

2. **内网穿透工具** (让云端前端访问本机后端)
   - **ngrok** (推荐新手):
     ```bash
     ngrok http 5001  # 情感分析API
     ngrok http 5002  # 数据收集API
     ```
   - **frp** (开源方案)
   - **CloudFlare Tunnel** (企业级)

3. **修改前端配置**
   更新 `config.js` 中的API地址为ngrok提供的公网URL：
   ```javascript
   const API_CONFIG = {
       dataCollectionUrl: 'https://abc123.ngrok.io',  // ngrok生成的URL
       emotionApiUrl: 'https://def456.ngrok.io'
   };
   ```

### 🔧 部署架构对比

| 部署方式 | 优势 | 适用场景 |
|---------|------|---------|
| **全本地** | 简单快速，无需配置 | 开发测试 |
| **混合云端** | 前端全球访问，后端数据安全 | 生产环境，多人协作 |
| **全云端** | 完全托管，高可用性 | 大规模部署 |

### ⚠️ 注意事项
- **混合部署**时需要处理CORS跨域问题
- **内网穿透**工具可能影响API响应速度
- **生产环境**建议使用HTTPS和域名绑定
- **数据安全**考虑，敏感数据处理建议保留在本机