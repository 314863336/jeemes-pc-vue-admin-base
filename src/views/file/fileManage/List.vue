<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="4">
        <FolderTree ref="folderTree" :params="params" @loadFile="onSubmit" @treeClick="treeClick" />
      </el-col>
      <el-col :span="20">
        <div class="filter-container">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item label="名称">
              <el-input v-model="searchForm.fileName" />
            </el-form-item>
            <el-form-item label="上传者">
              <el-input v-show="false" v-model="searchForm.createBy" />
              <el-input v-model="searchForm.uploadUserName" :readonly="true">
                <el-button slot="append" icon="el-icon-search" @click="selectUser" />
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="searchLoading" plain @click="onSubmit">查 询</el-button>
              <el-button @click="onRest">重 置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="table-tools">
          <el-form inline>
            <el-form-item>
              <el-button type="primary" icon="el-icon-upload2" plain @click="uploadFile">上传文件</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-sort" plain @click="moveFile">移动文件</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-sort" plain @click="shareFile">分享文件</el-button>
            </el-form-item>
            <el-form-item>
              <el-button v-show="multipleSelection.length > 0" type="danger" icon="el-icon-delete" @click="deleteAll()">批量删除</el-button>
            </el-form-item>
          </el-form>
        </div>

        <user-select-single
          ref="userSelect"
          :extra-params="extraParams"
          :choosed-user="searchForm.createBy"
          @setChoosedUser="setChoosedUser"
        />

        <el-dialog :visible.sync="fileUploadDialogVisible" title="上传文件">
          <el-upload
            ref="upload"
            class="upload-demo"
            :multiple="true"
            :action="uploadUrl"
            :on-change="handleChange"
            :file-list="fileList"
            :on-success="uploadSuccess"
            :before-upload="beforeUpload"
          >
            <el-button size="small" type="primary">点击选择文件</el-button>
            <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
          </el-upload>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="saveFile">保存</el-button>
            <el-button @click="cancelUpload">取消</el-button>
          </div>
        </el-dialog>

        <el-dialog :visible.sync="moveDialogVisible" title="移动文件" width="30%">
          <el-form :model="moveForm" label-width="100px">
            <el-form-item label="目标文件夹">
              <el-input v-show="false" v-model="moveForm.id" />
              <el-input v-model="moveForm.fileName" :readonly="true">
                <el-button slot="append" icon="el-icon-search" @click="selectFolder" />
              </el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="saveMove">移动文件</el-button>
            <el-button @click="cancelMove">取消</el-button>
          </div>
        </el-dialog>

        <el-table
          ref="fileTable"
          v-loading="searchLoading"
          :data="tableData"
          style="width: 100%;margin-bottom: 20px;"
          row-key="id"
          stripe
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="fileName" :show-overflow-tooltip="true" label="名称" align="left" />
          <el-table-column prop="fileSize" :show-overflow-tooltip="true" label="文件大小" align="left">
            <template slot-scope="scope">
              <span>{{ (scope.row.fileSize/1024).toFixed(2) }} kb</span>
            </template>
          </el-table-column>
          <el-table-column prop="uploadUserName" :show-overflow-tooltip="true" label="上传者" align="left" />
          <el-table-column prop="createDate" :show-overflow-tooltip="true" label="上传时间" align="left" />
          <el-table-column prop="actions" label="操作" width="300" align="left">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" title="下载" @click="download(scope.row)">下载</el-button>
              <el-button type="danger" size="mini" title="删除" @click="deleteFile(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          layout="sizes, prev, pager, next, total"
          :page-sizes="page.pageSizes"
          :page-size.sync="page.pageSize"
          :total="page.total"
          :current-page.sync="page.pageCurrent"
          @size-change="onSubmit"
          @current-change="onSubmit"
        />
      </el-col>
    </el-row>
    <FolderSelect ref="folderSelect" @setFolder="setFolder" />

    <el-dialog :visible.sync="shareDialogVisible" title="分享文件" width="30%">
      <el-form ref="shareForm" :model="shareForm" label-width="100px">
        <el-form-item
          label="分享人"
          prop="toUserNames"
          :rules="[
            { required: true, message: '分享人不能为空', trigger: 'blur'}
          ]"
        >
          <el-input v-model="shareForm.toUserNames" :readonly="true">
            <el-button slot="append" icon="el-icon-search" @click="selectShareUser" />
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
        <el-button type="primary" :loading="shareLoading" @click="saveShareFile">保 存</el-button>
        <el-button @click="cancelShare">取 消</el-button>
      </span>
    </el-dialog>
    <UserSelectMultiple ref="userSelectMultiple" :extra-params="shareExtraParams" :choosed-user="shareChoosedUser" @setChoosedUser="setShareChoosedUser" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { findFileList, findFile, saveFile, deleteFile, moveFile, deleteFiles } from '@/api/file/file'
