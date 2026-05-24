'use client'
import { useState } from 'react'

interface ShareButtonsProps {
  qrDataUrl: string
  text: string
}

export default function ShareButtons({ qrDataUrl, text }: ShareButtonsProps) {
  const [showShare, setShowShare] = useState(false)

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank')
  }

  const downloadAndShare = async () => {
    try {
      // QR kodni yuklab olish
      const link = document.createElement('a')
      link.download = `qrcode-${Date.now()}.png`
      link.href = qrDataUrl
      link.click()

      // Navigatordagi share API
      if (navigator.share) {
        await navigator.share({
          title: 'QR Kod',
          text: text,
          url: window.location.href
        })
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <div className="flex gap-2 justify-center mt-4">
      <button
        onClick={shareToTwitter}
        className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
      >
        🐦 Twitter
      </button>
      <button
        onClick={shareToTelegram}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
      >
        📨 Telegram
      </button>
      <button
        onClick={downloadAndShare}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
      >
        📤 Yuklab olish
      </button>
    </div>
  )
}