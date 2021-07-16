<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="菜单名称">
          <el-input v-model="searchForm.menuName" />
        </el-form-item>
        <el-form-item label="菜单类型">
          <el-select v-model="searchForm.menuType" placeholder="请选择">
            <el-option
              v-for="(item, index) in getDict('sys_menu_type')"
              v-show="item.dictValue=='1' || item.dictValue=='2'"
              :key="'sm'+index"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item :class="{expand:expandSearchbar}">
          <el-button type="primary" :loading="searchLoading" plain @click="findTableData">查 询</el-button>
          <el-button @click="onRest">重 置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-tools">
      <el-form inline>
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" plain @click="addForm">新增</el-button>
          <el-button type="primary" icon="el-icon-check" plain @click="saveTreeSortData">保存排序</el-button>
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
      <el-table-column prop="menuName" :show-overflow-tooltip="true" label="菜单名称" align="left" />
      <el-table-column prop="menuHref" :show-overflow-tooltip="true" label="链接" align="left" />
      <el-table-column prop="treeSort" :show-overflow-tooltip="true" label="排序" width="200" align="left">
        <template slot-scope="scope">
          <el-button size="mini" icon="el-icon-minus" plain @click="lessTreeSort(scope.row)" />
          <el-input v-model="scope.row.treeSort" size="small" style="width:60px" @change="sortChanged(scope.row)" />
          <el-button size="mini" icon="el-icon-plus" plain @click="addTreeSort(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column prop="menuType" :show-overflow-tooltip="true" label="菜单类型" width="100" align="left">
        <template slot-scope="scope">
          {{ getDict("sys_menu_type", scope.row.menuType, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="layoutType" :show-overflow-tooltip="true" label="布局类型" width="100" align="left">
        <template slot-scope="scope">
          {{ getDict("sys_layout_type", scope.row.layoutType, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="isShow" :show-overflow-tooltip="true" label="是否可见" width="100" align="left">
        <template slot-scope="scope">
          {{ getDict("sys_yes_no", scope.row.isShow, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="permission" :show-overflow-tooltip="true" label="权限标识" width="100" align="left" />
      <el-table-column prop="weight" :show-overflow-tooltip="true" label="权重" width="120" align="left">
        <template slot-scope="scope">
          {{ getDict("sys_menu_weight", scope.row.weight, true) }}
        </template>
      </el-table-column>
      <el-table-column prop="actions" label="操作" width="300" align="left">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" title="编辑机构" @click="editForm(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" title="删除机构" @click="deleteForm(scope.row)">删除</el-button>
          <el-button type="primary" size="mini" title="新增下级机构" @click="addSubForm(scope.row)">新增下级</el-button>
        </template>
      </el-table-column>
    </el-table>

    <menu-form ref="menuForm" @findTableData="findTableData" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { findMenuTreeDataLazy, deleteMenu, saveTreeSortData } from '@/api/system/menu'
import MenuForm from '@/views/system/menu/Form.vue'
import { lessTreeSort, addTreeSort } from '@/utils/tree-sort'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'MenuList',
  components: { MenuForm },
  data() {
    return {
      expandSearchbar: false,
      searchLoading: false,
      searchForm: {
        menuName: '',
        menuType: '1'// 默认PC菜单
      },
      tableData: [],
      expandRowKeys: [],
      treeSortData: []
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict'])
  },
  mounted() {
    this.findTableData()
  },
  methods: {
    onRest() {
      this.searchForm = {
        menuName: '',
        menuType: '1'// 默认PC菜单
      }
      this.findTableData()
    },
    findTableData() {
      this.tableData = []
      this.expandRowKeys = []
      this.searchLoading = true
      const search = JSON.parse(JSON.stringify(this.searchForm))
      switch (search.menuType) {
        case '1':// pc
          search.menuType += ',3'// 拼接权限菜单类型
          break
        case '2':// app
          search.menuType += ',4'// 拼接权限菜单类型
          break
        default:
          search.menuType += ',3'// 拼接权限菜单类型
      }
      findMenuTreeDataLazy(search).then(res => {
        this.tableData = res.data
        this.expandRowKeys = res.expandRowKeys
      }).finally(() => {
        this.searchLoading = false
      })
    },
    deleteForm(row) {
      this.$confirm('该菜单包括子菜单将一并删除，确定删除选择的数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMenu({ ids: row.id }).then(res => {
          this.$message({
            type: 'success',
            message: '菜单删除成功!'
          })
          this.findTableData()
        })
      })
    },
    addForm() {
      this.$refs.menuForm.addForm()
    },
    editForm(row) {
      this.$refs.menuForm.editForm(row)
    },
    addSubForm(row) {
      this.$refs.menuForm.addSubForm(row)
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
    sortChanged(row) {
      this.treeSortData.push(row)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
