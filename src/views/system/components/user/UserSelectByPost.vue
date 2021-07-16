<template>
  <div class="user-select-by-post">
    <el-dialog
      :visible.sync="value"
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
                <el-button type="primary" :loading="searchLoading" plain @click="handleSearch">查 询</el-button>
                <el-button @click="onRest">重 置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table
            ref="userTable"
            v-loading="searchLoading"
            :data="tableData"
            style="width: 100%;margin-bottom: 20px;"
            row-key="id"
            highlight-current-row
            border
            @row-click="handleSelect"
          >
            <el-table-column prop="loginCode" label="登陆账号" align="left" />
            <el-table-column prop="userName" label="用户昵称" align="left" />
            <el-table-column prop="remarks" label="备注" width="120" align="left" />
          </el-table>
          <el-pagination
            background
            layout="sizes, prev, pager, next, total"
            :page-sizes="page.pageSizes"
            :page-size.sync="page.pageSize"
            :total="page.total"
            :current-page.sync="page.pageCurrent"
            @size-change="handleSearch"
            @current-change="handleSearch"
          />
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-tooltip class="item" effect="dark" content="确定选择用户" placement="top">
          <el-button type="primary" @click="setUser">确定</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="关闭弹窗" placement="top">
          <el-button @click="onCancel">取消</el-button>
        </el-tooltip>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { findUserByPosts } from '@/api/system/user'

export default {
  name: 'UserSelectByPost',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    posts: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      title: '选择用户',
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
      tableData: [],
      choosedUser: {}
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          this.handleSearch()
        }
      }
    }
  },
  methods: {
    setUser() {
      if (this.choosedUser.id) {
        this.$emit('setChoosedUser', this.choosedUser, this.type)
        this.onCancel()
      } else {
        this.$message('请选择一个用户!')
      }
    },
    handleSelect(row) {
      this.choosedUser = row
    },
    onCancel() {
      this.$emit('input', false)
    },
    onRest() {
      this.searchForm = {
        loginCode: '',
        userName: '',
        status: '0'
      }
      this.handleSearch()
    },
    handleSearch() {
      if (this.posts !== '') {
        const searchParams = {
          current: this.page.pageCurrent,
          size: this.page.pageSize
        }
        findUserByPosts(searchParams, { ...this.searchForm, posts: this.posts }).then(res => {
          if (!res.code) {
            const { records, current, size, total } = res.data
            this.tableData = records
            this.page.pageCurrent = current
            this.page.pageSize = size
            this.page.total = total
          }
        }).catch(err => {
          console.error(err)
        })
      }
    }
  }
}
</script>

<style>

</style>
