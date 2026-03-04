/* eslint-disable */
export default {
  async fetch(request) {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <meta name="cf-beacon" content="off">
  <title>脚手架管家</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vant@4.6.0/lib/index.css">
  <script src="https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.prod.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vant@4.6.0/lib/vant.min.js"></script>
  <script async src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
  <script async src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <script async src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
  <script async src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
  <style>
    :root {
      --van-primary-color: #1989fa;
      --bg-color: #f5f7fa;
      --card-bg: #ffffff;
      --text-primary: #323233;
      --text-secondary: #646566;
      --text-muted: #969799;
      --border-color: #ebedf0;
      --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
      --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
      --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      --gradient-success: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      --gradient-warning: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      --gradient-info: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      --gradient-orange: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-color);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-tap-highlight-color: transparent;
      overflow-x: hidden;
      color: var(--text-primary);
    }
    [v-cloak] { display: none !important; }
    .page-container { min-height: 100vh; padding-bottom: 70px; }
    .fullscreen-page {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: var(--bg-color); z-index: 999;
      overflow-y: auto; padding-bottom: 50px;
      -webkit-overflow-scrolling: touch;
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    .loading-mask {
      position: fixed; top:0; left:0; width:100%; height:100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 9999; display: none; justify-content: center; align-items: center;
      flex-direction: column; color: white; font-size: 14px;
    }
    #error-banner {
      display: none; position: fixed; top: 0; left: 0; width: 100%;
      background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
      color: white; padding: 12px; text-align: center; z-index: 10000;
      font-size: 13px; font-weight: 500;
    }
    .card-group-title {
      padding: 16px 16px 8px; color: var(--text-muted);
      font-size: 13px; font-weight: 500; letter-spacing: 0.5px;
    }
    .card {
      background: var(--card-bg); border-radius: 16px;
      margin: 8px 12px; padding: 16px;
      box-shadow: var(--shadow-md);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: fadeIn 0.4s ease-out;
    }
    .card:hover { box-shadow: var(--shadow-lg); }
    .card:active { transform: scale(0.98); }
    .admin-card {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 16px; margin: 0 0 8px 0;
      background: var(--card-bg); border-radius: 16px;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }
    .admin-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .admin-card:active { transform: scale(0.98); }
    .admin-icon-box {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin-right: 14px; font-size: 26px;
      box-shadow: var(--shadow-sm);
    }
    .stat-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 10px; margin: 12px; padding: 0;
    }
    .stat-card {
      background: var(--gradient-primary);
      color: white; padding: 18px 16px; border-radius: 16px;
      display: flex; flex-direction: column; justify-content: center;
      box-shadow: var(--shadow-md);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative; overflow: hidden;
    }
    .stat-card::before {
      content: ''; position: absolute; top: -50%; right: -50%;
      width: 100%; height: 100%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
    .stat-card:active { transform: scale(0.97); }
    .stat-card.orange { background: var(--gradient-orange); }
    .stat-card.green { background: var(--gradient-success); }
    .stat-card.purple { background: var(--gradient-primary); }
    .stat-card.blue { background: var(--gradient-info); }
    .stat-val { font-size: 26px; font-weight: 700; margin-top: 6px; letter-spacing: -0.5px; }
    .stat-label { font-size: 12px; opacity: 0.9; font-weight: 500; }
    .text-red { color: #ee0a24; font-weight: 600; }
    .text-green { color: #07c160; font-weight: 600; }
    .text-primary { color: var(--text-primary); }
    .text-secondary { color: var(--text-secondary); }
    .rent-input {
      width: 60px; border: none; border-bottom: 2px solid var(--van-primary-color);
      text-align: center; color: var(--van-primary-color); font-weight: 600;
      background: transparent; font-size: 15px;
    }
    .rent-input:focus { border-color: #667eea; }
    .bill-wrapper {
      background: white; padding: 25px; margin: 10px;
      border-radius: 12px; box-shadow: var(--shadow-lg);
    }
    .bill-title {
      text-align: center; font-size: 20px; font-weight: 800;
      margin-bottom: 20px; border-bottom: 2px solid #333;
      padding-bottom: 15px; letter-spacing: 3px;
    }
    .logistics-box {
      display: flex; justify-content: space-between;
      margin-bottom: 15px; font-size: 13px;
      background: #f8f9fa; padding: 14px;
      border-radius: 10px; border: 1px solid var(--border-color);
    }
    .bill-header {
      margin-bottom: 10px; font-size: 14px;
      border-top: 1px dashed #ccc; padding-top: 10px;
    }
    .detail-table {
      width: 100%; border-collapse: collapse;
      font-size: 14px; margin-top: 10px;
    }
    .detail-table th {
      text-align: left; border-bottom: 2px solid #333;
      padding: 10px 4px; font-weight: 700;
    }
    .detail-table td {
      border-bottom: 1px solid #eee;
      padding: 12px 4px; vertical-align: middle;
    }
    .btn-primary {
      background: var(--gradient-primary); border: none;
      color: white; font-weight: 600; border-radius: 12px;
      padding: 12px 24px; transition: all 0.3s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 16px 8px;
    }
    .section-title {
      font-size: 15px; font-weight: 600; color: var(--text-primary);
      display: flex; align-items: center;
    }
    .section-title::before {
      content: ''; width: 4px; height: 16px;
      background: var(--gradient-primary); border-radius: 2px;
      margin-right: 8px;
    }
    .empty-state {
      text-align: center; padding: 40px 20px;
      color: var(--text-muted);
    }
    .empty-state-icon {
      font-size: 48px; margin-bottom: 12px; opacity: 0.5;
    }
    .badge {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 6px;
      font-size: 11px; font-weight: 500;
    }
    .badge-primary { background: #e8f4ff; color: #1989fa; }
    .badge-success { background: #e8f7ed; color: #07c160; }
    .badge-warning { background: #fff7e6; color: #ff976a; }
    .badge-danger { background: #ffebee; color: #ee0a24; }
    @media (max-width: 375px) {
      .stat-val { font-size: 22px; }
      .stat-card { padding: 14px; }
      .admin-card { padding: 14px; }
      .card { margin: 6px 10px; padding: 12px; }
    }
    .touch-feedback { transition: all 0.2s; }
    .touch-feedback:active { opacity: 0.7; transform: scale(0.98); }
    input, textarea {
      -webkit-appearance: none; appearance: none;
      border-radius: 0; font-size: 15px;
    }
    input:focus, textarea:focus { outline: none; }
    .van-nav-bar { background: var(--card-bg) !important; }
    .van-tabbar { background: var(--card-bg) !important; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
    .van-cell { padding: 14px 16px !important; }
    .van-field__label { color: var(--text-secondary) !important; }
    .van-button--primary { background: var(--gradient-primary) !important; border: none !important; }
    .van-button--danger { background: var(--gradient-warning) !important; border: none !important; }
    .van-tabs__nav { background: var(--card-bg) !important; }
    .van-popup--bottom { border-radius: 20px 20px 0 0 !important; }
    .van-dialog { border-radius: 16px !important; }
    .van-toast { border-radius: 12px !important; }
    .warning-card {
      background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
      border-left: 4px solid #ee0a24;
      margin: 8px 12px; padding: 14px 16px;
      border-radius: 12px; animation: pulse 2s infinite;
    }
    .icon-btn {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      background: #f5f7fa; transition: all 0.2s;
    }
    .icon-btn:hover { background: #e8f4ff; }
    .icon-btn:active { transform: scale(0.9); }
    
    @media (max-width: 768px) {
      .card { margin: 6px 10px; padding: 12px; }
      .admin-card { padding: 14px; }
      .stat-card { padding: 14px; }
      .stat-val { font-size: 22px; }
      .van-cell { padding: 12px 16px !important; }
      .van-button { min-height: 44px; font-size: 16px; }
      .van-field__label { font-size: 15px !important; }
      .van-field__control { font-size: 16px !important; }
      
      .touch-feedback {
        -webkit-tap-highlight-color: rgba(25, 137, 250, 0.1);
        user-select: none;
        -webkit-user-select: none;
      }
      
      .swipe-container {
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
      }
      
      .swipe-item {
        display: inline-block;
        vertical-align: top;
        width: 85%;
        margin-right: 10px;
      }
    }
    
    @media (max-width: 480px) {
      .stat-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
      .stat-card { padding: 12px; }
      .stat-val { font-size: 20px; }
      .admin-card { padding: 12px; }
      .card { margin: 4px 8px; padding: 10px; }
      .section-header { padding: 12px 12px 6px; }
      .section-title { font-size: 14px; }
    }
    
    .gesture-hint {
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      z-index: 1000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .gesture-hint.show {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div id="error-banner">⚠️ 核心库加载失败！请尝试切换网络或关闭拦截插件。</div>
  <div id="loading-mask" class="loading-mask" style="display: none;">
    <div style="margin-bottom:15px;"><van-loading type="spinner" color="#fff" size="48px" /></div>
    <div style="font-size:16px;font-weight:500;">系统正在初始化...</div>
  </div>
  <div id="app" v-cloak>
    <div id="gesture-hint" class="gesture-hint">左右滑动切换标签</div>
      <div v-show="currentView === 'main'" class="page-container">
        <van-nav-bar :title="sysConfig.sys_name || '脚手架管家'" fixed placeholder>
          <template #right>
            <div class="icon-btn" @click="goToPage('admin_auth')">
              <van-icon name="setting-o" size="20" color="#667eea" />
            </div>
          </template>
        </van-nav-bar>
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh" success-text="刷新成功">
      <div v-show="activeTab === 'home'">
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">💰 日租金预计</div>
            <div class="stat-val">¥ {{ (stats.daily_income || 0).toFixed(2) }}</div>
          </div>
          <div class="stat-card orange">
            <div class="stat-label">📦 在外物资总数</div>
            <div class="stat-val">{{ stats.total_out || 0 }}</div>
          </div>
        </div>
        <div v-if="stats.low_stock_count > 0" class="warning-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 600; color: #ee0a24;">⚠️ 库存预警</div>
            <div style="color: #ee0a24; font-size: 16px; font-weight: 700;">{{ stats.low_stock_count }} 项物资库存不足</div>
          </div>
        </div>
        <div class="section-header">
          <div class="section-title">资产分布</div>
        </div>
        <div class="card" style="margin-top:0"><div id="chart-pie" style="width:100%;height:220px;"></div></div>
        <div class="section-header">
          <div class="section-title">最近业务</div>
        </div>
        <div class="card" style="padding:0; margin-top:0; overflow:hidden">
          <van-list>
            <van-cell v-for="o in stats.recent_orders" :key="o.id" :title="o.customer_name" :label="o.order_date.substring(5,16)" is-link @click="showOrderDetailPage(o.id)" center>
              <template #icon><van-icon name="orders-o" size="22" color="#667eea" style="margin-right:12px" /></template>
              <template #value><div style="font-weight:600" :class="o.type==='OUT'?'text-red':'text-green'">{{o.type==='OUT'?'📤 送货':'📥 收货'}}</div><div style="font-size:10px;color:#999">{{ o.order_no || '#'+o.id }}</div></template>
            </van-cell>
          </van-list>
        </div>
      </div>
      <div v-show="activeTab === 'order'">
        <div class="card">
          <van-field v-model="selectedCustomerName" is-link readonly label="项目客户" @click="showCustPicker=true" placeholder="点击选择" size="large" input-align="right"></van-field>
          <van-field v-model="orderDeposit" type="number" label="本次押金" placeholder="0.00" size="large" input-align="right" autocomplete="off"></van-field>
          <van-field name="radio" label="业务类型">
            <template #input>
              <van-radio-group v-model="orderType" direction="horizontal" @change="cart=[]">
                <van-radio name="OUT">📤 送货出库</van-radio>
                <van-radio name="IN">📥 收货入库</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field v-model="orderNote" label="备注信息" placeholder="如：工地名称、车牌号" size="large" input-align="right"></van-field>
        </div>
        <div v-if="cart.length">
          <div class="section-header">
            <div class="section-title">已选物资</div>
            <div style="color:#667eea;font-size:13px;">共 {{ cart.length }} 项</div>
          </div>
          <div class="card" style="margin-top:0">
            <div v-for="(item,idx) in cart" :key="idx" style="margin-bottom:14px;border-bottom:1px solid #f0f0f0;padding-bottom:12px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="font-weight:600;font-size:16px">{{item.name}}</div>
                <van-icon name="delete-o" color="#ee0a24" size="20" @click="cart.splice(idx,1)"/>
              </div>
              <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;font-size:14px;color:#666">
                <div>租金: <input v-model.number="item.daily_rent_price" class="rent-input">/天</div>
                <van-stepper v-model="item.qty" min="1" integer :max="orderType==='OUT'?item.total_stock:999999" button-size="28"/>
              </div>
            </div>
            <van-button block type="primary" size="large" @click="submitOrder" :loading="loading" round>提交并生成单据</van-button>
          </div>
        </div>
        <div style="padding:20px" v-if="selectedCustomerId">
          <div style="display: flex; gap: 10px;">
            <van-button block type="primary" icon="plus" @click="showProdPicker=true" round dashed>单个添加</van-button>
            <van-button block type="primary" icon="more-o" @click="showBatchProdPicker=true" round dashed>批量选择</van-button>
          </div>
        </div>
      </div>
      <div v-show="activeTab === 'goods'">
        <van-sticky><van-search v-model="searchText" placeholder="搜索物资名称或规格" background="#f5f7fa" shape="round"></van-search></van-sticky>
        <div class="card" style="padding:0; margin-top:5px">
          <van-list>
            <van-cell v-for="p in filteredProducts" :key="p.id" :title="p.name" is-link @click="showDistribution(p)" center>
              <template #label>
                <span class="badge badge-primary">{{p.spec || '标准'}}</span>
                <span style="color:#ee0a24;font-weight:500;margin-left:8px">¥{{p.daily_rent_price}}/天</span>
              </template>
              <template #value>
                <div style="color:#323233;font-weight:600">库: {{p.total_stock}} {{p.unit||'个'}}</div>
                <div style="font-size:10px;color:#969799">原值: ¥{{p.unit_price}}</div>
              </template>
            </van-cell>
          </van-list>
        </div>
      </div>
      <div v-show="activeTab === 'customers'" class="card" style="padding:0">
          <van-list>
            <van-cell v-for="c in customers" :key="c.id" :title="c.name" :value="'¥ '+Math.abs(c.balance||0).toFixed(2)" :value-class="c.balance>=0?'text-green':'text-red'" is-link @click="openProjectPage(c)" center>
              <template #icon><van-icon name="manager-o" size="20" style="margin-right:10px;color:#667eea" /></template>
              <template #label>
                <span v-if="c.category_name" class="badge badge-primary">{{c.category_name}}</span>
                <span :class="'badge badge-' + getCreditLevelBadge(c.credit_level)" style="margin-left:8px">
                  {{ getCreditLevelText(c.credit_level) }}
                </span>
              </template>
            </van-cell>
          </van-list>
        </div>
      </van-pull-refresh>
        <van-tabbar v-model="activeTab" fixed placeholder @change="onTabChange">
          <van-tabbar-item name="home" icon="home-o">首页</van-tabbar-item>
          <van-tabbar-item name="order" icon="edit">开单</van-tabbar-item>
          <van-tabbar-item name="goods" icon="apps-o">物资</van-tabbar-item>
          <van-tabbar-item name="customers" icon="manager-o">客户</van-tabbar-item>
        </van-tabbar>
      </div>
    <div v-if="currentView === 'admin_auth'" class="fullscreen-page" style="text-align:center;padding-top:80px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
      <van-nav-bar title="管理员验证" left-text="返回" left-arrow @click-left="goBack" fixed placeholder></van-nav-bar>
      <div style="padding:40px 30px">
        <div style="background:rgba(255,255,255,0.2);width:90px;height:90px;border-radius:50%;margin:0 auto 30px;display:flex;align-items:center;justify-content:center">
          <van-icon name="lock" size="48" color="#fff"></van-icon>
        </div>
        <h3 style="margin:20px 0;color:#fff;font-size:22px">系统管理后台</h3>
        <van-field v-model="adminPwdInput" type="password" placeholder="请输入管理密码" input-align="center" style="border:1px solid rgba(255,255,255,0.3); border-radius:12px; padding: 15px; background:rgba(255,255,255,0.9);" :autofocus="true" :error-message="authErrorMsg" @focus="authErrorMsg=''"></van-field>
        <div style="margin-top:30px">
          <van-button block type="primary" @click="doAdminAuth" :loading="authLoading" round size="large" style="background:#fff !important;color:#667eea !important;font-weight:600;">验证并进入</van-button>
        </div>
        <div style="margin-top:20px;color:rgba(255,255,255,0.7);font-size:12px">
          默认密码：admin
        </div>
      </div>
    </div>
    <div v-if="currentView === 'admin_panel'" class="fullscreen-page">
      <van-nav-bar title="🔧 系统设置" left-text="退出" left-arrow @click-left="goBack" fixed placeholder></van-nav-bar>
      <div style="padding:16px">
        <!-- 系统概览卡片 -->
        <div class="card" style="margin-bottom:20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px;">
          <div style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">系统概览</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="text-align: center; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 16px;">
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">📦 物资总数</div>
              <div style="font-size: 24px; font-weight: 700;">{{ products.length }} 项</div>
            </div>
            <div style="text-align: center; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 16px;">
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">👥 客户总数</div>
              <div style="font-size: 24px; font-weight: 700;">{{ customers.length }} 位</div>
            </div>
            <div style="text-align: center; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 16px;">
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">📤 在租物资</div>
              <div style="font-size: 24px; font-weight: 700;">{{ stats.total_out || 0 }}</div>
            </div>
            <div style="text-align: center; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 16px;">
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">⚠️ 库存预警</div>
              <div style="font-size: 24px; font-weight: 700;" :class="stats.low_stock_count > 0 ? 'text-red' : ''">{{ stats.low_stock_count || 0 }}</div>
            </div>
          </div>
        </div>

        <!-- 基础资料管理 -->
        <div class="section-header" style="padding-left:0;padding-right:0; margin-bottom:12px;">
          <div class="section-title">基础资料管理</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          <div class="admin-card" @click="enterGoodsMgr" style="margin: 0;">
            <div style="display:flex; align-items:center">
              <div class="admin-icon-box" style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff"><van-icon name="points" /></div>
              <div>
                <div style="font-weight:600; font-size:16px; margin-bottom:4px">📦 物资管理</div>
                <div style="color:#969799; font-size:12px">新增物资、库存/租金/原值</div>
              </div>
            </div>
            <van-icon name="arrow" color="#ccc" />
          </div>
          <div class="admin-card" @click="enterCustMgr" style="margin: 0;">
            <div style="display:flex; align-items:center">
              <div class="admin-icon-box" style="background:linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color:#fff"><van-icon name="friends-o" /></div>
              <div>
                <div style="font-weight:600; font-size:16px; margin-bottom:4px">👥 客户管理</div>
                <div style="color:#969799; font-size:12px">新增客户、档案信息维护</div>
              </div>
            </div>
            <van-icon name="arrow" color="#ccc" />
          </div>
        </div>

        <!-- 系统配置 -->
        <div class="section-header" style="padding-left:0;padding-right:0; margin-bottom:12px;">
          <div class="section-title">系统配置</div>
        </div>
        <div class="card" style="margin-bottom:20px;">
          <van-field v-model="configForm.sys_name" label="系统名称" @blur="autoPrefix" input-align="right" placeholder="请输入系统名称" />
          <van-field v-model="configForm.order_prefix" label="单号前缀" input-align="right" placeholder="请输入单号前缀" />
          <van-field v-model="configForm.factory_name" label="打印抬头" input-align="right" placeholder="请输入打印抬头" />
          <van-field v-model="configForm.contact_info" label="发货地址" type="textarea" rows="2" input-align="right" placeholder="请输入发货地址" />
        </div>

        <!-- 账号安全 -->
        <div class="section-header" style="padding-left:0;padding-right:0; margin-bottom:12px;">
          <div class="section-title">账号安全</div>
        </div>
        <div class="card" style="margin-bottom:20px;">
          <van-field v-model="configForm.old_pwd" type="password" label="当前密码" placeholder="请输入当前密码" input-align="right" />
          <van-field v-model="configForm.new_pwd" type="password" label="新密码" placeholder="不改请留空" input-align="right" />
          <van-field v-model="configForm.confirm_pwd" type="password" label="确认密码" placeholder="请再次输入新密码" input-align="right" />
        </div>

        <!-- 数据管理 -->
        <div class="section-header" style="padding-left:0;padding-right:0; margin-bottom:12px;">
          <div class="section-title">数据管理</div>
        </div>
        <div class="card" style="margin-bottom:20px;">
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="font-weight: 600; margin-bottom: 10px;">📤 导出数据</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <van-button type="primary" plain @click="exportData('products')" round :loading="exportLoading">导出物资数据</van-button>
              <van-button type="primary" plain @click="exportData('customers')" round :loading="exportLoading">导出客户数据</van-button>
              <van-button type="primary" plain @click="exportData('orders')" round :loading="exportLoading" style="grid-column: 1 / -1;">导出订单数据</van-button>
            </div>
            <div style="font-weight: 600; margin: 20px 0 10px;">📥 导入数据</div>
            <input type="file" id="fileInput" style="display: none" @change="importData" accept=".json" />
            <van-button type="primary" plain @click="document.getElementById('fileInput').click()" round :loading="importLoading">选择JSON文件导入</van-button>
          </div>
        </div>

        <!-- 数据备份 -->
        <div class="section-header" style="padding-left:0;padding-right:0; margin-bottom:12px;">
          <div class="section-title">数据备份</div>
        </div>
        <div class="card" style="margin-bottom:20px;">
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <van-button type="success" plain @click="createBackup" round :loading="backupLoading">创建备份</van-button>
              <van-button type="warning" plain @click="showRestoreDialog = true" round>恢复备份</van-button>
            </div>
            <div style="font-weight: 600; margin: 20px 0 10px;">自动备份设置</div>
            <van-cell-group inset>
              <van-cell title="启用自动备份" center>
                <template #right-icon>
                  <van-switch v-model="autoBackupEnabled" size="20" />
                </template>
              </van-cell>
              <van-field v-model="backupInterval" type="number" label="备份间隔(天)" placeholder="7" input-align="right" />
              <van-cell title="上次备份时间" :value="lastBackupTime || '从未备份'" />
            </van-cell-group>
            <div style="font-weight: 600; margin: 20px 0 10px;">备份历史</div>
            <div v-if="backupHistory.length" style="max-height: 200px; overflow-y: auto;">
              <van-cell v-for="(backup, index) in backupHistory" :key="index" :title="backup.name" :label="backup.date" is-link @click="restoreBackup(index)">
                <template #right-icon>
                  <van-icon name="replay" color="#1989fa" />
                </template>
              </van-cell>
            </div>
            <van-empty v-else description="暂无备份记录" />
          </div>
        </div>

        <!-- 数据报表 -->
        <div class="section-header" style="padding-left:0;padding-right:0; margin-bottom:12px;">
          <div class="section-title">数据报表</div>
        </div>
        <div class="admin-card" @click="goToPage('stats_page')" style="margin-bottom:30px;">
          <div style="display:flex; align-items:center">
            <div class="admin-icon-box" style="background:linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color:#fff"><van-icon name="bar-chart" /></div>
            <div>
              <div style="font-weight:600; font-size:16px; margin-bottom:4px">📊 数据统计</div>
              <div style="color:#969799; font-size:12px">业务分析、趋势图表</div>
            </div>
          </div>
          <van-icon name="arrow" color="#ccc" />
        </div>

        <!-- 保存按钮 -->
        <van-button block type="primary" @click="saveConfig" :loading="configLoading" round style="font-size:16px; padding:16px;">💾 保存所有配置</van-button>
      </div>
    </div>
    <div v-if="currentView === 'admin_goods_mgr'" class="fullscreen-page">
      <van-nav-bar title="📦 物资库管理" left-text="返回" left-arrow @click-left="goToPage('admin_panel')" fixed placeholder>
        <template #right>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="icon-btn" @click="openCategoryMgr">
              <van-icon name="apps-o" color="#667eea" size="20" />
            </div>
            <div class="icon-btn" @click="showBatchEditDialog = true" v-if="selectedProducts.length">
              <van-icon name="edit" color="#667eea" size="20" />
            </div>
            <div class="icon-btn" @click="showBatchDeleteDialog = true" v-if="selectedProducts.length">
              <van-icon name="delete" color="#ee0a24" size="20" />
            </div>
            <div class="icon-btn" @click="openGoodsEditorPage(null)">
              <van-icon name="plus" color="#667eea" size="20" />
            </div>
          </div>
        </template>
      </van-nav-bar>
      <van-search v-model="searchText" placeholder="搜索物资名称、规格或分类..." background="#fff" shape="round"></van-search>
      <div style="padding:10px">
        <van-list>
          <van-cell v-for="p in filteredProducts" :key="p.id" :title="p.name" :value="'库:'+p.total_stock" center style="border-radius:12px;margin-bottom:6px" @click="toggleProductSelection(p.id)">
            <template #left>
              <van-checkbox v-model="selectedProducts" :name="p.id" style="margin-right: 10px;" />
            </template>
            <template #label>{{p.spec}} | 租:{{p.daily_rent_price}} | 原:{{p.unit_price}} | {{p.category_name || '未分类'}}</template>
            <template #right-icon>
              <div style="display: flex; align-items: center; gap: 8px;">
                <van-icon name="edit" color="#667eea" size="20" @click.stop="openGoodsEditorPage(p)"/>
                <van-icon name="warning-o" color="#ff976a" size="20" @click.stop="openRepairRecord(p)"/>
              </div>
            </template>
          </van-cell>
        </van-list>
        <van-empty v-if="!filteredProducts.length" description="暂无物资，请点击右上角+新增" />
      </div>
      <van-dialog v-model:show="showBatchDeleteDialog" title="批量删除" show-cancel-button @confirm="batchDeleteProducts">
        <div>确定要删除选中的 {{selectedProducts.length}} 个物资吗？</div>
      </van-dialog>
      <van-popup v-model:show="showBatchEditDialog" position="bottom" round style="height:80%">
        <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">批量操作</h3>
          <van-button type="primary" size="small" @click="batchUpdateProducts">执行操作</van-button>
        </div>
        <div style="padding: 15px;">
          <div class="card-group-title">批量修改</div>
          <van-cell-group inset>
            <van-field v-model="batchForm.category_id" is-link readonly label="物资分类" @click="showBatchCategoryPicker=true" placeholder="统一修改分类" input-align="right"/>
            <van-field v-model="batchForm.daily_rent_price" type="number" label="日租赁费" placeholder="统一修改租金" input-align="right"><template #right-icon>元</template></van-field>
            <van-field v-model="batchForm.unit_price" type="number" label="物资原值" placeholder="统一修改原值" input-align="right"><template #right-icon>元</template></van-field>
            <van-field v-model="batchForm.unit" label="计量单位" placeholder="统一修改单位" input-align="right"/>
          </van-cell-group>
          
          <div class="card-group-title" style="margin-top: 20px;">库存调整</div>
          <van-cell-group inset>
            <van-field v-model="batchForm.stock_change" type="number" label="库存调整" placeholder="正数增加，负数减少" input-align="right"><template #right-icon>{{batchForm.unit || '个'}}</template></van-field>
          </van-cell-group>
          
          <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px;">
            <div style="font-weight: bold; margin-bottom: 10px;">操作说明</div>
            <div style="font-size: 12px; color: #666; line-height: 1.5;">
              • 填写的字段会统一修改选中物资<br>
              • 库存调整会直接增加或减少库存<br>
              • 留空的字段不会修改
            </div>
          </div>
        </div>
      </van-popup>
      <van-popup v-model:show="showBatchCategoryPicker" position="bottom" round>
        <div style="padding: 15px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0;">选择分类</h3>
        </div>
        <van-picker :columns="categoryColumns" @confirm="onPickBatchCategory" @cancel="showBatchCategoryPicker=false" />
      </van-popup>
    </div>
    <div v-if="currentView === 'stats_page'" class="fullscreen-page">
      <van-nav-bar title="📊 数据统计" left-text="返回" left-arrow @click-left="goToPage('admin_panel')" fixed placeholder>
        <template #right>
          <div class="icon-btn" @click="exportPDF" title="导出PDF">
            <van-icon name="down" size="20" color="#1989fa" />
          </div>
        </template>
      </van-nav-bar>
      <div style="padding:12px">
        <van-tabs v-model:active="statsActiveTab" sticky>
          <van-tab title="业务概览">
            <div class="stat-grid">
              <div class="stat-card purple"><div class="stat-label">💰 日租金预计</div><div class="stat-val">¥ {{ (stats.daily_income || 0).toFixed(2) }}</div></div>
              <div class="stat-card orange"><div class="stat-label">📦 在外物资总数</div><div class="stat-val">{{ stats.total_out || 0 }}</div></div>
              <div class="stat-card green"><div class="stat-label">📦 物资总数</div><div class="stat-val">{{ products.length }}</div></div>
              <div class="stat-card blue"><div class="stat-label">👥 客户总数</div><div class="stat-val">{{ customers.length }}</div></div>
            </div>
            <div class="section-header">
              <div class="section-title">最近7天订单趋势</div>
            </div>
            <div class="card" style="margin-top:0"><div id="chart-order-trend" style="width:100%;height:220px;"></div></div>
            <div class="section-header">
              <div class="section-title">收入趋势</div>
            </div>
            <div class="card" style="margin-top:0"><div id="chart-income-trend" style="width:100%;height:220px;"></div></div>
          </van-tab>
          <van-tab title="物资分析">
            <div class="section-header">
              <div class="section-title">物资分类分布</div>
            </div>
            <div class="card" style="margin-top:0"><div id="chart-category" style="width:100%;height:220px;"></div></div>
            <div class="section-header">
              <div class="section-title">库存状态</div>
            </div>
            <div class="card" style="margin-top:0">
              <van-cell v-for="item in categoryStats" :key="item.category" :title="item.category || '未分类'" :value="item.total_stock + ' ' + (item.total_stock === 1 ? '个' : '个')" />
            </div>
            <div class="section-header">
              <div class="section-title">物资周转率</div>
            </div>
            <div class="card" style="margin-top:0"><div id="chart-turnover" style="width:100%;height:220px;"></div></div>
          </van-tab>
          <van-tab title="客户分析">
            <div class="section-header">
              <div class="section-title">客户分类分布</div>
            </div>
            <div class="card" style="margin-top:0"><div id="chart-customer-category" style="width:100%;height:220px;"></div></div>
            <div class="section-header">
              <div class="section-title">信用等级分布</div>
            </div>
            <div class="card" style="margin-top:0"><div id="chart-credit" style="width:100%;height:220px;"></div></div>
            <div class="section-header">
              <div class="section-title">客户消费排行</div>
            </div>
            <div class="card" style="margin-top:0">
              <van-cell v-for="(item, index) in topCustomers" :key="item.id" :title="(index + 1) + '. ' + item.name" :value="'¥' + Math.abs(item.balance || 0).toFixed(2)" :value-class="item.balance >= 0 ? 'text-green' : 'text-red'" />
            </div>
          </van-tab>
          <van-tab title="自定义报表">
            <div class="card">
              <van-field label="报表类型" is-link readonly :value="reportTypeText" @click="showReportTypePicker = true" />
              <van-field label="时间范围" is-link readonly :value="dateRangeText" @click="showDatePicker = true" />
              <van-field label="数据类型" is-link readonly :value="dataTypeText" @click="showDataTypePicker = true" />
            </div>
            <div style="margin-top:20px">
              <van-button block type="primary" @click="generateCustomReport" :loading="reportLoading" round>生成报表</van-button>
            </div>
            <div v-if="customReportData" class="card" style="margin-top:20px">
              <div class="section-header">
                <div class="section-title">报表结果</div>
              </div>
              <div id="custom-report-chart" style="width:100%;height:300px;"></div>
              <div style="margin-top:20px">
                <van-button block type="primary" plain @click="exportCustomReport" round>导出报表</van-button>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </div>
    <div v-if="currentView === 'repair_record'" class="fullscreen-page">
      <van-nav-bar title="🛠️ 维修记录" left-text="返回" left-arrow @click-left="goBack" fixed placeholder>
        <template #right>
          <div class="icon-btn" @click="openRepairEditor(null)">
            <van-icon name="plus" size="20" color="#1989fa" />
          </div>
        </template>
      </van-nav-bar>
      <div style="padding:10px">
        <van-list>
          <van-cell v-for="r in repairRecords" :key="r.id" :title="r.product_name" :label="r.repair_date + ' | ' + r.status" center style="border-radius:8px;margin-bottom:8px">
            <template #right-icon>
              <van-icon name="edit" color="#1989fa" size="22" @click.stop="openRepairEditor(r)" style="padding-left:10px;"/>
            </template>
          </van-cell>
        </van-list>
        <van-empty v-if="!repairRecords.length" description="暂无维修记录" />
      </div>
    </div>
    <div v-if="currentView === 'repair_edit'" class="fullscreen-page">
      <van-nav-bar :title="repairForm.id?'编辑维修记录':'新增维修记录'" left-text="取消" left-arrow @click-left="goToPage('repair_record')" fixed placeholder></van-nav-bar>
      <div style="padding:15px">
        <van-cell-group inset>
          <van-field v-model="repairForm.product_name" is-link readonly label="物资名称" @click="showProductPicker=true" placeholder="点击选择" size="large" input-align="right"/>
          <van-field v-model="repairForm.description" label="损坏描述" type="textarea" rows="3" placeholder="请描述损坏情况" size="large" input-align="right"/>
          <van-field v-model="repairForm.cost" type="number" label="维修费用" placeholder="0.00" size="large" input-align="right"><template #right-icon>元</template></van-field>
          <van-field v-model="repairForm.status" label="维修状态">
            <template #input>
              <van-radio-group v-model="repairForm.status" direction="horizontal">
                <van-radio name="PENDING">待维修</van-radio>
                <van-radio name="IN_PROGRESS">维修中</van-radio>
                <van-radio name="COMPLETED">已完成</van-radio>
              </van-radio-group>
            </template>
          </van-field>
        </van-cell-group>
        <div style="margin-top:30px;padding:0 15px">
          <van-button block type="primary" size="large" @click="saveRepair" round>💾 保存记录</van-button>
        </div>
      </div>
    </div>
    <div v-if="currentView === 'admin_cust_mgr'" class="fullscreen-page">
      <van-nav-bar title="👥 客户档案管理" left-text="返回" left-arrow @click-left="goToPage('admin_panel')" fixed placeholder>
        <template #right>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="icon-btn" @click="showCustBatchDeleteDialog = true" v-if="selectedCustomers.length">
              <van-icon name="delete" color="#ee0a24" size="20" />
            </div>
            <div class="icon-btn" @click="openCustEditorPage(null)">
              <van-icon name="plus" size="20" color="#1989fa" />
            </div>
          </div>
        </template>
      </van-nav-bar>
      <van-search v-model="custSearchText" placeholder="搜索客户名称、电话或项目..." background="#fff"></van-search>
      <div style="padding:10px">
        <van-list>
          <van-cell v-for="c in filteredCustomers" :key="c.id" :title="c.name" :label="(c.contact||'无电话') + ' | ' + (c.project_name||'无项目')" center style="border-radius:8px;margin-bottom:8px" @click="toggleCustomerSelection(c.id)">
            <template #left>
              <van-checkbox v-model="selectedCustomers" :name="c.id" style="margin-right: 10px;" />
            </template>
            <template #right-icon>
              <div style="display: flex; align-items: center;">
                <van-icon name="edit" color="#1989fa" size="22" @click.stop="openCustEditorPage(c)" style="padding-left:10px;"/>
              </div>
            </template>
          </van-cell>
        </van-list>
        <van-empty v-if="!filteredCustomers.length" description="暂无客户，请点击右上角+新增" />
      </div>
      <van-dialog v-model:show="showCustBatchDeleteDialog" title="批量删除" show-cancel-button @confirm="batchDeleteCustomers">
        <div>确定要删除选中的 {{selectedCustomers.length}} 个客户吗？</div>
      </van-dialog>
    </div>
    <div v-if="currentView === 'goods_edit'" class="fullscreen-page">
      <van-nav-bar :title="prodForm.id?'编辑物资':'新增物资'" left-text="取消" left-arrow @click-left="goToPage('admin_goods_mgr')" fixed placeholder></van-nav-bar>
      <div style="padding:12px">
        <div class="section-header" style="padding-left:0;padding-right:0;">
          <div class="section-title">基本信息</div>
        </div>
        <div class="card">
          <van-field v-model="prodForm.name" label="物资名称" placeholder="必填" required size="large" input-align="right"/>
          <van-field v-model="prodForm.spec" label="规格型号" placeholder="选填" size="large" input-align="right"/>
          <van-field v-model="prodForm.category_name" is-link readonly label="物资分类" @click="showCategoryPicker=true" placeholder="点击选择" size="large" input-align="right"/>
          <van-field v-model="prodForm.unit" label="计量单位" placeholder="如: 个、吨" size="large" input-align="right"/>
          <van-field v-model="prodForm.weight" type="number" label="单重" placeholder="可选" size="large" input-align="right"/>
        </div>
        <div class="section-header" style="padding-left:0;padding-right:0;">
          <div class="section-title">库存与价格</div>
        </div>
        <div class="card">
          <van-field v-model="prodForm.total_stock" type="number" label="库房库存" placeholder="0" size="large" input-align="right"/>
          <van-field v-model="prodForm.min_stock" type="number" label="库存预警" placeholder="0" size="large" input-align="right"/>
          <van-field v-model="prodForm.daily_rent_price" type="number" label="日租赁费" placeholder="0.00" size="large" input-align="right"><template #right-icon>元</template></van-field>
          <van-field v-model="prodForm.unit_price" type="number" label="物资原值" placeholder="丢失赔偿价" size="large" label-class="text-red" input-align="right"><template #right-icon>元</template></van-field>
          <van-field v-model="prodForm.deposit_price" type="number" label="单品押金" placeholder="可选" size="large" input-align="right"><template #right-icon>元</template></van-field>
        </div>
        <div style="margin-top:30px;padding:0 15px">
          <van-button block type="primary" size="large" @click="saveProd" round>💾 保存信息</van-button>
          <van-button v-if="prodForm.id" block type="danger" plain style="margin-top:15px" @click="deleteProd" round>删除此物资</van-button>
        </div>
      </div>
    </div>
    <div v-if="currentView === 'cust_edit'" class="fullscreen-page">
      <van-nav-bar :title="custForm.id?'编辑客户':'新增客户'" left-text="取消" left-arrow @click-left="goToPage('admin_cust_mgr')" fixed placeholder></van-nav-bar>
      <div style="padding:12px">
        <div class="section-header" style="padding-left:0;padding-right:0;">
          <div class="section-title">客户档案</div>
        </div>
        <div class="card">
          <van-field v-model="custForm.name" label="客户姓名" placeholder="必填" required size="large" input-align="right"/>
          <van-field v-model="custForm.project_name" label="项目名称" placeholder="工地名称" size="large" input-align="right"/>
          <van-field v-model="custForm.contact" label="联系电话" placeholder="手机号" size="large" input-align="right"/>
          <van-field v-model="custForm.id_card" label="身份证号" placeholder="选填，实名登记" size="large" input-align="right"/>
          <van-field v-model="custForm.address" label="送货地址" type="textarea" rows="2" autosize size="large" placeholder="工地详细地址" input-align="right"/>
          <van-field v-model="custForm.category_name" is-link readonly label="客户分类" @click="showCustCategoryPicker=true" placeholder="点击选择" size="large" input-align="right"/>
          <van-field v-model="custForm.credit_level_text" is-link readonly label="信用等级" @click="showCreditLevelPicker=true" placeholder="点击选择" size="large" input-align="right"/>
          <van-field v-model="custForm.notes" label="备注信息" placeholder="信用记录等" size="large" input-align="right"/>
        </div>
        <div style="margin-top:30px;padding:0 15px">
          <van-button block type="primary" size="large" @click="saveCustomer" round>💾 保存客户</van-button>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showCustCategoryPicker" position="bottom" round>
      <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">选择客户分类</h3>
        <van-button type="primary" size="small" @click="openCustCategoryMgr">新增分类</van-button>
      </div>
      <van-picker :columns="custCategoryColumns" @confirm="onPickCustCategory" @cancel="showCustCategoryPicker=false" />
    </van-popup>
    <van-popup v-model:show="showCreditLevelPicker" position="bottom" round>
      <div style="padding: 15px; border-bottom: 1px solid #eee;">
        <h3 style="margin: 0;">选择信用等级</h3>
      </div>
      <van-picker :columns="creditLevelColumns" @confirm="onPickCreditLevel" @cancel="showCreditLevelPicker=false" />
    </van-popup>
    <van-popup v-model:show="showCustCategoryMgr" position="bottom" round closeable style="height:60%">
      <div style="padding:20px">
        <h3>客户分类管理</h3>
        <van-cell-group inset>
          <van-field v-model="custCategoryForm.name" label="分类名称" placeholder="请输入分类名称"/>
          <van-field v-model="custCategoryForm.description" label="分类描述" placeholder="请输入分类描述" type="textarea" rows="2"/>
        </van-cell-group>
        <div style="margin-top:30px">
          <van-button block type="primary" @click="saveCustCategory" round>保存分类</van-button>
        </div>
        <div style="margin-top:10px">
          <van-list>
            <van-cell v-for="c in customerCategories" :key="c.id" :title="c.name" :label="c.description"/>
          </van-list>
        </div>
      </div>
    </van-popup>
    <div v-if="currentView === 'project_detail'" class="fullscreen-page">
      <van-nav-bar :title="proData.cust?.name" left-text="返回" left-arrow @click-left="goBack" fixed placeholder></van-nav-bar>
      <div style="padding:12px;background:white;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
        <div style="color:#646566;font-size:13px">
          <div>📞 电话：{{proData.cust?.contact||'--'}}</div>
          <div>🏗️ 项目：{{proData.cust?.project_name||'--'}}</div>
          <div>📍 地址：{{proData.cust?.address||'--'}}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;color:#969799">当前余额</div>
          <div style="font-size:22px;font-weight:700" :class="proData.cust?.balance>=0?'text-green':'text-red'">¥ {{ (proData.cust?.balance||0).toFixed(2) }}</div>
        </div>
      </div>
      <van-tabs v-model:active="proTabActive" sticky>
        <van-tab title="📦 在租">
          <div class="card" v-if="proData.stocks?.length">
            <div style="background:linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);padding:12px;border-radius:12px;margin-bottom:12px;text-align:center">
              <div style="font-size:12px;color:#646566">物资总原值 (丢失赔偿参考)</div>
              <div style="font-size:22px;color:#ee0a24;font-weight:700">¥ {{ (proData.stocks.reduce((sum,s)=>sum+(s.quantity*(s.unit_price||0)),0)).toFixed(2) }}</div>
            </div>
            <van-cell v-for="s in proData.stocks" :key="s.name" :title="s.name" :value="s.quantity + (s.unit||'个')" :label="'规格:'+s.spec+' | 原值:'+s.unit_price"/>
          </div>
          <van-empty v-else description="无在租物资" />
        </van-tab>
        <van-tab title="💰 账目">
          <div class="card">
            <div style="display:flex;gap:10px;margin-bottom:15px">
              <van-button block type="success" plain @click="exportExcel">导出报表</van-button>
              <van-button block type="primary" @click="showPayDialog=true">登记收款</van-button>
            </div>
            <van-cell v-for="p in proData.payments" :key="p.id" :title="p.note" :label="p.pay_date" :value="'¥'+p.amount" :value-class="p.amount>0?'text-green':'text-red'"/>
          </div>
        </van-tab>
        <van-tab title="📄 单据">
          <div class="card">
            <van-cell v-for="o in proData.orders" :key="o.id" :title="o.order_no" :label="o.order_date" is-link @click="showOrderDetailPage(o.id)"/>
          </div>
        </van-tab>
      </van-tabs>
    </div>
    <div v-if="currentView === 'order_detail'" class="fullscreen-page" style="background:#555">
      <van-nav-bar title="单据详情" left-text="关闭" left-arrow @click-left="goBack" fixed placeholder></van-nav-bar>
      <div style="padding:20px">
        <div id="capture-area" class="bill-wrapper">
          <div class="bill-title">{{ sysConfig.factory_name || '单据' }} - {{ curOrder.type==='OUT'?'送货单':'收货单' }}</div>
          <div class="logistics-box">
            <div class="log-item">
              <span class="log-label">📍 发货方</span>
              <div>{{ sysConfig.contact_info || '无' }}</div>
            </div>
            <div class="log-item">
              <span class="log-label">👤 收货方</span>
              <div style="font-weight:bold">{{ curOrder.customer_name }}</div>
              <div>{{ curOrder.customer_address }}</div>
            </div>
          </div>
          <div class="bill-header">
            <div style="display:flex;justify-content:space-between">
              <span>单号：{{ curOrder.order_no }}</span>
              <span>{{ curOrder.order_date }}</span>
            </div>
            <div style="margin-top:5px;padding-top:5px;border-top:1px dashed #eee">备注：{{ curOrder.note }}</div>
          </div>
          <table class="detail-table">
            <thead>
              <tr>
                <th>物资名称</th>
                <th>规格</th>
                <th style="text-align:right">数量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in curOrder.items" :key="i.name">
                <td><b>{{ i.name }}</b></td>
                <td>{{ i.spec }}</td>
                <td style="text-align:right;font-weight:bold">{{ i.quantity }} {{i.unit||''}}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top:40px;display:flex;justify-content:space-between;font-size:12px;padding-top:20px;border-top:2px solid #000">
            <div>发货人签字：</div>
            <div>客户签字：</div>
          </div>
        </div>
        <div style="margin-top:20px">
          <div style="display: flex; gap: 10px;">
            <van-button block type="primary" @click="generateImage" round>保存为图片</van-button>
            <van-button block type="primary" @click="exportOrderPDF" round>导出PDF</van-button>
            <van-button block type="primary" @click="printOrder" round>直接打印</van-button>
          </div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="showProdPicker" position="bottom" round style="height:70%">
      <van-cell v-for="p in products" :key="p.id" :title="p.name" :label="'库:'+p.total_stock + (p.unit||'个')" is-link @click="addToCart(p)"/>
    </van-popup>
    <van-popup v-model:show="showCustPicker" position="bottom" round>
      <van-picker :columns="custColumns" @confirm="onPickCust" @cancel="showCustPicker=false" title="客户清单"/>
    </van-popup>
    <van-dialog v-model:show="showPayDialog" title="收款登记" show-cancel-button @confirm="savePayment">
      <van-field v-model="payForm.amount" type="number" label="金额" />
      <van-field v-model="payForm.note" label="摘要" />
    </van-dialog>
    <van-dialog v-model:show="showImgDialog" title="长按保存图片" confirm-button-text="关闭">
      <div style="padding:10px;text-align:center;">
        <img :src="imgUrl" style="width:100%;border:1px solid #eee;">
      </div>
    </van-dialog>
    <van-popup v-model:show="showDist" position="bottom" round closeable style="height:45%">
      <div style="padding:20px">
        <h3>物资分布</h3>
        <van-cell v-for="h in distList" :key="h.name" :title="h.name" :value="h.quantity+'个'" />
      </div>
    </van-popup>
    <van-popup v-model:show="showCategoryPicker" position="bottom" round>
      <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">选择分类</h3>
        <van-button type="primary" size="small" @click="openCategoryMgr">新增分类</van-button>
      </div>
      <van-picker :columns="categoryColumns" @confirm="onPickCategory" @cancel="showCategoryPicker=false" />
    </van-popup>
    <van-popup v-model:show="showCategoryMgr" position="bottom" round closeable style="height:60%">
      <div style="padding:20px">
        <h3>分类管理</h3>
        <van-cell-group inset>
          <van-field v-model="categoryForm.name" label="分类名称" placeholder="请输入分类名称"/>
          <van-field v-model="categoryForm.description" label="分类描述" placeholder="请输入分类描述" type="textarea" rows="2"/>
        </van-cell-group>
        <div style="margin-top:20px">
          <van-button block type="primary" @click="saveCategory" round>保存分类</van-button>
        </div>
        <div style="margin-top:15px">
          <van-list>
            <van-cell v-for="c in categories" :key="c.id" :title="c.name" :label="c.description" is-link>
              <template #right-icon>
                <div style="display: flex; align-items: center;">
                  <van-icon name="edit" color="#667eea" size="18" @click.stop="editCategory(c)" style="padding-right:12px;"/>
                  <van-icon name="delete-o" color="#ee0a24" size="18" @click.stop="deleteCategory(c.id)"/>
                </div>
              </template>
            </van-cell>
          </van-list>
        </div>
      </div>
    </van-popup>
    <van-popup v-model:show="showProductPicker" position="bottom" round style="height:70%">
      <van-cell v-for="p in products" :key="p.id" :title="p.name" :label="p.spec" is-link @click="() => { repairForm.product_id = p.id; repairForm.product_name = p.name; showProductPicker = false; }"/>
    </van-popup>
    <van-popup v-model:show="showBatchProdPicker" position="bottom" round style="height:80%">
      <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">批量选择物资</h3>
        <van-button type="primary" size="small" @click="addSelectedProducts">确定添加</van-button>
      </div>
      <div style="padding: 10px;">
        <van-search v-model="batchSearchText" placeholder="搜索物资名称或规格" background="#fff"></van-search>
        <van-list>
          <van-cell v-for="p in batchFilteredProducts" :key="p.id" :title="p.name" :label="p.spec + ' | 库存: ' + p.total_stock" center @click="toggleBatchProductSelection(p.id)">
            <template #left>
              <van-checkbox v-model="selectedBatchProducts" :name="p.id" style="margin-right: 10px;" />
            </template>
          </van-cell>
        </van-list>
        <van-empty v-if="!batchFilteredProducts.length" description="暂无物资" />
      </div>
    </van-popup>
  </div>
  <script>
    window.onerror = function() { if (typeof Vue === 'undefined' || typeof vant === 'undefined') document.getElementById('error-banner').style.display = 'block'; };
    const { createApp, ref, onMounted, nextTick, computed } = Vue;
    const API = "https://api.xxlb.us.ci"; // 使用HTTPS API端点
    createApp({
      setup() {
        const currentView = ref('main');
        const activeTab = ref('home');
        const stats = ref({});
        const products = ref([]);
        const customers = ref([]);
        const cart = ref([]);
        const orderType = ref('OUT');
        const orderNote = ref('');
        const orderDeposit = ref(0);
        const selectedCustomerName = ref('');
        const selectedCustomerId = ref(null);
        const showCustPicker = ref(false);
        const showProdPicker = ref(false);
        const showPayDialog = ref(false);
        const showImgDialog = ref(false);
        const showDist = ref(false);
        const showCategoryPicker = ref(false);
        const showCategoryMgr = ref(false);
        const showProductPicker = ref(false);
        const showBatchProdPicker = ref(false);
        const showBatchDeleteDialog = ref(false);
        const showBatchEditDialog = ref(false);
        const showBatchCategoryPicker = ref(false);
        const showCustBatchDeleteDialog = ref(false);
        const showCustCategoryPicker = ref(false);
        const showCreditLevelPicker = ref(false);
        const showCustCategoryMgr = ref(false);
        const selectedProducts = ref([]);
        const selectedCustomers = ref([]);
        const selectedBatchProducts = ref([]);
        const batchSearchText = ref('');
        const custSearchText = ref('');
        const custCategoryForm = ref({});
        const batchForm = ref({});
        const prodForm = ref({});
        const custForm = ref({});
        const configForm = ref({});
        const payForm = ref({});
        const adminPwdInput = ref('');
        const authErrorMsg = ref('');
        const authLoading = ref(false);
        const configLoading = ref(false);
        const exportLoading = ref(false);
        const importLoading = ref(false);
        const categoryForm = ref({});
        const repairForm = ref({});
        const curOrder = ref({ items: [] });
        const proData = ref({});
        const proTabActive = ref(0);
        const searchText = ref('');
        const imgUrl = ref('');
        const loading = ref(false);
        const distList = ref([]);
        const sysConfig = ref({ sys_name: '脚手架管家', factory_name: '我的租赁站', contact_info: '', order_prefix: 'JSJ' });
        const categories = ref([]);
        const repairRecords = ref([]);
        const statsActiveTab = ref(0);
        const categoryStats = ref([]);
        const customerCategoryStats = ref([]);
        const creditStats = ref([]);
        const orderStats = ref([]);
        const customerCategories = ref([]);
        const refreshing = ref(false);
        
        const topCustomers = ref([]);
        const reportTypeText = ref('柱状图');
        const dateRangeText = ref('最近7天');
        const dataTypeText = ref('订单数据');
        const showReportTypePicker = ref(false);
        const showDatePicker = ref(false);
        const showDataTypePicker = ref(false);
        const reportLoading = ref(false);
        const customReportData = ref(null);
        const autoBackupEnabled = ref(false);
        const backupInterval = ref(7);
        const backupLoading = ref(false);
        const lastBackupTime = ref('');
        const backupHistory = ref([]);
        const showRestoreDialog = ref(false);
        const touchFeedbackEnabled = ref(true);
        const gestureEnabled = ref(false);
        
        const goToPage = (pageName) => { 
          currentView.value = pageName; 
          window.scrollTo(0,0);
          if (pageName === 'stats_page') {
            loadStatsData();
          }
        };
        const goBack = () => { currentView.value = 'main'; };
        const enterGoodsMgr = () => { searchText.value = ''; goToPage('admin_goods_mgr'); };
        const enterCustMgr = () => { goToPage('admin_cust_mgr'); };
        
        const loadData = async () => {
          const get = (u, def) => fetch(API+u).then(r=>r.ok?r.json():def).catch(()=>def);
          const [productsData, customersData, categoriesData, customerCategoriesData, statsData, configData] = await Promise.all([
            get("/products", []),
            get("/customers", []),
            get("/categories", []),
            get("/customer-categories", []),
            get("/stats", {}),
            get("/config", sysConfig.value)
          ]);
          products.value = productsData;
          customers.value = customersData;
          categories.value = categoriesData;
          customerCategories.value = customerCategoriesData;
          stats.value = statsData;
          sysConfig.value = configData;
          document.title = sysConfig.value.sys_name;
          const mask = document.getElementById('loading-mask'); if(mask) mask.style.display='none';
          if(activeTab.value==='home') nextTick(initPie);
          refreshing.value = false;
        };
        
        const getCreditLevelColor = (level) => {
          const colors = {
            'EXCELLENT': '#07c160',
            'GOOD': '#1989fa',
            'NORMAL': '#ff976a',
            'POOR': '#ee0a24'
          };
          return colors[level] || colors['NORMAL'];
        };
        
        const getCreditLevelText = (level) => {
          const texts = {
            'EXCELLENT': '优秀',
            'GOOD': '良好',
            'NORMAL': '普通',
            'POOR': '较差'
          };
          return texts[level] || texts['NORMAL'];
        };
        
        const getCreditLevelBadge = (level) => {
          const badges = {
            'EXCELLENT': 'success',
            'GOOD': 'primary',
            'NORMAL': 'warning',
            'POOR': 'danger'
          };
          return badges[level] || badges['NORMAL'];
        };
        
        const onRefresh = async () => {
          refreshing.value = true;
          await loadData();
        };

        const loadStatsData = async () => {
          try {
            const res = await fetch(API + "/stats/detailed");
            if (res.ok) {
              const data = await res.json();
              categoryStats.value = data.categoryStats || [];
              customerCategoryStats.value = data.customerCategoryStats || [];
              creditStats.value = data.creditStats || [];
              orderStats.value = data.orderStats || [];
              loadTopCustomers();
              
              setTimeout(() => {
                initOrderTrendChart();
                initIncomeTrendChart();
                initCategoryChart();
                initCustomerCategoryChart();
                initCreditChart();
                initTurnoverChart();
              }, 100);
            }
          } catch (e) {
            console.error('加载统计数据失败:', e);
          }
        };

        const initPie = () => {
          const dom = document.getElementById('chart-pie');
          if (dom && stats.value.total_out !== undefined) {
            echarts.init(dom).setOption({
              series: [{
                type: 'pie',
                radius:['40%','70%'],
                data: [
                  { value: stats.value.total_out, name: '在外', itemStyle:{color:'#FF8008'} },
                  { value: stats.value.total_stock, name: '在库', itemStyle:{color:'#1989fa'} }
                ]
              }]
            });
          }
        };

        const initOrderTrendChart = () => {
          const dom = document.getElementById('chart-order-trend');
          if (dom) {
            const dates = orderStats.value.map(item => item.date);
            const counts = orderStats.value.map(item => item.count);
            const deposits = orderStats.value.map(item => item.deposit || 0);
            
            echarts.init(dom).setOption({
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                  crossStyle: {
                    color: '#999'
                  }
                }
              },
              legend: {
                data: ['订单数', '押金金额']
              },
              xAxis: [
                {
                  type: 'category',
                  data: dates,
                  axisPointer: {
                    type: 'shadow'
                  }
                }
              ],
              yAxis: [
                {
                  type: 'value',
                  name: '订单数',
                  min: 0,
                  axisLabel: {
                    formatter: '{value}'
                  }
                },
                {
                  type: 'value',
                  name: '押金',
                  min: 0,
                  axisLabel: {
                    formatter: '¥{value}'
                  }
                }
              ],
              series: [
                {
                  name: '订单数',
                  type: 'bar',
                  data: counts,
                  itemStyle: {
                    color: '#1989fa'
                  }
                },
                {
                  name: '押金金额',
                  type: 'line',
                  yAxisIndex: 1,
                  data: deposits,
                  itemStyle: {
                    color: '#ff976a'
                  }
                }
              ]
            });
          }
        };

        const initCategoryChart = () => {
          const dom = document.getElementById('chart-category');
          if (dom) {
            const data = categoryStats.value.map(item => ({
              name: item.category || '未分类',
              value: item.count
            }));
            
            echarts.init(dom).setOption({
              tooltip: {
                trigger: 'item'
              },
              legend: {
                orient: 'vertical',
                left: 'left'
              },
              series: [
                {
                  name: '物资分类',
                  type: 'pie',
                  radius: '60%',
                  data: data,
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  }
                }
              ]
            });
          }
        };

        const initCustomerCategoryChart = () => {
          const dom = document.getElementById('chart-customer-category');
          if (dom) {
            const data = customerCategoryStats.value.map(item => ({
              name: item.category || '未分类',
              value: item.count
            }));
            
            echarts.init(dom).setOption({
              tooltip: {
                trigger: 'item'
              },
              legend: {
                orient: 'vertical',
                left: 'left'
              },
              series: [
                {
                  name: '客户分类',
                  type: 'pie',
                  radius: '60%',
                  data: data,
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  }
                }
              ]
            });
          }
        };

        const initCreditChart = () => {
          const dom = document.getElementById('chart-credit');
          if (dom) {
            const data = creditStats.value.map(item => ({
              name: getCreditLevelText(item.credit_level),
              value: item.count
            }));
            
            echarts.init(dom).setOption({
              tooltip: {
                trigger: 'item'
              },
              legend: {
                orient: 'vertical',
                left: 'left'
              },
              series: [
                {
                  name: '信用等级',
                  type: 'pie',
                  radius: '60%',
                  data: data,
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  }
                }
              ]
            });
          }
        };

        const initIncomeTrendChart = () => {
          const dom = document.getElementById('chart-income-trend');
          if (dom && orderStats.value.length) {
            const dates = orderStats.value.map(item => item.date);
            const deposits = orderStats.value.map(item => item.deposit || 0);
            
            echarts.init(dom).setOption({
              tooltip: {
                trigger: 'axis'
              },
              xAxis: {
                type: 'category',
                data: dates
              },
              yAxis: {
                type: 'value',
                name: '金额(元)'
              },
              series: [{
                name: '押金收入',
                type: 'line',
                data: deposits,
                smooth: true,
                itemStyle: {
                  color: '#1989fa'
                },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0, color: 'rgba(25, 137, 250, 0.3)'
                    }, {
                      offset: 1, color: 'rgba(25, 137, 250, 0.1)'
                    }]
                  }
                }
              }]
            });
          }
        };

        const initTurnoverChart = () => {
          const dom = document.getElementById('chart-turnover');
          if (dom && categoryStats.value.length) {
            const categories = categoryStats.value.map(item => item.category || '未分类');
            const stocks = categoryStats.value.map(item => item.total_stock || 0);
            const counts = categoryStats.value.map(item => item.count || 0);
            
            echarts.init(dom).setOption({
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow'
                }
              },
              legend: {
                data: ['库存数量', '物资种类']
              },
              xAxis: {
                type: 'category',
                data: categories
              },
              yAxis: {
                type: 'value'
              },
              series: [
                {
                  name: '库存数量',
                  type: 'bar',
                  data: stocks,
                  itemStyle: {
                    color: '#1989fa'
                  }
                },
                {
                  name: '物资种类',
                  type: 'line',
                  data: counts,
                  itemStyle: {
                    color: '#ff976a'
                  }
                }
              ]
            });
          }
        };

        const loadTopCustomers = () => {
          topCustomers.value = [...customers.value]
            .sort((a, b) => Math.abs(b.balance || 0) - Math.abs(a.balance || 0))
            .slice(0, 10);
        };

        const exportPDF = async () => {
          try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(20);
            doc.text('脚手架租赁管理系统 - 数据统计报表', 20, 20);
            
            doc.setFontSize(12);
            doc.text('生成时间: ' + new Date().toLocaleString(), 20, 30);
            
            doc.setFontSize(14);
            doc.text('业务概览', 20, 45);
            
            doc.setFontSize(11);
            doc.text('日租金预计: ¥' + (stats.value.daily_income || 0).toFixed(2), 25, 55);
            doc.text('在外物资总数: ' + (stats.value.total_out || 0), 25, 62);
            doc.text('物资总数: ' + products.value.length, 25, 69);
            doc.text('客户总数: ' + customers.value.length, 25, 76);
            
            doc.setFontSize(14);
            doc.text('物资分类统计', 20, 90);
            
            let yPos = 100;
            categoryStats.value.forEach((item, index) => {
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }
              doc.setFontSize(11);
              doc.text((index + 1) + '. ' + (item.category || '未分类') + ': ' + item.total_stock + '个', 25, yPos);
              yPos += 7;
            });
            
            doc.save('数据统计报表_' + new Date().toISOString().split('T')[0] + '.pdf');
          } catch (e) {
            vant.showToast({
              message: '导出PDF失败: ' + e.message,
              position: 'top'
            });
          }
        };

        const generateCustomReport = async () => {
          try {
            reportLoading.value = true;
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            customReportData.value = {
              type: reportTypeText.value,
              dateRange: dateRangeText.value,
              dataType: dataTypeText.value,
              data: orderStats.value
            };
            
            nextTick(() => {
              const dom = document.getElementById('custom-report-chart');
              if (dom) {
                const chartType = reportTypeText.value === '柱状图' ? 'bar' : 
                                 reportTypeText.value === '折线图' ? 'line' : 'pie';
                
                const chartData = orderStats.value.map(item => ({
                  name: item.date,
                  value: item.count
                }));
                
                echarts.init(dom).setOption({
                  tooltip: {
                    trigger: chartType === 'pie' ? 'item' : 'axis'
                  },
                  xAxis: chartType === 'pie' ? undefined : {
                    type: 'category',
                    data: orderStats.value.map(item => item.date)
                  },
                  yAxis: chartType === 'pie' ? undefined : {
                    type: 'value'
                  },
                  series: [{
                    type: chartType,
                    data: chartData,
                    itemStyle: {
                      color: '#1989fa'
                    }
                  }]
                });
              }
            });
            
            vant.showToast({
              message: '报表生成成功',
              position: 'top'
            });
          } catch (e) {
            vant.showToast({
              message: '生成报表失败: ' + e.message,
              position: 'top'
            });
          } finally {
            reportLoading.value = false;
          }
        };

        const exportCustomReport = async () => {
          try {
            if (!customReportData.value) return;
            
            const data = customReportData.value.data;
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '报表数据');
            XLSX.writeFile(wb, '自定义报表_' + new Date().toISOString().split('T')[0] + '.xlsx');
            
            vant.showToast({
              message: '报表导出成功',
              position: 'top'
            });
          } catch (e) {
            vant.showToast({
              message: '导出报表失败: ' + e.message,
              position: 'top'
            });
          }
        };

        const createBackup = async () => {
          try {
            backupLoading.value = true;
            
            const backupData = {
              timestamp: new Date().toISOString(),
              products: products.value,
              customers: customers.value,
              categories: categories.value,
              customerCategories: customerCategories.value,
              sysConfig: sysConfig.value
            };
            
            const backupName = 'backup_' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
            const backupDate = new Date().toLocaleString();
            
            backupHistory.value.unshift({
              name: backupName,
              date: backupDate,
              data: backupData
            });
            
            if (backupHistory.value.length > 10) {
              backupHistory.value = backupHistory.value.slice(0, 10);
            }
            
            lastBackupTime.value = backupDate;
            
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = backupName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            vant.showToast({
              message: '备份创建成功',
              position: 'top'
            });
          } catch (e) {
            vant.showToast({
              message: '创建备份失败: ' + e.message,
              position: 'top'
            });
          } finally {
            backupLoading.value = false;
          }
        };

        const restoreBackup = async (index) => {
          try {
            const backup = backupHistory.value[index];
            if (!backup) return;
            
            await vant.showConfirmDialog({
              title: '确认恢复',
              message: '确定要恢复 ' + backup.date + ' 的备份吗？此操作将覆盖当前数据。'
            });
            
            vant.showLoadingToast({
              message: '正在恢复备份...',
              forbidClick: true
            });
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            products.value = backup.data.products || [];
            customers.value = backup.data.customers || [];
            categories.value = backup.data.categories || [];
            customerCategories.value = backup.data.customerCategories || [];
            sysConfig.value = backup.data.sysConfig || sysConfig.value;
            
            vant.showToast({
              message: '备份恢复成功',
              position: 'top'
            });
          } catch (e) {
            vant.showToast({
              message: '恢复备份失败: ' + e.message,
              position: 'top'
            });
          }
        };

        const setupTouchFeedback = () => {
          if (!touchFeedbackEnabled.value) return;
          
          const addTouchFeedback = (selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              el.addEventListener('touchstart', () => {
                el.style.opacity = '0.7';
              });
              el.addEventListener('touchend', () => {
                el.style.opacity = '1';
              });
            });
          };
          
          addTouchFeedback('.card');
          addTouchFeedback('.admin-card');
          addTouchFeedback('.van-button');
          addTouchFeedback('.van-cell');
        };

        const setupGestureSupport = () => {
          if (!gestureEnabled.value) return;
          
          let startX = 0;
          let startY = 0;
          let currentViewIndex = 0;
          const views = ['home', 'order', 'goods', 'customers'];
          
          const handleGesture = (e) => {
            if (currentView.value !== 'main') return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;
            
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
              if (diffX > 0 && currentViewIndex > 0) {
                currentViewIndex--;
                activeTab.value = views[currentViewIndex];
              } else if (diffX < 0 && currentViewIndex < views.length - 1) {
                currentViewIndex++;
                activeTab.value = views[currentViewIndex];
              }
              
              showGestureHint();
            }
          };
          
          document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
          });
          
          document.addEventListener('touchend', handleGesture);
        };

        const showGestureHint = () => {
          const hint = document.getElementById('gesture-hint');
          if (hint) {
            hint.classList.add('show');
            setTimeout(() => {
              hint.classList.remove('show');
            }, 1500);
          }
        };

        const optimizeMobileNavigation = () => {
          const tabbar = document.querySelector('.van-tabbar');
          if (tabbar) {
            tabbar.style.paddingBottom = 'env(safe-area-inset-bottom)';
          }
          
          const inputs = document.querySelectorAll('input, textarea');
          inputs.forEach(input => {
            input.style.fontSize = '16px';
          });
        };



        const openGoodsEditorPage = (p) => {
          if (p) {
            prodForm.value = {...p};
            const category = categories.value.find(c => c.id === p.category_id);
            prodForm.value.category_name = category ? category.name : '';
          } else {
            prodForm.value = {name:'', spec:'', unit:'个', total_stock:0, daily_rent_price:0, unit_price:0, category_id:0, deposit_price:0, weight:0, min_stock:0, category_name:''};
          }
          goToPage('goods_edit');
        };

        const saveProd = async () => {
          await fetch(API+"/products",{method:prodForm.value.id?'PUT':'POST',body:JSON.stringify(prodForm.value)});
          goToPage('admin_goods_mgr');
          loadData();
        };

        const deleteProd = async () => {
          if(confirm('确认删除?')){
            await fetch(API+"/products?id="+prodForm.value.id,{method:"DELETE"});
            goToPage('admin_goods_mgr');
            loadData();
          }
        };

        const toggleProductSelection = (productId) => {
          const index = selectedProducts.value.indexOf(productId);
          if (index > -1) {
            selectedProducts.value.splice(index, 1);
          } else {
            selectedProducts.value.push(productId);
          }
        };

        const batchDeleteProducts = async () => {
          for (const productId of selectedProducts.value) {
            await fetch(API+"/products?id="+productId,{method:"DELETE"});
          }
          selectedProducts.value = [];
          showBatchDeleteDialog.value = false;
          loadData();
        };

        const onPickBatchCategory = ({ selectedOptions }) => {
          if(selectedOptions[0]){
            batchForm.value.category_id = selectedOptions[0].value;
            const category = categories.value.find(c => c.id === selectedOptions[0].value);
            batchForm.value.category_name = category ? category.name : '';
          }
          showBatchCategoryPicker.value = false;
        };

        const batchUpdateProducts = async () => {
          if (selectedProducts.value.length === 0) {
            vant.showFailToast('请选择物资');
            return;
          }
          
          const batchData = { ...batchForm.value };
          
          for (const productId of selectedProducts.value) {
            try {
              const product = products.value.find(p => p.id === productId);
              if (!product) continue;
              
              const updateData = {
                id: productId,
                name: product.name,
                spec: product.spec,
                total_stock: product.total_stock,
                daily_rent_price: product.daily_rent_price,
                unit_price: product.unit_price,
                category_id: product.category_id,
                deposit_price: product.deposit_price,
                unit: product.unit,
                weight: product.weight,
                min_stock: product.min_stock
              };
              
              if (batchData.daily_rent_price) updateData.daily_rent_price = Number(batchData.daily_rent_price);
              if (batchData.unit_price) updateData.unit_price = Number(batchData.unit_price);
              if (batchData.unit) updateData.unit = batchData.unit;
              if (batchData.category_id) updateData.category_id = batchData.category_id;
              
              if (batchData.stock_change) {
                updateData.total_stock = product.total_stock + Number(batchData.stock_change);
                if (updateData.total_stock < 0) updateData.total_stock = 0;
              }
              
              await fetch(API+"/products", { method: "PUT", body: JSON.stringify(updateData) });
            } catch (e) {
              console.error('批量更新失败:', e);
            }
          }
          
          batchForm.value = {};
          selectedProducts.value = [];
          showBatchEditDialog.value = false;
          
          await loadData();
          vant.showSuccessToast('成功更新物资');
        };

        const showDistribution = async(p)=>{
          distList.value=await fetch(API+"/products/"+p.id+"/distribution").then(r=>r.json());
          showDist.value=true;
        };

        const openCustEditorPage = (c) => {
          if (c) {
            custForm.value = {...c};
            const category = customerCategories.value.find(cc => cc.id === c.category_id);
            custForm.value.category_name = category ? category.name : '';
            custForm.value.credit_level_text = getCreditLevelText(c.credit_level);
          } else {
            custForm.value = {
              name:'', 
              contact:'', 
              address:'', 
              id_card:'', 
              project_name:'', 
              notes:'',
              category_id: 0,
              category_name: '',
              credit_level: 'NORMAL',
              credit_level_text: '普通'
            };
          }
          goToPage('cust_edit');
        };

        const saveCustomer = async () => {
          await fetch(API+"/customers",{method:custForm.value.id?'PUT':'POST',body:JSON.stringify(custForm.value)});
          goToPage('admin_cust_mgr');
          loadData();
        };

        const toggleCustomerSelection = (customerId) => {
          const index = selectedCustomers.value.indexOf(customerId);
          if (index > -1) {
            selectedCustomers.value.splice(index, 1);
          } else {
            selectedCustomers.value.push(customerId);
          }
        };

        const batchDeleteCustomers = async () => {
          for (const customerId of selectedCustomers.value) {
            await fetch(API+"/customers?id="+customerId,{method:"DELETE"});
          }
          selectedCustomers.value = [];
          showCustBatchDeleteDialog.value = false;
          loadData();
        };

        const openProjectPage = async (c) => {
          proData.value = await fetch(API+"/customers/"+c.id+"/financial").then(r=>r.json());
          goToPage('project_detail');
        };

        const onPickCust = ({ selectedOptions }) => {
          if(selectedOptions[0]){
            selectedCustomerName.value = selectedOptions[0].text;
            selectedCustomerId.value = selectedOptions[0].value;
          }
          showCustPicker.value = false;
        };

        const onPickCategory = ({ selectedOptions }) => {
          if(selectedOptions[0]){
            prodForm.value.category_name = selectedOptions[0].text;
            prodForm.value.category_id = selectedOptions[0].value;
          }
          showCategoryPicker.value = false;
        };

        const onPickCustCategory = ({ selectedOptions }) => {
          if(selectedOptions[0]){
            custForm.value.category_name = selectedOptions[0].text;
            custForm.value.category_id = selectedOptions[0].value;
          }
          showCustCategoryPicker.value = false;
        };

        const onPickCreditLevel = ({ selectedOptions }) => {
          if(selectedOptions[0]){
            custForm.value.credit_level_text = selectedOptions[0].text;
            custForm.value.credit_level = selectedOptions[0].value;
          }
          showCreditLevelPicker.value = false;
        };

        const openCategoryMgr = () => {
          categoryForm.value = {};
          showCategoryMgr.value = true;
        };

        const openCustCategoryMgr = () => {
          custCategoryForm.value = {};
          showCustCategoryMgr.value = true;
        };

        const saveCustCategory = async () => {
          if (!custCategoryForm.value.name) {
            vant.showFailToast('请输入分类名称');
            return;
          }
          await fetch(API+"/customer-categories",{method:custCategoryForm.value.id?'PUT':'POST',body:JSON.stringify(custCategoryForm.value)});
          showCustCategoryMgr.value = false;
          await loadData();
          vant.showSuccessToast('保存成功');
        };

        const saveCategory = async () => {
          await fetch(API+"/categories",{method:categoryForm.value.id?'PUT':'POST',body:JSON.stringify(categoryForm.value)});
          showCategoryMgr.value = false;
          loadData();
        };

        const editCategory = (c) => {
          categoryForm.value = { ...c };
        };

        const deleteCategory = async (id) => {
          if (confirm('确认删除该分类？')) {
            await fetch(API + "/categories?id=" + id, { method: "DELETE" });
            await loadData();
            vant.showSuccessToast('删除成功');
          }
        };

        const openRepairRecord = async (p) => {
          try {
            if (p) {
              const res = await fetch(API + "/product-repairs?product_id=" + p.id);
              repairRecords.value = await res.json();
            } else {
              const res = await fetch(API + "/product-repairs");
              repairRecords.value = await res.json();
            }
          } catch (e) {
            repairRecords.value = [];
          }
          goToPage('repair_record');
        };

        const openRepairEditor = (r) => {
          if (r) {
            repairForm.value = {...r};
          } else {
            repairForm.value = {product_id:0, product_name:'', description:'', cost:0, status:'PENDING'};
          }
          goToPage('repair_edit');
        };

        const saveRepair = async () => {
          await fetch(API+"/product-repairs",{method:repairForm.value.id?'PUT':'POST',body:JSON.stringify(repairForm.value)});
          goToPage('repair_record');
        };

        const addToCart = (p) => {
          if (!cart.value.find(x => x.id === p.id)) {
            cart.value.push({ ...p, qty: 1 });
          }
          showProdPicker.value = false;
        };

        const toggleBatchProductSelection = (productId) => {
          const index = selectedBatchProducts.value.indexOf(productId);
          if (index > -1) {
            selectedBatchProducts.value.splice(index, 1);
          } else {
            selectedBatchProducts.value.push(productId);
          }
        };

        const addSelectedProducts = () => {
          if (selectedBatchProducts.value.length === 0) {
            vant.showFailToast('请选择物资');
            return;
          }
          
          const selectedItems = products.value.filter(p => selectedBatchProducts.value.includes(p.id));
          for (const item of selectedItems) {
            if (!cart.value.find(x => x.id === item.id)) {
              cart.value.push({ ...item, qty: 1 });
            }
          }
          
          selectedBatchProducts.value = [];
          batchSearchText.value = '';
          showBatchProdPicker.value = false;
          vant.showSuccessToast('成功添加物资');
        };

        const submitOrder = async () => {
          if(!selectedCustomerId.value || !cart.value.length) return vant.showFailToast('请完善单据');
          loading.value = true;
          const payload = { 
            customer_id: selectedCustomerId.value, 
            type: orderType.value, 
            note: orderNote.value, 
            deposit: Number(orderDeposit.value), 
            items: cart.value.map(x=>({product_id:x.id, qty:x.qty, daily_rent_price: x.daily_rent_price})) 
          };
          const res = await fetch(API+"/orders", {method:"POST", body:JSON.stringify(payload)});
          if(res.ok) {
            await loadData();
            cart.value = [];
            orderDeposit.value=0;
            showOrderDetailPage(stats.value.recent_orders[0]?.id);
          }
          loading.value = false;
        };

        const showOrderDetailPage = async(id)=>{
          try {
            curOrder.value = await fetch(API+"/orders/"+id).then(r=>r.json());
            goToPage('order_detail');
          } catch(e) {}
        };

        const doAdminAuth = async () => {
          if (!adminPwdInput.value) {
            authErrorMsg.value = '请输入管理密码';
            return;
          }
          authLoading.value = true;
          try {
            const res = await fetch(API+"/auth", { method:'POST', body:JSON.stringify({ pwd: adminPwdInput.value }) });
            const data = await res.json();
            if(data.success) {
              configForm.value = { ...sysConfig.value, old_pwd: adminPwdInput.value, new_pwd: '', confirm_pwd: '' };
              authErrorMsg.value = '';
              goToPage('admin_panel');
            } else {
              authErrorMsg.value = '密码错误';
            }
          } catch(e) {
            authErrorMsg.value = '网络错误，请检查连接';
          } finally {
            authLoading.value = false;
          }
        };

        const saveConfig = async () => {
          if (!configForm.value.sys_name) {
            vant.showFailToast('请输入系统名称');
            return;
          }
          if (!configForm.value.old_pwd) {
            vant.showFailToast('请输入当前密码');
            return;
          }
          if (configForm.value.new_pwd && configForm.value.new_pwd !== configForm.value.confirm_pwd) {
            vant.showFailToast('两次输入的新密码不一致');
            return;
          }
          configLoading.value = true;
          try {
            const res = await fetch(API+"/config", { method:'POST', body:JSON.stringify(configForm.value) });
            const data = await res.json();
            if(data.success) {
              vant.showSuccessToast('保存成功');
              await loadData();
              goBack();
            } else {
              vant.showFailToast(data.error || '保存失败');
            }
          } catch(e) {
            vant.showFailToast('网络错误，请检查连接');
          } finally {
            configLoading.value = false;
          }
        };

        const autoPrefix = () => {
          if (configForm.value.sys_name && !configForm.value.order_prefix) {
            configForm.value.order_prefix = 'JSJ';
          }
        };

        const savePayment = async () => {
          try {
            await fetch(API+"/payments",{method:"POST",body:JSON.stringify({customer_id:proData.value.cust.id,amount:Number(payForm.value.amount),note:payForm.value.note})});
            openProjectPage(proData.value.cust);
            loadData();
            showPayDialog.value=false;
            vant.showSuccessToast('收款成功');
          } catch(e) {
            vant.showFailToast('网络错误');
          }
        };

        const exportExcel = () => {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ 客户: proData.value.cust.name, 余额: proData.value.cust.balance }]), "概览");
          if (proData.value.stocks.length) {
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(proData.value.stocks.map(s => ({ 物资: s.name, 规格: s.spec, 数量: s.quantity, 原值: s.unit_price }))), "清单");
          }
          XLSX.writeFile(wb, proData.value.cust.name + ".xlsx");
        };

        const generateImage = async () => {
          const el = document.getElementById('capture-area');
          try {
            const canvas = await html2canvas(el, { scale: 2 });
            imgUrl.value = canvas.toDataURL("image/png");
            showImgDialog.value = true;
          } catch(e) {
            vant.showFailToast('失败');
          }
        };

        const exportOrderPDF = async () => {
          const el = document.getElementById('capture-area');
          try {
            const canvas = await html2canvas(el, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            // 计算PDF尺寸
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
            }
            
            pdf.save('订单_' + curOrder.value.order_no + '.pdf');
            vant.showSuccessToast('PDF导出成功');
          } catch(e) {
            console.error('PDF导出失败:', e);
            vant.showFailToast('PDF导出失败');
          }
        };

        const printOrder = () => {
          const el = document.getElementById('capture-area');
          const originalContent = document.body.innerHTML;
          
          try {
            // 创建打印窗口
            const printWindow = window.open('', '_blank');
            printWindow.document.write('<html><head><title>订单打印</title>');
            printWindow.document.write('<style>');
            printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
            printWindow.document.write('.bill-wrapper { max-width: 800px; margin: 0 auto; }');
            printWindow.document.write('.detail-table { width: 100%; border-collapse: collapse; }');
            printWindow.document.write('.detail-table th, .detail-table td { border: 1px solid #ddd; padding: 8px; }');
            printWindow.document.write('</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(el.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            
            // 执行打印
            printWindow.print();
            printWindow.close();
          } catch (e) {
            console.error('打印失败:', e);
            vant.showFailToast('打印失败');
          }
        };

        const exportData = async (type) => {
          exportLoading.value = true;
          try {
            const res = await fetch(API + "/export?type=" + type);
            if (!res.ok) {
              throw new Error('导出失败');
            }
            const data = await res.json();
            if (!data || data.length === 0) {
              vant.showFailToast('没有可导出的数据');
              return;
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = type + '_' + new Date().toISOString().split('T')[0] + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            vant.showSuccessToast('导出成功');
          } catch(e) {
            vant.showFailToast('导出失败：' + e.message);
          } finally {
            exportLoading.value = false;
          }
        };

        const importData = async (event) => {
          const file = event.target.files[0];
          if (!file) return;
          importLoading.value = true;
          try {
            const reader = new FileReader();
            reader.onload = async (e) => {
              try {
                const data = JSON.parse(e.target.result);
                if (!Array.isArray(data) || data.length === 0) {
                  vant.showFailToast('文件格式错误或数据为空');
                  return;
                }
                let type = '';
                const firstItem = data[0];
                if (firstItem.name && firstItem.total_stock !== undefined) {
                  type = 'products';
                } else if (firstItem.name && firstItem.balance !== undefined) {
                  type = 'customers';
                } else {
                  vant.showFailToast('文件格式错误');
                  return;
                }
                const res = await fetch(API + "/import", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ type, data })
                });
                const result = await res.json();
                if (result.success) {
                  vant.showSuccessToast('导入成功，共导入 ' + data.length + ' 条数据');
                  await loadData();
                } else {
                  vant.showFailToast('导入失败');
                }
              } catch(e) {
                vant.showFailToast('文件格式错误：' + e.message);
              } finally {
                importLoading.value = false;
              }
            };
            reader.readAsText(file);
          } catch(e) {
            vant.showFailToast('导入失败：' + e.message);
            importLoading.value = false;
          }
          event.target.value = '';
        };

        onMounted(() => {
          loadData();
          setupTouchFeedback();
          setupGestureSupport();
          optimizeMobileNavigation();
        });

        return {
          currentView, activeTab, stats, products, customers, cart, orderType, orderNote, orderDeposit, selectedCustomerName, selectedCustomerId,
          proTabActive, proData, showCustPicker, showProdPicker, showDist, showPayDialog, showImgDialog, showCategoryPicker, showCategoryMgr, showProductPicker, showBatchDeleteDialog, showCustBatchDeleteDialog, selectedProducts, selectedCustomers, custSearchText,
          custForm, prodForm, curOrder, distList, payForm, searchText, imgUrl, loading, sysConfig, configForm, adminPwdInput, authErrorMsg, authLoading, configLoading, exportLoading, importLoading, categoryForm, categories, repairForm, repairRecords, refreshing, batchSearchText, selectedBatchProducts, showBatchProdPicker,
          custColumns: computed(()=>customers.value.map(c=>({text:c.name,value:c.id}))),
          categoryColumns: computed(()=>categories.value.map(c=>({text:c.name,value:c.id}))),
          filteredProducts: computed(()=>products.value.filter(p=>(p.name+(p.spec||'')+(p.category_name||'')).toLowerCase().includes(searchText.value.toLowerCase()))),
          filteredCustomers: computed(()=>customers.value.filter(c=>(c.name+(c.contact||'')+(c.project_name||'')).toLowerCase().includes(custSearchText.value.toLowerCase()))),
          batchFilteredProducts: computed(()=>products.value.filter(p=>(p.name+(p.spec||'')).toLowerCase().includes(batchSearchText.value.toLowerCase()))),
          custCategoryColumns: computed(()=>customerCategories.value.map(c=>({text:c.name,value:c.id}))),
          creditLevelColumns: computed(()=>[
            { text: '优秀', value: 'EXCELLENT' },
            { text: '良好', value: 'GOOD' },
            { text: '普通', value: 'NORMAL' },
            { text: '较差', value: 'POOR' }
          ]),
          onPickCust, onPickCategory, addToCart, submitOrder, loadData, onTabChange: (name)=>{ if(name==='home') nextTick(initPie); loadData(); },
          goToPage, goBack, enterGoodsMgr, enterCustMgr, openGoodsEditorPage, saveProd, deleteProd, openCustEditorPage, saveCustomer, openProjectPage,
          savePayment, showOrderDetailPage, exportExcel, generateImage, exportOrderPDF, printOrder, showDistribution,
          doAdminAuth, saveConfig, autoPrefix, openCategoryMgr, saveCategory, editCategory, deleteCategory, exportData, importData,
          openRepairRecord, openRepairEditor, saveRepair,
          toggleProductSelection, batchDeleteProducts, batchUpdateProducts,
          toggleCustomerSelection, batchDeleteCustomers,
          toggleBatchProductSelection, addSelectedProducts,
          onRefresh,
          onPickCustCategory, onPickCreditLevel, openCustCategoryMgr, saveCustCategory,
          onPickBatchCategory,
          getCreditLevelColor, getCreditLevelText, getCreditLevelBadge,
          customerCategories, showCustCategoryPicker, showCreditLevelPicker, showCustCategoryMgr, custCategoryForm,
          showBatchEditDialog, showBatchCategoryPicker, batchForm,
          statsActiveTab, categoryStats, customerCategoryStats, creditStats, orderStats,
          loadStatsData, initOrderTrendChart, initCategoryChart, initCustomerCategoryChart, initCreditChart,
          topCustomers, reportTypeText, dateRangeText, dataTypeText, showReportTypePicker, showDatePicker, showDataTypePicker, reportLoading, customReportData,
          generateCustomReport, exportCustomReport, exportPDF,
          autoBackupEnabled, backupInterval, backupLoading, lastBackupTime, backupHistory, showRestoreDialog,
          createBackup, restoreBackup,
          initIncomeTrendChart, initTurnoverChart,
          touchFeedbackEnabled, gestureEnabled,
          setupTouchFeedback, setupGestureSupport, optimizeMobileNavigation, showGestureHint
        };
      }
    }).use(vant).mount("#app");
    // 禁用Cloudflare Insights
    window['__cfBeacon'] = function(){};
  </script>
</body>
</html>`;
    return new Response(html, { headers: { "content-type": "text/html;charset=UTF-8" } });
  }
};
/* eslint-enable */