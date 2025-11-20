// EdgeOne Pages Node.js Functions Handler
// 适配 Next.js API 路由

/**
 * EdgeOne Pages Node.js Functions 处理函数
 * 这个文件用于适配 EdgeOne Pages 的 Node.js Functions 环境
 */
module.exports = async function handler(event, context) {
  try {
    // Next.js 的 API 路由会自动处理请求
    // 这个 handler 主要用于兼容 EdgeOne Pages 的 Node.js Functions
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Next.js API routes are handled by the framework',
        ready: true,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Handler error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}

