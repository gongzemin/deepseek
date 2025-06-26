import { Webhook } from 'svix'
import connectDB from '@/config/db'
import User from '@/models/User'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Define SvixEvent type
interface SvixEvent {
  data: {
    id: string
    email_addresses: { email_address: string }[]
    first_name: string
    last_name: string
    image_url: string
  }
  type: 'user.created' | 'user.updated' | 'user.deleted'
}

export async function POST(req: NextRequest) {
  // 验证环境变量是否存在
  const signingSecret = process.env.SIGNING_SECRET
  if (!signingSecret) {
    return NextResponse.json(
      { error: 'Missing SIGNING_SECRET environment variable' },
      { status: 500 }
    )
  }

  const wh = new Webhook(signingSecret)
  const headerPayload = await headers()

  // Ensure the headers are not null before proceeding
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing required Svix headers' },
      { status: 400 }
    )
  }

  const svixHeaders = {
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
    'svix-signature': svixSignature,
  }

  // Get the payload and verify it
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Type the result of verify() to SvixEvent
  const { data, type } = wh.verify(body, svixHeaders) as SvixEvent

  // Prepare the user data to be saved in the database
  const userData = {
    _id: data.id,
    email: data.email_addresses[0].email_address,
    name: `${data.first_name} ${data.last_name}`,
    image: data.image_url,
  }

  await connectDB()

  // Handle the event types
  switch (type) {
    case 'user.created':
      await User.create(userData)
      break
    case 'user.updated':
      await User.findByIdAndUpdate(data.id, userData)
      break
    case 'user.deleted':
      await User.findByIdAndDelete(data.id)
      break
    default:
      break
  }

  return NextResponse.json({
    message: 'Event received',
  })
}
