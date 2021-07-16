<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="公司编码">
          <el-input v-model="searchForm.officeCode" @keyup.enter.native="onSubmit" />
        </el-form-item>
        <el-form-item label="公司名称">
          <el-input v-model="searchForm.officeName" @keyup.enter.native="onSubmit" />
        </el-form-item>
        <el-form-item :class="{expand:expandSearchbar}">
          <el-button type="primary" :loading="searchLoading" plain @click="onSubmit">查 询</el-button>
          <el-button @click="onRest">重 置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-tools">
      <el-form inline>
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" plain @click="handleEdit()">新增</el-button>
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
      :expand-row-keys="expandRowKeys"
      :tree-props="{children: 'children'}"
    >
      <el-table-column prop="officeName" :show-overflow-tooltip="true" label="公司名称" align="left" />
      <el-table-column prop="fullName" :show-overflow-tooltip="true" label="公司全称" align="left" />
      <el-table-column prop="officeCode" label="公司编码" align="left" />
      <!-- <el-table-column prop="treeSort" label="排序" width="100" align="left" /> -->
      <el-table-column prop="remarks" :show-overflow-tooltip="true" label="描述" width="120" align="left" />
      <el-table-column prop="status" :show-overflow-tooltip="true" label="状态" width="120" align="left">
        <template slot-scope="scope">{{ getDict("sys_status", scope.row.status) }}</template>
      </el-table-column>
      <el-table-column prop="actions" label="操作" width="300" align="left">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" title="编辑公司" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button slot="reference" type="danger" size="mini" title="删除公司" @click="handleDelete(scope.row)">删除</el-button>
          <el-button type="primary" size="mini" title="新增下级公司" @click="handleAddSub(scope.row)">新增下级</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :visible.sync="formDialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      top="20px"
      :title="title"
    >
      <corp-form
        :id="rowId"
        ref="corpForm"
        :parent="parent"
        :form-dialog-visible="formDialogVisible"
        @hideDialog="hideDialog"
        @refreshTable="findTableData"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveCorp">保存</el-button>
        <el-button @click="cancelCorp">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { findCorpTreeData, deleteTree } from '@/api/system/corp'
import CorpForm from '@/views/system/corp/CorpForm.vue'

export default {
  name: 'CorpList',
  components: { CorpForm },
  data() {
    return {
      expandSearchbar: false,
      searchLoading: false,
      formDialogVisible: false,
      title: '新增公司',
      searchForm: {
        officeCode: '',
        officeName: ''
      },
      rowId: '',
      parent: {},
      tableData: [],
      expandRowKeys: []
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
        officeCode: '',
        officeName: ''
      }
      this.onSubmit()
    },
    hideDialog() {
      this.formDialogVisible = false
    },
    findTableData() {
      this.tableData = []
      this.expandRowKeys = []
      this.searchLoading = true
      const searchParams = {
      }
      searchParams.officeCode = this.searchForm.officeCode.trim() === '' ? null : this.searchForm.officeCode
      searchParams.officeName = this.searchForm.officeName.trim() === '' ? null : this.searchForm.officeName
      searchParams.officeType = 0

      findCorpTreeData(searchParams).then(res => {
        this.tableData = res.data
        this.expandRowKeys = res.expandRowKeys
      }).finally(() => {
        this.searchLoading = false
      })
    },
    handleEdit(row) {
      this.rowId = ''
      this.parent = {}
      if (row) {
        this.title = '编辑公司'
        this.rowId = row.id
      }
      this.formDialogVisible = true
    },
    handleAddSub(row) {
      this.rowId = ''
      this.title = '新增公司'
      this.parent = row
      this.formDialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定删除选择的数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTree({ id: row.id }).then(res => {
          this.findTableData()
          this.$message({
            type: 'success',
            message: '删除数据成功'
          })
        })
      }).finally(() => {
      })
    },
    saveCorp() {
      this.$refs.corpForm.onSubmit()
    },
    cancelCorp() {
      this.$refs.corpForm.onCancel()
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
