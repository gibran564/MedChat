import connectDB from '@/utils/dbConnect';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/app/models/user';

export async function DELETE(req: NextRequest) {
    try {
        // Verificar si el método de la solicitud es DELETE
        if (req.method !== 'DELETE') {
            return NextResponse.json({ message: 'Método no permitido' }, { status: 405 });
        }

        const body = await req.json();
        console.log('Cuerpo de la solicitud:', body); // Agregar esta línea para depuración

        const { email } = body;

        if (!email) {
            return NextResponse.json({ message: 'Email es requerido' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOneAndDelete({ email: email });

        if (!user) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Usuario eliminado correctamente' }, { status: 200 });
    } catch (error) {
        console.error('Error al eliminar el usuario:', error); // Añadir detalles de depuración
        return NextResponse.json({ message: 'Error interno del servidor', error }, { status: 500 });
    }
}
