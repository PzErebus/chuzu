export default {
  async fetch() {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>脚手架管家</title>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<link rel="stylesheet" href="https://unpkg.com/vant@3/lib/index.css" />
<script src="https://unpkg.com/vant@3/lib/vant.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<style>
body{background:#f7f8fa;padding-bottom:80px;font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif;}
.card{background:white;border-radius:12px;margin:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);position:relative;}
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px;}
.stat-card{background:linear-gradient(135deg,#3a7bd5,#00d2ff);color:white;padding:16px;border-radius:12px;}
.stat-card.orange{background:linear-gradient(135deg,#FF8008,#FFC837);}
.text-red{color:#ee0a24;font-weight:bold;}
.text-green{color:#07c160;font-weight:bold;}
.full-page-editor { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #f7f8fa; z-index: 9999; overflow-y: auto; padding-bottom: 80px; }
.rent-input { width: 50px; border: none; border-bottom: 1px solid #1989fa; text-align: center; color: #1989fa; font-weight: bold; background:transparent;}

/* 单据 UI */
.bill-wrapper { background: white; padding: 20px; border-radius: 8px; }
.bill-title { text-align:center; font-size:20px; font-weight:900; margin-bottom:15px; color:#000; border-bottom: 2px solid #000; padding-bottom: 10px; }
.logistics-box { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px; background: #f8f8f8; padding: 10px; border-radius: 6px; border: 1px solid #eee; }
.log-item { width: 48%; }
.log-label { font-weight: bold; color: #333; margin-bottom: 4px; display: block; border-bottom: 1px solid #ddd; padding-bottom: 2px; }
.bill-header { margin-bottom: 10px; font-size: 13px; color: #333; border-top: 1px dashed #ccc; padding-top:10px; }
.detail-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 5px; }
.detail-table th { text-align: left; border-bottom: 2px solid #333; padding: 8px 4px; }
.detail-table td { border-bottom: 1px solid #eee; padding: 10px 4px; vertical-align: middle; }
</style>
</head>
<body>
<div id="app">
  <van-nav-bar :title="sysConfig.sys_name || '脚手架管家'" fixed placeholder></van-nav-bar>

  <div v-show="activeTab === 'home'">
    <div class="stat-grid">
      <div class="stat-card"><div>日租金预计</div><div style="font-size:18px;font-weight:bold">¥ {{ (stats.daily_income || 0).toFixed(2) }}</div></div>
      <div class="stat-card orange"><div>在外总数</div><div style="font-size:18px;font-weight:bold">{{ stats.total_out || 0 }}</div></div>
    </div>
    <div class="card"><b>📊 资产概览</b><div id="chart-pie" style="width:100%;height:220px;margin-top:10px;"></div></div>
    <div class="card"><b>📋 最近单据</b>
      <van-list><van-cell v-for="o in stats.recent_orders" :key="o.id" :title="o.customer_name" :label="o.order_date.substring(5,16)" is-link @click="showOrderDetail(o.id)">
        <template #value>
            <div style="font-size:11px;color:#999">{{ o.order_no || '#'+o.id }}</div>
            <van-tag :type="o.type==='OUT'?'primary':'success'">{{o.type==='OUT'?'送货':'收货'}}</van-tag>
        </template>
      </van-cell></van-list>
    </div>
  </div>

  <div v-show="activeTab === 'order'">
    <div class="card">
      <van-field v-model="selectedCustomerName" is-link readonly label="项目客户" @click="showCustPicker=true" placeholder="点击选择"></van-field>
      <van-field v-model="orderDeposit" type="number" label="本次押金" placeholder="0.00"></van-field>
      <van-radio-group v-model="orderType" direction="horizontal" style="padding:15px 0" @change="cart=[]">
        <van-radio name="OUT">📤 送货出库</van-radio><van-radio name="IN">📥 收货入库</van-radio>
      </van-radio-group>
      <van-field v-model="orderNote" label="备注" placeholder="工地/车牌"></van-field>
    </div>
    <div class="card" v-if="cart.length">
      <div v-for="(item,idx) in cart" :key="idx" style="margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:10px">
        <div style="display:flex;justify-content:space-between"><b>{{item.name}}</b><van-icon name="cross" @click="cart.splice(idx,1)"/></div>
        <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
           <div>租金: <input v-model.number="item.daily_rent_price" class="rent-input">/天</div>
           <van-stepper v-model="item.qty" min="1" integer :max="orderType==='OUT'?item.total_stock:999999"/>
        </div>
      </div>
      <van-button block type="primary" size="large" @click="submitOrder" :loading="loading">提交并生成单据</van-button>
    </div>
    <div style="padding:15px" v-if="selectedCustomerId"><van-button block plain type="primary" icon="plus" @click="showProdPicker=true">添加明细</van-button></div>
  </div>

  <div v-show="activeTab === 'goods'">
    <div class="card" style="padding:10px">
      <van-search v-model="searchText" placeholder="搜物资名/规格"></van-search>
      <van-button size="small" type="primary" block @click="openHardEditor(null)" style="margin:10px 0">+ 新增物资</van-button>
      <van-list>
        <van-cell v-for="p in filteredProducts" :key="p.id" :title="p.name" :value="'库:'+p.total_stock" is-link @click="showDistribution(p)">
          <template #label>{{p.spec}} | <span class="text-red">日租:¥{{p.daily_rent_price}}</span></template>
          <template #right-icon><van-icon name="edit" color="#1989fa" size="22" @click.stop="openHardEditor(p)" style="padding-left:10px;"/></template>
        </van-cell>
      </van-list>
    </div>
  </div>

  <div v-show="activeTab === 'customers'"><div class="card"><van-button block size="small" type="primary" @click="openCustEditor(null)" style="margin-bottom:10px">+ 新增项目客户</van-button><van-list><van-cell v-for="c in customers" :key="c.id" :title="c.name" :value="'¥'+Math.abs(c.balance||0).toFixed(2)" :value-class="c.balance>=0?'text-green':'text-red'" is-link @click="openCustomerPro(c)"><template #right-icon><van-icon name="edit" color="#1989fa" size="20" style="margin-left:10px" @click.stop="openCustEditor(c)" /></template></van-cell></van-list></div></div>

  <van-tabbar v-model="activeTab" fixed placeholder @change="onTabChange">
    <van-tabbar-item name="home" icon="home-o">首页</van-tabbar-item><van-tabbar-item name="order" icon="edit">开单</van-tabbar-item><van-tabbar-item name="goods" icon="apps-o">物资</van-tabbar-item><van-tabbar-item name="customers" icon="manager-o">客户</van-tabbar-item>
  </van-tabbar>

  <div v-if="showHardEditor" class="full-page-editor">
    <van-nav-bar title="物资资料维护" left-text="返回" left-arrow @click-left="showHardEditor=false"></van-nav-bar>
    <van-cell-group inset style="margin-top:20px">
        <van-field v-model="prodForm.name" label="物资名称" placeholder="如: 钢管" required />
        <van-field v-model="prodForm.spec" label="规格型号" placeholder="如: 3米" />
        <van-field v-model="prodForm.total_stock" type="number" label="库房总数" placeholder="0" />
        <van-field v-model="prodForm.daily_rent_price" type="number" label="日租赁费" placeholder="0.00" />
    </van-cell-group>
    <div style="margin:30px 20px">
        <van-button block type="primary" @click="saveProd" :loading="loading">保存资料</van-button>
        <van-button v-if="prodForm.id" block type="danger" plain style="margin-top:15px" @click="deleteProd">删除此物资</van-button>
    </div>
  </div>

  <van-dialog v-model:show="showOrderInfo" :title="null" :show-confirm-button="false" close-on-click-overlay width="95%"><div id="capture-area" class="bill-wrapper"><div class="bill-title">{{ sysConfig.factory_name || '单据详情' }} - {{ curOrder.type==='OUT'?'送货单':'收货单' }}</div><div class="logistics-box"><div class="log-item"><span class="log-label">📍 发货方</span><div style="font-size:12px;color:#555">{{ sysConfig.contact_info || '未设置' }}</div></div><div class="log-item"><span class="log-label">👤 收货方</span><div style="font-weight:bold">{{ curOrder.customer_name }}</div><div style="font-size:12px;color:#555" v-if="curOrder.customer_contact">📞 {{ curOrder.customer_contact }}</div><div style="font-size:12px;color:#555" v-if="curOrder.customer_address">🏠 {{ curOrder.customer_address }}</div></div></div><div class="bill-header"><div style="display:flex;justify-content:space-between"><span>单号：{{ curOrder.order_no || '#'+curOrder.id }}</span><span>日期：{{ curOrder.order_date }}</span></div><div style="margin-top:5px;border-top:1px dashed #ccc;padding-top:5px">备注：{{ curOrder.note || '无' }}</div></div><table class="detail-table"><thead><tr><th style="width:50%">物资</th><th style="width:30%">规格</th><th style="width:20%;text-align:right">数量</th></tr></thead><tbody><tr v-for="i in curOrder.items" :key="i.name"><td><b>{{ i.name }}</b></td><td>{{ i.spec || '-' }}</td><td style="text-align:right;font-weight:bold">{{ i.quantity }}</td></tr></tbody></table><div style="margin-top:25px;text-align:center;font-size:12px;color:#999;padding-top:10px">—— 签字生效 ——</div></div><div style="padding:15px;display:flex;gap:10px"><van-button block plain type="primary" @click="generateImage">保存图片</van-button><van-button block type="danger" @click="showOrderInfo=false">关闭</van-button></div></van-dialog>
  <van-dialog v-model:show="showCustForm" :title="custForm.id ? '编辑资料' : '新增客户'" show-cancel-button @confirm="saveCustomer"><van-cell-group inset><van-field v-model="custForm.name" label="姓名" required /><van-field v-model="custForm.contact" label="电话" /><van-field v-model="custForm.address" label="送货地址" type="textarea" rows="2" autosize /></van-cell-group></van-dialog>
  <van-popup v-model:show="showProDetail" position="right" style="width:100%;height:100%"><van-nav-bar :title="proData.cust?.name" left-arrow @click-left="showProDetail=false"></van-nav-bar><div style="padding:10px;font-size:13px;color:#666;background:white" v-if="proData.cust"><div>电话：{{proData.cust.contact||'--'}} | 地址：{{proData.cust.address||'--'}}</div></div><van-tabs v-model:active="proTabActive" sticky><van-tab title="📦 在租"><div class="card"><van-cell v-for="s in proData.stocks" :key="s.name" :title="s.name" :value="s.quantity+'个'" :label="'日租金:¥'+(s.cost||0).toFixed(2)"/></div></van-tab><van-tab title="💰 账目"><div class="card"><div style="padding:10px;background:#fff9eb;border-radius:8px"><div style="display:flex;justify-content:space-between"><span>余额:</span><span :class="proData.cust?.balance>=0?'text-green':'text-red'">¥{{proData.cust?.balance.toFixed(2)}}</span></div></div><div style="display:flex;gap:10px;margin:15px 0"><van-button type="success" block plain size="small" @click="exportExcel">报表</van-button><van-button type="primary" block size="small" @click="showPayDialog=true">收款</van-button></div><van-cell v-for="p in proData.payments" :key="p.id" :title="p.note" :label="p.pay_date" :value="'¥'+p.amount"/></div></van-tab><van-tab title="📄 单据"><div class="card"><van-cell v-for="o in proData.orders" :key="o.id" :title="o.order_no || '#'+o.id" :label="o.order_date" is-link @click="showOrderDetail(o.id)"/></div></van-tab></van-tabs></van-popup>
  <van-dialog v-model:show="showImgDialog" title="长按保存" confirm-button-text="确定"><div style="padding:10px;text-align:center;"><img :src="imgUrl" style="width:100%;border:1px solid #eee;"></div></van-dialog>
  <van-popup v-model:show="showDist" position="bottom" round closeable style="height:45%"><div style="padding:20px"><h3>物资分布</h3><van-cell v-for="h in distList" :key="h.name" :title="h.name" :value="h.quantity+'个'" /></div></van-popup>
  <van-popup v-model:show="showProdPicker" position="bottom" round style="height:70%"><van-cell v-for="p in products" :key="p.id" :title="p.name" :label="'库:'+p.total_stock" is-link @click="addToCart(p)"/></van-popup>
  <van-popup v-model:show="showCustPicker" position="bottom" round><van-picker :columns="custColumns" @confirm="onPickCust" @cancel="showCustPicker=false" title="客户清单"/></van-picker></van-popup>
  <van-dialog v-model:show="showPayDialog" title="收款登记" show-cancel-button @confirm="savePayment"><van-field v-model="payForm.amount" type="number" label="金额" /><van-field v-model="payForm.note" label="摘要" /></van-dialog>
  <van-dialog v-model:show="showReceipt" title="✅ 保存成功" :show-confirm-button="false"><div style="padding:20px;text-align:center"><van-icon name="checked" color="#07c160" size="50"></van-icon><p>单据已同步</p><div style="display:flex;gap:10px;margin-top:20px"><van-button block plain @click="showReceipt=false">关闭</van-button><van-button block type="primary" @click="viewCurrentOrder">打印</van-button></div></div></van-dialog>
</div>

<script>
const { createApp, ref, onMounted, nextTick, computed } = Vue;

const CONFIG = {
  API_URL: window.API_URL || "https://api.xxlb.us.ci",
  DATABASE_ID: "8b4af057-f746-4bb2-983f-579bf0e45f76",
  APP_NAME: "脚手架管家",
  VERSION: "2.0.0",
  ENVIRONMENT: window.ENVIRONMENT || "production",
  VANT_VERSION: "3.x",
  CACHE_DURATION: 5 * 60 * 1000,
  MAX_REQUEST_SIZE: 1024 * 1024,
  VALIDATION: {
    CUSTOMER_NAME_MIN_LENGTH: 1,
    CUSTOMER_NAME_MAX_LENGTH: 50,
    PRODUCT_NAME_MIN_LENGTH: 1,
    PRODUCT_NAME_MAX_LENGTH: 100,
    CONTACT_MAX_LENGTH: 20,
    ADDRESS_MAX_LENGTH: 200
  },
  SECURITY: {
    ENABLE_CSRF_PROTECTION: true,
    ENABLE_INPUT_SANITIZATION: true,
    ENABLE_ERROR_LOGGING: true,
    MAX_ERROR_LOGS: 100
  }
};

const ErrorHandler = {
  errorTypes: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  },

  errorMessages: {
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    VALIDATION_ERROR: '输入数据无效，请检查后重试',
    SERVER_ERROR: '服务器错误，请稍后重试',
    AUTH_ERROR: '认证失败，请重新登录',
    NOT_FOUND_ERROR: '请求的资源不存在',
    PERMISSION_ERROR: '权限不足，请检查访问权限',
    UNKNOWN_ERROR: '操作失败，请重试'
  },

  handle(error, context = '') {
    if (!error) {
      return { type: 'UNKNOWN_ERROR', message: '未知错误' };
    }

    const errorType = this.getErrorType(error);
    const message = this.getErrorMessage(error, errorType);
    
    this.log(error, context, errorType);
    this.showUserMessage(message, errorType);
    
    return {
      type: errorType,
      message,
      originalError: error,
      context
    };
  },

  getErrorType(error) {
    if (!error) return this.errorTypes.UNKNOWN_ERROR;
    
    const errorMessage = error.message || error.toString();
    
    if (error.name === 'TypeError' && errorMessage.includes('fetch')) {
      return this.errorTypes.NETWORK_ERROR;
    }
    
    if (error.name === 'TypeError' && errorMessage.includes('validation')) {
      return this.errorTypes.VALIDATION_ERROR;
    }
    
    if (errorMessage && (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('认证'))) {
      return this.errorTypes.AUTH_ERROR;
    }
    
    if (errorMessage && (errorMessage.includes('404') || errorMessage.includes('not found'))) {
      return this.errorTypes.NOT_FOUND_ERROR;
    }
    
    if (errorMessage && (errorMessage.includes('403') || errorMessage.includes('forbidden') || errorMessage.includes('permission'))) {
      return this.errorTypes.PERMISSION_ERROR;
    }
    
    if (errorMessage && (errorMessage.includes('500') || errorMessage.includes('server'))) {
      return this.errorTypes.SERVER_ERROR;
    }
    
    if (errorMessage && errorMessage.includes('validation')) {
      return this.errorTypes.VALIDATION_ERROR;
    }
    
    return this.errorTypes.UNKNOWN_ERROR;
  },

  getErrorMessage(error, errorType) {
    if (error.message && typeof error.message === 'string') {
      return error.message;
    }
    return this.errorMessages[errorType] || this.errorMessages.UNKNOWN_ERROR;
  },

  log(error, context, errorType) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      errorType,
      context,
      message: error.message || error.toString(),
      stack: error.stack
    };
    
    console.error('[ErrorHandler] ' + context + ':', logEntry);
    
    this.saveToLocalStorage(logEntry);
  },

  saveToLocalStorage(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      logs.push(logEntry);
      
      if (logs.length > 100) {
        logs.shift();
      }
      
      localStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  },

  showUserMessage(message, errorType) {
    if (typeof window !== 'undefined' && window.vant) {
      switch (errorType) {
        case this.errorTypes.NETWORK_ERROR:
          window.vant.showFailToast(message);
          break;
        case this.errorTypes.VALIDATION_ERROR:
          window.vant.showFailToast(message);
          break;
        case this.errorTypes.SERVER_ERROR:
          window.vant.showFailToast(message);
          break;
        case this.errorTypes.AUTH_ERROR:
          window.vant.showFailToast(message);
          break;
        default:
          window.vant.showFailToast(message);
      }
    } else {
      alert(message);
    }
  },

  getRecoverySuggestion(errorType) {
    const suggestions = {
      NETWORK_ERROR: '请检查网络连接，确认服务器地址正确',
      VALIDATION_ERROR: '请检查输入数据格式，确保所有必填项已填写',
      SERVER_ERROR: '服务器暂时不可用，请稍后重试或联系管理员',
      AUTH_ERROR: '请重新登录，检查用户名和密码是否正确',
      NOT_FOUND_ERROR: '请求的资源可能已被删除，请刷新页面',
      PERMISSION_ERROR: '您没有足够的权限执行此操作，请联系管理员',
      UNKNOWN_ERROR: '操作失败，请重试或联系技术支持'
    };
    
    return suggestions[errorType] || suggestions.UNKNOWN_ERROR;
  },

  getErrorLogs() {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch (e) {
      console.error('Failed to read error logs:', e);
      return [];
    }
  },

  clearErrorLogs() {
    try {
      localStorage.removeItem('error_logs');
      console.log('Error logs cleared');
    } catch (e) {
      console.error('Failed to clear error logs:', e);
    }
  }
};

const Sanitizer = {
  dangerousPatterns: [
    /<[^>]*>/g,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:/gi,
    /eval\(/gi,
    /document\./gi,
    /window\./gi,
    /expression\(/gi,
    /@import/gi
  ],

  clean(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    let cleaned = input.trim();
    
    for (const pattern of this.dangerousPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }
    
    return cleaned;
  },

  html(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  text(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return this.clean(input);
  },

  number(input, defaultValue = 0) {
    const num = Number(input);
    return isNaN(num) ? defaultValue : num;
  },

  email(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    const email = input.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return '';
    }
    
    return email;
  },

  phone(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    const phone = input.trim().replace(/[^\d\+\-\s\(\)]/g, '');
    const phoneRegex = /^1[3-9]\d{9}$|^0\d{2,3}\d{7,8}$/;
    
    if (!phoneRegex.test(phone)) {
      return '';
    }
    
    return phone;
  },

  url(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    try {
      const url = new URL(input.trim());
      return url.toString();
    } catch (e) {
      return '';
    }
  },

  filename(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    return this.clean(input)
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 255);
  },

  sql(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    const dangerousChars = [
      ';', '--', '/*', '*/', 'xp_', 'union', 'select', 'insert', 'update', 'delete', 'drop', 'create', 'alter'
    ];
    
    let cleaned = input.toLowerCase();
    for (const char of dangerousChars) {
      cleaned = cleaned.split(char).join('');
    }
    
    return cleaned;
  },

  json(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed);
    } catch (e) {
      return '';
    }
  },

  escapeRegex(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    const regexChars = /[.*+?^$()|[\]\\]/g;
    return input.replace(regexChars, '\\$&');
  },

  stripTags(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input.replace(/<[^>]*>/g, '');
  },

  maxLength(input, maxLength) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input.substring(0, maxLength);
  },

  minLength(input, minLength) {
    if (typeof input !== 'string') {
      return input;
    }
    
    if (input.length < minLength) {
      return input.padEnd(minLength, '0');
    }
    
    return input;
  },

  trim(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input.trim();
  },

  toLowerCase(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input.toLowerCase();
  },

  toUpperCase(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input.toUpperCase();
  },

  capitalize(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  },

  validate(input, type = 'text') {
    switch (type) {
      case 'email':
        return this.email(input) !== '';
      case 'phone':
        return this.phone(input) !== '';
      case 'url':
        return this.url(input) !== '';
      case 'number':
        return !isNaN(Number(input));
      case 'text':
      default:
        return this.text(input) !== '';
    }
  },

  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const sanitized = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = this.text(obj[key]);
      } else if (typeof obj[key] === 'number') {
        sanitized[key] = obj[key];
      } else {
        sanitized[key] = obj[key];
      }
    }
    
    return sanitized;
  }
};

const Validator = {
  rules: {
    customer: {
      name: {
        required: true,
        minLength: 1,
        maxLength: 50,
        pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/
      },
      contact: {
        maxLength: 20,
        pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\s\-]+$/
      },
      address: {
        maxLength: 200
      },
      balance: {
        type: 'number',
        min: -999999999.99,
        max: 999999999.99
      }
    },
    
    product: {
      name: {
        required: true,
        minLength: 1,
        maxLength: 100,
        pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/
      },
      spec: {
        maxLength: 50
      },
      total_stock: {
        required: true,
        type: 'number',
        min: 0,
        max: 999999999
      },
      daily_rent_price: {
        required: true,
        type: 'number',
        min: 0,
        max: 999999.99
      }
    },
    
    order: {
      customer_id: {
        required: true,
        type: 'number',
        min: 1
      },
      type: {
        required: true,
        enum: ['OUT', 'IN']
      },
      items: {
        required: true,
        type: 'array',
        minLength: 1
      },
      deposit: {
        type: 'number',
        min: 0,
        max: 999999.99
      }
    },
    
    payment: {
      customer_id: {
        required: true,
        type: 'number',
        min: 1
      },
      amount: {
        required: true,
        type: 'number',
        min: 0.01,
        max: 999999.99
      },
      note: {
        maxLength: 100
      }
    }
  },

  validate(data, rules, context = '') {
    const errors = [];
    
    for (const field in rules) {
      const fieldRules = rules[field];
      const value = data[field];
      
      if (fieldRules.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: context + field + '不能为空',
          rule: 'required'
        });
        continue;
      }
      
      if (value !== undefined && value !== null && value !== '') {
        if (fieldRules.type === 'number') {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push({
              field,
              message: context + field + '必须是数字',
              rule: 'type'
            });
          } else if (fieldRules.min !== undefined && num < fieldRules.min) {
            errors.push({
              field,
              message: context + field + '不能小于' + fieldRules.min,
              rule: 'min'
            });
          } else if (fieldRules.max !== undefined && num > fieldRules.max) {
            errors.push({
              field,
              message: context + field + '不能大于' + fieldRules.max,
              rule: 'max'
            });
          }
        }
        
        if (fieldRules.minLength !== undefined && String(value).length < fieldRules.minLength) {
          errors.push({
            field,
            message: context + field + '长度不能少于' + fieldRules.minLength + '个字符',
            rule: 'minLength'
          });
        }
        
        if (fieldRules.maxLength !== undefined && String(value).length > fieldRules.maxLength) {
          errors.push({
            field,
            message: context + field + '长度不能超过' + fieldRules.maxLength + '个字符',
            rule: 'maxLength'
          });
        }
        
        if (fieldRules.pattern && !fieldRules.pattern.test(String(value))) {
          errors.push({
            field,
            message: context + field + '格式不正确',
            rule: 'pattern'
          });
        }
        
        if (fieldRules.enum && !fieldRules.enum.includes(value)) {
          errors.push({
            field,
            message: context + field + '值无效',
            rule: 'enum'
          });
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  customer(data) {
    return this.validate(data, this.rules.customer, '客户');
  },

  product(data) {
    return this.validate(data, this.rules.product, '物资');
  },

  order(data) {
    return this.validate(data, this.rules.order, '订单');
  },

  payment(data) {
    return this.validate(data, this.rules.payment, '支付');
  },

  sanitize(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:/gi, '')
      .replace(/eval\(/gi, '')
      .replace(/document\./gi, '')
      .replace(/window\./gi, '')
      .trim();
  },

  sanitizeHTML(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  sanitizeNumber(input, defaultValue = 0) {
    const num = Number(input);
    return isNaN(num) ? defaultValue : num;
  },

  sanitizeEmail(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input)) {
      return '';
    }
    
    return input.trim();
  },

  sanitizePhone(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    const phoneRegex = /^[\d\+\-\s\(\)]{7,20}$/;
    if (!phoneRegex.test(input)) {
      return '';
    }
    
    return input.trim();
  }
};

const API = CONFIG.API_URL;

createApp({
  setup() {
    const activeTab = ref('home'); const stats = ref({}); const products = ref([]); const customers = ref([]);
    const cart = ref([]); const orderType = ref('OUT'); const orderNote = ref(''); const orderDeposit = ref(0);
    const selectedCustomerName = ref(''); const selectedCustomerId = ref(null);
    const showProDetail = ref(false); const proTabActive = ref(0); const proData = ref({});
    const showCustPicker = ref(false); const showProdPicker = ref(false); const showHardEditor = ref(false); 
    const showDist = ref(false); const showPayDialog = ref(false); const showReceipt = ref(false);
    const showOrderInfo = ref(false); const showImgDialog = ref(false); const showCustForm = ref(false);
    const prodForm = ref({}); const curOrder = ref({ items: [] }); const lastOrderId = ref(null);
    const distList = ref([]); const payForm = ref({ amount: 0, note: '' });
    const custForm = ref({ name:'', contact:'', address:'' });
    const searchText = ref(''); const imgUrl = ref(''); const loading = ref(false);
    const sysConfig = ref({ sys_name: '脚手架管家', factory_name: '我的租赁站', contact_info: '', order_prefix: 'JSJ' });

    const loadData = async () => {
      try {
        const [p, c, s, cfg] = await Promise.all([fetch(API+"/products").then(r=>r.json()), fetch(API+"/customers").then(r=>r.json()), fetch(API+"/stats").then(r=>r.json()), fetch(API+"/config").then(r=>r.json())]);
        products.value = p||[]; customers.value = c||[]; stats.value = s||{}; 
        sysConfig.value = { ...sysConfig.value, ...cfg };
        document.title = sysConfig.value.sys_name; if(activeTab.value==='home') nextTick(initPie);
      } catch (e) { 
        ErrorHandler.handle(e, 'loadData');
        vant.showFailToast(ErrorHandler.getErrorMessage(e, ErrorHandler.errorTypes.NETWORK_ERROR));
      }
    };

    const initPie = () => {
      const dom = document.getElementById('chart-pie');
      if (dom && stats.value.total_out !== undefined) echarts.init(dom).setOption({ series: [{ type: 'pie', radius:['40%','70%'], data: [{ value: stats.value.total_out, name: '在外', itemStyle:{color:'#FF8008'} }, { value: stats.value.total_stock, name: '在库', itemStyle:{color:'#1989fa'} }] }] });
    };

    const openCustEditor = (c) => { 
      custForm.value = c ? { ...c } : { name: '', contact: '', address: '' }; 
      showCustForm.value = true; 
    };

    const saveCustomer = async () => {
        if (!custForm.value.name || custForm.value.name.trim() === '') {
          vant.showFailToast('必填');
          return;
        }
        
        const validation = Validator.customer(custForm.value);
        if (!validation.valid) {
          vant.showFailToast(validation.errors[0].message);
          return;
        }
        
        loading.value = true;
        try {
            const res = await fetch(API+"/customers", { method: custForm.value.id ? 'PUT' : 'POST', body: JSON.stringify(custForm.value) });
            if (res.ok) {
                const result = await res.json();
                if (result.success) {
                    showCustForm.value = false; loadData(); vant.showSuccessToast('同步成功');
                } else {
                    vant.showFailToast(result.error || '保存失败');
                }
            } else {
                vant.showFailToast('网络错误');
            }
        } catch (e) {
            ErrorHandler.handle(e, 'saveCustomer');
            vant.showFailToast(ErrorHandler.getErrorMessage(e, ErrorHandler.errorTypes.NETWORK_ERROR));
        } finally {
            loading.value = false;
        }
    };

    const onPickCust = ({ selectedOptions }) => { if(selectedOptions[0]){ selectedCustomerName.value = selectedOptions[0].text; selectedCustomerId.value = selectedOptions[0].value; } showCustPicker.value = false; };
    const addToCart = (p) => { if (!cart.value.find(x => x.id === p.id)) cart.value.push({ ...p, qty: 1 }); showProdPicker.value = false; };
    const openCustomerPro = async (c) => { try { proData.value = await fetch(API+"/customers/"+c.id+"/financial").then(r=>r.json()); showProDetail.value = true; } catch(e) { vant.showFailToast('数据加载失败'); } };
    const submitOrder = async () => { 
      if(!selectedCustomerId.value) {
        vant.showFailToast('请选择客户');
        return;
      }
      if(cart.value.length === 0) {
        vant.showFailToast('请添加物资');
        return;
      }
      if(orderType.value !== 'OUT' && orderType.value !== 'IN') {
        vant.showFailToast('请选择业务类型');
        return;
      }
      
      loading.value = true;
      try {
        const validation = Validator.order({
          customer_id: selectedCustomerId.value,
          type: orderType.value,
          items: cart.value.map(x=>({
            product_id:x.id, 
            qty:x.qty, 
            daily_rent_price: x.daily_rent_price
          }))
        });
        
        if (!validation.valid) {
          vant.showFailToast(validation.errors[0].message);
          return;
        }
        
        const payload = { 
          customer_id: selectedCustomerId.value, 
          type: orderType.value, 
          note: Sanitizer.text(orderNote.value),
          deposit: Number(orderDeposit.value),
          items: cart.value.map(x=>({
            product_id:x.id, 
            qty:x.qty, 
            daily_rent_price: x.daily_rent_price
          }))
        }; 
        
        const res = await fetch(API+"/orders", {
          method:"POST", 
          body:JSON.stringify(payload)
        });
        
        if(res.ok) {
          const result = await res.json();
          if(result.success) {
            await loadData();
            lastOrderId.value = result.order_id;
            showReceipt.value = true;
            cart.value = [];
            orderDeposit.value = 0;
            orderNote.value = '';
            vant.showSuccessToast('订单创建成功');
          } else {
            vant.showFailToast(result.error || '订单创建失败');
          }
        } else {
          const errorData = await res.json();
          vant.showFailToast(errorData.error || '订单创建失败');
        }
      } catch (e) {
        ErrorHandler.handle(e, 'submitOrder');
        vant.showFailToast(ErrorHandler.getErrorMessage(e, ErrorHandler.errorTypes.NETWORK_ERROR));
      } finally {
        loading.value = false;
      }
    };
    const exportExcel = () => { const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ 客户: proData.value.cust.name, 余额: proData.value.cust.balance }]), "概览"); if (proData.value.stocks.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(proData.value.stocks.map(s => ({ 物资: s.name, 规格: s.spec, 数量: s.quantity }))), "清单"); XLSX.writeFile(wb, proData.value.cust.name + ".xlsx"); };
    const generateImage = async () => { const el = document.getElementById('capture-area'); try { const canvas = await html2canvas(el, { scale: 2 }); imgUrl.value = canvas.toDataURL("image/png"); showImgDialog.value = true; } catch(e) { vant.showFailToast('生成失败'); } };
    
    const openHardEditor = (p)=>{ 
        prodForm.value = p ? {...p} : {name:'',spec:'',total_stock:0,daily_rent_price:0}; 
        showHardEditor.value=true; 
    };

    const saveProd = async()=>{
      if(!prodForm.value.name || prodForm.value.name.trim() === '') {
        vant.showFailToast('物资名称不能为空');
        return;
      }
      
      const validation = Validator.product(prodForm.value);
      if (!validation.valid) {
        vant.showFailToast(validation.errors[0].message);
        return;
      }
      
      loading.value = true;
      try {
        const res = await fetch(API+"/products",{
          method:prodForm.value.id?'PUT':'POST',
          body:JSON.stringify({
            name: Sanitizer.text(prodForm.value.name.trim()),
            spec: Sanitizer.text(prodForm.value.spec || ''),
            total_stock: Sanitizer.number(prodForm.value.total_stock, 0),
            daily_rent_price: Sanitizer.number(prodForm.value.daily_rent_price, 0)
          })
        });
        
        if(res.ok) {
          const result = await res.json();
          if(result.success) {
            vant.showSuccessToast(result.message || '保存成功');
            showHardEditor.value = false;
            loadData();
          } else {
            vant.showFailToast(result.error || '保存失败');
          }
        } else {
          const errorData = await res.json();
          vant.showFailToast(errorData.error || '保存失败');
        }
      } catch (e) {
        ErrorHandler.handle(e, 'saveProd');
        vant.showFailToast(ErrorHandler.getErrorMessage(e, ErrorHandler.errorTypes.NETWORK_ERROR));
      } finally {
        loading.value = false;
      }
    };
    
    const deleteProd = async()=>{
      if(!confirm('确定要删除这个物资吗？\n此操作不可恢复！')) return;
      loading.value = true;
      try {
        const res = await fetch(API+"/products?id="+prodForm.value.id,{method:"DELETE"});
        
        if(res.ok) {
          const result = await res.json();
          if(result.success) {
            vant.showSuccessToast('删除成功');
            showHardEditor.value = false;
            loadData();
          } else {
            vant.showFailToast(result.error || '删除失败');
          }
        } else {
          const errorData = await res.json();
          vant.showFailToast(errorData.error || '删除失败');
        }
      } catch (e) {
        ErrorHandler.handle(e, 'deleteProd');
        vant.showFailToast(ErrorHandler.getErrorMessage(e, ErrorHandler.errorTypes.NETWORK_ERROR));
      } finally {
        loading.value = false;
      }
    };
    
    const savePayment = async()=>{ 
      if(!payForm.value.amount || Number(payForm.value.amount) <= 0) {
        vant.showFailToast('请输入有效金额');
        return;
      }
      
      loading.value = true;
      try {
        const res = await fetch(API+"/payments",{method:"POST",body:JSON.stringify({customer_id:proData.value.cust.id,amount:Number(payForm.value.amount),note:Sanitizer.text(payForm.value.note)})});
        if (res.ok) {
          vant.showSuccessToast('收款成功');
          openCustomerPro(proData.value.cust);
          loadData();
        } else {
          vant.showFailToast('收款失败');
        }
      } catch (e) {
        ErrorHandler.handle(e, 'savePayment');
        vant.showFailToast(ErrorHandler.getErrorMessage(e, ErrorHandler.errorTypes.NETWORK_ERROR));
      } finally {
        loading.value = false;
      }
    };
    
    const showOrderDetail = async(id)=>{ try { curOrder.value = await fetch(API+"/orders/"+id).then(r=>r.json()); showOrderInfo.value=true; } catch(e) { vant.showFailToast('数据加载失败'); } };
    const viewCurrentOrder = () => { showReceipt.value = false; showOrderDetail(lastOrderId.value); };
    const showDistribution = async(p)=>{ distList.value=await fetch(API+"/products/"+p.id+"/distribution").then(r=>r.json()); showDist.value=true; };

    onMounted(loadData);
    return { 
      activeTab, stats, products, customers, cart, orderType, orderNote, orderDeposit, selectedCustomerName, selectedCustomerId, 
      showProDetail, proTabActive, proData, showCustPicker, showProdPicker, showHardEditor, showDist, showPayDialog, showReceipt, showOrderInfo, showImgDialog,
      custForm, openCustEditor, saveCustomer, showCustForm,
      prodForm, curOrder, distList, payForm, searchText, imgUrl, loading, sysConfig,
      custColumns: computed(()=>customers.value.map(c=>({text:c.name,value:c.id}))), 
      filteredProducts: computed(()=>products.value.filter(p=>(p.name+(p.spec||'')).toLowerCase().includes(searchText.value.toLowerCase()))),
      onPickCust, openCustomerPro, addToCart, submitOrder, loadData, onTabChange: (name)=>{ if(name==='home') nextTick(initPie); loadData(); },
      showOrderDetail, showDistribution, openHardEditor, saveProd, deleteProd, savePayment, exportExcel, generateImage, viewCurrentOrder
    };
  }
}).use(vant).mount("#app");
</script>
</body>
</html>`;
    return new Response(html, { headers: { "content-type": "text/html;charset=UTF-8" } });
  }
};