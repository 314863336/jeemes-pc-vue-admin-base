<template>
  <div class="container">
    <div
      id="map"
      class="map"
    />
  </div>
</template>

<script>
import config from '@/data/config'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import Overlay from 'ol/Overlay'
import GeoJSON from 'ol/format/GeoJSON'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get as getProj } from 'ol/proj'
import { createXYZ } from 'ol/tilegrid'
import { Style, Stroke } from 'ol/style'
import { getWidth, getTopLeft } from 'ol/extent'
import { tile as loadingTile } from 'ol/loadingstrategy'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { WMTS, TileArcGISRest, Vector as VectorSource } from 'ol/source'
import blueBorderJson from '@/data/blueBorder.json'
import enterpriseBorderJson from '@/data/enterpriseBorder.json'
import { ScaleLine } from 'ol/control'

export default {
  name: 'Map',
  components: { },
  props: {
    longitude: {
      type: String,
      default: ''
    },
    latitude: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      map: {},
      vecLayers: [],
      imageLayers: [],
      mapActive: 1,
      token: '49534f36b1e3ccba7baac6a27ebd2832',
      loading: false,
      betweenPointsLayer: null,
      entity: {
        id: '',
        type: '',
        enableStatus: '',
        htProjectInfo: {
          name: ''
        }
      },
      popupOverlay: null
    }
  },
  watch: {
    mapActive(val) {
      if (val === 1) {
        this.showNormalMap()
      } else {
        this.showImageMap()
      }
    }
  },
  created() {
  },
  mounted() {
    this.initMap()
  },
  beforeCreate() {
    // overflow: hidden;
    document.getElementsByTagName('body')[0].style.overflow = 'hidden'
  },
  destroyed() {
    document.getElementsByTagName('body')[0].style.overflow = ''
  },
  methods: {
    detail() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.$router.push({ name: 'timecontrol', params: this.entity })
      }, 300)
    },
    initMap() {
      const projection = getProj('EPSG:4326') // 设置坐标系
      const projectionExtent = projection.getExtent()
      const center = config.center // 地图中心点
      const size = getWidth(projectionExtent) / 256
      // 分辨率
      const resolutions = new Array(19)
      const matrixIds = new Array(19)
      for (let z = 1; z < 19; ++z) {
        resolutions[z] = size / Math.pow(2, z)
        matrixIds[z] = z
      }
      this.vecLayers = [
        new TileLayer({
          title: '一般地图',
          source: new WMTS({
            name: '中国矢量1-14级',
            url: config.publicNormal,
            layer: 'vec',
            style: 'default',
            matrixSet: 'c',
            format: 'tiles',
            tileLoadFunction: (tile, src) =>
              (tile.getImage().src = src + `&tk=${this.token}`),
            wrapX: true,
            tileGrid: new WMTSTileGrid({
              origin: getTopLeft(projectionExtent),
              resolutions: resolutions.slice(0, 15),
              matrixIds: matrixIds.slice(0, 15)
            })
          }),
          minResolution: 0.00004291534423828125,
          maxResolution: 1.40625
        }),
        new TileLayer({
          source: new WMTS({
            name: '中国矢量注记1-14级',
            url: config.publicNormal_cva,
            layer: 'cva',
            style: 'default',
            matrixSet: 'c',
            format: 'tiles',
            tileLoadFunction: (tile, src) =>
              (tile.getImage().src = src + `&tk=${this.token}`),
            wrapX: true,
            tileGrid: new WMTSTileGrid({
              origin: getTopLeft(projectionExtent),
              resolutions: resolutions.slice(0, 15),
              matrixIds: matrixIds.slice(0, 15)
            })
          }),
          minResolution: 0.00004291534423828125,
          maxResolution: 1.40625
        }),
        new TileLayer({
          source: new TileArcGISRest({
            url: config.innerNormal
          })
        })
      ]
      this.imageLayers = [
        // 加载0-15级的国家天地图影像地图，如果需要其他地图，请看其他demo
        new TileLayer({
          visible: false,
          title: '全国影像地图',
          source: new WMTS({
            name: '中国矢量1-14级',
            url: config.publicImage,
            layer: 'img',
            style: 'default',
            matrixSet: 'c',
            format: 'tiles',
            tileLoadFunction: (tile, src) =>
              (tile.getImage().src = src + `&tk=${this.token}`),
            wrapX: true,
            tileGrid: new WMTSTileGrid({
              origin: getTopLeft(projectionExtent),
              resolutions: resolutions.slice(0, 15),
              matrixIds: matrixIds.slice(0, 15)
            })
          }),
          minResolution: 0.00004291534423828125,
          maxResolution: 1.40625
        }),
        // 加载0-15级的国家天地图影像地图对应的标记图层，也就是那些标记，否则，只有图片了。
        new TileLayer({
          visible: false,
          title: '全国影像地图-标记',
          source: new WMTS({
            name: '中国矢量1-14级',
            url: config.publicImage_cia,
            layer: 'cia',
            style: 'default',
            matrixSet: 'c',
            format: 'tiles',
            tileLoadFunction: (tile, src) =>
              (tile.getImage().src = src + `&tk=${this.token}`),
            wrapX: true,
            tileGrid: new WMTSTileGrid({
              origin: getTopLeft(projectionExtent),
              resolutions: resolutions.slice(0, 15),
              matrixIds: matrixIds.slice(0, 15)
            })
          }),
          minResolution: 0.00004291534423828125,
          maxResolution: 1.40625
        }),
        new TileLayer({
          visible: false,
          zIndex: 1,
          source: new TileArcGISRest({
            url: config.innerImage
          })
        })
      ]
      this.view = new View({
        center: center, // 地图中心点
        projection: projection, // 投影类别
        zoom: 14,
        maxZoom: 21, // 最大缩放级别
        minZoom: 12 // 最小缩放级别
      })
      this.map = new Map({
        layers: [...this.vecLayers, ...this.imageLayers],
        view: this.view,
        overlays: [this.popupOverlay],
        target: 'map',
        controls: [
          // 加载比例尺控件
          new ScaleLine({
            // 设置度量单位为米
            units: 'metric',
            target: 'scalebar',
            className: 'ol-scale-line'
          })
        ]
      })
      this.addEnterpriseBorderGeoJson()
      this.addLanquBorderGeoJson()
      // 地图实例化完成
      window.mmap = this.map
      this.mapActive = 2
    },
    addEnterpriseTip() {
      // 企业边界提示框
      this.enterpriseTip = document.getElementById('enterprise-tip')
      this.enterpriseTipLayer = new Overlay({
        element: this.enterpriseTip,
        offset: [0, -10],
        position: []
      })
      this.map.addOverlay(this.enterpriseTipLayer)
    },
    showNormalMap() {
      this.vecLayers.forEach(item => item.setVisible(true))
      this.imageLayers.forEach(item => item.setVisible(false))
    },
    showImageMap() {
      this.vecLayers.forEach(item => item.setVisible(false))
      this.imageLayers.forEach(item => item.setVisible(true))
    },
    /**
     * 显示蓝区边界
     * */
    addLanquBorderGeoJson() {
      this.lanquBorderLayer = new VectorLayer({
        zIndex: 1,
        source: new VectorSource({
          format: new GeoJSON(),
          strategy: loadingTile(createXYZ({ maxZoom: 25 })),
          features: new GeoJSON().readFeatures(blueBorderJson)
        }),
        style: new Style({
          stroke: new Stroke({
            color: '#1d4867',
            width: 5
          })

        })
      })
      this.map.addLayer(this.lanquBorderLayer)
    },
    /**
     * 显示企业边界
     * */
    addEnterpriseBorderGeoJson() {
      this.enterpriseBorderlayer = new VectorLayer({
        zIndex: 2,
        source: new VectorSource({
          format: new GeoJSON(),
          strategy: loadingTile(createXYZ({ maxZoom: 25 })),
          features: new GeoJSON().readFeatures(enterpriseBorderJson)
        }),
        style: new Style({
          stroke: new Stroke({
            color: '#375ff1',
            width: 3
          })

        })
      })
      this.map.addLayer(this.enterpriseBorderlayer)
    },
    changeLayer() {
      if (this.mapActive === 1) {
        this.mapActive = 2
      } else {
        this.mapActive = 1
      }
    },
    jumpTo(coordinate, entId, paramId) {
      const duration = 1000
      this.view.animate({
        center: coordinate,
        duration
      })
      const pop = this.$refs.popoverEnt
      pop.paramId = paramId
      setTimeout(() => {
        pop.updataInfos(entId)
        pop.popup.setPosition(coordinate)
        pop.showPopup = true
        pop.visible = true
      }, duration)
    }
  }
}
</script>

<style scoped>
.info-window-title {
  padding: 8px 0;
}

.info-window-content {
  padding: 0 20px 20px;
}

.info-window-ent-tip {
  position: absolute;
  transform: translate(-50%, -50%);
  /* background: red; */
  background-color: rgba(0, 39, 102, 0.75);
  /* background-size: 100% 100%; */
  font-size: 12px;
  width: 320px;
  min-height: 50px;
  color: #fff;
  transition: all 0.2s;
  /*text-align: center;*/
}

.map {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  z-index: 0;
  background-color: rgb(243, 241, 236);
  color: rgb(0, 0, 0);
  text-align: left;
}

</style>

<style>
.p0 {
  padding: 0;
}
/* body {
  overflow: hidden;
} */
</style>
