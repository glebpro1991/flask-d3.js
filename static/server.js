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

let clientSocket;
let jsonArr = [];

connect().use(serveStatic(__dirname)).listen(8080, async function () {
    console.log('Server running on 8080...');

    const pool = new pg.Pool(config);
    pool.connect(function(err, client, done) {
        if(err) {
            console.log(err);
        } else {
            console.log('connected');
        }

        io.sockets.on('connection', function (socket) {
	    console.log('Connection successful!');
            clientSocket = socket;
        });

        client.on('notification', function(msg) {
            if (msg.name === 'notification' && msg.channel === 'table_update') {
                jsonArr.push(JSON.parse(msg.payload));
                if(jsonArr.length === 100) {
                    send(jsonArr);
                    jsonArr = [];
                }
            }

        });
        client.query("LISTEN table_update");
    });
});

function send(jsonArr) {
    console.log('sending');
    clientSocket.emit('news', jsonArr);
    clientSocket.on('my other event', function (data) {
        console.log('received');
    });
}
