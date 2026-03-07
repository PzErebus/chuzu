# 脚手架管家 - 完整技术文档

## 📋 项目概述

**项目名称**: 脚手架管家  
**项目类型**: Web应用 + Cloudflare Workers API  
**开发状态**: 生产环境  
**技术架构**: 前后端分离  
**部署平台**: Cloudflare Workers  

### 项目简介
脚手架管家是一个专业的脚手架租赁管理系统，提供完整的库存管理、客户管理、订单处理、财务统计等功能。系统采用现代化的前后端分离架构，前端使用Vue.js + Vant UI，后端使用Cloudflare Workers + SQLite数据库。

## 🛠 技术栈

### 前端技术
- **框架**: Vue.js 3.x
- **UI组件库**: Vant 4.x
- **图表库**: ECharts 5.x
- **数据导出**: SheetJS (XLSX)
- **样式**: 原生CSS + Vant主题定制
- **HTTP客户端**: Axios 1.x

### 后端技术
- **运行环境**: Cloudflare Workers
- **数据库**: SQLite (Cloudflare D1)
- **API风格**: RESTful API
- **数据验证**: 输入验证和SQL注入防护
- **错误处理**: 统一错误响应格式

### 开发工具
- **代码编辑器**: VS Code / WebStorm
- **版本控制**: Git
- **部署平台**: Cloudflare Dashboard
- **数据库管理**: SQLite Studio / DBeaver

## 🎯 功能特性

### 核心功能模块

#### 1. 首页仪表板
- 📊 **实时数据统计**
  - 今日收入统计
  - 在外物资总数
  - 库存预警提示
  - 最近订单展示
- 📈 **数据可视化**
  - 收入趋势图表
  - 业务分布分析

#### 2. 订单管理系统
- 📋 **订单创建**
  - 客户选择
  - 物资选择（单个/批量）
  - 业务类型（送货/收货）
  - 押金管理
  - 备注信息
- 📝 **订单号生成**
  - 自动生成唯一订单号
  - 可自定义前缀
- 📤 **订单详情**
  - 完整订单信息展示
  - 物资明细列表
  - 客户信息展示
- 📋 **订单列表**
  - 按时间排序
  - 状态标识
  - 快速筛选

#### 3. 物资管理系统
- 📦 **物资管理**
  - 新增物资
  - 编辑物资信息
  - 删除物资
  - 库存管理
- 📊 **库存监控**
  - 实时库存显示
  - 低库存预警
  - 库存变动记录
- 💰 **分类管理**
  - 物资分类
  - 分类编辑
  - 分类删除

#### 4. 客户管理系统
- 👥 **客户档案**
  - 新增客户
  - 编辑客户信息
  - 删除客户
  - 客户搜索
- 💰 **客户分类**
  - 优质客户标记
  - 信用等级管理
- 📊 **客户财务**
  - 余额管理
  - 欠款记录
  - 收款统计

#### 5. 财务管理系统
- 💰 **收款管理**
  - 收款记录
  - 收款方式
  - 收款备注
- 📊 **财务统计**
  - 收入汇总
  - 支出统计
  - 利润分析
- 📋 **账单管理**
  - 账单生成
  - 账单打印
  - 账单导出

#### 6. 系统管理
- ⚙️ **系统配置**
  - 系统名称设置
  - 订单前缀设置
  - 打印抬头设置
  - 发货地址设置
- 🔐 **用户管理**
  - 管理员登录
  - 密码修改
  - 权限控制
- 📤 **数据管理**
  - 数据导出（Excel格式）
  - 数据导入
  - 数据备份
  - 数据恢复

## 🗄️ 数据库结构

### 表结构

#### 1. sys_config (系统配置表)
```sql
CREATE TABLE sys_config (
  id INTEGER PRIMARY KEY,
  sys_name TEXT,              -- 系统名称
  factory_name TEXT,          -- 打印抬头
  admin_pwd TEXT,            -- 管理员密码
  contact_info TEXT,          -- 联系信息
  order_prefix TEXT,          -- 订单号前缀
  created_at TEXT             -- 创建时间
  updated_at TEXT             -- 更新时间
);
```

