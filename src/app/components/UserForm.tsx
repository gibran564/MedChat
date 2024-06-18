import { useState, useRef, useEffect } from 'react';
import { IUser } from '../models/user';
import axios from 'axios';
import Swal from 'sweetalert2';
import {signOut} from "next-auth/react";

interface IUserForm {
    email: string;
    fullname: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    allergies: string[];
    medications: string[];
    medical_history: string;
    surgical_history: string[];
    family_history: string;
    last_checkup: Date;
    currentPassword?: string;
    newPassword?: string;
    repeatNewPassword?: string;
}

const UserForm = ({ user }: { user: IUser }) => {
    const [formData, setFormData] = useState<IUserForm>({
        email: user.email,
        fullname: user.fullname,
        age: user.age,
        gender: user.gender,
        allergies: user.allergies,
        medications: user.medications,
        medical_history: user.medical_history,
        surgical_history: user.surgical_history,
        family_history: user.family_history,
        last_checkup: user.last_checkup,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const medicalHistoryRef = useRef<HTMLTextAreaElement>(null);
    const surgicalHistoryRef = useRef<HTMLTextAreaElement>(null);
    const familyHistoryRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        autoResizeTextarea(medicalHistoryRef.current);
        autoResizeTextarea(surgicalHistoryRef.current);
        autoResizeTextarea(familyHistoryRef.current);
    }, [isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value } as Pick<IUserForm, keyof IUserForm>);
    };

    const handleArrayChange = (name: keyof IUserForm, value: string, action: 'add' | 'remove') => {
        if (action === 'add' && Array.isArray(formData[name])) {
            setFormData({
                ...formData,
                [name]: [...(formData[name] as string[]), value]
            });
        } else if (action === 'remove' && Array.isArray(formData[name])) {
            setFormData({
                ...formData,
                [name]: (formData[name] as string[]).filter((item: string) => item !== value)
            });
        }
    };

    const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const handleSave = async () => {
        try {
            await axios.post(`/api/user/update`, formData);
            Swal.fire('Éxito', 'Datos actualizados correctamente', 'success');
            setIsEditing(false);
        } catch (error) {
            Swal.fire('Error', 'No se pudieron actualizar los datos', 'error');
        }
    };

    const handlePasswordUpdate = async () => {
        const { email, currentPassword, newPassword, repeatNewPassword } = formData;

        if (newPassword !== repeatNewPassword) {
            Swal.fire('Error', 'Las nuevas contraseñas no coinciden', 'error');
            return;
        }

        try {
            await axios.post(`/api/user/update/password`, { email, currentPassword, newPassword });
            Swal.fire('Éxito', 'Contraseña actualizada correctamente', 'success');
            setIsChangingPassword(false);
            setFormData({ ...formData, currentPassword: '', newPassword: '', repeatNewPassword: '' });
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar la contraseña', 'error');
        }
    };


    const handleDelete = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar cuenta'
        }).then((result) => {
            if (result.isConfirmed) {
                axios({
                    method: 'delete',
                    url: '/api/user/delete',
                    data: { email: user.email },
                    headers: { 'Content-Type': 'application/json' }
                }).then(() => {
                    Swal.fire('Eliminada', 'Tu cuenta ha sido eliminada', 'success').then(() => {
                        signOut({ callbackUrl: '/login' }); // Desloguear al usuario y redirigir
                    });
                }).catch((error) => {
                    Swal.fire('Error', 'No se pudo eliminar la cuenta', 'error');
                });
            }
        });
    };


    return (
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Panel de Usuario</h2>
            <form className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="fullname" className="block text-gray-700 text-sm font-bold mb-2">Nombre Completo:</label>
                    <input
                        type="text"
                        id="fullname"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="age" className="block text-gray-700 text-sm font-bold mb-2">Edad:</label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">Género:</label>
                    <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label htmlFor="allergies" className="block text-gray-700 text-sm font-bold mb-2">Alergias:</label>
                    {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                            {formData.allergies.map((allergy, index) => (
                                <div key={index} className="bg-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 flex items-center">
                                    {allergy}
                                    <button type="button" onClick={() => handleArrayChange('allergies', allergy, 'remove')} className="ml-2 text-red-500">x</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => {
                                const newAllergy = prompt('Nueva alergia');
                                if (newAllergy) {
                                    handleArrayChange('allergies', newAllergy, 'add');
                                }
                            }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">+</button>
                        </div>
                    ) : (
                        <div className="text-gray-700">
                            {formData.allergies.length > 0 ? formData.allergies.join(', ') : 'No tiene alergias'}
                        </div>
                    )}
                </div>
                <div className="col-span-2">
                    <label htmlFor="medications" className="block text-gray-700 text-sm font-bold mb-2">Medicamentos:</label>
                    {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                            {formData.medications.map((medication, index) => (
                                <div key={index} className="bg-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 flex items-center">
                                    {medication}
                                    <button type="button" onClick={() => handleArrayChange('medications', medication, 'remove')} className="ml-2 text-red-500">x</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => {
                                const newMedication = prompt('Nuevo medicamento');
                                if (newMedication) {
                                    handleArrayChange('medications', newMedication, 'add');
                                }
                            }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">+</button>
                        </div>
                    ) : (
                        <div className="text-gray-700">
                            {formData.medications.length > 0 ? formData.medications.join(', ') : 'No toma medicamentos'}
                        </div>
                    )}
                </div>
                <div className="col-span-2">
                    <label htmlFor="medical_history" className="block text-gray-700 text-sm font-bold mb-2">Historial Médico:</label>
                    <textarea
                        id="medical_history"
                        name="medical_history"
                        value={formData.medical_history}
                        onChange={handleInputChange}
                        onInput={() => autoResizeTextarea(medicalHistoryRef.current)}
                        ref={medicalHistoryRef}
                        disabled={!isEditing}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="col-span-2">
                    <label htmlFor="surgical_history" className="block text-gray-700 text-sm font-bold mb-2">Historial Quirúrgico:</label>
                    <textarea
                        id="surgical_history"
                        name="surgical_history"
                        value={formData.surgical_history}
                        onChange={handleInputChange}
                        onInput={() => autoResizeTextarea(surgicalHistoryRef.current)}
                        ref={surgicalHistoryRef}
                        disabled={!isEditing}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="col-span-2">
                    <label htmlFor="family_history" className="block text-gray-700 text-sm font-bold mb-2">Historial Familiar:</label>
                    <textarea
                        id="family_history"
                        name="family_history"
                        value={formData.family_history}
                        onChange={handleInputChange}
                        onInput={() => autoResizeTextarea(familyHistoryRef.current)}
                        ref={familyHistoryRef}
                        disabled={!isEditing}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="last_checkup" className="block text-gray-700 text-sm font-bold mb-2">Último Chequeo:</label>
                    <input
                        type="date"
                        id="last_checkup"
                        name="last_checkup"
                        value={new Date(formData.last_checkup).toISOString().substring(0, 10)}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                {isChangingPassword && (
                    <>
                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="currentPassword" className="block text-gray-700 text-sm font-bold mb-2">Contraseña Actual:</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">Nueva Contraseña:</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="repeatNewPassword" className="block text-gray-700 text-sm font-bold mb-2">Repetir Nueva Contraseña:</label>
                            <input
                                type="password"
                                id="repeatNewPassword"
                                name="repeatNewPassword"
                                value={formData.repeatNewPassword}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                    </>
                )}
                <div className="col-span-2 sm:col-span-1 flex flex-col space-y-2">
                    {isEditing ? (
                        <>
                            <button type="button" onClick={handleSave} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                Guardar
                            </button>
                            <button type="button" onClick={() => setIsEditing(false)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <button type="button" onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Editar
                        </button>
                    )}
                    {isChangingPassword ? (
                        <>
                            <button type="button" onClick={handlePasswordUpdate} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                Guardar Contraseña
                            </button>
                            <button type="button" onClick={() => setIsChangingPassword(false)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <button type="button" onClick={() => setIsChangingPassword(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Cambiar Contraseña
                        </button>
                    )}
                </div>
                <div className="col-span-2 sm:col-span-1 flex flex-col space-y-2">
                    <button type="button" onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        Eliminar Cuenta
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
