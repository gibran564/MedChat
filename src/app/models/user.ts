import { Schema, model, models, Document, Model } from 'mongoose';

// Definición de la interfaz de usuario extendiendo Document
export interface IUser extends Document {
  email: string;
  password: string;
  fullname: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  allergies: string[];
  medications: string[];
  medical_history: string;
  surgical_history: string[];
  family_history: string;
  last_checkup: Date;
}

// Definición del esquema de usuario
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    unique: true,
    required: true,
    match: [
      /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      'Por favor, introduce un correo electrónico válido',
    ],
    index: true, // Mejora el rendimiento en consultas por email
  },
  password: {
    type: String,
    required: [true, "Se requiere una contraseña para continuar"],
    select: false,
    minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
    validate: {
      validator: function(v: string) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/.test(v);
      },
      message: props => `${props.value} no es una contraseña segura`
    }
  },
  fullname: {
    type: String,
    required: [true, "Nombre completo es requerido"],
    minLength: [3, "El nombre requiere al menos 3 caracteres"],
    maxLength: [50, "El nombre requiere máximo 50 caracteres"],
  },
  age: {
    type: Number,
    required: true,
    min: [0, "La edad no puede ser menor a 0"],
    max: [120, "La edad no puede ser mayor a 120"]
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  allergies: {
    type: [String],
    default: [],
  },
  medications: {
    type: [String],
    default: [],
  },
  medical_history: {
    type: String,
    default: '',
  },
  surgical_history: {
    type: [String],
    default: [],
  },
  family_history: {
    type: String,
    default: '',
  },
  last_checkup: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true // Agrega automáticamente campos createdAt y updatedAt
});

// Creación del modelo de usuario
const User: Model<IUser> = models.User || model<IUser>('User', userSchema);

console.log('models:', models);
console.log('user:', User);

export default User;
