<template>
  <div>
    <!--  导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区-->
    <el-card>
      <!--      警告区域-->
      <el-alert type="warning" title="注意：只能修改第三级分类的相关参数！" :closable="false" show-icon></el-alert>
      <!--      选择商品分类区域-->
      <el-row class="cat_opt">
        <el-col>
          <span>请选择商品分类：</span>
          <!--          使用级联选择器加载商品分类-->
          <el-cascader :options="cateList" :props="cascaderProps"
                       v-model="selectedKeys" @change="cateListChanged" clearable></el-cascader>
        </el-col>
      </el-row>
      <!--      Tabs标签区域-->
      <el-tabs v-model="activeName" @tab-click="tabClick" type="border-card">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogVisible=true">添加参数
          </el-button>
          <!--          动态参数表格-->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                        @close="deleteTagInfo(index, scope.row)">
                  {{item}}
                </el-tag>
                <!--                添加tag功能-->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New
                  Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showUpdateParamsDialog(scope.row)">
                  <i class="el-icon-edit"></i>编辑
                </el-button>
                <el-button type="danger" size="mini" @click="deleteParams(scope.row)">
                  <i class="el-icon-delete"></i>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogVisible=true">添加属性
          </el-button>
          <!--          静态属性表格-->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                        @close="deleteTagInfo(index, scope.row)">
                  {{item}}
                </el-tag>
                <!--                添加tag功能-->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New
                  Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showUpdateParamsDialog(scope.row)">
                  <i class="el-icon-edit"></i>编辑
                </el-button>
                <el-button type="danger" size="mini" @click="deleteParams(scope.row)">
                  <i class="el-icon-delete"></i>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--    添加动态参数或者静态属性对话框-->
    <el-dialog :title="'添加' + titleText" :visible.sync="addParamsDialogVisible" width="50%"
               @close="addParamsDialogClosed">
      <!--      内容-->
      <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="100px">
        <el-form-item :label="titleText + '：'" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!--      底部-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!--    修改动态参数或者静态属性对话框-->
    <el-dialog :title="'修改' + titleText" :visible.sync="updateParamsDialogVisible" width="50%"
               @close="updateParamsDialogClosed">
      <!--      内容-->
      <el-form :model="updateParamsForm" :rules="updateParamsFormRules" ref="updateParamsFormRef" label-width="100px">
        <el-form-item :label="titleText + '：'" prop="attr_name">
          <el-input v-model="updateParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!--      底部-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Params",
    data() {
      return {
        // 商品列表信息
        cateList: [],
        // 保存级联选择器选中的ID值
        selectedKeys: [],
        // 级联选择器的配置属性
        cascaderProps: {
          // 选中的属性值
          value: 'cat_id',
          // 选中时显示的文本
          label: 'cat_name',
          // 级联选择器的子元素
          children: 'children',
          // 默认级联选择器为hover类型
          expandTrigger: 'hover'
        },
        // Tabs标签页默认显示的name
        activeName: 'many',
        // 动态参数数据
        manyTableData: [],
        // 静态属性数据
        onlyTableData: [],
        // 动态参数或者静态属性数据
        addParamsForm: {
          attr_name: ''
        },
        // 控制添加参数对话框的显示与隐藏
        addParamsDialogVisible: false,
        // 动态参数或者静态属性验证规则
        addParamsFormRules: {
          attr_name: [
            {required: true, message: '请输入参数名称', trigger: 'blur'}
          ]
        },
        // 获取分类参数的数据
        updateParamsForm: [],
        // 控制修改参数对话框的显示与隐藏
        updateParamsDialogVisible: false,
        updateParamsFormRules: {
          attr_name: [
            {required: true, message: '请输入参数名称', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      this.getCateList()
    },
    computed: {
      // 控制按钮是否可用
      isBtnDisabled() {
        // 当选中不为三级分类时，设置按钮不可点击，返回true，否则返回false
        return this.selectedKeys.length !== 3
      },
      // 获取级联选择器选中的ID
      cateID() {
        if (this.selectedKeys.length !== 3) {
          return null
        }
        return this.selectedKeys[2]
      },
      // 计算文本为动态参数或者静态属性
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        } else {
          return '静态属性'
        }
      }
    },
    methods: {
      // 获取商品列表信息
      async getCateList() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表信息失败！')
        }
        this.cateList = res.data
      },
      // 级联选择器选中的内容发生变化
      cateListChanged() {
        this.getParamsInfo()
      },
      // 点击Tabs标签页触发
      tabClick(tab, event) {
        this.getParamsInfo()
      },
      // 获取分类参数的方法
      async getParamsInfo() {
        // 默认不允许选中一级与二级分类菜单
        if (this.selectedKeys.length < 3) {
          this.selectedKeys = []
          this.manyTableData = []
          this.onlyTableData = []
          return
        }
        // 当选中级联选择器中的三级分类时，获取动态参数或者静态属性
        const {data: res} = await this.$http.get(`categories/${this.cateID}/attributes`, {
          params: {
            sel: this.activeName
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败！')
        }
        // 获取attr_vals字符串，进行分割
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 控制输入框的显示
          item.inputVisible = false
          // 控制输入框输入的内容
          item.inputValue = ''
        })
        // 判断获取的数据是动态参数还是静态属性
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      },
      // 对话框关闭事件
      addParamsDialogClosed() {
        this.$refs.addParamsFormRef.resetFields()
      },
      // 添加参数
      addParams() {
        this.$refs.addParamsFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          const {data: res} = await this.$http.post(`categories/${this.cateID}/attributes`, {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            this.$message.error('添加参数失败！')
          }
          this.$message.success('添加参数成功！')
          await this.getParamsInfo()
          this.addParamsDialogVisible = false
        })
      },
      // 显示修改分类参数对话框
      async showUpdateParamsDialog(param) {
        const {data: res} = await this.$http.get(`categories/${this.cateID}/attributes/${param.attr_id}`, {
          params: {
            attr_sel: param.attr_sel
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类参数失败！')
        }
        this.updateParamsForm = res.data
        this.updateParamsDialogVisible = true
      },
      updateParamsDialogClosed() {
        this.$refs.updateParamsFormRef.resetFields()
      },
      // 修改参数
      async updateParams() {
        this.$refs.updateParamsFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          const {data: res} = await
              this.$http.put(`categories/${this.cateID}/attributes/${this.updateParamsForm.attr_id}`, {
                attr_name: this.updateParamsForm.attr_name,
                attr_sel: this.activeName
              })
          if (res.meta.status !== 200) {
            return this.$message.error('修改参数失败！')
          }
          this.$message.success('修改参数成功！')
          await this.getParamsInfo()
          this.updateParamsDialogVisible = false
        })
      },
      // 删除分类参数
      async deleteParams(param) {
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
        const {data: res} = await this.$http.delete(`categories/${this.cateID}/attributes/${param.attr_id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类参数失败！')
        }
        this.$message.success('删除分类参数成功！')
        await this.getParamsInfo()
      },
      // 当输入框失去焦点以及回车键时，添加tag标签
      handleInputConfirm(row) {
        // 当输入没有内容时，清空输入框中的内容
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        // 当没有执行if时，代表输入有内容
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveAttrVals(row)
      },
      // 修改标签
      async saveAttrVals(row) {
        const {data: res} = await this.$http.put(`categories/${this.cateID}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
        if (res.meta.status !== 200) {
          this.$message.error('修改标签失败！')
        }
        this.$message.success('修改标签成功！')
      },
      // 点击按钮切换成输入框
      showInput(row) {
        row.inputVisible = true
        // nextTick当页面被重新渲染之后才去调用回调函数
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      // 删除标签
      deleteTagInfo(index, row) {
        row.attr_vals.splice(index, 1)
        this.saveAttrVals(row)
      }
    }
  }
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
    width: 200px;
    height: 50px;
  }
</style>