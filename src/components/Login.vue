<template>
  <div class="login_container">
    <div class="login_box">
      <!--      头像-->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!--      输入-->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0" class="loginForm">
        <!--        用户名-->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!--        密码-->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <!--        按钮-->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Login",
    data() {
      return {
        // 登录表单的数据
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        // 登录表单的验证规则
        loginFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      // 重置登录表单
      resetLoginForm() {
        this.$refs.loginFormRef.resetFields()
      },
      // 登录
      login() {
        this.$refs.loginFormRef.validate(async valid => {
          const {data: res} = await this.$http.post('login', this.loginForm)
          if (res.meta.status !== 200) {
            this.$message.error('登录失败！')
          }else {
            this.$message.success('登录成功！')
            // 登录成功以后，将代表用户的token值保存到sessionStroage中去
            // 只有在登录成功以后，才会将token值保存，在进行其他操作时，会验证token值来保证是否允许使用其他功能
            window.sessionStorage.setItem('token', res.data.token)
            // 通过后跳转到home主页中去
            this.$router.push('/home')
          }

        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      box-shadow: 0 0 10px #ddd;
      padding: 10px;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }

  .loginForm {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }

</style>