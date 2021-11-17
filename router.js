const express = require("express");
const { check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const auth = require("./auth")
const router = express.Router();
const fileManager = require('./fileManager');
const multer = require('multer');
const path = require('path');
const errors = require('./customErrors/CustomError');
const User = require("./models/User");
const helpers = require("./helpers");

/**
 * @method - GET
 * @param - /
 * @description - Get login page
 */
router.get("/login", auth.checkSession, async (req,res)=>{
  res.render('login');
});

/**
 * @method - GET
 * @param - /
 * @description - Get sign up page
 */
router.get("/signup", auth.checkSession, async (req,res)=>{
  try {
    res.render('signup');
  } catch (e) {
    res.statusCode=500;
    res.send({ message: "Error in fetching page" });
  }
});

/**
 * @method - GET
 * @param - /
 * @description - Get home page
 */
router.get("/", auth.auth, (req,res)=>{
  try {
    //ADD security here

    //CHANGE to new filelist function

    Promise.resolve(fileManager.userHasFolder(req.session.userId))
    .then((exists)=>{
      if(!exists){
        return Promise.resolve(fileManager.createFolderPromise(req.session.userId));
      }

      return Promise.resolve();
    })
    .then(()=>{
      return Promise.resolve(fileManager.listFiles(req.session.userId));
    })
    .then((files)=>{
      res.render('files', {
        files:files,
        loggedIn:true
      });
    })
    .catch((err)=>{
      console.log('ERROR: ', err);
    });
  } 
  catch (e) {
    //ADD 404 page
    res.status(500).send({ message: "Error in fetching user" });
  }
});

router.post('/upload-files', auth.auth, (req, res) => {
  // 'files_to_upload' is the name of our file input field in the HTML form
  let upload = multer({ storage: fileManager.multerStorage}).array('uploads', 10);

  upload(req, res, function(err) {
      // req.file contains information of uploaded file

      if (req.fileValidationError) {
          return res.send(req.fileValidationError);
      }
      else if (!req.files) {
          return res.send('Please select files to upload');
      }
      else if (err instanceof multer.MulterError) {
          return res.send(err);
      }
      else if (err) {
          return res.send(err);
      }
      
      //maybe json here, so ajax can get a return code and message
      res.setHeader('Content-Type', 'application/json');
      res.json({code:0});
  });
});

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp Handler
 */

router.post(
    "/signup",
    [
      check("name", "Please enter your name").not().isEmpty(),
      check("username", "Please enter a valid username").not().isEmpty(),
      check("email", "Please enter a valid email"),
      check("password", "Password must contain atleast 6 symbols").isLength({
        min: 6
      })
    ],
    async (req, res) => { 
      const {
        name,
        username,
        email,
        password,
        confirmPassword
    } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('signup',{
        message: errors.array()[0].msg,
        messageClass: 'alert-danger'
      });
      return;
    }
    if(password != confirmPassword){
      res.render('signup',{
        message:"Passwords do not match",
        messageClass:'alert-danger'
      });
      return;
    }

    try {
      //FIX await here???
        await User.findOne({
          $or: [{
            email: req.body.email
                }, 
                {
            username: req.body.username
                }]
        }).then(async user=>{
          if(user){
            if(user.username === username){
              res.render("signup",{
                message:"Username already exists.",
                messageClass:"alert-danger"
              });
            }
            else if(user.email === email){
              res.render("signup",{
                message:"Email already in use.",
                messageClass:"alert-danger"
              });
            }
          }
          else{
            const newUser = new User({
              name,
              username,
              email,
              password
            });
            //figure out how much time it takes and maybe dont await it
            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(password, salt);

            await newUser.save();

            //no need to await here, i think
            fileManager.createFolder(newUser.id);

            req.session.userId = newUser.id;
            req.session.username = newUser.username;
          }
        });

} catch (err) {
      res.render('signup', {
        message: 'Internal server error',
        messageClass: 'alert-danger'
      });
      return;
    }
  }
);

/**
 * @method - POST
 * @param - /login
 * @description - User Login Handler
 */
