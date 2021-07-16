<template>
  <div class="app-container">
    <el-dialog
      :visible.sync="formDialogVisible"
      :close-on-click-modal="false"
      top="20px"
      width="80%"
      :show-close="false"
      :title="title"
    >
      <el-form ref="form" :rules="rules" :model="formData" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="消息标题" prop="msgTitle">
              <el-input v-model="formData.msgTitle" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="消息内容" class="quill-editor-form-item" prop="msgContent">
              <QuillEditor :form-data="formData" field="msgContent" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-tooltip class="item" effect="dark" content="保存基本信息" placement="top">
          <el-button type="primary" @click="saveForm">保存</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="关闭弹窗" placement="top">
          <el-button @click="cancelForm">取消</el-button>
        </el-tooltip>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getMessageDetail, saveMessage, updateMessage } from '@/api/message/receive'
import QuillEditor from '@/components/QuillEditor/index'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'MessageAppForm',
  components: { QuillEditor },
  props: {
  },
  data() {
    return {
      formDialogVisible: false,
      title: '',
      formData: {
        id: '',
        type: '1',
        readStatus: '2',
        msgTitle: '',
        msgContent: ''
      },
      rules: {
        msgTitle: [
          { required: true, message: '请输入消息标题', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        msgContent: [
          { required: true, message: '请输入消息内容', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict']),
    isAdd() {
      return !this.formData.id
    }
  },
  watch: {
  },
  methods: {
    addForm() {
      this.resetForm()
      this.title = '新增'
      this.formDialogVisible = true
    },
    cancelForm() {
      this.formDialogVisible = false
    },
    editForm(row) {
      this.formDialogVisible = true
      this.getDetailData(row.id)
    },
    getDetailData(id) {
      if (id) {
        const fullscreenLoading = loading()
        getMessageDetail({ id: id }).then(res => {
          this.formData = res.data
          this.title = '编辑'
        }).finally(() => {
          closeLoading(fullscreenLoading)
        })
      } else {
        this.resetForm()
      }
    },
    saveForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const fullscreenLoading = loading()
          if (this.formData.id) {
            updateMessage(this.formData).then(res => {
              this.$message({
                type: 'success',
                message: '保存成功!'
              })
              this.cancelForm()
              this.$emit('findTableData')
            }).finally(() => {
              closeLoading(fullscreenLoading)
            })
          } else {
            saveMessage(this.formData).then(res => {
              this.$message({
                type: 'success',
                message: '保存成功!'
              })
              this.cancelForm()
              this.$emit('findTableData')
            }).finally(() => {
              closeLoading(fullscreenLoading)
            })
          }
        }
      })
    },
    resetForm() {
      this.formData = {
        id: '',
        type: '1',
        readStatus: '2',
        msgTitle: '',
        msgContent: ''
      }
    }
  }
}
</script>

