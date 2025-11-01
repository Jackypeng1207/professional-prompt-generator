# 阿里云2核2G服务器部署指南

## 🚀 为什么选择阿里云ECS？

### 优势对比
| 方案 | 费用 | 性能 | 控制权 | 扩展性 |
|------|------|------|--------|--------|
| **阿里云ECS** | 💰 性价比高 | ⭐⭐⭐⭐ | ✅ 完全控制 | ✅ 弹性扩展 |
| Coding Pages | 🆓 免费 | ⭐⭐ | ❌ 有限控制 | ❌ 有限扩展 |
| Vercel | 🆓 免费 | ⭐⭐⭐ | ❌ 有限控制 | ✅ 自动扩展 |

### 阿里云ECS优势
- ✅ **完全控制**：自主管理服务器
- ✅ **性能稳定**：2核2G配置足够
- ✅ **国内访问**：速度快，无网络限制
- ✅ **成本可控**：按需付费，性价比高
- ✅ **扩展灵活**：随时升级配置

## 💰 费用预估

### 阿里云ECS 2核2G配置
- **实例类型**：共享计算型 s6
- **CPU**：2核
- **内存**：2GB
- **系统盘**：40GB ESSD
- **带宽**：1-5Mbps（按需选择）

### 月费用估算
- **ECS实例**：约 **50-80元/月**
- **公网带宽**：约 **20-50元/月**（按实际使用）
- **总费用**：约 **70-130元/月**

## 🛠️ 部署前准备

### 第一步：购买阿里云ECS
1. **访问阿里云官网**：https://www.aliyun.com/
2. **注册/登录账号**
3. **实名认证**（必需）
4. **购买ECS实例**：
   - 地域：**华东1（杭州）** 或 **华北2（北京）**
   - 实例规格：**共享计算型 s6**
   - 镜像：**CentOS 7.9** 或 **Ubuntu 20.04**
   - 系统盘：40GB ESSD
   - 带宽：1-5Mbps（建议3Mbps）

### 第二步：安全组配置
1. **登录ECS控制台**
2. **进入安全组管理**
3. **添加入站规则**：
   ```
   端口：22（SSH） - 源：0.0.0.0/0
   端口：80（HTTP） - 源：0.0.0.0/0  
   端口：443（HTTPS）- 源：0.0.0.0/0
   端口：3000（应用）- 源：0.0.0.0/0
   ```

### 第三步：获取连接信息
- **公网IP**：从ECS控制台获取
- **用户名**：root（默认）
- **密码**：购买时设置的密码

## 📦 自动部署配置

### 已创建的配置文件

#### 1. Docker容器化配置
- `Dockerfile` - 应用容器定义
- `docker-compose.yml` - 多服务编排
- `nginx.conf` - Nginx反向代理

#### 2. 自动化脚本
- `deploy.sh` - 一键部署脚本
- `aliyun-deploy.yml` - GitHub Actions工作流

#### 3. 部署工作流
- `.github/workflows/aliyun-deploy.yml` - 自动部署配置

## 🚀 一键部署步骤

### 方法一：GitHub Actions自动部署（推荐）

#### 1. 配置GitHub Secrets
在GitHub仓库设置中添加：
```
ALIYUN_HOST: 您的ECS公网IP
ALIYUN_USERNAME: root
ALIYUN_SSH_KEY: 您的SSH私钥
```

#### 2. 推送代码触发部署
```bash
git add .
git commit -m "feat: 添加阿里云ECS部署配置"
git push origin main
```

#### 3. 查看部署状态
- 在GitHub Actions查看构建日志
- 部署完成后访问您的网站

### 方法二：手动部署

#### 1. 连接服务器
```bash
ssh root@您的公网IP
```

#### 2. 安装必要软件
```bash
# 更新系统
yum update -y  # CentOS
# 或
apt update && apt upgrade -y  # Ubuntu

# 安装Docker
curl -fsSL https://get.docker.com | bash
systemctl start docker
systemctl enable docker

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 3. 部署应用
```bash
# 克隆代码
git clone https://github.com/Jackypeng1207/professional-prompt-generator.git
cd professional-prompt-generator

# 一键部署
chmod +x deploy.sh
./deploy.sh
```

## 🌐 访问您的网站

部署完成后，通过以下地址访问：
- **HTTP**：http://您的公网IP
- **HTTPS**：https://您的公网IP（需要配置SSL证书）

### 配置域名（可选）
1. **购买域名**：在阿里云或其他平台
2. **域名解析**：将域名指向ECS公网IP
3. **配置SSL证书**：使用Let's Encrypt免费证书

## 🔧 高级配置

### SSL证书配置
```bash
# 安装Certbot
apt install certbot python3-certbot-nginx -y

# 获取证书
certbot --nginx -d 您的域名.com

# 自动续期
certbot renew --dry-run
```

### 性能优化
```bash
# 优化Nginx配置
vim /etc/nginx/nginx.conf

# 启用Gzip压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;

# 配置缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 监控和日志
```bash
# 查看容器日志
docker-compose logs -f

# 查看系统资源
top
htop

# 监控网络流量
iftop
```

## 🛡️ 安全配置

### 1. 防火墙配置
```bash
# 仅开放必要端口
ufw allow 22  # SSH
ufw allow 80  # HTTP
ufw allow 443 # HTTPS
ufw enable
```

### 2. SSH安全
```bash
# 修改SSH端口
vim /etc/ssh/sshd_config
Port 2222  # 修改为非常用端口

# 禁用root登录
PermitRootLogin no

# 重启SSH服务
systemctl restart sshd
```

### 3. 定期更新
```bash
# 设置自动更新
crontab -e

# 添加以下行
0 2 * * * apt update && apt upgrade -y
```

## 🔄 维护和更新

### 代码更新
```bash
# 拉取最新代码
git pull origin main

# 重新部署
./deploy.sh
```

### 数据备份
```bash
# 备份数据库（如果有）
docker exec mysql mysqldump -u root -p database > backup.sql

# 备份应用数据
tar -czf app-backup.tar.gz /app/data
```

### 监控告警
- 配置阿里云云监控
- 设置CPU、内存、磁盘使用率告警
- 配置网站可用性监控

## 🆘 故障排除

### 常见问题

#### 1. 端口无法访问
```bash
# 检查防火墙
ufw status

# 检查端口监听
netstat -tulpn | grep :80

# 检查安全组规则
```

#### 2. 应用启动失败
```bash
# 查看容器状态
docker-compose ps

# 查看应用日志
docker-compose logs prompt-generator

# 重启服务
docker-compose restart
```

#### 3. 性能问题
```bash
# 查看系统资源
top

# 查看磁盘空间
df -h

# 查看内存使用
free -h
```

## 📞 技术支持

### 阿里云支持
- **工单系统**：控制台内提交工单
- **电话支持**：95187
- **文档中心**：https://help.aliyun.com/

### 项目支持
- **GitHub Issues**：提交问题
- **文档更新**：查看本指南最新版本

---

## 🎯 立即开始

### 推荐部署流程
1. **购买阿里云ECS**（2核2G配置）
2. **配置安全组**（开放22,80,443端口）
3. **配置GitHub Secrets**（自动部署）
4. **推送代码触发部署**
5. **测试网站功能**
6. **配置域名和SSL**（可选）

### 预计时间
- **服务器购买**：10分钟
- **环境配置**：15分钟  
- **自动部署**：5-10分钟
- **总时间**：约30-45分钟

**开始部署吧！阿里云ECS为您提供稳定可靠的国内访问体验！** 🚀