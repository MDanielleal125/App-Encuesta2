const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, cedula, password } = req.body;

    if (!name || !cedula || !password) {
      return res.status(400).json({ message: 'Nombre, cédula y contraseña son obligatorios' });
    }

    const existing = await prisma.user.findUnique({
      where: { cedula },
    });

    if (existing) {
      return res.status(409).json({ message: 'Ya existe un usuario con esa cédula' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Primer usuario del sistema será ADMIN, el resto USER
    const totalUsers = await prisma.user.count();
    const role = totalUsers === 0 ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        name,
        cedula,
        passwordHash,
        role,
      },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      cedula: user.cedula,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error registrando usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { cedula, password } = req.body;

    if (!cedula || !password) {
      return res.status(400).json({ message: 'Cédula y contraseña son obligatorios' });
    }

    const user = await prisma.user.findUnique({
      where: { cedula },
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        cedula: user.cedula,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        cedula: user.cedula,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el inicio de sesión' });
  }
});

module.exports = router;

