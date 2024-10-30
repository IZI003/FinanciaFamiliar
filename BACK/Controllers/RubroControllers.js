const RubroDB = require('../Services/RubroDB');
const Respuesta = require('../models/Respuesta');

exports.obtener = async (req, res) => {
    try {
        res.send(new Respuesta(null, 'OK', null, await RubroDB.obtener()));
    } catch (err) {
        console.error(err);
        res.status(500).send(new Respuesta("Error en el server", 'Fail', err.message, null));
        return;
    }
}

exports.obtenerporId = async (req, res) => {
    try {
        let cuenta = await RubroDB.obtenerId(req.params.id);

        if (!cuenta || cuenta.length === 0) {
            return res.status(404).json(new Respuesta("Error no se encontro el rubro", 'Fail', "No hallado", null));
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
        res.status(200).json(new Respuesta('Rubro actualizado correctamente', 'OK', null, await RubroDB.actualizar(req.body, id)));
    } catch (error) {
        res.status(500).json(new Respuesta('Error al actualizar el rubro', 'fail', error.message, null));
    }
}

exports.insertar = async (req, res) => {
    const id = req.params.id; // ID del usuario que se actualizará
    try {
        res.status(200).json(new Respuesta('Rubro Creado correctamente', 'OK', null, await RubroDB.insertar(req.body, id)));
    } catch (error) {
        res.status(500).json(new Respuesta('Error al insertar el rubro', 'fail', error.message, null));
    }
}

exports.eliminar = async (req, res) => {
    try {
        let cuenta = await RubroDB.eliminar(req.params.id);

        if (!cuenta || cuenta.length === 0) {
            return res.status(404).json(new Respuesta("Error no se encontro el rubro", 'Fail', "No hallado", null));
        }

        res.send(new Respuesta(null, 'OK', null, cuenta));
    } catch (err) {
        console.error(err);
        res.status(500).send(new Respuesta("Error en el server", 'Fail', err.message, null));
        return;
    }
}
