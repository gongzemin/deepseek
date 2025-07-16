export const maxDuration = 60
import Chat from '@/models/Chat'
import OpenAI from 'openai'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/config/db'

interface ExtendedChatMessage extends OpenAI.ChatCompletionMessage {
  timestamp: number
}

// 初始化OpenAI客户端，配置DeepSeek API
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
})

// 处理POST请求
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req) // 从请求中获取用户ID
    // 从请求体中提取chatId和prompt
    const { chatId, prompt } = await req.json()

    // 检查用户是否授权
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '用户未授权',
      })
    }

    // 连接数据库并查找聊天记录
    await connectDB()
    const data = await Chat.findOne({ userId, _id: chatId })

    // 创建用户消息对象
    const userPrompt = {
      role: 'user',
      content: prompt,
      timestamp: Date.now(), // 添加时间戳
    }
    data.messages.push(userPrompt) // 将用户消息添加到聊天记录

    // 调用DeepSeek API获取聊天回复
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'deepseek-chat',
      store: true, // 是否存储
    })

    // 获取AI回复的消息
    const message = {
      ...completion.choices[0].message,
      timestamp: Date.now(),
    } as ExtendedChatMessage

    // 将AI回复添加到聊天记录并保存
    data.messages.push(message)
    data.save()

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: message,
    })
  } catch (error) {
    // 错误处理
    let errorMessage = '聊天回复失败'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json({
      success: false,
      error: errorMessage,
    })
  }
}
