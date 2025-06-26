import mongoose, { Connection } from 'mongoose'
interface Cache {
  conn: Connection | null
  promise: Promise<Connection> | null
}

// Extend the global object type
declare global {
  let mongoose: Cache | undefined
}

// Use global variable or initialize it
const globalWithMongoose = global as typeof globalThis & { mongoose?: Cache }

const cached: Cache = globalWithMongoose.mongoose || {
  conn: null,
  promise: null,
}

export default async function connectDB(): Promise<Connection> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI!)
      .then(m => m.connection)
  }

  try {
    cached.conn = await cached.promise
    globalWithMongoose.mongoose = cached
    return cached.conn
  } catch (err) {
    cached.promise = null
    throw err
  }
}
