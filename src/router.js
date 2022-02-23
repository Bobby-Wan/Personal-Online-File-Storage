const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const auth = require("./auth");
const router = express.Router();
const fileManager = require("./fileManager");
const multer = require("multer");
const path = require("path");
const errors = require("./customErrors/CustomError");
const User = require("./models/User");
const helpers = require("./helpers");

function getResponseObject(data, error) {
  if (!data) {
    data = null;
  }
  if (!error) {
    error = null;
  }
  return {
    error: error,
    data: data,
  };
}

function createErrorObject(message, field) {
  return { field: field, message: message };
}

function authenticate(req, res, next) {
  const token = req.headers["authorization"] || req.cookies["auth-cookie"];
  auth.verifyToken(token)
    .then(({ userId }) => {
      req.userId = userId;
      next();
    })
    .catch((error) => {
      console.log(error);
      res
        .status(401)
        .json(getResponseObject(undefined, "Unable to authorize user"));
    });
}

/**
 * @method - GET
 * @param - /
 * @description - Get home page
 */
router.get("/", authenticate, (req, res) => {
  Promise.resolve(fileManager.userHasFolder(req.userId))
    .then((exists) => {
      if (!exists) {
        return Promise.resolve(fileManager.createFolder(req.userId));
      }

      return;
    })
    .then(() => {
      return Promise.resolve(fileManager.listFiles(req.userId));
    })
    .then((files) => {
      res.status(200).json(getResponseObject(files));
    })
    .catch((err) => {
      console.log("ERROR: ", err);
      res
        .status(500)
        .json(
          getResponseObject(
            undefined,
            createErrorObject("Something went wrong", "internal field")
          )
        );
    });
});

router.post(
  "/upload-files",
  authenticate,
  fileManager.upload.single("uploaded-file"),
  (req, res) => {
    console.log(req);
  }
);

router.post("/upload-files2", authenticate, (req, res) => {
  // 'files_to_upload' is the name of our file input field in the HTML form
  let upload = multer({ storage: fileManager.multerStorage }).array(
    "uploads",
    10
  );

  upload(req, res, function (err) {
    // req.file contains information of uploaded file

    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    } else if (!req.files) {
      return res.send("Please select files to upload");
    } else if (err instanceof multer.MulterError) {
      return res.send(err);
    } else if (err) {
      return res.send(err);
    }

    //maybe json here, so ajax can get a return code and message
    res.setHeader("Content-Type", "application/json");
    res.json({ code: 0 });
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
      min: 6,
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(getResponseObject(undefined, errors.array()));
      return;
    }
    const { name, username, email, password } = req.body;

    Promise.resolve(
      User.findOne({
        $or: [
          {
            email: email,
          },
          {
            username: username,
          },
        ],
      })
    )
      .then((user) => {
        if (user && user.username === username) {
          var error = {
            errorField: "username",
            errorMessage: "Username already exists",
          };
          return Promise.reject(error);
        }
        if (user && user.email === email) {
          var error = {
            errorField: "email",
            errorMessage: "User with such email already exists",
          };
          return Promise.reject(error);
        }
        console.log("Validations pass");
        return Promise.resolve(bcrypt.genSalt(10))
          .then((salt) => {
            return bcrypt.hash(password, salt);
          })
          .then((hashedPassword) => {
            const newUser = new User({
              name,
              username,
              email,
              password,
            });
            newUser.password = hashedPassword;
            return newUser.save().then(() => {
              return newUser;
            });
          })
          .then((newUser) => {
            console.log("Before creating folder");
            return fileManager.createFolder(newUser.id);
          })
          .then(() => {
            res.status(200).json(getResponseObject());
          })
          .catch((error) => {
            console.log({ error });
            res.status(500).json(getResponseObject(undefined, error));
            return null;
          });
      })
      .catch((error) => {
        res.status(400).json(getResponseObject(undefined, error));
      });
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
    check("email", "Please enter your email").isEmail()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(getResponseObject(undefined, errors.array()));
      return;
    }

    const { email, password } = req.body;

    Promise.resolve(
      User.findOne({
        email,
      })
    ).then((user) => {
      if (!(user && user.password)) {
        res
          .status(400)
          .json(getResponseObject(undefined, "Invalid email/password."));
        return;
      }

      bcrypt.compare(password, user.password)
      .then((result)=>{
        if(!result){
          res.status(400)
          .json(getResponseObject(undefined, "Invalid email/password"));
          return;
        }

        let tokenPromise = auth.createToken({
          userId: user.id,
          username: user.username,
          email: user.email,
        });
        Promise.resolve(tokenPromise).then((token) => {
          res.status(200).json(getResponseObject(token));
        });
        return;
      })
      .catch((err)=>{
        res.status(500)
        .json(getResponseObject(undefined, err));
      })      
    });
  }
);

