#!/bin/bash

# 阿里云ECS服务器部署脚本
# 此脚本在服务器上运行，用于部署已构建的应用

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

# 停止当前服务
stop_services() {
    log "停止当前服务..."
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down || warn "停止服务时出现警告"
        log "服务已停止"
    else
        warn "未找到docker-compose.yml文件，跳过停止服务"
    fi
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
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        log "健康检查通过 - 网站可正常访问"
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
    log "网站地址：http://120.55.6.96"
    log "Nginx服务端口：80 (HTTP)"
    log ""
    log "查看服务状态：docker-compose ps"
    log "查看应用日志：docker-compose logs -f app"
    log "查看Nginx日志：docker-compose logs -f nginx"
    log "停止服务：docker-compose down"
    log "================"
}

# 主函数
main() {
    log "开始阿里云ECS服务器部署"
    
    # 执行部署步骤（在服务器上只运行部署相关步骤）
    check_dependencies
    backup
    stop_services
    start_services
    health_check
    cleanup
    show_info
    
    log "部署完成！网站已上线：http://120.55.6.96"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi