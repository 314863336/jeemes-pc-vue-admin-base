<template>
  <div class="app-container">
    <el-form ref="form" :rules="rules" :model="form" label-width="120px">
      <div class="over-card">
        <el-divider content-position="left">基本信息</el-divider>
        <el-col :span="11">
          <el-form-item label="上级部门">
            <el-input v-show="false" v-model="form.id" />
            <el-input v-show="false" v-model="form.parentId" />
            <el-input v-show="false" v-model="form.parentIds" />
            <el-input v-model="form.parentName" :readonly="true">
              <el-button slot="append" icon="el-icon-search" @click="selectOffice" />
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="所属公司" prop="companyName">
            <el-input v-show="false" v-model="form.companyId" />
            <el-input v-model="form.companyName" :readonly="true">
              <el-button slot="append" icon="el-icon-search" @click="selectCorp" />
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="部门编号" prop="officeCode">
            <el-input v-model="form.officeCode" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="部门名称" prop="officeName">
            <el-input v-model="form.officeName" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="部门全称" prop="fullName">
            <el-input v-model="form.fullName" />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="11">
          <el-form-item label="排序" prop="treeSort">
            <el-input v-model="form.treeSort" />
          </el-form-item>
        </el-col> -->
      </div>
      <div class="over-card">
        <el-divider content-position="left">详细信息</el-divider>
        <el-col :span="11">
          <el-form-item label="负责人">
            <el-input v-model="form.leader" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="办公电话" prop="phone">
            <el-input v-model="form.phone" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="联系地址">
            <el-input v-model="form.address" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="邮政编码">
            <el-input v-model="form.zipCode" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="电子邮箱" prop="email">
            <el-input v-model="form.email" />
          </el-form-item>
        </el-col>
        <el-col :span="22">
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="form.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入内容"
            />
          </el-form-item>
        </el-col>
      </div>
    </el-form>
    <el-dialog
      :visible.sync="officeDialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      top="20px"
      width="30%"
      title="上级部门"
    >
      <OfficeSelect
        ref="officeSelect"
        :parent-id="form.id"
        :office-dialog-visible="officeDialogVisible"
        @hideOfficeDialog="hideOfficeDialog"
        @setParentOffice="setParentOffice"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveParentOffice">保存</el-button>
        <el-button @click="cleanParentOffice">清除</el-button>
        <el-button @click="cancelParentOffice">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="corpDialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      top="20px"
      width="30%"
      title="所属公司"
    >
      <CorpSelect
        ref="corpSelect"
        :company-id="form.companyId"
        :corp-dialog-visible="corpDialogVisible"
        @hideDialog="hideDialog"
        @setParent="setParent"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveParentCorp">保存</el-button>
        <el-button @click="cleanParentCorp">清除</el-button>
        <el-button @click="cancelParentCorp">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { saveOrUpdateTree, getDetail } from '@/api/system/corp'
import OfficeSelect from './OfficeSelect.vue'
import CorpSelect from './CorpSelect.vue'

export default {
  name: 'CorpForm',
  components: { CorpSelect, OfficeSelect },
  props: {
    id: {
      type: String,
      default: ''
    },
    formDialogVisible: Boolean,
    parent: {
      type: Object,
      default: null
    },
    company: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      officeDialogVisible: false,
      corpDialogVisible: false,
      form: {
        id: '',
        parentId: '',
        parentIds: '',
        companyId: '',
        parentName: '',
        treeLevel: 0,
        officeType: 1,
        officeName: '',
        fullName: '',
        officeCode: '',
        treeSort: 0,
        leader: '',
        phone: '',
        address: '',
        zipCode: '',
        email: '',
        remarks: '',
        status: 0
      },
      rules: {
        companyName: [
          { required: true, message: '请选择所属公司', trigger: 'blur' }
        ],
        officeName: [
          { required: true, message: '请输入公司名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        fullName: [
          { required: true, message: '请输入公司全称', trigger: 'blur' }
        ],
        officeCode: [
          { required: true, message: '请输入公司编号', trigger: 'blur' }
        ],
        // treeSort: [
        //   { required: true, message: '请输入排序号', trigger: 'blur' }
        // ]
        remarks: [
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/, message: '请输入合法手机号/电话号', trigger: 'blur' }
        ],
        email: [
          { pattern: /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g, message: '请输入正确的邮箱', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    formDialogVisible: {
      handler(val) {
        this.initFormData()
      },
      immediate: true
    }
  },
  methods: {
    initFormData() {
      if (this.id && this.id.trim() !== '') {
        getDetail({ id: this.id }).then(res => {
          const data = res.data
          if (data.parentId === data.companyId) {
            data.parentName = ''
          }
          this.form = data
        })
      } else {
        this.resetForm()
        if (this.parent && this.parent.id) {
          this.form.parentId = this.parent.id
          this.form.companyId = this.parent.companyId
          this.form.companyName = this.parent.companyName
          this.form.parentName = this.parent.officeName
        } else if (this.company && this.company.id) {
          this.form.parentId = this.company.id
          this.form.companyId = this.company.id
          this.form.companyName = this.company.officeName
        }
      }
      // 保证首次加载dom完成后再执行
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    resetForm() {
      this.form = {
        id: '',
        parentId: '',
        parentIds: '',
        parentName: '',
        companyName: '',
        treeLevel: 0,
        officeType: 1,
        officeName: '',
        fullName: '',
        officeCode: '',
        treeSort: 0,
        leader: '',
        phone: '',
        address: '',
        zipCode: '',
        email: '',
        remarks: '',
        status: 0
      }
    },
    refreshTable() {
      this.$emit('refreshTable')
    },
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          saveOrUpdateTree(this.form).then(res => {
            this.refreshTable()
            this.resetForm()
            this.$emit('hideDialog')
            this.$message({
              type: 'success',
              message: '部门保存成功!'
            })
          })
        }
      })
    },
    onCancel() {
      this.$emit('hideDialog')
    },
    selectOffice() {
      this.officeDialogVisible = true
    },
    hideOfficeDialog() {
      this.officeDialogVisible = false
    },
    saveParentOffice() {
      this.$refs.officeSelect.onSubmit()
    },
    cleanParentOffice() {
      this.$refs.officeSelect.resetTree()
    },
    cancelParentOffice() {
      this.$refs.officeSelect.onCancel()
    },
    setParentOffice(obj, companyNode) {
      if (obj) {
        this.form.parentId = obj.id
        this.form.parentName = obj.officeName
      } else {
        this.form.parentId = ''
        this.form.parentName = ''
      }
      if (companyNode) {
        this.form.companyId = companyNode.id
        this.form.companyName = companyNode.officeName
      } else {
        this.form.companyId = ''
        this.form.companyName = ''
      }
    },
    selectCorp() {
      this.corpDialogVisible = true
    },
    hideDialog() {
      this.corpDialogVisible = false
    },
    saveParentCorp() {
      this.$refs.corpSelect.onSubmit()
    },
    cleanParentCorp() {
      this.$refs.corpSelect.resetTree()
    },
    cancelParentCorp() {
      this.$refs.corpSelect.onCancel()
    },
    setParent(obj) {
      if (obj) {
        this.form.companyId = obj.id
        this.form.companyName = obj.officeName
      } else {
        this.form.companyId = null
        this.form.companyName = ''
      }
      this.$refs['form'].validateField(['companyName'])
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
.info-head{
  color: blueviolet
}
.over-card{
  overflow: auto;
}
</style>

