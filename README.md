# 脚手架租赁管理系统

## 项目描述

这是一个完整的脚手架租赁管理系统，用于管理脚手架等物资的租赁业务。系统包含前端和后端两部分，实现了从物资管理、客户管理到开单、收款的完整业务流程。

## 系统架构

### 前端
- **技术栈**：Vue 3 + Vant UI + ECharts + HTML2Canvas + XLSX
- **功能模块**：
  - 首页：显示日租金预计、在外物资总数、资产分布图表、最近业务
  - 开单：支持送货出库和收货入库
  - 物资：物资列表和分布查询
  - 客户：客户管理和财务信息
  - 管理后台：物资管理、客户管理、系统配置

### 后端
- **技术栈**：Cloudflare Workers风格的API
- **数据库**：SQLite
- **主要接口**：
  - 系统配置管理
  - 管理员验证
  - 物资CRUD操作
  - 客户管理
  - 订单处理
  - 付款登记
  - 统计数据
  - 物资分布查询
  - 客户财务信息

## 功能特点

1. **完整的租赁业务流程**：从物资管理、客户管理到开单、收款
2. **数据可视化**：使用ECharts展示资产分布
3. **单据生成**：支持生成和保存单据图片用于打印
4. **Excel导出**：支持导出客户财务报表
5. **响应式设计**：适配移动端设备
6. **数据安全**：管理员密码验证
7. **自动数据库维护**：确保数据库结构完整

## 快速开始

### 本地开发

1. 克隆仓库
```bash
git clone <仓库地址>
cd chuzu
```

2. 部署后端API
   - 后端API设计为Cloudflare Workers风格，可部署到Cloudflare Workers
   - 也可以使用其他支持类似API结构的平台

3. 配置前端
   - 编辑 `index` 文件中的 `API` 变量，设置为您的API部署地址
   ```javascript
   const API = "https://your-api-url.com";
   ```

4. 部署前端
   - 前端可以部署到GitHub Pages、Vercel、Netlify等静态网站托管服务

### 系统初始化

1. 首次访问系统时，数据库会自动创建所需的表结构
2. 默认管理员密码为 `admin`
3. 建议登录后修改管理员密码

## 项目结构

```
chuzu/
├── .git/
├── .gitignore
├── README.md
├── api          # 后端API代码
└── index        # 前端代码
```

## 数据库结构

- **sys_config**：系统配置表
- **products**：物资表
- **customers**：客户表
- **orders**：订单表
- **order_items**：订单明细表
- **customer_stocks**：客户物资库存表
- **payments**：付款记录表

## 部署指南

### 部署到Cloudflare Workers

1. **部署后端API**
   - 登录Cloudflare控制台
   - 创建新的Worker
   - 将 `api` 文件的内容复制到Worker编辑器
   - 配置KV存储或D1数据库
   - 部署Worker

2. **部署前端**
   - 编辑 `index` 文件中的 `API` 变量，设置为Worker的URL
   - 将 `index` 文件部署到静态网站托管服务

### 部署到其他平台

- **后端**：可以使用任何支持类似API结构的平台，如Vercel Functions、Netlify Functions等
- **前端**：可以部署到GitHub Pages、Vercel、Netlify等静态网站托管服务

## 使用说明

1. **登录管理后台**：点击首页右上角的设置图标，输入管理员密码（默认：admin）
2. **添加物资**：在管理后台的物资管理中添加物资信息
3. **添加客户**：在管理后台的客户管理中添加客户信息
4. **开单**：在开单页面选择客户和物资，提交生成单据
5. **查看客户财务**：在客户列表中点击客户，查看客户的财务信息和在租物资
6. **登记收款**：在客户财务页面登记收款记录

## 技术文档

### API接口

- **GET /config**：获取系统配置
- **POST /config**：保存系统配置
- **POST /auth**：管理员验证
- **GET /products**：获取物资列表
- **POST /products**：添加物资
- **PUT /products**：更新物资
- **DELETE /products**：删除物资
- **GET /customers**：获取客户列表
- **POST /customers**：添加客户
- **PUT /customers**：更新客户
- **POST /orders**：创建订单
- **GET /orders/:id**：获取订单详情
- **POST /payments**：登记付款
- **GET /customers/:id/financial**：获取客户财务信息
- **GET /stats**：获取统计数据
- **GET /products/:id/distribution**：获取物资分布

### 前端功能

- **首页**：显示系统概览和统计数据
- **开单**：创建出库和入库单据
- **物资**：管理和查询物资
- **客户**：管理客户信息和财务
- **管理后台**：系统配置、物资管理、客户管理

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
