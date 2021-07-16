<template>
  <div>
    <div class="tree-filter-div">
      <el-form>
        <el-form-item>
          <el-input v-model="filterText" placeholder="输入关键字进行过滤" style="width:100%;" />
        </el-form-item>
      </el-form>
    </div>
    <el-tree
      ref="officeTree"
      :data="treeData"
      node-key="id"
      :highlight-current="true"
      :default-expand-all="true"
      :expand-on-click-node="false"
      :filter-node-method="treefilter"
      :props="defaultProps"
      @node-click="nodeClick"
    />
  </div>
</template>

<script>
// 默认查询当前用户下的公司以及子公司和部门，如需改变需要设置params.filterbyCurrentUser = false
import { treeData } from '@/api/system/corp'

export default {
  name: 'OfficeTree',
  props: {
    params: {
      type: Object,
      default: () => {
        return {
          filterbyCurrentUser: true // 默认只获取当前用户所在公司以及子公司下的机构
        }
      }
    }
  },
  data() {
    return {
      officeType: ['0', '1'],
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'officeName'
      },
      filterText: ''
    }
  },
  watch: {
    filterText: {
      handler(val) {
        this.$refs.officeTree.filter(val)
      }
    }
  },
  mounted() {
    this.initTreeData()
  },
  methods: {
    treefilter(value, data) {
      if (!value) {
        return true
      }
      return data.officeName.indexOf(value) !== -1
    },
    initTreeData() {
      treeData(this.params).then(res => {
        const data = res.data
        this.treeData = data
        this.$nextTick(() => {
          if (this.treeData.length > 0) {
            this.$refs.officeTree.setCurrentKey(this.treeData[0].id)
            this.nodeClick(this.$refs.officeTree.getCurrentNode())
          }
        })
      })
    },
    nodeClick(data) {
      this.$emit('treeClick', data)
    },
    getSelectData() {
      const currentNode = this.$refs.officeTree.getCurrentNode()
      if (!currentNode) {
        this.cancelSelect()
        return
      }
      let companyNode = {}
      if (currentNode.officeType === this.officeType[1]) {
        companyNode = this.$refs.officeTree.getNode(currentNode.companyId)
      }
      return { 'node': currentNode, 'companyNode': companyNode.data }
    }
  }
}
</script>

<style scoped>
</style>
