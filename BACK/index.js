const express = require('express');
//creamos el servidor
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const bodyparser = require('body-parser');
require('dotenv').config({ path: 'dev.env' });

app.use(express.json());
const port = process.env.port;
app.use(cors({
    origin: process.env.DOMINIO + process.env.PORT_FRONT
}));

app.use(morgan('dev'));
app.use(bodyparser.json());
//route
app.use('/api/v1/', require('./Routers/V1/Routes'));

//start servidor
app.listen(port, () => {
    console.log(`Server en el puerto ${process.env.DOMINIO + process.env.PORT}`)
});