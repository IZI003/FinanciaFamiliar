const DeudaDB = require('../Services/DeudaDB');
const Respuesta = require('../models/Respuesta');

exports.obtener = async (req, res) => {
    try {
        res.send(new Respuesta(null, 'OK', null, await DeudaDB.obtener()));
    } catch (err) {
        console.error(err);
        res.status(500).send(new Respuesta("Error en el server", 'Fail', err.message, null));
        return;
    }
}

exports.obtenerporId = async (req, res) => {
    try {
        let cuenta = await DeudaDB.obtenerId(req.params.id);

        if (!cuenta || cuenta.length === 0) {
            return res.status(404).json(new Respuesta("Error no se encontro la deuda", 'Fail', "No hallado", null));
        }

        res.send(new Respuesta(null, 'OK', null, cuenta));
    } catch (err) {
        console.error(err);
        res.status(500).send(new Respuesta("Error en el server", 'Fail', err.message, null));
        return;
    }
}

exports.actualizar = async (req, res) => {
    const id = req.params.id; // ID del usuario que se actualizará
    try {
        res.status(200).json(new Respuesta('deuda actualizada correctamente', 'OK', null, await DeudaDB.actualizar(req.body, id)));
    } catch (error) {
        res.status(500).json(new Respuesta('Error al actualizar la deuda', 'fail', error.message, null));
    }
}

exports.insertar = async (req, res) => {
    const id = req.params.id; // ID del usuario que se actualizará
    try {
        res.status(200).json(new Respuesta('deuda Creada correctamente', 'OK', null, await DeudaDB.insertar(req.body, id)));
    } catch (error) {
        res.status(500).json(new Respuesta('Error al insertar la deuda', 'fail', error.message, null));
    }
}

exports.eliminar = async (req, res) => {
    try {
        let cuenta = await DeudaDB.eliminar(req.params.id);

        if (!cuenta || cuenta.length === 0) {
            return res.status(404).json(new Respuesta("Error no se encontro la deuda", 'Fail', "No hallado", null));
        }

        res.send(new Respuesta(null, 'OK', null, cuenta));
    } catch (err) {
        console.error(err);
        res.status(500).send(new Respuesta("Error en el server", 'Fail', err.message, null));
        return;
    }
}
