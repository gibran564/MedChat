import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../../models/user';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI ?? '';
  if (!mongoUri) {
    throw new Error('Por favor, define la variable de entorno MONGODB_URI en tu archivo .env.local');
  }
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(mongoUri);
};

export async function GET(request: Request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ message: 'Correo electrónico no proporcionado' }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ exists: true }, { status: 200 });
  }

  return NextResponse.json({ exists: false }, { status: 200 });
}
