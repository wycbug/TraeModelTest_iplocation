# IP地理位置查询系统 API 文档

## 概述

本文档描述了IP地理位置查询系统的API接口。该系统基于Cloudflare Workers构建，提供高精度的IP地理位置查询服务，支持IPv4和IPv6地址查询。

## 基础信息

- **基础URL**: `https://your-worker-domain.workers.dev`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **支持方法**: GET, POST, OPTIONS

## 认证与安全

- **CORS支持**: 所有接口支持跨域请求
- **速率限制**: 每个IP地址每分钟最多100次请求
- **输入验证**: 所有IP地址输入都会进行格式验证

## API端点

### 1. 获取客户端IP地址

获取当前请求者的IP地址。

**接口地址**: `GET /api/client-ip`

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "ip": "61.179.207.196",
  "data": null,
  "api_source": "官方API网:https://api.pearktrue.cn/"
}
```

### 2. 查询单个IP位置

查询指定IP地址的详细地理位置信息。

**接口地址**: `GET /api/ip-location`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| ip | string | 否 | 要查询的IP地址（IPv4或IPv6） |

**响应数据结构**:
```typescript
interface LocationData {
  continent: string;        // 大洲
  continentCode: string;    // 大洲代码
  country: string;          // 国家
  countryCode: string;      // 国家代码
  region: string;           // 地区
  regionCode: string;       // 地区代码
  subdivisions: string;     // 省/州
  city: string;             // 城市
  districts: string;        // 区县
  address: string;          // 详细地址
  organization: string;     // 组织
  lat: number;              // 纬度
  lon: number;              // 经度
  timezone: string;         // 时区
}

interface ApiResponse {
  code: number;             // 状态码
  msg: string;              // 状态信息
  ip: string;               // 查询的IP地址
  data: LocationData | null; // 地理位置数据
  api_source: string;       // 数据来源
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "ip": "61.179.207.196",
  "data": {
    "continent": "亚洲",
    "continentCode": "AS",
    "country": "中国",
    "countryCode": "CN",
    "region": "华东",
    "regionCode": "EC",
    "subdivisions": "山东省",
    "city": "威海市",
    "districts": "环翠区",
    "address": "山东省威海市环翠区崮山镇听雨别院",
    "organization": "中国电信",
    "lat": 37.4,
    "lon": 122.2,
    "timezone": "Asia/Shanghai"
  },
  "api_source": "官方API网:https://api.pearktrue.cn/"
}
```

**错误响应示例**:
```json
{
  "code": 400,
  "msg": "无效的IP地址",
  "ip": "127.0.0.1",
  "data": null,
  "api_source": "官方API网:https://api.pearktrue.cn/"
}
```

### 3. 批量查询IP位置

批量查询多个IP地址的地理位置信息。

**接口地址**: `POST /api/batch-location`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "ips": ["61.179.207.196", "8.8.8.8", "1.1.1.1"]
}
```

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| ips | string[] | 是 | IP地址数组，最多支持100个IP |

**响应示例**:
```json
{
  "code": 200,
  "msg": "批量查询完成",
  "data": [
    {
      "code": 200,
      "msg": "获取成功",
      "ip": "61.179.207.196",
      "data": {
        "continent": "亚洲",
        "country": "中国",
        "city": "威海市",
        "lat": 37.4,
        "lon": 122.2,
        "timezone": "Asia/Shanghai"
      },
      "api_source": "官方API网:https://api.pearktrue.cn/"
    },
    {
      "code": 200,
      "msg": "获取成功",
      "ip": "8.8.8.8",
      "data": {
        "continent": "北美洲",
        "country": "美国",
        "city": "山景城",
        "lat": 37.4056,
        "lon": -122.0775,
        "timezone": "America/Los_Angeles"
      },
      "api_source": "官方API网:https://api.pearktrue.cn/"
    }
  ]
}
```

## 状态码说明

| 状态码 | 说明 |
| ---- | ---- |
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |

## 错误处理

