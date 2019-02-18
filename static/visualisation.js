
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
        createFftGraphs();
    };

    function createTimeGraphs() {
        gAccTime = new TimeGraph();
        gGyroTime = new TimeGraph();
        gMagTime = new TimeGraph();
        initTimeGraphs();
    }

    function initTimeGraphs() {
        gAccTime.init(selectors.gAccTime);
        gGyroTime.init(selectors.gGyroTime);
        gMagTime.init(selectors.gMagTime);
    }

    function createFftGraphs() {
        gAccFreq = new FrequencyGraph();
        gGyroFreq = new FrequencyGraph();
        gMagFreq = new FrequencyGraph();
        initFftGraphs();
    }

    function initFftGraphs() {
        gAccFreq.init(selectors.gAccFreq);
        gGyroFreq.init(selectors.gGyroFreq);
        gMagFreq.init(selectors.gMagFreq);
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
        updateTimeSeriesView();
    }

    function resetAmplArrays() {
        accXAmpl = [], accYAmpl = [], accZAmpl = [];
        gyroXAmpl = [], gyroYAmpl = [], gyroZAmpl = [];
        magXAmpl = [], magYAmpl = [], magZAmpl = [];
    }

    function updateTimeSeriesView() {
        redrawTimeAxes(accTimeQ[0].timestamp,
            accTimeQ[accTimeQ.length - 1].timestamp);
        redrawTimeLines();
    }

    function populateFrequencyData() {
        let fftData = {
            acc: {
                x: fft(accXAmpl),
                y: fft(accYAmpl),
                z: fft(accZAmpl)
            },
            gyro: {
                x: fft(gyroXAmpl),
                y: fft(gyroYAmpl),
                z: fft(gyroZAmpl)
            },
            mag: {
                x: fft(magXAmpl),
                y: fft(magYAmpl),
                z: fft(magZAmpl)
            }
        };
        redrawFreqGraphs(fftData);
    }

    function fft(data) {
        let fft = cfft(data.slice(0, 256)); // Reduce dataset to pow 2
        fft.shift(); // Remove 0 Hz component
        return fft.map(function(d, i) {
            return {
                index: i,
                value: Math.sqrt(d.re*d.re + d.im*d.im) }; // Absolute magnitude
        });
    }

    function getTimeDataPoint(time, x, y, z) {
        return {
            timestamp: Date.parse(time),
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z)
        };
    }

    function redrawTimeLines() {
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

    function getMax(arr) {
        return Math.max.apply(null, arr);
    }

    function getMin(arr) {
        return Math.min.apply(null, arr);
    }

    function redrawFreqGraphs(data) {
        gAccFreq.redraw(data.acc);
        gGyroFreq.redraw(data.gyro);
        gMagFreq.redraw(data.mag);
    }

    // Model
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






