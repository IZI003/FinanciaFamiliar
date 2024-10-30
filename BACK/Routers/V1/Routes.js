const { Router } = require('express');
const router = Router();
const authMiddleware = require('../../Services/auth');
const PerfilControllers = require('../../Controllers/PerfilControllers');
const RubroControllers = require('../../Controllers/RubroControllers');
const DeudaControllers = require('../../Controllers/DeudaControllers');

router
  .get('/usuarios/', authMiddleware, PerfilControllers.obtener)
  .get('/usuarios/:id', authMiddleware, PerfilControllers.obtenerporId)
  .put('/usuarios/:id', authMiddleware, PerfilControllers.actualizar)
  .post('/usuarios/', authMiddleware, PerfilControllers.insertar)
  .delete('/usuarios/:id', authMiddleware, PerfilControllers.eliminar)
  .post('/usuarios/iniciarSesion', PerfilControllers.iniciarSesion)

  .get('/rubro/', authMiddleware, RubroControllers.obtener)
  .get('/rubro/:id', authMiddleware, RubroControllers.obtenerporId)
  .put('/rubro/:id', authMiddleware, RubroControllers.actualizar)
  .post('/rubro/', authMiddleware, RubroControllers.insertar)
  .delete('/rubro/:id', authMiddleware, RubroControllers.eliminar)

  .get('/deuda/', authMiddleware, DeudaControllers.obtener)
  .get('/deuda/:id', authMiddleware, DeudaControllers.obtenerporId)
  .put('/deuda/:id', authMiddleware, DeudaControllers.actualizar)
  .post('/deuda/', authMiddleware, DeudaControllers.insertar)
  .delete('/deuda/:id', authMiddleware, DeudaControllers.eliminar);

module.exports = router;