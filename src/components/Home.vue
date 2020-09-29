<template>
  <el-container class="home-container">
    <!--    页面头部-->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--    内容-->
    <el-container>
      <!--      左侧边栏-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff"
                 unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true"
                 :default-active="activePath">
          <!--          一级菜单-->
          <el-submenu :index="item.id + ''" v-for="(item, index) in menuList" :key="item.id">
            <!--            一级菜单模板-->
            <template slot="title">
              <i :class=iconList[index]></i>
              <span>{{item.authName}}</span>
            </template>
            <!--            二级菜单-->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id"
                          @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--      中间内容-->
      <el-main>
        <!--        路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
  export default {
    name: "Home",
    created() {
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    data() {
      return {
        // 菜单数据
        menuList: [],
        // 图标数据
        iconList: [
          'iconfont icon-user',
          'iconfont icon-tijikongjian',
          'iconfont icon-shangpin',
          'iconfont icon-danju',
          'iconfont icon-baobiao'
        ],
        isCollapse: false,
        activePath: ''
      }
    },
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      // 获取所有菜单数据
      async getMenuList() {
        const {data: res} = await this.$http.get('menus')
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.menuList = res.data
      },
      // 对菜单栏进行折叠
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      // 对获取到的路径保存到sessionStorage中
      saveNavState(activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

    > div {
      display: flex;
      align-items: center;
    }

    span {
      padding-left: 20px;
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }

</style>