<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="4">
        <OfficeTree ref="officeTree" :params="params" @treeClick="treeClick" />
      </el-col>
      <el-col :span="20">
        <div class="filter-container">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item label="登陆账号">
              <el-input v-model="searchForm.loginCode" />
            </el-form-item>
            <el-form-item label="用户昵称">
              <el-input v-model="searchForm.userName" />
            </el-form-item>
            <el-form-item v-show="expandSearchbar" label="手机号">
              <el-input v-model="searchForm.mobile" />
            </el-form-item>
            <el-form-item v-show="expandSearchbar" label="电话号码">
              <el-input v-model="searchForm.phone" />
            </el-form-item>
            <el-form-item v-show="expandSearchbar" label="用户状态">
              <el-select v-model="searchForm.status">
                <el-option
                  v-for="(item, index) in getDict('sys_status')"
                  :key="'st'+index"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
            <el-form-item :class="{expand:expandSearchbar}">
              <el-button type="primary" :loading="searchLoading" plain @click="onSubmit">查 询</el-button>
              <el-button @click="onRest">重 置</el-button>
              <el-button v-show="!expandSearchbar" type="text" @click="expandSearchbar = true">
                展开
                <i class="el-icon-arrow-down" />
              </el-button>
              <el-button v-show="expandSearchbar" type="text" @click="expandSearchbar = false">
                收缩
                <i class="el-icon-arrow-up" />
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="table-tools">
          <el-form inline>
            <el-form-item>
              <el-button type="primary" icon="el-icon-plus" plain @click="addForm">新增</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-upload2" plain @click="importExcel">导入</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-download" plain @click="download">导出</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-dialog :visible.sync="importExcelDialogVisible" title="导入用户数据">
          <ImportExcel
            ref="importExcel"
            :import-url="importUrl"
            :template-url="templateUrl"
            @hideImport="hideImport"
            @refreshTable="findTableData"
          />
        </el-dialog>

        <el-table
          v-loading="searchLoading"
          :data="tableData"
          style="width: 100%;margin-bottom: 20px;"
          row-key="id"
          stripe
          border
        >
          <el-table-column prop="loginCode" :show-overflow-tooltip="true" label="登陆账号" align="left" />
          <el-table-column prop="userName" :show-overflow-tooltip="true" label="用户昵称" align="left" />
          <el-table-column prop="dept.officeName" :show-overflow-tooltip="true" label="所属部门" align="left" />
          <el-table-column prop="company.officeName" :show-overflow-tooltip="true" label="所属公司" width="120" align="left" />
          <el-table-column prop="email" label="电子邮箱" :show-overflow-tooltip="true" width="120" align="left" />
          <el-table-column prop="mobile" label="手机号码" :show-overflow-tooltip="true" width="120" align="left" />
          <el-table-column prop="phone" label="电话号码" :show-overflow-tooltip="true" width="120" align="left" />
          <el-table-column prop="remarks" label="备注" :show-overflow-tooltip="true" width="120" align="left" />
          <el-table-column prop="status" label="状态" :show-overflow-tooltip="true" width="120" align="left">
            <template slot-scope="scope">
              {{ getDict("sys_status", scope.row.status, true) }}
            </template>
          </el-table-column>
          <el-table-column prop="actions" label="操作" width="300" align="left">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" title="编辑用户" @click="editForm(scope.row)">编辑</el-button>
              <el-button type="danger" size="mini" title="删除用户" @click="deleteForm(scope.row)">删除</el-button>
              <el-dropdown>
                <el-button class="el-dropdown-link" size="mini" title="更多操作">更多</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <el-button type="text" size="small" @click="assignPost(scope.row)">分配岗位</el-button>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button type="text" size="small" @click="resetPassword(scope.row)">重置密码</el-button>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
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
      </el-col>
    </el-row>
    <user-form ref="userForm" :user-type="searchForm.userType" @findTableData="findTableData" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { findUserList, resetPassword, deleteUser } from '@/api/system/user'
