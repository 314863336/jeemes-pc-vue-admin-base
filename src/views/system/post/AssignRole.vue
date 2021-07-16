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
        <el-form-item label="角色编码">
          <el-input v-model="searchForm.roleCode" />
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" />
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
      <el-table-column prop="roleName" label="角色名称" align="center" />
      <el-table-column prop="roleCode" label="角色编码" align="center" />
      <el-table-column prop="roleType" label="角色权重" width="200" align="center">
        <template slot-scope="scope">
          {{ getDict("sys_user_type", scope.row.roleType, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="remarks" label="备注" align="center" />
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
    <role-select ref="roleSelect" :extra-params="extraParams" :choosed-role="choosedRole" @setChoosedRole="setChoosedRole" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { findRoleList } from '@/api/system/role'
import { savePostRole, deletePostRole } from '@/api/system/post'
import RoleSelect from '@/views/system/components/role/RoleSelect.vue'
// import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'UserList',
  components: { RoleSelect },
  props: {
    relatedData: {
      type: Object,
      default: () => {
        return {
          roleIds: []
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
        roleCode: '',
        roleName: ''
      },
      choosedRole: [],
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
        roleCode: '',
        roleName: ''
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
      findRoleList(searchParams).then(res => {
        this.tableData = res.data.records
        this.page.pageCurrent = res.data.current
        this.page.pageSize = res.data.size
        this.page.total = res.data.total
      }).finally(() => {
        this.searchLoading = false
      })
    },
    deleteForm(row) {
      deletePostRole({ id: this.formData.id, roleId: row.id }).then(res => {
        this.$message({
          type: 'success',
          message: '删除分配角色成功!'
        })
        this.findTableData()
        this.relatedData.roleIds = res.roleIds
      })
    },
    addForm() {
      this.extraParams = { roleType: this.formData.postType }
      this.choosedRole = []
      this.choosedRole.push(...this.relatedData.roleIds)
      this.$refs.roleSelect.dialogVisible = true
    },
    setChoosedRole(users) {
      this.relatedData.roleIds = users
      this.saveAssignRole()
    },
    saveAssignRole() {
      savePostRole(this.relatedData.roleIds, { id: this.formData.id }).then(res => {
        this.$message({
          type: 'success',
          message: '分配角色成功!'
        })
        this.findTableData()
      })
    }
  }
}
</script>
