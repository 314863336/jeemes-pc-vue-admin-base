<template>
  <el-container class="page">
    <el-header class="head" height="100px">
      <img src="@/assets/login/logo.png" alt="河口蓝色经济产业园智慧化工园区" class="logo" width="589" height="31">
    </el-header>
    <el-container>
      <el-main class="main">
        <el-row>
          <el-col :span="16" class="banner">
            <img src="../../assets/login/banner.png" alt>
          </el-col>
          <el-col :span="8">
            <div class="login-panel">
              <div class="site-title">智慧路灯管理系统</div>
              <el-form ref="loginForm" :model="loginForm" :rules="loginRules" status-icon>
                <el-form-item prop="username">
                  <el-input ref="username" v-model.number="loginForm.username" placeholder="账号" />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    ref="password"
                    v-model="loginForm.password"
                    placeholder="密码"
                    type="password"
                    autocomplete="off"
                    @keyup.enter.native="handleLogin"
                  />
                </el-form-item>
                <el-form-item v-show="needCaptcha" prop="captcha">
                  <span class="svg-container">
                    <svg-icon icon-class="iconfont jeemes-icon_safety" />
                  </span>
                  <el-input
                    ref="captcha"
                    v-model="loginForm.captcha"
                    placeholder="验证码"
                    name="captcha"
                    type="text"
                    tabindex="1"
                    auto-complete="on"
                  />
                  <span class="show-captcha" @click="getCaptcha">
                    <el-image slot="append" :lazy="false" :src="captchaSrc" />
                  </span>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    style="width: 100%;"
                    :loading="loading"
                    @click.native.prevent="handleLogin"
                  >登 录</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
    <el-footer class="foot" height="170px" />
  </el-container>
</template>

<script>
import { checkIp, getCaptcha } from '@/api/system/login'
import _ from 'lodash'

export default {
  name: 'LoginV2',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        captcha: ''
      },
      loginRules: {
        username: [
          { required: true, message: '用户名不能为空！', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空！', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        checkPass: [
          { required: true, message: '验证码不能为空！', trigger: 'blur' }
        ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      needCaptcha: false
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    } else if (this.loginForm.checkPass === '') {
      this.$refs.checkPass.focus()
    }
  },
  destroyed() {
  },
  methods: {
    checkIp() {
      checkIp().then(res => {
        if (res.data === false) {
          this.getCaptcha()
          this.needCaptcha = true
        }
      })
    },
    getCaptcha() {
      getCaptcha().then(res => {
        this.captchaSrc = res.data
        this.captchaKey = res.captchaKey
      })
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      if (this.needCaptcha) {
        this.loginRules.captcha = [{ required: true, trigger: 'blur' }]
      } else {
        if (this.loginRules.captcha) delete this.loginRules.captcha
      }
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const formData = Object.assign({}, this.loginForm)
          if (this.needCaptcha) {
            formData.captchaKey = this.captchaKey
          } else {
            if (formData.captcha) delete formData.captcha
            if (formData.captchaKey) delete formData.captchaKey
          }
          this.$store.dispatch('user/login', formData).then(() => {
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch(res => {
            const code = _.get(res, 'response.data.code')
            if (code === 111) {
              this.loginForm.password = ''
            } else if (code === 112) {
              this.checkIp()
              this.loginForm.password = ''
            }
            this.loginForm.captcha = ''
            this.loading = false
          })
        } else {
          console.log('提交失败！')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="less" scoped>
.page {
  overflow: hidden;
  min-width: 1000px;
  height: 100vh;
  min-height: 600px;
  margin: auto;
  background-image: url("../../assets/login/bg.png");
  background-repeat: no-repeat;
  // background-position: cover;
  background-size: cover;
  .head {
    .logo {
      margin-top: 32px;
      margin-left: 64px;
    }
  }
  .foot {
    background-image: url("../../assets/login/footer.png");
    background-repeat: repeat-x;
    background-position: top center;
  }
  .main {
    padding: 0;
    .banner {
      // overflow: hidden;
      text-align: center;
      img {
        margin-top: 10vh;
      }
    }
  }
  .login-panel {
    position: absolute;
    background-color: greenyellow;
    width: 330px;
    // min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    top: 50%;
    margin-top: -150px;
    padding: 24px;
    border: 2px solid rgba(24, 144, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.07);
    border-radius: 6px;
    .site-title {
      color: white;
      text-align: center;
      font-size: 24px;
      line-height: 32px;
      // padding: 8px 0;
      margin-bottom: 16px;
    }
  }
}
</style>
