<template>
  <div>
    <el-card>
      <quill-editor ref="myQuillEditor" v-model="formData[field]" class="custom-quill-editor" :style="customStyle" :options="editorOption">
        <!-- 自定义toolar -->
        <div id="toolbar" slot="toolbar">
          <!-- Add a bold button -->
          <button class="ql-bold" title="加粗">Bold</button>
          <button class="ql-italic" title="斜体">Italic</button>
          <button class="ql-underline" title="下划线">underline</button>
          <button class="ql-strike" title="删除线">strike</button>
          <!--Add list -->
          <button class="ql-list" value="ordered" title="有序列表" />
          <button class="ql-list" value="bullet" title="无序列表" />
          <!-- Add font size dropdown -->
          <select class="ql-header" title="段落格式">
            <option selected>段落</option>
            <option value="1">标题1</option>
            <option value="2">标题2</option>
            <option value="3">标题3</option>
            <option value="4">标题4</option>
            <option value="5">标题5</option>
            <option value="6">标题6</option>
          </select>
          <select class="ql-size" title="字体大小">
            <option value="10px">10px</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px" selected>16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="22px">22px</option>
            <option value="24px">24px</option>
            <option value="26px">26px</option>
            <option value="32px">32px</option>
            <option value="48px">48px</option>
          </select>
          <select class="ql-font" title="字体">
            <option value="SimSun">宋体</option>
            <option value="SimHei">黑体</option>
            <option value="Microsoft-YaHei">微软雅黑</option>
            <option value="KaiTi">楷体</option>
            <option value="FangSong">仿宋</option>
            <option value="Arial">Arial</option>
          </select>
          <!-- Add subscript and superscript buttons -->
          <select class="ql-color" value="color" title="字体颜色" />
          <select class="ql-background" value="background" title="背景颜色" />
          <select class="ql-align" value="align" title="对齐" />
          <button class="ql-image" title="上传图片" />

          <!-- You can also add your own -->
        </div>
      </quill-editor>
    </el-card>
  </div>
</template>

<script>
import {
  Quill,
  quillEditor
} from 'vue-quill-editor'

// 自定义字体大小
const Size = Quill.import('attributors/style/size')
Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '32px', '48px']
Quill.register(Size, true)

// 自定义字体类型
var fonts = ['SimSun', 'SimHei', 'Microsoft-YaHei', 'KaiTi', 'FangSong', 'Arial', 'Times-New-Roman', 'sans-serif',
  '宋体', '黑体'
]
var Font = Quill.import('formats/font')
Font.whitelist = fonts
Quill.register(Font, true)

export default {
  name: 'FuncFormsEdit',
  components: {
    quillEditor
  },
  props: {
    formData: {
      type: Object,
      default: () => {
        return {
        }
      }
    },
    field: {
      type: String,
      default: ''
    },
    customStyle: {
      type: Object,
      default: () => {
        return {
          height: '500px'
        }
      }
    }
  },
  data() {
    return {
      editorOption: {
        placeholder: '请输入',
        theme: 'snow', // or 'bubble'
        modules: {
          toolbar: {
            container: '#toolbar'
          }
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.custom-quill-editor{
	padding-bottom: 45px;
}
</style>
