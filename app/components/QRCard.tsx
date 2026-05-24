'use client'
import { useState } from 'react'

interface QRCardProps {
  item: {
    id: string
    text: string
    timestamp: string
    qrCode: string
  }
}

export default function QRCard({ item }: QRCardProps) {
  const [showFull, setShowFull] = useState(false)

  const deleteItem = () => {
    const history = JSON.parse(localStorage.getItem('qrHistory') || '[]')
    const newHistory = history.filter((h: any) => h.id !== item.id)
    localStorage.setItem('qrHistory', JSON.stringify(newHistory))
    window.location.reload()
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-4">
        <img 
          src={item.qrCode} 
          alt="QR Code" 
          className="w-full max-w-[200px] mx-auto mb-3"
        />
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-mono">
            {showFull ? item.text : `${item.text.substring(0, 50)}...`}
            {item.text.length > 50 && (
              <button
                onClick={() => setShowFull(!showFull)}
                className="text-blue-500 ml-1 text-xs"
              >
                {showFull ? 'yashirish' : 'to‘liq'}
              </button>
            )}
          </p>
          
          <p className="text-xs text-gray-400">{item.timestamp}</p>
          
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(item.text)
                alert('Link nusxalandi!')
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-2 rounded transition"
            >
              Nusxalash
            </button>
            
            <button
              onClick={deleteItem}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-2 rounded transition"
            >
              O‘chirish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}