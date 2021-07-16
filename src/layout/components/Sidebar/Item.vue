<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  render(h, context) {
    const { icon, title } = context.props
    const vnodes = []

    if (icon) {
      const iconClass = 'iconfont jeemes-' + icon
      vnodes.push(<svg-icon class='left-menu' icon-class={iconClass}/>)
    }

    if (title) {
      vnodes.push(<span class='left-menu-title' slot='title'>{(title)}</span>)
    }
    return vnodes
  }
}
</script>

<style scoped>
.left-menu {
  float: left
}
.left-menu-title{
  padding-left: 10px
}
</style>
