//ADD path checking/auth mechanism??
//ADD user folder/file name caching

const fspromises = require('fs/promises');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const zipper = require('node-zip');
const mime = require('mime-types');
const { BadRequestError, InternalServerError } = require('./customErrors/CustomError');
const helpers = require("./helpers");

const rootDir = path.join(__dirname, 'files');

const multerStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        //FIX should go to appropriate folder
        let {filepath} = helpers.getQueryJSON(req);
        if(!filepath){
            filepath='/';
        }
        cb(null, `files/${req.session.userId}${path}`);
    },

    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

async function downloadFile(res, relativePath){
    const absolutePath = path.join(rootDir, relativePath);
    try{
        await fspromises.access(absolutePath);
    }
    catch{
        res.json({
            code:1,
            message:'No such file'
        });
    }
        
    try{
        if(!isFile(absolutePath)){
            throw new Error('Not a file...');
        }
        res.download(absolutePath, (err)=>{
            if(err){
                console.log('Downloading file error: ' + err);
            }
        });
    }
    catch(e){
        res.send({
            code:1,
            userMessage:'This is not a file'
        });
    }
}

async function sendFile(res, userPath){
    const absolute_path = path.join(rootDir, userPath);
    try{
        await fspromises.stat(absolute_path);

        //ADD functionality for opening directories

        let file = await fspromises.readFile(absolute_path, {encoding:'base64'});

        //ADD type filtering here, not all can be opened in browser
        //maybe on front end as well

        const extention = path.extname(absolute_path);
        let mimeType = mime.lookup(extention);
        if(mimeType){
            res.setHeader('Content-Type', mimeType);
        }
        else{
            res.status(500).end();
            return;
        }
        res.send(file);
    }
    catch(error){
        console.error(error);
        res.json({
            code:1,
            message:'No such file'
        });
    }
}

//ZIP beforehand
async function downloadDirectory(req, res, relativePath, zip){
    const path = rootDir+relativePath;
    if(!fspromises.access(path)){
        throw new Error('Directory does not exist');
    }
    if(!isDirectory(relativePath)){
        throw new Error('Not a directory...');
    }

    if(zip){
        zipper.file
    }
};

async function getFileSize(relativePath){
    const path = rootDir + relativePath;
    let stats = await fspromises.stat(path, (err)=>{
        if(err && err.code === 'ENOENT'){
            console.alert(`${path} does not exist`);
        }
    });

    if(!stats.isFile()){
        throw new Error('Not a file!');
    }

    return stats.size;
}

async function listFiles(userPath){
    let dir = path.join(rootDir, userPath);

    const files = await fspromises.readdir(dir, {withFileTypes:true});
    return files.map(x=>(
        {
            name:x.name,
            type:x.isDirectory()?1:0
        }));
}

async function userHasFolder(folderPath){
    try{
        await fspromises.access(folderPath);
        return true;
    }
    catch(err){
        return false;
    }    
}

async function isFile(path){
    const dir = path.join(rootDir, path);
    await fspromises.stat(dir, (err, stat)=>{
        if(err){
            throw new Error(err);
        }
        else if(!stat){
            throw new Error('Missing file stats');
        }
        return stat.isFile();
    });
}
async function isDirectory(path){
    const dir = path.join(rootDir, path);
    await fspromises.stat(dir, (err, stat)=>{
        if(err){
            throw new Error(err);
        }
        else if(!stat){
            throw new Error('Missing file stats');
        }
        return stat.isDirectory();
    });
}

async function createFolder(folderName){
    const dir = path.join(rootDir, folderName);
    fspromises.stat(dir, (err)=>{
        if(err && err.code !== 'ENOENT'){
            throw err;
        }

        fspromises.mkdir(dir, (e)=>{
            if(e){
                console.log(`Could not create directory ${dir}: ${e}`);
            }
        });
    });
}

async function renameFile(oldPath, newPath){
    const absolute_path_old = path.join(rootDir, oldPath);
    const absolute_path_new = path.join(rootDir, newPath);
    try{
        await fspromises.stat(absolute_path_old);
        
    }
    catch(err){
        console.error(err);
        return false;
    }

    try{
        await fspromises.stat(absolute_path_new);
    }
    catch(err){
        if(err && err.code !== 'ENOENT'){
            console.error(err);
            return false;
        }
    }
    try{
        await fspromises.rename(absolute_path_old, absolute_path_new);
        return true
    }
    catch(err){
        console.error(err);
        return false;
    }
}

function getFullPath(userPath){
    return path.join(rootDir, userPath);
}

async function deleteFile(path){
    let absolute_path = getFullPath(path);
    // try{
    //     await validateFile(absolute_path);
    // }
    // catch(err){
    //     throw new BadRequestError('Could not validate file.');
    // }

    let stats = await fspromises.stat(absolute_path);
    try{
        if(stats.type === 0){
            await fspromises.unlink(absolute_path);
        }
        else if(stats.type === 1){
            await fspromises.rmdir(absolute_path);
        }
        else throw new Error();

        return;
    }
    catch(err){
        throw new InternalServerError('Something went wrong when deleting file.');
    }
}

async function createDirectory(path){
    let absolute_path = getFullPath(path);

    try{
        await fspromises.access(absolute_path);
        return new BadRequestError('Name already taken.');
    }
    catch(err){
        
    }
    try{
        await fspromises.mkdir(absolute_path);
        return true;
    }
    catch(err){
        return new InternalServerError('Something went wrong.');
    }

}

async function getFilesInDirectory(userPath){
    const absolute_path = path.join(rootDir, userPath);
    
    //ADD validation that dir exists

    let stat;
    try{
        stat = await fspromises.stat(absolute_path);
    }
    catch(err){
        return new BadRequestError('Directory does not exist.');
    }

    if(stat.isDirectory()){
        return listFiles(userPath);
    }
    else{
        return new BadRequestError('Not a directory.');
    }
}

module.exports = {
    createFolder,
    userHasFolder,
    listFiles,
    multerStorage,
    downloadFile,
    renameFile,
    sendFile,
    deleteFile,
    createDirectory,
    getFilesInDirectory
}