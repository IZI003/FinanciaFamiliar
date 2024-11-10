const con = require('../Database/MYSQLConnet');

exports.insertar = async function (req) {
    const data = {
        NOMBRE: req.nombre,
        MONTO: req.monto,
        Activo: true,
        MONTO_PAGADO: false,
        ID_RUBRO: req.id_rubro,
        ID_CATEGORIA: req.id_categoria
    };

    try {
        // Iniciar una transacción
        await con.beginTransaction();
        const result = await con.insert('items', data);
        // Insertar las fechas de vencimiento relacionadas a el item
        if (req.fechas && req.fechas.length > 0) {
            await insertarFechasParaItems(result.insertId, req.fechas);
        }

        const ingr_lista = {
            ID_UDUARIO: req.id_usuario,
            ID_ITEM: result.insertId,
        };

        await con.insert('usuario_items', ingr_lista);

        await con.commit();
        console.log("items insertado con ID:", result.insertId);
        return { error: false, message: "items creado con éxito", data: { id: result.insertId } };
    } catch (error) {
        await con.rollback();
        console.error("Error al crear el item:", error);
        return { error: true, message: "Error al crear el item: " + error.message };
    }
};

const insertarFechasParaItems = async (itemsId, fechas) => {
    try {
        // Iteramos sobre cada fecha y la insertamos con el mismo método `con.insert`
        for (const fecha of fechas) {
            const data = {
                fecha: fecha,
                ACTIVO: true,
                ID_ITEM: itemsId  // Relacionamos la fecha con el ID de el item
            };
            console.log("Fechas listada correctamente.");
            console.log(data);

            await con.insert('fechas', data);  // Inserta cada fecha individualmente
            console.log("insert de fechas correctamente.");

        }
        console.log("Fechas de vencimiento agregadas correctamente.");
    } catch (error) {
        console.error("Error al insertar fechas de vencimiento:", error);
        throw error;  // Lanza el error para que se maneje en la función principal
    }
};

