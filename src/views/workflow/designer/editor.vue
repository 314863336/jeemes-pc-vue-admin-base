<template>
  <div class="designer-editor">
    <div ref="canvas" class="canvas" />
    <div ref="propertiesPanelParent" class="properties-panel-parent" />
    <ul class="buttons">
      <li>
        下载
      </li>
      <li>
        <a id="js-download-diagram" href="####" title="下载 BPMN">
          BPMN
        </a>
      </li>
      <li>
        <a id="js-download-svg" href="####" title="下载 SVG">
          SVG
        </a>
      </li>
    </ul>
    <div class="tools">
      <el-button type="primary" icon="el-icon-edit" circle title="编辑" @click="edit" />
      <el-button type="success" icon="el-icon-upload" circle title="上传" @click="upload" />
    </div>
    <el-dialog
      title="选择业务"
      width="20%"
      :visible.sync="dialogSelectVisible"
      :before-close="handleClose"
      append-to-body
    >
      <el-select v-model="value" filterable placeholder="请选择" style="width: 100%" @change="changeSelect">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSelectVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogSelectVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <input ref="file" type="file" style="display:none" @change="uploadFile">
  </div>
</template>

<script>
import $ from 'jquery'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import PropertiesPanelModule from 'bpmn-js-properties-panel'
import PropertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
import CamundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json'
import CustomTranslate from './custom-translate/custom-translate'
import { findProcessKeys } from '@/api/workflow/designer'

