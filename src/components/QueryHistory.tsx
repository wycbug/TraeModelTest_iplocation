import { useState, useEffect } from 'react'

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

interface HistoryItem {
  id: string
  ip: string
  timestamp: number
  result: IPLocationResult
}

export default function QueryHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('ipQueryHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const addToHistory = (ip: string, result: IPLocationResult) => {
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      ip,
      timestamp: Date.now(),
      result
    }

    const newHistory = [historyItem, ...history.slice(0, 49)] // Keep last 50 items
    setHistory(newHistory)
    localStorage.setItem('ipQueryHistory', JSON.stringify(newHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('ipQueryHistory')
  }

  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id)
    setHistory(newHistory)
    localStorage.setItem('ipQueryHistory', JSON.stringify(newHistory))
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  // Expose method to parent components
  useEffect(() => {
    const addToHistoryCallback = addToHistory
    ;(window as unknown as Record<string, unknown>).addQueryToHistory = addToHistoryCallback
  }, [])

  if (history.length === 0) {
    return (
      <div className="history-section">
        <h3>查询历史</h3>
        <div className="no-data">
          <p>暂无查询历史</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history-section">
      <div className="history-header">
        <h3>查询历史</h3>
        <button onClick={clearHistory} className="btn btn-secondary btn-small">
          清空历史
        </button>
      </div>
      
      <div className="history-list">
        {history.map((item) => (
          <div key={item.id} className="history-item">
            <div className="history-content">
              <div className="history-ip">
                <strong>IP:</strong> {item.ip}
              </div>
              <div className="history-location">
                {item.result.data ? (
                  <span>
                    {item.result.data.country} {item.result.data.region} {item.result.data.city}
                  </span>
                ) : (
                  <span className="error-text">查询失败</span>
                )}
              </div>
              <div className="history-time">
                {formatDate(item.timestamp)}
              </div>
            </div>
            <button 
              onClick={() => removeFromHistory(item.id)}
              className="btn btn-remove"
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}