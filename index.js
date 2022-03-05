// Modules
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const connection = require('./src/database/connection');

// Routes
const routes = require('./src/routes/routes');

// Models
const IceCream = require('./src/models/IceCream');
const Budget = require('./src/models/Budget');

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connection with database
connection
    .authenticate()
    .then(() => console.log('Conexão feita com sucesso!'))
    .catch(err => console.log(err));

// Using Cors, Morgan and Routes
app.use(cors());
app.use(morgan('dev'));
app.use('/api', routes);

// Listen on port 3000
app.listen(process.env.PORT || 3000, () => {
    setTimeout(() => console.log('Backend running on port 3000 🚀...'), 800);
});