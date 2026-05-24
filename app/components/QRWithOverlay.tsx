'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRWithOverlayProps {
  text: string
  size?: number
  logoText?: string  // O'rtaga yoziladigan matn
  logoImage?: string // Yoki rasm (base64 yoki URL)
  logoSize?: number  // Logotip o'lchami (px)
  colorDark?: string
  colorLight?: string
}

export default function QRWithOverlay({
  text,
  size = 300,
  logoText = '',
  logoImage = '',
  logoSize = 60,
  colorDark = '#000000',
  colorLight = '#ffffff'
}: QRWithOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const generateQRWithOverlay = async () => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!

      try {
        // 1. QR kod yaratish
        const qrCanvas = document.createElement('canvas')
        await QRCode.toCanvas(qrCanvas, text, {
          width: size,
          margin: 1,
          color: {
            dark: colorDark,
            light: colorLight
          },
          errorCorrectionLevel: 'H' // High - logotip qo'shish uchun muhim!
        })

        // 2. QR kodni asosiy canvasga chizish
        canvas.width = size
        canvas.height = size
        ctx.drawImage(qrCanvas, 0, 0)

        // 3. O'rtaga yarim transparent fon
        const centerX = size / 2
        const centerY = size / 2
        const bgSize = logoSize + 20

        // Fon (oq yumaloq fon)
        ctx.beginPath()
        ctx.arc(centerX, centerY, bgSize / 2, 0, 2 * Math.PI)
        ctx.fillStyle = colorLight
        ctx.fill()
        ctx.shadowBlur = 0

        // Chegaralovchi chiziq
        ctx.beginPath()
        ctx.arc(centerX, centerY, bgSize / 2, 0, 2 * Math.PI)
        ctx.strokeStyle = colorDark
        ctx.lineWidth = 2
        ctx.stroke()

        // 4. Logotip yoki matn qo'shish
        if (logoImage) {
          // Rasm qo'shish
          const img = new Image()
          img.crossOrigin = 'anonymous'
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              const imgSize = logoSize
              const imgX = centerX - imgSize / 2
              const imgY = centerY - imgSize / 2
              
              // Dumaloq qilish uchun clip
              ctx.save()
              ctx.beginPath()
              ctx.arc(centerX, centerY, imgSize / 2, 0, 2 * Math.PI)
              ctx.clip()
              ctx.drawImage(img, imgX, imgY, imgSize, imgSize)
              ctx.restore()
              
              resolve(null)
            }
            img.onerror = reject
            img.src = logoImage
          })
        } else if (logoText) {
          // Matn qo'shish
          const maxFontSize = Math.min(logoSize - 10, 40)
          let fontSize = maxFontSize
          
          // Matn uzunligiga qarab shrift o'lchamini moslash
          ctx.font = `bold ${fontSize}px "Inter", system-ui, sans-serif`
          while (ctx.measureText(logoText).width > logoSize - 10 && fontSize > 12) {
            fontSize -= 2
            ctx.font = `bold ${fontSize}px "Inter", system-ui, sans-serif`
          }
          
          ctx.fillStyle = colorDark
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(logoText, centerX, centerY)
        }

      } catch (error) {
        console.error('Error generating QR with overlay:', error)
      }
    }

    generateQRWithOverlay()
  }, [text, size, logoText, logoImage, logoSize, colorDark, colorLight])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="rounded-xl shadow-lg" />
      {logoText && (
        <p className="mt-2 text-xs text-gray-500">
          🎯 O'rtada: {logoText}
        </p>
      )}
    </div>
  )
}