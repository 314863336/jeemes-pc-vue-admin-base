<template>
  <div class="app-container">
    <el-form ref="form" :model="formData" label-width="120px">
      <el-divider content-position="left">基本信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="岗位名称">
            <el-input v-model="formData.postName" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="岗位编号">
            <el-input v-model="formData.postCode" :disabled="true" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-divider content-position="left">分配用户</el-divider>
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="登陆账号">
          <el-input v-model="searchForm.loginCode" />
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="searchForm.userName" />
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
      <el-table-column prop="actions" fixed="left" label="操作" width="100" align="center">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" title="删除用户" @click="deleteForm(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="loginCode" label="登陆账号" align="center" />
      <el-table-column prop="userName" label="用户昵称" align="center" />
      <el-table-column prop="dept.officeName" label="所属部门" align="center" />
      <el-table-column prop="company.officeName" label="所属公司" width="120" align="center" />
      <el-table-column prop="email" label="电子邮箱" width="120" align="center" />
      <el-table-column prop="mobile" label="手机号码" width="120" align="center" />
      <el-table-column prop="phone" label="电话号码" width="120" align="center" />
      <el-table-column prop="remarks" label="备注" width="120" align="center" />
      <el-table-column prop="status" label="状态" width="120" align="center">
        <template slot-scope="scope">
          {{ getDict("sys_status", scope.row.status, true) }}
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
    <user-select ref="userSelect" :extra-params="extraParams" :choosed-user="choosedUser" @setChoosedUser="setChoosedUser" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { findUserList } from '@/api/system/user'
import { saveUserPost, deleteUserPost } from '@/api/system/post'
import UserSelect from '@/views/system/components/user/UserSelect.vue'
// import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'UserList',
  components: { UserSelect },
  props: {
    relatedData: {
      type: Object,
      default: () => {
        return {
          userIds: []
        }
      }
    },
    formData: {
      type: Object,
      default: () => {
        return {
        }
      }
    }
  },
  data() {
    return {
      extraParams: {},
      page: {
        pageSize: 10,
        pageSizes: [5, 10, 20, 50],
        pageCurrent: 1,
        total: 0
      },
      searchLoading: false,
      searchForm: {
        loginCode: '',
        userName: ''
      },
      choosedUser: [],
      tableData: []
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict'])
  },
  watch: {
    formData: {
      handler(val) {
        this.findTableData()
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
  },
  methods: {
    onSubmit() {
      this.findTableData()
    },
    onRest() {
      this.searchForm = {
        loginCode: '',
        userName: ''
      }
    },
    findTableData() {
      this.searchLoading = true
      const searchParams = {
        current: this.page.pageCurrent,
        size: this.page.pageSize,
        params: this.searchForm,
        extraParams: { postId: this.formData.id }
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
    deleteForm(row) {
      deleteUserPost({ id: this.formData.id, userId: row.id }).then(res => {
        this.$message({
          type: 'success',
          message: '删除分配用户成功!'
        })
        this.findTableData()
        this.relatedData.userIds = res.userIds
      })
    },
    addForm() {
      this.extraParams = { userType: this.formData.postType }
      this.choosedUser = []
      this.choosedUser.push(...this.relatedData.userIds)
      this.$refs.userSelect.dialogVisible = true
    },
    setChoosedUser(users) {
      this.relatedData.userIds = users
      this.saveAssignUser()
    },
    saveAssignUser() {
      saveUserPost(this.relatedData.userIds, { id: this.formData.id }).then(res => {
        this.$message({
          type: 'success',
          message: '分配用户成功!'
        })
        this.findTableData()
      })
    }
  }
}
</script>
