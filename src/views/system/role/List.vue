<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="角色编码">
          <el-input v-model="searchForm.roleCode" />
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" />
        </el-form-item>
        <el-form-item v-show="expandSearchbar" label="状态">
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
      <el-table-column prop="roleName" :show-overflow-tooltip="true" label="角色名称" align="left" />
      <el-table-column prop="roleCode" :show-overflow-tooltip="true" label="角色编码" align="left" />
      <el-table-column prop="roleType" :show-overflow-tooltip="true" label="角色权重" width="200" align="left">
        <template slot-scope="scope">
          {{ getDict("sys_user_type", scope.row.roleType, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="remarks" :show-overflow-tooltip="true" label="备注" align="left" />
      <el-table-column prop="status" :show-overflow-tooltip="true" label="状态" width="120" align="left">
        <template slot-scope="scope">
          {{ getDict("sys_status", scope.row.status, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="actions" label="操作" width="300" align="left">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" title="编辑角色" @click="editForm(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" title="删除角色" @click="deleteForm(scope.row)">删除</el-button>
          <el-dropdown>
            <el-button class="el-dropdown-link" size="mini" title="更多操作">更多</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <el-button type="text" size="small" @click="assignMenu(scope.row)">分配菜单</el-button>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-button type="text" size="small" @click="assignDataScope(scope.row)">数据权限</el-button>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-button type="text" size="small" @click="assignPost(scope.row)">分配岗位</el-button>
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

    <role-form ref="roleForm" @findTableData="findTableData" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { findRoleList, deleteRole } from '@/api/system/role'
import RoleForm from '@/views/system/role/Form.vue'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'RoleList',
  components: { RoleForm },
  data() {
    return {
      page: {
        pageSize: 10,
        pageSizes: [5, 10, 20, 50],
        pageCurrent: 1,
        total: 0
      },
      expandSearchbar: false,
      searchLoading: false,
      deleteNum: 0,
      searchForm: {
        roleCode: '',
        roleName: '',
        status: '0'
      },
      tableData: []
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
        roleCode: '',
        roleName: '',
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
      this.$confirm('确定删除选择的数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const fullscreenLoading = loading()
        deleteRole({ ids: row.id }).then(res => {
          this.$message({
            type: 'success',
            message: '角色删除成功!'
          })
          this.deleteNum = 1
          this.findTableData()
        }).finally(() => {
          closeLoading(fullscreenLoading)
        })
      })
    },
    addForm() {
      this.$refs.roleForm.addForm()
    },
    editForm(row) {
      this.$refs.roleForm.editForm(row)
    },
    assignMenu(row) {
      this.$refs.roleForm.assignMenu(row)
    },
    assignDataScope(row) {
      this.$refs.roleForm.assignDataScope(row)
    },
    assignPost(row) {
      this.$refs.roleForm.assignPost(row)
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
