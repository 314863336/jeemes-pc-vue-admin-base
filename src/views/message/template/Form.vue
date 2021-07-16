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
            <el-form-item label="模板编号" prop="tplCode">
              <el-input v-model="formData.tplCode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板消息类型" prop="tplType">
              <el-select v-model="formData.tplType" placeholder="请选择">
                <el-option
                  v-for="(item, index) in getDict('message_tpl_type')"
                  :key="'tp'+index"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板消息标题" prop="tplTitle">
              <el-input v-model="formData.tplTitle" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>
              <el-alert
                title="占位符请使用${}表示"
                type="info"
                :closable="false"
              />
            </el-form-item>

          </el-col>
          <el-col :span="24">
            <el-form-item label="模板消息内容" class="quill-editor-form-item" prop="tplContent">
              <QuillEditor :form-data="formData" field="tplContent" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">其他信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="22">
            <el-form-item label="备注" prop="remarks">
              <el-input
                v-model="formData.remarks"
                type="textarea"
                :rows="3"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-tooltip class="item" effect="dark" content="保存基本信息" placement="top">
          <el-button type="primary" @click="saveForm">保存</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="重置基本信息" placement="top">
          <el-button v-show="isAdd" @click="resetForm">重置</el-button>
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
import { getTemplateDetail, saveTemplate } from '@/api/message/template'
import QuillEditor from '@/components/QuillEditor/index'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'TemplateForm',
  components: { QuillEditor },
  props: {
  },
  data() {
    return {
      formDialogVisible: false,
      title: '',
      formData: {
        id: '',
        tplCode: '',
        tplType: '1',
        tplTitle: '',
        tplContentType: '1',
        tplContent: '',
        status: '0',
        remarks: ''
      },
      rules: {
        tplCode: [
          { required: true, message: '请输入模板编号', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        tplType: [
          { required: true, message: '请选择模板消息类型', trigger: 'change' }
        ],
        tplTitle: [
          { required: true, message: '请输入模板消息标题', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        tplContentType: [
          { required: true, message: '请选择消息文本类型', trigger: 'change' }
        ],
        tplContent: [
          { required: true, message: '请输入模板消息内容', trigger: 'blur' }
        ],
        remarks: [
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
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
      this.title = '新增模板'
      this.formDialogVisible = true
    },
    cancelForm() {
      this.formDialogVisible = false
    },
    editForm(row) {
      this.getDetailData(row.id)
    },
    getDetailData(id) {
      const fullscreenLoading = loading()
      getTemplateDetail({ id: id }).then(res => {
        this.formData = res.data
        this.title = '编辑模板'
        this.formDialogVisible = true
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    },
    saveForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const fullscreenLoading = loading()
          saveTemplate(this.formData).then(res => {
            this.formData = res.data
            this.relatedData = {
              menuIds: res.menuIds,
              postIds: res.postIds,
              dataScopeIds: res.dataScopeIds
            }
            this.$message({
              type: 'success',
              message: '模板保存成功!'
            })
            this.cancelForm()
            this.$emit('findTableData')
          }).finally(() => {
            closeLoading(fullscreenLoading)
          })
        }
      })
    },
    resetForm() {
      this.formData = {
        id: '',
        tplCode: '',
        tplType: '1',
        tplTitle: '',
        tplContentType: '1',
        tplContent: '',
        status: '0',
        remarks: ''
      }
    }
  }
}
</script>

