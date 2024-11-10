const { Router } = require('express');
const router = Router();
const authMiddleware = require('../../Services/auth');
const PerfilControllers = require('../../Controllers/PerfilControllers');
const RubroControllers = require('../../Controllers/RubroControllers');
const ItemsControllers = require('../../Controllers/ItemsControllers');

router
  .get('/usuarios/', authMiddleware, PerfilControllers.obtener)
  .get('/usuarios/:id', authMiddleware, PerfilControllers.obtenerporId)
  .put('/usuarios/:id', authMiddleware, PerfilControllers.actualizar)
  .post('/usuarios/', authMiddleware, PerfilControllers.insertar)
  .delete('/usuarios/:id', authMiddleware, PerfilControllers.eliminar)
  .post('/usuarios/iniciarSesion', PerfilControllers.iniciarSesion)

  .get('/rubro/', authMiddleware, RubroControllers.obtener)
  .get('/rubro/:id', authMiddleware, RubroControllers.obtenerporId)
  .get('/categoria/', authMiddleware, RubroControllers.obtenercategorias)
  .put('/rubro/:id', authMiddleware, RubroControllers.actualizar)
  .post('/rubro/', authMiddleware, RubroControllers.insertar)
  .delete('/rubro/:id', authMiddleware, RubroControllers.eliminar)

  .get('/item/:id_usuario', authMiddleware, ItemsControllers.obtener)
  .get('/item/:id', authMiddleware, ItemsControllers.obtenerporId)
  .put('/item/:id', authMiddleware, ItemsControllers.actualizar)
  .post('/item/', authMiddleware, ItemsControllers.insertar)
  .delete('/item/:id', authMiddleware, ItemsControllers.eliminar);

module.exports = router;