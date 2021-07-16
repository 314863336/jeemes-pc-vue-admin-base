<template>
  <div>
    <user-select-by-post v-model="dialogUserSelectByPostVisible" :posts="posts" :type="type" @setChoosedUser="setChoosedUser" />
    <el-dialog
      title="下一个办理人选择"
      :visible.sync="dialogTableVisible"
      append-to-body
      width="30%"
    >
      <el-table
        :data="tableData"
        row-key="id"
        highlight-current-row
        border
      >
        <el-table-column property="name" label="环节姓名" width="200" />
        <el-table-column property="createTime" label="创建时间" />
        <el-table-column>
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.userName ? 'primary' : 'success'"
              disable-transitions
              @click="handleTagClick(scope.row)"
            >{{ scope.row.userName || '选择用户' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-tooltip class="item" effect="dark" content="确定选择用户" placement="top">
          <el-button type="primary" @click="submitTable">确定</el-button>
        </el-tooltip>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { claimTask, claimBatchTask } from '@/api/workflow/manage'
import UserSelectByPost from '@/views/system/components/user/UserSelectByPost.vue'

export default {
  name: 'FlwClaim',
  components: { UserSelectByPost },
  props: {
    entity: {
      type: Object,
      default: () => {
        return {
          processInstanceId: null
        }
      }
    },
    groupsList: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      dialogUserSelectByPostVisible: false,
      posts: '',
      dialogTableVisible: false,
      tableData: [],
      type: 'single' // multiple
    }
  },
  watch: {
    groupsList: {
      handler(value) {
        if (value.length > 0) {
          if (value.length === 1) {
            this.row = value[0]
            this.posts = this.row.groups
            this.dialogUserSelectByPostVisible = true
          } else {
            this.tableData = value
            this.dialogTableVisible = true
          }
        }
      }
    }
  },
  methods: {
    submitTable() {
      try {
        this.tableData.forEach(item => {
          if (!item.loginCode) {
            throw new Error('存在遗漏的用户指定！')
          }
        })
        claimBatchTask(this.tableData).then(res => {
          console.log(res)
        }).catch(err => {
          console.error(err)
        }).finally(() => {
          this.dialogTableVisible = false
          this.$emit('change')
        })
      } catch (e) {
        this.$message({
          type: 'error',
          message: e.message
        })
      }
    },
    handleTagClick(row) {
      this.posts = row.groups
      this.dialogUserSelectByPostVisible = true
      this.type = 'multiple'
      this.row = row
    },
    setChoosedUser(user, type) {
      if (type === 'single') {
        claimTask({ ...this.row, loginCode: user.loginCode }, this.entity).then(res => {
          console.log(res)
        }).catch(err => {
          console.error(err)
        }).finally(() => {
          this.dialogUserSelectByPostVisible = false
          this.$emit('change')
        })
      } else {
        this.row.userName = user.userName
        this.row.loginCode = user.loginCode
      }
    }
  }

}
</script>

<style>

</style>
