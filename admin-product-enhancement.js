/**
 * 物资管理界面增强 - admin.js 集成代码
 * 
 * 功能说明：
 * 1. 物资分类管理 - 支持多级分类和分类筛选
 * 2. 库存预警系统 - 自动检测低库存物资并提醒
 * 3. 物资分布查看 - 查看物资在各客户处的分布情况
 * 4. 物资统计报表 - 使用频率、收入分析等统计
 * 5. 高级搜索筛选 - 多条件组合搜索
 * 
 * 使用方法：
 * 将此代码集成到 admin.js 的 getAdminHTML() 函数中的 Vue 应用模板部分
 */

// 在 admin.js 的 state 对象中添加以下状态（已添加）：
/*
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
*/

// 在 admin.js 的 createApp setup 函数中添加以下函数（已添加）：
/*
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
*/

// ===== 物资管理界面模板 =====
// 将以下HTML代码添加到 admin.js 的 Vue 应用模板中

const PRODUCT_MANAGEMENT_TEMPLATE = `
<!-- 物资管理页面 -->
<div v-if="state.currentPage === 'products'" class="page-container">
  <!-- 页面标题 -->
  <div class="header">
    <h1>📦 物资管理</h1>
    <p>管理所有租赁物资，监控库存状态</p>
  </div>

  <!-- 库存预警提醒 -->
  <van-notice-bar 
    v-if="state.lowStockProducts.length > 0" 
    type="warning" 
    left-icon="warning-o"
    @click="state.showLowStockAlert = true"
  >
    ⚠️ 发现 {{ state.lowStockProducts.length }} 个物资库存不足，点击查看详情
  </van-notice-bar>

  <!-- 操作栏 -->
  <div class="card">
    <div class="action-bar">
      <van-button type="primary" icon="plus" @click="openProductDialog(null)">
        新增物资
      </van-button>
      <van-button type="success" icon="chart-trending-o" @click="loadProductStats">
        统计报表
      </van-button>
      <van-button type="info" icon="search" @click="state.showSearchPanel = !state.showSearchPanel">
        高级搜索
      </van-button>
    </div>

    <!-- 高级搜索面板 -->
    <van-collapse v-model="state.showSearchPanel" v-if="state.showSearchPanel">
      <van-collapse-item title="搜索条件" name="search">
        <van-field
          v-model="state.productSearchForm.name"
          label="物资名称"
          placeholder="输入物资名称或规格"
          clearable
        />
        <van-field
          v-model="state.productSearchForm.category"
          label="物资分类"
          placeholder="选择分类"
          readonly
          is-link
          @click="state.showCategoryPicker = true"
        />
        <van-field
          v-model="state.productSearchForm.minPrice"
          label="最低价格"
          type="number"
          placeholder="0"
        />
        <van-field
          v-model="state.productSearchForm.maxPrice"
          label="最高价格"
          type="number"
          placeholder="999999"
        />
        <van-field
          name="stockStatus"
          label="库存状态"
        >
          <template #input>
            <van-radio-group v-model="state.productSearchForm.stockStatus" direction="horizontal">
              <van-radio name="all">全部</van-radio>
              <van-radio name="normal">正常</van-radio>
              <van-radio name="low">低库存</van-radio>
              <van-radio name="out">缺货</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <van-button type="primary" block @click="state.showSearchPanel = false">
            应用筛选
          </van-button>
          <van-button plain block @click="resetProductSearch">
            重置条件
          </van-button>
        </div>
      </van-collapse-item>
    </van-collapse>
  </div>

  <!-- 物资列表 -->
  <div class="card">
    <van-empty 
      v-if="filteredProducts.length === 0" 
      description="暂无物资数据"
    />
    <van-list v-else>
      <van-cell
        v-for="product in filteredProducts"
        :key="product.id"
        :title="product.name"
        :label="product.spec || '无规格'"
        is-link
        @click="openProductDialog(product)"
      >
        <template #icon>
          <van-icon name="bag-o" size="20" style="margin-right: 8px;" />
        </template>
        <template #value>
          <div style="text-align: right;">
            <div style="font-weight: bold; color: #1989fa;">
              {{ product.total_stock }} {{ product.unit || '件' }}
            </div>
            <div style="font-size: 12px; color: #969799;">
              ¥{{ product.daily_rent_price }}/天
            </div>
            <van-tag 
              v-if="product.total_stock <= (product.min_stock || 0)" 
              type="danger" 
              size="mini"
              style="margin-top: 4px;"
            >
              库存不足
            </van-tag>
            <van-tag 
              v-else-if="product.total_stock === 0" 
              type="danger" 
              size="mini"
              style="margin-top: 4px;"
            >
              缺货
            </van-tag>
          </div>
        </template>
      </van-cell>
    </van-list>
  </div>

  <!-- 物资详情/编辑对话框 -->
  <van-dialog
    v-model:show="state.showProductDialog"
    :title="state.selectedProduct ? '编辑物资' : '新增物资'"
    show-cancel-button
    @confirm="saveProduct"
  >
    <van-form @submit.prevent="saveProduct">
      <van-field
        v-model="state.productForm.name"
        label="物资名称"
        placeholder="如：钢管"
        required
        :rules="[{ required: true, message: '请输入物资名称' }]"
      />
      <van-field
        v-model="state.productForm.spec"
        label="规格型号"
        placeholder="如：φ48×3.5"
      />
      <van-field
        v-model="state.productForm.category"
        label="物资分类"
        placeholder="选择分类"
        readonly
        is-link
        @click="state.showCategoryPicker = true"
      />
      <van-field
        v-model="state.productForm.total_stock"
        label="总库存"
        type="number"
        placeholder="0"
        required
      />
      <van-field
        v-model="state.productForm.min_stock"
        label="最低库存"
        type="number"
        placeholder="库存预警值"
      />
      <van-field
        v-model="state.productForm.unit"
        label="计量单位"
        placeholder="件"
      />
      <van-field
        v-model="state.productForm.daily_rent_price"
        label="日租金"
        type="number"
        placeholder="0.00"
        required
      />
      <van-field
        v-model="state.productForm.description"
        label="描述说明"
        type="textarea"
        placeholder="物资的详细描述"
        rows="3"
      />
    </van-form>
    
    <!-- 删除按钮 -->
    <div v-if="state.selectedProduct" style="padding: 16px;">
      <van-button 
        type="danger" 
        block 
        plain 
        @click="deleteProduct(state.selectedProduct)"
      >
        删除此物资
      </van-button>
    </div>
  </van-dialog>

  <!-- 分类选择器 -->
  <van-picker
    v-model:show="state.showCategoryPicker"
    :columns="state.productCategories"
    @confirm="state.productForm.category = $event; state.showCategoryPicker = false"
    @cancel="state.showCategoryPicker = false"
  />

  <!-- 物资分布对话框 -->
  <van-dialog
    v-model:show="state.showDistributionDialog"
    title="物资分布详情"
    :show-confirm-button="false"
  >
    <van-empty 
      v-if="state.productDistribution.length === 0" 
      description="暂无分布数据"
    />
    <van-list v-else>
      <van-cell
        v-for="item in state.productDistribution"
        :key="item.customer_id"
        :title="item.customer_name"
        :value="item.quantity + ' ' + (item.unit || '件')"
      >
        <template #label>
          <div>最后更新：{{ item.last_update }}</div>
        </template>
      </van-cell>
    </van-list>
    <div style="padding: 16px;">
      <van-button block @click="state.showDistributionDialog = false">
        关闭
      </van-button>
    </div>
  </van-dialog>

  <!-- 物资统计对话框 -->
  <van-dialog
    v-model:show="state.showStatsDialog"
    title="物资统计报表"
    :show-confirm-button="false"
  >
    <div v-if="state.productStats" style="padding: 16px;">
      <!-- 统计概览 -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">总物资数</div>
          <div class="stat-value">{{ state.productStats.total_products || 0 }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">总库存量</div>
          <div class="stat-value">{{ state.productStats.total_stock || 0 }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">低库存数</div>
          <div class="stat-value warning">{{ state.productStats.low_stock_count || 0 }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">缺货数</div>
          <div class="stat-value danger">{{ state.productStats.out_of_stock_count || 0 }}</div>
        </div>
      </div>

      <!-- 热门物资 -->
      <div style="margin-top: 20px;">
        <h3>🔥 热门物资排行</h3>
        <van-list>
          <van-cell
            v-for="(item, index) in (state.productStats.top_products || [])"
            :key="item.product_id"
            :title="item.product_name"
            :value="item.rental_count + ' 次租赁'"
          >
            <template #icon>
              <van-tag :type="index < 3 ? 'danger' : 'primary'" size="medium">
                {{ index + 1 }}
              </van-tag>
            </template>
          </van-cell>
        </van-list>
      </div>

      <!-- 分类统计 -->
      <div style="margin-top: 20px;">
        <h3>📊 分类统计</h3>
        <van-list>
          <van-cell
            v-for="item in (state.productStats.category_stats || [])"
            :key="item.category"
            :title="item.category"
            :value="item.count + ' 个物资'"
          />
        </van-list>
      </div>
    </div>
    <div style="padding: 16px;">
      <van-button block @click="state.showStatsDialog = false">
        关闭
      </van-button>
    </div>
  </van-dialog>

  <!-- 低库存预警对话框 -->
  <van-dialog
    v-model:show="state.showLowStockAlert"
    title="⚠️ 库存预警"
    :show-confirm-button="false"
  >
    <div style="padding: 16px;">
      <p>以下物资库存不足，请及时补充：</p>
      <van-list>
        <van-cell
          v-for="product in state.lowStockProducts"
          :key="product.id"
          :title="product.name"
          :value="product.total_stock + ' / ' + (product.min_stock || 0)"
        >
          <template #label>
            <div>规格：{{ product.spec || '无' }}</div>
          </template>
        </van-cell>
      </van-list>
    </div>
    <div style="padding: 16px;">
      <van-button block @click="state.showLowStockAlert = false">
        知道了
      </van-button>
    </div>
  </van-dialog>
</div>

<!-- 样式补充 -->
<style>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  background: #f7f8fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1989fa;
}

.stat-value.warning {
  color: #ff976a;
}

.stat-value.danger {
  color: #ee0a24;
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
</style>
`;