router.post(
  "/login",
  [
    check("email", "Please enter your email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 6
    })
  ],
  (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("login",{
        message:errors.array()[0].msg,
        messageClass:"alert-danger"
      });
      return;
    }

    const { email, password } = req.body;

    Promise.resolve(User.findOne({
      email
    }))
    .then((user)=>{
      if(!user || !user.password){
        res.render("login",{
          message:"User with such email does not exist.",
          messageClass:"alert-danger"
        });
        throw new Error();
      }

      const correctPassword = bcrypt.compare(password, user.password)
      
      if (!correctPassword){
        res.render("login",{
          message:"Incorrect password.",
          messageClass:"alert-danger"
        });

        throw new Error();
      }

      req.session.userId = user.id;
      req.session.username = user.username;

      return res.redirect('/');
    })
    .catch();
  });

router.get('/download', auth.auth, (req, res)=>{
  let requestPath = helpers.getQueryJSON(req).path;
  
  if(requestPath === undefined){
    res.status(500).json({
      userMessage:'Incorrect file path',
      code:1
    });
  }
  const os_specific_path = helpers.getRealPath(requestPath);
  const userPath = path.join(req.session.userId, os_specific_path);
  fileManager.downloadFile(res, userPath);
});

router.post('/rename', auth.auth, async (req,res)=>{
  let requestPath = helpers.getQueryJSON(req).path;

  if(requestPath === undefined){
    res.status(500).json({
      userMessage:'Incorrect file path',
      code:1
    });
  }

  const oldName = req.body.oldName;
  const newName = req.body.newName;

  if(!oldName || !newName){
    res.status(400).json({
      userMessage:'Missing old or new name in request body',
      code:1
    });
  }
  const os_specific_old_path = helpers.getRealPath(requestPath+oldName);
  const os_specific_new_path = helpers.getRealPath(requestPath+newName);
  const userPathOld = path.join(req.session.userId, os_specific_old_path);
  const userPathNew = path.join(req.session.userId, os_specific_new_path);
  const result = await fileManager.renameFile(userPathOld, userPathNew);
  if(result)
  {
    res.status(200).json({
      code:0
    });
  }
  else{
    res.status(500).json({
      code:1,
      userMessage:'Could not rename file'
    });
  }
});

router.get('/open', auth.auth, async (req, res)=>{
  let requestPath = helpers.getQueryJSON(req).path;
  let isDir = helpers.getQueryJSON(req).isDirectory;

  if(requestPath === undefined){
    res.status(500).json({
      userMessage:'Incorrect path',
      code:1
    });
  }
  
  const userPath = helpers.getUserPath(req.session.userId, requestPath);

  if(isDir === 'true'){
    let result = await fileManager.getFilesInDirectory(userPath);
    
    switch(result.constructor){
      case errors.BadRequestError:
        res.status(400).json({
          message:result.message,
          code:1
        });
        break;
      case errors.InternalServerError:
        res.status(400).json({
          code:1,
          message:result.message
        });
        break;
      default:
        res.json({
          result
        });
        break;
    }
  }
  else{
    fileManager.sendFile(res, userPath);
  }
});

router.post('/delete', auth.auth, async function(req,res){
  let userPath;
  try{
    const clientFilePath = req.body.path;
    const os_specific_path = helpers.getRealPath(clientFilePath);
    userPath = path.join(req.session.userId, os_specific_path);
  }
  catch(err){
    res.status(400).json({
      code:1,
      message:'Incorrect file path in request.'
    });
  }
  
  try{
    await fileManager.deleteFile(userPath);
  }
  catch(err){
    switch(err.constructor){
      case errors.BadRequestError:
        res.status(400).json({
          code:1,
          message:err.message
        });
        break;
      case errors.InternalServerError:
        res.status(500).json({
          code:1,
          message:'Something went wrong.'
        });
        break;

      default:
        res.status(500).end();
      }      
    }
  
  res.json({
    code:0,
    message:'File deleted successfully'
  })
});

router.post('/create', auth.auth, async function(req, res){
  //ADD error handling
  const dir = helpers.getQueryJSON(req).directory;
  const isDir = dir && dir==='false';

  const path = req.body.path;

  if(!path){
    res.status(400).json({
      code:1,
      message:'Incorrect path in request body'
    });
  }

  const userPath = helpers.getUserPath(req.session.userId, path);
  if(isDir){
    let result = await fileManager.createDirectory(userPath);
    switch(result){
      case true:
        res.json({
          code:0,
          message:'Directory created'
        });
        break;
      case errors.BadRequestError:
        res.status(400).json({
          code:1,
          message:'Bad Request'
        });
        break;
      default:
        res.status(500).json({
          code:1,
          message:'Internal Server Error'
        });
        break;
    }
  }
  else{
    res.end();
  }
});

module.exports = router;