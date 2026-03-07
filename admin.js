/**
 * 脚手架管家 - 管理后台系统（集成API版）
 * 
 * 功能定位：
 * - 客户信息管理（添加、编辑、删除客户资料）
 * - 物资数量监控与调整
 * - 各类业务报表的生成与导出
 * - 系统配置管理
 * - 操作日志记录
 * 
 * 技术架构：
 * - Vue.js 3.x + Vant UI
 * - 集成API处理逻辑
 * - 严格的权限控制
 * - 完善的数据验证
 * 
 * @version 3.0.0
 * @author System
 */

export default {
  async fetch(request, env) {
    return new Response(getAdminHTML(), {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};

function getAdminHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>脚手架管家 - 管理后台</title>
  
  <!-- Vue.js 3.x -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  
  <!-- Vant UI -->
  <link rel="stylesheet" href="https://unpkg.com/vant@4/lib/index.css" />
  <script src="https://unpkg.com/vant@4/lib/vant.min.js"></script>
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f7f8fa;
      color: #323233;
    }
    
    #admin-app {
      min-height: 100vh;
    }
    
    .page-container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .stat-card {
      text-align: center;
      padding: 20px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1989fa;
      margin: 8px 0;
    }
    
    .stat-label {
      color: #969799;
      font-size: 14px;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      margin: -16px -16px 16px -16px;
      border-radius: 8px 8px 0 0;
    }
    
    .header h1 {
      font-size: 20px;
      margin-bottom: 8px;
    }
    
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .action-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    
    .search-box {
      flex: 1;
      min-width: 200px;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #969799;
    }
    
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    @media (max-width: 768px) {
      .page-container {
        padding: 12px;
      }
      
      .card {
        padding: 12px;
      }
      
      .action-bar {
        flex-direction: column;
      }
      
      .search-box {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div id="admin-app"></div>
  
  <script>
    const { createApp, ref, reactive, computed, onMounted } = Vue;
    const vant = window.vant;
    
    const API = window.API_URL || "https://api.xxlb.us.ci";
    const DATABASE_ID = "8b4af057-f746-4bb2-983f-579bf0e45f76";
    
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
      
      handle(error, context) {
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
      
      number(input, defaultValue) {
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
        const phoneRegex = /^[\d\+\-\s\(\)]{7,20}$/;
        
        if (!phoneRegex.test(phone)) {
          return '';
        }
        
        return phone.trim();
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
      
      validate(input, type) {
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
            pattern: /^[\\u4e00-\\u9fa5a-zA-Z0-9_\\s]+$/
          },
          contact: {
            maxLength: 20,
            pattern: /^[\\u4e00-\\u9fa5a-zA-Z0-9_\\s\\-]+$/
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
            pattern: /^[\\u4e00-\\u9fa5a-zA-Z0-9_\\s]+$/
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
          },
          category: {
            maxLength: 50
          },
          min_stock: {
            type: 'number',
            min: 0,
            max: 999999999
          },
          unit: {
            maxLength: 20
          },
          description: {
            maxLength: 500
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
      
      validate(data, rules, context) {
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
          .replace(/on\\w+\\s*=/gi, '')
          .replace(/data:/gi, '')
          .replace(/eval\\(/gi, '')
          .replace(/document\\./gi, '')
          .replace(/window\\./gi, '')
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
      
      sanitizeNumber(input, defaultValue) {
        const num = Number(input);
        return isNaN(num) ? defaultValue : num;
      },
      
      sanitizeEmail(input) {
        if (typeof input !== 'string') {
          return '';
        }
        
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(input)) {
          return '';
        }
        
        return input.trim();
      },
      
      sanitizePhone(input) {
        if (typeof input !== 'string') {
          return '';
        }
        
        const phoneRegex = /^[\\d\\+\\-\\s\\(\\)]{7,20}$/;
        if (!phoneRegex.test(input)) {
          return '';
        }
        
        return input.trim();
      }
    };
    
    const app = createApp({
      setup() {
        const state = reactive({
          isAuthenticated: false,
          currentUser: null,
          currentRole: null,
          loginForm: {
            username: '',
            password: ''
          },
          currentPage: 'login',
          previousPage: null,
          customers: [],
          products: [],
          orders: [],
          stats: null,
          config: {},
          loading: false,
          refreshing: false,
          searchQuery: '',
          selectedCustomer: null,
          selectedProduct: null,
          selectedOrder: null,
          customerForm: {
            name: '',
            phone: '',
            email: '',
            contact: '',
            address: '',
            balance: 0,
            category: ''
          },
          productForm: {
            name: '',
            spec: '',
            total_stock: 0,
            daily_rent_price: 0,
            category: '',
            min_stock: 0,
            unit: '件',
            description: ''
          },
          productCategories: ['脚手架类', '配件类', '工具类', '其他'],
          productSearchForm: {
            name: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            stockStatus: 'all'
          },
          productDistribution: [],
          showDistributionDialog: false,
          productStats: null,
          showStatsDialog: false,
          lowStockProducts: [],
          showLowStockAlert: false,
          paymentForm: {
            customer_id: '',
            amount: 0,
            type: 'MANUAL',
            note: ''
          },
          showCustomerDialog: false,
          showProductDialog: false,
          showPaymentDialog: false,
          showDeleteConfirm: false,
          showExportDialog: false,
          showImportDialog: false,
          reportType: 'daily',
          reportDateRange: [],
          reportData: null,
          toasts: [],
          fileList: [],
          toast: {
            show: false,
            message: '',
            type: 'info'
          }
        });
        
        const filteredCustomers = computed(function() {
          if (!state.searchQuery) return state.customers;
          const query = state.searchQuery.toLowerCase();
          return state.customers.filter(function(c) { 
            return c.name.toLowerCase().includes(query) ||
            (c.contact && c.contact.toLowerCase().includes(query));
          });
        });
        
        const filteredProducts = computed(function() {
          let products = state.products;
          
          const searchForm = state.productSearchForm;
          
          if (searchForm.name) {
            const query = searchForm.name.toLowerCase();
            products = products.filter(function(p) { 
              return p.name.toLowerCase().includes(query) ||
              (p.spec && p.spec.toLowerCase().includes(query));
            });
          }
          
          if (searchForm.category) {
            products = products.filter(function(p) {
              return p.category === searchForm.category;
            });
          }
          
          if (searchForm.minPrice !== '') {
            const minPrice = Number(searchForm.minPrice);
            products = products.filter(function(p) {
              return p.daily_rent_price >= minPrice;
            });
          }
          
          if (searchForm.maxPrice !== '') {
            const maxPrice = Number(searchForm.maxPrice);
            products = products.filter(function(p) {
              return p.daily_rent_price <= maxPrice;
            });
          }
          
          if (searchForm.stockStatus === 'low') {
            products = products.filter(function(p) {
              return p.total_stock <= (p.min_stock || 0);
            });
          } else if (searchForm.stockStatus === 'out') {
            products = products.filter(function(p) {
              return p.total_stock === 0;
            });
          } else if (searchForm.stockStatus === 'normal') {
            products = products.filter(function(p) {
              return p.total_stock > (p.min_stock || 0);
            });
          }
          
          return products;
        });
        
        const filteredOrders = computed(function() {
          if (!state.searchQuery) return state.orders;
          const query = state.searchQuery.toLowerCase();
          return state.orders.filter(function(o) { 
            return o.customer_name.toLowerCase().includes(query) ||
            (o.order_no && o.order_no.toLowerCase().includes(query));
          });
        });
        
        const showToast = function(message, type) {
          type = type || 'info';
          state.toast.message = message;
          state.toast.type = type;
          state.toast.show = true;
          setTimeout(function() {
            state.toast.show = false;
          }, 3000);
        };
        
        const getPageTitle = function() {
          const titles = {
            'login': '登录',
            'dashboard': '仪表盘',
            'customers': '客户管理',
            'products': '物资管理',
            'orders': '订单管理',
            'reports': '报表统计'
          };
          return titles[state.currentPage] || '脚手架管家';
        };
        
        const navigateTo = function(page) {
          state.previousPage = state.currentPage;
          state.currentPage = page;
        };
        
        const goBack = function() {
          if (state.previousPage) {
            const targetPage = state.previousPage;
            state.previousPage = null;
            state.currentPage = targetPage;
          } else {
            state.currentPage = 'dashboard';
          }
        };
        
        const refreshData = async function() {
          state.refreshing = true;
          try {
            await Promise.all([
              loadCustomers(),
              loadProducts(),
              loadOrders(),
              loadStats(),
              loadConfig()
            ]);
            showToast('刷新成功', 'success');
          } catch (error) {
            ErrorHandler.handle(error, 'refreshData');
            showToast(ErrorHandler.getErrorMessage(error, ErrorHandler.errorTypes.NETWORK_ERROR), 'error');
          } finally {
            state.refreshing = false;
          }
        };
        
        const doLogin = async function() {
          state.loading = true;
          try {
            const res = await fetch(API + "/auth", {
              method: "POST",
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                username: state.loginForm.username,
                password: state.loginForm.password
              })
            });
            
            if (res.ok) {
              const result = await res.json();
              if (result.success) {
                state.isAuthenticated = true;
                state.currentUser = {
                  username: state.loginForm.username,
                  role: 'admin'
                };
                state.currentRole = 'admin';
                showToast('登录成功', 'success');
                navigateTo('dashboard');
                refreshData();
              } else {
                showToast(result.error || '登录失败', 'error');
              }
            } else {
              showToast('登录失败', 'error');
            }
          } catch (error) {
            ErrorHandler.handle(error, 'doLogin');
            showToast(ErrorHandler.getErrorMessage(error, ErrorHandler.errorTypes.NETWORK_ERROR), 'error');
          } finally {
            state.loading = false;
          }
        };
        
        const doLogout = function() {
          state.isAuthenticated = false;
          state.currentUser = null;
          state.currentRole = null;
          showToast('已退出登录', 'info');
          navigateTo('login');
        };
        
        const loadCustomers = async function() {
          try {
            const data = await fetch(API + "/customers").then(function(r) { return r.json(); });
            state.customers = data || [];
          } catch (error) {
            ErrorHandler.handle(error, 'loadCustomers');
          }
        };
        
        const loadProducts = async function() {
          try {
            const data = await fetch(API + "/products").then(function(r) { return r.json(); });
            state.products = data || [];
          } catch (error) {
            ErrorHandler.handle(error, 'loadProducts');
          }
        };
        
        const loadOrders = async function() {
          try {
            const data = await fetch(API + "/orders").then(function(r) { return r.json(); });
            state.orders = data || [];
          } catch (error) {
            ErrorHandler.handle(error, 'loadOrders');
          }
        };
        
        const loadStats = async function() {
          try {
            const data = await fetch(API + "/stats").then(function(r) { return r.json(); });
            state.stats = data || {};
          } catch (error) {
            ErrorHandler.handle(error, 'loadStats');
          }
        };
        
        const loadConfig = async function() {
          try {
            const data = await fetch(API + "/config").then(function(r) { return r.json(); });
            state.config = data || {};
          } catch (error) {
            ErrorHandler.handle(error, 'loadConfig');
          }
        };
        
        const openCustomerDialog = function(customer) {
          if (customer) {
            state.customerForm = { ...customer };
          } else {
            state.customerForm = {
              name: '',
              phone: '',
              email: '',
              contact: '',
              address: '',
              balance: 0,
              category: ''
            };
          }
          state.selectedCustomer = customer;
          state.showCustomerDialog = true;
        };
        
        const saveCustomer = async function() {
          const validation = Validator.customer(state.customerForm);
          
          if (!validation.valid) {
            showToast(validation.errors[0].message, 'error');
            return;
          }
          
          state.loading = true;
          try {
            const method = state.selectedCustomer ? 'PUT' : 'POST';
            const url = API + "/customers";
            
            const sanitizedData = {
              name: Sanitizer.text(state.customerForm.name),
              contact: Sanitizer.text(state.customerForm.contact),
              address: Sanitizer.text(state.customerForm.address),
              balance: Sanitizer.number(state.customerForm.balance, 0)
            };
            
            const res = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(sanitizedData)
            });
            
            if (res.ok) {
              const result = await res.json();
              if (result.success) {
                showToast(state.selectedCustomer ? '更新成功' : '创建成功', 'success');
                state.showCustomerDialog = false;
                await loadCustomers();
              } else {
                showToast(result.error || '保存失败', 'error');
              }
            } else {
              showToast('保存失败', 'error');
            }
          } catch (error) {
            ErrorHandler.handle(error, 'saveCustomer');
          } finally {
            state.loading = false;
          }
        };
        
        const deleteCustomer = async function(customer) {
          state.selectedCustomer = customer;
          state.showDeleteConfirm = true;
        };
        
        const confirmDeleteCustomer = async function() {
          state.loading = true;
          try {
            const res = await fetch(API + "/customers?id=" + state.selectedCustomer.id, {
              method: "DELETE",
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (res.ok) {
              const result = await res.json();
              if (result.success) {
                showToast('删除成功', 'success');
                state.showDeleteConfirm = false;
                await loadCustomers();
              } else {
                showToast(result.error || '删除失败，请检查关联数据', 'error');
              }
            } else {
              showToast('删除失败', 'error');
            }
          } catch (error) {
            ErrorHandler.handle(error, 'confirmDeleteCustomer');
          } finally {
            state.loading = false;
          }
        };
        
        const openProductDialog = function(product) {
          if (product) {
            state.productForm = { ...product };
          } else {
            state.productForm = {
              name: '',
              spec: '',
              total_stock: 0,
              daily_rent_price: 0,
              category: '',
              min_stock: 0,
              unit: '件',
              description: ''
            };
          }
          state.selectedProduct = product;
          state.showProductDialog = true;
        };
        
        const saveProduct = async function() {
          const validation = Validator.product(state.productForm);
          
          if (!validation.valid) {
            showToast(validation.errors[0].message, 'error');
            return;
          }
          
          state.loading = true;
          try {
            const method = state.selectedProduct ? 'PUT' : 'POST';
            const sanitizedData = {
              name: Sanitizer.text(state.productForm.name),
              spec: Sanitizer.text(state.productForm.spec),
              total_stock: Sanitizer.number(state.productForm.total_stock, 0),
              daily_rent_price: Sanitizer.number(state.productForm.daily_rent_price, 0),
              category: Sanitizer.text(state.productForm.category),
              min_stock: Sanitizer.number(state.productForm.min_stock, 0),
              unit: Sanitizer.text(state.productForm.unit) || '件',
              description: Sanitizer.text(state.productForm.description)
            };
            
            const res = await fetch(API + "/products", {
              method,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(sanitizedData)
            });
            
            if (res.ok) {
              const result = await res.json();
              if (result.success) {
                showToast(state.selectedProduct ? '更新成功' : '创建成功', 'success');
                state.showProductDialog = false;
                await loadProducts();
              } else {
                showToast(result.error || '保存失败', 'error');
              }
            } else {
              showToast('保存失败', 'error');
            }
          } catch (error) {
            ErrorHandler.handle(error, 'saveProduct');
          } finally {
            state.loading = false;
          }
        };
        
        const deleteProduct = async function(product) {
          state.selectedProduct = product;
          state.showDeleteConfirm = true;
        };
        
        const confirmDeleteProduct = async function() {
          state.loading = true;
          try {
            const res = await fetch(API + "/products?id=" + state.selectedProduct.id, {
              method: "DELETE",
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (res.ok) {
              const result = await res.json();
              if (result.success) {
                showToast('删除成功', 'success');
                state.showDeleteConfirm = false;
                await loadProducts();
              } else {
                showToast(result.error || '删除失败，请检查关联数据', 'error');
              }
            } else {
              showToast('删除失败', 'error');
            }
          } catch (error) {
            ErrorHandler.handle(error, 'confirmDeleteProduct');
          } finally {
            state.loading = false;
          }
        };
        
        const loadProductDistribution = async function(productId) {
          state.loading = true;
          try {
            const data = await fetch(API + "/products/" + productId + "/distribution").then(function(r) { return r.json(); });
            state.productDistribution = data || [];
            state.showDistributionDialog = true;
          } catch (error) {
            ErrorHandler.handle(error, 'loadProductDistribution');
          } finally {
            state.loading = false;
          }
        };
        
        const loadProductStats = async function() {
          state.loading = true;
          try {
            const data = await fetch(API + "/products/stats").then(function(r) { return r.json(); });
            state.productStats = data;
            state.showStatsDialog = true;
          } catch (error) {
            ErrorHandler.handle(error, 'loadProductStats');
          } finally {
            state.loading = false;
          }
        };
        
        const checkLowStock = function() {
          state.lowStockProducts = state.products.filter(function(p) {
            return p.total_stock <= (p.min_stock || 0);
          });
          if (state.lowStockProducts.length > 0) {
            state.showLowStockAlert = true;
          }
        };
        
        const resetProductSearch = function() {
          state.productSearchForm = {
            name: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            stockStatus: 'all'
          };
        };
        
        const openPaymentDialog = function(customer) {
          state.paymentForm = {
            customer_id: customer.id,
            amount: 0,
            type: 'MANUAL',
            note: ''
          };
          state.showPaymentDialog = true;
        };
        
        const savePayment = async function() {
          state.loading = true;
          try {
            const sanitizedData = {
              customer_id: state.paymentForm.customer_id,
              amount: Sanitizer.number(state.paymentForm.amount, 0),
              type: state.paymentForm.type,
              note: Sanitizer.text(state.paymentForm.note)
            };
            
            const res = await fetch(API + "/payments", {
              method: "POST",
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(sanitizedData)
            });
            
            if (res.ok) {
              const result = await res.json();
              if (result.success) {
                showToast('支付成功', 'success');
                state.showPaymentDialog = false;
                await loadCustomers();
              } else {
                showToast(result.error || '支付失败', 'error');
              }
            } else {
              showToast('支付失败', 'error');
            }
          } catch (error) {
            ErrorHandler.handle(error, 'savePayment');
          } finally {
            state.loading = false;
          }
        };
        
        const exportAllData = async function() {
          state.loading = true;
          try {
            const data = await fetch(API + "/export", {
              headers: {
                'Content-Type': 'application/json'
              }
            }).then(function(r) { return r.json(); });
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'scaffold_manager_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('导出成功', 'success');
          } catch (error) {
            ErrorHandler.handle(error, 'exportAllData');
          } finally {
            state.loading = false;
          }
        };
        
        const importData = async function(file) {
          state.loading = true;
          try {
            const content = await file.text();
            const data = JSON.parse(content);
            
            const res = await fetch(API + "/import", {
              method: "POST",
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
            
            if (res.ok) {
              const result = await res.json();
              if (result.success) {
                showToast('导入成功', 'success');
                await refreshData();
              } else {
                showToast(result.error || '导入失败', 'error');
              }
            } else {
              showToast('导入失败', 'error');
            }
          } catch (error) {
            ErrorHandler.handle(error, 'importData');
          } finally {
            state.loading = false;
          }
        };
        
        const confirmDelete = async function() {
          if (state.currentPage === 'customers') {
            await confirmDeleteCustomer();
          } else if (state.currentPage === 'products') {
            await confirmDeleteProduct();
          }
        };
        
        const handleFileChange = function(file) {
          if (file && file.length > 0) {
            importData(file[0].file);
          }
        };
        
        onMounted(function() {
          const savedAuth = localStorage.getItem('admin_auth');
          if (savedAuth) {
            try {
              const auth = JSON.parse(savedAuth);
              if (auth && auth.isAuthenticated) {
                state.isAuthenticated = true;
                state.currentUser = auth.currentUser;
                state.currentRole = auth.currentRole;
                navigateTo('dashboard');
                refreshData();
                checkLowStock();
              }
            } catch (error) {
              console.error('加载认证状态失败:', error);
            }
          }
        });
        
        return {
          state,
          filteredCustomers,
          filteredProducts,
          filteredOrders,
          showToast,
          navigateTo,
          goBack,
          refreshData,
          doLogin,
          doLogout,
          loadCustomers,
          loadProducts,
          loadOrders,
          loadStats,
          loadConfig,
          openCustomerDialog,
          saveCustomer,
          deleteCustomer,
          confirmDeleteCustomer,
          openProductDialog,
          saveProduct,
          deleteProduct,
          confirmDeleteProduct,
          loadProductDistribution,
          loadProductStats,
          checkLowStock,
          resetProductSearch,
          openPaymentDialog,
          savePayment,
          exportAllData,
          importData,
          confirmDelete,
          handleFileChange
        };
      }
    });
    
    app.use(vant);
    app.mount('#admin-app');
  </script>
</body>
</html>`;
}