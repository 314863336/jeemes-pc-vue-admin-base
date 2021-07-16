<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="form" class="demo-form-inline">
        <el-form-item label="字典名称">
          <el-input v-model="form.dictName" @keyup.enter.native="onSubmit" />
        </el-form-item>
        <el-form-item label="字典类型">
          <el-input v-model="form.dictCode" @keyup.enter.native="onSubmit" />
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
        <el-form-item :class="{expand:expandSearchbar}">
          <el-button type="primary" plain @click="onSubmit">查 询</el-button>
          <el-button @click="onRest">重 置</el-button>
        </el-form-item>
      </el-form>
      <div class="table-tools">
        <el-form inline>
          <el-form-item>
            <el-button type="primary" icon="el-icon-plus" plain @click="showDialogAdd = true">新增</el-button>
            <el-button type="primary" @click="refreshDictCache">刷新缓存</el-button>
            <el-button
              v-show="tableSelected.length > 0"
              type="danger"
              icon="el-icon-delete"
              plain
              :loading="btnDeleteBatchLoding"
              @click="handleDeletebatch"
            >删除</el-button>
            <!-- <el-dropdown v-show="tableSelected.length > 0" style="margin-left: 10px;" trigger="click">
              <el-button type="primary" plain>
                更多
                <i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-upload2">导入</el-dropdown-item>
                <el-dropdown-item icon="el-icon-download">导出</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown> -->
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
        <el-table-column prop="dictName" :show-overflow-tooltip="true" label="字典名称">
          <template slot-scope="scope">
            <el-button type="text" @click="handleEdit(scope.row)">{{ scope.row.dictName }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="dictCode" :show-overflow-tooltip="true" label="字典类型" align="left">
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="$router.push('/system/dict-detail/'+scope.row.dictCode)"
            >{{ scope.row.dictCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="updateDate" :show-overflow-tooltip="true" label="更新时间" width="160" align="left" />
        <el-table-column prop="remarks" :show-overflow-tooltip="true" label="备注信息" align="left" />
        <el-table-column prop="status" :show-overflow-tooltip="true" label="状态" width="80" align="left">
          <template slot-scope="scope">{{ getDict("sys_status", scope.row.status) }}</template>
        </el-table-column>
        <el-table-column prop="actions" label="操作" width="360" align="left">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" title="编辑字典类型" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              type="primary"
              size="mini"
              title="编辑字典数据"
              @click="$router.push('/system/dict-detail/'+scope.row.dictCode)"
            >数据</el-button>
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
    </div>
    <div ref="tableFooter">
      <el-pagination
        background
        layout="sizes, prev, pager, next,  total"
        :total="pageTotal"
        :page-size.sync="pageSize"
        :current-page.sync="currentPage"
        :page-sizes="[5, 10, 20, 50, 100]"
      />
    </div>

    <el-dialog
      :title="formAddTitle"
      :visible.sync="showDialogAdd"
      width="30%"
      :close-on-click-modal="false"
      destroy-on-close
      @closed="handleDialogClose"
    >
      <el-form ref="formAdd" :rules="rules" :model="formAdd" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="formAdd.dictName" :max="50" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictCode">
          <el-input v-model="formAdd.dictCode" :max="50" />
        </el-form-item>
        <el-form-item label="备注信息" prop="remarks">
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
import { mapActions, mapState, mapGetters } from 'vuex'
import { putList, updateList, deleteList, putEnable, deleteLists, refreshDictCache } from '@/api/system/dictionary'
import listPage from '@/views/utils/listPage'

export default {
  name: 'ManagementDict',
  // 引入listPage.js, mixins在vue中称为混入
  mixins: [listPage],
  data() {
    return {
      // tableData: [],
      tableSelected: [],
      form: {
        dictName: '',
        dictCode: '',
        isSys: '',
        status: ''
      },
      formAdd: {
        id: '',
        dictName: '',
        dictCode: '',
        isSys: '',
        remarks: ''
      },
      formAddLoading: false,
      rules: {
        dictName: [{ required: true, message: '不能为空', trigger: 'blur' }],
        dictCode: [
          { required: true, message: '不能为空', trigger: 'blur' },
          {
            min: 3,
            max: 50,
            message: '长度在 3 到 50 个字符',
            trigger: 'blur'
          },
          {
            validator: (rule, value, callback) => {
              // value 是否通过正则验证
              var patt = new RegExp('^[0-9a-zA-z_]+$')
              if (!patt.test(value)) {
                callback(new Error('只能包含字母、数字、下划线'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
          // 正则验证:  [a-zA-Z0-9_]{3,64}
          // msg：只能包含字母、数字、下划线
          // 🚗这里等一个正则老司机来写一下
        ],
        remarks: [
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ]

      },
      showDialogAdd: false,
      expandSearchbar: false,
      btnDeleteBatchLoding: false
    }
  },
  computed: {
    ...mapState('dictionary', { tableData: 'list', pageTotal: 'total' }),
    ...mapState('dictionary', ['loading']),
    ...mapGetters('dictionary', ['getDict']),
    formAddTitle() {
      if (this.formAdd.id) {
        return '编辑字典类型'
      } else {
        return '新增字典'
      }
    },
    where() {
      const { dictName, dictCode, isSys, status } = this.form
      return { dictName, dictCode, isSys, status }
    },
    pageSize: {
      get() {
        return this.$store.state.dictionary.pageSize
      },
      set(val) {
        this.$store.commit('dictionary/SET_pageSize', val)
        this.$store.dispatch('dictionary/getList', this.where)
      }
    },
    currentPage: {
      get() {
        return this.$store.state.dictionary.pageNo
      },
      set(val) {
        this.$store.commit('dictionary/SET_pageNo', val)
        this.$store.dispatch('dictionary/getList', this.where)
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    ...mapActions('dictionary', ['getList', 'init']),
    onSubmit() {
      this.getList(this.where)
    },
    onRest() {
      this.form.dictName = ''
      this.form.dictCode = ''
      this.form.isSys = ''
      this.form.status = ''
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
    refreshDictCache() {
      refreshDictCache().then(async res => {
        this.$store.commit('dictionary/SET_LIST', [])
        await this.init()
        this.onSubmit()
        this.$message({
          type: 'success',
          message: res.msg
        })
      })
    },
    handleEdit(row) {
      this.formAdd.id = row.id
      this.formAdd.dictName = row.dictName
      this.formAdd.dictCode = row.dictCode
      this.formAdd.isSys = row.isSys
      this.formAdd.remarks = row.remarks
      this.showDialogAdd = true
    },
    handleStop(row) {
      row.btnStopLoading = true
      const enable = !(row.status === '0')
      putEnable({ id: row.id, enable })
        .then(res => {
          this.getList(this.where)
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
        '此操作将永久删除该字典类型，以及它的字典数据, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          row.btnDeleteLoading = true
          deleteList({ id: row.id })
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
          deleteLists(this.tableSelected.map(item => item.id))
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
      this.tableSelected = val
    },
    formAddSubmit() {
      // showDialogAdd = false
      this.$refs['formAdd'].validate(valid => {
        if (valid) {
          this.formAddLoading = true
          if (this.formAdd.id) {
            updateList(this.formAdd)
              .then(res => {
                this.showDialogAdd = false
                this.getList(this.where)
                this.$message({
                  type: 'success',
                  message: '字典提交成功!'
                })
              })
              .finally(() => {
                this.formAddLoading = false
              })
          } else {
            putList(this.formAdd)
              .then(res => {
                this.showDialogAdd = false
                this.getList(this.where)
                this.$message({
                  type: 'success',
                  message: '字典提交成功!'
                })
              })
              .finally(() => {
                this.formAddLoading = false
              })
          }
        }
      })
    },
    handleDialogClose() {
      this.formAdd.id = ''
      this.formAdd.dictName = ''
      this.formAdd.dictCode = ''
      this.formAdd.isSys = ''
      this.formAdd.remarks = ''
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