#### 2. products (产品表)
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,         -- 产品名称
  spec TEXT,                   -- 产品规格
  total_stock INTEGER DEFAULT 0, -- 总库存
  daily_rent_price REAL DEFAULT 0, -- 日租金
  category TEXT,               -- 分类
  notes TEXT,                 -- 备注
  created_at TEXT,             -- 创建时间
  updated_at TEXT              -- 更新时间
);
```

#### 3. customers (客户表)
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,         -- 客户名称
  phone TEXT,                  -- 联系电话
  contact TEXT DEFAULT '',      -- 联系人
  address TEXT DEFAULT '',      -- 联系地址
  balance REAL DEFAULT 0,       -- 账户余额
  category TEXT DEFAULT '',     -- 客户分类
  created_at TEXT,             -- 创建时间
  updated_at TEXT              -- 更新时间
);
```

#### 4. orders (订单表)
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,          -- 客户ID
  type TEXT,                  -- 订单类型 (OUT/IN)
  order_date TEXT NOT NULL,    -- 订单日期
  order_no TEXT UNIQUE,        -- 订单号
  deposit REAL DEFAULT 0,        -- 押金
  note TEXT,                  -- 备注
  status TEXT DEFAULT 'pending', -- 订单状态
  created_at TEXT,             -- 创建时间
  updated_at TEXT              -- 更新时间
);
```

#### 5. order_items (订单明细表)
```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER,            -- 订单ID
  product_id INTEGER,           -- 产品ID
  quantity INTEGER NOT NULL,     -- 数量
  daily_rent_price REAL,         -- 日租金
  unit_price REAL,              -- 单价
  created_at TEXT,             -- 创建时间
);
```

#### 6. customer_stocks (客户库存表)
```sql
CREATE TABLE customer_stocks (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,           -- 客户ID
  product_id INTEGER,           -- 产品ID
  quantity INTEGER DEFAULT 0,   -- 数量
  created_at TEXT,             -- 创建时间
);
```

#### 7. payments (支付记录表)
```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,           -- 客户ID
  amount REAL NOT NULL,         -- 金额
  type TEXT,                  -- 支付类型 (DEPOSIT/MANUAL)
  pay_date TEXT NOT NULL,       -- 支付日期
  note TEXT,                  -- 备注
  created_at TEXT,             -- 创建时间
);
```

## 🔌 API接口文档

### 基础信息
- **基础URL**: `/api`
- **请求格式**: JSON
- **响应格式**: JSON
- **字符编码**: UTF-8
- **CORS**: 已启用

### 接口列表

#### 1. 配置相关接口

##### GET /config
获取系统配置

**请求示例**:
```bash
curl -X GET https://your-domain.com/api/config
```

**响应示例**:
```json
{
  "id": 1,
  "sys_name": "脚手架管家",
  "factory_name": "脚手架租赁公司",
  "contact_info": "北京市朝阳区xxx路xxx号",
  "order_prefix": "JSJ",
  "admin_pwd": "admin"
}
```

##### PUT /config
更新系统配置

**请求示例**:
```bash
curl -X PUT https://your-domain.com/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "sys_name": "脚手架管家",
    "factory_name": "脚手架租赁公司",
    "contact_info": "北京市朝阳区xxx路xxx号",
    "order_prefix": "JSJ"
  }'
```

**响应示例**:
```json
{
  "success": true,
  "message": "更新成功"
}
```

#### 2. 产品相关接口

##### GET /products
获取产品列表

**请求参数**: 无

**响应示例**:
```json
[
  {
    "id": 1,
    "name": "钢管",
    "spec": "φ48×3.5",
    "total_stock": 1000,
    "daily_rent_price": 0.1,
    "category": "脚手架材料",
    "notes": "标准钢管",
    "created_at": "2026-03-07T00:00:00.000Z"
  }
]
```

##### POST /products
创建新产品

**请求示例**:
```bash
curl -X POST https://your-domain.com/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "钢管",
    "spec": "φ48×3.5",
    "total_stock": 1000,
    "daily_rent_price": 0.1,
    "category": "脚手架材料"
  }'