import FolderTree from '@/views/system/components/file/FolderTree.vue'
import FolderSelect from '@/views/system/components/file/FolderSelect.vue'
import { loading, closeLoading } from '@/utils/loading'
import UserSelectSingle from '@/views/system/components/user/UserSelectSingle.vue'
import UserSelectMultiple from '@/views/system/components/user/UserSelectMultiple.vue'
import { shareFile } from '@/api/file/shared'
// import { getToken } from '@/utils/auth'

export default {
  name: 'UserList',
  components: { UserSelectSingle, FolderTree, FolderSelect, UserSelectMultiple },
  data() {
    return {
      shareDialogVisible: false,
      page: {
        pageSize: 10,
        pageSizes: [5, 10, 20, 50],
        pageCurrent: 1,
        total: 0
      },
      params: {
        filterbyCurrentUser: true
      },
      shareForm: {
        id: '',
        fileInfoId: '',
        toUserIds: '',
        toUserNames: '',
        remarks: ''
      },
      expandSearchbar: false,
      searchLoading: false,
      searchForm: {
        fileName: '',
        createBy: '',
        uploadUserName: '',
        status: '0',
        fileType: 2,
        parentId: ''

      },
      tableData: [],
      fileList: [],
      importExcelDialogVisible: false,
      fileUploadDialogVisible: false,
      uploadUrl: '',
      extraParams: {},
      moveDialogVisible: false,
      moveForm: {
        id: '',
        fileName: ''
      },
      multipleSelection: [],
      shareExtraParams: {},
      shareChoosedUser: [],
      shareLoading: false,
      deleteNum: 0
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict']),
    isAdd() {
      return !this.formData.id
    }
  },
  watch: {
    moveDialogVisible: {
      handler(val) {
        if (val === true) {
          this.resetMove()
        }
      }
    }
  },
  mounted() {
  },
  methods: {
    saveMove() {
      if (this.moveForm.fileName === '') {
        this.$message('请选择目标文件夹')
        return
      }
      const selectData = this.$refs.fileTable.selection
      const ids = []
      selectData.forEach(function(elem) {
        this.push(elem.id)
      }, ids)
      moveFile({ target: this.moveForm.id, ids: ids }).then(res => {
        this.findTableData()
        this.moveDialogVisible = false
        this.$message('操作成功')
      })
    },
    resetMove() {
      this.moveForm.id = ''
      this.moveForm.fileName = ''
    },
    setFolder(data) {
      this.moveForm.id = data.id
      this.moveForm.fileName = data.fileName
    },
    selectFolder() {
      this.$refs.folderSelect.dialogVisible = true
    },
    moveFile() {
      const selectData = this.$refs.fileTable.selection
      if (selectData.length > 0) {
        this.moveDialogVisible = true
      } else {
        this.$message('请选择需要移动的文件！')
      }
    },
    cancelMove() {
      this.moveDialogVisible = false
    },
    hideUserDialog() {
      this.userSelectDialogVisible = false
    },
    selectUser() {
      this.extraParams = {
        // 默认查询当前用户下的公司及子公司下的数据
        filterbyCurrentUser: true,
        // 默认查询普通用户和二级管理员
        userTypeLe: 1
      }
      this.$refs.userSelect.dialogVisible = true
    },
    setChoosedUser(user) {
      this.searchForm.createBy = user.id
      this.searchForm.uploadUserName = user.userName
    },
    uploadFile() {
      this.uploadUrl = process.env.VUE_APP_BASE_URL_FILE + '/file/upload'
      this.fileUploadDialogVisible = true
    },
    uploadSuccess(response, file, fileList) {
    },
    beforeUpload(file) {
      const isLt5M = file.size / 1024 / 1024 > 5
      if (isLt5M) {
        this.$message.error('请上传体积小于5MB的文件')
        return false
      }
      return new Promise((resolve, reject) => {
        findFile({ fileName: file.name, fileType: 2 }).then(res => {
          if (res.data.length > 0) {
            this.$message.error('该文件已存在')
            reject()
          } else {
            resolve()
          }
        })
      })
    },
    saveFile() {
      // 保存文件信息
      const node = this.$refs.folderTree.getCurrentNode()
      const fileList = []
      for (const i in this.fileList) {
        const file = {}
        file.fileName = this.fileList[i].name
        file.fileType = 2
        file.fileSize = this.fileList[i].size
        file.parentId = node.id
        file.address = this.fileList[i].response.data.address
        file.fileId = this.fileList[i].response.data.fileId
        file.status = 0
        fileList.push(file)
      }
      saveFile(fileList).then(res => {
        this.$refs.upload.clearFiles()
        this.findTableData()
        this.$message('操作成功')
      }).finally(() => {
        this.fileUploadDialogVisible = false
      })
    },
    cancelUpload() {
      this.fileUploadDialogVisible = false
    },
    onSubmit() {
      this.findTableData()
    },
    onRest() {
      this.searchForm = {
        fileName: '',
        createBy: '',
        uploadUserName: '',
        status: '0'
      }
      this.onSubmit()
    },
    findTableData() {
      this.searchLoading = true
      const node = this.$refs.folderTree.getCurrentNode()
      this.searchForm.parentId = node.id
      const searchParams = {
        current: this.page.pageCurrent,
        size: this.page.pageSize,
        params: this.searchForm
      }
      if (this.deleteNum > 0) {
        if ((this.page.total - this.deleteNum) / this.page.pageSize === this.page.pageCurrent - 1) {
          searchParams.current = this.page.pageCurrent - 1
        }
        this.deleteNum = 0
      }
      findFileList(searchParams).then(res => {
        this.tableData = res.data.records
        this.page.pageCurrent = res.data.current
        this.page.pageSize = res.data.size
        this.page.total = res.data.total
      }).finally(() => {
        this.searchLoading = false
      })
    },
    handleChange(file, fileList) {
      this.fileList = fileList
    },
    addForm() {
      this.$refs.userForm.addForm()
    },
    download(row) {
      if (row.address) {
        window.location.href = process.env.VUE_APP_BASE_URL_FILE + '/file/download/' + row.fileName + '?address=' + row.address
      }
    },
    assignPost(row) {
      this.$refs.userForm.assignPost(row.id)
    },
    deleteFile(row) {
      this.$confirm('确定删除选择的数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const fullscreenLoading = loading()
        deleteFile({ id: row.id }).then(res => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
          this.deleteNum = 1
          this.findTableData()
        }).finally(() => {
          closeLoading(fullscreenLoading)
        })
      })
    },
    deleteAll() {
      if (this.multipleSelection.length === 0) {
        this.$message({
          type: 'warning',
          message: '请至少选择一条数据!'
        })
        return
      }
      const ids = []
      for (let i = 0; i < this.multipleSelection.length; i++) {
        const element = this.multipleSelection[i]
        ids.push(element.id)
      }
      this.$confirm('确定删除选择的数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const fullscreenLoading = loading()
        deleteFiles(ids).then(res => {
          this.$message({
            type: 'success',
            message: '文件删除成功!'
          })
          this.deleteNum = ids.length
          this.findTableData()
        }).finally(() => {
          closeLoading(fullscreenLoading)
        })
      })
    },
    hideImport() {
      this.importExcelDialogVisible = false
    },
    treeClick(data) {
      // this.searchForm.deptId = ''
      // this.searchForm.companyId = ''
      // if (data.officeType === this.$refs.officeTree.officeType[0]) {
      //   this.searchForm.companyId = data.id
      // } else {
      //   this.searchForm.deptId = data.id
      // }
      // this.onSubmit()
    },
    selectShareUser() {
      // 权重小于等于1的。普通用户和二级管理员
      this.shareExtraParams = {
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
    },
    shareFile() {
      if (this.multipleSelection.length === 0) {
        this.$message({
          type: 'info',
          message: '至少选择一条数据!'
        })
        return
      }
      this.shareDialogVisible = true
    },
    saveShareFile() {
      this.$refs['shareForm'].validate((valid) => {
        if (valid) {
          this.shareLoading = true
          const data = []
          for (let i = 0; i < this.multipleSelection.length; i++) {
            const element = this.multipleSelection[i]
            const el = {
              fileInfoId: element.id,
              toUserIds: this.shareForm.toUserIds,
              toUserNames: this.shareForm.toUserNames,
              status: '0',
              remarks: this.shareForm.remarks
            }
            data.push(el)
          }
          shareFile(data).then(res => {
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
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    setShareChoosedUser(users) {
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
    cancelShare() {
      this.shareForm = {
        id: '',
        fileInfoId: '',
        toUserIds: '',
        toUserNames: '',
        remarks: ''
      }
      this.shareDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.expand {
	display: block;
  text-align: right;
}
</style>
