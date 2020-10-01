<template>
  <div>
    <!--  导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区-->
    <el-card>
      <!--      添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--      表格-->
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false"
                  show-index index-text="#" border :show-row-hover="false">
        <!--        确认是否有效-->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!--        排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!--        操作-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" @click="showUpdateCateDialog(scope.row.cat_id)">
            <i class="el-icon-edit"></i>编辑
          </el-button>
          <el-button type="danger" size="mini" @click="deleteCateInfo(scope.row.cat_id)">
            <i class="el-icon-delete"></i>删除
          </el-button>
        </template>
      </tree-table>
      <!--      分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]"
                     :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!--    添加分类对话框-->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!--      内容-->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级名称：">
          <el-cascader :options="parentCateList" :props="cascaderProps"
                       v-model="selectedKeys" @change="parentCateListChanged" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <!--      底部-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!--    修改分类名称对话框-->
    <el-dialog title="修改分类" :visible.sync="updateCateDialogVisible" width="50%">
      <!--      内容-->
      <el-form :model="updateCateForm" :rules="updateCateFormRules" ref="updateCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="updateCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!--      底部-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Cate",
    data() {
      return {
        // 查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        // 商品分类的数据列表
        cateList: [],
        // 商品分类总数据条数
        total: 0,
        // 为table添加列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            // 定义当前列为模板列
            type: 'template',
            // 模板名称
            template: 'isOk'
          },
          {
            label: '排序',
            type: 'template',
            template: 'order'
          },
          {
            label: '操作',
            type: 'template',
            template: 'opt'
          }
        ],
        // 控制添加分类对话框的显示与隐藏
        addCateDialogVisible: false,
        // 添加分类的数据
        addCateForm: {
          // 分类名称
          cat_name: '',
          // 父级分类ID，默认为0
          cat_pid: 0,
          // 分类的等级，默认为0，代表一级权限
          cat_level: 0
        },
        // 添加分类的规则
        addCateFormRules: {
          cat_name: [
            {required: true, message: '请输入分类名称', trigger: 'blur'}
          ]
        },
        // 保存父级分类列表中的数据
        parentCateList: [],
        // 级联选择器的配置属性
        cascaderProps: {
          // 选中的属性值
          value: 'cat_id',
          // 选中时显示的文本
          label: 'cat_name',
          // 级联选择器的子元素
          children: 'children',
          // 默认级联选择器为hover类型
          expandTrigger: 'hover',
          // 设置父子节点不严格遵守，可以选中父节点
          checkStrictly: true
        },
        // 级联选择器选中时的父级ID
        selectedKeys: [],
        // 控制修改分类名称对话框的显示与关闭
        updateCateDialogVisible: false,
        // 修改分类名称的信息
        updateCateForm: [],
        // 修改分类名称信息的验证规则
        updateCateFormRules: {
          cat_name: [
            {required: true, message: '请输入分类名称', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      async getCateList() {
        const {data: res} = await this.$http.get('categories', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类列表失败！')
        }
        // 为商品分类列表赋值
        this.cateList = res.data.result
        // 为商品总数据条数赋值
        this.total = res.data.total
      },
      // 监听当前页面大小的改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        // 刷新页面，重新获取数据
        this.getCateList()
      },
      // 监听当前页码的改变
      handleCurrentChange(newNum) {
        this.queryInfo.pagenum = newNum
        this.getCateList()
      },
      // 监听添加分类对话框的显示
      showAddCateDialog() {
        this.getParentCateList()
        this.addCateDialogVisible = true
      },
      // 获取父级分类列表数据
      async getParentCateList() {
        // 获取父级一级与二级分类数据
        const {data: res} = await this.$http.get('categories', {
          params: {type: 2}
        })
        if (res.meta.status !== 200) {
          this.$message.error('获取父级分类列表数据失败！')
        }
        this.parentCateList = res.data
      },
      // 当级联选择器发生变化时
      parentCateListChanged() {
        // 当selectedKeys的长度不为0，代表选中了父级分类
        if (this.selectedKeys.length > 0) {
          // 将选中的父级分类赋值
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
          // 将添加分类的等级修改为二级或者三级
          this.addCateForm.cat_level = this.selectedKeys.length
          return
        } else {
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }
      },
      // 点击确认修改分类列表
      addCate() {
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          const {data: res} = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加分类失败！')
          }
          this.$message.success('添加分类成功！')
          await this.getCateList()
          this.addCateDialogVisible = false
        })
      },
      // 监听添加分类按钮的关闭事件
      addCateDialogClosed() {
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      },
      // 监听修改分类名称的点击事件
      async showUpdateCateDialog(id) {
        const {data: res} = await this.$http.get('categories/' + id)
        if (res.meta.status !== 200) {
          this.$message.error('查询分类列表信息失败！')
        }
        this.updateCateForm = res.data
        this.updateCateDialogVisible = true
      },
      // 修改分类名称
      async updateCate() {
        const {data: res} = await this.$http.put('categories/' + this.updateCateForm.cat_id, {
          cat_name: this.updateCateForm.cat_name
        })
        if (res.meta.status !== 200) {
          this.$message.error('修改分类名称失败！')
        }
        this.$message.success('修改分类名称成功！')
        await this.getCateList()
        this.updateCateDialogVisible = false
      },
      // 删除分类数据
      async deleteCateInfo(id) {
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
        // 删除分类数据
        const {data: res} = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类信息失败！')
        }
        this.$message.success('删除分类信息成功！')
        await this.getCateList()
      }
    }
  }
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }
</style>