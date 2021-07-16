import defaultSettings from '@/settings'

const title = defaultSettings.title || 'JEEMES PC ADMIN'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
