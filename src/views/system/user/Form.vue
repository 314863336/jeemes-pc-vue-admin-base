<template>

  <div class="app-container">
    <el-dialog
      :visible.sync="formDialogVisible"
      :close-on-click-modal="false"
      top="20px"
      :show-close="false"
      :title="title"
    >
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane :label="activeNames[0].label" :name="activeNames[0].name">
          <el-form ref="form" :rules="rules" :model="formData" label-width="120px">
            <el-divider content-position="left">基本信息</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="所属部门" prop="dept.officeName">
                  <el-input v-model="formData.dept.officeName" :disabled="true">
                    <el-button slot="append" icon="el-icon-search" @click="selectDept" />
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属公司" prop="company.officeName">
                  <el-input v-model="formData.company.officeName" :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="登陆账号" prop="loginCode">
                  <el-input v-model="formData.loginCode" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户昵称" prop="userName">
                  <el-input v-model="formData.userName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电子邮箱" prop="email">
                  <el-input v-model="formData.email" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号" prop="mobile">
                  <el-input v-model="formData.mobile" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="办公电话" prop="phone">
                  <el-input v-model="formData.phone" />
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
        </el-tab-pane>
        <el-tab-pane :disabled="isAdd" :label="activeNames[1].label" :name="activeNames[1].name">
          <assign-post ref="assignPost" :form-data="formData" :related-data="relatedData" />
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-tooltip class="item" effect="dark" content="保存基本信息" placement="top">
          <el-button v-show="activeName==='1'" type="primary" @click="saveForm">保存</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="重置基本信息" placement="top">
          <el-button v-show="isAdd && activeName==='1'" @click="resetForm">重置</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="保存分配岗位" placement="top">
          <el-button v-show="activeName==='2'" type="primary" @click="saveAssignPost">保存</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="关闭弹窗" placement="top">
          <el-button @click="cancelForm">取消</el-button>
        </el-tooltip>
      </div>
      <office-select ref="deptSelect" :dialog-data="{officeId:formData.deptId,title:'选择所属部门'}" @resetOffice="resetOffice" @setOffice="setParent" />
    </el-dialog>
  </div>

</template>

<script>
import { mapGetters } from 'vuex'
import OfficeSelect from '@/views/system/components/office/OfficeSelect.vue'
import AssignPost from '@/views/system/user/AssignPost.vue'
import { getUserDetail, saveUser } from '@/api/system/user'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'RoleForm',
  components: { OfficeSelect, AssignPost },
  props: {
    userType: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      rules: {
        userName: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        loginCode: [
          { required: true, message: '请输入登录账号', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        mobile: [
          { pattern: /^0{0,1}(13[0-9]|15[7-9]|153|156|18[7-9])[0-9]{8}$/, message: '请输入合法的手机号', trigger: 'blur' }
        ],
        email: [
          { pattern: /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g, message: '请输入正确的邮箱', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^\d{3}-\d{7,8}|\d{4}-\d{7,8}$/, message: '请输入合法的电话号', trigger: 'blur' }
        ],
        dept: {
          officeName: [
            { required: true, message: '请选择所属部门', trigger: 'change' }
          ]
        },
        company: {
          officeName: [
            { required: true, message: '请选择所属公司', trigger: 'change' }
          ]
        },
        remarks: [
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ]
      },
      formDialogVisible: false,
      relatedData: {},
      title: '',
      activeNames: [
        {
          name: '1',
          label: '基本信息'
        },
        {
          name: '2',
          label: '分配岗位'
        }
      ],
      formData: {
        id: '',
        deptId: '',
        companyId: '',
        dept: {
          id: '',
          officeName: ''
        },
        company: {
          id: '',
          officeName: ''
        },
        loginCode: '',
        userName: '',
        userType: 0,
        email: '',
        mobile: '',
        phone: '',
        status: '0',
        remarks: ''
      },
      activeName: '1'
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
  mounted() {
  },
  methods: {
    selectDept() {
      this.$refs.deptSelect.dialogVisible = true
    },
    setParent(node, companyNode) {
      if (node.officeType === this.$refs.deptSelect.officeType[0]) {
        this.$message({
          type: 'warning',
          message: '请选择部门!'
        })
      } else {
        this.formData.deptId = node.id
        this.formData.companyId = companyNode.id
        this.formData.dept = {
          id: node.id,
          officeName: node.officeName
        }
        this.formData.company = {
          id: companyNode.id,
          officeName: companyNode.officeName
        }
        this.$refs.deptSelect.cancelSelect()
      }
    },
    resetOffice() {
      this.formData.deptId = ''
      this.formData.companyId = ''
      this.formData.dept = {
        id: '',
        officeName: ''
      }
      this.formData.company = {
        id: '',
        officeName: ''
      }
    },
    getDetailData(id) {
      const fullscreenLoading = loading()
      getUserDetail({ id: id }).then(res => {
        if (!res.data.dept) {
          res.data.dept = {
            id: '',
            officeName: ''
          }
        }
        if (!res.data.company) {
          res.data.company = {
            id: '',
            officeName: ''
          }
        }
        this.relatedData.postIds = res.postIds
        this.formData = res.data

        this.title = '编辑用户'
        this.formDialogVisible = true
      }).finally(() => {
        fullscreenLoading.close()
      })
    },
    saveForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const fullscreenLoading = loading()
          saveUser(this.formData).then(res => {
            this.$message({
              type: 'success',
              message: '用户保存成功!'
            })
            this.formData = res.data
            this.$emit('findTableData')
          }).finally(() => {
            closeLoading(fullscreenLoading)
          })
        }
      })
    },
    cancelForm() {
      this.formDialogVisible = false
    },
    resetForm() {
      this.formData = {
        id: '',
        deptId: '',
        companyId: '',
        dept: {
          id: '',
          officeName: ''
        },
        company: {
          id: '',
          officeName: ''
        },
        loginCode: '',
        userName: '',
        userType: this.userType,
        email: '',
        mobile: '',
        status: '0',
        phone: '',
        remarks: ''
      }
    },
    addForm() {
      this.activeName = '1'
      this.resetForm()
      this.title = '新增用户'
      this.formDialogVisible = true
      const node = this.$parent.selectData.node
      const companyNode = this.$parent.selectData.companyNode
      if (companyNode === undefined) {
        this.formData.companyId = node.id
        this.formData.company = {
          id: node.id,
          officeName: node.officeName
        }
      } else {
        this.formData.deptId = node.id
        this.formData.companyId = companyNode.id
        this.formData.dept = {
          id: node.id,
          officeName: node.officeName
        }
        this.formData.company = {
          id: companyNode.id,
          officeName: companyNode.officeName
        }
      }
    },
    editForm(id) {
      this.activeName = '1'
      this.getDetailData(id)
    },
    assignPost(id) {
      this.activeName = '2'
      this.getDetailData(id)
    },
    saveAssignPost() {
      this.$refs.assignPost.saveAssignPost()
    }
  }
}
</script>

