import connectDB from '@/utils/dbConnect';
import {NextRequest, NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/app/models/user';

export async function POST(req: NextRequest) {
    try {
        const { email, currentPassword, newPassword } = await req.json();

        if (!email || !currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email: email }).select('+password');

        if (!user) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }

        if (!user.password) {
            return NextResponse.json({ message: 'Contraseña actual no encontrada en el perfil del usuario' }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return NextResponse.json({ message: 'Contraseña actual incorrecta' }, { status: 401 });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return NextResponse.json({ message: 'Contraseña actualizada correctamente' }, { status: 200 });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        return NextResponse.json({ message: 'Error interno del servidor', error }, { status: 500 });
    }
}
