<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="流程名称">
          <el-input v-model="searchForm.name" />
        </el-form-item>
        <el-form-item label="流程Key">
          <el-input v-model="searchForm.key" />
        </el-form-item>
        <el-form-item label="流程分类">
          <el-input v-model="searchForm.category" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain @click="handleSearch">查 询</el-button>
          <el-button @click="resetSearchForm">重 置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-tools">
      <el-form inline>
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" plain @click="dialogUploadVisible = true">部署流程</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="handleDeleteBatch">删除</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        prop="name"
        label="流程名称"
        width="180"
      />
      <el-table-column
        prop="key"
        label="流程Key"
        width="180"
      />
      <el-table-column
        prop="category"
        label="流程分类"
      />
      <el-table-column
        prop="version"
        label="流程版本"
      />
      <el-table-column
        label="状态"
      >
        <template slot-scope="scope">
          <span :class="scope.row.suspensionState == 1 ? 'suspend' : 'activate'">{{ scope.row.suspensionState == 1 ? '正常' : '挂起' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            :type="scope.row.suspensionState == 2 ? 'danger' : 'primary'"
            @click="handleState(scope.$index, scope.row)"
          >{{ scope.row.suspensionState == 2 ? '激活' : '挂起' }}</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >删除</el-button>
          <el-button
            size="mini"
            type="primary"
            @click="openDiagram(scope.$index, scope.row)"
          >查看流程图</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div ref="tableFooter">
      <div class="paginationBox">
        <el-pagination
          background
          layout="sizes, prev, pager, next, total"
          :page-sizes="pageSizes"
          :page-size.sync="pageSize"
          :total="total"
          :current-page.sync="pageCurrent"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>
    <el-dialog title="部署流程" :visible.sync="dialogUploadVisible" width="20%">
      <el-upload
        ref="upload"
        class="upload"
        :action="url"
        :on-success="onSuccess"
        :auto-upload="false"
        :before-upload="beforeUpload"
      >
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">提交</el-button>
      </el-upload>
    </el-dialog>

    <el-dialog
      title="流程图查看"
      :visible.sync="dialogFlwDiagramNoFrillsVisible"
      width="70%"
      top="5vh"
      :center="true"
    >
      <flw-diagram-no-frills v-if="dialogFlwDiagramNoFrillsVisible" :id="id" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFlwDiagramNoFrillsVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { getDeployPage, deleteDeploy, suspendProcess, activateProcess } from '@/api/workflow/manage'
import FlwDiagramNoFrills from '../components/flw-diagram/no-frills'

export default {
  name: 'ManageDeploy',
  components: { FlwDiagramNoFrills },
  data() {
    return {
      tableData: [],
      pageSize: 10,
      pageSizes: [5, 10, 20, 50],
      pageCurrent: 1,
      total: 0,
      dialogUploadVisible: false,
      searchForm: {
        name: '',
        key: '',
        category: ''
      },
      multipleSelection: [],
      url: process.env.VUE_APP_BASE_URL + '/flw/manage/deploy/add',
      dialogFlwDiagramNoFrillsVisible: false,
      id: ''
    }
  },
  mounted() {
    this.handleSearch()
  },
  methods: {
    openDiagram(index, row) {
      this.id = row.id
      this.dialogFlwDiagramNoFrillsVisible = true
    },
    beforeUpload(file) {
      console.error(file.type)
      const isZip = (file.type === 'application/x-zip-compressed' || file.type === 'application/x-zip' || file.type === 'application/zip')
      const isLt2M = file.size / 1024 / 1024 < 10
      if (!isZip) {
        this.$message.error('上传文件只能是 ZIP 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 10MB!')
      }
      return isZip && isLt2M
    },
    resetSearchForm() {
      this.searchForm = {
        name: '',
        key: '',
        category: ''
      }
      this.handleSearch()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    onSuccess() {
      this.dialogUploadVisible = false
      this.$refs.upload.clearFiles()
      this.pageCurrent = 1
      this.handleSearch()
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    handleSearch() {
      const data = {
        current: this.pageCurrent,
        size: this.pageSize
      }
      getDeployPage(this.searchForm, data).then(res => {
        const data = res.data
        this.tableData = data.list
        this.total = data.total
        this.pageCurrent = data.current
        this.pageSize = data.size
      })
    },
    handleState(index, row) {
      if (row.suspensionState === 2) {
        this.handleActivate(index, row)
      } else {
        this.handleSuspend(index, row)
      }
    },
    handleActivate(index, row) {
      this.$confirm(
        '此流程所有正在进行的实例都会激活, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        activateProcess(row.key).then(res => {
          this.$message({
            type: 'success',
            message: '激活成功'
          })
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '提交失败，请重试。'
          })
        }).finally(() => {
          this.handleSearch()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    handleSuspend(index, row) {
      this.$confirm(
        '此流程所有正在进行的实例都会挂起, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        suspendProcess(row.key).then(res => {
          this.$message({
            type: 'success',
            message: '挂起成功'
          })
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '提交失败，请重试。'
          })
        }).finally(() => {
          this.handleSearch()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    handleDelete(index, row) {
      this.$confirm(
        '此操作将永久删除, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        deleteDeploy([row.id]).then(res => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '提交失败，请重试。'
          })
        }).finally(() => {
          this.handleSearch()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    handleDeleteBatch() {
      this.$confirm(
        '此操作将永久删除, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        deleteDeploy(this.multipleSelection.map(item => item.id)).then(res => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '提交失败，请重试。'
          })
        }).finally(() => {
          this.handleSearch()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/list-page.less';
.expand {
  display: block;
  text-align: right;
}
.app-container{
  .suspend {
    background-color:#ecf5ff;
    color:#409eff;
  }
  .activate {
    background-color:#ffecec;
    color:#ff4040;
  }
}
</style>