const bpmnXmlStr = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
    <bpmn2:process id="process1567044459787" name="流程1567044459787">
    <bpmn2:documentation>描述</bpmn2:documentation>
    <bpmn2:startEvent id="StartEvent_01ydzqe" name="开始">
        <bpmn2:outgoing>SequenceFlow_1qw929z</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:sequenceFlow id="SequenceFlow_1qw929z" sourceRef="StartEvent_01ydzqe" targetRef="Task_1piqdk6" />
    <bpmn2:userTask id="Task_1piqdk6" name="请假申请">
        <bpmn2:incoming>SequenceFlow_1qw929z</bpmn2:incoming>
        <bpmn2:outgoing>SequenceFlow_11h4o22</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="ExclusiveGateway_0k39v3u">
        <bpmn2:incoming>SequenceFlow_11h4o22</bpmn2:incoming>
        <bpmn2:outgoing>SequenceFlow_1iu7pfe</bpmn2:outgoing>
        <bpmn2:outgoing>SequenceFlow_04uqww2</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="SequenceFlow_11h4o22" sourceRef="Task_1piqdk6" targetRef="ExclusiveGateway_0k39v3u" />
    <bpmn2:sequenceFlow id="SequenceFlow_1iu7pfe" sourceRef="ExclusiveGateway_0k39v3u" targetRef="Task_10fqcwp" />
    <bpmn2:userTask id="Task_10fqcwp" name="经理审批">
        <bpmn2:incoming>SequenceFlow_1iu7pfe</bpmn2:incoming>
        <bpmn2:outgoing>SequenceFlow_1xod8nh</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="SequenceFlow_04uqww2" sourceRef="ExclusiveGateway_0k39v3u" targetRef="Task_15n23yh" />
    <bpmn2:userTask id="Task_15n23yh" name="总部审批">
        <bpmn2:incoming>SequenceFlow_04uqww2</bpmn2:incoming>
        <bpmn2:outgoing>SequenceFlow_0c8wrs4</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:exclusiveGateway id="ExclusiveGateway_1sq33g6">
        <bpmn2:incoming>SequenceFlow_0c8wrs4</bpmn2:incoming>
        <bpmn2:incoming>SequenceFlow_1xod8nh</bpmn2:incoming>
        <bpmn2:outgoing>SequenceFlow_0h8za82</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="SequenceFlow_0c8wrs4" sourceRef="Task_15n23yh" targetRef="ExclusiveGateway_1sq33g6" />
    <bpmn2:sequenceFlow id="SequenceFlow_1xod8nh" sourceRef="Task_10fqcwp" targetRef="ExclusiveGateway_1sq33g6" />
    <bpmn2:endEvent id="EndEvent_0pnmjd3">
        <bpmn2:incoming>SequenceFlow_0h8za82</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="SequenceFlow_0h8za82" sourceRef="ExclusiveGateway_1sq33g6" targetRef="EndEvent_0pnmjd3" />
    </bpmn2:process>
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="process1567044459787">
        <bpmndi:BPMNShape id="StartEvent_01ydzqe_di" bpmnElement="StartEvent_01ydzqe">
        <dc:Bounds x="532" y="72" width="36" height="36" />
        <bpmndi:BPMNLabel>
            <dc:Bounds x="539" y="53" width="22" height="14" />
        </bpmndi:BPMNLabel>
        </bpmndi:BPMNShape>
        <bpmndi:BPMNEdge id="SequenceFlow_1qw929z_di" bpmnElement="SequenceFlow_1qw929z">
        <di:waypoint x="550" y="108" />
        <di:waypoint x="550" y="150" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNShape id="UserTask_1qxjy46_di" bpmnElement="Task_1piqdk6">
        <dc:Bounds x="500" y="150" width="100" height="80" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNShape id="ExclusiveGateway_0k39v3u_di" bpmnElement="ExclusiveGateway_0k39v3u" isMarkerVisible="true">
        <dc:Bounds x="525" y="275" width="50" height="50" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNEdge id="SequenceFlow_11h4o22_di" bpmnElement="SequenceFlow_11h4o22">
        <di:waypoint x="550" y="230" />
        <di:waypoint x="550" y="275" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNEdge id="SequenceFlow_1iu7pfe_di" bpmnElement="SequenceFlow_1iu7pfe">
        <di:waypoint x="575" y="300" />
        <di:waypoint x="680" y="300" />
        <di:waypoint x="680" y="380" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNShape id="UserTask_18pwui1_di" bpmnElement="Task_10fqcwp">
        <dc:Bounds x="630" y="380" width="100" height="80" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNEdge id="SequenceFlow_04uqww2_di" bpmnElement="SequenceFlow_04uqww2">
        <di:waypoint x="525" y="300" />
        <di:waypoint x="430" y="300" />
        <di:waypoint x="430" y="380" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNShape id="UserTask_1j0us24_di" bpmnElement="Task_15n23yh">
        <dc:Bounds x="380" y="380" width="100" height="80" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNShape id="ExclusiveGateway_1sq33g6_di" bpmnElement="ExclusiveGateway_1sq33g6" isMarkerVisible="true">
        <dc:Bounds x="525" y="515" width="50" height="50" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNEdge id="SequenceFlow_0c8wrs4_di" bpmnElement="SequenceFlow_0c8wrs4">
        <di:waypoint x="430" y="460" />
        <di:waypoint x="430" y="540" />
        <di:waypoint x="525" y="540" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNEdge id="SequenceFlow_1xod8nh_di" bpmnElement="SequenceFlow_1xod8nh">
        <di:waypoint x="680" y="460" />
        <di:waypoint x="680" y="540" />
        <di:waypoint x="575" y="540" />
        </bpmndi:BPMNEdge>
        <bpmndi:BPMNShape id="EndEvent_0pnmjd3_di" bpmnElement="EndEvent_0pnmjd3">
        <dc:Bounds x="532" y="602" width="36" height="36" />
        </bpmndi:BPMNShape>
        <bpmndi:BPMNEdge id="SequenceFlow_0h8za82_di" bpmnElement="SequenceFlow_0h8za82">
        <di:waypoint x="550" y="565" />
        <di:waypoint x="550" y="602" />
        </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`

export default {
  name: 'DesignerEditor',
  components: {},
  data() {
    return {
      modeler: null,
      dialogSelectVisible: true,
      options: [],
      value: '',
      name: 'diagram'
    }
  },
  mounted() {
    this.initialModeler()
  },
  methods: {
    uploadFile(event) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = reader.result
        this.options = []
        this.value = ''
        this.modeler.importXML(text, (err) => {
          if (err) {
            console.error(err)
          } else {
            this.success()
          }
        })
      }
      reader.readAsText(event.target.files[0], ['utf-8'])
    },
    edit() {
      this.$refs.file.click()
    },
    getLable(key) {
      const entity = this.options.find(item => item.value === key)
      return entity.label
    },
    changeSelect(value) {
      const elementRegistry = this.modeler.get('elementRegistry')
      const processShape = elementRegistry.find(
        (item) => item.type === 'bpmn:Process'
      )
      if (processShape) {
        const modeling = this.modeler.get('modeling')
        this.name = value.substring(value.lastIndexOf('.') + 1)
        modeling.updateProperties(processShape, {
          id: value,
          name: this.getLable(value)
        })
      }
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    async upload() {
      let xml, svg
      try {
        svg = await this.modeler.saveSVG()
      } catch (err) {
        console.error('保存svg时发生错误: ', err)
      }
      try {
        xml = await this.modeler.saveXML({ format: true })
      } catch (err) {
        console.error('保存XML时发生错误: ', err)
      }
      // 上传 待开发...
      console.log(xml, svg)
    },
    debounce(fn, timeout) {
      let timer
      return function() {
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(fn, timeout)
      }
    },
    setEncoded(link, name, data) {
      const encodedData = encodeURIComponent(data)
      if (data) {
        link.addClass('active').attr({
          'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
          'download': name
        })
      } else {
        link.removeClass('active')
      }
    },
    success() {
      findProcessKeys({}).then(res => {
        if (!res.code) {
          for (const key in res.data) {
            this.options.push({ label: res.data[key], value: key })
          }
          this.dialogSelectVisible = true
        }
      })
    },
    initialModeler() {
      const canvas = this.$refs.canvas
      const propertiesPanelParent = this.$refs.propertiesPanelParent

      const downloadLink = $('#js-download-diagram')
      const downloadSvgLink = $('#js-download-svg')

      var customTranslateModule = {
        translate: ['value', CustomTranslate]
      }

      this.modeler = new BpmnModeler({
        container: canvas,
        propertiesPanel: {
          parent: propertiesPanelParent
        },
        additionalModules: [
          customTranslateModule,
          PropertiesPanelModule,
          PropertiesProviderModule
        ],
        moddleExtensions: {
          camunda: CamundaModdleDescriptor
        }
      })
      this.modeler.importXML(bpmnXmlStr, (err) => {
        if (err) {
          console.error(err)
        } else {
          this.success()
        }
      })
      this.modeler.on('commandStack.changed', this.debounce(async() => {
        try {
          const { svg } = await this.modeler.saveSVG()

          this.setEncoded(downloadSvgLink, `${this.name}.svg`, svg)
        } catch (err) {
          console.error('保存svg时发生错误: ', err)
          this.setEncoded(downloadSvgLink, `${this.name}.svg`, null)
        }

        try {
          const { xml } = await this.modeler.saveXML({ format: true })
          this.setEncoded(downloadLink, `${this.name}.bpmn`, xml)
        } catch (err) {
          console.error('保存XML时发生错误: ', err)
          this.setEncoded(downloadLink, `${this.name}.bpmn`, null)
        }
      }, 500))
    }
  }
}
</script>

<style lang="scss">
@import "~bpmn-js/dist/assets/diagram-js.css";
@import "~bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
@import "~bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css";

.designer-editor {
  position: absolute;
  width: 100%;
  height: 100%;
  .canvas {
    width: 100%;
    height: 100%;
  }
  .bjs-powered-by {
		display: none;
	}
  .properties-panel-parent {
    font-size: 12px;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 260px;
    z-index: 10;
    border-left: 1px solid #ccc;
    overflow: auto;
    &:empty {
      display: none;
    }
    > .djs-properties-panel {
      padding-bottom: 70px;
      min-height:100%;
    }
  }
  .buttons {
    position: fixed;
    bottom: 20px;
    left: 228px;
    padding: 0;
    margin: 0;
    list-style: none;
    li {
      display: inline-block;
      margin-right: 10px;
      a {
        font-size: 14px;
        border: solid 1px #303133;
        border-radius: 6px;
        display: inline-block;
        padding: 3px 5px;
        opacity: 0.3;
        &.active {
          opacity: 1.0;
        }
      }
    }
  }
  .tools{
    position: absolute;
    top: 6px;
    right: 280px;
  }
}
</style>
