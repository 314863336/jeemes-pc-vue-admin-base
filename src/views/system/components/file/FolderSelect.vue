<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      :show-close="false"
      width="300px"
      title="选择文件夹"
    >
      <div class="tree-filter-div">
        <el-form>
          <el-form-item>
            <el-input v-model="filterText" placeholder="输入关键字进行过滤" style="width:100%;" />
          </el-form-item>
        </el-form>
      </div>
      <el-tree
        ref="folderTree"
        :data="treeData"
        node-key="id"
        :highlight-current="true"
        :default-expand-all="true"
        :expand-on-click-node="false"
        :filter-node-method="treefilter"
        :props="defaultProps"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmSelect">确定</el-button>
        <el-button @click="resetFolder">清空</el-button>
        <el-button @click="cancelSelect">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 默认查询当前用户下的公司以及子公司和部门，如需改变需要设置dialogData.params.filterbyCurrentUser = false
import { treeData } from '@/api/file/file'

export default {
  name: 'FolderSelect',
  data() {
    return {
      officeType: ['0', '1'],
      dialogVisible: false,
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'fileName'
      },
      filterText: ''
    }
  },
  watch: {
    dialogVisible: {
      handler(val) {
        if (val === true) {
          this.initTreeData()
        }
      },
      immediate: true
    },
    filterText: {
      handler(val) {
        this.$refs.folderTree.filter(val)
      }
    }
  },
  methods: {
    treefilter(value, data) {
      if (!value) {
        return true
      }
      return data.fileName.indexOf(value) !== -1
    },
    confirmSelect() {
      const currentNode = this.$refs.folderTree.getCurrentNode()
      if (!currentNode) {
        this.cancelSelect()
        return
      }
      // 如果选择为部门，则会把部门所属公司给传递过去
      //   let companyNode = {}
      //   if (currentNode.officeType === this.officeType[1]) {
      //     companyNode = this.$refs.folderTree.getNode(currentNode.companyId)
      //   }
      this.$emit('setFolder', currentNode)
      this.dialogVisible = false
    },
    resetFolder() {
      this.resetTree()
    //   this.$emit('resetOffice')
    },
    cancelSelect() {
      this.dialogVisible = false
    },
    initTreeData() {
      treeData({ fileType: 1 }).then(res => {
        const data = res.data
        this.treeData = data
        // this.$nextTick(() => {
        //   this.$refs.officeTree.setCurrentKey(this.dialogData.officeId)
        // })
      })
    },
    resetTree() {
      this.$refs.folderTree.setCurrentKey(null)
    }
  }
}
</script>

<style scoped>
</style>
