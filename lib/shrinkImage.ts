// Shrinks a phone photo before upload: max 1600px on the long side, JPEG at 80%.
// Turns a 4 MB photo into roughly 200-400 KB. Keeps the photo right-side up.

const MAX_SIDE = 1600
const QUALITY = 0.8

export async function shrinkImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('That file isn\'t a photo.')

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as any)
  } catch (e) {
    throw new Error('Couldn\'t read that photo. Try a JPG or PNG.')
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Couldn\'t process that photo.')

  // White background so transparent PNGs don't turn black as JPEG
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/jpeg', QUALITY))
  if (!blob) throw new Error('Couldn\'t process that photo.')
  return blob
}