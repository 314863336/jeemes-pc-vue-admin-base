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
                <el-form-item label="角色名称" prop="roleName">
                  <el-input v-model="formData.roleName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="角色编号" prop="roleCode">
                  <el-input v-model="formData.roleCode" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="角色权重" prop="roleType">
                  <el-tooltip class="item" effect="dark" content="角色分配菜单或岗位之后，角色权重将不可修改" placement="right">
                    <el-select v-model="formData.roleType" placeholder="请选择" :disabled="isDisabled">
                      <el-option
                        v-for="(item, index) in getDict('sys_user_type')"
                        :key="'wi'+index"
                        :label="item.dictLabel"
                        :value="parseInt(item.dictValue) "
                      />
                    </el-select>
                  </el-tooltip>
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
          <assign-menu ref="assignMenu" :form-data="formData" :related-data="relatedData" />
        </el-tab-pane>
        <el-tab-pane :disabled="isAdd" :label="activeNames[2].label" :name="activeNames[2].name">
          <AssignDataScope ref="assignDataScope" :form-data="formData" :related-data="relatedData" />
        </el-tab-pane>
        <el-tab-pane :disabled="isAdd" :label="activeNames[3].label" :name="activeNames[3].name">
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
        <el-tooltip class="item" effect="dark" content="保存分配菜单" placement="top">
          <el-button v-show="activeName==='2'" type="primary" @click="saveAssignMenu">保存</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="保存数据权限" placement="top">
          <el-button v-show="activeName==='3'" type="primary" @click="saveAssignDataScope">保存</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="保存分配岗位" placement="top">
          <el-button v-show="activeName==='4'" type="primary" @click="saveAssignPost">保存</el-button>
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
import AssignMenu from '@/views/system/role/AssignMenu.vue'
import AssignPost from '@/views/system/role/AssignPost.vue'
import AssignDataScope from '@/views/system/role/AssignDataScope.vue'
import { getRoleDetail, saveRole } from '@/api/system/role'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'RoleForm',
  components: { AssignMenu, AssignPost, AssignDataScope },
  props: {
  },
  data() {
    return {
      formDialogVisible: false,
      title: '',
      relatedData: {
        menuIds: [],
        postIds: []
      },
      formData: {
        id: '',
        roleName: '',
        roleCode: '',
        roleType: '',
        status: '0',
        remarks: ''
      },
      activeNames: [
        {
          name: '1',
          label: '基本信息'
        },
        {
          name: '2',
          label: '分配菜单'
        },
        {
          name: '3',
          label: '数据权限'
        },
        {
          name: '4',
          label: '分配岗位'
        }
      ],
      activeName: '1',
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        roleCode: [
          { required: true, message: '请输入角色编码', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        roleType: [
          { required: true, message: '请选择角色权重', trigger: 'change' }
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
    },
    isDisabled() {
      return (this.relatedData.menuIds && this.relatedData.menuIds.length > 0) || (this.relatedData.postIds && this.relatedData.postIds.length > 0)
    }
  },
  watch: {
  },
  methods: {
    addForm() {
      this.relatedData = {
        menuIds: [],
        postIds: []
      }
      this.resetForm()
      this.activeName = '1'
      this.title = '新增角色'
      this.formDialogVisible = true
    },
    cancelForm() {
      this.formDialogVisible = false
    },
    editForm(row) {
      this.getDetailData(row.id, '1')
    },
    getDetailData(id, currentActiveName) {
      const fullscreenLoading = loading()
      getRoleDetail({ id: id }).then(res => {
        this.formData = res.data
        this.relatedData = {
          menuIds: res.menuIds,
          postIds: res.postIds,
          dataScopeIds: res.dataScopeIds
        }
        if (currentActiveName) this.activeName = currentActiveName
        this.title = '编辑角色'
        this.formDialogVisible = true
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    },
    saveForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const fullscreenLoading = loading()
          saveRole(this.formData).then(res => {
            this.formData = res.data
            this.relatedData = {
              menuIds: res.menuIds,
              postIds: res.postIds,
              dataScopeIds: res.dataScopeIds
            }
            this.$message({
              type: 'success',
              message: '角色保存成功!'
            })
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
        roleName: '',
        roleCode: '',
        roleType: '',
        status: '0',
        remarks: ''
      }
    },
    assignMenu(row) {
      this.getDetailData(row.id, '2')
    },
    assignDataScope(row) {
      this.getDetailData(row.id, '3')
    },
    assignPost(row) {
      this.getDetailData(row.id, '4')
    },
    saveAssignMenu() {
      this.$refs.assignMenu.saveAssignMenu()
    },
    saveAssignDataScope() {
      this.$refs.assignDataScope.saveAssignDataScope()
    },
    saveAssignPost() {
      this.$refs.assignPost.saveAssignPost()
    }
  }
}
</script>

