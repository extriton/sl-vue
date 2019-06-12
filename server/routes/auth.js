const mongoose = require('mongoose')
const passport = require('passport')
const config = require('../config/config')
require('../config/passport')(passport)
const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require("../models/user")

// Sign Up
router.post('/register', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'})
    } else {
        User.findOne({
            username: req.body.username
        }, function(err, user) {
            if (err) throw err;
      
            if (user) {
                console.log(user)
                res.json({success: false, msg: 'Username already exists.'})
                return
            } else {
                const newUser = new User({
                    username: req.body.username,
                    password: req.body.password
                })
                // Save the user
                newUser.save(function(err) {
                    if (err) {
                        return res.json({success: false, msg: err})
                    }
                    res.json({success: true, msg: 'Successful created new user.'})
                })
                
            }
        })
    }
})

// Sign In
router.post('/login', function(req, res) {
    User.findOne({
        username: req.body.username
    }, function(err, user) {
        if (err) throw err;
  
        if (!user) {
            res.status(401).send({success: false, msg: 'Authentication failed. User not found.'})
        } else {
            // Check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // If user is found and password is right create a token
                    var token = jwt.sign(user.toJSON(), config.secret)
                    // Return the information including token as JSON
                    res.json({success: true, token: 'JWT ' + token})
                } else {
                    res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'})
                }
            })
        }
    })
})

module.exports = router