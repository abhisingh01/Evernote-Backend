const express = require('express');
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = 'Abhi@wesome'
var fetchuser = require('../middleware/fetchuser')

// Route 1: Create a User through POST Request api/auth/createuser. No login required
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3}), body('mail', 'Enter a valid mail').isEmail(),
  body('password', 'Password must be 5 characters long').isLength({ min: 5})
],    
    async (req,res)=>{
    // Returning bad request if there is any error 
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(500).json({ success, errors: errors.array() });
    }

    try{
      // If user with same mail already exist return bad request
      let user = await User.findOne({mail: req.body.mail})
      if(user){
        return res.status(409 ).json({success, "Error":"User with same mail already exists"})
      }
      // Creating User 
      // Genearting salt to secure password 
      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
          name: req.body.name,
          mail: req.body.mail,
          password: secPassword,
      });

      const data = {
        user: {
          id: user.id
        }
      }
      const authToken = jwt.sign(data, jwtSecret);
      success=true
      res.json({success, authToken})
      // res.json(user)
    }
    catch(error){
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
})

// Route 2: User logging POST Request api/auth/login. No login required
router.post('/login', [
  body('mail', 'Enter a valid mail').isEmail(), 
  body('password','Password cannot be blank').exists()
], async (req,res) => {
  // Returning bad request if there is any error 
  let success = false
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  const {mail,password} = req.body
  try{
    const user = await User.findOne({mail})
    if(!user){
      return res.status(401).json({success, Error: 'Kindly try to login with valid credentials'})
    }

    const passwordCompare = await bcrypt.compare(password,user.password)
    if(!passwordCompare){
      return res.status(401).json({success, Error: 'Kindly try to login with valid credentials'})
    }

    const data = {
      user:{
        id: user.id
      }
    }

    const authToken = jwt.sign(data,jwtSecret)
    success = true
    res.json({success, authToken})

  }catch(err){
    console.error(err)
    res.status(500).send('Internal Server Error')
  }

})

// Route 3: Get user details through POST Request api/auth/getuser. Login required
router.post('/getuser', fetchuser, async (req,res) => {
  try{
    const userId = req.user.id
    const user = await User.findById(userId).select('-password')
    res.send(user)
  }catch(err){
    console.error(err.message);
    res.status(500).send('Internal Server Error')
  }
})


module.exports = router