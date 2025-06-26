import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'

const PromptBox = ({ setIsLoading, isLoading }) => {
  const [prompt, setPrompt] = useState('')
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
      className={`w-full ${
        false ? 'max-w-3xl' : 'max-w-2xl'
      } bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
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
