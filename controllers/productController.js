const pool = require("../config/pool");
const streamifier = require('streamifier');
require('dotenv').config();

async function getProduct(req, res){
    try{
        const {rows} = await pool.query(
            `SELECT p.id, p.name as name, p.description, p.image_id, p.price, i.img, p.category_id FROM product p
                JOIN category c ON p.category_id=c.id
                LEFT JOIN image i ON p.image_id=i.id
                WHERE p.id = $1;`, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                result: 'Product not found'
            });
        }    
        return res.status(200).json({
            success: true,
            result: rows[0]
        }) 
    }catch(e){
        return res.status(500).json({
            success: false,
            result: e
        })
    }
}

async function getProducts(req, res){
    const {limit, offset} = req.query;
    try{
        const totalCountResult = await pool.query('SELECT COUNT(*) FROM products;');
        const totalCount = parseInt(totalCountResult.rows[0].count);

        if(offset > totalCount ){
            return res.status(400).json({success: false, error: 'Offset exceeds total number of products'});
        }

        const {rows} = await pool.query(`
            SELECT * FROM product p 
            LEFT JOIN image i ON p.image_id=i.id
            ORDER BY id DESC LIMIT $1 OFFSET $2;`, [limit, offset]);

        res.status(200).json({
            success: true,
            result: rows
        })
    }catch(e){
        return res.status(500).json({success: false, result: e})
    }
}

async function getProductsByCategory(req, res){
    const {limit, offset} = req.query;
    const { categoryID } = req.params;
    try{
        const totalCountResult = await pool.query('SELECT COUNT(*) FROM product p JOIN category c ON p.category_id=c.id WHERE c.id=$1;', [categoryID]);
        const totalCount = parseInt(totalCountResult.rows[0].count);
        if(offset > totalCount ){
            return res.status(400).json({success: false, error: 'Offset exceeds total number of products in this category'});
        }else{

            const {rows} = await pool.query(`
                WITH RECURSIVE CategoryHierarchy AS (
                    SELECT id
                    FROM category
                    WHERE id = $1

                    UNION ALL

                    SELECT c.id
                    FROM category c
                    INNER JOIN CategoryHierarchy ch ON ch.id = c.parent_id
                )
                SELECT p.*
                FROM product p
                JOIN CategoryHierarchy c ON p.category_id = c.id
                ORDER BY p.id DESC
                LIMIT $2 OFFSET $3;`, [categoryID, limit, offset]);
                
            res.status(200).json({
                success: true,
                result: rows
            })
        }
    }catch(e){
        return res.status(500).json({success: false, result: e})
    }
}




async function createProduct(req, res){
    const {categoryID, name, description, price, unitsInStock} = req.body;
    const file = req.file;
    try{
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.v2.uploader.upload_stream(
                { resource_type: "auto" },
                (error, result) => {
                    if (error) {
                        reject(new Error('Error while uploading to Cloudinary'));
                    } else {
                        resolve(result);
                    }
                }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
        });

        const {imageResult} = await pool.query('INSERT INTO image(img, public_id, resource_type) VALUES ($1,$2,$3) RETURNING id', [uploadResult.secure_url, uploadResult.public_id, uploadResult.resource_type]);
        await pool.query(
            'INSERT INTO product(category_id, name, description, price, units_in_stock, image_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
            [categoryID, name, description, price, unitsInStock, imageResult.rows[0].id]
        );
        res.status(200).json({
            success: true,
            result: 'Product inserted correctly'
        })
    }catch(e){
        return res.status(500).json({success: false, result: e})
    }
}

async function updateProduct(req, res){
    const {id} = req.params;
    const {categoryID, name, description, price, unitsInStock} = req.body;
    const file = req.file;
    try{
        if(file != null){
            
            const {rows} = await pool.query('SELECT * FROM product p JOIN image i ON p.image_id = i.id WHERE p.id = $1;', [productID]);

            try {
                await cloudinary.uploader.destroy(rows[0].public_id, { resource_type: rows[0].resource_type });
                await pool.query('DELETE FROM image WHERE id = $1;', [rows[0].image_id]);
            } catch (cloudinaryError) {
                console.warn("Image not found in Cloudinary or deletion failed:", cloudinaryError.message);
            }
           
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.v2.uploader.upload_stream(
                    { resource_type: "auto" },
                    (error, result) => {
                        if (error) {
                            reject(new Error('Error while uploading to Cloudinary'));
                        } else {
                            resolve(result);
                        }
                    }
                );
                streamifier.createReadStream(file.buffer).pipe(stream);
            });

            const {imageResult} = await pool.query('INSERT INTO image(img, public_id, resource_type) VALUES ($1,$2,$3) RETURNING id', [uploadResult.secure_url, uploadResult.public_id, uploadResult.resource_type]);
            await pool.query(
                `UPDATE product SET  
                    category_id = COALESCE($1, category_id), name = COALESCE($2, name), description = COALESCE($3, description),
                    price = COALESCE($4, price), units_in_stock = COALESCE($5, units_in_stock), 
                    image_id = $6 WHERE id = $7;`,
                [categoryID, name, description, price, unitsInStock, imageResult.rows[0].id, productID]
            );
        }else{
            await pool.query(`UPDATE product SET 
                    category_id = COALESCE($1, category_id), name = COALESCE($2, name), description = COALESCE($3, description),
                    price = COALESCE($4, price), units_in_stock = COALESCE($5, units_in_stock) WHERE id = $6;`,
            [categoryID, name, description, price, unitsInStock, productID]);
        }
        res.json({
            success: true,
            result: 'Product updated correctly'
        });

    }catch(e){
        return res.status(500).json({success: false, result: e})
    }
}

async function deleteProduct(req, res){
    const {id} = req.params;
    try{
        const {rows} = await pool.query('SELECT * FROM product p JOIN image i ON p.image_id = i.id WHERE p.id = $1;', [productID]);

        try {
            await cloudinary.uploader.destroy(rows[0].public_id, { resource_type: rows[0].resource_type });
            await pool.query('DELETE FROM image WHERE id = $1;', [rows[0].image_id]);
        } catch (cloudinaryError) {
            console.warn("Image not found in Cloudinary or deletion failed:", cloudinaryError.message);
        }

        await pool.query('DELETE FROM product WHERE id = $1;', [id]);

        return res.json(200).json({success:true, result: 'Product deleted correctly'});
    }catch(e){
        return res.status(500).json({success: false, result: e})
    }
}

async function getProductsByQuery (req, res)  {
    
    const { query } = req.query; 
    const limit = 10;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        const {rows} = await pool.query(
            `   SELECT * 
                FROM product 
                WHERE to_tsvector('spanish', name) @@ plainto_tsquery('spanish', $1)
                LIMIT $2;`,
            [query, limit]
        );
        
        res.status(200).json({
            success: true,
            result: rows
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            result: error });
    }
};


module.exports = {
    getProduct,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProductsByQuery
}

