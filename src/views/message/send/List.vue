<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="消息标题">
          <el-input v-model="searchForm.msgTitle" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="searchLoading" plain @click="onSubmit">查 询</el-button>
          <el-button @click="onRest">重 置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      v-loading="searchLoading"
      :data="tableData"
      style="width: 100%;margin-bottom: 20px;"
      row-key="id"
      stripe
      border
    >
      <el-table-column prop="msgTitle" :show-overflow-tooltip="true" label="消息标题" align="left" />
      <el-table-column prop="receiveUserName" :show-overflow-tooltip="true" label="接收人" align="left" />
      <el-table-column prop="pushStatus" :show-overflow-tooltip="true" label="推送状态" align="left">
        <template slot-scope="scope">
          {{ getDict("message_push_status", scope.row.pushStatus, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="sendDate" :show-overflow-tooltip="true" label="发送时间" align="left" />
      <el-table-column prop="actions" label="操作" width="300" align="left">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" title="查看消息" @click="previewForm(scope.row)">查看</el-button>
          <el-button type="danger" size="mini" title="删除消息" @click="deleteForm(scope.row)">删除</el-button>
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

    <el-dialog
      :visible.sync="formDialogVisible"
      :close-on-click-modal="false"
      top="20px"
      width="80%"
      :show-close="false"
      title="查看消息"
    >
      <div class="ql-editor" v-html="currentRow.msgContent">
        {{ currentRow.msgContent }}
      </div>
      <div slot="footer" class="dialog-footer">
        <el-tooltip class="item" effect="dark" content="关闭弹窗" placement="top">
          <el-button @click="formDialogVisible=false">关闭</el-button>
        </el-tooltip>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { findMessageList, deleteMessage, getMessageDetail } from '@/api/message/send'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'MessageSendList',
  data() {
    return {
      page: {
        pageSize: 10,
        pageSizes: [5, 10, 20, 50],
        pageCurrent: 1,
        total: 0
      },
      searchLoading: false,
      searchForm: {
        msgTitle: '',
        status: '0'
      },
      tableData: [],
      currentRow: {
        msgContent: ''
      },
      formDialogVisible: false,
      deleteNum: 0
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict'])
  },
  mounted() {
    this.onSubmit()
  },
  methods: {
    onSubmit() {
      this.findTableData()
    },
    onRest() {
      this.searchForm = {
        msgTitle: '',
        status: '0'
      }
      this.onSubmit()
    },
    setActiveName(val) {
      this.activeName = val
    },
    findTableData() {
      this.searchLoading = true
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
      findMessageList(searchParams).then(res => {
        this.tableData = res.data.records
        this.page.pageCurrent = res.data.current
        this.page.pageSize = res.data.size
        this.page.total = res.data.total
      }).finally(() => {
        this.searchLoading = false
      })
    },
    deleteForm(row) {
      this.$confirm('确定删除选择的数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const fullscreenLoading = loading()
        deleteMessage({ id: row.id }).then(res => {
          this.$message({
            type: 'success',
            message: '消息删除成功!'
          })
          this.deleteNum = 1
          this.findTableData()
        }).finally(() => {
          closeLoading(fullscreenLoading)
        })
      })
    },
    getDetailData(id) {
      const fullscreenLoading = loading()
      getMessageDetail({ id: id }).then(res => {
        this.currentRow = res.data
        this.formDialogVisible = true
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    },
    previewForm(row) {
      this.getDetailData(row.id)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
