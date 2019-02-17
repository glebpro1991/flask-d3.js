
function Visualisation() {
    let accTimeQ = [], gyroTimeQ = [], magTimeQ = [],
        accXAmpl = [], accYAmpl = [], accZAmpl = [],
        gyroXAmpl = [], gyroYAmpl = [], gyroZAmpl = [],
        magXAmpl = [], magYAmpl = [], magZAmpl = [],
        gAccTime, gGyroTime, gMagTime,
        gAccFreq, gGyroFreq, gMagFreq,
        qSize = 5000;

    this.init = function() {
        createTimeGraphs();
        createFrequencyGraphs();
    };

    function createTimeGraphs() {
        gAccTime = new TimeGraph();
        gAccTime.init(selectors.gAccTime);
        gGyroTime = new TimeGraph();
        gGyroTime.init(selectors.gGyroTime);
        gMagTime = new TimeGraph();
        gMagTime.init(selectors.gMagTime);
    }

    function createFrequencyGraphs() {
        gAccFreq = new FrequencyGraph();
        gAccFreq.init(selectors.gAccFreq);
        // gGyroFreq = new FrequencyGraph();
        // gGyroFreq.init(selectors.gGyroFreq);
        // gMagFreq = new FrequencyGraph();
        // gMagFreq.init(selectors.gMagFreq);
    }

    function populateTimeSeries(data) {
        for (let i = 0; i < data.length; i++) {
            let p = data[i];

            let accPoint = getTimeDataPoint(p.time, p.accX, p.accY, p.accZ);
            accXAmpl.push(accPoint.x);
            accYAmpl.push(accPoint.y);
            accZAmpl.push(accPoint.z);
            if(accTimeQ.push(accPoint) === qSize)
                accTimeQ.shift();

            let gyroPoint = getTimeDataPoint(p.time, p.gyroX, p.gyroY, p.gyroZ);
            gyroXAmpl.push(gyroPoint.x);
            gyroYAmpl.push(gyroPoint.y);
            gyroZAmpl.push(gyroPoint.z);
            if(gyroTimeQ.push(gyroPoint) === qSize)
                gyroTimeQ.shift();

            let magPoint = getTimeDataPoint(p.time, p.magX, p.magY, p.magZ);
            magXAmpl.push(magPoint.x);
            magYAmpl.push(magPoint.y);
            magZAmpl.push(magPoint.z);
            if(magTimeQ.push(magPoint) === qSize)
                magTimeQ.shift();
        }

        if(accXAmpl.length === 300) {
            populateFrequencyData();
            resetAmplArrays();
        }

        updateView();
    }

    function resetAmplArrays() {
        accXAmpl = [];
        accXAmpl = [];
        accZAmpl = [];
        gyroXAmpl = [];
        gyroYAmpl = [];
        gyroZAmpl = [];
        magXAmpl = [];
        magYAmpl = [];
        magZAmpl = [];
    }

    function updateView() {
        redrawTimeAxes(accTimeQ[0].timestamp,
            accTimeQ[accTimeQ.length - 1].timestamp);
        redrawLines();
    }

    function populateFrequencyData() {
        let fft = {
            acc: {
                x: cfft(accXAmpl.slice(0, 256)),
                y: cfft(accYAmpl.slice(0, 256)),
                z: cfft(accZAmpl.slice(0, 256))
            },
            gyro: {
                x: cfft(gyroXAmpl.slice(0, 256)),
                y: cfft(gyroYAmpl.slice(0, 256)),
                z: cfft(gyroZAmpl.slice(0, 256))
            },
            mag: {
                x: cfft(magXAmpl.slice(0, 256)),
                y: cfft(magYAmpl.slice(0, 256)),
                z: cfft(magZAmpl.slice(0, 256))
            }
        };
        redrawFreqAxes(fft);
    }

    function getTimeDataPoint(time, x, y, z) {
        return {
            timestamp: Date.parse(time),
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z)
        };
    }

    function redrawLines() {
        gAccTime.redrawLines(accTimeQ);
        gGyroTime.redrawLines(gyroTimeQ);
        gMagTime.redrawLines(magTimeQ);
    }

    function redrawTimeAxes(startTime, endTime) {
        let accData = getArrayProperties(accTimeQ);
        let gyroData = getArrayProperties(gyroTimeQ);
        let magData = getArrayProperties(magTimeQ);

        gAccTime.redrawAxes(startTime, endTime,
            getMax(accData),
            getMin(accData));
        gGyroTime.redrawAxes(startTime, endTime,
            getMax(gyroData),
            getMin(gyroData));
        gMagTime.redrawAxes(startTime, endTime,
            getMax(magData),
            getMin(magData));
    }

    function getArrayProperties(arr) {
        return arr.map(a => a.x)
            .concat(arr.map(a => a.y))
            .concat(arr.map(a => a.z));
    }

    function getArraysProperty(xFft, yFft, zFft) {
        return xFft.map(a => a.re)
            .concat(yFft.map(a => a.re))
            .concat(zFft.map(a => a.re));
    }

    function getMax(arr) {
        return Math.max.apply(null, arr);
    }

    function getMin(arr) {
        return Math.min.apply(null, arr);
    }

    function redrawFreqAxes(fft) {
        let realAccComponents = getArraysProperty(
            fft.acc.x,
            fft.acc.y,
            fft.acc.z);
        let realGyroComponents = getArraysProperty(
            fft.gyro.x,
            fft.acc.y,
            fft.gyro.z);
        let realMagComponents = getArraysProperty(
            fft.mag.x,
            fft.mag.y,
            fft.mag.z);

        // gAccFreq.redrawAxis(getMax(realAccComponents));
        // gGyroFreq.redrawAxis(getMax(realGyroComponents));
        // gMagFreq.redrawAxis(getMax(realMagComponents));

    }

    function redrawBars() {

    }

    this.processNewData = function(data) {
        populateTimeSeries(data);
    };

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

    this.processLocalDataSet = function(data) {
        let batchId = 0;
        let batchData;
        const dataSet = JSON.parse(data);

        for (let i = 0; i < 50000; i++) {
            batchData = dataSet.slice(batchId, batchId += 100);
            setTimeout(visualisation.processNewData.bind('data', batchData), i*500);
        }
    }
}






