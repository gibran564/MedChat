"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import { IoSendSharp } from "react-icons/io5";
import axios from "axios";

const MessageSchema = Yup.object().shape({
    message: Yup.string().required("Mensaje requerido"),
});

interface FormValues {
    message: string;
}

interface Message {
    role: string;
    content: string;
}

function HomePage() {
    const { data: session, status } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isInitialPromptSent, setIsInitialPromptSent] = useState<boolean>(false);
    const fetchUserData = async (userEmail: string) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/user/fetch?email=${userEmail}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error al obtener los datos del usuario:", error.response);
            } else {
                console.error("Error desconocido:", error);
            }
            return null;
        }
    };

    const sendPrompt = async (messages: Message[]) => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: messages.map(msg => msg.content).join('\n') }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error:", errorData.error);
                setMessages(prevMessages => [...prevMessages, { role: "bot", content: "Error: " + errorData.error }]);
                return;
            }

            const data = await response.json();
            console.log("API Response:", data);

            setMessages(prevMessages => [...prevMessages, { role: "bot", content: data.response }]);
        } catch (error: unknown) {
            console.error("Error:", error);
            if (error instanceof Error) {
                setMessages(prevMessages => [...prevMessages, { role: "bot", content: "Error: " + error.message }]);
            } else {
                setMessages(prevMessages => [...prevMessages, { role: "bot", content: "An unknown error occurred" }]);
            }
        }
    };

    useEffect(() => {
        const initializeUserPrompt = async () => {

            if (session?.user) {

                const userEmail = session.user.email || "";
                console.log("User ID:", userEmail);
                const userData = await fetchUserData(userEmail);
                console.log("Datos de usuario:", userData);
                if (userData) {
                    const { fullname, allergies, medications, medicalHistory, surgicalHistory, familyHistory } = userData;

                    const initialPrompt = `
Eres MedChat, un asistente médico virtual potenciado por inteligencia artificial. Tu objetivo es proporcionar orientación médica básica de manera empática y útil. Aquí están los detalles del usuario:
- Nombre: ${fullname}
- Alergias: ${allergies}
- Medicamentos actuales: ${medications}
- Historial médico: ${medicalHistory}
- Historial quirúrgico: ${surgicalHistory}
- Historial familiar: ${familyHistory}

Utiliza estos detalles para personalizar y humanizar la interacción. A continuación se muestra un flujo de interacción típico que debes seguir:

1. **Verificación del Usuario**: "Hola, ¿eres ${fullname} o alguien más está usando esta cuenta?"
2. **Saludo Inicial**: 
   - Si es el usuario principal: "Hola ${fullname}, es un placer verte de nuevo. ¿Cómo puedo ayudarte hoy?"
   - Si es otro usuario: "Hola, estoy aquí para ayudar. ¿Cómo te llamas?"

3. **Recopilación de Información**: (Nota: Espera a que el usuario responda cada pregunta antes de proceder a la siguiente.)
   - "¿Cuáles son tus síntomas principales?"
   - "¿Cuándo comenzaron estos síntomas?"
   - "¿Hay algún historial médico relevante que deba conocer? Según nuestros registros, tienes: ${medicalHistory}. ¿Hay algo que desees actualizar o agregar?"
   - "¿Estás tomando algún medicamento actualmente? Nuestros registros indican que estás tomando: ${medications}. ¿Hay alguna actualización o medicamento nuevo que debamos registrar?"
   - "¿Tienes alguna alergia conocida? Nuestros registros muestran que tienes alergias a: ${allergies}. ¿Hay alguna actualización o nueva alergia que debamos registrar?"
   - "¿Has tenido alguna cirugía o procedimiento médico en el pasado? Nuestros registros dicen que has tenido: ${surgicalHistory}. ¿Hay algo nuevo que agregar o actualizar?"
   - "¿Hay algún otro detalle que consideres importante mencionar?"

4. **Recomendaciones Básicas**: 
   - "Gracias por compartir esta información. Basándome en lo que has mencionado, te recomiendo que... Recuerda que mi orientación no sustituye una consulta médica real. Es importante que consultes a un médico para un diagnóstico y tratamiento precisos."

5. **Pregunta Final**: "¿Te gustaría recibir un reporte de tu estado actual basado en esta conversación?"

6. **Generación de Reporte** (si el usuario lo solicita): 
   - "Claro, aquí tienes tu reporte:
     - Reporte Médico de MedChat:
     - Nombre del Paciente: ${fullname}
     - Síntomas: [Descripción de los síntomas]
     - Fecha de inicio de síntomas: [Fecha]
     - Historial médico: ${medicalHistory}
     - Medicamentos actuales: ${medications}
     - Alergias: ${allergies}
     - Procedimientos médicos previos: ${surgicalHistory}
     - Recomendación: Consultar a un médico real para un diagnóstico y tratamiento precisos."

Recuerda siempre ser educado, profesional, y enfatizar la importancia de consultar a un médico real para obtener una atención adecuada. Además, muestra empatía y comprensión durante toda la conversación para mejorar la experiencia del usuario. Si has entendido el flujo de interacción, comienza a interactuar como MedChat.
`;


                    console.log(initialPrompt);
                        setMessages([{role: "system", content: initialPrompt}]);
                        sendPrompt([{role: "system", content: initialPrompt}]);
                    }else{
                    console.error("No se pudo obtener los datos del usuario.");
                }

                }
            }
            ;

        if (!isInitialPromptSent && session?.user?.email) {
            setIsInitialPromptSent(true);
            initializeUserPrompt();
        }
    }, [session, isInitialPromptSent]);

    const handleSubmit = async (values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
        const userMessage: Message = { role: "user", content: values.message };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        sendPrompt(newMessages);

        resetForm();
    };

    if (status === "loading") {
        return <div>Cargando...</div>;
    }

    if (!session) {
        return (
            <div className="flex h-screen justify-center items-center bg-gray-800 text-white">
                <button onClick={() => signIn()} className="bg-blue-500 p-4 rounded">Iniciar sesión</button>
            </div>
        );
    }
    return (
        <div className="flex h-screen bg-gray-800">
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-4 text-xl font-bold border-b border-gray-700">MedChat</div>
                <div className="flex-grow overflow-y-auto">

                </div>
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 mr-4"></div>
                        <div className="text-lg">{session.user?.name}</div>
                    </div>
                </div>
            </aside>
            <main className="flex flex-col flex-grow bg-gray-700 text-white">
                <div className="p-4 text-xl font-bold border-b border-gray-600">Medchat. Tu IA medica de confianza</div>
                <div className="flex-grow p-4 overflow-y-auto">
                    {messages.filter(msg => msg.role !== "system").length > 0 ? (
                        messages.filter(msg => msg.role !== "system").map((message, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg my-2 text-sm whitespace-pre-wrap ${
                                    message.role === "user" ? "bg-blue-700 dark:bg-blue-800 text-white self-end" : "bg-gray-500 dark:bg-gray-600 text-gray-300 self-start"
                                }`}
                            >
                                {message.content}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400">No hay mensajes aún.</p>
                    )}
                </div>
                <div className="p-4 border-t border-gray-600">
                    <Formik
                        initialValues={{ message: "" }}
                        validationSchema={MessageSchema}
                        onSubmit={handleSubmit}
                    >
                        <Form className="flex">
                            <Field
                                name="message"
                                type="text"
                                className="flex-grow p-3 border border-gray-600 dark:border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700"
                                placeholder="Escribe tu mensaje..."
                            />
                            <button type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-md transition duration-150 ease-in-out">
                                <IoSendSharp />
                            </button>
                        </Form>
                    </Formik>
                </div>
            </main>
        </div>
    );
}

export default HomePage;
