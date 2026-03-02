import cartPlaceholder from '../assets/cart-placeholder.png'

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
  if (str.startsWith('/')) return `http://localhost:4000${str}`

  // Treat as a filename and serve from /uploads or /images directory
  if (!str.includes('/') && !str.startsWith('base64')) {
    return `http://localhost:4000/images/${str}`
  }

  // Fallback: if it looks like base64, use it as data URL
  if (str.length > 100 && !str.includes('/')) {
    return `data:image/png;base64,${str}`
  }

  return cartPlaceholder
}