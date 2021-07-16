<template>
  <div>
    <!-- <div class="tree-filter-div">
      <el-form>
        <el-form-item>
          <el-input v-model="filterText" placeholder="输入关键字进行过滤" style="width:100%;" />
        </el-form-item>
      </el-form>
    </div> -->
    <el-popover
      v-model="visible"
      placement="right"
      width="150"
      trigger="manual"
    >
      <div>
        <el-button type="text" @click="addFolder(1)">新增同级文件夹</el-button>
        <br>
        <el-button type="text" @click="addFolder(2)">新增下级文件夹</el-button>
        <br>
        <el-button type="text" @click="editFolder">编辑文件夹</el-button>
        <br>
        <el-button type="text" @click="deleteFolder">删除文件夹</el-button>
        <br>
        <el-button type="text" @click="shareFolder">分享文件夹</el-button>
      </div>
      <el-tree
        ref="folderTree"
        slot="reference"
        :data="treeData"
        node-key="id"
        :highlight-current="true"
        :default-expand-all="true"
        :expand-on-click-node="false"
        :filter-node-method="treefilter"
        :props="defaultProps"
        @node-click="nodeClick"
        @current-change="currentChange"
        @node-contextmenu="rightClick"
      />

    </el-popover>

    <el-dialog :visible.sync="folderDialogVisible" title="新增文件夹" width="30%">
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="上级文件夹">
          <el-input v-show="false" v-model="form.parentId" />
          <el-input v-model="form.parentName" :readonly="true" />
        </el-form-item>
        <el-form-item
          label="文件夹名称"
          prop="fileName"
          :rules="[
            { required: true, message: '文件夹名称不能为空', trigger: 'blur'},
          ]"
        >
          <el-input v-model="form.fileName" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remarks" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveFolder">保 存</el-button>
        <el-button @click="folderDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="shareDialogVisible" title="分享文件夹" width="30%">
      <el-form ref="shareForm" :model="shareForm" label-width="100px">
        <el-form-item
          label="分享人"
          prop="toUserNames"
          :rules="[
            { required: true, message: '分享人不能为空', trigger: 'blur'},
          ]"
        >
          <el-input v-model="shareForm.toUserNames" :readonly="true">
            <el-button slot="append" icon="el-icon-search" @click="selectUser" />
          </el-input>
        </el-form-item>
        <el-form-item
          label="备注"
          prop="fileName"
          :rules="[
            { max: 200, message: '长度在 0 到 200 个字符', trigger: 'blur' }
          ]"
        >
          <el-input v-model="shareForm.remarks" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="shareLoading" @click="shareFile">保 存</el-button>
        <el-button @click="cancelShare">取 消</el-button>
      </span>
    </el-dialog>
    <UserSelectMultiple ref="userSelectMultiple" :extra-params="extraParams" :choosed-user="choosedUser" @setChoosedUser="setChoosedUser" />
  </div>
</template>

<script>
import { treeData, saveFolder, deleteFile, updateFolder } from '@/api/file/file'
import { shareFile } from '@/api/file/shared'
import UserSelectMultiple from '@/views/system/components/user/UserSelectMultiple.vue'

