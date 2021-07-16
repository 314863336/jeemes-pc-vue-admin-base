<template>
  <div>
    <el-form inline>
      <el-form-item>
        <el-upload
          ref="upload"
          accept=".xlsx, .xls"
          :action="importUrl"
          :headers="auth"
          :data="importParams"
          :limit="1"
          :auto-upload="false"
          :show-file-list="false"
          :file-list="fileList"
          :on-change="handleChangeFile"
        >
          <el-button type="primary">
            <i class="el-icon-upload2" />导入
          </el-button>
          <div slot="tip" class="el-upload__tip" style="color:red">只能上传xls/xlsx文件</div>
        </el-upload>
      </el-form-item>

      <el-form-item label="是否更新已经存在的数据">
        <el-switch v-model="ifUpdateExistsData" />
      </el-form-item>

      <el-form-item>
        <el-button type="text">
          <el-link type="primary" :href="templateUrl" target="_blank">
            <i class="el-icon-download" />下载模板
          </el-link>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  name: 'ImportExcel',
  props: {
    importUrl: {
      type: String,
      default: '',
      required: true
    },
    templateUrl: {
      type: String,
      default: '',
      required: true
    }
  },
  data() {
    return {
      loading: false,
      importParams: {},
      ifUpdateExistsData: false,
      fileList: [],
      auth: {
        Authorization: getToken()
      }
    }
  },
  methods: {
    handleChangeFile(file, fileList) {
      if (file.status === 'success') {
        if (file.response.result === 'false') {
          this.$message({
            type: 'error',
            message: file.response.msg
          })
        } else {
          this.$message({
            type: 'success',
            message: file.response.msg
          })
          this.$emit('hideImport')
          this.$emit('refreshTable')
        }
        this.$refs.upload.clearFiles()
        return
      }

      if (file.status !== 'ready') {
        return
      }
      const updateSupport = this.ifUpdateExistsData ? 1 : 0
      this.importParams = {
        updateSupport: updateSupport
      }
      this.$nextTick(() => {
        this.$refs.upload.submit()
      })
    }
  }
}
</script>

<style scoped>

</style>
