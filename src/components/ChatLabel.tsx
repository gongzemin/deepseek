import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'

// 使用接口定义props

// 定义 openMenu 的状态类型
type OpenMenuState = {
  id: number
  open: boolean
}

// 定义组件 Props 类型
interface ChatLabelProps {
  openMenu: OpenMenuState
  setOpenMenu?: (newState: OpenMenuState) => void // 接收完整状态对象
}

const ChatLabel: React.FC<ChatLabelProps> = ({ openMenu, setOpenMenu }) => {
  //
  console.log('set', setOpenMenu)
  return (
    <div
      className="flex items-center justify-between p-2 text-white/80
        hover:bg-white/10 rounded-lg text-sm group cursor-pointer"
    >
      <p className="group-hover:max-w-5/6 truncate">暂无历史对话</p>
      <div
        className="group relative flex items-center justify-center h-6 w-6 aspect-square
      hover:bg-black/80 rounded-lg"
      >
        <Image
          src={assets.three_dots}
          alt=""
          className={`w-4 ${openMenu.open ? '' : 'hidden'} group-hover:block`}
        />
        <div
          className={`absolute ${
            openMenu.open ? 'block' : 'hidden'
          } -right-32 top-6 bg-gray-700 rounded-xl w-max p-2`}
        >
          <div className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg">
            <Image src={assets.pencil_icon} alt="" className="w-4" />
            <p>重命名</p>
          </div>
          <div className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg">
            <Image src={assets.delete_icon} alt="" className="w-4" />
            <p>删除</p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ChatLabel
