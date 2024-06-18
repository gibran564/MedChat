'use client';

import { useState, useEffect } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

const validationSchema = Yup.object({
  email: Yup.string().email('Correo electrónico inválido').required('Campo obligatorio'),
  password: Yup.string().required('Campo obligatorio'),
});

function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    try {
      const response = await axios.post('/api/auth/signin', values);
      Swal.fire({
        title: "¡Inicio de Sesión Exitoso!",
        text: "Has iniciado sesión correctamente.",
        icon: "success",
        confirmButtonText: 'Continuar'
      }).then(() => {
        router.push('/dashboard');
      });
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Error al iniciar sesión');
      Swal.fire({
        title: "Error al Iniciar Sesión",
        text: `Ha ocurrido un error: ${error.response?.data?.message || 'Error desconocido al iniciar sesión'}. Por favor, verifica tus credenciales e intenta de nuevo o contacta soporte si el problema persiste.`,
        icon: "error",
        confirmButtonText: 'Reintentar'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900">Iniciar Sesión</h2>
        <Formik
          initialValues={{
            email: '',
            password: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-6">
                <label className="block text-gray-700">Correo electrónico</label>
                <Field
                  type="email"
                  name="email"
                  className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 mt-1" />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700">Contraseña</label>
                <Field
                  type="password"
                  name="password"
                  className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 mt-1" />
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  Iniciar Sesión
                </button>
              </div>
              {errorMessage && (
                <div className="mb-6 text-red-500 text-center">
                  {errorMessage}
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default LoginPage;