所有API错误都会返回统一的错误格式：
```json
{
  "code": <错误码>,
  "msg": "<错误信息>",
  "ip": "<相关IP地址>",
  "data": null,
  "api_source": "官方API网:https://api.pearktrue.cn/"
}
```

## 使用限制

- **速率限制**: 每个IP地址每分钟最多100次请求
- **批量限制**: 单次批量查询最多支持100个IP地址
- **IP格式**: 支持IPv4和IPv6格式
- **数据源**: 使用PearkTrue API作为数据源

## 最佳实践

### 1. 错误处理
```javascript
try {
  const response = await fetch('/api/ip-location?ip=8.8.8.8');
  const data = await response.json();
  
  if (data.code === 200) {
    console.log('位置信息:', data.data);
  } else {
    console.error('查询失败:', data.msg);
  }
} catch (error) {
  console.error('请求失败:', error);
}
```

### 2. 批量查询
```javascript
const batchQuery = async (ips) => {
  const response = await fetch('/api/batch-location', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ips }),
  });
  
  return await response.json();
};
```

### 3. 获取客户端IP
```javascript
const getClientIP = async () => {
  const response = await fetch('/api/client-ip');
  const data = await response.json();
  return data.ip;
};
```

## 数据源说明

本系统使用 [PearkTrue API](https://api.pearktrue.cn/) 作为IP地理位置数据源：

- **数据精度**: 提供高精度的地理位置信息
- **更新频率**: 数据库定期更新
- **覆盖范围**: 全球IP地址覆盖
- **响应时间**: 平均响应时间 < 200ms

## SDK和示例代码

### JavaScript/TypeScript
```typescript
interface IPLocationAPI {
  getSingleLocation(ip?: string): Promise<ApiResponse>;
  getClientIP(): Promise<string>;
  getBatchLocations(ips: string[]): Promise<BatchResponse>;
}

class IPLocationClient implements IPLocationAPI {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  async getSingleLocation(ip?: string): Promise<ApiResponse> {
    const url = ip ? `${this.baseURL}/api/ip-location?ip=${ip}` : `${this.baseURL}/api/ip-location`;
    const response = await fetch(url);
    return await response.json();
  }
  
  async getClientIP(): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/client-ip`);
    const data = await response.json();
    return data.ip;
  }
  
  async getBatchLocations(ips: string[]): Promise<BatchResponse> {
    const response = await fetch(`${this.baseURL}/api/batch-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips }),
    });
    return await response.json();
  }
}

// 使用示例
const client = new IPLocationClient('https://your-worker-domain.workers.dev');

// 查询单个IP
const location = await client.getSingleLocation('8.8.8.8');

// 批量查询
const batchResults = await client.getBatchLocations(['8.8.8.8', '1.1.1.1']);
```

### Python
```python
import requests
import json

class IPLocationAPI:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def get_single_location(self, ip=None):
        url = f"{self.base_url}/api/ip-location"
        params = {"ip": ip} if ip else {}
        response = requests.get(url, params=params)
        return response.json()
    
    def get_client_ip(self):
        response = requests.get(f"{self.base_url}/api/client-ip")
        data = response.json()
        return data.get("ip")
    
    def get_batch_locations(self, ips):
        response = requests.post(
            f"{self.base_url}/api/batch-location",
            json={"ips": ips}
        )
        return response.json()

# 使用示例
api = IPLocationAPI("https://your-worker-domain.workers.dev")

# 查询单个IP
location = api.get_single_location("8.8.8.8")
print(location)

# 获取客户端IP
client_ip = api.get_client_ip()
print(f"客户端IP: {client_ip}")

# 批量查询
batch_results = api.get_batch_locations(["8.8.8.8", "1.1.1.1"])
print(batch_results)
```

## 更新日志

### v1.0.0 (2024-01-XX)
- 初始版本发布
- 支持单个和批量IP查询
- 提供完整的地理位置信息
- 集成地图可视化功能

## 技术支持

如有API使用问题，请通过以下方式联系：
- 提交GitHub Issue
- 查看项目文档
- 联系技术支持团队

## 许可证

本API遵循MIT许可证，可自由使用和修改。