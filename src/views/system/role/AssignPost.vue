<template>
  <div>
    <el-form ref="form" :model="formData" label-width="120px">
      <el-divider content-position="left">基本信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="角色名称">
            <el-input v-model="formData.roleName" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色编号">
            <el-input v-model="formData.roleCode" :disabled="true" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-divider content-position="left">分配岗位</el-divider>
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="tree-filter-div">
          <el-form>
            <el-form-item>
              <el-input v-model="filterText" placeholder="输入关键字进行过滤" style="width:100%;" />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="small"
                plain
                @click="selectAll()"
              >全选</el-button>
              <el-button
                type="primary"
                size="small"
                plain
                @click="unSelectAll()"
              >反选</el-button>
            </el-form-item>
          </el-form>
        </div>
        <el-tree
          ref="treePost"
          node-key="id"
          class="filter-tree"
          show-checkbox
          :data="treeData"
          :props="defaultProps"
          :default-expand-all="true"
          :filter-node-method="treefilter"
          :highlight-current="true"
          :expand-on-click-node="false"
          :check-on-click-node="true"
          :check-strictly="true"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { findPostTreeData } from '@/api/system/post'
import { saveAssignPost } from '@/api/system/role'
import { loading, closeLoading } from '@/utils/loading'

export default {
  name: 'AssignPost',
  props: {
    formData: {
      type: Object,
      default: () => {}
    },
    relatedData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      treeData: [],
      allIds: [],
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'postName'
      }
    }
  },
  computed: {
  },
  watch: {
    formData: {
      handler(val) {
        this.getMenuTreeData()
      },
      immediate: true,
      deep: true
    },
    filterText: {
      handler(val) {
        this.$refs.treePost.filter(val)
      }
    }
  },
  methods: {
    treefilter(value, data) {
      if (!value) {
        return true
      }
      return data.postName.indexOf(value) !== -1
    },
    getMenuTreeData() {
      findPostTreeData({ postType: this.formData.roleType }).then(res => {
        this.allIds = res.allIds
        this.treeData = res.data
        this.$nextTick(() => {
          this.$refs.treePost.setCheckedKeys(this.relatedData.postIds ? this.relatedData.postIds : [])
        })
      })
    },
    selectAll() {
      this.$refs.treePost.setCheckedKeys(this.allIds)
    },
    unSelectAll() {
      this.$refs.treePost.setCheckedKeys([])
    },
    saveAssignPost() {
      const postIds = this.$refs.treePost.getCheckedKeys()
      const fullscreenLoading = loading()
      saveAssignPost({ ids: postIds.join(','), id: this.formData.id }).then(res => {
        this.$message({
          type: 'success',
          message: '岗位分配成功!'
        })
        this.relatedData.postIds = postIds
      }).finally(() => {
        closeLoading(fullscreenLoading)
      })
    }
  }
}
</script>

