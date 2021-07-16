<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="模板编码">
          <el-input v-model="searchForm.tplCode" />
        </el-form-item>
        <el-form-item label="模板消息标题">
          <el-input v-model="searchForm.tplTitle" />
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
          <el-button type="primary" icon="el-icon-plus" plain @click="addForm">新增</el-button>
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
      <el-table-column prop="tplCode" :show-overflow-tooltip="true" label="模板编码" align="left" />
      <el-table-column prop="tplTitle" :show-overflow-tooltip="true" label="模板消息标题" align="left" />
      <el-table-column prop="tplType" :show-overflow-tooltip="true" label="模板消息类型" width="120" align="left">
        <template slot-scope="scope">
          {{ getDict("message_tpl_type", scope.row.tplType, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="remarks" :show-overflow-tooltip="true" label="备注" align="left" />
      <el-table-column prop="actions" label="操作" width="300" align="left">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" title="预览模板" @click="previewForm(scope.row)">预览</el-button>
          <el-button type="primary" size="mini" title="编辑模板" @click="editForm(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" title="删除模板" @click="deleteForm(scope.row)">删除</el-button>
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
    <template-form ref="templateForm" @findTableData="findTableData" />

    <el-dialog
      :visible.sync="formDialogVisible"
      :close-on-click-modal="false"
      top="20px"
      width="80%"
      :show-close="false"
      title="预览模板"
    >
      <div class="ql-editor" v-html="currentRow.tplContent">
        {{ currentRow.tplContent }}
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
import { findTemplateList, deleteTemplate, getTemplateDetail } from '@/api/message/template'
import TemplateForm from '@/views/message/template/Form'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'TemplateList',
  components: { TemplateForm },
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
        tplCode: '',
        tplTitle: '',
        status: '0'
      },
      tableData: [],
      currentRow: {
        tplContent: ''
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
        tplCode: '',
        tplTitle: '',
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
      findTemplateList(searchParams).then(res => {
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
        deleteTemplate({ id: row.id }).then(res => {
          this.$message({
            type: 'success',
            message: '模板删除成功!'
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
      getTemplateDetail({ id: id }).then(res => {
        this.currentRow = res.data
        this.formDialogVisible = true
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    },
    addForm() {
      this.$refs.templateForm.addForm()
    },
    previewForm(row) {
      this.getDetailData(row.id)
    },
    editForm(row) {
      this.$refs.templateForm.editForm(row)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
