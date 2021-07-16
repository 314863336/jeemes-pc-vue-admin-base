<template>
  <div class="app-container">
    <div class="license-center">
      <el-form ref="form" :model="license" label-width="120px">
        <el-form-item label="许可证书级别:">
          {{ convert(license.userType) }}
        </el-form-item>
        <el-form-item label="mac地址:">
          {{ license.mac }}
        </el-form-item>
        <el-form-item v-show="license.userType === 'develop'" label="到期时间">
          {{ license.endDate }}
        </el-form-item>
        <el-form-item label="上传许可证书:">
          <el-upload
            class="upload-license"
            :action="action"
            accept=".lic"
            :headers="headers"
            :multiple="false"
            :limit="1"
            :show-file-list="false"
            name="file"
            :on-success="onSuccess"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>

import { getToken } from '@/utils/auth'

import { getLicenseContent } from '@/api/license/license.js'

export default {
  name: 'LicenseIndex',
  data() {
    return {
      action: process.env.VUE_APP_BASE_URL + '/license/uploadLicense',
      headers: {
        Authorization: getToken()
      },
      license: {
        userType: '',
        mac: '',
        endDate: ''
      }
    }
  },
  computed: {
  },
  mounted() {
    this.getLicenseContent()
  },
  methods: {
    convert(userType) {
      if (userType === 'ordinary') {
        return '普通版'
      } else if (userType === 'develop') {
        return '开发版'
      } else if (userType === 'profession') {
        return '专业版'
      } else {
        return ''
      }
    },
    getLicenseContent() {
      getLicenseContent().then(res => {
        this.license = res.data
      })
    },
    onSuccess(response, file, fileList) {
      if (response.code === 0) {
        this.$message({
          type: 'success',
          message: '许可证书上传成功!'
        })
      } else {
        this.$message({
          type: 'error',
          message: '许可证书上传失败，文件存在问题!'
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
