'use client'
import { useState } from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import Sidebar from '@/components/Sidebar'
import PromptBox from '@/components/PromptBox'
import Message from '@/components/Message'
export default function Home() {
  // 定义一个状态变量expand，初始值为false
  const [expand, setExpand] = useState(false)
  // 定义一个状态变量messages，初始值为空数组
  const [messages] = useState([]) // messages
  // 定义一个状态变量isLoading，初始值为false
  const [isLoading, setIsLoading] = useState(false)
  return (
    <div>
      <div className="flex h-screen">
        <Sidebar expand={expand} setExpand={setExpand} />
        <div className="flex-1 flex flex-col justify-center items-center px-4 pb-8 bg-[#282a2e] text-white relative">
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            <Image
              className="rotate-180"
              onClick={() => (expand ? setExpand(false) : setExpand(true))}
              src={assets.menu_icon}
              alt=""
            />
            <Image className="opacity-70" src={assets.chat_icon} alt="" />
          </div>

          {messages.length !== 0 ? (
            <>
              <div className="flex items-center gap-3">
                <Image
                  className="w-16 h-14"
                  src={assets.logo_icon}
                  alt="DeepSeek Logo"
                />
                <p className="text-2xl font-medium">
                  我是 DeepSeek，很高兴见到你！
                </p>
              </div>
              <p className="text-sm mt-2">
                我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧~
              </p>
            </>
          ) : (
            <div>
              <Message role="user" content="你看起来年轻漂亮。" />
            </div>
          )}

          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
          <p className="text-xs absolute bottom-1 text-gray-500">
            内容由 AI 生成，请仔细甄别
          </p>
        </div>
      </div>
    </div>
  )
}
