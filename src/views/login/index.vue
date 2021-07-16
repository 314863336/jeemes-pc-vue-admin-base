<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

      <div class="title-container">
        <div class="top">
          <div class="header">
            <a href="/">
              <img src="/logo.svg" class="logo" alt="logo">
              <span class="title">智慧路灯</span>
            </a>
          </div>
          <div class="desc">
            JEEMES 慧泰智能快速开发平台
          </div>
        </div>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="iconfont jeemes-icon_signal_fill" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="iconfont jeemes-icon_passport" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'iconfont jeemes-icon_eye-slash' : 'iconfont jeemes-icon_eye-open'" />
        </span>
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

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登录</el-button>

    </el-form>
    <div class="footer">
      <div class="links">
        <a href="http://www.sdhtzn.com/" target="_blank">官网</a>
        <a href="http://www.sdhtzn.com/col.jsp?id=141" target="_blank">关于慧泰</a>
        <a href="http://www.sdhtzn.com/col.jsp?id=124#fai_1307_top2_col" target="_blank">产品中心</a>
      </div>
      <div class="copyright">
        Copyright &copy; 2020 慧泰智能平台组出品
      </div>
    </div>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { checkIp, getCaptcha } from '@/api/system/login'
import _ from 'lodash'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        captcha: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      needCaptcha: false,
      captchaSrc: '',
      captchaKey: ''
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  mounted() {
    this.checkIp()
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
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#d8d9dc;
$light_gray:#666;
$cursor: #666;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    margin-left: 10px;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$dark_gray:#889aa4;

.login-container {
  min-height: 100%;
  width: 100%;
  background: #f0f2f5 url('/background.svg') no-repeat 50%;
  background-size: 100%;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;
    left: -8px;
    .top {
        text-align: center;
        .header {
          height: 44px;
          line-height: 44px;
          .logo {
            height: 44px;
            vertical-align: top;
            margin-right: 2px;
            border-style: none;
          }
          .title {
            font-size: 33px;
            color: rgba(0, 0, 0, .85);
            font-family: Avenir, 'Helvetica Neue', Arial, Helvetica, sans-serif;
            font-weight: 600;
            position: relative;
            top: 2px;
          }
        }
        .desc {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
          margin-top: 12px;
          margin-bottom: 40px;
        }
      }
  }

  .show-captcha{
    position: absolute;
    right: 2px;
    top: 2px;
    font-size: 12px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .footer {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 0 16px;
    margin: 48px 0 18px;
    text-align: center;

    .links {
      margin-bottom: 8px;
      font-size: 14px;
      a {
        color: rgba(0, 0, 0, 0.45);
        transition: all 0.3s;
        &:not(:last-child) {
          margin-right: 40px;
        }
      }
    }
    .copyright {
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
    }
  }
}
</style>
