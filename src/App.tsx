import { useState } from 'react'
import './App.css'
import MapComponent from './components/MapComponent'
import BatchMap from './components/BatchMap'
import Statistics from './components/Statistics'
import QueryHistory from './components/QueryHistory'

interface LocationData {
  continent: string;
  continentCode: string;
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  subdivisions: string;
  city: string;
  districts: string;
  address: string;
  organization: string;
  lat: number;
  lon: number;
  timezone: string;
}

interface IPLocationResult {
  code: number;
  msg: string;
  ip: string;
  data: LocationData | null;
  api_source: string;
}

function App() {
  const [ipInput, setIpInput] = useState('')
  
  const [locationResult, setLocationResult] = useState<IPLocationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [batchIPs, setBatchIPs] = useState('')
  const [batchResults, setBatchResults] = useState<IPLocationResult[]>([])
  const [showBatch, setShowBatch] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const isValidIP = (ip: string): boolean => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  const getClientIP = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/client-ip')
      const data = await response.json()
      if (data.code === 200) {
        setIpInput(data.ip)
        setLocationResult(data)
        // Add to history
        if ((window as unknown as Record<string, unknown>).addQueryToHistory && data.ip) {
          (window as unknown as Record<string, (ip: string, data: IPLocationResult) => void>).addQueryToHistory(data.ip, data)
        }
      } else {
        setError(data.msg || '获取客户端IP失败')
      }
    } catch {
      setError('获取客户端IP失败')
    } finally {
      setLoading(false)
    }
  }

  const queryIPLocation = async (ip?: string) => {
    setLoading(true)
    setError('')
    setLocationResult(null)
    
    try {
      const url = ip ? `/api/ip-location?ip=${encodeURIComponent(ip)}` : '/api/ip-location'
      const response = await fetch(url)
      const data = await response.json() as IPLocationResult
      
      if (data.code === 200) {
        setLocationResult(data)
        // Add to history
        if ((window as unknown as Record<string, unknown>).addQueryToHistory && ip) {
          (window as unknown as Record<string, (ip: string, data: IPLocationResult) => void>).addQueryToHistory(ip, data)
        }
      } else {
        setError(data.msg)
      }
    } catch {
      setError('查询失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSingleQuery = () => {
    if (!ipInput.trim()) {
      setError('请输入IP地址')
      return
    }
    
    if (!isValidIP(ipInput.trim())) {
      setError('请输入有效的IP地址（IPv4或IPv6）')
      return
    }
    
    queryIPLocation(ipInput.trim())
  }

  const handleBatchQuery = async () => {
    const ips = batchIPs.split('\n').map(ip => ip.trim()).filter(ip => ip)
    
    if (ips.length === 0) {
      setError('请输入至少一个IP地址')
      return
    }
    
    const invalidIPs = ips.filter(ip => !isValidIP(ip))
    if (invalidIPs.length > 0) {
      setError(`无效的IP地址: ${invalidIPs.join(', ')}`)
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/batch-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ips }),
      })
      
      const data = await response.json()
      
      if (data.code === 200) {
        setBatchResults(data.data)
      } else {
        setError(data.msg)
      }
    } catch {
      setError('批量查询失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const exportToJSON = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = (data: IPLocationResult[], filename: string) => {
    const headers = ['IP', '大洲', '国家', '地区', '省/州', '城市', '区县', '详细地址', '组织', '纬度', '经度', '时区', '状态']
    const rows = data.map(result => [
      result.ip,
      result.data?.continent || '',
      result.data?.country || '',
      result.data?.region || '',
      result.data?.subdivisions || '',
      result.data?.city || '',
      result.data?.districts || '',
      result.data?.address || '',
      result.data?.organization || '',
      result.data?.lat || '',
      result.data?.lon || '',
      result.data?.timezone || '',
      result.msg
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>IP地理位置查询系统</h1>
        <p>支持IPv4和IPv6地址的高精度地理位置查询</p>
      </header>

      <main className="app-main">
        <div className="tabs">
          <button 
            className={!showBatch && !showStats ? 'active' : ''} 
            onClick={() => { setShowBatch(false); setShowStats(false) }}
          >
            单个查询
          </button>
          <button 
            className={showBatch ? 'active' : ''} 
            onClick={() => { setShowBatch(true); setShowStats(false) }}
          >
            批量查询
          </button>
          <button 
            className={showStats ? 'active' : ''} 
            onClick={() => { setShowBatch(false); setShowStats(true) }}
          >
            统计分析
          </button>
        </div>

        {!showBatch ? (
          <div className="single-query">
            <div className="input-section">
              <div className="input-group">
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="请输入IP地址（IPv4或IPv6）"
                  className="ip-input"
                />
                <button onClick={getClientIP} className="btn btn-secondary">
                  获取我的IP
                </button>
              </div>
              <button 
                onClick={handleSingleQuery} 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? '查询中...' : '查询位置'}
              </button>
            </div>

            {error && <div className="error">{error}</div>}

            {locationResult && locationResult.code === 200 && (
              <div className="result-section">
                <div className="location-card">
                  <h3>查询结果</h3>
                  <div className="location-info">
                    <div className="info-row">
                      <span className="label">IP地址:</span>
                      <span className="value">{locationResult.ip}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">大洲:</span>
                      <span className="value">{locationResult.data?.continent || '未知'} ({locationResult.data?.continentCode || ''})</span>
                    </div>
                    <div className="info-row">
                      <span className="label">国家:</span>
                      <span className="value">{locationResult.data?.country || '未知'} ({locationResult.data?.countryCode || ''})</span>
                    </div>
                    <div className="info-row">
                      <span className="label">地区:</span>
                      <span className="value">{locationResult.data?.region || '未知'} ({locationResult.data?.regionCode || ''})</span>
                    </div>
                    <div className="info-row">
                      <span className="label">省/州:</span>
                      <span className="value">{locationResult.data?.subdivisions || '未知'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">城市:</span>
                      <span className="value">{locationResult.data?.city || '未知'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">区县:</span>
                      <span className="value">{locationResult.data?.districts || '未知'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">详细地址:</span>
                      <span className="value">{locationResult.data?.address || '未知'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">组织:</span>
                      <span className="value">{locationResult.data?.organization || '未知'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">经纬度:</span>
                      <span className="value">
                        {locationResult.data?.lat && locationResult.data?.lon ? 
                          `${locationResult.data.lat}, ${locationResult.data.lon}` : 
                          '未知'
                        }
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">时区:</span>
                      <span className="value">{locationResult.data?.timezone || '未知'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => exportToJSON(locationResult, `ip-location-${locationResult.ip}.json`)}
                    className="btn btn-export"
                  >
                    导出JSON
                  </button>
                </div>

                {locationResult.data?.lat && locationResult.data?.lon && (
                  <div className="map-section">
                    <h3>地图位置</h3>
                    <MapComponent 
                      latitude={locationResult.data.lat}
                      longitude={locationResult.data.lon}
                      address={locationResult.data.address || ''}
                      ip={locationResult.ip}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="batch-query">
            <div className="input-section">
              <textarea
                value={batchIPs}
                onChange={(e) => setBatchIPs(e.target.value)}
                placeholder="请输入多个IP地址，每行一个"
                className="batch-input"
                rows={6}
              />
              <div className="batch-buttons">
                <button 
                  onClick={handleBatchQuery} 
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? '批量查询中...' : '批量查询'}
                </button>
                {batchResults.length > 0 && (
                  <>
                    <button 
                      onClick={() => exportToJSON(batchResults, 'batch-ip-locations.json')}
                      className="btn btn-export"
                    >
                      导出JSON
                    </button>
                    <button 
                      onClick={() => exportToCSV(batchResults, 'batch-ip-locations.csv')}
                      className="btn btn-export"
                    >
                      导出CSV
                    </button>
                  </>
                )}
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            {batchResults.length > 0 && (
              <>
                <div className="batch-results">
                  <h3>批量查询结果</h3>
<div className="results-table">
                  <table>
                    <thead>
                      <tr>
                        <th>IP地址</th>
                        <th>国家</th>
                        <th>地区</th>
                        <th>城市</th>
                        <th>详细地址</th>
                        <th>经纬度</th>
                        <th>时区</th>
                        <th>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.map((result, index) => (
                        <tr key={index}>
                          <td>{result.ip}</td>
                          <td>{result.data?.country || '-'}</td>
                          <td>{result.data?.region || '-'}</td>
                          <td>{result.data?.city || '-'}</td>
                          <td>{result.data?.address || '-'}</td>
                          <td>
                            {result.data?.lat && result.data?.lon ? 
                              `${result.data.lat}, ${result.data.lon}` : 
                              '-'
                            }
                          </td>
                          <td>{result.data?.timezone || '-'}</td>
                          <td className={result.code === 200 ? 'success' : 'error'}>
                            {result.msg}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>
                
                <div className="map-section">
                  <h3>批量地图位置</h3>
                  <BatchMap 
                    locations={batchResults
                      .filter(result => result.code === 200 && result.data?.lat && result.data?.lon)
                      .map(result => ({
                        ip: result.ip,
                        latitude: result.data!.lat,
                        longitude: result.data!.lon,
                        address: result.data!.address || ''
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}
        
        {showStats && (
          <div className="stats-view">
            <Statistics data={batchResults.filter(result => result.code === 200)} />
            <QueryHistory />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
