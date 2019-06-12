const express = require('express')
const router = express.Router()
const Book = require('../models/Book.js')

const passport = require('passport')
require('../config/passport')(passport)

/* GET ALL BOOKS */
router.get('/', passport.authenticate('jwt', { session: false}), function(req, res) {
  const token = getToken(req.headers)
  if (token) {
    Book.find(function (err, books) {
      if (err) return next(err)
      res.json(books)
    })
  } else {
    res.status(403).send({success: false, msg: 'Unauthorized.'})
  }
})

/* GET SINGLE BOOK BY ID */
router.get('/:id', passport.authenticate('jwt', { session: false}), function(req, res, next) {
  const token = getToken(req.headers)
  if (token) {
    Book.findById(req.params.id, function (err, post) {
      if (err) return next(err)
      res.json(post)
    })
  } else {
    res.status(403).send({success: false, msg: 'Unauthorized.'})
  }
})

/* SAVE BOOK */
router.post('/', passport.authenticate('jwt', { session: false}), function(req, res) {
  const token = getToken(req.headers)
  if (token) {
    Book.create(req.body, function (err, post) {
      if (err) return next(err)
      res.json(post)
    })
  } else {
    res.status(403).send({success: false, msg: 'Unauthorized.'})
  }
})

/* UPDATE BOOK */
router.put('/:id', passport.authenticate('jwt', { session: false}), function(req, res, next) {
  const token = getToken(req.headers)
  if (token) {
    Book.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
      if (err) return next(err)
      res.json(post)
    })
  } else {
    res.status(403).send({success: false, msg: 'Unauthorized.'})
  }
})

/* DELETE BOOK */
router.delete('/:id', passport.authenticate('jwt', { session: false}), function(req, res, next) {
  const token = getToken(req.headers)
  if (token) {
    Book.findByIdAndRemove(req.params.id, req.body, function (err, post) {
      if (err) return next(err)
      res.json(post)
    })
  } else {
    res.status(403).send({success: false, msg: 'Unauthorized.'})
  }
})

const getToken = headers => {
  if (headers && headers.authorization) {
    const parted = headers.authorization.split(' ')
    if (parted.length === 2) {
      return parted[1]
    } else {
      return null
    }
  } else {
    return null
  }
}

module.exports = router