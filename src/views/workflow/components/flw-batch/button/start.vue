<template>
  <div class="flw-batch-button-start">
    <el-button type="primary" icon="el-icon-check" @click="dialogStartVisible = true">批量提交</el-button>
    <el-dialog
      title="确定要批量发起流程吗？"
      :visible.sync="dialogStartVisible"
      width="20%"
      append-to-body
    >
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogStartVisible = false">取 消</el-button>
        <el-button type="primary" @click="start">确 定</el-button>
      </span>
    </el-dialog>
    <flw-claim-batch
      :entity-list="valueLocal"
      :groups-lists="groupsLists"
      @change="onChangeProcess"
    />
  </div>
</template>

<script>
import { startProcess } from '@/api/workflow/manage'
import FlwClaimBatch from '../../flw-claim/batch'

export default {
  name: 'FlwBatchButtonStart',
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
      dialogStartVisible: false,
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
      this.$emit('change')
    },
    start() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        this.valueLocal.forEach((item, index, array) => {
          startProcess(this.variables, { ...item }, this.type).then(res => {
            if (res.groupsList) {
              this.groupsLists.push(res.groupsList)
              array[index] = { ...res.entity }
            }
            if (index === array.length - 1) {
              this.res = res
            }
          }).catch(err => {
            console.error(err)
          }).finally(() => {
            if (index === array.length - 1) {
              this.dialogStartVisible = false
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
        console.error(e)
        this.$message({
          type: 'error',
          message: e.message
        })
      } finally {
        loading.close()
      }
    }
  }
}
</script>

<style>
.flw-batch-button-start {
  display: inline-block;
}
</style>
