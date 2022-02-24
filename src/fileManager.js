//ADD path checking/auth mechanism??
//ADD user folder/file name caching

const fspromises = require("fs/promises");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const zipper = require("node-zip");
const mime = require("mime-types");
const {
  BadRequestError,
  InternalServerError,
} = require("./customErrors/CustomError");
const helpers = require("./helpers");
const { resolve } = require("path");

const rootDir =
  "C:\\Users\\Sevi\\Desktop\\project\\Personal-Online-File-Storage\\files";

async function folderExists(folderFullPath) {
  try {
    await fspromises.access(folderFullPath);
    return true;
  } catch (err) {
    return false;
  }
}

// function folderExistsPromise(folderFullPath){
//     return Promise.resolve(fspromises.access(folderFullPath));
// }

function directoryExistsPromise(path, options) {
  const finalPath = options && options.relative ? getAbsolutePath(path) : path;

  return fspromises.access(finalPath);
}

async function userFolderExists(userId) {
  const fullPath = path.join(rootDir, userId);
  return await folderExists(fullPath);
}

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let { filepath } = helpers.getQueryJSON(req);
    if (!filepath) {
      filepath = "/";
    }

    const userRootDir = path.join(rootDir, req.session.userId);
    const fullDir = path.join(userRootDir, filepath);
    console.log(`dir: ${fullDir}`);
    cb(null, fullDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: diskStorage });

async function downloadFile(res, relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  try {
    await fspromises.access(absolutePath);
  } catch {
    res.json({
      code: 1,
      message: "No such file",
    });
  }

  try {
    if (!isFile(absolutePath)) {
      throw new Error("Not a file...");
    }
    res.download(absolutePath, (err) => {
      if (err) {
        console.log("Downloading file error: " + err);
      }
    });
  } catch (e) {
    res.send({
      code: 1,
      userMessage: "This is not a file",
    });
  }
}

async function sendFile(res, userPath) {
  const absolute_path = path.join(rootDir, userPath);
  try {
    await fspromises.stat(absolute_path);

    //ADD functionality for opening directories

    let file = await fspromises.readFile(absolute_path, { encoding: "base64" });

    //ADD type filtering here, not all can be opened in browser
    //maybe on front end as well

    const extention = path.extname(absolute_path);
    let mimeType = mime.lookup(extention);
    if (mimeType) {
      res.setHeader("Content-Type", mimeType);
    } else {
      res.status(500).end();
      return;
    }
    res.send(file);
  } catch (error) {
    console.error(error);
    res.json({
      code: 1,
      message: "No such file",
    });
  }
}

//ZIP beforehand
async function downloadDirectory(req, res, relativePath, zip) {
  const path = rootDir + relativePath;
  if (!fspromises.access(path)) {
    throw new Error("Directory does not exist");
  }
  if (!isDirectory(relativePath)) {
    throw new Error("Not a directory...");
  }

  if (zip) {
    zipper.file;
  }
}

async function getFileSize(relativePath) {
  const path = rootDir + relativePath;
  let stats = await fspromises.stat(path, (err) => {
    if (err && err.code === "ENOENT") {
      console.alert(`${path} does not exist`);
    }
  });

  if (!stats.isFile()) {
    throw new Error("Not a file!");
  }

  return stats.size;
}

async function listFiles(path, options) {
  const dir = options && options.relative ? getAbsolutePath(path) : path;

  return fspromises.readdir(dir, { withFileTypes: true }).then((files) => {
    return files.map((x) => ({
      name: x.name,
      type: x.isDirectory() ? 1 : 0,
    }));
  });
  // const files = await fspromises.readdir(dir, { withFileTypes: true });
  // return files.map(x => (
  //     {
  //         name: x.name,
  //         type: x.isDirectory() ? 1 : 0
  //     }));
}

