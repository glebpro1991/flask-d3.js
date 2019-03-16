
function Visualisation() {
    let accTimeQ = [], gyroTimeQ = [], magTimeQ = [],
        gAccTime, gGyroTime, gMagTime,
        gAccFreq, gGyroFreq, gMagFreq,
        qSize = 5000;

    let ampls = {};

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
        ampls = {
            acc:{x: [], y: [], z: []},
            gyro: {x: [], y: [], z: []},
            mag: {x: [], y: [], z: []}
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
            ampls.acc.x.push(accPoint.x);
            ampls.acc.y.push(accPoint.y);
            ampls.acc.z.push(accPoint.z);

            ampls.gyro.x.push(gyroPoint.x);
            ampls.gyro.y.push(gyroPoint.y);
            ampls.gyro.z.push(gyroPoint.z);

            ampls.mag.x.push(magPoint.x);
            ampls.mag.y.push(magPoint.y);
            ampls.mag.z.push(magPoint.z);
        }

        if(ampls.acc.x.length === 300) {
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
                x: fft(ampls.acc.x),
                y: fft(ampls.acc.y),
                z: fft(ampls.acc.z)
            },
            gyro: {
                x: fft(ampls.gyro.x),
                y: fft(ampls.gyro.y),
                z: fft(ampls.gyro.z)
            },
            mag: {
                x: fft(ampls.mag.x),
                y: fft(ampls.mag.y),
                z: fft(ampls.mag.z)
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
            data: recombineFftData(data).splice(0, 128),
            maxValue: getMax(combineXYZFromMultipleArrays(data))
        }
    }

    function redrawTimeLines() {
        gAccTime.redrawLines(accTimeQ);
        gGyroTime.redrawLines(gyroTimeQ);
        gMagTime.redrawLines(magTimeQ);
    }

    function redrawTimeAxes(startTime, endTime) {
        // Uncomment these lines to scale axes dynamically
        // let accData = combineXYZ(accTimeQ);
        // let gyroData = combineXYZ(gyroTimeQ);
        // let magData = combineXYZ(magTimeQ);

        gAccTime.redrawAxes(startTime, endTime,
            selectors.gAccTime.scale,
            -selectors.gAccTime.scale);
            // getMax(accData), // Uncomment these lines to scale axes dynamically
            // getMin(accData));
        gGyroTime.redrawAxes(startTime, endTime,
            selectors.gGyroTime.scale,
            -selectors.gGyroTime.scale);
            // getMax(gyroData), // Uncomment these lines to scale axes dynamically
            // getMin(gyroData));
        gMagTime.redrawAxes(startTime, endTime,
            selectors.gMagTime.scale,
            -selectors.gMagTime.scale);
            // getMax(magData), // Uncomment these lines to scale axes dynamically
            // getMin(magData));
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

    // Uncomment these lines to scale axes dynamically
    // function getMin(arr) {
    //     return Math.min.apply(null, arr);
    // }

    this.processNewData = function(data) {
        populateTimeSeries(data);
    };

    // Uncomment these lines to load local data set
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






