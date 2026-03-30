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

  try {
    const infoResponse = await $fetch(process.env.BACK_URL + '/user_info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': authorization
      }
    })

    if (infoResponse.status === 200) {
      // 对手机号进行打码处理
      if (infoResponse.user && infoResponse.user.phonenumber) {
        const phone = infoResponse.user.phonenumber
        infoResponse.user.phonenumber = phone.replace(/(\d{2})\d{6}(\d{1})/, '$1*******$2')
      }

      return {
        success: true,
        data: infoResponse,
        message: '成功获取用户信息'
      }
    } else {
      return {
        success: false,
        message: infoResponse.msg || '获取用户信息失败'
      }
    }
  } catch (error) {
    console.error('获取用户信息时发生错误', error)
    return {
      success: false,
      message: '获取用户信息过程中发生错误'
    }
  }
})