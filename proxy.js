const { exec, spawn } = require('child_process');
const Net = require('net');
const { exit } = require('process');

const localPort = 8080;
const remoteHost = "www.google.com";
const remotePort = 443;

const openssl_binary = '/mnt/m/MobileShare/Work/RBC/test-openssl-https-client/openssl/openssl-live/apps/openssl';
const openssl_params = ['s_client', '-connect', `${remoteHost}:${remotePort}`, '-ign_eof'];
// Uncomment this if you want mutual TLS
// spawnParams.push(['-cert', 'my.crt', '-key', 'my.key']);

exec(`${openssl_binary} version`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Failed executing ${openssl_binary}; aborting execution.`);
        exit(1);
    }
    if (stderr) {
        console.warn(`Received error ${stderr} when attempting to execute ${openssl_binary}. Attempting to continue.`);
    }
    if (stdout) {
        console.log(`Using ${stdout.trim()}`);
    }
});

const server = new Net.Server();
server.listen(localPort, function() {
    console.log(`Server listening on http://localhost:${localPort}/ and serving https://${remoteHost}:${remotePort}/`);
});

server.on('connection', function(socket) {
    var finishedOpensslHeader = false;
    console.log('[[[ A new connection has been established.');
    const childProcess = spawn(openssl_binary, openssl_params);

    childProcess.stdout.on('data', (data) => {
        console.log(`>>-- server -->> ${data.length} bytes`);
        if (!finishedOpensslHeader) {
            finishedOpensslHeader = data.toString().trimEnd().endsWith("---");
            if (finishedOpensslHeader) {
                console.log("Finished TLS handshake");
            } else {
                console.log("(Still in TLS handshake)");
            }
            return;
        }
        socket.write(data);
    });

    childProcess.stderr.on('data', (data) => {
        console.error("--- openssl error ---");
        console.error(data.toString().trim());
        console.error("---------------------");
    });

    childProcess.on('close', (code) => {
        console.log(`openssl exited with code ${code}`);
        socket.end();
    });

    childProcess.on('error', (error) => {
        console.log(`Error in openssl: ${error}`);
        socket.end();
    });

    socket.on('data', function(chunk) {
        chunk = chunk.toString().replace(`Host: localhost:${localPort}`, `Host: ${remoteHost}:${remotePort}`)
        console.log(`<<-- client --<< ${chunk.toString().length} bytes`);
        childProcess.stdin.write(chunk);
    });

    socket.on('end', function() {
        console.log('Closing connection with the client');
        childProcess.kill();
    });

    socket.on('error', function(err) {
        console.log(`Socket error: ${err}`);
    });
});
