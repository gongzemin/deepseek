import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  FormEvent,
} from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import toast from 'react-hot-toast'
import axios from 'axios'

import { MessageType } from '@/types'

// 定义组件 props 类型
interface PromptBoxProps {
  setIsLoading: (isLoading: boolean) => void
  isLoading: boolean
}
const PromptBox: React.FC<PromptBoxProps> = ({ setIsLoading, isLoading }) => {
  console.log('PromptBox rendered', isLoading, setIsLoading)
  const [prompt, setPrompt] = useState<string>('')
  /*
  user: The authenticated user (type not specified in the code).
  chats: An array of chat objects.
  setChats: Updates the chats array.
  selectedChat: The currently selected chat.
  setSelectedChat: Updates the selected chat.
  */
  const { user, chats, setChats, selectedChat, setSelectedChat } =
    useAppContext() // 全局状态

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 如果按下的是回车键且没有按住 Shift 键，则发送消息
    // Shift + Enter 用于换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendPrompt(e)
    }
  }

  const sendPrompt = async (
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
  ) => {
    const promptCopy = prompt // 缓存当前输入的prompt，用于后续错误恢复
    try {
      // 前置校验：阻止默认事件、检查登录状态、检查是否正在加载、检查输入是否为空，若不满足条件则提示错误并终止函数。
      e.preventDefault() // 阻止事件默认行为（如表单提交导致的页面刷新）
      if (!user) return toast.error('登录开启对话')
      if (isLoading) return toast.error('等待响应')

      if (!prompt.trim()) {
        toast.error('请输入消息')
        return
      }

      setIsLoading(true) // 设置加载状态为 true，表示正在处理请求
      setPrompt('') // 清空输入框内容

      const userPrompt: MessageType = {
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
      }
      // 同时更新全局聊天列表（chats）和当前选中的聊天（selectedChat），确保本地状态与用户操作同步，先显示用户发送的消息

      // 更新全局聊天列表中当前选中的聊天记录
      setChats(prevChats =>
        prevChats.map(
          chat =>
            chat._id === selectedChat?._id // 找到当前选中的聊天（通过_id匹配）
              ? {
                  ...chat,
                  messages: [...chat.messages, userPrompt], // 添加用户消息到该聊天的消息列表
                }
              : chat // 其他聊天不修改
        )
      )

      // 单独更新当前选中的聊天记录（优化局部状态）
      setSelectedChat(prevChat => {
        if (!prevChat) return null // 确保prevChat存在
        return {
          ...prevChat,
          messages: [...prevChat.messages, userPrompt],
        }
      })

      const { data } = await axios.post('/api/chat/ai', {
        chatId: selectedChat?._id, // 当前聊天的唯一标识
        prompt, // 用户输入的消息内容
      })
      if (data.success) {
        // 1. 先将AI回复完整添加到全局聊天列表
        setChats(prevChats =>
          prevChats.map(chat =>
            chat._id === selectedChat?._id
              ? {
                  ...chat,
                  messages: [...chat.messages, data.data],
                }
              : chat
          )
        )

        // 2. 准备AI回复的"打字机效果"（逐字显示）
        const message = data.data.content // AI回复的完整内容
        const messageTokens = message.split(' ') // 将内容按空格分割为单词数组
        const assistantMessage: MessageType = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        }
        // 先添加一个空内容的助手消息到当前选中的聊天

        setSelectedChat(prevChat => {
          if (!prevChat) return null // 确保prevChat存在
          return {
            ...prevChat,
            messages: [...prevChat.messages, assistantMessage],
          }
        })
        // 3. 逐词显示AI回复（打字机效果）
        for (let i = 0; i < messageTokens.length; i++) {
          setTimeout(() => {
            // 拼接前i+1个单词作为当前显示的内容
            assistantMessage.content = messageTokens.slice(0, i + 1).join(' ')
            // 更新当前选中聊天的消息列表：替换最后一条（空消息）为当前拼接的内容
            setSelectedChat(prev => {
              if (!prev) return null // 确保prev存在
              const updatedMessages = [
                ...prev.messages.slice(0, -1),
                assistantMessage,
              ]
              return {
                ...prev,
                messages: updatedMessages,
              }
            })
          }, i * 100)
        }
      } else {
        toast.error(data.message)
        setPrompt(promptCopy) // Reset prompt if error
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '发送消息失败，请重试'
      )
    } finally {
      setIsLoading(false)
    }
    setPrompt('')
  }
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Without resetting to 'auto', the height won’t shrink when content is deleted.
      textarea.style.height = 'auto' // Reset height
      textarea.style.height = `${textarea.scrollHeight}px` // Set to scrollHeight
    }
  }, [prompt])
  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full ${
        selectedChat?.messages.length ? 'max-w-3xl' : 'max-w-2xl'
      } bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        ref={textareaRef}
        className="outline-none w-full resize-none overflow-y-auto break-words bg-transparent max-h-[336px] text-white"
        rows={2}
        placeholder="给 DeepSeek 发送消息"
        required
        onChange={e => setPrompt(e.target.value)}
        value={prompt}
      />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p
            className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer
             hover:bg-gray-500/20 transition"
          >
            <Image className="h-5" src={assets.deepthink_icon} alt="" />
            深度思考 (R1)
          </p>
          <p
            className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer
             hover:bg-gray-500/20 transition"
          >
            <Image className="h-5" src={assets.search_icon} alt="" />
            联网搜索
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="" />
          <button
            className={`${prompt ? 'bg-primary' : 'bg-[#71717a]'}
           rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
            />
          </button>
        </div>
      </div>
    </form>
  )
}
export default PromptBox
