import { useEffect, useRef } from 'react'

interface BatchMapProps {
  locations: Array<{
    ip: string
    latitude: number
    longitude: number
    address: string
  }>
}



export default function BatchMap({ locations }: BatchMapProps) {
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
      if (!mapRef.current || !window.L || locations.length === 0) return

      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
      }

      const validLocations = locations.filter(loc => 
        loc.latitude && loc.longitude && !isNaN(loc.latitude) && !isNaN(loc.longitude)
      )

      if (validLocations.length === 0) return

      const L = window.L as any
      const bounds = L.latLngBounds(validLocations.map(loc => [loc.latitude, loc.longitude]))
      
      const map = L.map(mapRef.current).fitBounds(bounds, { padding: [50, 50] })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      validLocations.forEach((location, index) => {
        const marker = L.marker([location.latitude, location.longitude]).addTo(map)
        
        marker.bindPopup(`
          <div style="min-width: 200px;">
            <strong>IP: ${location.ip}</strong><br>
            ${location.address}<br>
            <small>纬度: ${location.latitude}<br>经度: ${location.longitude}</small>
          </div>
        `)

        if (index === 0) {
          marker.openPopup()
        }
      })

      mapInstanceRef.current = map
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [locations])

  if (locations.length === 0) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '6px',
        color: '#6c757d'
      }}>
        暂无位置数据
      </div>
    )
  }

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