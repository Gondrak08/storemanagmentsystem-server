const express = require('express');
const connection = require('../connection');
const router = express.Router();

let auth = require('../services/authentication');
let checkRole = require('../services/checkRole');

router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const product = req.body;
    let query = "insert into product (name, categoryId, description, price, quantity, status) values(?,?,?,?,?,'true')";
    connection.query(query, [product.name, product.categoryId, product.description, product.price, product.quantity], (err, results) => {
        if (!err)
            return res.status(200).json({ message: "Product added Sucessfully" });
        else
            return res.status(500).json(err)
    })
});

// router.get('/get', auth.authenticateToken,(req,res,next)=>{
//     let query = "select *from product order by name";
//     connection.query(query,(err, results)=>{
//         if(!err){
//             return res.status(200).json(results);
//         } else{
//             return res.status(500).json(err);
//         }
//     })
// })

router.get('/get', auth.authenticateToken, (req, res, next) => {
    let query = "select p.id,p.name,p.description,p.price,p.quantity,p.status,c.id as categoryId, c.name as categoryName from product as p INNER JOIN category as c where p.categoryId = c.id";
    connection.query(query, (err, results) => {
        if (!err)
            return res.status(200).json(results);
        else
            return res.status(500).json(err);
    })
});

router.get('/getByCategory/:id', auth.authenticateToken, (req, res, next) => {
    const id = req.params.id;
    let query = "select id, name from product where categoryId=? and status='true'";
    connection.query(query, [id], (err, results) => {
        if (!err)
            return res.status(200).json(results);
        else
            return res.status(500).json(err);
    })
});

router.get('/getById/:id', auth.authenticateToken, (req, res, next) => {
    const id = req.params.id;
    let query = "select id, name, description,price,quantity from product where id=?";
    connection.query(query, [id], (err, results) => {
        if (!err)
            return res.status(200).json(results[0]);
        else
            return res.status(500).json(err);
    })

});

router.patch('/update/', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const product = req.body;
    let query = "update product set name=?,categoryId=?,description=?,price=?,quantity=? where id=?";
    connection.query(query, [product.name, product.categoryId, product.description, product.price, product.quantity, product.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "Product id does not found" })
            }
            return res.status(200).json({ message: "Product Updated Successfully" });
        } else
            return res.status(500).json(err);
        
    })
});



router.patch('/updateStatus', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const user = req.body;
    let query = "update product set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "Product id does not foud" });
            }
            return res.status(200).json({ message: "Product Status Updated!" });
        } else
            return res.status(500).json(err);
    })
})


router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const id = req.params.id;
    let query = "delete from product where id=?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "Product id does not found" });
            }
            return res.status(200).json({message:"Product Deleted!"})
        } else
            return res.status(500).json(err);
    })
})



module.exports = router;