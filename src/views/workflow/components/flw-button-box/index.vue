<template>
  <div class="flw-button-box">
    <el-button v-for="(item, index) in buttons" :key="index" :type="item.type" @click="handleClick(item)">{{ item.label }}</el-button>
    <div>
      <flw-task-execute
        v-model="active"
        :entity="entity"
        :variables="variables"
        @change="onChangeProcess"
      />
      <flw-task-go-back
        v-model="active"
        :entity="entity"
        :variables="variables"
        :task="task"
        @change="onChangeProcess"
      />
      <flw-task-transfer
        v-model="active"
        :entity="entity"
        :variables="variables"
        :task="task"
        @change="onChangeProcess"
      />
      <flw-task-termination
        v-model="active"
        :entity="entity"
        :variables="variables"
        :task="task"
        @change="onChangeProcess"
      />
    </div>
  </div>
</template>

<script>
import { getButtons, getCurrentTask } from '@/api/workflow/manage'
import FlwTaskExecute from './flw-task/execute'
import FlwTaskGoBack from './flw-task/go-back'
import FlwTaskTransfer from './flw-task/transfer'
import FlwTaskTermination from './flw-task/termination'

export default {
  name: 'FlwButtonBox',
  components: { FlwTaskExecute, FlwTaskGoBack, FlwTaskTransfer, FlwTaskTermination },
  props: {
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
      buttons: [],
      task: null,
      active: 0
    }
  },
  mounted() {
    this.initialData()
  },
  methods: {
    handleClose() {
      this.active = 0
    },
    handleClick(button) {
      switch (button.label) {
        case '提 交':
          this.active = 1
          break
        case '退 回':
          this.active = 2
          break
        case '转 办':
          this.active = 3
          break
        case '终 止':
          this.active = 4
          break
        default:
          this.active = 0
      }
    },
    initialData() {
      getCurrentTask(this.entity).then(res => {
        res.code || (this.task = res.data)
      }).catch(err => {
        console.error(err)
      })
      getButtons(this.entity).then(res => {
        res.code || (this.buttons = res.data)
      }).catch(err => {
        console.error(err)
      })
    },
    onChangeProcess(res) {
      this.handleClose()
      this.$emit('change', res)
    }
  }
}
</script>

<style>

</style>
