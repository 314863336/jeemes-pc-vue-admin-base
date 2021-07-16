<template>
  <div class="flw-task-termination">
    <el-dialog
      title="终止窗口"
      :visible.sync="dialogTerminationVisible"
      :center="true"
      append-to-body
      :before-close="handleClose"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" class="demo-ruleForm">
        <el-form-item label="终止原因" prop="desc">
          <el-input v-model="ruleForm.desc" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { terminationProcess } from '@/api/workflow/manage'

export default {
  name: 'FlwTaskTermination',
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
      dialogTerminationVisible: false,
      ruleForm: {
        desc: ''
      },
      rules: {
        desc: [
          { required: true, message: '请填终止原因', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    value: {
      handler(val) {
        val === 4 && (this.dialogTerminationVisible = true)
      }
    }
  },
  methods: {
    handleClose() {
      this.dialogTerminationVisible = false
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
          terminationProcess({ ...this.entity, comment: this.ruleForm.desc }).then(res => {
            this.handleClose()
            this.$emit('change', res)
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

</style>
