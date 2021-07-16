<template>
  <div class="flw-task-execute">
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
    <flw-claim
      :entity="entity"
      :groups-list="groupsList"
      @change="onChangeProcess"
    />
  </div>
</template>

<script>
import { executeTask } from '@/api/workflow/manage'
import FlwClaim from '../../flw-claim'

export default {
  name: 'FlwTaskExecute',
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
      groupsList: []
    }
  },
  watch: {
    value: {
      handler(val) {
        val === 1 && (this.dialogExecuteVisible = true)
      }
    }
  },
  methods: {
    onChangeProcess() {
      this.$emit('change', this.res)
    },
    handleClose() {
      this.dialogExecuteVisible = false
      this.$emit('input', 0)
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
          executeTask(this.variables, { ...this.entity, comment: this.ruleForm.desc }).then(res => {
            this.handleClose()
            if (res.groupsList) {
              this.groupsList = res.groupsList
              this.res = res
            } else {
              this.$emit('change', res)
            }
          }).catch(err => {
            console.log(err)
          }).finally(() => {
            loading.close()
          })
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
