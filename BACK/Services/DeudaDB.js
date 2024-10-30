const con = require('../Database/MYSQLConnet');

exports.insertar = async function (req) {
    const data = {
        NOMBRE: req.nombre,
        MONTO: req.monto,
        Activo: true,
        MONTO_PAGADO: false
    };

    try {
        // Iniciar una transacción
        await con.beginTransaction();
        const result = await con.insert('deuda', data);
        // Insertar las fechas de vencimiento relacionadas a la deuda
        if (req.fechas && req.fechas.length > 0) {
            await insertarFechasParaDeuda(result.insertId, req.fechas);
        }
        await con.commit();
        console.log("deuda insertado con ID:", result.insertId);
        return { error: false, message: "deuda creado con éxito", data: { id: result.insertId } };
    } catch (error) {
        await con.rollback();
        console.error("Error al crear la deuda:", error);
        return { error: true, message: "Error al crear la deuda: " + error.message };
    }
};

const insertarFechasParaDeuda = async (deudaId, fechas) => {
    try {
        // Iteramos sobre cada fecha y la insertamos con el mismo método `con.insert`
        for (const fecha of fechas) {
            const data = {
                fecha: fecha,
                ACTIVO: true,
                deuda_id: deudaId  // Relacionamos la fecha con el ID de la deuda
            };
            await con.insert('fechas', data);  // Inserta cada fecha individualmente
        }
        console.log("Fechas de vencimiento agregadas correctamente.");
    } catch (error) {
        console.error("Error al insertar fechas de vencimiento:", error);
        throw error;  // Lanza el error para que se maneje en la función principal
    }
};

exports.obtener = async function () {
    try {
        // Consulta para obtener todas las deudas con sus fechas
        const query = `SELECT d.ID, d.NOMBRE, d.MONTO, d.ACTIVO, d.MONTO_PAGADO, f.fecha 
                       FROM deuda d
                       LEFT JOIN fechas f ON d.ID = f.deuda_id`;

        const rows = await new Promise((resolve, reject) => {
            con.query(query, function (err, result, fields) {
                if (err) {
                    reject(err);
                } else {
                    console.log("El SELECT se realizó correctamente");
                    resolve(result);
                }
            });
        });

        // Verificar si hay resultados
        if (rows.length === 0) {
            return { error: true, message: "No se encontraron deudas." };
        }

        // Agrupar las deudas por ID y estructurarlas con fechas como una lista
        const deudasMap = rows.reduce((acc, row) => {
            const deudaId = row.ID;

            if (!acc[deudaId]) {
                acc[deudaId] = {
                    ID: row.ID,
                    NOMBRE: row.NOMBRE,
                    MONTO: row.MONTO,
                    ACTIVO: row.ACTIVO,
                    MONTO_PAGADO: row.MONTO_PAGADO,
                    fechas: []
                };
            }

            if (row.fecha) {
                acc[deudaId].fechas.push(row.fecha);
            }

            return acc;
        }, {});

        // Convertir el mapa en un array de objetos
        const deudas = Object.values(deudasMap);
        return { error: false, data: deudas };

    } catch (error) {
        console.error("Error al realizar el select: ", error);
        return { error: true, message: error.message };
    }
};

exports.obtenerId = async function (deudaId) {
    try {
        const query = `
            SELECT d.ID, d.NOMBRE, d.MONTO, d.ACTIVO, d.MONTO_PAGADO, f.fecha 
            FROM deuda d
            LEFT JOIN fechas f ON d.ID = f.deuda_id
            WHERE d.ID = ?
        `;

        const rows = await new Promise((resolve, reject) => {
            con.query(query, [deudaId], function (err, result, fields) {
                if (err) {
                    reject(err);
                } else {
                    console.log("El SELECT se realizó correctamente");
                    resolve(result);
                }
            });
        });

        if (rows.length === 0) {
            return { error: true, message: "No se encontró la deuda con el ID: " + deudaId };
        }

        // Crear el objeto deuda con lista de fechas
        const deuda = {
            ID: rows[0].ID,
            NOMBRE: rows[0].NOMBRE,
            MONTO: rows[0].MONTO,
            ACTIVO: rows[0].ACTIVO,
            MONTO_PAGADO: rows[0].MONTO_PAGADO,
            fechas: rows
                .filter(row => row.fecha !== null)
                .map(row => row.fecha)
        };

        return { error: false, data: deuda };
    } catch (error) {
        console.error("Error al realizar el select: ", error);
        return { error: true, message: error.message };
    }
};

exports.actualizar = async function (req, deudaId) {
    const deudaData = {
        NOMBRE: req.nombre,
        MONTO: req.monto,
        ACTIVO: req.activo,
        MONTO_PAGADO: req.monto_pagado
    };

    try {
        // Iniciar una transacción
        await con.beginTransaction();

        // Actualizar la deuda
        const deudaResult = await con.update('deuda', deudaData, { ID: deudaId });

        if (deudaResult.affectedRows === 0) {
            throw new Error(`No se encontró la deuda con el ID: ${deudaId}`);
        }

        // Eliminar las fechas actuales asociadas a la deuda
        await con.query("DELETE FROM fechas WHERE deuda_id = ?", [deudaId]);

        // Insertar las nuevas fechas asociadas a la deuda
        if (req.fechas && req.fechas.length > 0) {
            await insertarFechasParaDeuda(deudaId, req.fechas);
        }
        // Confirmar la transacción
        await con.commit();

        console.log("Deuda actualizada correctamente junto con las fechas");
        return { error: false, message: "Deuda y fechas actualizadas con éxito" };
    } catch (error) {
        // Revertir la transacción en caso de error
        await con.rollback();
        console.error("Error al actualizar la deuda y fechas:", error);
        return { error: true, message: "Error al actualizar la deuda: " + error.message };
    }
};

exports.eliminar = async function (id) {
    try {
        const resultado = await new Promise((resolve, reject) => {
            const sql = "DELETE FROM `deuda` WHERE id = ?";
            con.query(sql, [id], function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    // Eliminar las fechas actuales asociadas a la deuda
                    con.query("DELETE FROM fechas WHERE deuda_id = ?", [id]);
                    console.log("El DELETE se realizó correctamente");
                    resolve(result);
                }
            });
        });

        if (resultado.affectedRows == 1) {
            return {
                error: true,
                message: "Se elimino correctamente la deuda ID: " + id
            };
        } else {
            return {
                error: true,
                message: "No se encontró la deuda con el ID: " + id
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