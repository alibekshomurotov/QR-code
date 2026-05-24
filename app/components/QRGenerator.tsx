'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'

interface QRHistory {
  id: string
  text: string
  timestamp: string
  qrCode: string
  caption?: string
}

// PREMIUM REJIM - Chiroyli gradient ramka + qora-oq QR
async function generatePremiumQR(
  text: string,
  size: number,
  options: {
    frameStartColor: string
    frameEndColor: string
    title: string
    subtitle: string
    titleColor: string
    logo: string
  }
): Promise<string> {
  const framePadding = 90
  const qrSize = size
  const totalSize = qrSize + framePadding * 2
  
  const canvas = document.createElement('canvas')
  canvas.width = totalSize
  canvas.height = totalSize
  const ctx = canvas.getContext('2d')!
  
  // Gradient ramka
  const gradient = ctx.createLinearGradient(0, 0, totalSize, totalSize)
  gradient.addColorStop(0, options.frameStartColor)
  gradient.addColorStop(1, options.frameEndColor)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, totalSize, totalSize)
  
  // Dekorativ aksent
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(totalSize, 0)
  ctx.lineTo(totalSize, 70)
  ctx.fillStyle = options.frameEndColor
  ctx.fill()
  
  // QR kod uchun oq fon
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(framePadding - 4, framePadding - 4, qrSize + 8, qrSize + 8)
  
  // QR kod (qora va oq)
  const qrCanvas = document.createElement('canvas')
  qrCanvas.width = qrSize
  qrCanvas.height = qrSize
  
  await QRCode.toCanvas(qrCanvas, text, {
    width: qrSize,
    margin: 0,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  })
  
  ctx.drawImage(qrCanvas, framePadding, framePadding)
  
  // Title
  if (options.title) {
    let fontSize = Math.min(totalSize * 0.05, 26)
    ctx.font = `700 ${fontSize}px "Inter", system-ui, sans-serif`
    ctx.fillStyle = options.titleColor
    ctx.textAlign = 'center'
    ctx.fillText(options.title, totalSize / 2, framePadding / 1.6)
  }
  
  // Subtitle
  if (options.subtitle) {
    let fontSize = Math.min(totalSize * 0.03, 13)
    ctx.font = `400 ${fontSize}px "Inter", system-ui, sans-serif`
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(options.subtitle, totalSize / 2, totalSize - framePadding / 1.8)
  }
  
  // Logo
  if (options.logo) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise((resolve) => {
      img.onload = () => {
        const logoSize = 42
        const logoX = totalSize - logoSize - 18
        const logoY = 18
        
        ctx.save()
        ctx.beginPath()
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, 2 * Math.PI)
        ctx.clip()
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
        ctx.restore()
        resolve(null)
      }
      img.src = options.logo
    })
  }
  
  return canvas.toDataURL()
}

// SIMPLE REJIM - Faqat qora-oq QR kod (hech qanday fon yo'q)
async function generateSimpleQR(text: string, size: number): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  })
  
  return canvas.toDataURL()
}

