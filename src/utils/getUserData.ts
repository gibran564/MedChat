import mongoose from 'mongoose';
import User, { IUser } from '@/app/models/user';

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost/medchat';
    if (!mongoUri) {
        throw new Error('Por favor, define la variable de entorno MONGODB_URI en tu archivo .env.local');
    }
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(mongoUri);
};

const getUserData = async (userId: string | undefined): Promise<{ fullname: string, allergies: string[], medications: string[], medicalHistory: string, surgicalHistory: string[], familyHistory: string } | null> => {
    try {
        await connectDB();

        if (!userId) {
            throw new Error('ID de usuario no proporcionado');
        }

        // Convierte el userId a ObjectId
        let objectId: mongoose.Types.ObjectId;
        try {
            objectId = new mongoose.Types.ObjectId(userId);
        } catch (error) {
            throw new Error('ID de usuario inválido');
        }

        const user = await User.findById(objectId).select('fullname allergies medications medical_history surgical_history family_history').lean().exec();
        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Estructura el objeto userData para retornar solo la información necesaria
        const userData = {
            fullname: user.fullname,
            allergies: user.allergies,
            medications: user.medications,
            medicalHistory: user.medical_history,
            surgicalHistory: user.surgical_history,
            familyHistory: user.family_history
        };

        console.log("User data:", userData);
        return userData;

    } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        return null;
    }
};

export default getUserData;
