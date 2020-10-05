<template>
  <div>
    <!--  导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区-->
    <el-card>
      <!--      提示信息-->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!--      step进度步骤条-->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addGoodsForm" :rules="addGoodsFormRules" ref="addGoodsFormRef" label-width="100px"
               label-position="top">
        <!--      左侧tabs标签栏-->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader :options="cateList" :props="cateListProps"
                           v-model="addGoodsForm.goods_cat" @change="handleChange" clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
<!--            显示商品参数-->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item2" v-for="(item2, index2) in item.attr_vals" :key="index2" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
<!--          显示商品属性-->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadURL" :on-preview="handlePreview"
                       :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <mavon-editor v-model="addGoodsForm.goods_introduce" class="mavon-editor"></mavon-editor>
            <el-button type="primary" @click="addIntroduce">添加内容</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
<!--    预览图片的对话框-->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: "Add",
    data() {
      return {
        activeIndex: '0',
        // 添加商品的表单数据
        addGoodsForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          // 级联选择器选中时的ID
          goods_cat: [],
          // 保存图片的数组
          pics: [],
          // 商品内容
          goods_introduce: '',
          attrs: []
        },
        // 添加商品的表单验证规则
        addGoodsFormRules: {
          goods_name: [
            {required: true, message: '请输入商品名称', trigger: 'blur'}
          ],
          goods_price: [
            {required: true, message: '请输入商品价格', trigger: 'blur'}
          ],
          goods_weight: [
            {required: true, message: '请输入商品重量', trigger: 'blur'}
          ],
          goods_number: [
            {required: true, message: '请输入商品数量', trigger: 'blur'}
          ],
          goods_cat: [
            {required: true, message: '请选择商品分类', trigger: 'blur'}
          ]
        },
        // 获取商品分类数据
        cateList: [],
        // 级联选择器的prop规则
        cateListProps: {
          // 选中的属性值
          value: 'cat_id',
          // 选中时显示的文本
          label: 'cat_name',
          // 级联选择器的子元素
          children: 'children',
          // 默认级联选择器为hover类型
          expandTrigger: 'hover'
        },
        // 动态参数数据
        manyTableData: [],
        // 静态属性数据
        onlyTableData: [],
        // 添加图片上传的URL地址
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        headersObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        previewVisible: false,
        previewPath: ''
      }
    },
    created() {
      this.getCateList()
    },
    computed: {
      cateID() {
        if (this.addGoodsForm.goods_cat.length === 3) {
          return this.addGoodsForm.goods_cat[2]
        }
      }
    },
    methods: {
      // 获取商品分类数据
      async getCateList() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类信息失败!')
        }
        this.cateList = res.data
      },
      // 选中级联选择器时
      handleChange() {
        if (this.addGoodsForm.goods_cat.length !== 3) {
          this.addGoodsForm.goods_cat = []
        }
      },
      // 当切换tabs标签时，进行判断
      beforeTabLeave(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类！')
          return false
        }

      },
      // tabs标签被点击时
      async tabClicked() {
        if (this.activeIndex === '1') {
          const {data: res} = await this.$http.get(`categories/${this.cateID}/attributes`, {
            params: {
              sel: 'many'
            }
          });
          if (res.meta.status !== 200) {
            return this.$message.error('动态参数获取失败！')
          }
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          })
          this.manyTableData = res.data
        }else if (this.activeIndex === '2') {
          const {data: res} = await this.$http.get(`categories/${this.cateID}/attributes`, {
            params: {
              sel: 'only'
            }
          });
          if (res.meta.status !== 200) {
            return this.$message.error('静态属性获取失败！')
          }
          this.onlyTableData = res.data
        }

      },
      // 图片预览
      handlePreview(file) {
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      // 移除图片
      handleRemove(file) {
        const filePath = file.response.data.tmp_path
        const index = this.addGoodsForm.pics.findIndex(item => item.pic === filePath)
        this.addGoodsForm.pics.splice(index, 1)
      },
      // 添加成功后，保存图片路径
      handleSuccess(response) {
        const picInfo = {
          pic: response.data.tmp_path
        }
        this.addGoodsForm.pics.push(picInfo)
      },
      // 添加商品内容
      addIntroduce() {
        this.$refs.addGoodsFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请输入必要的表单项！')
          }
          // 对表单数据进行深拷贝
          const form = _.cloneDeep(this.addGoodsForm)
          form.goods_cat = form.goods_cat.join(',')
          // 处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addGoodsForm.attrs.push(newInfo)
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addGoodsForm.attrs.push(newInfo)
          })
          form.attrs = this.addGoodsForm.attrs
          // 添加商品信息
          const {data: res} = await this.$http.post('goods', form)
          if (res.meta.status !== 201) {
            return this.$message.error('添加商品信息失败！')
          }
          this.$message.success('添加商品信息成功！')
          await this.$router.push('/goods')
        })
      }
    }
  }
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

 .mavon-editor {
   height: 500px;
   margin-bottom: 20px;
 }
</style>