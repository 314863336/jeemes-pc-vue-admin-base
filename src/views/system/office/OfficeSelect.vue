<template>
  <div class="app-container">
    <el-tree
      ref="officeTree"
      :data="data"
      node-key="id"
      :highlight-current="true"
      :default-expand-all="true"
      :expand-on-click-node="false"
      :props="defaultProps"
    />
  </div>
</template>

<script>
import { treeData } from '@/api/system/corp'

export default {
  name: 'OfficeSelect',
  props: {
    parentId: {
      type: String,
      default: ''
    },
    corpDialogVisible: Boolean
  },
  data() {
    return {
      data: [],
      defaultProps: {
        children: 'children',
        label: 'officeName'
      }
    }
  },
  watch: {
    corpDialogVisible: {
      handler(val) {
        this.initTreeData()
      },
      immediate: true
    }
  },
  methods: {
    onSubmit() {
      const currentNode = this.$refs.officeTree.getCurrentNode()
      let companyNode = {}
      if (currentNode.officeType === '1') {
        companyNode = this.$refs.officeTree.getNode(currentNode.companyId).data
      } else {
        this.$message({
          type: 'warning',
          message: '请选择部门!'
        })
        return
      }
      this.$emit('setParentOffice', currentNode, companyNode)
      this.$emit('hideOfficeDialog')
    },
    onCancel() {
      this.$emit('hideOfficeDialog')
    },
    initTreeData() {
      treeData({ id: this.parentId, filterbyCurrentUser: true }).then(res => {
        this.data = res.data
        // 保证首次加载dom完成后再执行
        this.$nextTick(() => {
          this.$refs.officeTree.setCurrentKey(this.parentId)
        })
      })
    },
    resetTree() {
      this.$refs.officeTree.setCurrentKey(null)
    }
  }
}
</script>

<style scoped>
</style>
