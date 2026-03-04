# Docker 部署指南

本文档介绍如何使用Docker部署脚手架租赁管理系统。

## 前置要求

- Docker 20.10 或更高版本
- Docker Compose 2.0 或更高版本
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

## 快速开始

### 1. 克隆项目

```bash
git clone <仓库地址>
cd chuzu
```

### 2. 使用 Docker Compose 一键部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. 访问应用

- 前端应用：http://localhost
- 后端API：http://localhost:3001

## 服务说明

### Frontend (前端)

- **镜像**：基于 nginx:alpine
- **端口**：80
- **功能**：提供静态文件服务和反向代理
- **特点**：
  - 自动构建前端静态文件
  - 配置了反向代理到后端API
  - 启用了Gzip压缩
  - 配置了静态资源缓存

### Backend (后端API)

- **镜像**：基于 node:18-alpine
- **端口**：3001
- **功能**：提供RESTful API服务
- **特点**：
  - 使用SQLite数据库
  - 数据持久化到Docker卷
  - 自动初始化数据库结构
  - 支持CORS跨域请求

## Docker Compose 配置说明

### 网络配置

```yaml
networks:
  chuzu-network:
    driver: bridge
```

创建了一个名为 `chuzu-network` 的桥接网络，用于前后端服务之间的通信。

### 数据卷配置

```yaml
volumes:
  db-data:
    driver: local
```

创建了一个名为 `db-data` 的本地卷，用于持久化数据库文件。

### 环境变量

后端服务支持以下环境变量：

- `NODE_ENV`：运行环境（默认：production）
- `PORT`：服务端口（默认：3001）
- `DB_PATH`：数据库文件路径（默认：/app/data/chuzu.db）

## 常用命令

### 构建镜像

```bash
# 构建所有服务
docker-compose build

# 构建指定服务
docker-compose build frontend
docker-compose build backend
```

### 启动服务

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 启动指定服务
docker-compose up -d frontend
docker-compose up -d backend

# 启动并查看日志
docker-compose up
```

### 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看指定服务日志
docker-compose logs frontend
docker-compose logs backend
```

### 进入容器

```bash
# 进入前端容器
docker-compose exec frontend sh

# 进入后端容器
docker-compose exec backend sh
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启指定服务
docker-compose restart frontend
docker-compose restart backend
```

## 数据备份与恢复

### 备份数据

```bash
# 备份数据库
docker-compose exec backend cat /app/data/chuzu.db > backup_$(date +%Y%m%d_%H%M%S).db

# 备份整个数据卷
docker run --rm -v chuzu_db-data:/data -v $(pwd):/backup alpine tar czf /backup/chuzu_data_$(date +%Y%m%d_%H%M%S).tar.gz /data
```

### 恢复数据

```bash
# 恢复数据库
docker-compose exec -T backend sh -c 'cat > /app/data/chuzu.db' < backup_20240101_120000.db

# 恢复整个数据卷
docker run --rm -v chuzu_db-data:/data -v $(pwd):/backup alpine sh -c 'cd /data && tar xzf /backup/chuzu_data_20240101_120000.tar.gz --strip 1'
```

## 性能优化

### 资源限制

可以在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 数据库优化

对于生产环境，建议：

1. 使用外部数据库（如MySQL、PostgreSQL）
2. 配置数据库连接池
3. 启用数据库查询缓存

## 安全配置

### 修改默认端口

修改 `docker-compose.yml` 中的端口映射：

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # 将外部端口改为8080
```

### 配置HTTPS

1. 准备SSL证书文件
2. 修改 `nginx.conf` 配置SSL
3. 挂载证书文件到容器

### 防火墙配置

确保防火墙允许以下端口：

- 80（HTTP）
- 443（HTTPS）
- 3001（后端API，如果需要外部访问）

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查容器状态
docker-compose ps

# 检查端口占用
netstat -tuln | grep -E ':(80|3001)'
```

### 数据库连接失败

```bash
# 检查数据库文件权限
docker-compose exec backend ls -la /app/data/

# 检查数据库文件是否存在
docker-compose exec backend test -f /app/data/chuzu.db && echo "存在" || echo "不存在"
```

### 前端无法访问后端

```bash
# 检查网络连接
docker-compose exec frontend ping backend

# 检查nginx配置
docker-compose exec frontend cat /etc/nginx/nginx.conf
```

## 生产环境部署建议

1. **使用外部数据库**：将SQLite替换为MySQL或PostgreSQL
2. **配置负载均衡**：使用Nginx或HAProxy进行负载均衡
3. **启用监控**：集成Prometheus、Grafana等监控工具
4. **配置日志收集**：使用ELK或Loki进行日志收集和分析
5. **定期备份**：设置自动备份策略
6. **安全加固**：
   - 限制容器权限
   - 使用非root用户运行服务
   - 定期更新镜像
   - 配置防火墙规则

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d

# 清理旧镜像
docker image prune -f
```

## 卸载

```bash
# 停止并删除所有服务
docker-compose down

# 删除数据卷（谨慎使用，会删除所有数据）
docker-compose down -v

# 删除镜像
docker rmi chuzu_frontend chuzu_backend
```

## 技术支持

如遇到问题，请检查：

1. Docker和Docker Compose版本是否符合要求
2. 端口是否被占用
3. 磁盘空间是否充足
4. 防火墙配置是否正确
5. 查看日志文件获取详细错误信息

## 许可证

MIT License
