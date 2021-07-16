import Cookies from 'js-cookie'

const TokenKey = 'Authorization'

// 标识客户端的唯一性
const ClientUUIDKey = 'ClientUUID'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getClientUUID() {
  return Cookies.get(ClientUUIDKey)
}

export function setClientUUID(token) {
  return Cookies.set(ClientUUIDKey, token)
}

export function removeClientUUID() {
  return Cookies.remove(ClientUUIDKey)
}

export function getCookie(cookieKey) {
  return Cookies.get(cookieKey)
}

export function setCookie(cookieKey, cookieValue) {
  return Cookies.set(cookieKey, cookieValue)
}

export function removeCookie(cookieKey) {
  return Cookies.remove(cookieKey)
}
