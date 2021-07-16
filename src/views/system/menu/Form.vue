<template>
  <div class="app-container">
    <el-dialog
      :visible.sync="formDialogVisible"
      :close-on-click-modal="false"
      top="20px"
      :show-close="false"
      :title="title"
    >
      <el-form ref="form" :rules="rules" :model="formData" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="上级菜单" prop="parentMenu.menuName">
              <el-input v-model="formData.parentMenu.menuName" :disabled="true">
                <el-button slot="append" icon="el-icon-search" @click="selectParentMenu" />
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="formData.menuName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单编号" prop="menuCode">
              <el-input v-model="formData.menuCode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单链接" prop="menuHref">
              <el-input v-model="formData.menuHref" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单目标" prop="menuTarget">
              <el-select v-model="formData.menuTarget" placeholder="请选择">
                <el-option
                  v-for="(item, index) in getDict('sys_menu_target')"
                  :key="'mt'+index"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单类型" prop="menuType">
              <el-select v-model="formData.menuType" placeholder="请选择">
                <el-option
                  v-for="(item, index) in getDict('sys_menu_type')"
                  :key="'mte'+index"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="布局类型" prop="layoutType">
              <el-select v-model="formData.layoutType" placeholder="请选择">
                <el-option
                  v-for="(item, index) in getDict('sys_layout_type')"
                  :key="'mtd'+index"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限标识" prop="permission">
              <el-input v-model="formData.permission" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单图标" prop="menuIcon">
              <el-button size="text" @click="selectIcon">
                选择图标
              </el-button>
              <!-- <svg-icon v-show="formData.menuIcon" class="el-icon--left" :icon-class="'iconfont jeemes-' + formData.menuIcon" /> -->
              <svg v-show="formData.menuIcon" class="icon el-icon--left" aria-hidden="true">
                <use :xlink:href="'#jeemes-' + formData.menuIcon" />
              </svg>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否可见" prop="isShow">
              <el-select v-model="formData.isShow" placeholder="请选择">
                <el-option
                  v-for="(item, index) in getDict('sys_yes_no')"
                  :key="'yn'+index"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单权重" prop="weight">
              <el-tooltip class="item" effect="dark" content="菜单权重不可以小于父菜单权重" placement="right">
                <el-select v-model="formData.weight" placeholder="请选择">
                  <el-option
                    v-for="(item, index) in getDict('sys_menu_weight')"
                    :key="'wi'+index"
                    :label="item.dictLabel"
                    :value="parseInt(item.dictValue)"
                  />
                </el-select>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">其他信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="22">
            <el-form-item label="备注" prop="remarks">
              <el-input
                v-model="formData.remarks"
                type="textarea"
                :rows="3"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveForm">保存</el-button>
        <el-button v-show="isAdd" @click="resetForm">重置</el-button>
        <el-button @click="cancelForm">取消</el-button>
      </div>
    </el-dialog>
    <menu-select ref="menuSelect" :dialog-data="{id:formData.id,title:'选择上级菜单'}" @setParent="setParent" />
    <icon-select ref="iconSelect" :dialog-data="{menuIcon: formData.menuIcon}" @setIcon="setIcon" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MenuSelect from '@/views/system/menu/MenuSelect.vue'
import IconSelect from '@/views/system/menu/IconSelect.vue'
import { getMenuDetail, saveMenu } from '@/api/system/menu'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'MenuForm',
  components: { MenuSelect, IconSelect },
  data() {
    return {
      rules: {
        menuName: [
          { required: true, message: '请输入菜单名称', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        menuCode: [
          { required: true, message: '请输入菜单编号', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        menuType: [
          { required: true, message: '请输入菜单类型', trigger: 'blur' }
        ],
        remarks: [
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ]
      },
      formDialogVisible: false,
      title: '',
      formData: {
        id: '',
        parentMenu: {
          id: '',
          menuName: ''
        },
        parentId: '',
        parentIds: '',
        treeLevel: 0,
        treeSort: 0,
        treeLeaf: '',
        menuName: '',
        menuCode: '',
        menuTarget: '1',
        menuHref: '',
        menuType: '1',
        layoutType: '1',
        menuIcon: 'icon_work_fill',
        permission: '',
        weight: 0,
        isShow: '0',
        status: '0',
        remarks: ''
      }
    }
  },
  computed: {
    ...mapGetters('dictionary', ['getDict']),
    isAdd() {
      return !this.formData.id
    }
  },
  watch: {
  },
  methods: {
    selectParentMenu() {
      this.$refs.menuSelect.dialogVisible = true
    },
    setParent(node) {
      this.formData.parentId = node.id
      this.formData.parentMenu.id = node.id
      this.formData.parentMenu.menuName = node.menuName
    },
    addForm() {
      this.resetForm()
      this.title = '新增菜单'
      this.formDialogVisible = true
    },
    editForm(row) {
      this.getDetailData(row.id)
    },
    getDetailData(id) {
      const fullscreenLoading = loading()
      getMenuDetail({ id: id }).then(res => {
        if (!res.data.parentMenu) {
          res.data.parentMenu = {
            id: '',
            menuName: ''
          }
        }
        this.formData = res.data
        this.title = '编辑菜单'
        this.formDialogVisible = true
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    },
    saveForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const fullscreenLoading = loading()
          saveMenu(this.formData).then(res => {
            this.$message({
              type: 'success',
              message: '菜单保存成功!'
            })
            this.formDialogVisible = false
            this.$emit('findTableData')
          }).finally(() => {
            closeLoading(fullscreenLoading)
          })
        }
      })
    },
    resetForm(parentMenu) {
      this.formData = {
        id: '',
        parentMenu: {
          id: parentMenu ? parentMenu.id : '',
          menuName: parentMenu ? parentMenu.menuName : ''
        },
        parentId: parentMenu ? parentMenu.id : '',
        parentIds: '',
        treeLevel: 0,
        treeSort: 0,
        treeLeaf: '',
        menuName: '',
        menuCode: '',
        menuTarget: '1',
        menuHref: '',
        menuType: '1',
        menuIcon: 'icon_work_fill',
        permission: '',
        weight: parentMenu ? parentMenu.weight : 0,
        isShow: '0',
        status: '0',
        remarks: ''
      }
    },
    cancelForm() {
      this.formDialogVisible = false
    },
    addSubForm(row) {
      this.resetForm(row)
      this.title = '新增下级菜单'
      this.formDialogVisible = true
    },
    selectIcon() {
      this.$refs.iconSelect.dialogVisible = true
    },
    setIcon(icon) {
      this.formData.menuIcon = icon
    }
  }
}
</script>
<style scoped>
.icon {
  width: 2em;
  height: 2em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>

