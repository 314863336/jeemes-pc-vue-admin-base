<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="参数名称">
          <el-input v-model="searchForm.configName" />
        </el-form-item>
        <el-form-item label="参数键名">
          <el-input v-model="searchForm.configKey" />
        </el-form-item>
        <!-- <el-form-item label="是否系统">
          <el-select v-model="searchForm.isSys" placeholder="请选择">
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" plain @click="onSubmit">查 询</el-button>
          <el-button @click="onRest">重 置</el-button>
          <!-- <el-button v-show="!expandSearchbar" type="text" @click="expandSearchbar = true">
            展开
            <i class="el-icon-arrow-down" />
          </el-button>
          <el-button v-show="expandSearchbar" type="text" @click="expandSearchbar = false">
            收缩
            <i class="el-icon-arrow-up" />
          </el-button> -->
        </el-form-item>
      </el-form>
    </div>
    <div class="table-tools">
      <el-form inline>
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" plain @click="showDialogAdd = true">新增</el-button>
          <el-button v-show="tableSelected.length > 0" type="danger" icon="el-icon-delete" @click="handleDeletebatch">删除</el-button>
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

    <el-table
      :data="tableData"
      class="pageTable"
      row-key="id"
      stripe
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="60" align="left" />
      <!-- <el-table-column prop="id" label="id" v-show="'false'"/> -->
      <el-table-column prop="configName" :show-overflow-tooltip="true" label="参数名称" width="300" align="left" />
      <el-table-column prop="configKey" :show-overflow-tooltip="true" label="参数键名" width="300" align="left" />
      <el-table-column prop="configValue" :show-overflow-tooltip="true" label="参数键值" width="600" align="left" />
      <!-- <el-table-column prop="isSys" label="是否系统" width="100" align="left">
          <template slot-scope="scope">
            <div v-if="scope.row.isSys==='0'">否</div>
            <div v-if="scope.row.isSys==='1'">是</div>
          </template>
        </el-table-column> -->
      <el-table-column prop="actions" label="操作" width="300" align="left">
        <template slot-scope="scope">
          <!-- <template> -->
          <el-button type="primary" size="mini" title="编辑参数" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" title="删除参数" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog title="新增参数" :visible.sync="showDialogAdd" width="30%">
      <el-form ref="formAdd" :rules="rules" :model="formAdd" label-width="100px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="formAdd.configName" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="formAdd.configKey" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="formAdd.configValue" />
        </el-form-item>
        <!-- <el-form-item label="是否系统" prop="isSys">
          <el-radio v-model="formAdd.isSys" label="1">是</el-radio>
          <el-radio v-model="formAdd.isSys" label="0">否</el-radio>
        </el-form-item> -->
        <el-form-item label="参数描述" prop="remarks">
          <el-input v-model="formAdd.remarks" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialogAdd = false">取消</el-button>
        <el-button type="primary" @click="add">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getParam } from '@/api/system/param'
import { saveData, updateData } from '@/api/system/param'
import { deleteParam, deleteLists } from '@/api/system/param'
import { getListData } from '@/api/system/param'
// import listPage from '@/views/utils/listPage'
export default {
  name: 'ManagementParam',
  // 引入listPage.js, mixins在vue中称为混入
  // mixins: [listPage],
  data() {
    return {
      pageSize: 10,
      pageSizes: [5, 10, 20, 50],
      pageCurrent: 1,
      total: 0,
      tableData: [],
      tableSelected: [],
      deleteNum: 0,
      searchForm: {

      },
      form: {
        name: ''
      },
      rules: {
        configName: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        configKey: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        configValue: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        // isSys: [
        //   { required: true, message: '不能为空', trigger: 'blur' }
        // ]
        remarks: [
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ]
      },
      formAdd: {
        configName: '',
        configKey: '',
        configValue: '',
        // isSys: '',
        remarks: ''
      },
      showDialogAdd: false,
      expandSearchbar: true
    }
  },
  computed: {
    where() {
      return {
        menuNameOrig: this.form.name.trim()
      }
    }
  },
  mounted() {
    this.handleSearch()
  },
  methods: {
    getList() {
      getParam(this.where).then(res => {
        // console.log(res)
        this.tableData = res.data.list
      })
    },
    handleSearch() {
      const data = {
        current: this.pageCurrent,
        size: this.pageSize,
        params: this.searchForm
      }
      if (this.deleteNum > 0) {
        if ((this.total - this.deleteNum) / this.pageSize === this.pageCurrent - 1) {
          data.current = (this.total - this.deleteNum) / this.pageSize
        }
        this.deleteNum = 0
      }
      getListData(data).then(res => {
        const data = res.data
        this.loading = true
        this.tableData = data.records
        this.total = data.total
        this.pageCurrent = data.current
        this.pageSize = data.size
        this.loading = false
      })
    },
    // format(list) {
    //   return list.map(item => {
    //     const l = {
    //       id: item.id,
    //       officeName: item.officeName,
    //       fullName: item.fullName,
    //       treeSort: item.treeSort,
    //       officeType: item.officeType,
    //       updateDate: item.updateDate,
    //       remarks: item.remarks,
    //       status: item.status
    //     }
    //     if (item.childList) {
    //       l.children = this.format(item.childList)
    //     }
    //     return l
    //   })
    // },
    onSubmit() {
      // this.getList()
      this.handleSearch()
    },
    onRest() {
      this.searchForm = {
        configName: '',
        configKey: ''
      }
      // this.searchForm.isSys = ''
      this.handleSearch()
    },
    handleChange() {
      // console.log("duangduang", this.$refs.cascader);
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
      this.formTitle = '编辑用户'
      this.formAdd = Object.assign({}, row)
      this.showDialogAdd = true
      this.$emit('refreshTable')
      console.log('handleEdit')
    },
    handleStop() {
      // console.log('handleStop')
      this.$confirm('确认停用这个机构吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '停用成功!'
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
      // console.log('handleDelete')
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteParam({ id: row.id }).then(res => {
            console.log(res)
            this.$message({
              message: res.msg,
              type: 'success'
            })
            // this.handleSearch()
            this.deleteNum = 1
            this.handleSearch()
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
        '此操作将永久删除该参数设置, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.btnDeleteBatchLoding = true
          console.log(this.tableSelected)
          deleteLists(
            this.tableSelected.map(item => item.id)
          )
            .then(res => {
              this.$message({
                type: 'success',
                message: '删除成功'
              })
              this.deleteNum = this.tableSelected.length
              this.handleSearch()
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
    handleAddSub() {
      console.log('handleAddSub')
    },
    handleSelectionChange(val) {
      this.tableSelected = val
    },
    add() {
      this.$refs['formAdd'].validate(valid => {
        if (valid) {
          if (this.formAdd.id) {
            updateData(this.formAdd).then(res => {
              this.$emit('refreshTable')
              this.handleSearch()
              this.formAdd = {}
              this.showDialogAdd = false
              this.$message({
                type: 'success',
                message: '参数提交成功!'
              })
            })
          } else {
            saveData(this.formAdd).then(res => {
              this.$emit('refreshTable')
              this.handleSearch()
              this.formAdd = {}
              this.showDialogAdd = false
              this.$message({
                type: 'success',
                message: '参数提交成功!'
              })
            })
          }
        }
      })
      // this.getList()
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
