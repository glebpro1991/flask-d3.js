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

connect().use(serveStatic(__dirname)).listen(8080, async function () {
    console.log('Server running on 8080...');

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
                jsonArr.push(JSON.parse(msg.payload));
                if(jsonArr.length === 100) {
                    if(typeof clientSocket !== 'undefined') {
                        send(jsonArr);
                    }
                }
            }
        });
        client.query("LISTEN table_update"); // Listen for table updates
    });
});

function send(jsonArr) {
    clientSocket.emit('data', jsonArr);
}