export default {
  name: 'FolderTree',
  components: { UserSelectMultiple },
  props: {
    params: {
      type: Object,
      default: () => {
        return {
        }
      }
    }
  },
  data() {
    return {
      officeType: ['0', '1'],
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'fileName'
      },
      filterText: '',
      visible: false,
      folderDialogVisible: false,
      form: {
        id: '',
        parentId: '',
        parentName: '',
        fileName: '',
        remarks: '',
        status: 0,
        fileType: 1
      },
      shareForm: {
        id: '',
        fileInfoId: '',
        toUserIds: '',
        toUserNames: '',
        remarks: ''
      },
      shareDialogVisible: false,
      shareLoading: false,
      choosedUser: [],
      extraParams: {}
    }
  },
  watch: {
    filterText: {
      handler(val) {
        this.$refs.folderTree.filter(val)
      }
    }
  },
  mounted() {
    this.initTreeData()
  },
  methods: {
    treefilter(value, data) {
      if (!value) {
        return true
      }
      return data.officeName.indexOf(value) !== -1
    },
    initTreeData() {
      const params = this.params || {}
      params.fileType = 1
      treeData(params).then(res => {
        const data = res.data
        this.treeData = data
        this.$nextTick(() => {
          if (this.treeData.length > 0) {
            this.$refs.folderTree.setCurrentKey(this.treeData[0].id)
            this.nodeClick(this.$refs.folderTree.getCurrentNode())
            this.$emit('loadFile')
          }
        })
      })
    },
    currentChange() {
      this.$emit('loadFile')
    },
    nodeClick(data) {
      this.$emit('treeClick', data)
    },
    rightClick(e) {
      this.visible = !this.visible
    },
    addFolder(type) {
      const node = this.$refs.folderTree.getCurrentNode()
      this.form.id = ''
      this.form.parentId = ''
      this.form.parentName = ''
      this.form.fileName = ''
      this.form.remarks = ''
      if (type === 1) {
        this.form.parentId = node.parentId
        if (node.parentId != null) {
          const parentNode = this.$refs.folderTree.getNode(node.parentId)
          this.form.parentName = parentNode.data.fileName
        }
      }
      if (type === 2) {
        this.form.parentId = node.id
        this.form.parentName = node.fileName
      }
      this.folderDialogVisible = true
      this.visible = false
    },
    editFolder() {
      const node = this.$refs.folderTree.getCurrentNode()
      this.form.id = node.id
      if (node.parentId != null) {
        const parentNode = this.$refs.folderTree.getNode(node.parentId)
        this.form.parentId = node.parentId
        this.form.parentName = parentNode.data.fileName
      }
      this.form.fileName = node.fileName
      this.form.remarks = node.remarks
      this.folderDialogVisible = true
      this.visible = false
    },
    deleteFolder() {
      this.visible = false
      this.$confirm('确定删除选择的文件夹？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const node = this.getCurrentNode()
        deleteFile({ id: node.id }).then(res => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
          this.initTreeData()
        }).finally(() => {
        })
      })
    },
    saveFolder() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id === '') {
            saveFolder(this.form).then(res => {
              this.folderDialogVisible = false
              this.$message('操作成功')
              this.initTreeData()
            })
          } else {
            updateFolder(this.form).then(res => {
              this.folderDialogVisible = false
              this.$message('操作成功')
              this.initTreeData()
            })
          }
        }
      })
    },
    setChoosedUser(users) {
      let userIds = ''
      let userNames = ''
      for (let i = 0; i < users.length; i++) {
        const element = users[i]
        userIds = userIds + element.id + ','
        userNames = userNames + element.userName + ','
      }
      if (userIds)userIds = userIds.substring(0, userIds.length - 1)
      if (userNames)userNames = userNames.substring(0, userNames.length - 1)
      this.shareForm.toUserIds = userIds
      this.shareForm.toUserNames = userNames
    },
    getCurrentNode() {
      return this.$refs.folderTree.getCurrentNode()
    },
    shareFolder() {
      const node = this.getCurrentNode()
      this.shareForm.fileInfoId = node.id
      this.shareDialogVisible = true
      this.visible = false
    },
    shareFile() {
      this.$refs['shareForm'].validate((valid) => {
        if (valid) {
          this.shareLoading = true
          shareFile([this.shareForm]).then(res => {
            this.$message({
              type: 'success',
              message: '分享成功!'
            })
            this.cancelShare()
          }).finally(() => {
            this.shareLoading = false
          })
        }
      })
    },
    cancelShare() {
      this.shareForm = {
        id: '',
        fileInfoId: '',
        toUserIds: '',
        toUserNames: '',
        remarks: ''
      }
      this.shareDialogVisible = false
    },
    selectUser() {
      // 权重小于等于1的。普通用户和二级管理员
      this.extraParams = {
        userTypeLe: 1
      }
      const choosedUser = []
      let toUserIds = null
      let toUserNames = null
      if (this.shareForm.toUserIds) {
        toUserIds = this.shareForm.toUserIds.split(',')
        toUserNames = this.shareForm.toUserNames.split(',')
        for (let i = 0; i < toUserIds.length; i++) {
          const element = toUserIds[i]
          const el = {
            id: element,
            userName: toUserNames[i]
          }
          choosedUser.push(el)
        }
      }
      this.choosedUser = choosedUser
      this.$refs.userSelectMultiple.dialogVisible = true
    }
  }
}
</script>

<style scoped>
</style>