```

**响应示例**:
```json
{
  "id": 123,
  "name": "钢管",
  "spec": "φ48×3.5",
  "total_stock": 1000,
  "daily_rent_price": 0.1,
  "category": "脚手架材料",
  "created_at": "2026-03-07T00:00:00.000Z"
}
```

##### PUT /products/:id
更新产品信息

**请求示例**:
```bash
curl -X PUT https://your-domain.com/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "钢管",
    "spec": "φ48×3.5",
    "total_stock": 950,
    "daily_rent_price": 0.12
  }'
```

##### DELETE /products/:id
删除产品

**请求示例**:
```bash
curl -X DELETE https://your-domain.com/api/products/1
```

**响应示例**:
```json
{
  "success": true,
  "message": "删除成功"
}
```

#### 3. 客户相关接口

##### GET /customers
获取客户列表

**响应示例**:
```json
[
  {
    "id": 1,
    "name": "张三",
    "phone": "13800138000",
    "contact": "李四",
    "address": "北京市朝阳区xxx路xxx号",
    "balance": 500,
    "category": "优质客户",
    "created_at": "2026-03-07T00:00:00.000Z"
  }
]
```

##### POST /customers
创建新客户

**请求示例**:
```bash
curl -X POST https://your-domain.com/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "phone": "13800138000",
    "contact": "李四",
    "address": "北京市朝阳区xxx路xxx号"
  }'
```

##### PUT /customers/:id
更新客户信息

**请求示例**:
```bash
curl -X PUT https://your-domain.com/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "phone": "13800138001",
    "contact": "李四",
    "address": "北京市朝阳区xxx路xxx号",
    "balance": 600
  }'
```

##### DELETE /customers/:id
删除客户

**请求示例**:
```bash
curl -X DELETE https://your-domain.com/api/customers/1
```

#### 4. 订单相关接口

##### GET /orders
获取订单列表

**响应示例**:
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "customer_name": "张三",
    "type": "OUT",
    "order_date": "2026-03-07T10:30:00.000Z",
    "order_no": "JSJ202603070001",
    "deposit": 500,
    "note": "朝阳工地",
    "status": "completed",
    "created_at": "2026-03-07T10:30:00.000Z"
  }
]
```

##### POST /orders
创建新订单

**请求示例**:
```bash
curl -X POST https://your-domain.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "type": "OUT",
    "deposit": 500,
    "note": "朝阳工地",
    "items": [
      {
        "product_id": 1,
        "qty": 100
      }
    ]
  }'
```

**响应示例**:
```json
{
  "id": 123,
  "customer_id": 1,
    "customer_name": "张三",
    "type": "OUT",
    "order_date": "2026-03-07T10:30:00.000Z",
    "order_no": "JSJ202603070001",
    "deposit": 500,
    "note": "朝阳工地",
    "status": "pending",
    "created_at": "2026-03-07T10:30:00.000Z"
}
```

##### GET /orders/generate-no
生成新订单号

**响应示例**:
```json
{
  "order_no": "JSJ202603070002"
}
```

#### 5. 统计相关接口

##### GET /stats
获取统计数据

**响应示例**:
```json
{
  "daily_income": 1500.00,
  "total_stock": 6000,
  "total_out": 200,
  "recent_orders": [
    {
      "id": 1,
      "customer_name": "张三",
      "type": "OUT",
      "order_date": "2026-03-07T10:30:00.000Z",
      "order_no": "JSJ202603070001",
      "deposit": 500,
      "note": "朝阳工地",
      "status": "completed"
    }
  ]
}
```

#### 6. 支付相关接口

##### POST /payments
创建支付记录

**请求示例**:
```bash
curl -X POST https://your-domain.com/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "amount": 500,
    "type": "DEPOSIT",
    "note": "开单押金"
  }'
```

#### 7. 客户财务接口

##### GET /customers/:id/financial
获取客户财务详情

