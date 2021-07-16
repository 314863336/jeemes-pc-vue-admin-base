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
                <el-button v-if="isChoosedAll(scope.row) === 'primary'" :type="isChoosedAll(scope.row)" size="mini" plain title="全选用户" icon="el-icon-check" @click="selectAllUser(scope.row)" />
                <el-button v-else :type="isChoosedAll(scope.row)" size="mini" plain title="反选用户" icon="el-icon-close" @click="unSelectAllUser(scope.row)" />
              </template>
              <template slot-scope="scope">
                <el-button v-if="isChoosed(scope.row) === 'primary'" :type="isChoosed(scope.row)" size="mini" plain title="单选用户" icon="el-icon-check" @click="selectUser(scope.row)" />
                <el-button v-else :type="isChoosed(scope.row)" size="mini" plain title="取消用户" icon="el-icon-close" @click="removeUser(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column prop="loginCode" label="登陆账号" align="left" />
            <el-table-column prop="userName" label="用户昵称" align="left" />
            <el-table-column prop="dept.officeName" label="所属部门" align="left" />
            <el-table-column prop="company.officeName" label="所属公司" width="120" align="left" />
            <el-table-column prop="remarks" label="备注" width="120" align="left" />
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
        <el-tooltip class="item" effect="dark" content="确定选择用户" placement="top">
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
// 系统管理中使用
import { mapGetters } from 'vuex'
import { findUserList } from '@/api/system/user'

export default {
  name: 'UserSelect',
  props: {
    choosedUser: {
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
          // 默认查询当前用户下的公司及子公司下的数据
          filterbyCurrentUser: true
        }
      }
    }
  },
  data() {
    return {
      title: '选择用户',
      dialogVisible: false,
      page: {
        pageSize: 10,
        pageSizes: [5, 10, 20, 50],
        pageCurrent: 1,
        total: 0
      },
      searchLoading: false,
      searchForm: {
        loginCode: '',
        userName: '',
        status: '0'
      },
      tableData: []
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict']),
    isChoosed() {
      return (row) => {
        const data = this.choosedUser.filter(o => o === row.id)
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
            const data = this.choosedUser.filter(o => o === element.id)
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
        loginCode: '',
        userName: '',
        status: '0'
      }
    },
    findTableData() {
      this.tableData.splice(0, this.tableData.length)
      this.searchLoading = true
      // 默认看到当前用户所属公司和子公司下的用户
      const searchParams = {
        current: this.page.pageCurrent,
        size: this.page.pageSize,
        params: Object.assign(this.searchForm, this.params),
        extraParams: this.extraParams
      }
      findUserList(searchParams).then(res => {
        this.tableData.push(...res.data.records)
        this.page.pageCurrent = res.data.current
        this.page.pageSize = res.data.size
        this.page.total = res.data.total
      }).finally(() => {
        this.searchLoading = false
      })
    },
    saveForm() {
      this.$emit('setChoosedUser', this.choosedUser)
      this.cancelForm()
    },
    cancelForm() {
      this.dialogVisible = false
    },
    selectAllUser() {
      for (let i = 0; i < this.tableData.length; i++) {
        const element = this.tableData[i]
        const data = this.choosedUser.filter(o => o === element.id)
        if (data.length === 0) {
          this.choosedUser.push(element.id)
        }
      }
    },
    unSelectAllUser() {
      if (this.tableData.length === 0) {
        return
      }
      const d = []
      for (let i = 0; i < this.choosedUser.length; i++) {
        const element = this.choosedUser[i]
        const data = this.tableData.filter(o => o.id === element)
        if (data.length === 0) {
          d.push(element.id)
        }
      }
      this.unSelectAll()
      this.choosedUser.push(...d)
    },
    selectUser(row) {
      const data = this.choosedUser.filter(o => o === row.id)
      if (data.length === 0) {
        this.choosedUser.push(row.id)
      }
    },
    removeUser(user) {
      for (let i = 0; i < this.choosedUser.length; i++) {
        if (user.id === this.choosedUser[i]) {
          this.choosedUser.splice(i, 1)
          break
        }
      }
    },
    unSelectAll() {
      this.choosedUser.splice(0, this.choosedUser.length)
    }
  }
}
</script>
