<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form v-if="isMainSearch" :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="名称">
          <el-input v-model="searchForm.fileInfo.fileName" />
        </el-form-item>
        <el-form-item label="接收人">
          <el-input v-model="searchForm.toUserNames" :readonly="true">
            <el-button slot="append" icon="el-icon-search" @click="selectUser" />
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="searchLoading" plain @click="onSubmit">查 询</el-button>
          <el-button @click="onRest">重 置</el-button>
        </el-form-item>
      </el-form>

      <el-form v-else :inline="true" :model="searchFormFileInfo" class="demo-form-inline">
        <el-form-item label="名称">
          <el-input v-model="searchFormFileInfo.fileName" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="searchLoading" plain @click="onSubmitFileInfo('')">查 询</el-button>
          <el-button @click="searchFormFileInfo.fileName=''">重 置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="!isMainSearch" class="table-tools">
      <el-form inline>
        <el-form-item>
          <el-button type="primary" icon="el-icon-back" plain @click="returnParent">返回上级</el-button>
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
      <el-table-column prop="htFileInfo.fileName" :show-overflow-tooltip="true" label="名称" align="left" />
      <el-table-column prop="toUserNames" :show-overflow-tooltip="true" label="接收人" align="left" />
      <el-table-column prop="htFileInfo.fileType" :show-overflow-tooltip="true" label="类型" align="left">
        <template slot-scope="scope">
          {{ getDict("file_type", scope.row.htFileInfo.fileType, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="createDate" :show-overflow-tooltip="true" label="分享时间" align="left" />
      <el-table-column prop="actions" label="操作" width="300" align="left">
        <template slot-scope="scope">
          <el-button v-if="scope.row.htFileInfo.fileType === '1'" type="primary" size="mini" title="展开下级" @click="openChilds(scope.row)">展开</el-button>
          <el-button v-else type="primary" size="mini" title="下载" @click="downLoad(scope.row)">下载</el-button>
          <el-button v-show="isMainSearch" type="danger" size="mini" title="取消分享" @click="deleteShared(scope.row)">取消</el-button>
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

    <user-select-single
      ref="userSelect"
      :extra-params="extraParams"
      :choosed-user="searchForm.fromUserId"
      @setChoosedUser="setChoosedUser"
    />
  </div>
</template>

<script>

import UserSelectSingle from '@/views/system/components/user/UserSelectSingle.vue'
import { mapGetters } from 'vuex'
import { fromMeList, pageByParentId, deleteShared } from '@/api/file/shared'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'RoleList',
  components: { UserSelectSingle },
  data() {
    return {
      page: {
        pageSize: 10,
        pageSizes: [5, 10, 20, 50],
        pageCurrent: 1,
        total: 0
      },
      extraParams: {},
      searchLoading: false,
      searchForm: {
        fileInfo: {
          fileName: ''
        },
        toUserIds: '',
        toUserNames: '',
        status: '0'
      },
      searchFormFileInfo: {
        fileName: ''
      },
      tableData: [],
      rootId: '',
      rootFileInfoId: '',
      currentParentId: '',
      isMainSearch: false, // 标识列表是查询出来的结果，而不是点击展开的结果
      deleteNum: 0
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
        fileInfo: {
          fileName: ''
        },
        toUserIds: '',
        toUserNames: '',
        status: '0'
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
      fromMeList(searchParams).then(res => {
        this.tableData = res.data.records
        this.page.pageCurrent = res.data.current
        this.page.pageSize = res.data.size
        this.page.total = res.data.total
        this.isMainSearch = true
        this.searchFormFileInfo = {
          fileName: ''
        }
      }).finally(() => {
        this.searchLoading = false
      })
    },
    selectUser() {
      this.extraParams = {
        // 默认查询当前用户下的公司及子公司下的数据
        filterbyCurrentUser: true,
        // 默认查询普通用户和二级管理员
        userTypeLe: 1
      }
      this.$refs.userSelect.dialogVisible = true
    },
    downLoad(row) {
      if (row.htFileInfo.address) {
        window.location.href = process.env.VUE_APP_BASE_URL_FILE + '/file/download/' + row.htFileInfo.fileName + '?address=' + row.htFileInfo.address
      }
    },
    returnParent() {
      if (this.currentParentId === this.rootFileInfoId) {
        this.onSubmit()
      } else {
        this.onSubmitFileInfo('-1')
      }
    },
    onSubmitFileInfo(parentId) {
      const data = {
        current: this.page.pageCurrent,
        size: this.page.pageSize,
        params: { parentId: parentId || this.currentParentId, fileName: this.searchFormFileInfo.fileName }
      }

      if (parentId === '-1') {
        data.params.id = this.currentParentId
      }

      const params = { rootId: this.rootId }
      this.searchFileInfo(data, params)
    },
    openChilds(row) {
      let parentId = row.id
      if (this.isMainSearch) {
        this.rootId = row.id
        this.rootFileInfoId = row.fileInfoId
        parentId = row.fileInfoId
      } else {
        parentId = row.id
      }
      const data = {
        current: this.page.pageCurrent,
        size: this.page.pageSize,
        params: { parentId: parentId }
      }
      const params = { rootId: this.rootId }
      this.searchFileInfo(data, params)
    },
    searchFileInfo(data, params) {
      this.searchLoading = true
      pageByParentId(data, params).then(res => {
        this.tableData = res.data.records
        this.page.pageCurrent = res.data.current
        this.page.pageSize = res.data.size
        this.page.total = res.data.total
        this.isMainSearch = false
        this.currentParentId = res.parentId
      }).finally(() => {
        this.searchLoading = false
      })
    },
    deleteShared(row) {
      this.$confirm('确定选择的文件取消分享？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const fullscreenLoading = loading()
        deleteShared({ id: row.id }).then(res => {
          this.$message({
            type: 'success',
            message: '文件分享取消成功!'
          })
          this.deleteNum = 1
          this.onSubmit()
        }).finally(() => {
          closeLoading(fullscreenLoading)
        })
      })
    },
    setChoosedUser(user) {
      this.searchForm.toUserIds = user.id
      this.searchForm.toUserNames = user.userName
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