exports.obtener = async function (id_usuario) {
    try {
        // Consulta para obtener todas las itemss con sus fechas
        const query = `SELECT d.ID, d.NOMBRE, d.MONTO, d.ACTIVO, d.MONTO_PAGADO, f.fecha, c.ID as id_categoria, c.nombre AS categoria, r.ID as id_rubro, r.nombre AS rubro
        FROM usuario_items ui
        LEFT JOIN items d ON d.ID = ui.ID_ITEM
        LEFT JOIN fechas f ON d.ID = f.ID_ITEM
        LEFT JOIN categoria c ON d.ID_CATEGORIA = c.ID
        LEFT JOIN rubro r ON d.id_rubro = r.ID
        WHERE ui.ID_USUARIO = ?`;

        const rows = await new Promise((resolve, reject) => {
            con.query(query, [id_usuario], function (err, result, fields) {
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
            return { error: true, message: "No se encontraron itemss." };
        }

        // Agrupar las itemss por ID y estructurarlas con fechas como una lista
        const itemssMap = rows.reduce((acc, row) => {
            const itemsId = row.ID;

            if (!acc[itemsId]) {
                acc[itemsId] = {
                    ID: row.ID,
                    NOMBRE: row.NOMBRE,
                    MONTO: row.MONTO,
                    ACTIVO: row.ACTIVO,
                    MONTO_PAGADO: row.MONTO_PAGADO,
                    categoria: row.categoria,
                    rubro: row.rubro,
                    id_rubro: row.id_rubro,
                    id_categoria: row.id_categoria,
                    fechas: []
                };
            }

            if (row.fecha) {
                acc[itemsId].fechas.push(row.fecha);
            }

            return acc;
        }, {});

        // Convertir el mapa en un array de objetos
        const itemss = Object.values(itemssMap);
        return { error: false, data: itemss };

    } catch (error) {
        console.error("Error al realizar el select: ", error);
        return { error: true, message: error.message };
    }
};

exports.obtenerId = async function (itemsId) {
    try {
        const query = `SELECT d.ID, d.NOMBRE, d.MONTO, d.ACTIVO, d.MONTO_PAGADO, f.fecha, c.ID as id_categoria, c.nombre as categoria, r.ID as id_rubro, r.nombre as rubro 
                       FROM items d
                       LEFT JOIN fechas f ON d.ID = f.item_id
                       LEFT JOIN categoria c ON d.ID_CATEGORIA = c.ID
                       LEFT JOIN rubro r ON d.ID_RUBRO = r.ID
                       WHERE d.ID = ?`;

        const rows = await new Promise((resolve, reject) => {
            con.query(query, [itemsId], function (err, result, fields) {
                if (err) {
                    reject(err);
                } else {
                    console.log("El SELECT se realizó correctamente");
                    resolve(result);
                }
            });
        });

        if (rows.length === 0) {
            return { error: true, message: "No se encontró el item con el ID: " + itemsId };
        }

        // Crear el objeto items con lista de fechas
        const items = {
            ID: rows[0].ID,
            NOMBRE: rows[0].NOMBRE,
            MONTO: rows[0].MONTO,
            ACTIVO: rows[0].ACTIVO,
            MONTO_PAGADO: rows[0].MONTO_PAGADO,
            categoria: rows[0].categoria,
            rubro: rows[0].rubro,
            id_rubro: row.id_rubro,
            id_categoria: row.id_categoria,
            fechas: rows
                .filter(row => row.fecha !== null)
                .map(row => row.fecha)
        };

        return { error: false, data: items };
    } catch (error) {
        console.error("Error al realizar el select: ", error);
        return { error: true, message: error.message };
    }
};

exports.actualizar = async function (req, itemsId) {
    const itemsData = {
        NOMBRE: req.nombre,
        MONTO: req.monto,
        ACTIVO: req.activo,
        MONTO_PAGADO: req.monto_pagado,
        ID_RUBRO: req.id_rubro,
        ID_CATEGORIA: req.id_categoria
    };

    try {
        // Iniciar una transacción
        await con.beginTransaction();

        // Actualizar el item
        const itemsResult = await con.update('items', itemsData, { ID: itemsId });

        if (itemsResult.affectedRows === 0) {
            throw new Error(`No se encontró el item con el ID: ${itemsId}`);
        }

        // Eliminar las fechas actuales asociadas a el item
        await con.query("DELETE FROM fechas WHERE id_item = ?", [itemsId]);
        console.log("Fechas eliminadas correctamente.");
        // Insertar las nuevas fechas asociadas a el item
        if (req.fechas && req.fechas.length > 0) {
            await insertarFechasParaItems(itemsId, req.fechas);
        }
        console.log("Fechas creada correctamente.");

        // Confirmar la transacción
        await con.commit();

        console.log("items actualizada correctamente junto con las fechas");
        return { error: false, message: "items y fechas actualizadas con éxito" };
    } catch (error) {
        // Revertir la transacción en caso de error
        await con.rollback();
        console.error("Error al actualizar el item y fechas:", error);
        return { error: true, message: "Error al actualizar el item: " + error.message };
    }
};

exports.eliminar = async function (id) {
    try {
        const resultado = await new Promise((resolve, reject) => {
            const sql = "DELETE FROM items WHERE id = ?";
            con.query(sql, [id], function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    // Eliminar las fechas actuales asociadas a el item
                    con.query("DELETE FROM fechas WHERE ID_ITEM = ?", [id]);

                    con.query("DELETE FROM usuario_items WHERE ID_ITEM = ?", [id]);

                    console.log("El DELETE se realizó correctamente");
                    resolve(result);
                }
            });
        });

        if (resultado.affectedRows == 1) {
            return {
                error: true,
                message: "Se elimino correctamente el item ID: " + id
            };
        } else {
            return {
                error: true,
                message: "No se encontró el item con el ID: " + id
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

