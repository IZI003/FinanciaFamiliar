const ItemsDB = require('../Services/ItemsDB');
const Respuesta = require('../models/Respuesta');

exports.obtener = async (req, res) => {
    try {
        const items = await ItemsDB.obtener(req.params.id_usuario);
        res.send(new Respuesta(null, 'OK', null, items.data));

    } catch (err) {
        console.error(err);
        res.status(500).send(new Respuesta("Error en el server", 'Fail', err.message, null));
        return;
    }
}

exports.obtenerporId = async (req, res) => {
    try {
        let cuenta = await ItemsDB.obtenerId(req.params.id);

        if (!cuenta || cuenta.length === 0) {
            return res.status(404).json(new Respuesta("Error no se encontro el item", 'Fail', "No hallado", null));
        }

        res.send(new Respuesta(null, 'OK', null, cuenta.data));
    } catch (err) {
        console.error(err);
        res.status(500).send(new Respuesta("Error en el server", 'Fail', err.message, null));
        return;
    }
}

exports.actualizar = async (req, res) => {
    try {
        console.log(req.body);
        const resultado = await ItemsDB.actualizar(req.body, req.params.id);
        console.log(resultado);
        if (resultado.error) {
            return res.status(400).json(new Respuesta('Error al actualizar', 'Fail', resultado.message, null));
        }

        res.status(201).json(new Respuesta('items actualizado correctamente', 'OK', resultado.message, null));
    } catch (error) {
        res.status(500).json(new Respuesta('Error al actualizar el item', 'fail', error.message, null));
    }
}

exports.insertar = async (req, res) => {
    const id = req.params.id; // ID del usuario que se actualizará
    try {
        res.status(200).json(new Respuesta('items Creada correctamente', 'OK', null, await ItemsDB.insertar(req.body, id)));
    } catch (error) {
        res.status(500).json(new Respuesta('Error al insertar el item', 'fail', error.message, null));
    }
}

exports.eliminar = async (req, res) => {
    try {
        let cuenta = await ItemsDB.eliminar(req.params.id);

        if (!cuenta || cuenta.length === 0) {
            return res.status(404).json(new Respuesta("Error no se encontro el item", 'Fail', "No hallado", null));
        }

        res.send(new Respuesta(null, 'OK', null, cuenta));
    } catch (err) {
        console.error(err);
        res.status(500).send(new Respuesta("Error en el server", 'Fail', err.message, null));
        return;
    }
}
