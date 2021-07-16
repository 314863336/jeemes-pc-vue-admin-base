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
        <el-col :span="24">
          <el-form-item label="数据范围">
            <el-radio
              v-for="(item, index) in getDict('sys_is_ctrl')"
              :key="'st'+index"
              v-model="formData.isCtrl"
              :label="item.dictValue"
            >{{ item.dictLabel }}</el-radio>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div v-show="formData.isCtrl === '1'">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-divider content-position="left">分配数据权限</el-divider>
          <div class="tree-filter-div">
            <el-form>
              <el-form-item>
                <el-input v-model="filterText" placeholder="输入关键字进行过滤" style="width:100%;" />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="small"
                  plain
                  @click="selectAll()"
                >全选</el-button>
                <el-button
                  type="primary"
                  size="small"
                  plain
                  @click="unSelectAll()"
                >反选</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-alert
            title="点击复选框选择当前节点和所有子节点，点击文字仅选择当前节点"
            type="info"
            :closable="false"
          />
          <el-tree
            ref="treeOffice"
            node-key="id"
            class="filter-tree"
            show-checkbox
            :data="treeData"
            :props="defaultProps"
            :default-expand-all="true"
            :filter-node-method="treefilter"
            :highlight-current="true"
            :expand-on-click-node="false"
            :check-on-click-node="false"
            :check-strictly="true"
            @node-click="nodeClick"
            @check="check"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { treeData } from '@/api/system/corp'
import { saveAssignDataScope } from '@/api/system/role'

import { loading, closeLoading } from '@/utils/loading'
import { mergeTreeData, mapReduceTreeData, findChildrenById } from '@/utils/tree'

export default {
  name: 'AssignDataScope',
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
      officeType: ['0', '1'],
      treeData: [],
      filterText: '',
      allIds: [],
      treeNodes: [],
      isCtrl: '',
      defaultProps: {
        children: 'children',
        label: 'officeName'
      }
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict'])
  },
  watch: {
    formData: {
      handler(val) {
        // 初始化时赋值 isCtrl
        if (!this.isCtrl) {
          this.isCtrl = val.isCtrl
        }
        this.getOfficeTreeData()
      },
      immediate: true,
      deep: true
    },
    filterText: {
      handler(val) {
        this.$refs.treeOffice.filter(val)
      }
    }
  },
  methods: {
    treefilter(value, data) {
      if (!value) {
        return true
      }
      return data.officeName.indexOf(value) !== -1
    },
    getOfficeTreeData() {
      treeData().then(res => {
        const data = res.data
        const to = []
        const from = []
        data.forEach(element => {
          if (element.officeType === this.officeType[0]) {
            to.push(element)
          } else {
            from.push(element)
          }
        })
        mergeTreeData(from, to, 'companyId')
        this.treeData = to
        this.treeNodes = mapReduceTreeData(this.treeData)
        this.$nextTick(() => {
          // 如果是自定义则显示已勾选的数据
          if (this.isCtrl === '1') {
            this.$refs.treeOffice.setCheckedKeys(this.relatedData.dataScopeIds ? this.relatedData.dataScopeIds : [])
          }
        })
      })
    },
    selectAll() {
      this.$refs.treeOffice.setCheckedNodes(this.treeNodes)
    },
    unSelectAll() {
      this.$refs.treeOffice.setCheckedNodes([])
    },
    saveAssignDataScope() {
      if (this.formData.isCtrl === '1') {
        const dataScopeNodes = this.$refs.treeOffice.getCheckedNodes()
        const data = []
        for (let i = 0; i < dataScopeNodes.length; i++) {
          const element = dataScopeNodes[i]
          const d = {
            id: '',
            officeId: element.id,
            roleId: this.formData.id,
            type: this.officeType[0]
          }
          if (element.officeType === this.officeType[0]) {
            d.type = this.officeType[0]
            data.push(d)
          } else {
            d.type = this.officeType[1]
            data.push(d)
          }
        }
        this.saveData(data)
      } else {
        this.saveData([])
      }
    },
    saveData(data) {
      const fullscreenLoading = loading()
      saveAssignDataScope(data, { isCtrl: this.formData.isCtrl, roleId: this.formData.id }).then(res => {
        this.$message({
          type: 'success',
          message: '数据权限分配成功!'
        })
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    },
    nodeClick(data, node, tree) {
      if (node.checked === false) {
        this.$refs.treeOffice.setChecked(data.id, true, false)
      } else {
        this.$refs.treeOffice.setChecked(data.id, false, false)
      }
    },
    check(data, checkedData) {
      if (checkedData.checkedKeys.indexOf(data.id) >= 0) {
        const children = findChildrenById(data.id, this.treeNodes)
        const childrenTreeNodes = mapReduceTreeData(children)
        childrenTreeNodes.push(...this.$refs.treeOffice.getCheckedNodes())
        this.$refs.treeOffice.setCheckedNodes(childrenTreeNodes)
      } else {
        const children = findChildrenById(data.id, this.treeNodes)
        const childrenTreeNodes = mapReduceTreeData(children)
        const ids = []
        for (let i = 0; i < childrenTreeNodes.length; i++) {
          const element = childrenTreeNodes[i]
          ids.push(element.id)
        }
        const checkedKeys = this.$refs.treeOffice.getCheckedKeys()
        this.$refs.treeOffice.setCheckedNodes([])
        for (let i = 0; i < checkedKeys.length; i++) {
          const element = checkedKeys[i]
          if (ids.indexOf(element) < 0) {
            this.$refs.treeOffice.setChecked(element, true)
          }
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.filter-tree{
  padding: 10px
}
</style>

