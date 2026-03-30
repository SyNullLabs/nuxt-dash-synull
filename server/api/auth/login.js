import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, turnstileToken } = body

  // 验证 Turnstile token
  let turnstileVerification
  try {
    turnstileVerification = await verifyTurnstileToken(turnstileToken)
  } catch (error) {
    console.error('Turnstile 验证请求失败', error)
    return {
      success: false,
      message: 'Turnstile 验证请求失败'
    }
  }

  if (!turnstileVerification.success) {
    return {
      success: false,
      message: 'Turnstile 验证失败'
    }
  }

  // 调用 yunyoo.cc 的登录 API
  try {
    const loginResponse = await $fetch(process.env.BACK_URL + '/login_pass_email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email, // 修改参数名为 email
        password: password // 修改参数名为 password
      })
    })

    if (loginResponse.status === 200) {
      // 登录成功
      return {
        success: true,
        jwt: loginResponse.jwt,
        message: loginResponse.msg
      }
    } else if (loginResponse.status === 400) {
      // 登录失败
      return {
        success: false,
        message: loginResponse.msg
      }
    } else {
      // 其他错误
      return {
        success: false,
        message: '未知错误',
        error: loginResponse
      }
    }
  } catch (error) {
    console.error('登录错误', error)
    return {
      success: false,
      message: error
    }
  }
})