async function userHasFolder(userId) {
  const dir = path.join(rootDir, userId);
  try {
    await fspromises.access(dir);
    return true;
  } catch (err) {
    return false;
  }
}

async function isFile(path) {
  const dir = path.join(rootDir, path);
  await fspromises.stat(dir, (err, stat) => {
    if (err) {
      throw new Error(err);
    } else if (!stat) {
      throw new Error("Missing file stats");
    }
    return stat.isFile();
  });
}
async function isDirectory(path) {
  const dir = path.join(rootDir, path);
  await fspromises.stat(dir, (err, stat) => {
    if (err) {
      throw new Error(err);
    } else if (!stat) {
      throw new Error("Missing file stats");
    }
    return stat.isDirectory();
  });
}

function createFolderPromise(folderName) {
  const dir = path.join(rootDir, folderName);
  return fspromises.mkdir(dir, { recursive: true });
}

//FIXME: pretty breakable then/catch logic
function createFolder(folderName) {
  const dir = path.join(rootDir, folderName);
  return new Promise((resolve, reject) => {
    fspromises
      .access(dir)
      .then(() => {
        reject(new Error("Folder already exists."));
      })
      .catch(() => {
        fspromises
          .mkdir(dir)
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
  });
}

async function renameFile(oldPath, newPath) {
  const absolute_path_old = path.join(rootDir, oldPath);
  const absolute_path_new = path.join(rootDir, newPath);
  try {
    await fspromises.stat(absolute_path_old);
  } catch (err) {
    console.error(err);
    return false;
  }

  try {
    await fspromises.stat(absolute_path_new);
  } catch (err) {
    if (err && err.code !== "ENOENT") {
      console.error(err);
      return false;
    }
  }
  try {
    await fspromises.rename(absolute_path_old, absolute_path_new);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function getFullPath(userPath) {
  return path.join(rootDir, userPath);
}

async function deleteFile(path) {
  let absolute_path = getFullPath(path);
  // try{
  //     await validateFile(absolute_path);
  // }
  // catch(err){
  //     throw new BadRequestError('Could not validate file.');
  // }

  let stats = await fspromises.stat(absolute_path);
  try {
    if (stats.type === 0) {
      await fspromises.unlink(absolute_path);
    } else if (stats.type === 1) {
      await fspromises.rmdir(absolute_path);
    } else throw new Error();

    return;
  } catch (err) {
    throw new InternalServerError("Something went wrong when deleting file.");
  }
}

async function createDirectory(path) {
  let absolute_path = getFullPath(path);

  try {
    await fspromises.access(absolute_path);
    return new BadRequestError("Name already taken.");
  } catch (err) {}
  try {
    await fspromises.mkdir(absolute_path);
    return true;
  } catch (err) {
    return new InternalServerError("Something went wrong.");
  }
}

function getFolderContentPromise(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  fspromises
    .stat(absolutePath)
    .catch((err) => {
      return err;
    })
    .then(() => {});
}

async function getFilesInDirectory(path, options) {
  const finalPath = options && options.relative ? getAbsolutePath(path) : path;

  let stat;
  try {
    stat = await fspromises.stat(finalPath);
  } catch (err) {
    return new BadRequestError("Directory does not exist.");
  }

  if (stat.isDirectory()) {
    return listFiles(finalPath, { relative: true });
  } else {
    return new BadRequestError("Not a directory.");
  }
}

function getAbsolutePath(relPath) {
  return path.join(rootDir, relPath);
}

function createUserFolderPromise(userId, folder) {
  const relativePath = path.join(userId, folder);
  return createFolderPromise(relativePath);
}

module.exports = {
  createFolder,
  userHasFolder,
  listFiles,
  upload,
  downloadFile,
  renameFile,
  sendFile,
  deleteFile,
  createDirectory,
  getFilesInDirectory,
  userFolderExists,
  createFolderPromise,
  folderExists,
  directoryExistsPromise,
  createUserFolderPromise,
};
