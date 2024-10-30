const crypto = require('crypto');

exports.generateUniqueId = () => {
    // Genera un número aleatorio (entropía)
    const rand = Math.random().toString();

    // Genera un identificador único basado en el tiempo y entropía
    const uniqueString = `${Date.now()}${rand}`;

    // Aplica el hash sha1 y toma los primeros 20 caracteres
    const valor = crypto.createHash('sha1').update(uniqueString).digest('hex').substring(0, 20);
    console.log(valor);
    return valor;
};
