import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "./libs/mongodb";
import User from "@/app/models/user";
import bcrypt from "bcryptjs";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/app/libs/db";

interface User extends AdapterUser {
    password: string;
}

interface AdapterUser {
    id: string;
    name: string;
    email: string;
    emailVerified: Date | null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Correo Electronico" },
                password: { label: "Contraseña", type: "password" },
            },
            async authorize(credentials) {
                try {
                    await connectDB();
                    console.log("Conexión a la base de datos exitosa");

                    if (!credentials || typeof credentials.email !== 'string' || typeof credentials.password !== 'string') {
                        console.error("Credenciales inválidas:", credentials);
                        throw new Error("Usuario o contraseña invalido");
                    }

                    const userFound = await User.findOne({ email: credentials.email }).select('+password');
                    if (!userFound) {
                        console.error("Usuario no encontrado");
                        throw new Error("Usuario o contraseña invalido");
                    }

                    if (typeof userFound.password !== 'string') {
                        console.error("Contraseña del usuario no es una cadena:", userFound.password);
                        throw new Error("Usuario o contraseña invalido");
                    }

                    const passwordMatch = await bcrypt.compare(credentials.password, userFound.password);
                    if (!passwordMatch) {
                        console.error("Contraseña incorrecta");
                        throw new Error("Usuario o contraseña invalido");
                    }

                    console.log("Autenticación exitosa:", userFound);
                    return userFound;

                } catch (error) {
                    console.error("Error en la autorización:", error);
                    throw new Error("Usuario o contraseña invalido");
                }
            },
        }),
    ],
    adapter: MongoDBAdapter(clientPromise),
    callbacks: {
        async jwt({ account, token, user, profile, trigger, isNewUser, session }) {
            console.log({ account, token, user, profile });
            if (user) {
                token.user = user as AdapterUser;
            }
            return token;
        },
        async session({ session, token }) {
            console.log("Session Callback", { session, token });
            session.user = token.user as AdapterUser;
            return session;
        }
    }
});