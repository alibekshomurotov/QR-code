'use client'

interface QRWithCaptionProps {
  qrDataUrl: string
  caption: string
  size?: number
}

export default function QRWithCaption({ qrDataUrl, caption, size = 300 }: QRWithCaptionProps) {
  return (
    <div className="flex flex-col items-center">
      <img 
        src={qrDataUrl} 
        alt="QR Code" 
        className="border-4 border-gray-200 rounded-xl shadow-lg"
        style={{ width: size, height: size }}
      />
      {caption && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 w-full">
          <p className="text-gray-700 text-center font-medium">{caption}</p>
          <p className="text-xs text-gray-500 text-center mt-1 break-all">{caption.includes('http') ? caption : 'Link'}</p>
        </div>
      )}
    </div>
  )
}