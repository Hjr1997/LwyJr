import DOMPurify from 'dompurify'

// Sanitize HTML content to prevent XSS
// Used for all v-html directives across the app
DOMPurify.addHook('afterSanitizeElements', (node) => {
  const el = node as Element
  // Allow iframe elements (needed for code previews)
  if (el.tagName === 'IFRAME') {
    const src = (node as HTMLIFrameElement).getAttribute('src')
    // Only allow same-origin iframes
    if (src && !src.startsWith('about:') && !src.startsWith('blob:')) {
      el.remove()
    }
  }
})

export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'a', 'b', 'br', 'code', 'del', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'i', 'img', 'ins', 'li', 'ol', 'p', 'pre', 's', 'span', 'strong',
      'sub', 'sup', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul',
      'blockquote', 'div', 'mark', 'small',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'id', 'style', 'src', 'alt', 'title',
      'data-*', 'aria-*', 'role',
    ],
    ADD_ATTR: ['target'],
  })
}
