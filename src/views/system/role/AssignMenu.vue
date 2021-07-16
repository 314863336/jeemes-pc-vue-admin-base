<template>
  <div>
    <el-form ref="form" :model="formData" label-width="120px">
      <el-divider content-position="left">基本信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="角色名称">
            <el-input v-model="formData.roleName" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色编号">
            <el-input v-model="formData.roleCode" :disabled="true" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-divider content-position="left">分配菜单</el-divider>
    <div class="custom-tree-container">
      <div class="block">
        <div class="menu-type">
          <el-row>
            <el-col :span="12">
              <el-checkbox v-model="pcChecked" @change="menuTypePC">PC菜单</el-checkbox>
            </el-col>
            <el-col :span="12">
              <el-link type="primary" @click="unFoldAllPc">展开</el-link>
              <span>/</span>
              <el-link type="primary" @click="collapseAllPc">折叠</el-link>
            </el-col>
          </el-row>
        </div>
        <el-tree
          ref="treeMenu"
          node-key="id"
          class="filter-tree"
          show-checkbox
          :data="treeData"
          :props="defaultProps"
          :default-expand-all="true"
          :highlight-current="true"
          :expand-on-click-node="false"
          :check-on-click-node="true"
          :check-strictly="false"
        />
      </div>
      <div class="block">
        <div class="menu-type">
          <el-row>
            <el-col :span="12">
              <el-checkbox v-model="appChecked" @change="menuTypeAPP">APP菜单</el-checkbox>
            </el-col>
            <el-col :span="12">
              <el-link type="primary" @click="unFoldAllApp">展开</el-link>
              <span>/</span>
              <el-link type="primary" @click="collapseAllApp">折叠</el-link>
            </el-col>
          </el-row>
        </div>
        <el-tree
          ref="appTreeMenu"
          node-key="id"
          class="filter-tree"
          show-checkbox
          :data="appTreeData"
          :props="defaultProps"
          :default-expand-all="true"
          :highlight-current="true"
          :expand-on-click-node="false"
          :check-on-click-node="true"
          :check-strictly="false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { findMenuTreeData } from '@/api/system/menu'
import { saveAssignMenu } from '@/api/system/role'
import { loading, closeLoading } from '@/utils/loading'
import { mapReduceTreeData, isHaveChildren } from '@/utils/tree'

export default {
  name: 'AssignMenu',
  props: {
    formData: {
      type: Object,
      default: () => {}
    },
    relatedData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      pcChecked: false,
      appChecked: false,
      treeData: [],
      appTreeData: [],
      filterText: '',
      allIds: [],
      treeNodes: [], // 平铺树数据，包括子数据
      defaultProps: {
        children: 'children',
        label: 'menuName'
      }
    }
  },
  computed: {
  },
  watch: {
    formData: {
      handler(val) {
        this.getMenuTreeData()
      },
      immediate: true,
      deep: true
    },
    filterText: {
      handler(val) {
        this.$refs.treeMenu.filter(val)
      }
    }
  },
  methods: {
    // 全部展开
    unFoldAllPc() {
      // 将没有转换成树的原数据
      this.treeData.forEach(ele => {
        this.$refs.treeMenu.store.nodesMap[ele.id].expanded = true
      })
    },
    // 全部折叠
    collapseAllPc() {
      // 将没有转换成树的原数据
      this.treeData.forEach(ele => {
        this.$refs.treeMenu.store.nodesMap[ele.id].expanded = false
      })
    },
    // 全部展开
    unFoldAllApp() {
      // 将没有转换成树的原数据
      this.appTreeData.forEach(ele => {
        this.$refs.appTreeMenu.store.nodesMap[ele.id].expanded = true
      })
    },
    // 全部折叠
    collapseAllApp() {
      // 将没有转换成树的原数据
      this.appTreeData.forEach(ele => {
        this.$refs.appTreeMenu.store.nodesMap[ele.id].expanded = false
      })
    },
    treefilter(value, data) {
      if (!value) {
        return true
      }
      return data.menuName.indexOf(value) !== -1
    },
    getMenuTreeData() {
      findMenuTreeData({ weight: this.formData.roleType }).then(res => {
        this.allIds = res.allIds
        const pcTreeData = []
        const appTreeData = []
        res.data.forEach(ele => {
          if (ele.menuType === '1') { // pc
            pcTreeData.push(ele)
          } else if (ele.menuType === '2') { // app
            appTreeData.push(ele)
          }
        })
        this.treeData = pcTreeData
        this.appTreeData = appTreeData
        this.treeNodes = mapReduceTreeData(this.treeData)
        this.$nextTick(() => {
          for (let i = 0; i < this.relatedData.menuIds.length; i++) {
            const element = this.relatedData.menuIds[i]
            if (!isHaveChildren(element, this.treeNodes)) {
              this.$refs.treeMenu.setChecked(element, true)
            }
          }
        })
        const appTreeNodes = mapReduceTreeData(this.appTreeData)
        this.$nextTick(() => {
          for (let i = 0; i < this.relatedData.menuIds.length; i++) {
            const element = this.relatedData.menuIds[i]
            if (!isHaveChildren(element, appTreeNodes)) {
              this.$refs.appTreeMenu.setChecked(element, true)
            }
          }
        })
      })
    },
    menuTypePC(val) {
      if (val) {
        this.selectAll()
      } else {
        this.unSelectAll()
      }
    },
    selectAll() {
      this.$refs.treeMenu.setCheckedKeys(this.allIds)
    },
    unSelectAll() {
      this.$refs.treeMenu.setCheckedKeys([])
    },
    menuTypeAPP(val) {
      if (val) {
        this.selectAllAPP()
      } else {
        this.unSelectAllAPP()
      }
    },
    selectAllAPP() {
      this.$refs.appTreeMenu.setCheckedKeys(this.allIds)
    },
    unSelectAllAPP() {
      this.$refs.appTreeMenu.setCheckedKeys([])
    },
    saveAssignMenu() {
      const menuIds = this.$refs.treeMenu.getCheckedKeys()
      menuIds.push(...this.$refs.treeMenu.getHalfCheckedKeys())
      menuIds.push(...this.$refs.appTreeMenu.getCheckedKeys())
      menuIds.push(...this.$refs.appTreeMenu.getHalfCheckedKeys())
      const fullscreenLoading = loading()
      saveAssignMenu({ ids: menuIds.join(','), id: this.formData.id }).then(res => {
        this.$message({
          type: 'success',
          message: '菜单分配成功!'
        })
        this.relatedData.menuIds = menuIds
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    }
  }
}
</script>

<style lang="less">
.block{
  width: 50%;
  .menu-type{
    margin-bottom: 14px;
  }
}
.custom-tree-container{
  display: flex;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>

