<template>
  <div class="app-container">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      append-to-body
      top="20px"
      :show-close="false"
      :title="title"
    >
      <el-row>
        <el-col :span="24">
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

          <el-table
            v-loading="searchLoading"
            :data="tableData"
            style="width: 100%;margin-bottom: 20px;"
            row-key="id"
            stripe
            border
          >
            <el-table-column prop="actions" fixed="left" width="100" align="left">
              <template slot="header" slot-scope="scope">
                <el-button v-if="isChoosedAll(scope.row) === 'primary'" :type="isChoosedAll(scope.row)" size="mini" plain title="全选角色" icon="el-icon-check" @click="selectAllRole(scope.row)" />
                <el-button v-else :type="isChoosedAll(scope.row)" size="mini" plain title="反选角色" icon="el-icon-close" @click="unSelectAllRole(scope.row)" />
              </template>
              <template slot-scope="scope">
                <el-button v-if="isChoosed(scope.row) === 'primary'" :type="isChoosed(scope.row)" size="mini" plain title="单选角色" icon="el-icon-check" @click="selectRole(scope.row)" />
                <el-button v-else :type="isChoosed(scope.row)" size="mini" plain title="取消角色" icon="el-icon-close" @click="removeRole(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column prop="roleName" label="角色名称" align="left" />
            <el-table-column prop="roleCode" label="角色编码" align="left" />
            <el-table-column prop="roleType" label="角色权重" width="200" align="left">
              <template slot-scope="scope">
                {{ getDict("sys_user_type", scope.row.roleType, true) }}
              </template>
            </el-table-column>
            <el-table-column prop="remarks" label="备注" align="left" />
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

      <div slot="footer" class="dialog-footer">
        <el-tooltip class="item" effect="dark" content="确定选择角色" placement="top">
          <el-button type="primary" @click="saveForm">确定</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="关闭弹窗" placement="top">
          <el-button @click="cancelForm">取消</el-button>
        </el-tooltip>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { findRoleList } from '@/api/system/role'

export default {
  name: 'RoleSelect',
  props: {
    choosedRole: {
      type: Array,
      default: () => {
        return []
      }
    },
    params: {
      type: Object,
      default: () => {
        return {
        }
      }
    },
    extraParams: {
      type: Object,
      default: () => {
        return {
        }
      }
    }
  },
  data() {
    return {
      title: '选择角色',
      dialogVisible: false,
      page: {
        pageSize: 10,
        pageSizes: [5, 10, 20, 50],
        pageCurrent: 1,
        total: 0
      },
      searchLoading: false,
      searchForm: {
        roleCode: '',
        roleName: '',
        status: '0'
      },
      tableData: []
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict']),
    isChoosed() {
      return (row) => {
        const data = this.choosedRole.filter(o => o === row.id)
        return data.length > 0 ? 'success' : 'primary'
      }
    },
    isChoosedAll() {
      return () => {
        let isAll = true
        if (this.tableData.length === 0) {
          isAll = false
        } else {
          for (let i = 0; i < this.tableData.length; i++) {
            const element = this.tableData[i]
            const data = this.choosedRole.filter(o => o === element.id)
            if (data.length === 0) {
              isAll = false
              break
            }
          }
        }

        return isAll ? 'success' : 'primary'
      }
    }
  },
  watch: {
    extraParams: {
      handler(val) {
        this.findTableData()
      },
      immediate: true,
      deep: true
    },
    params: {
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
        roleName: '',
        status: '0'
      }
    },
    findTableData() {
      this.tableData.splice(0, this.tableData.length)
      this.searchLoading = true
      const searchParams = {
        current: this.page.pageCurrent,
        size: this.page.pageSize,
        params: Object.assign(this.searchForm, this.params ? this.params : {}),
        extraParams: this.extraParams ? this.extraParams : null
      }
      findRoleList(searchParams).then(res => {
        this.tableData.push(...res.data.records)
        this.page.pageCurrent = res.data.current
        this.page.pageSize = res.data.size
        this.page.total = res.data.total
      }).finally(() => {
        this.searchLoading = false
      })
    },
    saveForm() {
      this.$emit('setChoosedRole', this.choosedRole)
      this.cancelForm()
    },
    cancelForm() {
      this.dialogVisible = false
    },
    selectAllRole() {
      for (let i = 0; i < this.tableData.length; i++) {
        const element = this.tableData[i]
        const data = this.choosedRole.filter(o => o === element.id)
        if (data.length === 0) {
          this.choosedRole.push(element.id)
        }
      }
    },
    unSelectAllRole() {
      if (this.tableData.length === 0) {
        return
      }
      const d = []
      for (let i = 0; i < this.choosedRole.length; i++) {
        const element = this.choosedRole[i]
        const data = this.tableData.filter(o => o.id === element)
        if (data.length === 0) {
          d.push(element.id)
        }
      }
      this.unSelectAll()
      this.choosedRole.push(...d)
    },
    selectRole(row) {
      const data = this.choosedRole.filter(o => o === row.id)
      if (data.length === 0) {
        this.choosedRole.push(row.id)
      }
    },
    removeRole(user) {
      for (let i = 0; i < this.choosedRole.length; i++) {
        if (user.id === this.choosedRole[i]) {
          this.choosedRole.splice(i, 1)
          break
        }
      }
    },
    unSelectAll() {
      this.choosedRole.splice(0, this.choosedRole.length)
    }
  }
}
</script>
