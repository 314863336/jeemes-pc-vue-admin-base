<template>
  <div class="diagram-svg">
    <div ref="canvas" class="canvas" />
  </div>
</template>

<script>
import { getDiagramSvgNoFrills } from '@/api/workflow/designer'
import BpmnModeler from 'bpmn-js/lib/Modeler'

export default {
  name: 'FlwDiagramNoFrills',
  components: {},
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      modeler: null
    }
  },
  mounted() {
    this.initialSvg()
  },
  methods: {
    initialSvg() {
      getDiagramSvgNoFrills(this.id).then(res => {
        res.code || this.renderSvg(res.msg)
      }).catch(e => {
        this.$message({
          type: 'error',
          message: `查询流程图数据失败: ${e}`
        })
      })
    },
    success() {
      const canvas = this.modeler.get('canvas')
      canvas.zoom('fit-viewport')
    },
    async renderSvg(bpmnXmlStr) {
      const canvas = this.$refs.canvas
      this.modeler = new BpmnModeler({
        container: canvas,
        additionalModules: [
          {
            paletteProvider: ['value', ''], // 禁用左面板
            labelEditingProvider: ['value', ''], // 禁用编辑
            contextPadProvider: ['value', ''] // 禁用点击出现的contextPad
          }
        ]
      })
      try {
        await this.modeler.importXML(bpmnXmlStr)
        this.success()
      } catch (err) {
        console.log(err.message, err.warnings)
      }
    }
  }
}
</script>

<style lang="scss">
@import "~bpmn-js/dist/assets/diagram-js.css";
.diagram-svg {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  line-height: 80%;
  .canvas {
		height: 600px;
	}
	.djs-palette, .bjs-powered-by {
		display: none;
	}
}
</style>
