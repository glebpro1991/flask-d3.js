
function Visualisation() {
    let accTimeQ = [], gyroTimeQ = [], magTimeQ = [],
        gAccTime, gGyroTime, gMagTime,
        gAccFreq, gGyroFreq, gMagFreq,
        qSize = 5000;

    let amplitudes = {};

    this.init = function() {
        setAmplitudes();
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

    function setAmplitudes() {
        amplitudes = {
            acc:{
                x: [],
                y: [],
                z: []
            },
            gyro: {
                x: [],
                y: [],
                z: []
            },
            mag: {
                x: [],
                y: [],
                z: []
            }
        }
    }

    function populateTimeSeries(data) {
        for (let i = 0; i < data.length; i++) {
            let p = data[i];

            let accPoint = getTimeDataPoint(p.time, p.accX, p.accY, p.accZ);
            if(accTimeQ.push(accPoint) === qSize)
                accTimeQ.shift();

            let gyroPoint = getTimeDataPoint(p.time, p.gyroX, p.gyroY, p.gyroZ);
            if(gyroTimeQ.push(gyroPoint) === qSize)
                gyroTimeQ.shift();

            let magPoint = getTimeDataPoint(p.time, p.magX, p.magY, p.magZ);
            if(magTimeQ.push(magPoint) === qSize)
                magTimeQ.shift();

            // Populate amplitude arrays
            amplitudes.acc.x.push(accPoint.x);
            amplitudes.acc.y.push(accPoint.y);
            amplitudes.acc.z.push(accPoint.z);

            amplitudes.gyro.x.push(gyroPoint.x);
            amplitudes.gyro.y.push(gyroPoint.y);
            amplitudes.gyro.z.push(gyroPoint.z);

            amplitudes.mag.x.push(magPoint.x);
            amplitudes.mag.y.push(magPoint.y);
            amplitudes.mag.z.push(magPoint.z);
        }

        if(amplitudes.acc.x.length === 300) {
            populateFrequencyData();
            setAmplitudes();
        }
        updateTimeSeriesView();
    }

    function updateTimeSeriesView() {
        redrawTimeAxes(accTimeQ[0].timestamp,
            accTimeQ[accTimeQ.length - 1].timestamp);
        redrawTimeLines();
    }

    function populateFrequencyData() {
        let fftData = {
            acc: {
                x: fft(amplitudes.acc.x),
                y: fft(amplitudes.acc.y),
                z: fft(amplitudes.acc.z)
            },
            gyro: {
                x: fft(amplitudes.gyro.x),
                y: fft(amplitudes.gyro.y),
                z: fft(amplitudes.gyro.z)
            },
            mag: {
                x: fft(amplitudes.mag.x),
                y: fft(amplitudes.mag.y),
                z: fft(amplitudes.mag.z)
            }
        };
        redrawFftGraphs(fftData);
    }

    function fft(data) {
        let fft = cfft(data.slice(0, 256)); // Reduce data set to pow 2
        fft.shift(); // Remove 0 Hz Component
        return fft.map(function(d, i) {
            return {
                index: i,
                value: Math.sqrt(d.re*d.re + d.im*d.im) }; // Absolute Magnitude
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

    function redrawFftGraphs(fftData) {
        gAccFreq.redraw(processFftData(fftData.acc));
        gGyroFreq.redraw(processFftData(fftData.gyro));
        gMagFreq.redraw(processFftData(fftData.mag));
    }

    function processFftData(data) {
        return {
            data: recombineFftData(data),
            maxValue: getMax(combineXYZFromMultipleArrays(data))
        }
    }

    function redrawTimeLines() {
        gAccTime.redrawLines(accTimeQ);
        gGyroTime.redrawLines(gyroTimeQ);
        gMagTime.redrawLines(magTimeQ);
    }

    function redrawTimeAxes(startTime, endTime) {
        let accData = combineXYZ(accTimeQ);
        let gyroData = combineXYZ(gyroTimeQ);
        let magData = combineXYZ(magTimeQ);

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

    // Extracts x, y, z values into a single array from an array of objects
    function combineXYZ(arr) {
        return arr.map(a => a.x)
            .concat(arr.map(a => a.y))
            .concat(arr.map(a => a.z));
    }

    // Extracts value property from multiple arrays in the object
    function combineXYZFromMultipleArrays(arr) {
        return arr.x.map(a => a.value)
            .concat(arr.y.map(a => a.value))
            .concat(arr.z.map(a => a.value));
    }

    function recombineFftData(data) {
        let values = [];

        for (let i = 0; i < data.x.length; i++) {
            values[i] = {
                "index": i,
                "x": data.x[i].value,
                "y": data.y[i].value,
                "z": data.z[i].value
            };
        }
        return values;
    }

    function getMax(arr) {
        return Math.max.apply(null, arr);
    }

    function getMin(arr) {
        return Math.min.apply(null, arr);
    }

    this.processNewData = function(data) {
        populateTimeSeries(data);
    };

    // Use these to load local data set
    // this.loadJSON = function(callback) {
    //     const xobj = new XMLHttpRequest();
    //     xobj.overrideMimeType("application/json");
    //     xobj.open('GET', '../result.json', true);
    //     xobj.onreadystatechange = function () {
    //         if (xobj.readyState === 4 && xobj.status === 200)
    //             callback(xobj.responseText);
    //     };
    //     xobj.send(null);
    // };
    //
    // this.processLocalDataSet = function(data) {
    //     let batchId = 0;
    //     let batchData;
    //     const dataSet = JSON.parse(data);
    //
    //     for (let i = 0; i < 50000; i++) {
    //         batchData = dataSet.slice(batchId, batchId += 100);
    //         setTimeout(visualisation.processNewData.bind('data', batchData), i*500);
    //     }
    // }
}






