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

    <div class="table-tools">
      <el-form inline>
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" plain @click="editForm">新增</el-button>
          <el-button v-show="multipleSelection.length > 0" type="danger" icon="el-icon-delete" @click="deleteAll()">批量删除</el-button>
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column prop="msgTitle" :show-overflow-tooltip="true" label="消息标题" align="left" />
      <el-table-column prop="sendUserName" :show-overflow-tooltip="true" label="创建人" align="left" />
      <el-table-column prop="receiveDate" :show-overflow-tooltip="true" label="创建时间" align="left" />
      <el-table-column prop="actions" label="操作" width="300" align="left">
        <template slot-scope="scope">
          <el-button v-show="scope.row.type === '1'" type="primary" size="mini" title="修改" @click="editForm(scope.row)">修改</el-button>
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

    <message-app-form ref="form" @findTableData="findTableData" />
  </div>
</template>

<script>

import { mapGetters, mapActions, mapState } from 'vuex'
import { findMessageList, deleteMessage, getMessageDetail, senEmail, getMessageCount, changeReadStatus } from '@/api/message/receive'
import { loading, closeLoading } from '@/utils/loading'
import MessageAppForm from '@/views/message/app_notice/Form'

export default {
  name: 'MessageAppList',
  components: { MessageAppForm },
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
        type: '1',
        status: '0'
      },
      tableData: [],
      currentRow: {
        msgContent: ''
      },
      formDialogVisible: false,
      multipleSelection: [],
      deleteNum: 0
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict']),
    ...mapState('message', ['newMessage', 'readedData'])
  },
  watch: {
    newMessage: {
      handler(val) {
        if (val === 1) {
          this.findTableData()
          this.setNewMessage(0)
        }
      }
    },
    readedData: {
      handler(val) {
        if (val) {
          // 检测首页的已读数据，修改这里列表中对应的已读状态
          for (let i = 0; i < this.tableData.length; i++) {
            const element = this.tableData[i]
            if (element.id === this.readedData.id) {
              element.readStatus = '1'
            }
          }
        }
      }
    }
  },
  mounted() {
    this.onSubmit()
  },
  methods: {
    ...mapActions('message', ['setCount', 'setNewMessage']),
    onSubmit() {
      this.findTableData()
    },
    senEmail() {
      senEmail().then(res => {

      })
    },
    getMessageCount() {
      getMessageCount().then(res => {
        this.setCount(res.data ? res.data : 0)
      })
    },
    onRest() {
      this.searchForm = {
        msgTitle: '',
        type: '1',
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
        // 获取当前登陆人未读数据
        const count = res.count
        this.setCount(count)
      }).finally(() => {
        this.searchLoading = false
      })
    },
    editForm(row) {
      this.$refs.form.editForm(row)
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
      this.delete(ids)
    },
    delete(ids) {
      this.$confirm('确定删除选择的数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const fullscreenLoading = loading()
        deleteMessage(ids).then(res => {
          this.$message({
            type: 'success',
            message: '消息删除成功!'
          })
          this.deleteNum = ids.length
          this.findTableData()
        }).finally(() => {
          closeLoading(fullscreenLoading)
        })
      })
    },
    deleteForm(row) {
      this.delete([row.id])
    },
    getDetailData(row) {
      const fullscreenLoading = loading()
      getMessageDetail({ id: row.id }).then(res => {
        this.currentRow = res.data
        this.formDialogVisible = true
        row.readStatus = '1'
        this.getMessageCount()
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    },
    previewForm(row) {
      this.getDetailData(row)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    changeReadStatus(all) {
      if (!all) {
        if (this.multipleSelection.length === 0) {
          this.$message({
            type: 'warning',
            message: '请至少选择一条数据!'
          })
          return
        }
      }
      const title = all ? '确定全部标记为已读?' : '确定将选择的数据标记为已读?'
      this.$confirm(title, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        if (!all) {
          for (let i = 0; i < this.multipleSelection.length; i++) {
            const element = this.multipleSelection[i]
            ids.push(element.id)
          }
        }
        const fullscreenLoading = loading()
        changeReadStatus(ids).then(res => {
          this.$message({
            type: 'success',
            message: '标记已读成功!'
          })
          this.findTableData()
        }).finally(() => {
          closeLoading(fullscreenLoading)
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
