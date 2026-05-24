'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface QRHistory {
  id: string
  text: string
  timestamp: string
  qrCode: string
  caption?: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<QRHistory[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const savedHistory = localStorage.getItem('qrHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const deleteItem = (id: string) => {
    if (confirm('Bu QR kodni o\'chirmoqchimisiz?')) {
      const newHistory = history.filter(item => item.id !== id)
      setHistory(newHistory)
      localStorage.setItem('qrHistory', JSON.stringify(newHistory))
    }
  }

  const clearAll = () => {
    if (confirm('Barcha tarixni o\'chirmoqchimisiz?')) {
      localStorage.removeItem('qrHistory')
      setHistory([])
    }
  }

  const filteredHistory = search.trim() 
    ? history.filter(item => 
        item.text.toLowerCase().includes(search.toLowerCase()) ||
        (item.caption && item.caption.toLowerCase().includes(search.toLowerCase()))
      )
    : history

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          QR Kodlar Tarixi
        </h1>
        {history.length > 0 && (
          <button
            onClick={clearAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            🗑 Hammasini o‘chirish
          </button>
        )}
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">Hali hech qanday QR kod yaratilmagan</p>
          <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">
            Birinchi QR kodni yarating →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
              <img src={item.qrCode} alt="QR Code" className="w-full p-4" />
              <div className="p-4 border-t">
                <p className="text-sm text-gray-600 font-mono break-all mb-2">{item.text}</p>
                {item.caption && (
                  <p className="text-sm text-blue-600 mb-2">📝 {item.caption}</p>
                )}
                <p className="text-xs text-gray-400 mb-3">🕒 {item.timestamp}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.text)
                      alert('Link nusxalandi!')
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded transition"
                  >
                    📋 Nusxalash
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded transition"
                  >
                    🗑 O‘chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}