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

interface StatisticsProps {
  data: IPLocationResult[]
}

export default function Statistics({ data }: StatisticsProps) {
  const [stats, setStats] = useState({
    totalQueries: 0,
    countryStats: {} as Record<string, number>,
    regionStats: {} as Record<string, number>,
    cityStats: {} as Record<string, number>,
    topCountries: [] as Array<{ name: string; count: number }>,
    topRegions: [] as Array<{ name: string; count: number }>,
    topCities: [] as Array<{ name: string; count: number }>
  })

  useEffect(() => {
    const validData = data.filter(item => item.data)
    
    const countryCount: Record<string, number> = {}
    const regionCount: Record<string, number> = {}
    const cityCount: Record<string, number> = {}
    
    validData.forEach(item => {
      const country = item.data!.country
      const region = item.data!.region
      const city = item.data!.city
      
      if (country) {
        countryCount[country] = (countryCount[country] || 0) + 1
      }
      
      if (region) {
        regionCount[region] = (regionCount[region] || 0) + 1
      }
      
      if (city) {
        cityCount[city] = (cityCount[city] || 0) + 1
      }
    })
    
    const topCountries = Object.entries(countryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))
    
    const topRegions = Object.entries(regionCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))
    
    const topCities = Object.entries(cityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    setStats({
      totalQueries: validData.length,
      countryStats: countryCount,
      regionStats: regionCount,
      cityStats: cityCount,
      topCountries,
      topRegions,
      topCities
    })
  }, [data])

  if (data.length === 0) {
    return (
      <div className="statistics-section">
        <h3>统计分析</h3>
        <div className="no-data">
          <p>暂无数据进行分析</p>
        </div>
      </div>
    )
  }

  return (
    <div className="statistics-section">
      <h3>统计分析</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h4>总查询次数</h4>
          <div className="stat-number">{stats.totalQueries}</div>
        </div>
        
        <div className="stat-card">
          <h4>涉及国家</h4>
          <div className="stat-number">{Object.keys(stats.countryStats).length}</div>
        </div>
        
        <div className="stat-card">
          <h4>涉及地区</h4>
          <div className="stat-number">{Object.keys(stats.regionStats).length}</div>
        </div>
        
        <div className="stat-card">
          <h4>涉及城市</h4>
          <div className="stat-number">{Object.keys(stats.cityStats).length}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h4>国家分布 TOP 10</h4>
          <div className="chart-list">
            {stats.topCountries.map((country, index) => (
              <div key={country.name} className="chart-item">
                <span className="rank">{index + 1}</span>
                <span className="name">{country.name}</span>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ 
                      width: `${(country.count / stats.totalQueries) * 100}%` 
                    }}
                  />
                </div>
                <span className="count">{country.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h4>地区分布 TOP 10</h4>
          <div className="chart-list">
            {stats.topRegions.map((region, index) => (
              <div key={region.name} className="chart-item">
                <span className="rank">{index + 1}</span>
                <span className="name">{region.name}</span>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ 
                      width: `${(region.count / stats.totalQueries) * 100}%` 
                    }}
                  />
                </div>
                <span className="count">{region.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h4>城市分布 TOP 10</h4>
          <div className="chart-list">
            {stats.topCities.map((city, index) => (
              <div key={city.name} className="chart-item">
                <span className="rank">{index + 1}</span>
                <span className="name">{city.name}</span>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ 
                      width: `${(city.count / stats.totalQueries) * 100}%` 
                    }}
                  />
                </div>
                <span className="count">{city.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}