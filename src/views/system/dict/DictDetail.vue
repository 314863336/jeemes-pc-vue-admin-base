<template>
  <div class="app-container">
    <!-- <h3>机构管理</h3> -->
    <div class="filter-container">
      <el-form :inline="true" :model="form">
        <el-form-item label="字段标签">
          <el-input v-model="form.dictLabel" @keyup.enter.native="onSubmit" />
        </el-form-item>
        <el-form-item label="字典键值">
          <el-input v-model="form.dictValue" @keyup.enter.native="onSubmit" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择" clearable>
            <el-option
              v-for="(item, index) in getDict('sys_search_status')"
              :key="'ss'+index"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain @click="onSubmit">查 询</el-button>
          <el-button @click="onRest">重 置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-tools">
      <el-form inline>
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" plain @click="showDialogAdd = true">新增</el-button>
          <el-button
            v-show="tableSelected.length > 0"
            type="danger"
            icon="el-icon-delete"
            plain
            :loading="btnDeleteBatchLoding"
            @click="handleDeletebatch"
          >删除</el-button>
          <el-dropdown v-show="tableSelected.length > 0" style="margin-left: 10px;" trigger="click">
            <el-button type="primary" plain>
              更多
              <i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <!-- <el-dropdown-item icon="el-icon-upload2">导入</el-dropdown-item> -->
              <el-dropdown-item icon="el-icon-download" :loading="downloadLoading" @click.native="exportExcel">导出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      v-loading="loading"
      class="data"
      :data="tableData"
      style="width: 100%;margin-bottom: 20px;"
      row-key="id"
      stripe
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column prop="dictLabel" label="字典标签">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">{{ scope.row.dictLabel }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="dictValue" label="字典键值" align="center" />
      <el-table-column prop="updateDate" label="更新时间" width="160" align="center" />
      <el-table-column prop="remarks" label="备注信息" align="center" />
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template slot-scope="scope">{{ getDict("sys_status", scope.row.status) }}</template>
      </el-table-column>
      <el-table-column prop="actions" label="操作" width="280" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" title="编辑字典类型" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            :type="scope.row.status === '0' ? 'danger' : 'success'"
            size="mini"
            title="停用字典类型"
            :loading="scope.row.btnStopLoading"
            @click="handleStop(scope.row)"
          >{{ scope.row.status === "0" ? "停用" : "启用" }}</el-button>
          <el-button
            type="danger"
            size="mini"
            title="删除字典类型"
            :loading="scope.row.btnDeleteLoading"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="formAddTitle"
      :visible.sync="showDialogAdd"
      width="30%"
      :close-on-click-modal="false"
      destroy-on-close
      @closed="handleDialogClose"
    >
      <el-form ref="formAdd" :rules="rules" :model="formAdd" label-width="100px">
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="formAdd.dictLabel" :max="50" />
        </el-form-item>
        <el-form-item label="字典键值" prop="dictValue">
          <el-input v-model="formAdd.dictValue" :max="50" />
        </el-form-item>
        <el-form-item label="字典描述" prop="remarks">
          <el-input v-model="formAdd.remarks" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialogAdd = false">取消</el-button>
        <el-button type="primary" :loading="formAddLoading" @click="formAddSubmit">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  putDetail,
  updateDetail,
  deleteDetail,
  putDetailEnable,
  deleteDetails,
  getDetail
} from '@/api/system/dictionary'

