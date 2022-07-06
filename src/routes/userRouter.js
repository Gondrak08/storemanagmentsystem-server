const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');

let auth = require('../services/authentication');
let checkRole = require('../services/checkRole');

const nodemailer = require('nodemailer');
const { authenticateToken } = require('../services/authentication');

require('dotenv').config('env')



router.post('/signup', (req, res) => {
    const user = req.body;
    query = "select email, password, role, status from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                query = "insert into user(name, password, email, status, role) values(?,?,?,'false','user')"
                connection.query(query, [user.name, user.password, user.email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: 'Sucessfully Registered' })
                    } else {
                        return res.status(500).json(err);
                    }
                })
            } else {
                return res.status(400).json({ message: 'Email already exist!' });
            }
        } else {
            return res.status(500).json(err);
        }
    })
});



router.post('/login', (req, res) => {
    const user = req.body;
    query = "select email, password, role, status from user where email=?";

    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password != user.password) {
                return res.status(401).json({ message: "Incorrect Username and Password" });
            } else if (results[0].status === 'false') {
                return res.status(401).json({ message: "Wait for Admin approval" });
            } else if (results[0].password == user.password) {
                const response = { email: results[0].email, role: results[0].role };
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
                res.status(200).json({token: accessToken, role: results[0].role });
            } else {
                return res.status(400).json({ message: "Something wen wrong. please try again later" });
            }
        } else {
            return res.status(500).json(err);
        }
    })
});

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});



router.post('/forgotPassword', (req, res) => {
    const user = req.body;
    query = "select email, password from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) return res.status(200).json({ message: "Password sent successfully to your email." });
            else {
                let mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'Password by Store Managment System',
                    html: '<p><b>Your login details from Store Managment System</b> <br> <b>Email:</b>' + results[0].email + '<br> <b>Password: </b>' + results[0].password + ' <br> <a href="http://localhost:5000/user/login"> Click here to login <a/></p>'
                }
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.log(err, "helloo")
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                })
                return res.status(200).json({ message: "Password sent successfully to your email" });
            }

        } else {
            return res.status(500).json(err);
        }
    })
});


router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    // use Bearer token
    let query = "select id, name, email, status, role from user where role='user'";
    connection.query(query, (err, results) => {
        if (!err) return res.status(200).json(results);
        else return res.status(500).json(err);
    })
});

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const user = req.body;
    let query = "update user set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) return res.status(200).json({ message: "User id does not exist!" });
            return res.status(200).json({ message: 'User updated Successfully' });
        } else {
            return res.status(500).json(err);
        }
    })
});

router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: "true" });
});

router.post('/changePassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    let query = "select *from user where email=? and password=?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(400).json({ message: "Incorret old password" });
            }
            else if (results[0].password == user.oldPassword) {
                query = "update user set password=? where email=?";
                connection.query(query, [user.newPassword, email], (err, results) => {
                    if (!err)
                        return res.status(200).json({ message: "Password Updated Sucessfully" });
                    else
                        return res.status(500).json(err);
                })
            } else
                return res.status(400).json({ message: "Something went wrong. Please try again later" });
        } else {
            return res.status(500).json(err);
        }
    })
});

module.exports = router;