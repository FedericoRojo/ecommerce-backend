const pool = require("../config/pool");
const streamifier = require('streamifier');
require('dotenv').config();
const {MercadoPagoConfig, Payment, Preference} = require("mercadopago");
const cartController = require('./cartController');
/*
/*
transaction_amount: 12.34,
            description: '<DESCRIPTION>',
            payment_method_id: '<PAYMENT_METHOD_ID>',
            payer: {
                email: '<EMAIL>'
            },
*/
/*
async function createOrder(req, res){
    try {
        const client = new MercadoPagoConfig({ accessToken: 'APP_USR-3529746334927669-121009-cfcc767d9ac7b9646d6bfec8674b4281-2148175318' });
        const payment = new Payment(client);

       
        const { rows } = await pool.query(`
            SELECT c.id AS cart_id, ci.product_id, ci.quantity, p.price
            FROM cart c
            JOIN cartitem ci ON ci.cart_id = c.id
            JOIN product p ON ci.product_id = p.id
            WHERE c.user_id = $1;
        `, [req.user.id]);

        let total = 0
        for(let i = 0; i < rows.length; i++){
            total = total + rows[i].quantity * rows[i].price;
        }

        const order = await pool.query(`
            INSERT INTO orders(customer_id, status, total) 
            VALUES ($1, 'ORDER_PLACED', $2) 
            RETURNING id;
        `, [req.user.id, total]);

        const orderItems = rows.map(item => [
            order.rows[0].id, 
            item.product_id, 
            item.quantity,    
            item.price * item.quantity
        ]);

        const values = orderItems.map(item => `(${item.join(', ')})`).join(', ');

        await pool.query(`
            INSERT INTO orderitem(order_id, product_id, quantity, price) VALUES ${values};
        `);

         const items = rows.map(item => ({
            title: `Product ${item.product_id}`,
            unit_price: item.price,
            quantity: item.quantity,
        }));


        const body = {
            items,
            back_urls: {
                success: "http://localhost:8080/feedback",
                failure: "http://localhost:8080/feedback",
                pending: "http://localhost:8080/feedback",
            },
            notification_url: "https://614e-190-185-237-60.ngrok-free.app/payment/webhook",
        };

        const response = await payment.create({body});
        
        cartController.emptyCart();

        return res.status(200).json({
            success: true,
            orderId: order.rows[0].id,
            preferenceId: response.body.id,
            message: 'Order placed correctly',
        });

    } catch (e) {
        console.error('Error creating order:', e); 
        return res.status(500).json({
            success: false,
            result: 'Error while creating order'
        });
    }
}

*/

async function createOrder(req, res){
    console.log('aca');
    try {
        const client = new MercadoPagoConfig({ 
            accessToken: 'APP_USR-5099569201338381-121011-1304a3c3a7949dfacd5b9d930cdd4900-2147545242' });
        const preference = new Preference(client);

        const body = {
            items: [{
				title: 'Objecto',
				unit_price: 500,
				quantity: 2,
			}],
            back_urls: {
                success: "http://localhost:8080/feedback",
                failure: "http://localhost:8080/feedback",
                pending: "http://localhost:8080/feedback",
            },
            notification_url: "https://614e-190-185-237-60.ngrok-free.app/payment/webhook",
            auto_return: "approved"
        };

        const response = await preference.create({body});
        console.log(response);

        return res.status(200).json({
            success: true,
            result: response.init_point,
            message: 'Order placed correctly',
        });

    } catch (e) {
        console.error('Error creating order:', e); 
        return res.status(500).json({
            success: false,
            result: 'Error while creating order'
        });
    }
}

    

async function updateOrder(req, res){

}

async function deleteOrder(req, res){

}

async function getOrder(req, res){
    const {id} = req.params;
    try{
        const {rows} = await pool.query(
            `SELECT * FROM orders o 
                JOIN orderitem oi ON oi.order_id=o.id 
                JOIN product p ON p.id=oi.product_id
                WHERE o.id = $1;`, [id]);

        if(rows[0].costumer_id != req.user.id){
            return res.status(401).json({
                success: false,
                result: "The order is from other user"
            })
        }else{
            return res.status(200).json({
                success: true,
                result: rows
            })
        }
    }catch(e){
        return res.status(500).json({
            success: false,
            result: 'Error while creating order'
        });
    }
}

async function getOrders(req, res){
    try{
        const {rows} = await pool.query(`SELECT * FROM orders WHERE costumer_id = $1;`, [req.user.id]);
        return res.status(200).json({
            success: true,
            result: rows
        })
    }catch(e){
        return res.status(500).json({
            success: false,
            result: 'Error while creating order'
        });
    }
}

async function createReturnOrder(req, res){

}

async function updateReturnOrder(req, res){

}

async function deleteReturnOrder(req, res){

}



module.exports = {
    createOrder,
    getOrder,
    getOrders
}

