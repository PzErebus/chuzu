const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'chuzu.db');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json;charset=UTF-8"
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders);
    res.status(200).end();
    return;
  }
  next();
});

const getBJTime = () => new Date(Date.now() + 8 * 3600000).toISOString().replace('T',' ').substring(0,19);

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const safeQuery = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      return stmt.all(...params);
    }
    return stmt.all();
  } catch (e) {
    console.error('SQL Error:', e.message);
    return { results: [] };
  }
};

const safeRun = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      return stmt.run(...params);
    }
    return stmt.run();
  } catch (e) {
    console.error('SQL Run Error:', e.message);
    return { success: false, error: e.message };
  }
};

const safeFirst = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      return stmt.get(...params);
    }
    return stmt.get();
  } catch (e) {
    console.error('SQL First Error:', e.message);
    return null;
  }
};

const tryFixDB = () => {
  const sqls = [
    `CREATE TABLE IF NOT EXISTS sys_config (id INTEGER PRIMARY KEY, sys_name TEXT, factory_name TEXT, admin_pwd TEXT, contact_info TEXT, order_prefix TEXT)`,
    `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT, description TEXT)`,
    `CREATE TABLE IF NOT EXISTS customer_categories (id INTEGER PRIMARY KEY, name TEXT, description TEXT)`,
    `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, spec TEXT, total_stock INTEGER, daily_rent_price REAL, unit_price REAL, category_id INTEGER, deposit_price REAL, unit TEXT, weight REAL, min_stock INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT, balance REAL, contact TEXT, address TEXT, id_card TEXT, project_name TEXT, notes TEXT, category_id INTEGER DEFAULT 0, credit_level TEXT DEFAULT 'NORMAL')`,
    `CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, customer_id INTEGER, type TEXT, order_date TEXT, note TEXT, deposit REAL, order_no TEXT)`,
    `CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, quantity INTEGER, daily_rent_price REAL)`,
    `CREATE TABLE IF NOT EXISTS customer_stocks (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, quantity INTEGER, UNIQUE(customer_id, product_id))`,
    `CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL, type TEXT, pay_date TEXT, note TEXT)`,
    `CREATE TABLE IF NOT EXISTS product_repairs (id INTEGER PRIMARY KEY, product_id INTEGER, repair_date TEXT, description TEXT, cost REAL, status TEXT)`,
    `CREATE TABLE IF NOT EXISTS bills (id INTEGER PRIMARY KEY, customer_id INTEGER, bill_date TEXT, start_date TEXT, end_date TEXT, total_amount REAL, status TEXT, note TEXT)`,
    `CREATE TABLE IF NOT EXISTS operation_logs (id INTEGER PRIMARY KEY, operation_type TEXT, operation_desc TEXT, operator TEXT, operation_time TEXT, ip_address TEXT)`,
    `CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY, title TEXT, content TEXT, type TEXT, is_read INTEGER DEFAULT 0, create_time TEXT)`
  ];
  for (const sql of sqls) {
    safeRun(sql);
  }
  
  const addColumnIfNotExists = (table, column, type, defaultValue) => {
    try {
      const sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${type} ${defaultValue ? `DEFAULT ${defaultValue}` : ''}`;
      safeRun(sql);
    } catch (e) {
      if (!e.message.includes('duplicate column name')) {
        console.error(`Error adding column ${column} to ${table}:`, e.message);
      }
    }
  };
  
  addColumnIfNotExists('products', 'unit_price', 'REAL', '0');
  addColumnIfNotExists('products', 'deposit_price', 'REAL', '0');
  addColumnIfNotExists('products', 'unit', 'TEXT', "'个'");
  addColumnIfNotExists('products', 'weight', 'REAL', '0');
  addColumnIfNotExists('products', 'category_id', 'INTEGER', '0');
  addColumnIfNotExists('products', 'min_stock', 'INTEGER', '0');
  addColumnIfNotExists('customers', 'contact', 'TEXT', "''");
  addColumnIfNotExists('customers', 'address', 'TEXT', "''");
  addColumnIfNotExists('customers', 'id_card', 'TEXT', "''");
  addColumnIfNotExists('customers', 'project_name', 'TEXT', "''");
  addColumnIfNotExists('customers', 'notes', 'TEXT', "''");
  addColumnIfNotExists('customers', 'category_id', 'INTEGER', '0');
  addColumnIfNotExists('customers', 'credit_level', 'TEXT', "'NORMAL'");
  addColumnIfNotExists('orders', 'order_no', 'TEXT', null);
  addColumnIfNotExists('order_items', 'daily_rent_price', 'REAL', '0');
  addColumnIfNotExists('sys_config', 'contact_info', 'TEXT', "''");
  addColumnIfNotExists('sys_config', 'order_prefix', 'TEXT', "'JSJ'");
  
  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)`,
    `CREATE INDEX IF NOT EXISTS idx_products_stock ON products(total_stock, min_stock)`,
    `CREATE INDEX IF NOT EXISTS idx_customers_category_id ON customers(category_id)`,
    `CREATE INDEX IF NOT EXISTS idx_customers_balance ON customers(balance)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no)`,
    `CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`,
    `CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_stocks_customer_product ON customer_stocks(customer_id, product_id)`,
    `CREATE INDEX IF NOT EXISTS idx_customer_stocks_customer_id ON customer_stocks(customer_id)`,
    `CREATE INDEX IF NOT EXISTS idx_customer_stocks_product_id ON customer_stocks(product_id)`,
    `CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id)`,
    `CREATE INDEX IF NOT EXISTS idx_payments_pay_date ON payments(pay_date)`,
    `CREATE INDEX IF NOT EXISTS idx_product_repairs_product_id ON product_repairs(product_id)`,
    `CREATE INDEX IF NOT EXISTS idx_product_repairs_repair_date ON product_repairs(repair_date)`,
    `CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id)`,
    `CREATE INDEX IF NOT EXISTS idx_bills_bill_date ON bills(bill_date)`
  ];
  for (const sql of indexes) {
    safeRun(sql);
  }

  const has = safeFirst("SELECT count(*) as c FROM sys_config");
  if (!has || has.c === 0) {
    safeRun("INSERT INTO sys_config (id, sys_name, factory_name, admin_pwd, contact_info, order_prefix) VALUES (1, '脚手架管家', '我的租赁站', 'admin', '', 'JSJ')");
  }
};

tryFixDB();

app.get('/config', (req, res) => {
  try {
    const conf = safeFirst("SELECT * FROM sys_config WHERE id=1");
    const result = conf || { sys_name: '脚手架管家', factory_name: '我的租赁站', contact_info: '', order_prefix: 'JSJ' };
    res.set(corsHeaders);
    res.json(result);
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/config', (req, res) => {
  try {
    const { sys_name, factory_name, admin_pwd, contact_info, order_prefix } = req.body;
    const update = {};
    if (sys_name !== undefined) update.sys_name = sys_name;
    if (factory_name !== undefined) update.factory_name = factory_name;
    if (admin_pwd !== undefined) update.admin_pwd = admin_pwd;
    if (contact_info !== undefined) update.contact_info = contact_info;
    if (order_prefix !== undefined) update.order_prefix = order_prefix;
    
    const fields = Object.keys(update).map(k => `${k} = ?`).join(', ');
    const values = Object.values(update);
    safeRun(`UPDATE sys_config SET ${fields} WHERE id=1`, values);
    
    res.set(corsHeaders);
    res.json({ success: true });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/auth', (req, res) => {
  try {
    const { password } = req.body;
    const conf = safeFirst("SELECT admin_pwd FROM sys_config WHERE id=1");
    const valid = conf && conf.admin_pwd === password;
    
    res.set(corsHeaders);
    res.json({ success: valid });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/categories', (req, res) => {
  try {
    const categories = safeQuery("SELECT * FROM categories ORDER BY id");
    res.set(corsHeaders);
    res.json(categories);
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/categories', (req, res) => {
  try {
    const { name, description } = req.body;
    const result = safeRun("INSERT INTO categories (name, description) VALUES (?, ?)", [name, description]);
    res.set(corsHeaders);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/categories', (req, res) => {
  try {
    const { id, name, description } = req.body;
    safeRun("UPDATE categories SET name=?, description=? WHERE id=?", [name, description, id]);
    res.set(corsHeaders);
    res.json({ success: true });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/categories', (req, res) => {
  try {
    const { id } = req.body;
    safeRun("DELETE FROM categories WHERE id=?", [id]);
    res.set(corsHeaders);
    res.json({ success: true });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/customer-categories', (req, res) => {
  try {
    const categories = safeQuery("SELECT * FROM customer_categories ORDER BY id");
    res.set(corsHeaders);
    res.json(categories);
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/customer-categories', (req, res) => {
  try {
    const { name, description } = req.body;
    const result = safeRun("INSERT INTO customer_categories (name, description) VALUES (?, ?)", [name, description]);
    res.set(corsHeaders);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/customer-categories', (req, res) => {
  try {
    const { id, name, description } = req.body;
    safeRun("UPDATE customer_categories SET name=?, description=? WHERE id=?", [name, description, id]);
    res.set(corsHeaders);
    res.json({ success: true });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/customer-categories', (req, res) => {
  try {
    const { id } = req.body;
    safeRun("DELETE FROM customer_categories WHERE id=?", [id]);
    res.set(corsHeaders);
    res.json({ success: true });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/products', (req, res) => {
  try {
    const products = safeQuery("SELECT * FROM products ORDER BY id");
    res.set(corsHeaders);
    res.json(products);
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/products', (req, res) => {
  try {
    const { name, spec, total_stock, daily_rent_price, unit_price, category_id, deposit_price, unit, weight, min_stock } = req.body;
    const result = safeRun(
      "INSERT INTO products (name, spec, total_stock, daily_rent_price, unit_price, category_id, deposit_price, unit, weight, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, spec, total_stock, daily_rent_price, unit_price, category_id, deposit_price, unit, weight, min_stock]
    );
    res.set(corsHeaders);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/products', (req, res) => {
  try {
    const { id, name, spec, total_stock, daily_rent_price, unit_price, category_id, deposit_price, unit, weight, min_stock } = req.body;
    safeRun(
      "UPDATE products SET name=?, spec=?, total_stock=?, daily_rent_price=?, unit_price=?, category_id=?, deposit_price=?, unit=?, weight=?, min_stock=? WHERE id=?",
      [name, spec, total_stock, daily_rent_price, unit_price, category_id, deposit_price, unit, weight, min_stock, id]
    );
    res.set(corsHeaders);
    res.json({ success: true });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/products', (req, res) => {
  try {
    const { id } = req.body;
    safeRun("DELETE FROM products WHERE id=?", [id]);
    res.set(corsHeaders);
    res.json({ success: true });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/products/low-stock', (req, res) => {
  try {
    const products = safeQuery("SELECT * FROM products WHERE total_stock <= min_stock ORDER BY total_stock");
    res.set(corsHeaders);
    res.json(products);
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/products/:id/distribution', (req, res) => {
  try {
    const { id } = req.params;
    const distribution = safeQuery(
      `SELECT c.name as customer_name, cs.quantity 
       FROM customer_stocks cs 
       JOIN customers c ON cs.customer_id = c.id 
       WHERE cs.product_id = ? AND cs.quantity > 0`,
      [id]
    );
    res.set(corsHeaders);
    res.json(distribution);
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/customers', (req, res) => {
  try {
    const customers = safeQuery("SELECT * FROM customers ORDER BY id");
    res.set(corsHeaders);
    res.json(customers);
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/customers', (req, res) => {
  try {
    const { name, balance, contact, address, id_card, project_name, notes, category_id, credit_level } = req.body;
    const result = safeRun(
      "INSERT INTO customers (name, balance, contact, address, id_card, project_name, notes, category_id, credit_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, balance || 0, contact, address, id_card, project_name, notes, category_id || 0, credit_level || 'NORMAL']
    );
    res.set(corsHeaders);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/customers', (req, res) => {
  try {
    const { id, name, balance, contact, address, id_card, project_name, notes, category_id, credit_level } = req.body;
    safeRun(
      "UPDATE customers SET name=?, balance=?, contact=?, address=?, id_card=?, project_name=?, notes=?, category_id=?, credit_level=? WHERE id=?",
      [name, balance, contact, address, id_card, project_name, notes, category_id, credit_level, id]
    );
    res.set(corsHeaders);
    res.json({ success: true });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/customers', (req, res) => {
  try {
    const { id } = req.body;
    safeRun("DELETE FROM customers WHERE id=?", [id]);
    res.set(corsHeaders);
    res.json({ success: true });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/customers/:id/financial', (req, res) => {
  try {
    const { id } = req.params;
    const customer = safeFirst("SELECT * FROM customers WHERE id=?", [id]);
    const stocks = safeQuery(
      `SELECT p.name, cs.quantity 
       FROM customer_stocks cs 
       JOIN products p ON cs.product_id = p.id 
       WHERE cs.customer_id = ? AND cs.quantity > 0`,
      [id]
    );
    const payments = safeQuery("SELECT * FROM payments WHERE customer_id=? ORDER BY pay_date DESC", [id]);
    
    res.set(corsHeaders);
    res.json({ customer, stocks, payments });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/orders', (req, res) => {
  try {
    const { customer_id, type, note, deposit, items } = req.body;
    const order_date = getBJTime();
    const order_prefix = safeFirst("SELECT order_prefix FROM sys_config WHERE id=1")?.order_prefix || 'JSJ';
    const order_no = `${order_prefix}${Date.now()}`;
    
    const orderResult = safeRun(
      "INSERT INTO orders (customer_id, type, order_date, note, deposit, order_no) VALUES (?, ?, ?, ?, ?, ?)",
      [customer_id, type, order_date, note, deposit || 0, order_no]
    );
    const order_id = orderResult.lastInsertRowid;
    
    for (const item of items) {
      const { product_id, quantity, daily_rent_price } = item;
      safeRun(
        "INSERT INTO order_items (order_id, product_id, quantity, daily_rent_price) VALUES (?, ?, ?, ?)",
        [order_id, product_id, quantity, daily_rent_price]
      );
      
      const stockChange = type === '出库' ? -quantity : quantity;
      safeRun("UPDATE products SET total_stock = total_stock + ? WHERE id=?", [stockChange, product_id]);
      
      const existingStock = safeFirst(
        "SELECT quantity FROM customer_stocks WHERE customer_id=? AND product_id=?",
        [customer_id, product_id]
      );
      
      if (existingStock) {
        const newQuantity = existingStock.quantity + stockChange;
        if (newQuantity > 0) {
          safeRun(
            "UPDATE customer_stocks SET quantity = ? WHERE customer_id=? AND product_id=?",
            [newQuantity, customer_id, product_id]
          );
        } else {
          safeRun(
            "DELETE FROM customer_stocks WHERE customer_id=? AND product_id=?",
            [customer_id, product_id]
          );
        }
      } else if (stockChange > 0) {
        safeRun(
          "INSERT INTO customer_stocks (customer_id, product_id, quantity) VALUES (?, ?, ?)",
          [customer_id, product_id, stockChange]
        );
      }
    }
    
    res.set(corsHeaders);
    res.json({ success: true, order_id, order_no });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const order = safeFirst("SELECT * FROM orders WHERE id=?", [id]);
    const items = safeQuery("SELECT * FROM order_items WHERE order_id=?", [id]);
    
    res.set(corsHeaders);
    res.json({ order, items });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/payments', (req, res) => {
  try {
    const { customer_id, amount, type, note } = req.body;
    const pay_date = getBJTime();
    
    safeRun(
      "INSERT INTO payments (customer_id, amount, type, pay_date, note) VALUES (?, ?, ?, ?, ?)",
      [customer_id, amount, type, pay_date, note]
    );
    
    safeRun("UPDATE customers SET balance = balance + ? WHERE id=?", [amount, customer_id]);
    
    res.set(corsHeaders);
    res.json({ success: true });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/stats', (req, res) => {
  try {
    const totalStock = safeFirst("SELECT SUM(total_stock) as total FROM products")?.total || 0;
    const dailyRent = safeFirst("SELECT SUM(total_stock * daily_rent_price) as total FROM products")?.total || 0;
    const customerCount = safeFirst("SELECT COUNT(*) as total FROM customers")?.total || 0;
    
    res.set(corsHeaders);
    res.json({
      totalStock,
      dailyRent,
      customerCount
    });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/stats/detailed', (req, res) => {
  try {
    const recentOrders = safeQuery("SELECT * FROM orders ORDER BY order_date DESC LIMIT 10");
    const lowStockProducts = safeQuery("SELECT * FROM products WHERE total_stock <= min_stock");
    const topCustomers = safeQuery("SELECT * FROM customers ORDER BY balance DESC LIMIT 10");
    
    res.set(corsHeaders);
    res.json({
      recentOrders,
      lowStockProducts,
      topCustomers
    });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/export', (req, res) => {
  try {
    const products = safeQuery("SELECT * FROM products");
    const customers = safeQuery("SELECT * FROM customers");
    const orders = safeQuery("SELECT * FROM orders");
    
    res.set(corsHeaders);
    res.json({
      products,
      customers,
      orders
    });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/import', (req, res) => {
  try {
    const { products, customers, orders } = req.body;
    
    if (products && Array.isArray(products)) {
      for (const product of products) {
        safeRun(
          "INSERT OR REPLACE INTO products (id, name, spec, total_stock, daily_rent_price, unit_price, category_id, deposit_price, unit, weight, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [product.id, product.name, product.spec, product.total_stock, product.daily_rent_price, product.unit_price, product.category_id, product.deposit_price, product.unit, product.weight, product.min_stock]
        );
      }
    }
    
    if (customers && Array.isArray(customers)) {
      for (const customer of customers) {
        safeRun(
          "INSERT OR REPLACE INTO customers (id, name, balance, contact, address, id_card, project_name, notes, category_id, credit_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [customer.id, customer.name, customer.balance, customer.contact, customer.address, customer.id_card, customer.project_name, customer.notes, customer.category_id, customer.credit_level]
        );
      }
    }
    
    if (orders && Array.isArray(orders)) {
      for (const order of orders) {
        safeRun(
          "INSERT OR REPLACE INTO orders (id, customer_id, type, order_date, note, deposit, order_no) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [order.id, order.customer_id, order.type, order.order_date, order.note, order.deposit, order.order_no]
        );
      }
    }
    
    res.set(corsHeaders);
    res.json({ success: true });
  } catch (error) {
    res.set(corsHeaders);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.set(corsHeaders);
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.set(corsHeaders);
  res.status(404).json({ success: false, error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Database path: ${DB_PATH}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});
