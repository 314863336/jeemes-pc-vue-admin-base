<template>
  <div class="app-container">
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
      :show-close="false"
      top="20px"
      :title="dialogData.title"
    >
      <el-row>
        <el-col>
          <ul class="icon-list">
            <li
              v-for="item of icons"
              :key="item.font_class"
              class="icon-item"
              :class="{selected:dialogData.menuIcon === item.font_class}"
              @click="selectIcon(item.font_class)"
            >
              <!-- <svg-icon class="icon-item-icon" :icon-class="'iconfont jeemes-' + item.font_class" /> -->
              <svg class="icon" aria-hidden="true">
                <use :xlink:href="'#jeemes-' + item.font_class" />
              </svg>
            </li>
          </ul>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSelect">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import icons from '@/assets/iconfont/iconfont.json'

export default {
  name: 'IconSelect',
  props: {
    dialogData: {
      type: Object,
      default: () => {
        return {
          menuIcon: 'icon_sketch_fill'
        }
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      icons: []
    }
  },
  watch: {
  },
  mounted() {
    this.icons = icons.glyphs
  },
  methods: {
    selectIcon(icon) {
      this.$emit('setIcon', icon)
      this.dialogVisible = false
    },
    cancelSelect() {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.icon {
  width: 3em;
  height: 3em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
ul.icon-list {
    overflow: hidden;
    list-style: none;
    padding: 0!important;
    border: 1px solid #eaeefb;
    border-radius: 4px;
}
.icon-item {
  float: left;
	width: 16.66%;
	text-align: center;
	height: 120px;
	line-height: 120px;
	color: #666;
	font-size: 13px;
	border-right: 1px solid #eee;
	border-bottom: 1px solid #eee;
	margin-right: -1px;
	margin-bottom: -1px;
	display: list-item;
	cursor: pointer;
  &.selected {
    color: #096dd9;
    border: 1px solid #096dd9;
  }
  .icon-item-icon{
    font-size: 30px;
  }
}
</style>
