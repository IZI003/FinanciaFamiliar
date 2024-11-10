class Respuesta {
    constructor(message, status, errormsg, data) {
        this.status = status,
            this.message = message,
            this.error = errormsg,
            this.data = data;
    }
}
module.exports = Respuesta;

