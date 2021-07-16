<template>
  <div class="app-container">
    <el-dialog
      :title="formAddTitle"
      :visible.sync="showDialogAdd"
      :append-to-body="true"
      center
      top="20px"
      width="60%"
      :close-on-click-modal="false"
    >
      <el-form ref="formAdd" :rules="rules" :model="formAdd" label-width="150px">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="基本信息" name="first">
            <el-row :gutter="20">
              <el-col :span="11">
                <el-form-item label="表名" prop="tableName">
                  <el-input v-model="formAdd.tableName" :max="50" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="表说明" prop="comments">
                  <el-input v-model="formAdd.comments" :max="50" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="功能作者" prop="functionAuthor">
                  <el-input v-model="formAdd.functionAuthor" :max="50" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="关联父表的表名" prop="parentTableName">
                  <el-select
                    v-model="formAdd.parentTableName"
                    filterable
                    placeholder="请选择"
                    style="width:100%"
                    clearable
                    @change="parentTableChange"
                  >
                    <el-option
                      v-for="(item, index) in parentTables"
                      :key="'ss'+index"
                      :label="item.tableName + ' : ' + item.comments"
                      :value="item.tableName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="11">
                <el-form-item label="本表关联的字段名" prop="tableFkName">
                  <el-select v-model="formAdd.tableFkName" filterable placeholder="请选择" style="width:100%" clearable>
                    <el-option
                      v-for="(item, index) in formAdd.htGenTableColumns"
                      :key="'ss'+index"
                      :label="item.columnName + ' : ' + item.comments"
                      :value="item.columnName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="父表关联的字段名" prop="parentTableFkName">
                  <el-select v-model="formAdd.parentTableFkName" filterable placeholder="请选择" style="width:100%" clearable>
                    <el-option
                      v-for="(item, index) in parentColumns"
                      :key="'ss'+index"
                      :label="item.columnName + ' : ' + item.comments"
                      :value="item.columnName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="备注信息" prop="remarks">
              <el-input v-model="formAdd.remarks" type="textarea" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="字段信息" name="second">
            <el-table
              ref="singleTable"
              :data="formAdd.htGenTableColumns"
              highlight-current-row
              style="width: 100%"
            >
              <el-table-column
                type="index"
                width="50"
              />
              <el-table-column
                property="columnName"
                label="列名"
                width="120"
              />
              <el-table-column
                property="comments"
                label="列说明"
                width="120"
              />
              <el-table-column
                property="columnType"
                label="字段类型"
              />
              <el-table-column
                property="attrType"
                label="属性类型"
              />
              <el-table-column
                property="attrName"
                label="属性名称"
              />
              <el-table-column
                property="isEdit"
                label="编辑"
              >
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.isEdit" true-label="0" false-label="1" />
                </template>
              </el-table-column>
              <el-table-column
                property="isNull"
                label="必填"
              >
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.isNull" true-label="0" false-label="1" />
                </template>
              </el-table-column>
              <el-table-column
                property="showType"
                label="控件类型"
              >
                <template slot-scope="scope">
                  <el-select v-model="scope.row.showType" filterable placeholder="请选择" style="width:100%" clearable>
                    <el-option
                      v-for="(item, index) in getDict('sys_gen_show_type')"
                      :key="'ss'+index"
                      :label="item.dictLabel"
                      :value="item.dictValue"
                    />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="生成信息" name="third">
            <div v-if="formAdd.parentTableName && formAdd.parentTableFkName">
              <h4><i class="el-icon-warning-outline" /> 提示！</h4>
              子表不需要配置生成信息，父表生成时会自动为您生成子表代码。
              <br>
              因为您设置了“关联父表的表名”和“本表关联的外键名”，则表示本生成为“子表”配置。
            </div>
            <el-row v-if="!formAdd.parentTableName || !formAdd.parentTableFkName" :gutter="20">
              <el-col :span="11">
                <el-form-item label="生成模板" prop="tplCategory">
                  <el-select v-model="formAdd.tplCategory" placeholder="请选择" style="width:100%" clearable>
                    <el-option
                      v-for="(item, index) in getDict('sys_gen_template_type')"
                      :key="'ss'+index"
                      :label="item.dictLabel"
                      :value="item.dictValue"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="生成包路径" prop="packageName">
                  <el-input v-model="formAdd.packageName" :max="50" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="生成模块名" prop="moduleName">
                  <el-input v-model="formAdd.moduleName" :max="50" />
                </el-form-item>
              </el-col>
              <el-col :span="11">
                <el-form-item label="生成基础路径" prop="codeBaseDir">
                  <el-input v-model="formAdd.codeBaseDir" :max="50" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" :loading="formAddLoading" @click="formAddSubmit">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getTables, getColumns, saveGen, updateGen, getParentTables } from '@/api/tools/gen'

