<template>
  <div class="container">
    <div id="lock" @click="changeLock">
      <i :class="lockType" />
    </div>
    <div id="map" class="map" />
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
import { Style, Stroke, Icon } from 'ol/style'
import { getWidth, getTopLeft } from 'ol/extent'
import { tile as loadingTile } from 'ol/loadingstrategy'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { WMTS, TileArcGISRest, Vector as VectorSource } from 'ol/source'
import blueBorderJson from '@/data/blueBorder.json'
import enterpriseBorderJson from '@/data/enterpriseBorder.json'
import { ScaleLine } from 'ol/control'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Modify } from 'ol/interaction'

export default {
  name: 'MapLight',
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
      coordinates: [],
      betweenCoordinates: [],
      layers: [],
      onOff: true,
      lockType: 'el-icon-lock lock-color-white'
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
    changeLock() {
      this.lockType = this.lockType.indexOf('el-icon-lock') !== -1 ? 'el-icon-unlock lock-color-red' : 'el-icon-lock lock-color-white'
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
      // this.addEnterpriseTip();
      this.addMapEvent()
      this.addEnterpriseBorderGeoJson()
      this.addLanquBorderGeoJson()
      // 地图实例化完成
      window.mmap = this.map
      this.mapActive = 2
      // this.$emit("complete", this.map);
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
    addMapEvent() {
      this.map.on('click', event => {
        if (this.lockType.indexOf('el-icon-unlock') !== -1) {
          if (this.onOff) {
            this.map.removeLayer(this.betweenPointsLayer)
            this.layers.forEach((item, index, array) => {
              this.map.removeLayer(item)
            })
            this.coordinates = []
            this.layers = []
            this.onOff = false
          }
          this.addPointMarker(event.coordinate)
        }
      })
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
    },
    zoomAndCenter(coordinate, zoomLevel) {
      const projection = getProj('EPSG:4326') // 设置坐标系
      const my_view = new View({
        center: coordinate, // 地图中心点
        projection: projection, // 投影类别
        zoom: zoomLevel,
        maxZoom: 21, // 最大缩放级别
        minZoom: 12 // 最小缩放级别
      })
      this.map.setView(my_view)
    },
    viewPointMarker(startCoordinate, endCoordinate, lightCount, coordinateGroup) {
      this.onOff = true
      if (lightCount) {
        this.zoomAndCenter(startCoordinate, 18)
        this.lightCount = lightCount
      }

      this.coordinates.push(startCoordinate, endCoordinate)

      const point = new Style({
        image: new Icon({
          scale: 0.60,
          src: `${process.env.VUE_APP_BASE_WEB_URL}/images/redLight.png`
        })
      })
      const startFeature = new Feature(new Point(startCoordinate))
      startFeature.setStyle(point)
      const endFeature = new Feature(new Point(endCoordinate))
      endFeature.setStyle(point)

      const pointLayer = new VectorLayer({
        zIndex: 5,
        source: new VectorSource({
          features: [startFeature, endFeature]
        })
      })

      this.map.addLayer(pointLayer)
      this.layers.push(pointLayer)
      if (coordinateGroup) {
        this.addPointsMarker(coordinateGroup)
      } else {
        this.generatorLayer()
      }
    },
    addPointMarker(coordinate) {
      debugger
      this.coordinates.push(coordinate)
      if (this.coordinates.length === 3) {
        this.coordinates.shift()
      }
      const point = new Style({
        image: new Icon({
          scale: 0.60,
          src: `${process.env.VUE_APP_BASE_WEB_URL}/images/redLight.png`
        })
      })
      const feature = new Feature(new Point(coordinate))
      feature.setStyle(point)

      const pointLayer = new VectorLayer({
        zIndex: 5,
        source: new VectorSource({
          features: [feature]
        })
      })

      this.map.addLayer(pointLayer)
      this.layers.push(pointLayer)

      if (this.layers.length === 3) {
        this.map.removeLayer(this.layers[0])
        this.layers.shift()
      }

      if (this.layers.length === 2) {
        this.generatorLayer()
      }
    },
    generatorLayer() {
      const betweenCoordinates = []
      const startCoordinate = this.coordinates[0]
      const endCoordinate = this.coordinates[1]

      const startLongitude = startCoordinate[0]
      const startLatitude = startCoordinate[1]

      const endLongitude = endCoordinate[0]
      const endLatitude = endCoordinate[1]

      const betweenLongitude = endLongitude - startLongitude
      const betweenLatitude = endLatitude - startLatitude

      const averageLongitude = betweenLongitude / (this.lightCount - 1)
      const averageLatitude = betweenLatitude / (this.lightCount - 1)
      let longitude = null
      let latitude = null
      for (let i = 1; i <= this.lightCount - 2; i++) {
        longitude = startLongitude + averageLongitude * i
        latitude = startLatitude + averageLatitude * i
        betweenCoordinates.push([longitude, latitude])
      }
      this.addPointsMarker(betweenCoordinates)
    },
    addPointsMarker(betweenCoordinates) {
      this.map.removeLayer(this.betweenPointsLayer)
      const features = []
      const point = new Style({
        image: new Icon({
          scale: 0.60,
          src: `${process.env.VUE_APP_BASE_WEB_URL}/images/blueLight.png`
        })
      })
      betweenCoordinates.forEach((item, index, array) => {
        const feature = new Feature(new Point(item))
        feature.setStyle(point)
        features.push(feature)
      })

      const source = new VectorSource({
        features: features
      })

      this.betweenPointsLayer = new VectorLayer({
        zIndex: 5,
        source: source
      })

      const modify = new Modify({ source: source })
      this.map.addInteraction(modify)

      modify.on('modifyend', this.modifyEnd)

      this.map.addLayer(this.betweenPointsLayer)
      this.$emit('changeCoordinate', this.coordinates, betweenCoordinates)
    },
    modifyEnd(event) {
      const features = event.features.array_
      const betweenCoordinates = features.map((item, index, array) => {
        return item.values_.geometry.flatCoordinates
      })
      this.$emit('changeCoordinate', this.coordinates, betweenCoordinates)
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
  width: 100%;
  height: 600px;
  overflow: hidden;
  position: relative;
  z-index: 0;
  background-color: rgb(243, 241, 236);
  color: rgb(0, 0, 0);
  text-align: left;
}

.map-switch {
  cursor: pointer;
  z-index: 1000;
  position: absolute;
  top: 45px;
  right: 40px;
  background: #fff;
  font-size: 0;
  box-shadow: rgba(0, 0, 0, 0.34902) 2px 2px 3px;
  border-radius: 3px;
}

#lock {
  position: absolute;
  top: 8px;
  left: 12px;
  z-index: 1;
}
#lock i {
  font-size: 26px;
  color: white;
}

#lock i.lock-color-white{
  color: white;
}

#lock i.lock-color-red{
  color: red;
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
