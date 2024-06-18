"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { IUser } from '@/app/models/user';
import UserForm from '../components/UserForm';
import { useSession, signIn } from "next-auth/react";

const Dashboard = () => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<IUser | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userEmail = session?.user?.email as string;
            console.log("Session email:", userEmail);

            if (userEmail) {
                try {
                    const response = await axios.get(`/api/user/fetch?email=${userEmail}`);
                    setUser(response.data);
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        console.error("Error al obtener los datos del usuario:", error.response);
                    } else {
                        console.error("Error desconocido:", error);
                    }
                }
            }
        };

        fetchUser();
    }, [session]);

    if (status === "loading") {
        return <p>Cargando sesión...</p>;
    }

    if (!session) {
        return (
            <div>
                <h1>Dashboard de Usuario</h1>
                <p>No has iniciado sesión. <button onClick={() => signIn()}>Iniciar sesión</button></p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-blue-400 to-purple-500">
            {user ? (
                <UserForm user={user}/>
            ) : (
                <p>Cargando datos del usuario...</p>
            )}
        </div>
    );
};

export default Dashboard;
