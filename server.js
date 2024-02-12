const express = require('express');
require('dotenv').config()
// local
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use('/user',userRoutes);


app.listen(process.env.PORT||8000)