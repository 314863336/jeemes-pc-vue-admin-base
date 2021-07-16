// 表格页面表格高度随div改变而改变方法 list页面使用
// 为了table和查询栏的高度撑满页面，不出现页面滚动条
const listPage = {
  data() {
    return {
      // padding的高度 list-page.less中的css
      fixHeight: 10
    }
  },
  mounted() {
    this.resize()
    window.onresize = () => {
      this.resize()
    }
  },
  methods: {
    resize() {
      // 页面中添加的resize方法将会重写这里的resize方法
      this.$nextTick(() => {
        const height = document.body.clientHeight
        const tableHeaderHeight = this.$refs.tableHeader ? this.$refs.tableHeader.offsetHeight : 0
        const tableFooterHeight = this.$refs.tableFooter ? this.$refs.tableFooter.offsetHeight : 0
        // 85为外框页面header的高度
        const tableBodyHeight = height - tableHeaderHeight - tableFooterHeight - 85 - this.fixHeight
        if (this.$refs.tableBody) this.$refs.tableBody.style.height = tableBodyHeight + 'px'
      })
    }
  }
}

export default listPage
