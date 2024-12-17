const express = require("express");
const passport = require("passport");
const userRouter = require("./routes/userRouter.js");
const productRouter = require('./routes/productRouter.js');
const cartRouter = require('./routes/cartRouter.js');
const orderRouter = require('./routes/orderRouter.js');
const shipmentRouter = require('./routes/shipmentRouter');
const paymentRouter = require('./routes/paymentRouter');
const categoryRouter = require('./routes/categoryRouter');
const cors = require("cors");

// TIEMPO: 29,5hs


require("dotenv").config();

var app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

require('./config/passport')(passport);
app.use(passport.initialize());

app.use(cors());


app.use('/products', productRouter);
app.use('/categories', categoryRouter);
app.use('/users', userRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);
app.use('/payment', paymentRouter);
app.use('/shipment', shipmentRouter);

const PORT = process.env.PORT || 3000;
app.listen( PORT, () => console.log(`App running on PORT ${PORT}`));
