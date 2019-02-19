const connect = require('connect');
const serveStatic = require('serve-static');
const pg = require('pg');
const io = require('socket.io').listen(8081);

const config = {
    user: 'gleb',
    database: 'sensordata',
    password: 'primary1',
    port: 5432
};

let clientSocket, jsonArr = [];

connect().use(serveStatic(__dirname)).listen(8888, async function () {
    console.log('Server running on 8888...');

    const pool = new pg.Pool(config);
    pool.connect(function(err, client, done) {
        if(err)
            console.log(err);
        else
            console.log('Connected to the database');

        // Connect to client script
        io.sockets.on('connection', function (socket) {
	    console.log('Connected to the client!');
            clientSocket = socket;
        });

        // Receive table updates
        client.on('notification', function(msg) {
            if (msg.name === 'notification' && msg.channel === 'table_update') {
                if(typeof clientSocket !== 'undefined') {
                    jsonArr.push(JSON.parse(msg.payload));
                    if(jsonArr.length === 100) {
                        clientSocket.emit('data', jsonArr);
                        jsonArr = [];
                    }
                }
            }
        });
        client.query("LISTEN table_update"); // Listen for table updates
    });
});
