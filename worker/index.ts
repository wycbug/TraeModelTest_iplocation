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

interface ApiResponse {
  code: number;
  msg: string;
  ip: string;
  data: LocationData | null;
  api_source: string;
}

function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

async function fetchIPLocation(ip?: string): Promise<ApiResponse> {
  // 使用 pearktrue.cn IP详情查询API
  if (!ip) {
    return {
      code: 400,
      msg: "此API需要提供IP地址参数",
      ip: "",
      data: null,
      api_source: "官方API网:https://api.pearktrue.cn/"
    };
  }
  
  const apiUrl = `https://api.pearktrue.cn/api/ip/details/?ip=${encodeURIComponent(ip)}`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json() as any;
    
    if (data.code === 200 && data.data) {
      return {
        code: data.code,
        msg: data.msg,
        ip: data.ip,
        data: data.data,
        api_source: data.api_source
      };
    } else {
      return {
        code: data.code || 400,
        msg: data.msg || "查询失败",
        ip: ip,
        data: null,
        api_source: data.api_source || "官方API网:https://api.pearktrue.cn/"
      };
    }
  } catch {
    return {
      code: 500,
      msg: "API请求失败",
      ip: ip || "",
      data: null,
      api_source: "官方API网:https://api.pearktrue.cn/"
    };
  }
}

function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                    request.headers.get('X-Forwarded-For') || 
                    'unknown';

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: getCORSHeaders(),
      });
    }

    // Rate limiting using client IP
    const rateLimitKey = `rate_limit:${clientIP}`;
    const rateLimitData = await env.IP_LOCATION_KV?.get(rateLimitKey);
    const currentCount = rateLimitData ? parseInt(rateLimitData) : 0;
    
    // Allow 60 requests per minute per IP
    if (currentCount >= 60) {
      return Response.json({
        code: 429,
        msg: "请求频率过高，请稍后再试",
        ip: clientIP,
        data: null,
        api_source: "官方API网:https://api.pearktrue.cn/"
      }, {
        status: 429,
        headers: getCORSHeaders(),
      });
    }

    // Increment rate limit counter
    ctx.waitUntil(env.IP_LOCATION_KV?.put(rateLimitKey, (currentCount + 1).toString(), {
      expirationTtl: 60 // 1 minute TTL
    }));

    if (url.pathname === "/api/ip-location") {
      const ip = url.searchParams.get('ip');
      
      // Check cache first
      const cacheKey = ip ? `ip_location:${ip}` : `ip_location:${clientIP}`;
      const cachedResult = await env.IP_LOCATION_KV?.get(cacheKey);
      
      if (cachedResult) {
        return Response.json(JSON.parse(cachedResult), {
          headers: getCORSHeaders(),
        });
      }
      
      // Validate IP if provided
      if (ip && !isValidIP(ip)) {
        return Response.json({
          code: 400,
          msg: "无效的IP地址",
          ip: ip,
          data: null,
          api_source: "官方API网:https://api.pearktrue.cn/"
        }, {
          headers: getCORSHeaders(),
        });
      }

      const result = await fetchIPLocation(ip || undefined);
      
      // Cache successful results for 5 minutes
      if (result.code === 200) {
        ctx.waitUntil(env.IP_LOCATION_KV?.put(cacheKey, JSON.stringify(result), {
          expirationTtl: 300 // 5 minutes TTL
        }));
      }
      
      return Response.json(result, {
        headers: getCORSHeaders(),
      });
    }

    if (url.pathname === "/api/batch-location") {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { 
          status: 405,
          headers: getCORSHeaders(),
        });
      }

      try {
        const body = await request.json() as { ips: string[] };
        const { ips } = body;

        if (!Array.isArray(ips) || ips.length === 0) {
          return Response.json({
            code: 400,
            msg: "请提供有效的IP地址数组",
            data: null
          }, {
            headers: getCORSHeaders(),
          });
        }

        // Validate all IPs
        const invalidIPs = ips.filter(ip => !isValidIP(ip));
        if (invalidIPs.length > 0) {
          return Response.json({
            code: 400,
            msg: `无效的IP地址: ${invalidIPs.join(', ')}`,
            data: null
          }, {
            headers: getCORSHeaders(),
          });
        }

        // Process batch requests (limit to 10 IPs per request)
        const limitedIPs = ips.slice(0, 10);
        
        // Check cache for each IP first
        const results: ApiResponse[] = [];
        const uncachedIPs: string[] = [];
        const ipToIndexMap = new Map<string, number>();
        
        for (let i = 0; i < limitedIPs.length; i++) {
          const ip = limitedIPs[i];
          ipToIndexMap.set(ip, i);
          const cacheKey = `ip_location:${ip}`;
          const cachedResult = await env.IP_LOCATION_KV?.get(cacheKey);
          
          if (cachedResult) {
            results[i] = JSON.parse(cachedResult);
          } else {
            uncachedIPs.push(ip);
          }
        }
        
        // Fetch uncached IPs
        if (uncachedIPs.length > 0) {
          const promises = uncachedIPs.map(ip => fetchIPLocation(ip));
          const uncachedResults = await Promise.all(promises);
          
          // Merge results and cache successful ones
          for (let i = 0; i < uncachedIPs.length; i++) {
            const ip = uncachedIPs[i];
            const result = uncachedResults[i];
            const originalIndex = ipToIndexMap.get(ip)!;
            results[originalIndex] = result;
            
            // Cache successful results
            if (result.code === 200) {
              ctx.waitUntil(env.IP_LOCATION_KV?.put(`ip_location:${ip}`, JSON.stringify(result), {
                expirationTtl: 300 // 5 minutes TTL
              }));
            }
          }
        }

        return Response.json({
          code: 200,
          msg: "批量查询完成",
          data: results,
          total: results.length
        }, {
          headers: getCORSHeaders(),
        });
      } catch {
        return Response.json({
          code: 400,
          msg: "请求格式错误",
          data: null
        }, {
          headers: getCORSHeaders(),
        });
      }
    }

    if (url.pathname === "/api/client-ip") {
      const clientIP = request.headers.get('CF-Connecting-IP') || 
                      request.headers.get('X-Forwarded-For') || 
                      'unknown';
      
      if (clientIP === 'unknown') {
        return Response.json({
          code: 400,
          msg: "无法获取客户端IP地址",
          ip: "",
          data: null
        }, {
          headers: getCORSHeaders(),
        });
      }
      
      // 直接查询客户端IP的位置信息
      const result = await fetchIPLocation(clientIP);
      
      return Response.json(result, {
        headers: getCORSHeaders(),
      });
    }

    return new Response('Not Found', { 
      status: 404,
      headers: getCORSHeaders(),
    });
  },
} satisfies ExportedHandler<Env>;
