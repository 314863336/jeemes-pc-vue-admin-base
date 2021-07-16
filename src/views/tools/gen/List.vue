<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="form" class="demo-form-inline">
        <el-form-item label="表名">
          <el-input v-model="form.tableName" @keyup.enter.native="onSubmit" />
        </el-form-item>
        <el-form-item label="表说明">
          <el-input v-model="form.comments" @keyup.enter.native="onSubmit" />
        </el-form-item>
        <el-form-item :class="{expand:expandSearchbar}">
          <el-button type="primary" plain @click="onSubmit">查 询</el-button>
          <el-button @click="onRest">重 置</el-button>
        </el-form-item>
      </el-form>
      <div class="table-tools">
        <el-form inline>
          <el-form-item>
            <el-button type="primary" icon="el-icon-plus" plain @click="addGen">新增</el-button>
            <el-button
              v-show="tableSelected.length > 0"
              type="danger"
              icon="el-icon-delete"
              plain
              :loading="btnDeleteBatchLoding"
              @click="handleDeletebatch"
            >删除</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div>
      <el-table
        v-loading="loading"
        :data="tableData"
        class="pageTable"
        row-key="id"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="left" />
        <el-table-column prop="tableName" :show-overflow-tooltip="true" label="表名" />
        <el-table-column prop="comments" :show-overflow-tooltip="true" label="表说明" align="left" />
        <el-table-column prop="subCount" :show-overflow-tooltip="true" label="子表数" align="left">
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="$router.push('/tool/sub-list/'+scope.row.tableName)"
            >{{ scope.row.subCount }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="functionAuthor" :show-overflow-tooltip="true" label="功能作者" align="left" />
        <el-table-column prop="createDate" :show-overflow-tooltip="true" label="创建时间" width="160" align="left" />
        <el-table-column prop="actions" label="操作" width="360" align="left">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" title="编辑" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              title="删除"
              :loading="scope.row.btnDeleteLoading"
              @click="handleDelete(scope.row)"
            >删除</el-button>
            <el-button type="primary" size="mini" title="生成代码" @click="genCode(scope.row)">生成代码</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div ref="tableFooter">
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
    </div>

    <GenForm
      ref="genForm"
      :table-name="selectTableform.tableName"
      @hideFormDialog="hideFormDialog"
      @refreshTable="onSubmit"
    />
    <el-dialog
      :visible.sync="selectTableDialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      width="30%"
      title="新增配置"
    >
      <el-form ref="selectTableform" :rules="rules" :model="selectTableform" label-width="80px">
        <el-form-item label="选择表" prop="tableName">
          <el-select v-model="selectTableform.tableName" filterable placeholder="请选择" style="width:100%" clearable>
            <el-option
              v-for="(item, index) in tables"
              :key="'ss'+index"
              :label="item.tableName+' : '+item.comments"
              :value="item.tableName"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="selectTableDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="selectTableLoading" @click="nextStep">下一步</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import { pageList, getTables, getDetail, deleteGen, deleteGens, genCode } from '@/api/tools/gen'
import listPage from '@/views/utils/listPage'
import GenForm from '@/views/tools/gen/Form.vue'

export default {
  name: 'Gen',
  components: { GenForm },
  // 引入listPage.js, mixins在vue中称为混入
  mixins: [listPage],
  data() {
    return {
      page: {
        pageSize: 10,
        pageSizes: [5, 10, 20, 50],
        pageCurrent: 1,
        total: 0
      },
      loading: false,
      tableData: [],
      tableSelected: [],
      form: {
        tableName: '',
        comments: '',
        status: 0
      },
      formAdd: {
        id: '',
        dictName: '',
        dictCode: '',
        isSys: '',
        remarks: ''
      },
      selectTableform: {
        tableName: ''
      },
      tables: [],
      showDialogAdd: false,
      expandSearchbar: false,
      btnDeleteBatchLoding: false,
      formDialogVisible: false,
      selectTableDialogVisible: false,
      selectTableLoading: false,
      rules: {
        tableName: [{ required: true, message: '不能为空', trigger: 'blur' }]

      },
      deleteNum: 0
    }
  },
  computed: {
    // ...mapGetters('gen', ['getTable']),
    formAddTitle() {
      if (this.formAdd.id) {
        return '编辑字典类型'
      } else {
        return '新增字典'
      }
    }

  },
  mounted() {
    this.findTableData()
  },
  methods: {
    onSubmit() {
      this.findTableData()
    },
    hideFormDialog() {
      this.hideFormDialog = false
    },
    nextStep() {
      this.$refs['selectTableform'].validate((valid) => {
        if (valid) {
          console.log(this.selectTableform.tableName)
          this.selectTableDialogVisible = false
          this.$refs.genForm.showDialogAdd = true
        }
      })
    },
    addGen() {
      this.selectTableDialogVisible = true
      this.selectTableform.tableName = ''
      getTables().then(res => {
        this.tables = res.data
      })
    },
    findTableData() {
      this.loading = true
      const searchParams = {
        current: this.page.pageCurrent,
        size: this.page.pageSize,
        params: this.form
      }
      if (this.deleteNum > 0) {
        if ((this.page.total - this.deleteNum) / this.page.pageSize === this.page.pageCurrent - 1) {
          searchParams.current = this.page.pageCurrent - 1
        }
        this.deleteNum = 0
      }
      pageList(searchParams).then(res => {
        this.tableData = res.data.records
        this.page.pageCurrent = res.data.current
        this.page.pageSize = res.data.size
        this.page.total = res.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    onRest() {
      this.form.tableName = ''
      this.form.comments = ''
      this.form.status = 0
      this.onSubmit()
    },
    handleChange() {
      this.$refs.cascader && (this.$refs.cascader.dropDownVisible = false)
    },
    handleExpand() {
      // 这里为了保证监听事件能成功添加在dom元素上，
      // 放在setTimeout队列保持最后执行
      setTimeout(() => {
        document
          .querySelector('.popper')
          .querySelectorAll('li[role=menuitem]')
          .forEach(elem => {
            elem.removeEventListener('click', this.clickToSelect)
            elem.addEventListener('click', this.clickToSelect)
          })
      }, 0)
    },
    clickToSelect(ev) {
      ev.path
        .find(elem => elem.tagName === 'LI')
        .querySelector('input')
        .click()
    },
    handleEdit(row) {
      getDetail({ id: row.id }).then(res => {
        this.selectTableform.tableName = res.data.tableName
        this.$refs.genForm.formAdd = res.data
        this.$refs.genForm.showDialogAdd = true
      })
    },
    genCode(row) {
      this.$confirm(
        '确定生成吗?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.btnDeleteBatchLoding = true
          genCode({ id: row.id }).then(res => {
            this.$message({
              type: 'success',
              message: '操作成功!'
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
    handleDelete(row) {
      this.$confirm(
        '此操作将永久删除该表生成配置, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          row.btnDeleteLoading = true
          deleteGen({ id: row.id })
            .then(res => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.deleteNum = 1
              this.findTableData()
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
          deleteGens(this.tableSelected.map(item => item.id))
            .then(res => {
              this.$message({
                type: 'success',
                message: '删除成功'
              })
              this.deleteNum = this.tableSelected.length
              this.findTableData()
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
      this.tableSelected = val
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
