const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Texto plano por ahora
    role: { type: String, required: true }, // admin, aves, mamiferos, etc.
    digitalSignature: { type: String }, // URL o código

    // Perfil
    phone: String,
    address: String,
    // Perfil
    phone: String,
    address: String,
    cedula: String,
    photoUrl: String,
    bio: String,

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuarios', UserSchema);
