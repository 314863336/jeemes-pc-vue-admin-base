<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="名称">
          <el-input v-model="searchForm.name" />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input v-model="searchForm.age" />
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
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
          <flw-batch-button
            v-model="multipleSelection"
            :type="entityType"
            :variables="variables"
            @change="onChangeProcess"
          />
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
        label="名称"
        width="180"
      />
      <el-table-column
        prop="age"
        label="年龄"
        width="180"
      />
      <el-table-column prop="status" label="状态" width="180">
        <template slot-scope="scope">{{ getDict("flw_status", scope.row.status) }}</template>
      </el-table-column>

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleEdit(scope.$index, scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >删除</el-button>
          <flw-button
            v-if="scope.row.processInstanceId !== undefined"
            :entity="scope.row"
            :type="entityType"
            :variables="variables"
            @change="onChangeProcess"
          />
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
    <el-dialog title="编辑" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="名称">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input v-model="form.age" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getTemplatePage, saveTemplate, updateTemplate, deleteTemplate } from '@/api/workflow/manage'
import FlwButton from '../../components/flw-button'
import { mapGetters } from 'vuex'
import FlwBatchButton from '../../components/flw-batch/button'

export default {
  name: 'Template',
  components: { FlwButton, FlwBatchButton },
  data() {
    return {
      tableData: [],
      pageSize: 10,
      pageSizes: [5, 10, 20, 50],
      pageCurrent: 1,
      total: 0,
      searchForm: {
        name: null,
        age: null
      },
      dialogFormVisible: false,
      form: {
        id: null,
        name: null,
        age: null
      },
      entityType: 'htFlwTemplate',
      variables: { plf: '666', a: 1 },
      multipleSelection: []
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict'])
  },
  mounted() {
    this.handleSearch()
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    onChangeProcess(res) {
      this.handleSearch()
    },
    handleSave() {
      if (this.form.id == null) {
        saveTemplate(this.form).then(res => {
          this.dialogFormVisible = false
          this.handleSearch()
          this.$message({
            type: 'success',
            message: '保存成功'
          })
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '提交失败，请重试。'
          })
        })
      } else {
        updateTemplate(this.form).then(res => {
          this.dialogFormVisible = false
          this.resetSearchForm()
          this.$message({
            type: 'success',
            message: '保存成功'
          })
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '提交失败，请重试。'
          })
        })
      }
    },
    handleEdit(index, row) {
      this.form = row
      this.dialogFormVisible = true
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
        deleteTemplate({ id: row.id }).then(res => {
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
    resetSearchForm() {
      this.searchForm = {
        name: null,
        age: null
      }
      this.handleSearch()
    },
    handleSearch() {
      const data = {
        current: this.pageCurrent,
        size: this.pageSize
      }
      getTemplatePage(this.searchForm, data).then(res => {
        const data = res.data
        this.tableData = data.records
        this.total = data.total
        this.pageCurrent = data.current
        this.pageSize = data.size
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
</style>
