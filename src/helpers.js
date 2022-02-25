const url = require('url');
const path = require('path');

// let defaultCookieOptions = {
//     secure:true,
//     httpOnly:true,
//     domain:'localhost',
//     maxAge:3600,
//     sameSite:'strict'
// };

// function updateSession(req,res,user){
//     if(!req.session.user){
//         req.session.user = user;
//     }
// }

function getQueryJSON(req){
    return url.parse(req.url, true).query;
}

function getRealPath(requestPath){
    if(!requestPath){
        throw new Error('Invalid path');
    }

    const splitPath = requestPath.split('/');
    if(splitPath.length === 0 || splitPath.length === 1){
        return '.';
    }

    if(splitPath.length === 2 && splitPath[0] === '' && splitPath[1] === ''){
        return '.';
    }
    let currentPath = splitPath.reduce((acc,cur)=> path.join(acc,cur));

    return currentPath;
}

function isValidRelativePath(path){
    return !(path.includes('..') || path.includes('~'));
}
function validatePath(req, res, next){
    const path = req.query.path;
    if(path && isValidRelativePath(path)){
        next();
        return;
    }

    res.status(400).send({error:'Invalid path', data:null});
    return;
}

function getUserPath(userId, relativePath){
    const realPath = getRealPath(relativePath);
    userPath = path.join(userId, realPath);

    return userPath;
}

module.exports = {
    getQueryJSON,
    getUserPath,
    getRealPath,
    validatePath
}