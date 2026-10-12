import prisma from '../db/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ==========================================
// REGISTRO DE USUARIOS
// ==========================================
export const register = async (req, res) => {
  const { name, email, password, role_id } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
    }

    // Buscar si el correo ya existe
    const userExists = await prisma.users.findUnique({
      where: { email }
    });

    if (userExists) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Guardar en Postgres
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role_id: role_id || 2, // Por defecto rol ID 2 (Pasajer)
        is_active: true
      }
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      userId: newUser.id
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar.' });
  }
};

// ==========================================
// LOGIN DE USUARIOS
// ==========================================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }

    // Buscar usuario por email
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user || !user.is_active) {
      return res.status(400).json({ error: 'Credenciales inválidas o usuario inactivo.' });
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { id: user.id, role_id: user.role_id },
      process.env.JWT_SECRET || 'firma_secreta_onlybus_2026',
      { expiresIn: '30d' } // Expira en 30 días, ideal para la app móvil
    );

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
};