import UserForm from '@/views/system/user/Form.vue'
import OfficeTree from '@/views/system/components/office/OfficeTree.vue'
import { loading, closeLoading } from '@/utils/loading'
import ImportExcel from '@/components/Excel/ImportExcel.vue'
import { getToken } from '@/utils/auth'

export default {
  name: 'UserList',
  components: { UserForm, ImportExcel, OfficeTree },
  data() {
    return {
      page: {
        pageSize: 10,
        pageSizes: [5, 10, 20, 50],
        pageCurrent: 1,
        total: 0
      },
      params: {
        filterbyCurrentUser: true
      },
      expandSearchbar: false,
      searchLoading: false,
      searchForm: {
        loginCode: '',
        userName: '',
        mobile: '',
        phone: '',
        userType: 0,
        status: '0',
        companyId: '',
        deptId: ''
      },
      tableData: [],
      importExcelDialogVisible: false,
      importUrl: '',
      templateUrl: '',
      selectData: {},
      deleteNum: 0
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict']),
    isAdd() {
      return !this.formData.id
    }
  },
  mounted() {
  },
  methods: {
    importExcel() {
      this.importUrl = process.env.VUE_APP_BASE_URL + '/htSysUser/importData'
      this.templateUrl = process.env.VUE_APP_BASE_URL + '/htSysUser/importTemplate?Authorization=' + getToken()
      this.importExcelDialogVisible = true
    },
    onSubmit() {
      this.findTableData()
    },
    onRest() {
      const companyId = this.searchForm.companyId
      const deptId = this.searchForm.deptId
      this.searchForm = {
        loginCode: '',
        userName: '',
        mobile: '',
        phone: '',
        userType: 0,
        status: '0',
        companyId: companyId,
        deptId: deptId
      }
      this.onSubmit()
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
      findUserList(searchParams).then(res => {
        this.tableData = res.data.records
        this.page.pageCurrent = res.data.current
        this.page.pageSize = res.data.size
        this.page.total = res.data.total
      }).finally(() => {
        this.searchLoading = false
      })
    },
    addForm() {
      this.$refs.userForm.addForm()
    },
    editForm(row) {
      this.$refs.userForm.editForm(row.id)
    },
    assignPost(row) {
      this.$refs.userForm.assignPost(row.id)
    },
    resetPassword(row) {
      this.$confirm('确定对[' + row.userName + ']用户重置密码？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const fullscreenLoading = loading()
        resetPassword({ id: row.id }).then(res => {
          this.$message({
            type: 'success',
            message: '密码已重置!'
          })
        }).finally(() => {
          closeLoading(fullscreenLoading)
        })
      })
    },
    deleteForm(row) {
      this.$confirm('确定删除选择的数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const fullscreenLoading = loading()
        deleteUser({ ids: row.id }).then(res => {
          this.$message({
            type: 'success',
            message: '用户删除成功!'
          })
          this.deleteNum = 1
          this.findTableData()
        }).finally(() => {
          closeLoading(fullscreenLoading)
        })
      })
    },
    download() {
      let params = '?loginCode=' + this.searchForm.loginCode
      params += '&userName=' + this.searchForm.userName
      params += '&mobile=' + this.searchForm.mobile
      params += '&phone=' + this.searchForm.phone
      params += '&userType=' + this.searchForm.userType
      params += '&status=' + this.searchForm.status
      window.location.href = process.env.VUE_APP_BASE_URL + '/htSysUser/download' + params + '&Authorization=' + getToken()
    },
    hideImport() {
      this.importExcelDialogVisible = false
    },
    treeClick(data) {
      this.searchForm.deptId = ''
      this.searchForm.companyId = ''
      if (data.officeType === this.$refs.officeTree.officeType[0]) {
        this.searchForm.companyId = data.id
      } else {
        this.searchForm.deptId = data.id
      }
      this.onSubmit()
      this.selectData = this.$refs.officeTree.getSelectData()
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
