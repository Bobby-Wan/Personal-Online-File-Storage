import fs from "fs";
import crypto from "crypto";
import {AuthContext, ClientInfo, Connection} from "ssh2";
import * as ssh2 from "ssh2";

const port = 1234;

const allowedUser = Buffer.from('username');
const allowedPassword = Buffer.from('password');

function checkValue(input, allowed) {
    const autoReject = (input.length !== allowed.length);
    if (autoReject) {
      // Prevent leaking length information by always making a comparison with the
      // same input when lengths don't match what we expect ...
      allowed = input;
    }
    const isMatch = crypto.timingSafeEqual(input, allowed);
    return (!autoReject && isMatch);
  }

new ssh2.Server({
    // Use absolute path here
    hostKeys: [fs.readFileSync('D:\\Projects\\NodeJS\\Personal-File-Server\\Personal-Online-File-Storage\\src\\server\\example_keys\\public.txt')],
    banner: "This is our server",
}, (client: Connection, info: ClientInfo) => {
    console.log(`Connection requested by ${info.ip}`);
    client.on('authentication', (ctx: AuthContext) => {
        console.log("Authentication works");
    });
}).listen(port, 'localhost', function () {
    console.log('Listening on port ' + port);
});