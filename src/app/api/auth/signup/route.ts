import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../../models/user';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost/medchat';
  if (!mongoUri) {
    throw new Error('Por favor, define la variable de entorno MONGODB_URI en tu archivo .env.local');
  }
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(mongoUri);
};

export async function POST(request: Request) {
  await connectDB();

  const {
    email,
    password,
    fullname,
    age,
    gender,
    allergies,
    medications,
    medical_history,
    surgical_history,
    family_history,
    last_checkup,
  } = await request.json();

  // Validar datos recibidos
  if (!email || !password || !fullname || !age || !gender) {
    return NextResponse.json({ message: 'Todos los campos son obligatorios' }, { status: 400 });
  }

  // Comprobar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'El usuario ya existe' }, { status: 400 });
  }

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el nuevo usuario
  const newUser = new User({
    email,
    password: hashedPassword,
    fullname,
    age,
    gender,
    allergies: allergies || [],
    medications: medications || [],
    medical_history: medical_history || '',
    surgical_history: surgical_history || [],
    family_history: family_history || '',
    last_checkup: last_checkup || Date.now(),
  });

  try {
    await newUser.save();
    return NextResponse.json({ message: 'Registro exitoso' }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    return NextResponse.json({ message: 'Error al registrar el usuario' }, { status: 500 });
  }
}