export default {
  name: 'ManagementDictDetail',
  data() {
    return {
      loading: true,
      tableData: [],
      tableSelected: [],
      form: {
        dictLabel: '',
        dictValue: '',
        status: ''
      },
      formAdd: {
        id: '',
        dictLabel: '',
        dictValue: '',
        treeSort: '',
        remarks: ''
      },
      formAddLoading: false,
      rules: {
        dictLabel: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        dictValue: [{ required: true, message: '不能为空', trigger: 'blur' }],
        remarks: [
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ]
      },
      showDialogAdd: false,
      expandSearchbar: false,
      btnDeleteBatchLoding: false,
      downloadLoading: false
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict']),
    dictType() {
      return this.$route.params.type
    },
    formAddTitle() {
      if (this.formAdd.id) {
        return '编辑字典键值'
      } else {
        return '新增键值'
      }
    },
    where() {
      const { dictLabel, dictValue, status } = this.form
      return { dictLabel, dictValue, status }
    }
  },
  mounted() {
    this.setTagsViewTitle()
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getDetail({ dictType: this.dictType, ...this.where }).then(res => {
        this.tableData = res.data
        this.loading = false
      })
    },
    onSubmit() {
      this.getList()
    },
    onRest() {
      this.form.dictLabel = ''
      this.form.dictValue = ''
      this.form.status = ''
      this.onSubmit()
    },
    handleEdit(row) {
      this.formAdd.id = row.id
      this.formAdd.dictLabel = row.dictLabel
      this.formAdd.dictValue = row.dictValue
      this.formAdd.remarks = row.remarks
      this.showDialogAdd = true
    },
    handleStop(row) {
      row.btnStopLoading = true
      const enable = !(row.status === '0')
      putDetailEnable({ id: row.id, enable })
        .then(res => {
          this.getList()
          this.$message({
            type: 'success',
            message: (enable ? '启用' : '停用') + '成功!'
          })
        })
        .catch(() => {
          row.btnStopLoading = false
          this.$message({
            type: 'error',
            message: (enable ? '启用' : '停用') + '失败，请重试。'
          })
        })
    },
    handleDelete(row) {
      this.$confirm(
        '此操作将永久删除该字典数据, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          row.btnDeleteLoading = true
          deleteDetail({ id: row.id })
            .then(res => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getList(this.where)
            })
            .catch(() => {
              row.btnDeleteLoading = false
              this.$message({
                type: 'error',
                message: '删除失败，请重试。'
              })
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },
    handleDeletebatch() {
      this.$confirm(
        '此操作将永久删除该字典类型，以及它的字典数据, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.btnDeleteBatchLoding = true
          deleteDetails(this.tableSelected.map(item => item.id))
            .then(res => {
              this.$message({
                type: 'success',
                message: '删除成功'
              })
              this.getList()
            })
            .catch(() => {
              this.$message({
                type: 'error',
                message: '提交失败，请重试。'
              })
            })
            .finally(() => {
              this.btnDeleteBatchLoding = false
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },
    handleSelectionChange(val) {
      // console.log('handleSelectionChange', val)
      this.tableSelected = val
    },
    formAddSubmit() {
      // showDialogAdd = false
      this.$refs['formAdd'].validate(valid => {
        if (valid) {
          this.formAddLoading = true
          if (this.formAdd.id) {
            updateDetail({
              ...this.formAdd,
              dictType: this.dictType
            }).then(res => {
              this.showDialogAdd = false
              this.getList()
              this.$message({
                type: 'success',
                message: '字典数据提交成功!'
              })
            }).finally(() => {
              this.formAddLoading = false
            })
          } else {
            putDetail({
              ...this.formAdd,
              dictType: this.dictType
            }).then(res => {
              this.showDialogAdd = false
              this.getList()
              this.$message({
                type: 'success',
                message: '字典数据提交成功!'
              })
            }).finally(() => {
              this.formAddLoading = false
            })
          }
        }
      })
    },
    handleDialogClose() {
      this.formAdd.id = ''
      this.formAdd.dictLabel = ''
      this.formAdd.dictValue = ''
      this.formAdd.remarks = ''
    },
    setTagsViewTitle() {
      // const title = this.$route.meta.title
      // const tempRoute = Object.assign({}, this.$route)
      // const route = Object.assign({}, tempRoute, { title: `${title}：${this.dictType}` })
      // this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    // 导出表格所用
    exportExcel() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['字典标签', '字典键值', '更新时间', '备注信息', '状态']
        const filterVal = ['dictLabel', 'dictValue', 'updateDate', 'remarks', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.tableSelected.map(v => filterVal.map(j => {
        if (j === 'status') {
          return this.getDict('sys_status', v[j])
        } else {
          return v[j]
        }
      }))
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
