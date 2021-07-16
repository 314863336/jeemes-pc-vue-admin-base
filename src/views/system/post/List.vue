<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="岗位名称">
          <el-input v-model="searchForm.postName" />
        </el-form-item>
        <el-form-item label="岗位编码">
          <el-input v-model="searchForm.postCode" />
        </el-form-item>
        <el-form-item v-show="expandSearchbar" label="岗位权重">
          <el-select v-model="formData.postType" placeholder="请选择">
            <el-option
              v-for="(item, index) in getDict('sys_user_type')"
              :key="'wi'+index"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item v-show="expandSearchbar" label="岗位状态">
          <el-select v-model="formData.status" placeholder="请选择">
            <el-option
              v-for="(item, index) in getDict('sys_status')"
              :key="'st'+index"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item> -->
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
          <!-- <el-button type="primary" icon="el-icon-check" plain @click="saveTreeSortData">保存排序</el-button> -->
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
      :expand-row-keys="expandRowKeys"
      :tree-props="{children: 'children'}"
    >
      <el-table-column prop="postName" :show-overflow-tooltip="true" label="岗位名称" align="left" />
      <el-table-column prop="postCode" :show-overflow-tooltip="true" label="岗位编码" align="left" />
      <!-- <el-table-column prop="treeSort" label="排序" width="200" align="left">
        <template slot-scope="scope">
          <el-button size="mini" icon="el-icon-minus" plain @click="lessTreeSort(scope.row)" />
          {{ scope.row.treeSort }}
          <el-button size="mini" icon="el-icon-plus" plain @click="addTreeSort(scope.row)" />
        </template>
      </el-table-column> -->
      <el-table-column prop="postType" :show-overflow-tooltip="true" label="岗位权重" width="200" align="left">
        <template slot-scope="scope">
          {{ getDict("sys_user_type", scope.row.postType, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="remarks" :show-overflow-tooltip="true" label="描述" width="200" align="left" />
      <el-table-column prop="status" :show-overflow-tooltip="true" label="状态" width="120" align="left">
        <template slot-scope="scope">
          {{ getDict("sys_status", scope.row.status, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="actions" label="操作" width="350" align="left">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" title="编辑机构" @click="editForm(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" title="删除机构" @click="deleteForm(scope.row)">删除</el-button>
          <el-button type="primary" size="mini" title="新增下级机构" @click="addSubForm(scope.row)">新增下级</el-button>

          <el-dropdown>
            <el-button class="el-dropdown-link" size="mini" title="更多操作">更多</el-button>
            <el-dropdown-menu slot="dropdown">

              <el-dropdown-item>
                <el-button type="text" size="small" @click="assignRole(scope.row)">分配角色</el-button>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-button type="text" size="small" @click="assignUser(scope.row)">分配用户</el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <post-form ref="postForm" @findTableData="findTableData" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { findPostList, saveTreeSortData, deletePost } from '@/api/system/post'
import { lessTreeSort, addTreeSort } from '@/utils/tree-sort'
import PostForm from '@/views/system/post/Form.vue'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'PostList',
  components: { PostForm },
  data() {
    return {
      expandSearchbar: false,
      searchLoading: false,
      searchForm: {
        postName: '',
        postCode: '',
        postType: '',
        status: '0'
      },
      formData: {},
      formDialogVisible: false,
      title: '',
      tableData: [],
      expandRowKeys: [],
      treeSortData: []
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict']),
    isAdd() {
      return !this.formData.id
    }
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
        postName: '',
        postCode: '',
        postType: '',
        status: '0'
      }
      this.formData = {}
      this.onSubmit()
    },
    findTableData() {
      this.tableData = []
      this.expandRowKeys = []
      this.searchLoading = true
      findPostList(this.searchForm).then(res => {
        this.tableData = res.data
        this.expandRowKeys = res.expandRowKeys
      }).finally(() => {
        this.searchLoading = false
      })
    },
    addForm() {
      this.$refs.postForm.addForm()
    },
    editForm(row) {
      this.$refs.postForm.editForm(row.id)
    },
    addSubForm(row) {
      this.$refs.postForm.addSubForm(row)
    },
    assignUser(row) {
      this.$refs.postForm.assignUser(row.id)
    },
    assignRole(row) {
      this.$refs.postForm.assignRole(row.id)
    },
    lessTreeSort(row) {
      lessTreeSort(row, this.treeSortData)
    },
    addTreeSort(row) {
      addTreeSort(row, this.treeSortData)
    },
    saveTreeSortData() {
      if (this.treeSortData.length === 0) {
        this.$message({
          type: 'info',
          message: '没有要保存的排序!'
        })
        return
      }
      const fullscreenLoading = loading()
      saveTreeSortData(this.treeSortData).then(res => {
        this.treeSortData = []
        this.findTableData()
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    },
    deleteForm(row) {
      this.$confirm('该岗位包括子岗位将一并删除, 确定删除选择的数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const fullscreenLoading = loading()
        deletePost({ ids: row.id }).then(res => {
          this.$message({
            type: 'success',
            message: '岗位删除成功!'
          })
          this.findTableData()
        }).finally(() => {
          closeLoading(fullscreenLoading)
        })
      })
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
