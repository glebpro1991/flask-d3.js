
function Visualisation() {
    let accQueue = [], gyroQueue = [], magQueue = [],
        gAccTime, gGyroTime, gMagTime,
        gAccFreq, gGyroFreq, gMagFreq,
        queueSize = 5000,
        gAccYDomain = 50,
        gGyroYDomain = 25,
        gMagYDomain = 500;

    this.init = function() {
        createGraphs();
    };

    function createGraphs() {
        let selectors;

        gAccTime = new TimeGraph();
        selectors = {
            graph: '#accTime',
            axes: {
                x: ' acc x time axis',
                y: ' acc y time axis'
            },
            lines: {
                x:' accX line',
                y:' accY line',
                z:' accZ line'
            }
        };
        gAccTime.init(selectors);

        gGyroTime = new TimeGraph();
        selectors = {
            graph: '#gyroTime',
            axes: {
                x: ' gyro x time axis',
                y: ' gyro y time axis'
            },
            lines: {
                x:' gyroX line',
                y:' gyroY line',
                z:' gyroZ line'
            }
        };
        gGyroTime.init(selectors);

        gMagTime = new TimeGraph();
        selectors = {
            graph: '#magTime',
            axes: {
                x: ' mag x time axis',
                y: ' mag y time axis'
            },
            lines: {
                x:' magX line',
                y:' magY line',
                z:' magZ line'
            }
        };
        gMagTime.init(selectors);

        gAccFreq = new FrequencyGraph();
        selectors = {
            graph: '#accFreq',
            axes: {
                x: ' acc x freq axis',
                y: ' acc y freq axis'
            }
        };
        gAccFreq.init(selectors);

        gGyroFreq = new FrequencyGraph();
        selectors = {
            graph: '#gyroFreq',
            axes: {
                x: ' gyro x freq axis',
                y: ' gyro y freq axis'
            }
        };
        gGyroFreq.init(selectors);

        gMagFreq = new FrequencyGraph();
        selectors = {
            graph: '#magFreq',
            axes: {
                x: ' mag x freq axis',
                y: ' mag y freq axis'
            }
        };
        gMagFreq.init(selectors);
    }

    this.processNewData = function(data) {
        let acc, gyro, mag, time, point;

        for (let i = 0; i < data.length; i++) {
            point = data[i];
            time = Date.parse(point.time);

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
        gAccTime.redrawLines(accQueue);
        gGyroTime.redrawLines(gyroQueue);
        gMagTime.redrawLines(magQueue);
    }

    function redrawAxes(startTime, endTime) {
        gAccTime.redrawAxes(startTime, endTime, gAccYDomain);
        gGyroTime.redrawAxes(startTime, endTime, gGyroYDomain);
        gMagTime.redrawAxes(startTime, endTime, gMagYDomain);
    }

    this.loadJSON = function(callback) {
        const xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', '../result.json', true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState === 4 && xobj.status === 200)
                callback(xobj.responseText);
        };
        xobj.send(null);
    };

    this.processDataSet = function(data) {
        let batchId = 0;
        let batchData;
        const dataSet = JSON.parse(data);

        for (let i = 0; i < 10000; i++) {
            batchData = dataSet.slice(batchId, batchId += 100);
            setTimeout(visualisation.processNewData.bind('data', batchData), i*1000);
        }
    }
}






