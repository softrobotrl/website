const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
const basePath = baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '')

export const homeHref = baseUrl

export function homeSectionHref(sectionId: string) {
  return `${homeHref}#${sectionId}`
}

export function isHomePath(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  return normalizedPath === (basePath || '/') || normalizedPath === `${basePath}/index.html`
}
