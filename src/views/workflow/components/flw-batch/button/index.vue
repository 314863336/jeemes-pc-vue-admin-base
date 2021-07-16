<template>
  <div class="flw-batch-button">
    <flw-batch-button-start
      v-show="flwBatchButtonStartVisible"
      v-model="value"
      :type="type"
      :variables="variables"
      @change="onChangeProcess"
    />
    <flw-batch-button-execute
      v-show="flwBatchButtonExecuteVisible"
      v-model="value"
      :type="type"
      :variables="variables"
      @change="onChangeProcess"
    />
  </div>
</template>

<script>
import FlwBatchButtonStart from './start'
import FlwBatchButtonExecute from './execute'
import { mapState } from 'vuex'
import { findIsSameNode } from '@/api/workflow/manage'

export default {
  name: 'FlwBatchButton',
  components: { FlwBatchButtonStart, FlwBatchButtonExecute },
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
      flwBatchButtonStartVisible: false,
      flwBatchButtonExecuteVisible: false
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  watch: {
    value: {
      handler(val) {
        if (val && val.length > 0) {
          let result = val.find(item => item.processInstanceId !== null)
          if (result) {
            this.flwBatchButtonStartVisible = false
          } else {
            this.flwBatchButtonStartVisible = true
          }
          result = val.find(item => item.processInstanceId === null)
          if (result) {
            this.flwBatchButtonExecuteVisible = false
          } else {
            result = val.find(item => this.findTodo(item) === false)
            if (result) {
              this.flwBatchButtonExecuteVisible = false
            } else {
              findIsSameNode(val).then(res => {
                const { code, data } = res
                code || (this.flwBatchButtonExecuteVisible = data)
              }).catch(err => {
                console.error(err)
              })
            }
          }
        } else {
          this.flwBatchButtonStartVisible = false
          this.flwBatchButtonExecuteVisible = false
        }
      },
      immediate: true
    }
  },
  methods: {
    findTodo(entity) {
      const ownersArr = entity.owners.split(',')
      if (ownersArr.includes(this.user.loginCode)) {
        return true
      } else {
        return false
      }
    },
    onChangeProcess(res) {
      this.$emit('change', res)
    }
  }
}
</script>

<style>
.flw-batch-button {
  display: inline-block;
}
</style>
