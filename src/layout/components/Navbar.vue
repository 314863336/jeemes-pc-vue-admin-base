<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              主页
            </el-dropdown-item>
          </router-link>

          <router-link to="/personalCenter">
            <el-dropdown-item>
              个人中心
            </el-dropdown-item>
          </router-link>

          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <router-link to="/message">
      <div class="custom-right-menu">
        <el-badge :value="count" :max="99" type="primary" class="item">
          <el-button type="text">
            <i class="el-icon-message" title="我的信箱" />
          </el-button>
        </el-badge>

      </div>
    </router-link>

    <el-dialog
      :visible.sync="formDialogVisible"
      :close-on-click-modal="false"
      top="20px"
      width="80%"
      :show-close="false"
      title="查看消息"
    >
      <div class="ql-editor" v-html="currentRow.msgContent">
        {{ currentRow.msgContent }}
      </div>
      <div slot="footer" class="dialog-footer">
        <el-tooltip class="item" effect="dark" content="关闭弹窗" placement="top">
          <el-button @click="formDialogVisible=false">关闭</el-button>
        </el-tooltip>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { getMessageDetail, getMessageCount, getNewMessage } from '@/api/message/receive'
import { loading, closeLoading } from '@/utils/loading'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      formDialogVisible: false,
      currentRow: {
        msgContent: ''
      },
      interval: null
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ]),
    ...mapState('message', ['count'])
  },
  mounted() {
    this.getNewMessage(true)
  },
  methods: {
    ...mapActions('message', ['setCount', 'setNewMessage', 'setReadedData']),
    getDetailData(id) {
      const fullscreenLoading = loading()
      getMessageDetail({ id: id }).then(res => {
        this.setReadedData(res.data)
        this.currentRow = res.data
        this.formDialogVisible = true
        this.getMessageCount()
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    },
    getMessageCount() {
      getMessageCount().then(res => {
        this.setCount(res.data ? res.data : 0)
      })
    },
    getNewMessage(isFirst) {
      getNewMessage().then(res => {
        if (isFirst) {
          // 第一次进入页面，不会将未推送消息提示出来
          this.interval = setInterval(() => {
            // 有可能退出登录之后，定时器还在执行最后一次，导致后端验证失败
            if (this.$route.path === '/dashboard') this.getNewMessage()
          }, parseInt(process.env.VUE_APP_MESSAGE_TIME))
        } else {
          if (res.data && res.data.length > 0) {
            this.setNewMessage(1)
            for (let index = 0; index < res.data.length; index++) {
              const element = res.data[index]
              setTimeout(() => {
                this.showNotify(element)
              }, 300 * index)
            }
          }
        }
        if (res.data && res.data.length > 0) {
          this.getMessageCount()
        }
      }).catch(() => {
        this.interval && clearInterval(this.interval)
      })
    },
    showNotify(data) {
      this.$notify({
        title: '您有一条新的消息',
        position: 'bottom-right',
        duration: 5000,
        dangerouslyUseHTMLString: true,
        onClick: () => {
          this.getDetailData(data.id)
        },
        message: '<p><a class="el-link el-link--success is-underline"><span class="el-link--inner">标题: ' + data.msgTitle + '</span></a></p><p><a class="el-link el-link--success is-underline"><span class="el-link--inner">发送人: ' + data.sendUserName + '</span></a></p>'
      })
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      // this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      this.$router.push(`/login`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>

<style lang="less">
.custom-right-menu{
  float: right;
  height: 100%;
  line-height: 50px;
  padding-right: 30px;
  .el-icon-message{
    color: #97a8be;
    font-size: 25px
  }
  .el-badge__content.is-fixed{
    top: 10px;
  }
}
</style>
