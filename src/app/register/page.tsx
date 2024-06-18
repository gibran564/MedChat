'use client';

import { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import {models} from "mongoose";

const validationSchema = Yup.object({
  email: Yup.string().email('Correo electrónico inválido').required('Campo obligatorio'),
  password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('Campo obligatorio'),
  fullname: Yup.string().required('Campo obligatorio'),
  age: Yup.number().required('Campo obligatorio').positive('Debe ser un número positivo').integer('Debe ser un número entero'),
  gender: Yup.string().required('Campo obligatorio'),
  allergies: Yup.string(),
  medications: Yup.array().of(Yup.string()).required('Campo obligatorio'),
  medical_history: Yup.string(),
  surgical_history: Yup.string(),
  family_history: Yup.string(),
  last_checkup: Yup.date().required('Campo obligatorio'),
  medicationInput: Yup.string()
});

function RegisterPage() {
  const router = useRouter(); // Usar el hook de next/navigation

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [emailValid, setEmailValid] = useState(false);

  const handleMedicationInputChange = debounce(async (value: string, setFieldValue: any, medications: string[]) => {
    if (value.length > 2) {
      try {
        const response = await axios.get(`https://cima.aemps.es/cima/rest/medicamentos?nombre=${value}`);
        if (Array.isArray(response.data)) {
          const newSuggestions = response.data.map((med: any) => med.nombre).filter((name: string) => !medications.includes(name));
          setSuggestions(newSuggestions);
        }
      } catch (error) {
        Swal.fire({
          title: "Error al Obtener Sugerencias",
          text: "No se pudieron obtener sugerencias de medicamentos. Verifica tu conexión a internet o intenta de nuevo más tarde.",
          icon: "error",
          confirmButtonText: 'Reintentar'
        });
      }
    } else {
      setSuggestions([]);
    }
  }, 300);

  const handleSelectSuggestion = (suggestion: string, setFieldValue: any, values: any) => {
    setFieldValue('medications', [...values.medications, suggestion]);
    setFieldValue('medicationInput', '');
    setSuggestions([]);
  };

  const handleRemoveMedication = (index: number, values: any, setFieldValue: any) => {
    const newMedications = [...values.medications];
    newMedications.splice(index, 1);
    setFieldValue('medications', newMedications);
  };

  const handleSubmit = async (values: any) => {
    const data = {
      ...values,
      allergies: values.allergies.split(',').map((item: string) => item.trim()),
      surgical_history: values.surgical_history.split(',').map((item: string) => item.trim()),
    };

    try {
      const response = await axios.post('/api/auth/signup', data);
      Swal.fire({
        title: "¡Registro Exitoso!",
        text: "Tu cuenta ha sido creada con éxito. ¡Bienvenido a bordo!",
        icon: "success",
        confirmButtonText: 'Continuar'
      }).then(() => {
        router.push('/api/auth/signin');
      });
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Error al registrar');
      Swal.fire({
        title: "Error al Registrar",
        text: `Ha ocurrido un error: ${error.response?.data?.message || 'Error desconocido al registrar'}. Por favor, verifica tus datos e intenta de nuevo o contacta soporte si el problema persiste.`,
        icon: "error",
        confirmButtonText: 'Reintentar'
      });
    }
  };

  const nextStep = async (values: any) => {
    console.log(models)
    if (step === 1) {
      try {

        const response = await axios.get(`/api/auth/check-email?email=${values.email}`);
        if (response.data.exists) {
          setErrorMessage('El correo electrónico ya está registrado');
        } else {
          setEmailValid(true);
          setErrorMessage(null);
          setStep(step + 1);
        }
      } catch (error: any) {
        setErrorMessage('Error al verificar el correo electrónico');
        Swal.fire({
          title: "Error al Verificar correo electronico",
          text: `Ha ocurrido un error: ${error.response?.data?.message || 'Error desconocido al verificar correo electronico'}. Por favor, intenta de nuevo o contacta soporte si el problema persiste.`,
          icon: "error",
          confirmButtonText: 'Reintentar'
        });
      }
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const isStepOneValid = (values: any) => {
    return values.email && values.password && values.fullname && values.gender && values.age && emailValid;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900">Registro</h2>
        <Formik
          initialValues={{
            email: '',
            password: '',
            fullname: '',
            age: '',
            gender: '',
            allergies: '',
            medications: [],
            medical_history: '',
            surgical_history: '',
            family_history: '',
            last_checkup: '',
            medicationInput: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form>
              {step === 1 && (
                <div>
                  <h3 className="text-xl font-bold mb-4 text-center">Datos Personales</h3>
                  <div className="mb-6">
                    <label className="block text-gray-700">Correo electrónico</label>
                    <Field
                      type="email"
                      name="email"
                      className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onBlur={async (e: React.FocusEvent<HTMLInputElement>) => {
                        const email = e.target.value;
                        if (email) {
                          try {
                            const response = await axios.get(`/api/auth/check-email?email=${email}`);
                            setEmailValid(!response.data.exists);
                            if (response.data.exists) {
                              setErrorMessage('El correo electrónico ya está registrado');
                            } else {
                              setErrorMessage(null);
                            }
                          } catch (error: any) {
                            setErrorMessage('Error al verificar el correo electrónico');
                            Swal.fire({
                              title: "Error al Verificar correo electronico",
                              text: `Ha ocurrido un error: ${error.response?.data?.message || 'Error desconocido al verificar correo electronico'}. Por favor, intenta de nuevo o contacta soporte si el problema persiste.`,
                              icon: "error",
                              confirmButtonText: 'Reintentar'
                            });
                          }
                        }
                      }}
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
                  <div className="mb-6">
                    <label className="block text-gray-700">Nombre completo</label>
                    <Field
                      type="text"
                      name="fullname"
                      className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="fullname" component="div" className="text-red-500 mt-1" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700">Edad</label>
                    <Field
                      type="number"
                      name="age"
                      className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="age" component="div" className="text-red-500 mt-1" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700">Género</label>
                    <Field
                      as="select"
                      name="gender"
                      className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona tu género</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                    </Field>
                    <ErrorMessage name="gender" component="div" className="text-red-500 mt-1" />
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isStepOneValid(values) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => nextStep(values)}
                      disabled={!isStepOneValid(values)}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <h3 className="text-xl font-bold mb-4 text-center">Perfil Médico</h3>
                  <div className="mb-6">
                    <label className="block text-gray-700">Alergias</label>
                    <Field
                      type="text"
                      name="allergies"
                      className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="allergies" component="div" className="text-red-500 mt-1" />
                  </div>
                  <div className="mb-6 relative">
                    <label className="block text-gray-700">Medicamentos</label>
                    <div className="flex items-center">
                      <Field
                        type="text"
                        name="medicationInput"
                        className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue('medicationInput', e.target.value);
                          handleMedicationInputChange(e.target.value, setFieldValue, values.medications);
                        }}
                      />
                      <button
                        type="button"
                        className="ml-2 mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
                        onClick={() => handleSelectSuggestion(values.medicationInput, setFieldValue, values)}
                      >
                        +
                      </button>
                    </div>
                    {suggestions.length > 0 && (
                      <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-10">
                        {suggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            onClick={() => handleSelectSuggestion(suggestion, setFieldValue, values)}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700">Medicamentos seleccionados</label>
                    <div className="mt-2">
                      {values.medications.map((medication: string, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-gray-100 px-4 py-2 mb-2 rounded-md">
                          <span>{medication}</span>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveMedication(index, values, setFieldValue)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <ErrorMessage name="medications" component="div" className="text-red-500 mt-1" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700">Historial médico</label>
                    <Field
                      as="textarea"
                      name="medical_history"
                      className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="medical_history" component="div" className="text-red-500 mt-1" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700">Historial quirúrgico</label>
                    <Field
                      as="textarea"
                      name="surgical_history"
                      className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="surgical_history" component="div" className="text-red-500 mt-1" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700">Historial familiar</label>
                    <Field
                      as="textarea"
                      name="family_history"
                      className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="family_history" component="div" className="text-red-500 mt-1" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700">Último chequeo</label>
                    <Field
                      type="date"
                      name="last_checkup"
                      className="mt-2 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="last_checkup" component="div" className="text-red-500 mt-1" />
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={prevStep}
                    >
                      Anterior
                    </button>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-2"
                      disabled={isSubmitting}
                    >
                      Registrarse
                    </button>
                  </div>
                </div>
              )}
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

export default RegisterPage;
