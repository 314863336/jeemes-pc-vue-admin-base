<template>
  <div class="flw-task-execute">
    <el-button type="primary" icon="el-icon-check" @click="dialogExecuteVisible = true">批量审批</el-button>
    <el-dialog
      title="审批窗口"
      :visible.sync="dialogExecuteVisible"
      :center="true"
      append-to-body
      :before-close="handleClose"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" class="demo-ruleForm">
        <el-form-item label="意见" prop="desc">
          <el-input v-model="ruleForm.desc" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <flw-claim-batch
      :entity-list="valueLocal"
      :groups-lists="groupsLists"
      @change="onChangeProcess"
    />
  </div>
</template>

<script>
import { executeTask } from '@/api/workflow/manage'
import FlwClaimBatch from '../../flw-claim/batch'

export default {
  name: 'FlwBatchButtonExecute',
  components: { FlwClaimBatch },
  props: {
    value: {
      type: Array,
      default: () => null
    },
    type: {
      type: String,
      default: null
    },
    variables: {
      type: Object,
      default: () => {
        return {
          mr: '111'
        }
      }
    }
  },
  data() {
    return {
      dialogExecuteVisible: false,
      ruleForm: {
        desc: ''
      },
      rules: {
        desc: [
          { required: true, message: '请填写意见', trigger: 'blur' }
        ]
      },
      valueLocal: [],
      groupsLists: []
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val && val.length > 0) {
          this.valueLocal = [...this.value]
        }
      },
      immediate: true
    }
  },
  methods: {
    onChangeProcess() {
      this.$emit('change', this.res)
    },
    handleClose() {
      this.dialogExecuteVisible = false
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const loading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          try {
            this.valueLocal.forEach((item, index, array) => {
              executeTask(this.variables, { ...item, comment: this.ruleForm.desc }).then(res => {
                if (res.groupsList) {
                  this.groupsLists.push(res.groupsList)
                }
                if (index === array.length - 1) {
                  this.res = res
                }
              }).catch(err => {
                console.log(err)
              }).finally(() => {
                if (index === array.length - 1) {
                  this.handleClose()
                  if (!this.groupsLists.length) {
                    this.$emit('change', this.res)
                  }
                }
              })
            })
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
          } catch (e) {
            console.log(e)
            this.$message({
              type: 'error',
              message: e.message
            })
          } finally {
            loading.close()
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style>
.el-tag {
  cursor: pointer;
}
</style>
