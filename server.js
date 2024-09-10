require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const server = express();
const mongoose = require("mongoose");
const port = process.env.PORT;
const userRoutes = require('./routes/user.routes');

// const productRoutes = require('./routes/product.routes');
// console.log(users)

server.use(morgan('dev'))
server.use(express.json())
server.use(express.urlencoded({ extended: false }))

server.get('/', (req, res) => {
    res.send("Welcome To Express Server...")
})

server.use("/api/user" , userRoutes);

// server.use("/api/product" , productRoutes);

server.listen(port, () => {
    // Database Connection
    mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
    console.log("Database connection established  successfully")
    })
    .catch((err) => console.log(err))
    console.log(`Server Start At http://localhost:2000`)
})