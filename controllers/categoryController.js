const pool = require("../config/pool");
const streamifier = require('streamifier');
require('dotenv').config();


async function createCategory(req, res){
    const {name, description, parent_id} = req.body;
    try{
        const [rows] = await pool.query('SELECT * FROM category WHERE name = $1', [name]);
        if(rows.length != 0){
            return res.status(400).json({success: false, result: 'A category with this name already exists'});
        }

        await pool.query('INSERT INTO category(name, description, parent_id) VALUES ($1,$2,$3);' [name, description, parent_id]);
        res.status(200).json({
            success: true,
            result: 'Category created correctly'
        })
    }catch(e){
        return res.status(500).json({success:false, result: e})
    }
}

async function updateCategory(req, res){
    const {id} = req.params;
    const {name, description, parent_id} = req.body;
    try{
        const [rows] = await pool.query('SELECT * FROM category WHERE id = $1', [id]);
        if(rows.length == 0){
            return res.status(400).json({success: false, result: 'Category does not exist'});
        }

        await pool.query(`
            UPDATE category SET name = COALESCE($1, name), description = COALESCE($2, category),
            parent_id = COALESCE($3, parent_id) WHERE id = $4;` [name, description, parent_id, id]);
            
        res.status(200).json({
            success: true,
            result: 'Category updated correctly'
        })
    }catch(e){
        return res.status(500).json({success:false, result: e})
    }
}

async function deleteCategory(req, res){
    const {id} = req.params;
    try{
        await pool.query('DELETE FROM category WHERE id = $1;', [id]);
        res.status(200).json({
            success: true,
            result: 'Category deleted correctly'
        })
    }catch(e){
        return res.status(500).json({success:false, result: e})
    }
}

async function getCategory(req, res) {
    const {id} = req.params;
    try{
        const {rows} = await pool.query('SELECT * FROM category WHERE id = $1;', [id]);
        res.json(200).json({
            success: true,
            result: rows
        });
    }catch(e){
        return res.status(500).json({success:false, result: e})
    }
}


async function getCategories(req, res){
    try{
        const {rows} = await pool.query('SELECT * FROM category;')
            
        return res.status(200).json({
            success: true,
            result: rows
        });
    }catch(e){
        return res.status(500).json({success:false, result: e})
    }
}

module.exports = {
    createCategory,
    updateCategory,
    getCategories,
    getCategory,
    deleteCategory
}

