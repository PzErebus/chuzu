-- D1数据库初始化脚本

-- 创建表结构
CREATE TABLE IF NOT EXISTS sys_config (id INTEGER PRIMARY KEY, sys_name TEXT, factory_name TEXT, admin_pwd TEXT, contact_info TEXT, order_prefix TEXT);
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT, description TEXT);
CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, spec TEXT, total_stock INTEGER, daily_rent_price REAL, unit_price REAL, category_id INTEGER, deposit_price REAL, unit TEXT, weight REAL, min_stock INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT, balance REAL, contact TEXT, address TEXT, id_card TEXT, project_name TEXT, notes TEXT);
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, customer_id INTEGER, type TEXT, order_date TEXT, note TEXT, deposit REAL, order_no TEXT);
CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, quantity INTEGER, daily_rent_price REAL);
CREATE TABLE IF NOT EXISTS customer_stocks (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, quantity INTEGER, UNIQUE(customer_id, product_id));
CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL, type TEXT, pay_date TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS product_repairs (id INTEGER PRIMARY KEY, product_id INTEGER, repair_date TEXT, description TEXT, cost REAL, status TEXT);
CREATE TABLE IF NOT EXISTS bills (id INTEGER PRIMARY KEY, customer_id INTEGER, bill_date TEXT, start_date TEXT, end_date TEXT, total_amount REAL, status TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS operation_logs (id INTEGER PRIMARY KEY, operation_type TEXT, operation_desc TEXT, operator TEXT, operation_time TEXT, ip_address TEXT);
CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY, title TEXT, content TEXT, type TEXT, is_read INTEGER DEFAULT 0, create_time TEXT);

-- 补全字段（如果表已存在）
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_price REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deposit_price REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT '个';
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_card TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS project_name TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_no TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS daily_rent_price REAL DEFAULT 0;
ALTER TABLE sys_config ADD COLUMN IF NOT EXISTS contact_info TEXT DEFAULT '';
ALTER TABLE sys_config ADD COLUMN IF NOT EXISTS order_prefix TEXT DEFAULT 'JSJ';

-- 初始化系统配置
INSERT INTO sys_config (id, sys_name, factory_name, admin_pwd, contact_info, order_prefix) 
VALUES (1, '脚手架管家', '我的租赁站', 'admin', '', 'JSJ')
ON CONFLICT(id) DO NOTHING;
