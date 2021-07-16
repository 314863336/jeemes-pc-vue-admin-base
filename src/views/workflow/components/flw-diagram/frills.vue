<template>
  <div class="diagram-svg">
    <div ref="canvas" class="canvas" />
    <div ref="popup" class="popup">
      <div>
        <strong>编号:</strong>
        <span>{{ popupEntity.nodeId }}</span>
      </div>
      <div v-if="popupEntity.nodeName">
        <strong>名称:</strong>
        <span>{{ popupEntity.nodeName }}</span>
      </div>
      <div v-if="popupEntity.assignee">
        <strong>处理人:</strong>
        <span>{{ popupEntity.assignee }}</span>
      </div>
      <div v-if="popupEntity.startTime">
        <strong>开始:</strong>
        <span>{{ popupEntity.startTime }}</span>
      </div>
      <div v-if="popupEntity.endTime">
        <strong>结束:</strong>
        <span>{{ popupEntity.endTime }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getDiagramSvgFrills } from '@/api/workflow/designer'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import $ from 'jquery'

export default {
  name: 'FlwDiagramFrills',
  components: {},
  props: {
    entity: {
      type: Object,
      default: () => {
        return {
          processInstanceId: null
        }
      }
    }
  },
  data() {
    return {
      modeler: null,
      popupEntity: {
        nodeId: '',
        nodeName: '',
        assignee: '',
        startTime: '',
        endTime: ''
      }
    }
  },
  mounted() {
    this.initialSvg()
  },
  methods: {
    initialSvg() {
      getDiagramSvgFrills(this.entity.processInstanceId).then(res => {
        res.code || this.renderSvg(res)
      }).catch(e => {
        this.$message({
          type: 'error',
          message: `查询流程图数据失败: ${e}`
        })
      })
    },
    frills(res) {
      const modeling = this.modeler.get('modeling')
      const elementRegistry = this.modeler.get('elementRegistry')

      const allElements = []
      elementRegistry.filter(function(item, index, array) {
        if (item.type === 'bpmn:UserTask') {
          allElements.push(item)
        }
      })
      modeling.setColor(allElements, {
        stroke: '#555555',
        fill: null
      })

      const executedElements = []
      const concatArr = res.highPoint.concat(res.highLine)
      if (concatArr && concatArr.length > 0) {
        concatArr.forEach(item => {
          executedElements.push(elementRegistry.get(item))
        })
        modeling.setColor(executedElements, {
          stroke: '#017501',
          fill: null
        })
      }

      if (res.iDo && res.iDo.length > 0) {
        const iDoEles = []
        res.iDo.forEach(item => {
          const iDoEle = elementRegistry.get(item)
          iDoEles.push(iDoEle)
        })
        modeling.setColor(iDoEles, {
          stroke: '#3595CC',
          fill: null
        })
      }

      if (res.waitingToDo && res.waitingToDo.length > 0) {
        const currentEles = []
        res.waitingToDo.forEach(item => {
          const currentEle = elementRegistry.get(item)
          currentEles.push(currentEle)
        })
        modeling.setColor(currentEles, {
          stroke: '#e90606',
          fill: null
        })
      }
    },
    getShape(id) {
      const elementRegistry = this.modeler.get('elementRegistry')
      return elementRegistry.get(id)
    },
    addEventBusListener(res) {
      const popup = this.$refs.popup
      const modeling = this.modeler.get('modeling')
      const eventBus = this.modeler.get('eventBus')
      const eventTypes = ['element.hover', 'element.out', 'element.click']
      eventTypes.forEach(eventType => {
        eventBus.on(eventType, e => {
          if (eventType === 'element.hover') {
            if (e && e.element.type === 'bpmn:UserTask') {
              const shape = this.getShape(e.element.id)
              modeling.setColor([shape], {
                stroke: '#0000ff',
                fill: null
              })
              this.popupEntity = res.nodeMap[e.element.id + '']
              $(popup).stop(true).slideDown(() => {
                const $gfx = $(e.gfx)
                $(popup).offset({ top: $gfx.offset().top - e.element.height * 1.7, left: $gfx.offset().left - e.element.width * 0.1 })
              })
            }
          } else if (eventType === 'element.out') {
            this.success(res)
            $(popup).stop(true).slideUp()
          }
        })
      })
    },
    success(res) {
      this.frills(res)
    },
    async renderSvg(res) {
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
        await this.modeler.importXML(res.bpmnXml)
        const canvas = this.modeler.get('canvas')
        canvas.zoom('fit-viewport', 'auto')
        this.addEventBusListener(res)
        this.success(res)
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
		height: 400px;
	}
	.djs-palette, .bjs-powered-by {
		display: none;
	}
  .popup {
    width: 140px;
    height: 120px;
    position: absolute;
    display: none;
    background-color: #3595CC;
    border-radius: 5px;
    color: white;
    padding: 5px;
    font-size: 12px;
    box-shadow: 4px 4px 5px #888888;
    -moz-box-shadow: 4px 4px 5px #888888; /* 老的 Firefox */
    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 38.2%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color:  #3595CC transparent transparent transparent;
    }
    div {
      margin: 9px 0 8px;
    }
  }
}
</style>
