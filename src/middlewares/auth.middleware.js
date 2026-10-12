import jwt from 'jsonwebtoken';

export const checkAuth = (req, res, next) => {

  // Leer el token del header: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  // Si no hay token o no tiene el formato correcto, bloquear la petición
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
  }

  // Quitar la palabra "Bearer " y quedarse solo con el token
  const token = authHeader.split(' ')[1];

  try {
    // Verificar que el token sea legítimo y no haya expirado
    // Si es falso o expirado, jwt.verify lanza una excepción y cae al catch
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'firma_secreta_onlybus_2026');

    // Inyectar los datos del usuario en req.user para que los controladores los usen
    // Así no hay que pedirle el ID al cliente, se lee directo del token
    req.user = {
      id: decoded.id,
      role_id: decoded.role_id
    };

    // Solo los Pasajeros (role_id = 2) pueden acceder a estas rutas
    if (decoded.role_id !== 2) {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Pasajero.' });
    }

    // Token válido y rol correcto → continuar al controlador
    next();

  } catch (error) {
    // jwt.verify falló: token falsificado, mal formado o expirado
    console.error('Error al verificar token:', error);
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};