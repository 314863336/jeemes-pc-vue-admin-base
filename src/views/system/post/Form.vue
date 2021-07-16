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
                <el-form-item label="上级岗位" prop="parentPost.postName">
                  <el-input v-model="formData.parentPost.postName" :disabled="true">
                    <el-button slot="append" icon="el-icon-search" @click="selectParentPost" />
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="岗位名称" prop="postName">
                  <el-input v-model="formData.postName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="岗位编号" prop="postCode">
                  <el-input v-model="formData.postCode" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="岗位权重" prop="postType">
                  <el-tooltip class="item" effect="dark" content="岗位权重不可以大于父岗位权重,岗位分配角色或用户之后，岗位权重将不可修改" placement="right">
                    <el-select v-model="formData.postType" placeholder="请选择" :disabled="isDisabled">
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
          <assign-role ref="assignRole" :form-data="formData" :related-data="relatedData" />
        </el-tab-pane>

        <el-tab-pane :disabled="isAdd" :label="activeNames[2].label" :name="activeNames[2].name">
          <assign-user ref="assignUser" :form-data="formData" :related-data="relatedData" />
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-tooltip class="item" effect="dark" content="保存基本信息" placement="top">
          <el-button v-show="activeName==='1'" type="primary" @click="saveForm">保存</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="重置基本信息" placement="top">
          <el-button v-show="isAdd && activeName==='1'" @click="resetForm">重置</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="关闭弹窗" placement="top">
          <el-button @click="cancelForm">取消</el-button>
        </el-tooltip>
      </div>
      <post-select ref="postSelect" :dialog-data="{id:formData.id,title:'选择上级岗位'}" @setParent="setParent" />
    </el-dialog>

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import PostSelect from '@/views/system/post/PostSelect.vue'
import AssignUser from '@/views/system/post/AssignUser.vue'
import AssignRole from '@/views/system/post/AssignRole.vue'
import { savePost, getPostDetail } from '@/api/system/post'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'PostForm',
  components: { PostSelect, AssignUser, AssignRole },
  props: {
  },
  data() {
    return {
      rules: {
        postName: [
          { required: true, message: '请输入岗位名称', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        postCode: [
          { required: true, message: '请输入角色编码', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        postType: [
          { required: true, message: '请选择岗位权重', trigger: 'change' }
        ],
        remarks: [
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ]
      },
      formDialogVisible: false,
      relatedData: {
        userIds: [],
        roleIds: []
      },
      title: '',
      activeName: '1',
      activeNames: [
        {
          name: '1',
          label: '基本信息'
        },
        {
          name: '2',
          label: '分配角色'
        },
        {
          name: '3',
          label: '分配用户'
        }
      ],
      formData: {
        id: '',
        parentPost: {
          id: '',
          postName: ''
        },
        parentId: '',
        parentIds: '',
        treeLevel: 0,
        treeSort: 0,
        treeLeaf: '',
        postName: '',
        status: '0',
        postCode: '',
        postType: '',
        remarks: ''
      }
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict']),
    isAdd() {
      return !this.formData.id
    },
    isDisabled() {
      return (this.relatedData.userIds && this.relatedData.userIds.length > 0) || (this.relatedData.roleIds && this.relatedData.roleIds.length > 0)
    }
  },
  watch: {
  },
  methods: {
    selectParentPost() {
      this.$refs.postSelect.dialogVisible = true
    },
    setParent(node) {
      this.formData.parentId = node.id
      this.formData.parentPost.id = node.id
      this.formData.parentPost.postName = node.postName
    },
    addForm() {
      this.relatedData = {
        userIds: [],
        roleIds: []
      }
      this.activeName = '1'
      this.resetForm()
      this.title = '新增岗位'
      this.formDialogVisible = true
    },
    editForm(id) {
      this.activeName = '1'
      this.getDetailData(id)
    },
    getDetailData(id) {
      const fullscreenLoading = loading()
      getPostDetail({ id: id }).then(res => {
        if (!res.data.parentPost) {
          res.data.parentPost = {
            id: '',
            postName: ''
          }
        }
        this.relatedData.userIds = res.userIds
        this.relatedData.roleIds = res.roleIds
        this.formData = res.data
        this.title = '编辑岗位'
        this.formDialogVisible = true
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    },
    saveForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const fullscreenLoading = loading()
          savePost(this.formData).then(res => {
            this.$message({
              type: 'success',
              message: '岗位保存成功!'
            })
            this.relatedData.userIds = res.userIds
            this.relatedData.roleIds = res.roleIds

            this.formData = res.data
            this.$emit('findTableData')
          }).finally(() => {
            closeLoading(fullscreenLoading)
          })
        }
      })
    },
    resetForm(parentPost) {
      this.formData = {
        id: '',
        parentPost: {
          id: parentPost ? parentPost.id : '',
          postName: parentPost ? parentPost.postName : ''
        },
        parentId: parentPost ? parentPost.id : '',
        parentIds: '',
        treeLevel: 0,
        treeSort: 0,
        treeLeaf: '',
        postName: '',
        postCode: '',
        postType: '',
        status: '0',
        remarks: ''
      }
    },
    cancelForm() {
      this.formDialogVisible = false
    },
    addSubForm(row) {
      this.relatedData = {
        userIds: [],
        roleIds: []
      }
      this.resetForm(row)
      this.title = '新增下级岗位'
      this.formDialogVisible = true
    },
    assignRole(id) {
      this.activeName = '2'
      this.getDetailData(id)
    },
    assignUser(id) {
      this.activeName = '3'
      this.getDetailData(id)
    }
  }
}
</script>