// ===== 使用说明 =====

/*
1. 将上述模板代码集成到 admin.js 的 getAdminHTML() 函数中
2. 确保在 Vue 应用的 setup 函数中返回所有新增的函数和状态
3. 在 CSS 部分添加上述样式代码
4. 确保后端 API 支持以下端点：
   - GET /api/products/stats - 获取物资统计数据
   - GET /api/products/:id/distribution - 获取物资分布数据
   - PUT /api/products - 更新物资（包含新增字段）
   - POST /api/products - 创建物资（包含新增字段）

5. 数据库表结构需要更新，添加以下字段：
   - category VARCHAR(50) - 物资分类
   - min_stock INT - 最低库存预警值
   - unit VARCHAR(20) - 计量单位
   - description TEXT - 描述说明

6. 在 api.js 中添加统计和分布查询的端点处理
*/

// ===== API 端点示例 =====

/*
// 在 api.js 中添加以下端点：

// 物资统计
case '/products/stats':
  const stats = await env.DB.prepare(`
    SELECT 
      COUNT(*) as total_products,
      SUM(total_stock) as total_stock,
      SUM(CASE WHEN total_stock <= min_stock THEN 1 ELSE 0 END) as low_stock_count,
      SUM(CASE WHEN total_stock = 0 THEN 1 ELSE 0 END) as out_of_stock_count
    FROM products
  `).first();

  // 热门物资
  const topProducts = await env.DB.prepare(`
    SELECT 
      p.id as product_id,
      p.name as product_name,
      COUNT(oi.id) as rental_count
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.id
    ORDER BY rental_count DESC
    LIMIT 10
  `).all();

  // 分类统计
  const categoryStats = await env.DB.prepare(`
    SELECT 
      category,
      COUNT(*) as count
    FROM products
    WHERE category IS NOT NULL AND category != ''
    GROUP BY category
    ORDER BY count DESC
  `).all();

  return new Response(JSON.stringify({
    ...stats,
    top_products: topProducts.results,
    category_stats: categoryStats.results
  }));

// 物资分布
case '/products/' + productId + '/distribution':
  const distribution = await env.DB.prepare(`
    SELECT 
      c.id as customer_id,
      c.name as customer_name,
      SUM(oi.quantity) as quantity,
      p.unit,
      MAX(o.order_date) as last_update
    FROM customers c
    JOIN orders o ON c.id = o.customer_id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE oi.product_id = ? AND o.type = 'OUT'
    GROUP BY c.id, c.name, p.unit
  `).bind(productId).all();

  return new Response(JSON.stringify(distribution.results));
*/

export { PRODUCT_MANAGEMENT_TEMPLATE };