const pool = require("../config/pool");
const streamifier = require('streamifier');
require('dotenv').config();


async function createCart(req, res){
    try{
        const {rows} = await pool.query('SELECT * FROM cart WHERE user_id = $1;', [req.user.id]);
        if(rows.length != 0){
            return res.status(400).json({
                success: false,
                result: "User already has a cart"
            })
        }

        await pool.query('INSERT INTO cart(user_id) VALUES ($1);', [req.user.id]);
        return res.status(200).json({
            success: true,
            result: 'Cart created correctly'
        })
    }catch(e){
        return res.status(500).json({success: false, result: 'Error creating cart'});
    }
}

async function getCart(req, res){
    try{
        const {rows} = await pool.query(`
            SELECT c.*, ci.*, p.*, (ci.quantity * p.price) AS total_price
            FROM cart c
            JOIN cartitem ci ON ci.cart_id = c.id
            JOIN product p ON p.id = ci.product_id    
            WHERE c.user_id = $1;`, [req.user.id]);
        return res.status(200).json({
            success: true,
            result: rows
        })
    }catch(e){
        return res.status(500).json({success: false, result: 'Error adding item to cart'});
    }
}



async function updateCart(req, res){
    const {quantity, productID} = req.body;
    console.log(quantity, productID);
    try{
        await pool.query(`
            UPDATE cartitem
            SET quantity = $1
            WHERE cart_id = (
                SELECT id 
                FROM cart 
                WHERE user_id = $2
            )
            AND product_id = $3;
            `, [quantity, req.user.id, productID]);
        console.log('aca correcto');
        res.status(200).json({
            success: true,
            result: "Cart updated correctly"
        })
    }catch(e){
        return res.status(500).json({success: false, result: "Error while updating cart"});
    }
}

async function addToCart(req, res){
    const {productId, quantity} = req.body;
    let quantityUsed = quantity != null ? quantity : 1;
    try{
        const {rows} = await pool.query('SELECT * FROM cart WHERE user_id=$1;', [req.user.id]);
        if(rows.length == 0){
            return res.status(400).json({success: false, result: 'User do not have a cart'});
        }
        
        await pool.query(`INSERT INTO cartitem(cart_id, product_id, quantity) VALUES ($1, $2, $3)`, [rows[0].id, productId, quantityUsed]);
        console.log('aca carrito');
        
        return res.status(200).json({
            success: true,
            result: "Item added to cart correctly"
        });
    }catch(e){
        return res.status(500).json({success: false, result: 'Error adding item to cart'});
    }
}

async function removeFromCart(req, res){
    const {productID} = req.params;
    try{
        await pool.query(`DELETE FROM cartitem WHERE product_id = $1 
                            AND cart_id = ( SELECT id 
                                            FROM cart 
                                            WHERE user_id = $2 );`, [productID, req.user.id]);
        return res.status(200).json({
            success: true,
            result: 'Item removed correctly'
        })
    }catch(e){
        return res.status(500).json({success: false, result: 'Error removing item from cart'});
    }
}

async function emptyCart(req, res){
    try{
        const cart = await pool.query('SELECT * FROM cart WHERE user_id=$1;', [req.user.id]);
        if(cart.rows.length == 0){
            return res.status(400).json({success: false, result: 'User do not have a cart'});
        }
        const {rows} = await pool.query('SELECT * FROM cartitem WHERE cart_id = $1', [cart.rows[0].cart_id]);
        for(let i = 0; i < rows.length; i++){
            await pool.query('DELETE FROM cartitem WHERE id = $1;', [rows[i].id]);
        }

        return res.status(200).json({
            success: true,
            result: 'Cart emptied successfully'
        })

    }catch(e){
        return res.status(500).json({success: false, result: 'Error emptying cart'});
    }
}


module.exports = {
    createCart,
    getCart,
    addToCart,
    removeFromCart,
    emptyCart,
    updateCart
}

