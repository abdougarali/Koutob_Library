import mongoose from "mongoose";

type MongooseConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseConnection: MongooseConnection | undefined;
}

const cached = global.mongooseConnection ?? {
  conn: null,
  promise: null,
};

async function connect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "يرجى تحديد متغير البيئة MONGODB_URI في ملف .env.local للاتصال بقاعدة البيانات.",
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB ?? "koutob",
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function dbConnect() {
  global.mongooseConnection = cached;
  return connect();
}

























