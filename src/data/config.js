export default {
  /**
   * 管理员角色编码
   */
  adminRoleCode: 'gwh-admin',
  /**
   * 地图中心点
   */
  center: [118.44883831198695, 37.97155288985331],
  /**
   * cookie有效时间
   */
  cookieExpires: 1,
  /**
   * @description 跳转统一登陆页面
   */
  homePageUrl: '',
  /**
   * @description 道路卡口
   */
  kakouPageUrl: 'http://37.82.70.242',
  /**
   * @description 危废管理页面
   */
  wastePageUrl: 'http://58.58.162.59:38911',
  /**
   * @description 监控预警页面
   */
  monitorUrl: {
    pageUrl: 'http://58.58.162.59:38891'
  },
  /**
   * @description 隐患排查页面
   */
  hiddenTroubleUrl: 'http://58.58.162.59:38910/ahyjyth/login/login',

  // GIS 底图地址
  publicImage: 'http://t{0-6}.tianditu.com/img_c/wmts',
  publicImage_cia: 'http://t{0-6}.tianditu.com/cia_c/wmts',
  publicNormal: 'http://t{0-6}.tianditu.com/vec_c/wmts',
  publicNormal_cva: 'http://t{0-6}.tianditu.com/cva_c/wmts',
  innerImage: 'http://58.58.162.59:13393/ArcGIS/rest/services/YX202006/MapServer',
  innerNormal: 'http://58.58.162.59:13393/arcgis/rest/services/dianziditu2/MapServer',
  /**
   * @description 一企一档
   */
  enterpriseUrl: {
    dev: '/enterprise/',
    pro: '/enterprise-archive/out/',
    pageUrl: 'http://58.58.162.59:38899'
  },
  /**
   * @description 8700访问
   */
  videoPlayUrl: {
    dev: 'http://172.31.18.157:8700', // 测试环境地址
    pro: 'http://172.31.18.157:8700',
    photos: 'http://172.31.18.164:8088'
  },

  /**
   * @description api请求基础路径
   */
  baseUrl: {
    dev: '/api/',
    pro: '/api/'
  },

  /**
   * @description 登录完成后跳转默认页面配置
   */
  defaultPage: 'environmental-protection-td',
  /**
   * @description 网关地址 用于展示网关地址上的文件
   */
  host: 'https://api.asoco.com.cn',
  /**
   * @description 设备类型
   */
  deviceTypeEnum: {
    basicAir: 'VOC', // 大气站类型
    waterInfo: 'RAIN', // 水环境
    planeDeviceId: '839243213', // 无人机id
    skyVideoCode: '98f10b2a23cc45a98a176cac71521435' // 高空瞭望code
  },
  /**
   * @description 视频管理系统角色枚举
   */
  videoTypeEnum: {
    environmentVideo: 'GWHHBSP', // 园区环保视频
    commonVideo: 'GWHGGSP', // 园区公共视频
    planeVideo: 'GWHWRJSP', // 无人机视频
    kakouVideo: 'LQDLKK', // 道路卡口
    skyVideo: ['蓝区高空瞭望热成像', '蓝区高空瞭望普通', '东营河口蓝区全景摄像机', '东营河口蓝区全景摄像'],
    skyVideoCode: 'LQGKLW' // 高空瞭望
  },
  /**
   * @description 页面类型枚举
   */
  pageTypeEnum: {
    add: 'add', // add新增
    detail: 'detail', // detail详情
    update: 'update', // update更新修改
    set: 'set', // set设置
    deal: 'deal' // deal处理
  },
  /**
   * @description 弹窗类型枚举
   */
  modalTypeEnum: {
    add: 'add', // add新增
    detail: 'detail', // detail详情
    update: 'update', // update更新修改
    set: 'set', // set设置
    deal: 'deal' // deal处理
  },
  /**
   * @description 列表页的默认每页条数和初始页
   */
  pageSize: 10,
  pageIndex: 1

}
