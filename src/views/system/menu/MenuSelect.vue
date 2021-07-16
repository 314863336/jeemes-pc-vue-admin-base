<template>
  <div class="app-container">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      :show-close="false"
      top="20px"
      :title="dialogData.title"
    >
      <el-tree
        ref="menuTree"
        :data="data"
        node-key="id"
        :highlight-current="true"
        :default-expand-all="true"
        :expand-on-click-node="false"
        :props="defaultProps"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmSelect">确定</el-button>
        <el-button @click="cancelSelect">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { findMenuPTreeData } from '@/api/system/menu'

export default {
  name: 'MenuSelect',
  props: {
    dialogData: {
      type: Object,
      default: () => {
        return {
          title: '选择菜单',
          id: ''
        }
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      data: [],
      defaultProps: {
        children: 'children',
        label: 'menuName'
      }
    }
  },
  watch: {
    dialogVisible: {
      handler(val) {
        if (val === true) {
          this.initTreeData()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    confirmSelect() {
      this.$emit('setParent', this.$refs.menuTree.getCurrentNode())
      this.dialogVisible = false
    },
    cancelSelect() {
      this.dialogVisible = false
    },
    initTreeData() {
      findMenuPTreeData({ id: this.dialogData.id }).then(res => {
        this.data = res.data
        // 保证首次加载dom完成后再执行
        this.$nextTick(() => {
          this.$refs.menuTree.setCurrentKey(this.id)
        })
      })
    },
    resetTree() {
      this.$refs.menuTree.setCurrentKey(null)
    }
  }
}
</script>

<style scoped>
</style>
