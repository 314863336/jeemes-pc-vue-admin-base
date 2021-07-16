<template>
  <div class="flw-task-go-back">
    <el-dialog
      title="退回"
      :visible.sync="dialogGoBackVisible"
      width="30%"
      :center="true"
      append-to-body
      :before-close="handleClose"
    >
      <div><strong>当前环节：</strong><span>{{ task && task.name }}</span></div>
      <h6>退回到哪：</h6>
      <el-table
        border
        :data="beforeNodes"
        highlight-current-row
        @current-change="handleCurrentChange"
      >
        <el-table-column type="index" width="50" />
        <el-table-column property="id" label="环节编号" />
        <el-table-column property="name" label="环节名称" />
      </el-table>
      <h6>退回原因：</h6>
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" class="demo-ruleForm">
        <el-form-item prop="desc">
          <el-input v-model="ruleForm.desc" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog
      title="提示"
      :visible.sync="centerDialogVisible"
      width="20%"
      center
      append-to-body
    >
      <span>是否交由原处理人？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleNo">否</el-button>
        <el-button type="primary" @click="handleOk">是</el-button>
      </span>
    </el-dialog>
    <flw-claim
      :entity="entity"
      :groups-list="groupsList"
      @change="onChangeProcess"
    />
  </div>
</template>

<script>
import { getBeforeNodes, goBack, claimBatchTask } from '@/api/workflow/manage'
import FlwClaim from '../../flw-claim'

export default {
  name: 'FlwTaskGoBack',
  components: { FlwClaim },
  props: {
    value: {
      type: Number,
      default: 0
    },
    entity: {
      type: Object,
      default: () => {
        return {
          processInstanceId: null
        }
      }
    },
    variables: {
      type: Object,
      default: () => {
        return {
          mr: '111'
        }
      }
    },
    task: {
      type: Object,
      default: () => {
        return {
          name: ''
        }
      }
    }
  },
  data() {
    return {
      beforeNodes: [],
      dialogGoBackVisible: false,
      ruleForm: {
        desc: ''
      },
      rules: {
        desc: [
          { required: true, message: '请填写原因', trigger: 'blur' }
        ]
      },
      currentRow: null,
      centerDialogVisible: false,
      groupsList: []
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val === 2) {
          this.dialogGoBackVisible = true
          getBeforeNodes(this.entity).then(res => {
            res.code || (this.beforeNodes = res.data)
          }).catch(err => {
            console.error(err)
          })
        }
      }
    }
  },
  methods: {
    handleNo() {
      this.centerDialogVisible = false
      this.groupsList = this.res.groupsList
    },
    handleOk() {
      claimBatchTask(this.res.groupsList, { isHistoric: true }).then(res => {
        console.log(res)
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        this.centerDialogVisible = false
        this.$emit('change', this.res)
      })
    },
    onChangeProcess() {
      this.$emit('change', this.res)
    },
    submitForm(formName) {
      if (this.currentRow) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const loading = this.$loading({
              lock: true,
              text: 'Loading',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })
            goBack(this.currentRow, { ...this.entity, comment: this.ruleForm.desc }).then(res => {
              this.handleClose()
              if (res.groupsList) {
                this.centerDialogVisible = true
                this.res = res
              } else {
                this.$emit('change', res)
              }
            }).catch(err => {
              console.error(err)
            }).finally(() => {
              loading.close()
            })
          } else {
            console.error('error submit!!')
            return false
          }
        })
      } else {
        this.$message({
          type: 'error',
          message: '请选择回退的节点'
        })
      }
    },
    handleCurrentChange(row) {
      this.currentRow = row
    },
    handleClose() {
      this.dialogGoBackVisible = false
      this.$emit('input', 0)
    }
  }
}
</script>

<style>

</style>
