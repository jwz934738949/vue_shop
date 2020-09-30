<template>
  <div>
    <!--  导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区-->
    <el-card>
      <!--      添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!--      角色区域列表-->
      <el-table :data="rolesList" border stripe>
        <!--        展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['bdBottom', (i1 === 0) ?
            'bdTop' : '', 'vCenter']">
              <!--              渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="deleteRightsById(scope.row, item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--              渲染二级与三级权限-->
              <el-col :span="19">
                <!--                通过v-for获取一级权限的子权限，二级权限-->
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id"
                        :class="[(i2 === 0) ? '' : 'bdTop', 'vCenter']">
                  <!--                  渲染二级权限-->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="deleteRightsById(scope.row, item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--                  渲染三级权限-->
                  <el-col :span="18">
                    <el-tag v-for="(item3, i3) in item2.children" :key="item3.id" type="warning" closable
                            @close="deleteRightsById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--        索引列-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightsDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="分配权限" :visible.sync="setRightsDialogVisible" width="50%" @close="setRightsDialogClosed">
      <!--      树形权限信息-->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
               :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <!--      底部-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightsDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Roles",
    data() {
      return {
        // 角色列表
        rolesList: [],
        // 控制分配权限对话框的显示与隐藏
        setRightsDialogVisible: false,
        // 角色所有权限
        rightsList: [],
        // 属性控件的属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        // 默认选中的权限ID
        defKeys: [],
        // 当前分配权限的角色ID
        roleId: ''
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      // 获取角色列表
      async getRolesList() {
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败！')
        }
        this.rolesList = res.data
      },
      // 监听删除三级权限的事件
      async deleteRightsById(roles, rightsId) {
        // 弹出提示框
        const confirmRes = await this.$confirm('是否彻底删除该用户权限？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: "warning"
        }).catch(err => err)
        if (confirmRes !== 'confirm') {
          return this.$message.info("已取消删除")
        }
        const {data: res} = await this.$http.delete(`roles/${roles.id}/rights/${rightsId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户权限失败！')
        }
        this.$message.success('删除用户权限成功！')
        roles.children = res.data
      },
      // 显示分配角色权限的对话框
      async showSetRightsDialog(role) {
        // 获取角色ID
        this.roleId = role.id
        // 获取权限，以树形结构显示出来
        const {data: res} = await this.$http.get('rights/tree')
        if (res.meta.status != 200) {
          return this.$message.error('获取权限数据失败！')
        }
        this.rightsList = res.data
        this.getRightsId(role, this.defKeys)
        this.setRightsDialogVisible = true
      },
      // 动态获取三级权限的ID
      getRightsId(node, arr) {
        // 判断当前结点是否为三级权限，是就直接将ID值放入数组中
        if (!node.children) {
          return arr.push(node.id)
        }
        // 如果不是三级权限，则遍历node的children属性，递归获取三级权限的方法
        node.children.forEach(item => this.getRightsId(item, arr))
      },
      // 监听分配权限对话框的关闭
      setRightsDialogClosed() {
        // 关闭对话框之后，清空获取到的三级权限的ID
        this.defKeys = []
      },
      // 分配权限
      async allotRights() {
        const keys = [
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const keyStr = keys.join(',')
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {
          rids: keyStr
        })
        if (res.meta.status !== 200) {
          this.$message.error('分配权限失败！')
        }
        this.$message.success('分配权限成功！')
        await this.getRolesList()
        this.setRightsDialogVisible = false
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdTop {
    border-top: 1px solid #eee;
  }

  .bdBottom {
    border-bottom: 1px solid #eee;
  }

  .vCenter {
    display: flex;
    align-items: center;
  }
</style>