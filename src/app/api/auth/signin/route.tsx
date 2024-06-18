"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

export default function SignIn() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            console.error("Error al iniciar sesión:", result.error);
        } else {
            // Redirigir a la página principal u otra página
            window.location.href = "/";
        }
    };

    const handleGoogleSignIn = async () => {
        await signIn("google", { callbackUrl: "/" });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
            <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Inicio de sesión</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="mt-4">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                            Iniciar sesión
                        </button>
                    </div>
                </form>
                <div className="mt-4">
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                    >
                        Iniciar sesión con Google
                    </button>
                </div>
            </div>
        </div>
    );
}
