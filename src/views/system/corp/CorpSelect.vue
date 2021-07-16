<template>
  <div class="app-container">
    <el-tree
      ref="corpTree"
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
  name: 'CorpSelect',
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
      this.$emit('setParent', this.$refs.corpTree.getCurrentNode())
      this.$emit('hideDialog')
    },
    onCancel() {
      this.$emit('hideDialog')
    },
    initTreeData() {
      treeData({ id: this.parentId, officeType: 0, filterbyCurrentUser: true }).then(res => {
        this.data = res.data
        // 保证首次加载dom完成后再执行
        this.$nextTick(() => {
          this.$refs.corpTree.setCurrentKey(this.parentId)
        })
      })
    },
    resetTree() {
      this.$refs.corpTree.setCurrentKey(null)
    }
  }
}
</script>

<style scoped>
</style>
