<template>
  <div>
    <!--  导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片视图区-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!--      搜索添加-->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--      用户内容-->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--            修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!--            删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="deleteUserInfo(scope.row.id)"></el-button>
            <!--            文字提示分配角色-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRoles(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--      底部分页-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]"
                     :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!--    添加用户对话框区-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!--      内容-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--      底部-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--    修改用户对话框区-->
    <el-dialog title="修改用户" :visible.sync="updateDialogVisible" width="50%" @close="updateDialogClosed">
      <!--      内容-->
      <el-form :model="updateForm" :rules="updateFormRules" ref="updateFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="updateForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="updateForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="updateForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!--    分配角色对话框区-->
    <el-dialog title="分配角色" :visible.sync="setRolesDialogVisible" width="50%" @close="setRolesDialogClosed">
      <div>
        <p>当前用户：{{this.userInfo.username}}</p>
        <p>当前角色：{{this.userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRolesId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <!--      底部-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
  export default {
    name: "Users",
    data() {
      // 验证邮箱的规则
      const checkEmail = (rule, value, callback) => {
        // 验证邮箱的正则表达式
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          // 符合正则表达式
          return callback()
        }
        // 不符合正则表达式
        callback(new Error('请输入合法的邮箱'))
      }
      // 验证手机号的规则
      const checkMobile = (rule, value, callback) => {
        // 验证手机号的正则表达式
        const regMobile = /^(0|86|17651)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法的手机号'))
      }
      return {
        // 获取用户列表的参数
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        userList: [],
        total: 0,
        addDialogVisible: false,
        // 添加用户的表单信息
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 添加用户表单的规则
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '用户名的长度在 3 到 10 个字符之间', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 15, message: '密码的长度在 6 到 15 个字符之间', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 控制修改用户对话框的显示与隐藏
        updateDialogVisible: false,
        // 获取修改用户的所有信息
        updateForm: [],
        // 修改用户表单规则
        updateFormRules: {
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 控制分配角色对话框的显示与隐藏
        setRolesDialogVisible: false,
        // 获取分配角色时当前用户信息
        userInfo: {},
        // 获取所有的角色列表
        rolesList: [],
        // 已选中的角色ID
        selectedRolesId: ''
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      // 获取用户列表数据
      async getUserList() {
        const {data: res} = await this.$http.get('users', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取用户列表失败！')
        }
        this.userList = res.data.users
        this.total = res.data.total
      },
      // 监听pageSize的改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      // 监听当前页码的改变
      handleCurrentChange(newSize) {
        this.queryInfo.pagenum = newSize
        this.getUserList()
      },
      // 监听用户状态的改变
      async userStateChanged(userInfo) {
        const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          this.$message.error('修改用户状态失败！')
        }
        this.$message.success('修改用户状态成功！')
      },
      // 监听关闭添加用户对话框的点击
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 添加用户信息
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          // 添加信息合法，进行添加用户信息操作
          const {data: res} = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加用户失败！')
          }
          this.$message.success('添加用户成功！')
          // 关闭添加用户对话框
          this.addDialogVisible = false
          // 刷新用户列表数据
          await this.getUserList()
        })
      },
      // 修改用户信息
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询用户信息失败！')
        }
        this.updateForm = res.data
        this.updateDialogVisible = true
      },
      // 监听修改用户表单的关闭
      updateDialogClosed() {
        this.$refs.updateFormRef.resetFields()
      },
      // 修改用户信息并提交
      updateUserInfo() {
        this.$refs.updateFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          // 修改用户信息
          const {data: res} = await this.$http.put('users/' + this.updateForm.id, {
            email: this.updateForm.email,
            mobile: this.updateForm.mobile
          })
          if (res.meta.status !== 200) {
            this.$message.error("修改用户信息失败！")
          }
          // 关闭对话框
          this.updateDialogVisible = false
          // 刷新用户信息列表
          await this.getUserList()
          // 提示修改成功
          this.$message.success("修改用户信息成功！")
        })
      },
      // 删除用户信息
      async deleteUserInfo(id) {
        // 弹窗是否删除
        const confirmRes = await this.$confirm('是否彻底删除该用户信息？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: "warning"
        }).catch(err => err)
        // 用户取消删除，confirmRes为cancel，需要使用catch捕获
        // 用户确认删除，confirmRes为confirm
        if (confirmRes !== 'confirm') {
          return this.$message.info("已取消删除")
        }
        // 删除用户
        const {data: res} = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除用户成功！')
        await this.getUserList()
      },
      // 分配角色
      async setRoles(userInfo) {
        this.userInfo = userInfo
        // 获取所有角色列表
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败！')
        }
        this.rolesList = res.data
        console.log(this.rolesList)
        this.setRolesDialogVisible = true
      },
      // 为用户分配角色
      async saveRolesInfo() {
        if (!this.selectedRolesId) {
          return this.$message.error('请选择要分配的角色！')
        }
        const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {
          rid: this.selectedRolesId
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色失败！')
        }
        this.$message.success('更新角色成功！')
        await this.getUserList()
        this.setRolesDialogVisible = false
      },
      // 监听分配角色对话框的关闭
      setRolesDialogClosed() {
        this.selectedRolesId = ''
        this.userInfo = {}
      }
    }
  }
</script>

<style lang="less" scoped>

</style>