**响应示例**:
```json
{
  "cust": {
    "id": 1,
    "name": "张三",
    "phone": "13800138000",
    "contact": "李四",
    "address": "北京市朝阳区xxx路xxx号",
    "balance": 500,
    "category": "优质客户"
  },
  "stocks": [
    {
      "name": "钢管",
      "spec": "φ48×3.5",
      "quantity": 100,
      "daily_rent_price": 0.1,
      "cost": 10.00
    }
  ],
  "payments": [
    {
      "id": 1,
      "amount": 500,
      "type": "DEPOSIT",
      "pay_date": "2026-03-07T10:30:00.000Z",
      "note": "开单押金"
    }
  ],
  "orders": [
    {
      "id": 1,
      "type": "OUT",
      "order_date": "2026-03-07T10:30:00.000Z",
      "order_no": "JSJ202603070001",
      "deposit": 500,
      "note": "朝阳工地",
      "status": "completed"
    }
  ],
  "dailyRent": 10.00
}
```

#### 8. 客户物资分布接口

##### GET /customers/:id/distribution
获取客户物资分布

**响应示例**:
```json
[
  {
    "name": "钢管",
    "spec": "φ48×3.5",
    "quantity": 100
  }
]
```

## 📦 安装和部署

### 环境要求
- **Node.js**: 16.x 或更高版本
- **npm**: 6.x 或更高版本
- **Cloudflare账户**: 免费账户即可
- **域名**: 自定义域名（可选）

### 部署步骤

#### 1. 准备工作
```bash
# 1. 克隆项目
git clone https://github.com/your-username/scaffold-manager.git

# 2. 安装依赖
cd scaffold-manager
npm install

# 3. 配置环境变量
# 在Cloudflare Dashboard中设置以下环境变量：
# - ADMIN_PASSWORD: 管理员密码
# - PUBLIC_BASE_URL: 你的域名
```

#### 2. 部署到Cloudflare Workers

```bash
# 1. 安装Wrangler
npm install -g @cloudflare/wrangler

# 2. 登录Cloudflare
wrangler login

# 3. 部署API
cd api
wrangler publish

# 4. 部署前端
# 将index.html部署到静态托管服务
# 或者使用Cloudflare Pages
```

#### 3. 配置域名
```bash
# 在Cloudflare Dashboard中：
# 1. 添加Workers路由
# 2. 配置自定义域名
# 3. 设置DNS记录
```

### 本地开发

```bash
# 1. 启动本地开发服务器
# 使用Live Server或其他静态服务器
# 访问 http://localhost:8080

# 2. 配置代理
# 在wrangler.toml中配置开发环境
```

## 📖 使用说明

### 首次使用

#### 1. 系统初始化
1. 访问系统首页
2. 系统会自动初始化数据库
3. 设置默认配置
4. 创建默认管理员账户

#### 2. 管理员设置
1. 点击右下角设置图标
2. 输入默认密码：`admin`
3. 进入管理后台

#### 3. 基础数据配置
1. 设置系统名称
2. 配置订单前缀
3. 设置打印抬头
4. 配置发货地址

### 日常操作

#### 1. 创建订单
1. 选择客户
2. 选择业务类型（送货/收货）
3. 添加物资明细
4. 设置押金金额
5. 添加备注信息
6. 提交订单

#### 2. 物资管理
1. 查看物资列表
2. 新增物资
3. 编辑物资信息
4. 管理库存
5. 设置分类

#### 3. 客户管理
1. 查看客户列表
2. 新增客户
3. 编辑客户信息
4. 查看客户财务
5. 查看客户物资分布

#### 4. 数据管理
1. 导出数据（Excel格式）
2. 导入数据
3. 数据备份
4. 数据恢复

## 🔧 开发指南

### 项目结构
```
scaffold-manager/
├── api.js                 # 后端API服务
├── index.js              # 前端单页应用
├── wrangler.toml          # Cloudflare Workers配置
├── package.json          # 项目依赖
└── README.md            # 项目文档
```

### 代码规范

#### JavaScript规范
- 使用ES6+语法特性
- 函数命名采用驼峰命名法
- 常量使用大写下划线命名
- 添加适当的代码注释
- 遵循单一职责原则

