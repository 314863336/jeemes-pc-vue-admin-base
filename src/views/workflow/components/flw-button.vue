<template>
  <div class="flw-button">
    <el-button
      size="mini"
      :type="buttonType"
      plain
      @click="adapter"
    >{{ initialBtnName() }}</el-button>
    <el-dialog
      title="工作流审批"
      :visible.sync="dialogCompleteVisible"
      width="60%"
      top="5vh"
      :center="true"
      append-to-body
      :before-close="handleClose"
    >
      <div class="flw-content">
        <el-row>
          <el-col :span="24">
            <div ref="diagram">
              <flw-diagram-frills v-if="dialogCompleteVisible" :entity="entityLocal" />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div ref="comments">
              <el-table
                :data="tableData"
                style="width: 100%"
              >
                <el-table-column
                  prop="name"
                  label="环节名称"
                  width="180"
                />
                <el-table-column
                  prop="startTime"
                  label="创建时间"
                  width="180"
                />
                <el-table-column
                  prop="endTime"
                  label="完成时间"
                  width="180"
                />
                <el-table-column
                  prop="consume"
                  label="任务历时"
                  width="180"
                />
                <el-table-column
                  prop="assignee"
                  label="分配人员"
                  width="180"
                />
                <el-table-column
                  prop="message"
                  label="审批意见"
                >
                  <template slot-scope="scope">
                    <strong :class="scope.row.message.split('@')[0] === '提 交' ? 'submit' : 'go-back'">【{{ scope.row.message.split('@')[0] }}】</strong><span>{{ scope.row.message.split('@')[1] }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <flw-button-box
          v-if="dialogCompleteVisible"
          :entity="entityLocal"
          :variables="variables"
          @change="onChangeProcess"
        />
      </span>
    </el-dialog>
    <el-dialog
      title="确定要发起流程吗？"
      :visible.sync="dialogStartVisible"
      width="20%"
      append-to-body
    >
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogStartVisible = false">取 消</el-button>
        <el-button type="primary" @click="start">确 定</el-button>
      </span>
    </el-dialog>
    <flw-claim
      :entity="entityLocal"
      :groups-list="groupsList"
      @change="onChangeProcess"
    />
  </div>
</template>

<script>
import { startProcess, getComments } from '@/api/workflow/manage'
import FlwDiagramFrills from './flw-diagram/frills'
import FlwButtonBox from './flw-button-box'
import FlwClaim from './flw-claim'
import { mapState } from 'vuex'

export default {
  name: 'FlwButton',
  components: { FlwDiagramFrills, FlwButtonBox, FlwClaim },
  props: {
    entity: {
      type: Object,
      default: () => {
        return {
          processInstanceId: null
        }
      }
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
      entityLocal: null,
      dialogCompleteVisible: false,
      dialogStartVisible: false,
      tableData: [],
      groupsList: [],
      buttonType: ''
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  watch: {
    entity: {
      handler(val) {
        if (val) {
          this.entityLocal = { ...val }
        }
      }
    },
    dialogCompleteVisible: {
      handler(val) {
        if (val) {
          this.initialComments()
        }
      }
    }
  },
  mounted() {
    this.entityLocal = { ...this.entity }
  },
  methods: {
    initialBtnName() {
      if (this.entity.processInstanceId) {
        if (this.entity.owners) {
          const ownersArr = this.entity.owners.split(',')
          if (ownersArr.includes(this.user.loginCode)) {
            this.buttonType = 'warning'
            return '待办'
          } else {
            this.buttonType = ''
            return '查看'
          }
        } else {
          this.buttonType = ''
          return '查看'
        }
      } else {
        this.buttonType = 'danger'
        return '提交'
      }
    },
    initialComments() {
      getComments(this.entityLocal).then(res => {
        res.code || (this.tableData = res.data)
      }).catch(err => {
        console.error(err)
      })
    },
    reload() {
      this.dialogCompleteVisible = false
      this.$nextTick(() => {
        this.dialogCompleteVisible = true
      })
    },
    start() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      startProcess(this.variables, { ...this.entityLocal }, this.type).then(res => {
        this.dialogStartVisible = false
        if (res.groupsList) {
          this.groupsList = res.groupsList
          this.entityLocal = { ...res.entity }
        } else {
          this.$emit('change', res)
        }
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        loading.close()
      })
    },
    adapter() {
      if (this.entityLocal.processInstanceId) {
        this.dialogCompleteVisible = true
      } else {
        this.dialogStartVisible = true
      }
    },
    handleClose() {
      this.dialogCompleteVisible = false
    },
    onChangeProcess(res) {
      this.reload()
      this.$emit('change', res)
    }
  }
}
</script>

<style lang="less">
.flw-button {
    display: inline-block;
    margin-left: 10px;
    .el-row {
        margin-bottom: 20px;
        &:first-child {
            height: 40vh;
            background-color: red;
        }
        &:last-child {
            margin-bottom: 0;
        }
    }
}
.el-row {
  strong {
    &.submit {
      color: green;
    }
    &.go-back {
      color: red;
    }
  }
}
</style>
