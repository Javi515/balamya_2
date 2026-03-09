const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;



        // Buscar usuario por email (case insensitive para evitar problemas)
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });



        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        // Verificar contraseña (Texto plano por ahora, como solicitado)
        if (user.password !== password) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Retornar usuario sin la contraseña
        const userResponse = {
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            name: user.fullName, // Compatibilidad con frontend que espera "name"
            email: user.email,
            role: user.role,
            photoUrl: user.photoUrl
        };

        res.json(userResponse);

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

module.exports = router;
