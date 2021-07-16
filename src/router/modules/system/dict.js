// 字典管理非菜单路由页面
const dictRouter = [
  {
    path: 'dict-detail/:type',
    name: 'DictDetail',
    hidden: true,
    component: () => import('@/views/system/dict/DictDetail'),
    meta: { title: '字典数据', icon: 'tree', activeMenu: '/system/dict' }
  }
]

export default dictRouter
