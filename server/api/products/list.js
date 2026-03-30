import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const headers = getHeaders(event)
  const authorization = "JWT " + headers['authorization']

  if (!authorization) {
    return {
      success: false,
      message: '未提供授权令牌'
    }
  }

  // 修改这里：使用可选链操作符安全地获取 groupid
  const groupid = event.node.req.url ? new URL(event.node.req.url, 'http://localhost').searchParams.get('groupid') : null;

  try {
    const infoResponse = await $fetch(process.env.BACK_URL + '/host/list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': authorization
      },
      // 只有当 groupid 存在且不为空字符串时才添加到参数中
      params: groupid ? { groupid } : {}
    })

    // 检查 infoResponse 是否为有效对象
    if (typeof infoResponse === 'object' && infoResponse !== null) {
      if (infoResponse.status === 200) {
        const data = Array.isArray(infoResponse.data) ? infoResponse.data : [];
        return {
          success: true,
          data: infoResponse,
          message: '成功获取产品列表'
        }
      } else {
        return {
          success: false,
          message: infoResponse.msg || '获取产品列表失败'
        }
      }
    } else {
      throw new Error('无效的响应数据');
    }
  } catch (error) {
    console.error('获取产品列表时发生错误', error)
    return {
      success: false,
      message: '获取产品列表过程中发生错误',
      error: error.message
    }
  }
})
