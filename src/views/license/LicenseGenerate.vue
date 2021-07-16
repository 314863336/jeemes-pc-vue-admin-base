<template>
  <div class="app-container">
    <div class="license-center">
      <el-form ref="form" :model="license" :rules="rules" label-width="120px">
        <el-form-item label="许可证书级别">
          <el-radio-group v-model="license.userType">
            <el-radio label="profession">专业版</el-radio>
            <el-radio label="develop">开发版</el-radio>
            <el-radio label="ordinary">普通版</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="mac地址" prop="mac">
          <el-input v-model="license.mac" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit">确定</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { generateLicense } from '@/api/license/license.js'

export default {
  name: 'LicenseGenerate',
  data() {
    return {
      loading: false,
      license: {
        userType: 'profession',
        mac: ''
      },
      rules: {
        mac: [
          { required: true, message: '请输入许可地址', trigger: 'blur' },
          { pattern: /^([0-9a-fA-F]{2})(([/\s:-][0-9a-fA-F]{2}){5})$/, message: '请输入合法许可地址', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true
          generateLicense(this.license).then(res => {
            this.$message({
              type: 'success',
              message: '生成许可文件成功!'
            })
          }).finally(() => {
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
