import { useEffect, useRef } from 'react'

interface MapComponentProps {
  latitude: number
  longitude: number
  address: string
  ip: string
}

declare global {
  interface Window {
    L: unknown
  }
}

export default function MapComponent({ latitude, longitude, address, ip }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    const loadLeaflet = () => {
      if (window.L) {
        initMap()
        return
      }

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      document.head.appendChild(script)
    }

    const initMap = () => {
      if (!mapRef.current || !window.L) return

      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
      }

      const L = window.L as any
      const map = L.map(mapRef.current).setView([latitude, longitude], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      const marker = L.marker([latitude, longitude]).addTo(map)
      
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <strong>IP: ${ip}</strong><br>
          ${address}<br>
          <small>纬度: ${latitude}<br>经度: ${longitude}</small>
        </div>
      `).openPopup()

      mapInstanceRef.current = map
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, address, ip])

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: '400px', 
        width: '100%',
        borderRadius: '6px',
        overflow: 'hidden'
      }} 
    />
  )
}