# IP高精度地理位置查询 API 文档

## 接口描述
查询IP的高精度地理位置信息，支持IPv4和IPv6查询。

## 接口地址
`https://api.pearktrue.cn/api/ip/high/`

## 请求方式
`GET`

## 返回格式
`JSON`

## 请求参数
| 参数名 | 说明 | 必填 |
| ---- | ---- | ---- |
| ip | IP地址（IPv4，IPv6），不填则默认为请求者的IP地址 | 否 |

## 返回结果
| 字段名 | 说明 | 类型 |
| ---- | ---- | ---- |
| code | 状态码 | 整数 |
| msg | 状态信息 | 字符串 |
| ip | 查询的IP地址 | 字符串 |
| data | 返回的地理位置信息 | 对象 |
| data.location | 经纬度信息 | 对象 |
| data.location.lat | 纬度 | 数字 |
| data.location.lng | 经度 | 数字 |
| data.address | 详细地理位置信息 | 字符串 |
| data.province | 省份 | 字符串 |
| data.city | 城市 | 字符串 |
| data.district | 区县 | 字符串 |
| data.detail | 简要地理位置信息 | 字符串 |
| api_source | 数据来源 | 字符串 |

## 响应示例
```json
{
  "code": 200,
  "msg": "获取成功",
  "ip": "61.179.207.196",
  "data": {
    "location": {
      "lat": 37.4,
      "lng": 122.2
    },
    "address": "山东省威海市环翠区崮山镇听雨别院",
    "province": "山东省",
    "city": "威海市",
    "district": "环翠区",
    "detail": "山东省威海市环翠区"
  },
  "api_source": "官方API网:https://api.pearktrue.cn/"
}
```

## 错误示例
```json
{
  "code": 400,
  "msg": "无效的IP地址",
  "ip": "127.0.0.1",
  "data": null,
  "api_source": "官方API网:https://api.pearktrue.cn/"
}
```

## 调用统计
- 总调用次数：16,132,168
- 今日调用：93,919
- 本周调用：1,399,705

## 在线调试
[https://api.pearktrue.cn/api/ip/high/](https://api.pearktrue.cn/api/ip/high/)

## 使用限制
- 该API为免费接口，请勿滥用
- 建议合理控制请求频率，避免对服务器造成过大压力
- 如需要更高频率的调用，请联系API提供商获取商业授权