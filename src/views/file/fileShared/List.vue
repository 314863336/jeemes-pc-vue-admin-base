<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane :label="activeNames[0].label" :name="activeNames[0].name">
        <ToMeList />
      </el-tab-pane>

      <el-tab-pane :label="activeNames[1].label" :name="activeNames[1].name">
        <FromMeList />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ToMeList from './ToMeList'
import FromMeList from './FromMeList'

export default {
  name: 'FileSharedList',
  components: { ToMeList, FromMeList },
  data() {
    return {
      activeName: '1',
      activeNames: [
        {
          name: '1',
          label: '分享给我'
        },
        {
          name: '2',
          label: '我分享的'
        }
      ]
    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.expand {
	display: block;
  text-align: right;
}
</style>
