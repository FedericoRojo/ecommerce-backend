const pool = require("../config/pool");
const streamifier = require('streamifier');
require('dotenv').config();
const mercadopago = require('mercadopago');

async function createPayment(req, res){

}

async function updatePayment(req, res){

}

async function deletePayment(req, res){

}

async function getPayment(req, res){

}

async function receiveWebhook(req, res){
   
    try{
        console.log(req.query);
        if( req.query.type === "payment"){
            const data = await mercadopago.payment.findById(req.query['data.id']);
            console.log(data);
            //Chequeamos que pago bien y guardamos el pago en  db
        }

        return res.status(200).json({
            success: true,
            result: "Payment correcly placed"
        })
    }catch(e){
        return res.status(500).json({
            success: false,
            result: "Error with mercadopago payment"
        })
    }
}



module.exports = {
    createPayment,
    receiveWebhook
}

