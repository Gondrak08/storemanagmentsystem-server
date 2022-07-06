const express = require('express');
let cors = require('cors');

const connection = require('./connection')
const userRouter = require('./routes/userRouter');
const categoryRoute = require('./routes/categoryRouter');
const productRoute = require('./routes/productRouter');
const billRoute = require('./routes/bill');
const dashboardRoute = require('./routes/dashboard');


const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/user', userRouter);
app.use('/category', categoryRoute);
app.use('/product', productRoute);
app.use('/bill', billRoute);
app.use('/dashboard', dashboardRoute);



module.exports = app;