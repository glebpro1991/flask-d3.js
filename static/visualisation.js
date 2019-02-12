
function Visualisation() {
    var accQueue = [], gyroQueue = [], magQueue = [],
        gAcc, gGyro, gMag,
        queueSize = 5000,
        gAccYDomain = 50,
        gGyroYDomain = 25,
        gMagYDomain = 500;

    this.init = function() {
        createGraphs();
    };

    function createGraphs() {
        var selectors;

        gAcc = new Graph();
        selectors = {
            graph: '#acc',
            axes: {
                x: ' acc x axis',
                y: ' acc y axis'
            },
            lines: {
                x:' accX line',
                y:' accY line',
                z:' accZ line'
            }
        };
        gAcc.init(selectors);

        gGyro = new Graph();
        selectors = {
            graph: '#gyro',
            axes: {
                x: ' gyro x axis',
                y: ' gyro y axis'
            },
            lines: {
                x:' gyroX line',
                y:' gyroY line',
                z:' gyroZ line'
            }
        };
        gGyro.init(selectors);

        gMag = new Graph();
        selectors = {
            graph: '#mag',
            axes: {
                x: ' mag x axis',
                y: ' mag y axis'
            },
            lines: {
                x:' magX line',
                y:' magY line',
                z:' magZ line'
            }
        };
        gMag.init(selectors);
    }

    this.processNewData = function(data) {
        var acc, gyro, mag, time, point;

        for (var i = 0; i < data.length; i++) {
            point = data[i];
            time = new Date().getTime();

            acc = getDataPoint(time, parseInt(point.accX), parseInt(point.accY), parseInt(point.accZ));
            gyro = getDataPoint(time, parseInt(point.gyroX), parseInt(point.gyroY), parseInt(point.gyroZ));
            mag = getDataPoint(time, parseInt(point.magX), parseInt(point.magY), parseInt(point.magZ));

            if(accQueue.push(acc) === queueSize)
                accQueue.shift();

            if(gyroQueue.push(gyro) === queueSize)
                gyroQueue.shift();

            if(magQueue.push(mag) === queueSize)
                magQueue.shift();
        }

        redrawAxes(accQueue[0].timestamp, accQueue[accQueue.length - 1].timestamp);
        redrawLines();
    };

    function getDataPoint(time, x, y, z) {
        return { timestamp: time, x: x, y: y, z: z};
    }

    function redrawLines() {
        gAcc.redrawLines(accQueue);
        gGyro.redrawLines(gyroQueue);
        gMag.redrawLines(magQueue);
    }

    function redrawAxes(startTime, endTime) {
        gAcc.redrawAxes(startTime, endTime, gAccYDomain);
        gGyro.redrawAxes(startTime, endTime, gGyroYDomain);
        gMag.redrawAxes(startTime, endTime, gMagYDomain);
    }

    // Pad zeros to index JSON data
    Number.prototype.pad = function(size) {
        var s = String(this);
        while (s.length < (size || 2)) {s = "0" + s;}
        return s;
    };

}






