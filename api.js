/**
 * 脚手架管家 - API服务（ES模块版）
 * 
 * 适配Cloudflare Workers D1数据库绑定
 * 使用ES模块格式而非CommonJS格式
 * 
 * @version 2.0.0
 * @author System
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    
    const url = new URL(request.url);
    const method = request.method;
    const getBJTime = () => new Date(Date.now() + 8 * 3600000).toISOString().replace('T',' ').substring(0,19);
    
    // 数据库自动维护
    const autoFix = async () => {
      const sqls = [
        `CREATE TABLE IF NOT EXISTS sys_config (id INTEGER PRIMARY KEY, sys_name TEXT, factory_name TEXT, admin_pwd TEXT, contact_info TEXT, order_prefix TEXT)`,
        `CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, balance REAL DEFAULT 0, contact TEXT DEFAULT '', address TEXT DEFAULT '')`,
        `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, spec TEXT, total_stock INTEGER DEFAULT 0, daily_rent_price REAL DEFAULT 0, category TEXT)`,
        `CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, type TEXT, order_date TEXT, note TEXT, deposit REAL DEFAULT 0, order_no TEXT)`,
        `CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER, product_id INTEGER, quantity INTEGER)`,
        `CREATE TABLE IF NOT EXISTS customer_stocks (customer_id INTEGER, product_id INTEGER, quantity INTEGER, PRIMARY KEY(customer_id, product_id))`,
        `CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, amount REAL, type TEXT, pay_date TEXT, note TEXT)`
      ];
      for (const sql of sqls) { try { await env.DB.prepare(sql).run(); } catch(e) {} }
      const has = await env.DB.prepare("SELECT count(*) as c FROM sys_config").first();
      if (has.c === 0) await env.DB.prepare("INSERT INTO sys_config (id, sys_name, factory_name, admin_pwd, contact_info, order_prefix) VALUES (1, '脚手架管家', '我的租赁站', 'admin', '', 'JSJ')").run();
    };

    try {
      // 1. 配置接口 (修复：补全了 POST 方法，确保能触发数据库修复)
      if (url.pathname === "/config") {
        if (method === "GET") {
          try {
            const conf = await env.DB.prepare("SELECT * FROM sys_config WHERE id=1").first();
            return Response.json(conf || { sys_name: '脚手架管家', order_prefix: 'JSJ' }, { headers: corsHeaders });
          } catch (e) { await autoFix(); return Response.json({ sys_name: '脚手架管家', order_prefix: 'JSJ' }, { headers: corsHeaders }); }
        }
        
        // 即使前端没入口，后端也保留 POST 能力以备不时之需
        if (method === "POST") {
          const b = await request.json();
          await autoFix(); // 保存时顺便修复
          await env.DB.prepare("UPDATE sys_config SET sys_name=?, factory_name=?, contact_info=?, order_prefix=? WHERE id=1").bind(b.sys_name, b.factory_name, b.contact_info, b.order_prefix).run();
          return Response.json({ success: true }, { headers: corsHeaders });
        }
      }

      // 2. 回调 Auth 接口 (防止报错)
      if (url.pathname === "/auth" && method === "POST") {
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // 3. 核心开单（完善版：添加验证、库存检查、事务处理）
      if (url.pathname === "/orders" && method === "POST") {
        const b = await request.json();
        const time = getBJTime();
        
        // 输入验证
        if (!b.customer_id || !b.type || !b.items || !Array.isArray(b.items) || b.items.length === 0) {
          return Response.json({ error: "参数不完整" }, { status: 400, headers: corsHeaders });
        }
        
        if (!['OUT', 'IN'].includes(b.type)) {
          return Response.json({ error: "业务类型无效" }, { status: 400, headers: corsHeaders });
        }
        
        let prefix = 'JSJ';
        try { const c = await env.DB.prepare("SELECT order_prefix FROM sys_config WHERE id=1").first(); if(c) prefix = c.order_prefix; } catch(e){ await autoFix(); }

        const dateStr = time.substring(0, 10).replace(/-/g, '');
        const countRes = await env.DB.prepare("SELECT count(*) as c FROM orders WHERE substr(order_date, 1, 10) = ?").bind(time.substring(0,10)).first();
        const orderNo = `${prefix}${dateStr}${(countRes.c + 1).toString().padStart(3, '0')}`;

        try {
          // 使用事务处理确保数据一致性
          await env.DB.exec("BEGIN TRANSACTION");
          
          // 检查库存（仅送货出库时）
          if (b.type === 'OUT') {
            for (const item of b.items) {
              const product = await env.DB.prepare("SELECT total_stock FROM products WHERE id = ?").bind(item.product_id).first();
              if (!product) {
                await env.DB.exec("ROLLBACK");
                return Response.json({ error: `物资ID ${item.product_id} 不存在` }, { status: 404, headers: corsHeaders });
              }
              if (product.total_stock < item.qty) {
                await env.DB.exec("ROLLBACK");
                return Response.json({ error: `物资 ${item.product_id} 库存不足` }, { status: 400, headers: corsHeaders });
              }
            }
          }

          const res = await env.DB.prepare("INSERT INTO orders (customer_id, type, order_date, note, deposit, order_no) VALUES (?,?,?,?,?,?)").bind(b.customer_id, b.type, time, b.note, b.deposit||0, orderNo).run();
          const oid = res.meta.last_row_id;

          if (Number(b.deposit) > 0) {
            await env.DB.prepare("INSERT INTO payments (customer_id, amount, type, pay_date, note) VALUES (?, ?, 'DEPOSIT', ?, '开单押金')").bind(b.customer_id, b.deposit, time).run();
            await env.DB.prepare("UPDATE customers SET balance = balance + ? WHERE id = ?").bind(b.deposit, b.customer_id).run();
          }

          for (const i of b.items) {
            await env.DB.prepare("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?,?,?)").bind(oid, i.product_id, i.qty).run();
            await env.DB.prepare("UPDATE products SET total_stock = total_stock + ? WHERE id = ?").bind(b.type === 'OUT' ? -i.qty : i.qty, i.product_id).run();
            await env.DB.prepare("INSERT INTO customer_stocks (customer_id, product_id, quantity) VALUES (?,?,?) ON CONFLICT(customer_id,product_id) DO UPDATE SET quantity = quantity + ?").bind(b.customer_id, i.product_id, b.type === 'OUT' ? i.qty : -i.qty).run();
          }
          
          await env.DB.exec("COMMIT");
          return Response.json({ success: true, order_id: oid, order_no: orderNo }, { headers: corsHeaders });
        } catch (e) {
          await env.DB.exec("ROLLBACK");
          return Response.json({ error: "订单创建失败: " + e.message }, { status: 500, headers: corsHeaders });
        }
      }

      // 4. 物资管理（完善版：添加验证、关联检查）
      if (url.pathname === "/products") {
        if(method==="GET"){ 
          const {results}=await env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all(); 
          return Response.json(results,{headers:corsHeaders}); 
        }
        
        if(method==="DELETE"){
          const id = url.searchParams.get("id");
          if(!id) {
            return Response.json({ error: "缺少物资ID" }, { status: 400, headers: corsHeaders });
          }
          
          // 检查是否有关联订单
          const orderItems = await env.DB.prepare("SELECT COUNT(*) as c FROM order_items WHERE product_id = ?").bind(id).first();
          if(orderItems.c > 0) {
            return Response.json({ error: "该物资有关联订单，无法删除" }, { status: 400, headers: corsHeaders });
          }
          
          // 检查是否有客户库存
          const custStocks = await env.DB.prepare("SELECT COUNT(*) as c FROM customer_stocks WHERE product_id = ?").bind(id).first();
          if(custStocks.c > 0) {
            return Response.json({ error: "该物资有客户库存，无法删除" }, { status: 400, headers: corsHeaders });
          }
          
          await env.DB.prepare("DELETE FROM products WHERE id=?").bind(id).run(); 
          return Response.json({success:true},{headers:corsHeaders}); 
        }
        
        const b = await request.json();
        
        // 输入验证
        if(!b.name || b.name.trim() === '') {
          return Response.json({ error: "物资名称不能为空" }, { status: 400, headers: corsHeaders });
        }
        
        if(b.total_stock !== undefined && (isNaN(Number(b.total_stock)) || Number(b.total_stock) < 0)) {
          return Response.json({ error: "库存必须是非负数" }, { status: 400, headers: corsHeaders });
        }
        
        if(b.daily_rent_price !== undefined && (isNaN(Number(b.daily_rent_price)) || Number(b.daily_rent_price) < 0)) {
          return Response.json({ error: "日租金必须是非负数" }, { status: 400, headers: corsHeaders });
        }
        
        // 自动修复表结构
        try {
            if(method==="POST"){ 
              await env.DB.prepare("INSERT INTO products (name,spec,total_stock,daily_rent_price) VALUES (?,?,?,?)").bind(
                b.name.trim(), 
                b.spec||'', 
                Number(b.total_stock)||0, 
                Number(b.daily_rent_price)||0
              ).run(); 
              return Response.json({ success: true, message: "物资创建成功" }, { headers: corsHeaders });
            }
            else { 
              if(!b.id) {
                return Response.json({ error: "缺少物资ID" }, { status: 400, headers: corsHeaders });
              }
              await env.DB.prepare("UPDATE products SET name=?,spec=?,total_stock=?,daily_rent_price=? WHERE id=?").bind(
                b.name.trim(), 
                b.spec||'', 
                Number(b.total_stock)||0, 
                Number(b.daily_rent_price)||0,
                b.id
              ).run(); 
              return Response.json({ success: true, message: "物资更新成功" }, { headers: corsHeaders });
            }
        } catch(e) {
            await autoFix(); 
            if(method==="POST"){ 
              await env.DB.prepare("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, spec TEXT, total_stock INTEGER, daily_rent_price REAL, category TEXT)").run(); 
              await env.DB.prepare("INSERT INTO products (name,spec,total_stock,daily_rent_price) VALUES (?,?,?,?)").bind(
                b.name.trim(), 
                b.spec||'', 
                Number(b.total_stock)||0, 
                Number(b.daily_rent_price)||0
              ).run(); 
              return Response.json({ success: true, message: "物资创建成功" }, { headers: corsHeaders });
            }
            return Response.json({ error: "操作失败: " + e.message }, { status: 500, headers: corsHeaders });
        }
      }

      // 其他接口保持稳定
      if (url.pathname.match(/^\/orders\/\d+$/)) {
        const id = url.pathname.split('/')[2];
        try {
            const order = await env.DB.prepare(`SELECT o.*, c.name as customer_name, c.contact as customer_contact, c.address as customer_address FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`).bind(id).first();
            const { results: items } = await env.DB.prepare("SELECT p.name, p.spec, oi.quantity FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?").bind(id).all();
            return Response.json({ ...order, items }, { headers: corsHeaders });
        } catch (e) { await autoFix(); return Response.json({ error: "syncing" }, { status: 500, headers: corsHeaders }); }
      }
      if (url.pathname === "/customers") {
        if (method === "GET") { const { results } = await env.DB.prepare("SELECT * FROM customers ORDER BY balance DESC").all(); return Response.json(results, { headers: corsHeaders }); }
        const b = await request.json();
        if (method === "POST") { await env.DB.prepare("INSERT INTO customers (name, balance, contact, address) VALUES (?, 0, ?, ?)").bind(b.name, b.contact||'', b.address||'').run(); }
        else { await env.DB.prepare("UPDATE customers SET name=?, contact=?, address=? WHERE id=?").bind(b.name, b.contact||'', b.address||'', b.id).run(); }
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      if (url.pathname === "/stats") {
        const i = await env.DB.prepare("SELECT SUM(cs.quantity*p.daily_rent_price) as t FROM customer_stocks cs JOIN products p ON cs.product_id=p.id").first();
        const s = await env.DB.prepare("SELECT SUM(total_stock) as s FROM products").first();
        const o = await env.DB.prepare("SELECT SUM(quantity) as o FROM customer_stocks").first();
        let rec = []; try { rec = (await env.DB.prepare("SELECT o.id,o.type,o.order_date,o.order_no,c.name as customer_name FROM orders o JOIN customers c ON o.customer_id=c.id ORDER BY o.id DESC LIMIT 5").all()).results; } catch(e){}
        return Response.json({ daily_income: i?.t || 0, total_stock: s?.s || 0, total_out: o?.o || 0, recent_orders: rec }, { headers: corsHeaders });
      }
      if (url.pathname === "/payments" && method === "POST") {
        const b = await request.json(); await env.DB.prepare("INSERT INTO payments (customer_id, amount, type, pay_date, note) VALUES (?,?,'MANUAL', ?,?)").bind(b.customer_id, Number(b.amount), getBJTime(), b.note||'').run(); await env.DB.prepare("UPDATE customers SET balance = balance + ? WHERE id = ?").bind(Number(b.amount), b.customer_id).run(); return Response.json({ success: true }, { headers: corsHeaders });
      }
      if (url.pathname.match(/^\/customers\/\d+\/financial$/)) {
        const id = url.pathname.split('/')[2];
        const cust = await env.DB.prepare("SELECT * FROM customers WHERE id=?").bind(id).first();
        const { results: stocks } = await env.DB.prepare(`SELECT p.name, p.spec, cs.quantity, (cs.quantity * p.daily_rent_price) as cost FROM customer_stocks cs JOIN products p ON cs.product_id = p.id WHERE cs.customer_id = ? AND cs.quantity>0`).bind(id).all();
        let payments = []; try { payments = (await env.DB.prepare("SELECT * FROM payments WHERE customer_id=? ORDER BY id DESC LIMIT 10").bind(id).all()).results; } catch(e){}
        const { results: orders } = await env.DB.prepare("SELECT * FROM orders WHERE customer_id=? ORDER BY id DESC LIMIT 5").bind(id).all();
        return Response.json({ cust, stocks, payments, orders, dailyRent: stocks.reduce((s,x)=>s+(x.cost||0),0) }, { headers: corsHeaders });
      }
      if (url.pathname.match(/^\/products\/\d+\/distribution$/)) {
        const id = url.pathname.split('/')[2];
        const { results } = await env.DB.prepare("SELECT c.name, cs.quantity FROM customer_stocks cs JOIN customers c ON cs.customer_id=c.id WHERE cs.product_id=? AND cs.quantity>0").bind(id).all();
        return Response.json(results || [], { headers: corsHeaders });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (e) { return Response.json({ error: e.message }, { status: 500, headers: corsHeaders }); }
  }
};