export default function QRGenerator() {
  const [text, setText] = useState('')
  const [caption, setCaption] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [history, setHistory] = useState<QRHistory[]>([])
  const [mode, setMode] = useState<'premium' | 'simple'>('premium')
  const [activeTab, setActiveTab] = useState('design')
  const [loading, setLoading] = useState(false)
  const [size, setSize] = useState(240)
  
  // PREMIUM REJIM SOZLAMALARI
  const [frameStartColor, setFrameStartColor] = useState('#667eea')
  const [frameEndColor, setFrameEndColor] = useState('#764ba2')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [titleColor, setTitleColor] = useState('#ffffff')
  const [logo, setLogo] = useState('')
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Chiroyli gradient temalar
  const themes = [
    { name: 'Purple Dream', start: '#667eea', end: '#764ba2' },
    { name: 'Ocean Wave', start: '#2193b0', end: '#6dd5ed' },
    { name: 'Sunset', start: '#f12711', end: '#f5af19' },
    { name: 'Mint', start: '#11998e', end: '#38ef7d' },
    { name: 'Pink Love', start: '#ff9a9e', end: '#fecfef' },
    { name: 'Neon Blue', start: '#00c6fb', end: '#005bea' },
    { name: 'Fire', start: '#ff416c', end: '#ff4b2b' },
    { name: 'Midnight', start: '#232526', end: '#414345' },
  ]

  const updateQRCode = async () => {
    if (!text.trim()) return
    
    setLoading(true)
    let finalText = text
    if (text.includes('.') && !text.startsWith('http')) {
      finalText = 'https://' + text
    }
    
    try {
      let dataUrl: string
      
      if (mode === 'premium') {
        dataUrl = await generatePremiumQR(finalText, size, {
          frameStartColor: frameStartColor,
          frameEndColor: frameEndColor,
          title: title,
          subtitle: subtitle,
          titleColor: titleColor,
          logo: logo
        })
      } else {
        dataUrl = await generateSimpleQR(finalText, size)
      }
      
      setQrDataUrl(dataUrl)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!text.trim()) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => updateQRCode(), 400)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [text, size, mode, frameStartColor, frameEndColor, title, subtitle, titleColor, logo])

  useEffect(() => {
    const saved = localStorage.getItem('qrHistory')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const saveToHistory = () => {
    if (!qrDataUrl || !text.trim()) return
    const finalText = text.includes('.') && !text.startsWith('http') ? 'https://' + text : text
    const newHistory = [{ id: Date.now().toString(), text: finalText, timestamp: new Date().toLocaleString('uz-UZ'), qrCode: qrDataUrl, caption: caption || '' }, ...history].slice(0, 50)
    setHistory(newHistory)
    localStorage.setItem('qrHistory', JSON.stringify(newHistory))
    alert('✅ Saved!')
  }

  const downloadQR = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = `qrcode-${Date.now()}.png`
    link.href = qrDataUrl
    link.click()
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => setLogo(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl"></div>
              <span className="font-bold text-xl tracking-tight">QR<span className="text-gray-400">Studio</span></span>
            </div>
            <Link href="/history" className="text-sm text-gray-500 hover:text-gray-900 transition">History</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT: Settings */}
          <div className="space-y-5">
            {/* Mode Selection */}
            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('premium')}
                  className={`p-4 rounded-xl border-2 transition ${
                    mode === 'premium' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">✨</div>
                  <div className="font-medium text-sm">Premium</div>
                  <div className="text-xs text-gray-400 mt-1">Gradient + Title + Logo</div>
                </button>
                <button
                  onClick={() => setMode('simple')}
                  className={`p-4 rounded-xl border-2 transition ${
                    mode === 'simple' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">⚫</div>
                  <div className="font-medium text-sm">Simple</div>
                  <div className="text-xs text-gray-400 mt-1">Plain black & white</div>
                </button>
              </div>
            </div>

            {/* URL Input */}
            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter URL or Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                rows={2}
              />
            </div>

            {/* Premium Settings (faqat premium rejimda) */}
            {mode === 'premium' && (
              <>
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="flex border-b">
                    {['Design', 'Content'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`flex-1 py-3 text-sm font-medium transition ${
                          activeTab === tab.toLowerCase() 
                            ? 'text-purple-600 border-b-2 border-purple-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-5">
                    {/* DESIGN TAB */}
                    {activeTab === 'design' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Gradient Themes</label>
                          <div className="grid grid-cols-4 gap-2">
                            {themes.map((theme) => (
                              <button
                                key={theme.name}
                                onClick={() => {
                                  setFrameStartColor(theme.start)
                                  setFrameEndColor(theme.end)
                                }}
                                className="p-1 rounded-lg border hover:scale-105 transition"
                              >
                                <div 
                                  className="w-full h-12 rounded-md" 
                                  style={{ background: `linear-gradient(135deg, ${theme.start}, ${theme.end})` }} 
                                />
                                <span className="text-xs text-gray-600 mt-1 block truncate">{theme.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500">Start Color</label>
                            <input type="color" value={frameStartColor} onChange={(e) => setFrameStartColor(e.target.value)} className="w-full h-10 rounded-lg border mt-1" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">End Color</label>
                            <input type="color" value={frameEndColor} onChange={(e) => setFrameEndColor(e.target.value)} className="w-full h-10 rounded-lg border mt-1" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Title Color</label>
                          <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="w-full h-10 rounded-lg border mt-1" />
                        </div>
                      </div>
                    )}

                    {/* CONTENT TAB */}
                    {activeTab === 'content' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value.slice(0, 30))}
                            placeholder="SCAN ME"
                            className="w-full px-3 py-2 bg-gray-50 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value.slice(0, 40))}
                            placeholder="Scan this QR code"
                            className="w-full px-3 py-2 bg-gray-50 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Logo (optional)</label>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-sm" />
                          {logo && (
                            <div className="mt-2 flex items-center gap-2">
                              <img src={logo} alt="Logo" className="w-8 h-8 rounded-full border" />
                              <button onClick={() => setLogo('')} className="text-xs text-red-500">Remove</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm"
                  />
                </div>
              </>
            )}

            {/* Size Control */}
            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Size</label>
                <span className="text-sm text-gray-500">{size}px</span>
              </div>
              <input
                type="range"
                min="180"
                max="350"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={saveToHistory}
                disabled={!qrDataUrl}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
              >
                Save to Library
              </button>
              <button
                onClick={downloadQR}
                disabled={!qrDataUrl}
                className="flex-1 border-2 border-gray-800 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-800 hover:text-white transition disabled:opacity-50"
              >
                Download PNG
              </button>
            </div>
          </div>

          {/* RIGHT: Preview */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24 h-fit">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-gray-900">Live Preview</h3>
              <p className="text-xs text-gray-400 mt-1">
                {mode === 'premium' ? 'Premium mode • Beautiful gradient' : 'Simple mode • Plain black & white'}
              </p>
            </div>
            
            <div className="flex items-center justify-center min-h-[380px] bg-gray-50 rounded-xl p-6">
              {loading ? (
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-400 mt-3 text-sm">Generating...</p>
                </div>
              ) : qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="QR Code" 
                  className={`rounded-xl shadow-2xl transition-transform hover:scale-105 ${mode === 'simple' ? 'border' : ''}`}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 text-gray-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">Enter URL to generate</p>
                </div>
              )}
            </div>
            
            <div className={`mt-4 p-3 rounded-xl text-center ${mode === 'premium' ? 'bg-green-50' : 'bg-gray-100'}`}>
              <p className={`text-xs ${mode === 'premium' ? 'text-green-700' : 'text-gray-600'}`}>
                {mode === 'premium' ? (
                  '✨ Premium: Beautiful gradient frame + Black & White QR (100% scannable)'
                ) : (
                  '⚫ Simple: Plain black & white QR code, no background, works everywhere'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-400 mb-3">RECENT QR CODES</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {history.slice(0, 4).map((item) => (
                <div key={item.id} className="group relative bg-white rounded-xl p-2 shadow-sm border cursor-pointer hover:shadow-md transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const newHistory = history.filter(h => h.id !== item.id)
                      setHistory(newHistory)
                      localStorage.setItem('qrHistory', JSON.stringify(newHistory))
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition z-10"
                  >
                    ×
                  </button>
                  <div onClick={() => setText(item.text)}>
                    <img src={item.qrCode} alt="History" className="w-full rounded-lg mb-2" />
                    {item.caption && <p className="text-xs text-gray-600 truncate">{item.caption}</p>}
                    <p className="text-xs text-gray-400 truncate">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}