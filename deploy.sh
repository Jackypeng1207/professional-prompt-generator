#!/bin/bash

# 阿里云ECS部署脚本
# 使用方法：./deploy.sh [环境]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# 检查依赖
check_dependencies() {
    log "检查系统依赖..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker未安装，请先安装Docker"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose未安装，请先安装Docker Compose"
    fi
    
    log "依赖检查通过"
}

# 备份当前版本
backup() {
    log "备份当前版本..."
    
    if [ -d "dist" ]; then
        if [ -d "dist_backup" ]; then
            rm -rf dist_backup
        fi
        cp -r dist dist_backup
        log "备份完成：dist_backup"
    fi
}

# 构建应用
build_app() {
    log "开始构建应用..."
    
    # 安装依赖
    log "安装依赖包..."
    npm install
    
    # 构建项目
    log "构建项目..."
    npm run build
    
    if [ $? -eq 0 ]; then
        log "应用构建成功"
    else
        error "应用构建失败"
    fi
}

# 构建Docker镜像
build_docker() {
    log "构建Docker镜像..."
    
    docker-compose build
    
    if [ $? -eq 0 ]; then
        log "Docker镜像构建成功"
    else
        error "Docker镜像构建失败"
    fi
}

# 停止当前服务
stop_services() {
    log "停止当前服务..."
    
    docker-compose down || warn "停止服务时出现警告"
    log "服务已停止"
}

# 启动服务
start_services() {
    log "启动服务..."
    
    docker-compose up -d
    
    # 等待服务启动
    log "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        log "服务启动成功"
    else
        error "服务启动失败"
    fi
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    # 等待应用完全启动
    sleep 5
    
    # 检查应用是否响应
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log "健康检查通过"
    else
        warn "健康检查未通过，但继续部署"
    fi
}

# 清理旧镜像
cleanup() {
    log "清理旧Docker镜像..."
    
    # 删除无用的镜像
    docker image prune -f
    
    log "清理完成"
}

# 显示部署信息
show_info() {
    log "=== 部署完成 ==="
    log "应用地址：http://localhost:3000"
    log "Nginx地址：http://localhost:80 (HTTP)"
    log "Nginx地址：https://localhost:443 (HTTPS)"
    log ""
    log "查看服务状态：docker-compose ps"
    log "查看日志：docker-compose logs -f"
    log "停止服务：docker-compose down"
    log "================"
}

# 主函数
main() {
    local environment=${1:-production}
    
    log "开始部署到 ${environment} 环境"
    
    # 执行部署步骤
    check_dependencies
    backup
    build_app
    build_docker
    stop_services
    start_services
    health_check
    cleanup
    show_info
    
    log "部署完成！"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi