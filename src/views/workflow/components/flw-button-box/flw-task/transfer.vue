<template>
  <div class="flw-task-transfer">
    <el-dialog
      title="转办"
      :visible.sync="dialogTransferVisible"
      width="30%"
      :center="true"
      append-to-body
      :before-close="handleClose"
    >
      <div><strong>当前环节：</strong><span>{{ task && task.name }}</span></div>
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" class="demo-ruleForm">
        <h6>转办人员：</h6>
        <el-form-item prop="userName">
          <el-input v-model="ruleForm.userName" placeholder="选择人员" class="input-with-select" :readonly="true">
            <el-button slot="append" icon="el-icon-search" @click="selectUser" />
          </el-input>
        </el-form-item>
        <h6>转办原因：</h6>
        <el-form-item prop="desc">
          <el-input v-model="ruleForm.desc" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <user-select-single
      ref="userSelect"
      :extra-params="extraParams"
      :choosed-user="ruleForm.loginCode"
      @setChoosedUser="setChoosedUser"
    />
  </div>
</template>

<script>
import { transferTask } from '@/api/workflow/manage'
import UserSelectSingle from '@/views/system/components/user/UserSelectSingle'

export default {
  name: 'FlwTaskTransfer',
  components: { UserSelectSingle },
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
      currentNode: {
        name: ''
      },
      dialogTransferVisible: false,
      ruleForm: {
        loginCode: '',
        userName: '',
        desc: ''
      },
      rules: {
        desc: [
          { required: true, message: '请填写原因', trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '请选择转办人员', trigger: 'blur' }
        ]
      },
      currentRow: null,
      extraParams: {}
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val === 3) {
          this.dialogTransferVisible = true
        }
      }
    }
  },
  methods: {
    selectUser() {
      this.extraParams = {
        // 默认查询当前用户下的公司及子公司下的数据
        filterbyCurrentUser: true,
        // 默认查询普通用户和二级管理员
        userTypeLe: 1
      }
      this.$refs.userSelect.dialogVisible = true
    },
    setChoosedUser(user) {
      this.ruleForm.loginCode = user.loginCode
      this.ruleForm.userName = user.userName
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
          transferTask({ ...this.entity, comment: this.ruleForm.desc, loginCode: this.ruleForm.loginCode }).then(res => {
            this.handleClose()
            this.$emit('change', res)
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
    },
    handleClose() {
      this.dialogTransferVisible = false
      this.$emit('input', 0)
    }
  }
}
</script>

<style>

</style>
