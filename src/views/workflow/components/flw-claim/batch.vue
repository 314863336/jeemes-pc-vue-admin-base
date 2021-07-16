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
  name: 'FlwClaimBatch',
  components: { UserSelectByPost },
  props: {
    entityList: {
      type: Array,
      required: true
    },
    groupsLists: {
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
    groupsLists: {
      handler(value) {
        if (value.length > 0) {
          const groupsList = value[0]
          if (groupsList.length > 0) {
            if (groupsList.length === 1) {
              this.row = groupsList[0]
              this.posts = this.row.groups
              this.dialogUserSelectByPostVisible = true
            } else {
              this.tableData = groupsList
              this.dialogTableVisible = true
            }
          }
        }
      }
    }
  },
  methods: {
    submitTable() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        this.tableData.forEach(item => {
          if (!item.loginCode) {
            throw new Error('存在遗漏的用户指定！')
          }
        })
        this.groupsLists.forEach((groupsList, index, array) => {
          groupsList.forEach(item => {
            this.tableData.forEach(row => {
              if (item.definitionKey === row.definitionKey) {
                item.loginCode = row.loginCode
              }
            })
          })
          claimBatchTask(groupsList).then(res => {
            console.log(res)
          }).catch(err => {
            console.error(err)
          }).finally(() => {
            if (index === array.length - 1) {
              this.dialogTableVisible = false
              this.$emit('change')
            }
          })
        })
        this.$message({
          type: 'success',
          message: '操作成功!'
        })
      } catch (e) {
        this.$message({
          type: 'error',
          message: e.message
        })
      } finally {
        loading.close()
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
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        try {
          if (this.entityList && this.entityList.length > 0) {
            this.entityList.forEach((item, index, array) => {
              claimTask({ loginCode: user.loginCode }, item).then(res => {
                console.log(res)
              }).catch(err => {
                console.error(err)
              }).finally(() => {
                if (index === array.length - 1) {
                  this.dialogUserSelectByPostVisible = false
                  this.$emit('change')
                }
              })
            })
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
          }
        } catch (err) {
          console.error(err)
        } finally {
          loading.close()
        }
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
