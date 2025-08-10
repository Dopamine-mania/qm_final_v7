# EmoHeal 前端部署指南

## 🌍 Cloudflare Pages 部署

这是EmoHeal音乐疗愈系统的前端部署版本，设计用于部署到Cloudflare Pages。

### 📁 文件结构
```
frontend_deploy/
├── index.html          # 主页面 (from emoheal_complete_flow.html)
├── config.js           # API配置文件
├── study_flow.js       # 实验流程逻辑
├── styles.css          # 样式文件
└── README.md          # 部署说明
```

### 🔧 配置说明

1. **config.js** - 需要更新API端点为ngrok隧道地址
2. **CORS设置** - 后端需要允许Cloudflare域名的跨域请求

### 🚀 部署步骤

1. 确保本地后端服务器运行 (ports 5001, 5002)
2. 使用ngrok创建隧道暴露本地API
3. 更新config.js中的API地址
4. 将文件上传到Cloudflare Pages

### 🌐 访问流程

用户 → Cloudflare Pages → ngrok隧道 → 本地API服务器

### 📝 注意事项

- 免费ngrok隧道URL会定期变化，需要相应更新配置
- 确保本地防火墙允许ngrok连接
- 建议升级到ngrok付费版本获得固定域名