#### 数据库规范
- 使用参数化查询防止SQL注入
- 适当的索引优化查询性能
- 定期备份数据库
- 使用事务保证数据一致性

#### API规范
- 使用RESTful设计原则
- 统一的错误响应格式
- 适当的HTTP状态码
- CORS支持

### 扩展开发

#### 添加新功能
1. 在api.js中添加新的路由处理
2. 在index.js中添加新的UI组件
3. 更新数据库schema
4. 更新API文档

#### 修改现有功能
1. 确保向后兼容性
2. 添加适当的错误处理
3. 更新相关文档
4. 进行充分测试

### 测试指南

#### 单元测试
```javascript
// 测试API端点
describe('API Tests', () => {
  test('GET /config should return config', async () => {
    const response = await fetch('/api/config');
    expect(response.status).toBe(200);
  });
});
```

#### 集成测试
```bash
# 使用Wrangler进行本地测试
wrangler dev

# 测试各个API端点
# 验证数据流
```

## 🔒 故障排除

### 常见问题

#### 1. 部署问题
**问题**: Workers部署失败
**解决**: 
- 检查wrangler.toml配置
- 确认Cloudflare账户状态
- 检查网络连接
- 查看Workers日志

#### 2. 数据库问题
**问题**: 数据库连接失败
**解决**:
- 检查D1绑定配置
- 验证数据库schema
- 查看Workers日志
- 重新初始化数据库

#### 3. API问题
**问题**: API请求失败
**解决**:
- 检查网络连接
- 验证API端点URL
- 查看浏览器控制台错误
- 检查CORS配置

#### 4. 前端问题
**问题**: 页面显示异常
**解决**:
- 清除浏览器缓存
- 检查JavaScript控制台
- 验证Vue.js版本
- 检查网络请求状态

### 日志查看

#### 浏览器控制台
```javascript
// 查看前端日志
console.log('Debug info:', data);
console.error('Error:', error);
```

#### Workers日志
```bash
# 查看后端日志
wrangler tail
# 在Cloudflare Dashboard中查看日志
```

## 📊 性能优化

### 前端优化
- 使用虚拟滚动处理大数据列表
- 图片懒加载
- 组件按需加载
- 合理使用缓存策略

### 后端优化
- 数据库查询优化
- 适当的索引设计
- 响应压缩
- CDN加速静态资源

### 数据库优化
- 定期清理历史数据
- 优化查询语句
- 使用连接池
- 适当的索引维护

## 🔐 安全建议

### 认证安全
- 修改默认管理员密码
- 使用HTTPS协议
- 实施适当的访问控制
- 定期更新依赖包

### 数据安全
- 定期数据备份
- 输入验证和清理
- SQL注入防护
- 敏感数据加密

### API安全
- CORS配置
- 速率限制
- 请求验证
- 错误信息脱敏

## 📞 更新日志

### 版本历史
- **v1.0.0** (2026-03-07): 初始版本发布
- 功能：基础CRUD操作、简单UI界面
- 技术栈：Vue.js + SQLite + Cloudflare Workers

### 后续计划
- [ ] 移动端原生应用开发
- [ ] 实时通知功能
- [ ] 高级报表功能
- [ ] 多租户支持
- [ ] API限流和监控
- [ ] 自动化测试

## 📝 技术支持

### 文档资源
- [Vue.js官方文档](https://vuejs.org/)
- [Vant UI文档](https://vant-ui.github.io/vant/#/zh-CN)
- [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
- [SQLite文档](https://www.sqlite.org/docs.html)

### 社区支持
- [GitHub Issues](https://github.com/your-username/scaffold-manager/issues)
- [开发者论坛](https://developers.cloudflare.com/community)
- [技术问答](https://stackoverflow.com/questions/tagged/cloudflare-workers)

### 联系方式
- 技术支持邮箱：support@example.com
- 项目主页：https://github.com/your-username/scaffold-manager

---

**文档版本**: 1.0.0  
**最后更新**: 2026-03-07  
**维护者**: Development Team