const con = require('../Database/MYSQLConnet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'dev.env' });

exports.insertar = async function (req) {
    const fecha = new Date();
    const hashedPassword = await bcrypt.hash(req.password, 10);
    const data = {
        NOMBRE: req.usuario,
        EMAIL: req.email,
        PASSWORD: hashedPassword,
        INICIOSECION: fecha,
        JWT: "jwt",
    };
    try {
        const result = await con.insert('perfil', data);
        console.log("Usuario insertado con ID:", result.insertId);
        return { error: false, message: "Usuario creado con éxito", data: { id: result.insertId } };
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        return { error: true, message: "Error al crear el usuario: " + error.message };
    }
};

exports.obtener = async function () {
    try {
        const resultado = await new Promise((resolve, reject) => {
            con.query("SELECT * FROM perfil", function (err, result, fields) {
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
            const sql = "SELECT * FROM perfil WHERE id = ?";
            con.query(sql, [id], function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    console.log("El SELECT se realizó correctamente");
                    resolve(result);
                }
            });
        });

        console.log(resultado);
        if (resultado.length > 0) {
            return {
                error: false,
                message: "Consulta realizada con éxito",
                data: resultado
            };
        } else {
            return {
                error: true,
                message: "No se encontró el usuario con el ID: " + id
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

exports.actualizar = async function (req, idUsuario) {
    const fecha = new Date();
    const data = {
        NOMBRE: req.usuario,
        PASSWORD: req.password,
        EMAIL: req.email,
        INICIOSECION: fecha,
    };
    const conditions = { id: idUsuario };

    try {
        const result = await con.update('perfil', data, conditions);

        if (result.affectedRows > 0) {
            return { error: false, message: "Usuario actualizado correctamente" };
        } else {
            return { error: true, message: "No se encontró el usuario con el ID: " + idUsuario };
        }

    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        return { error: true, message: "Error al actualizar el usuario: " + error.message };
    }
};

exports.eliminar = async function (id) {
    try {
        const resultado = await new Promise((resolve, reject) => {
            const sql = "DELETE FROM `perfil` WHERE id = ?";
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
                message: "Se elimino correctamente el uduario ID: " + id
            };
        } else {
            return {
                error: true,
                message: "No se encontró el usuario con el ID: " + id
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

exports.iniciarSesion = async (req, res) => {
    try {
        console.log(req.email);
        const result = await new Promise((resolve, reject) => {
            const sql = "SELECT * FROM perfil WHERE email = ?";
            con.query(sql, [req.email], function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    console.log("El SELECT se realizó correctamente");
                    resolve(result);
                }
            });
        });

        if (result.length == 0) {
            return {
                error: true,
                message: "Email o contraseña incorrecta"
            };
        }
        const user = result[0];
        const passwordIsValid = await bcrypt.compare(req.password, user.PASSWORD);

        if (!passwordIsValid) {
            return {
                error: true,
                message: "Email o contraseña incorrecta"
            };
        }

        const token = jwt.sign({ userId: user.id }, process.env.jwtSecret, { expiresIn: process.env.jwtExpiresIn });

        const fecha = new Date();
        const data = {
            jwt: token,
            INICIOSECION: fecha,
        };
        const conditions = { EMAIL: user.EMAIL };

        const resultUP = await con.update('perfil', data, conditions);

        if (resultUP.affectedRows > 0) {
            console.log('Usuario actualizado correctamente');
        } else {
            console.error('No se encontró el usuario');

        }

        return { error: false, message: 'Inicio de sesión exitoso', data: token };
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return {
            error: true,
            message: "Error al iniciar sesión"
        };
    }
};