export default {
  name: 'GenForm',
  props: {
    tableName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      formAdd: {
        id: '',
        tableName: '',
        comments: '',
        functionAuthor: '',
        parentTableName: '',
        tableFkName: '',
        parentTableFkName: '',
        remarks: '',
        tplCategory: '',
        packageName: '',
        moduleName: '',
        codeBaseDir: '',
        htGenTableColumns: []
      },
      parentTables: [],
      parentColumns: [],
      activeName: 'second',
      showDialogAdd: false,
      formAddLoading: false,
      rules: {
        tableName: [{ required: true, message: '不能为空', trigger: 'blur' }],
        comments: [{ required: true, message: '不能为空', trigger: 'blur' }],
        functionAuthor: [{ required: true, message: '不能为空', trigger: 'blur' }],
        tplCategory: [{ required: true, message: '不能为空', trigger: 'blur' }],
        packageName: [{ required: true, message: '不能为空', trigger: 'blur' }],
        moduleName: [{ required: true, message: '不能为空', trigger: 'blur' }],
        codeBaseDir: [{ required: true, message: '不能为空', trigger: 'blur' }],
        remarks: [{ min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict']),
    formAddTitle() {
      if (this.formAdd.id) {
        return '编辑配置'
      } else {
        return '新增配置'
      }
    }
  },
  watch: {
    showDialogAdd: {
      handler(val) {
        if (val) {
          this.initData()
        } else {
          this.reset()
        }
      }
      // immediate: true
    }
  },
  methods: {
    handleClick(tab, event) {
      console.log(this.formAdd.htGenTableColumns)
      console.log(tab, event)
    },
    reset() {
      this.formAdd.id = ''
      this.formAdd.tableName = ''
      this.formAdd.comments = ''
      this.formAdd.functionAuthor = ''
      this.formAdd.parentTableName = ''
      this.formAdd.parentTableFkName = ''
      this.formAdd.tableFkName = ''
      this.formAdd.remarks = ''
      this.formAdd.tplCategory = ''
      this.formAdd.packageName = ''
      this.formAdd.moduleName = ''
      this.formAdd.codeBaseDir = ''
    },
    parentTableChange(selectData) {
      if (selectData) {
        getColumns({ tableName: selectData }).then(res => {
          debugger
          this.parentColumns = res.data
        })
      } else {
        this.formAdd.parentTableFkName = ''
      }
    },
    initData() {
      if (this.formAdd.id) {
        console.log('编辑')
      } else {
        getTables({ tableName: this.tableName }).then(res => {
          this.formAdd.tableName = this.tableName
          this.formAdd.comments = res.data[0].comments
        })
        getColumns({ tableName: this.tableName }).then(res => {
          this.formAdd.htGenTableColumns = res.data
        })
      }
      getParentTables({ excludeName: this.tableName }).then(res => {
        this.parentTables = res.data
        if (this.formAdd.parentTableName) {
          this.parentTableChange(this.formAdd.parentTableName)
        }
      })
    },
    formAddSubmit() {
      // showDialogAdd = false
      this.$refs['formAdd'].validate(valid => {
        if (valid) {
          this.formAddLoading = true
          if (this.formAdd.id) {
            updateGen(this.formAdd)
              .then(res => {
                this.showDialogAdd = false
                this.$message('操作成功！')
                this.$emit('refreshTable')
              })
              .finally(() => {
                this.formAddLoading = false
              })
          } else {
            saveGen(this.formAdd)
              .then(res => {
                this.showDialogAdd = false
                this.$message('操作成功！')
                this.$emit('refreshTable')
              })
              .finally(() => {
                this.formAddLoading = false
              })
          }
        }
      })
    },
    handleDialogClose() {
      //   this.formAdd.id = ''
      //   this.formAdd.dictName = ''
      //   this.formAdd.dictCode = ''
      //   this.formAdd.isSys = ''
      //   this.formAdd.remarks = ''
      this.showDialogAdd = false
    }
  }

}
</script>

<style scoped>
</style>
