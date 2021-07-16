// 字典管理非菜单路由页面
const toolsRouter = [
  {
    path: 'sub-list/:tableName',
    name: 'GenSub',
    hidden: true,
    component: () => import('@/views/tools/gen/SubList'),
    meta: { title: '查询子表', icon: 'tree', activeMenu: '/tool/CODE_GEN' }
  }
]

export default toolsRouter

