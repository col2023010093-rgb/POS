import cartPlaceholder from '../assets/cart-placeholder.png'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const getImageSrc = (image) => {
  if (!image) return cartPlaceholder

  if (typeof image === 'object' && image.data) {
    const base64 = String(image.data).replace(/\s+/g, '')
    const type = image.contentType || 'image/png'
    return `data:${type};base64,${base64}`
  }

  const str = String(image).trim().replace(/\s+/g, '')
  if (!str) return cartPlaceholder

  if (str.startsWith('data:')) return str
  if (str.startsWith('http://') || str.startsWith('https://')) return str
  if (str.startsWith('/')) return `${BASE_URL}${str}`

  if (!str.includes('/') && !str.startsWith('base64')) {
    return `${BASE_URL}/images/${str}`
  }

  if (str.length > 100 && !str.includes('/')) {
    return `data:image/png;base64,${str}`
  }

  return cartPlaceholder
}