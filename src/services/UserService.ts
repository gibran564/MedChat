// src/services/UserService.ts
import mongoose from 'mongoose';
import User, { IUser } from '@/app/models/user';

class UserService {
    async connectDB() {
        const mongoUri = process.env.MONGODB_URI ?? '';
        if (!mongoUri) {
            throw new Error('Por favor, define la variable de entorno MONGODB_URI en tu archivo .env.local');
        }
        if (mongoose.connections[0].readyState) return;
        await mongoose.connect(mongoUri);
    }

    async updateUser(email: string, updateData: Partial<IUser>): Promise<IUser> {
        await this.connectDB();
        try {
            const user = await User.findOneAndUpdate({ email }, updateData, {
                new: true,
                runValidators: true,
            });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error al actualizar usuario: ${error.message}`);
            } else {
                throw new Error('Error desconocido al actualizar usuario');
            }
        }
    }
}

export default new UserService();
