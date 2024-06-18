import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/app/models/user';

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
    const userEmail = searchParams.get('email');

    console.log("Email recibido: ", userEmail);

    if (!userEmail) {
        return NextResponse.json({ error: 'Email de usuario no proporcionado' }, { status: 400 });
    }
    try {
        const user = await User.findOne({ email: userEmail });
        if (user) {
            const userWithIdAsString = { ...user.toObject(), _id: user.id.toString() };
            return NextResponse.json(userWithIdAsString, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }
    } catch (error) {
        console.error("Error al buscar usuario:", error);
        return NextResponse.json({ error: 'Error al buscar usuario' }, { status: 500 });
    }
}
