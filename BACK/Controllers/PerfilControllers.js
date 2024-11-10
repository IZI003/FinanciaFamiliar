const UsuarioDB = require('../Services/UsuarioDB');
const Respuesta = require('../models/Respuesta');

exports.obtener = async (req, res) => {
    try {
        res.send(new Respuesta(null, 'OK', null, await UsuarioDB.obtener()));
    } catch (err) {
        console.error(err);
        res.status(500).send(new Respuesta("Error en el server", 'Fail', err.message, null));
        return;
    }
}

exports.obtenerporId = async (req, res) => {
    try {
        let cuenta = await UsuarioDB.obtenerId(req.params.id);

        if (!cuenta || cuenta.length === 0) {
            return res.status(404).json(new Respuesta("Error no se encontro al usuario", 'Fail', "No hallado", null));
        }

        res.send(new Respuesta(null, 'OK', null, cuenta));
    } catch (err) {
        console.error(err);
        res.status(500).send(new Respuesta("Error en el server", 'Fail', err.message, null));
        return;
    }
}

exports.actualizar = async (req, res) => {
    const idUsuario = req.params.id; // ID del usuario que se actualizará
    try {
        res.status(200).json(new Respuesta('Usuario actualizado correctamente', 'OK', null, await UsuarioDB.actualizar(req.body, idUsuario)));
    } catch (error) {
        res.status(500).json(new Respuesta('Error al actualizar el usuario', 'fail', error.message, null));
    }
}

exports.insertar = async (req, res) => {
    const idUsuario = req.params.id; // ID del usuario que se actualizará
    try {
        res.status(200).json(new Respuesta('Usuario actualizado correctamente', 'OK', null, await UsuarioDB.insertar(req.body, idUsuario)));
    } catch (error) {
        res.status(500).json(new Respuesta('Error al insertar2 el usuario', 'fail', error.message, null));
    }
}

exports.eliminar = async (req, res) => {
    try {
        let cuenta = await UsuarioDB.eliminar(req.params.id);

        if (!cuenta || cuenta.length === 0) {
            return res.status(404).json(new Respuesta("Error no se encontro al usuario", 'Fail', "No hallado", null));
        }

        res.send(new Respuesta(null, 'OK', null, cuenta));
    } catch (err) {
        console.error(err);
        res.status(500).send(new Respuesta("Error en el server", 'Fail', err.message, null));
        return;
    }
}

exports.iniciarSesion = async (req, res) => {
    try {

        const login = await UsuarioDB.iniciarSesion(req.body);
        if (login.error) {
            return res.status(401).json(new Respuesta(login.message, 'fail', login.message, null));
        }

        return res.status(200).json({ token: login.data });

    } catch (error) {
        res.status(500).json(new Respuesta('Error al insertar el usuario', 'fail', error.message, null));
    }
}