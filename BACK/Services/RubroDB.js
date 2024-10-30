const con = require('../Database/MYSQLConnet');

exports.insertar = async function (req) {
    const data = {
        NOMBRE: req.nombre,
        ACTIVO: true,
        PRINCIPAL: true,
    };
    try {
        const result = await con.insert('rubro', data);
        console.log("Rubro insertado con ID:", result.insertId);
        return { error: false, message: "Rubro creado con éxito", data: { id: result.insertId } };
    } catch (error) {
        console.error("Error al crear el Rubro:", error);
        return { error: true, message: "Error al crear el Rubro: " + error.message };
    }
};

exports.obtener = async function () {
    try {
        const resultado = await new Promise((resolve, reject) => {
            con.query("SELECT * FROM rubro", function (err, result, fields) {
                if (err) {
                    reject(err);
                } else {
                    console.log("El SELECT se realizó correctamente");
                    resolve(result);
                }
            });
        });
        return { error: false, message: "Consulta realizada con éxito", data: resultado };
    } catch (error) {
        console.error("Error al realizar el select: ", error);
        return { error: true, message: error.message };
    }
}

exports.obtenerId = async function (id) {
    try {
        const resultado = await new Promise((resolve, reject) => {
            const sql = "SELECT * FROM rubro WHERE id = ?";
            con.query(sql, [id], function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    console.log("El SELECT se realizó correctamente");
                    resolve(result);
                }
            });
        });

        if (resultado.length > 0) {
            return {
                error: false,
                message: "Consulta realizada con éxito",
                data: resultado
            };
        } else {
            return {
                error: true,
                message: "No se encontró el rubro con el ID: " + id
            };
        }

    } catch (error) {
        console.error("Error al realizar el select: ", error);
        return {
            error: true,
            message: error.message
        };
    }
};

exports.actualizar = async function (req, id) {
    const data = {
        NOMBRE: req.nombre,
        ACTIVO: req.activo,
        PRINCIPAL: true,
    };
    const conditions = { id: id };

    try {
        const result = await con.update('rubro', data, conditions);

        if (result.affectedRows > 0) {
            return { error: false, message: "Rubro actualizado correctamente" };
        } else {
            return { error: true, message: "No se encontró el Rubro con el ID: " + idUsuario };
        }

    } catch (error) {
        console.error("Error al actualizar el Rubro:", error);
        return { error: true, message: "Error al actualizar el Rubro: " + error.message };
    }
};

exports.eliminar = async function (id) {
    try {
        const resultado = await new Promise((resolve, reject) => {
            const sql = "DELETE FROM `rubro` WHERE id = ?";
            con.query(sql, [id], function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    console.log("El DELETE se realizó correctamente");
                    resolve(result);
                }
            });
        });

        if (resultado.affectedRows == 1) {
            return {
                error: true,
                message: "Se elimino correctamente el Rubro ID: " + id
            };
        } else {
            return {
                error: true,
                message: "No se encontró el Rubro con el ID: " + id
            };
        }
    } catch (error) {
        console.error("Error al realizar el select: ", error);
        return {
            error: true,
            message: error.message
        };
    }
};