router.get("/download", authenticate, (req, res) => {
  let requestPath = helpers.getQueryJSON(req).path;

  if (requestPath === undefined) {
    res.status(500).json({
      userMessage: "Incorrect file path",
      code: 1,
    });
  }
  const os_specific_path = helpers.getRealPath(requestPath);
  const userPath = path.join(req.local.userId, os_specific_path);
  fileManager.downloadFile(res, userPath);
});

router.post("/rename", authenticate, async (req, res) => {
  //validateRequest
  //checkRequestPath
  //validateNames
  //validateFiles

  //getRealPaths

  //
  let requestPath = helpers.getQueryJSON(req).path;

  if (requestPath === undefined) {
    res.status(500).json({
      userMessage: "Incorrect file path",
      code: 1,
    });
  }
  const { oldName, newName } = req.body;

  if (!oldName || !newName) {
    const error = createErrorObject(
      `Invalid names, old:${oldName}, new:${newName}`,
      "names"
    );
    res.status(400).json(getResponseObject(undefined, error));
  }

  const os_specific_old_path = helpers.getRealPath(requestPath + oldName);
  const os_specific_new_path = helpers.getRealPath(requestPath + newName);
  const userPathOld = path.join(req.session.userId, os_specific_old_path);
  const userPathNew = path.join(req.session.userId, os_specific_new_path);
  const result = await fileManager.renameFile(userPathOld, userPathNew);
  if (result) {
    res.status(200).json({
      code: 0,
    });
  } else {
    res.status(500).json({
      code: 1,
      userMessage: "Could not rename file",
    });
  }
});

router.get("/open", authenticate, async (req, res) => {
  let requestPath = helpers.getQueryJSON(req).path;
  let isDir = helpers.getQueryJSON(req).isDirectory;

  if (requestPath === undefined) {
    res.status(500).json({
      userMessage: "Incorrect path",
      code: 1,
    });
  }

  const userPath = helpers.getUserPath(req.session.userId, requestPath);

  if (isDir === "true") {
    let result = await fileManager.getFilesInDirectory(userPath);

    switch (result.constructor) {
      case errors.BadRequestError:
        res.status(400).json({
          message: result.message,
          code: 1,
        });
        break;
      case errors.InternalServerError:
        res.status(400).json({
          code: 1,
          message: result.message,
        });
        break;
      default:
        res.json({
          result,
        });
        break;
    }
  } else {
    fileManager.sendFile(res, userPath);
  }
});

router.post("/delete", authenticate, async function (req, res) {
  let userPath;
  try {
    const clientFilePath = req.body.path;
    const os_specific_path = helpers.getRealPath(clientFilePath);
    userPath = path.join(req.session.userId, os_specific_path);
  } catch (err) {
    res.status(400).json({
      code: 1,
      message: "Incorrect file path in request.",
    });
  }

  try {
    await fileManager.deleteFile(userPath);
  } catch (err) {
    switch (err.constructor) {
      case errors.BadRequestError:
        res.status(400).json({
          code: 1,
          message: err.message,
        });
        break;
      case errors.InternalServerError:
        res.status(500).json({
          code: 1,
          message: "Something went wrong.",
        });
        break;

      default:
        res.status(500).end();
    }
  }

  res.json({
    code: 0,
    message: "File deleted successfully",
  });
});

router.post("/create", authenticate, async function (req, res) {
  //ADD error handling
  const dir = helpers.getQueryJSON(req).directory;
  const isDir = dir && dir === "false";

  const path = req.body.path;

  if (!path) {
    res.status(400).json({
      code: 1,
      message: "Incorrect path in request body",
    });
  }

  const userPath = helpers.getUserPath(req.session.userId, path);
  if (isDir) {
    let result = await fileManager.createDirectory(userPath);
    switch (result) {
      case true:
        res.json({
          code: 0,
          message: "Directory created",
        });
        break;
      case errors.BadRequestError:
        res.status(400).json({
          code: 1,
          message: "Bad Request",
        });
        break;
      default:
        res.status(500).json({
          code: 1,
          message: "Internal Server Error",
        });
        break;
    }
  } else {
    res.end();
  }
});

router.post("/test", (req, res) => {
  console.log(req.body);
  console.log(`query: ${req.url}`);
  res.status(200).json(req.body);
});
module.exports = router;
