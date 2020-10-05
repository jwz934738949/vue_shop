<template>
  <div>
    <!--  导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!--      表格区域-->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="80px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
        <el-table-column label="添加时间" prop="add_time" width="150px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]"
                     :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "List",
    data() {
      return {
        // 查询参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        // 保存商品信息
        goodsList: [],
        // 商品信息总条数
        total: 0
      }
    },
    created() {
      this.getGoodsList()
    },
    methods: {
      // 获取商品信息
      async getGoodsList() {
        const {data: res} = await this.$http.get('goods', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品信息失败！')
        }
        this.$message.success('获取商品信息成功！')
        this.goodsList = res.data.goods
        this.total = res.data.total
      },
      // 切换每页个数
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
      },
      // 切换当前页码
      handleCurrentChange(newNum) {
        this.queryInfo.pagenum = newNum
      },
      // 删除商品信息
      async deleteGoods(id) {
        // 弹窗是否删除
        const confirmRes = await this.$confirm('是否彻底删除该分类信息？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: "warning"
        }).catch(err => err)
        // 用户取消删除，confirmRes为cancel，需要使用catch捕获
        // 用户确认删除，confirmRes为confirm
        if (confirmRes !== 'confirm') {
          return this.$message.info("已取消删除")
        }
        // 删除商品信息
        const {data: res} = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) {
          return this.$message('删除商品信息失败！')
        }
        this.$message.success('删除商品信息成功！')
        await this.getGoodsList()
      },
      // 跳转添加商品界面
      addGoods() {
        this.$router.push('/goods/add')
      }
    }
  }
</script>

<style lang="less" scoped>

</style>