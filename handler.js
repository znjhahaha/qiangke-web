// EdgeOne Pages Serverless 适配器（CommonJS 格式）
// 将 Serverless 函数请求转发到 Next.js 服务器

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = process.env.PORT || 3000

// 创建 Next.js 应用
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// 初始化标志
let isPrepared = false
let preparePromise = null

// 初始化 Next.js
function ensurePrepared() {
  if (!preparePromise) {
    preparePromise = app.prepare().then(() => {
      isPrepared = true
      console.log('✅ Next.js app prepared')
    }).catch((error) => {
      console.error('❌ Next.js app prepare failed:', error)
      throw error
    })
  }
  return preparePromise
}

// 导出 Serverless 函数处理器
module.exports.handler = async (event, context) => {
  try {
    // 确保 Next.js 已初始化
    if (!isPrepared) {
      await ensurePrepared()
    }
    try {
      // 解析请求
      const { path, httpMethod, headers, body, queryStringParameters } = event
      
      // 构建请求 URL
      const url = parse(path || '/', true)
      url.query = queryStringParameters || {}
      
      // 创建请求对象
      const req = {
        url: url.pathname + (url.search || ''),
        method: httpMethod || 'GET',
        headers: headers || {},
        body: body || null
      }
      
      // 创建响应对象
      let responseData = {
        statusCode: 200,
        headers: {},
        body: ''
      }
      
    const res = {
      statusCode: 200,
      headers: {},
      finished: false,
      setHeader: (key, value) => {
        res.headers[key] = value
      },
      getHeader: (key) => res.headers[key],
      writeHead: (statusCode, headers) => {
        res.statusCode = statusCode
        if (headers) {
          Object.assign(res.headers, headers)
        }
      },
      write: (chunk) => {
        responseData.body += chunk
      },
      end: (chunk) => {
        if (chunk) {
          responseData.body += chunk
        }
        responseData.statusCode = res.statusCode
        responseData.headers = res.headers
        res.finished = true
      },
      on: (event, callback) => {
        if (event === 'finish' && res.finished) {
          callback()
        }
      }
    }
    
    // 处理请求
    await handle(req, res, url)
    
    // 等待响应完成
    if (!res.finished) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
      
      return {
        statusCode: responseData.statusCode,
        headers: responseData.headers,
        body: responseData.body
      }
    } catch (error) {
      console.error('Handler error:', error)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: error.message,
          stack: dev ? error.stack : undefined
        })
      }
    }
  }
})

