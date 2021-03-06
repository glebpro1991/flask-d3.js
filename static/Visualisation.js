
function Visualisation() {
    let accTimeQ = [], gyroTimeQ = [], magTimeQ = [],
        gAccTime, gGyroTime, gMagTime,
        gAccFreq, gGyroFreq, gMagFreq,
        qSize = 5000, ampls = {};

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

            // Ignore Historic Data
            // if(Date.now() - Date.parse(p.time) > 300000) {
            //     document.getElementById("syncTime").innerText = p.time;
            //     return;
            // }

            let accPoint = getTimeDataPoint(p.time, p.accX, p.accY, p.accZ);
            if(accTimeQ.push(accPoint) === qSize)
                accTimeQ.shift();

            let gyroPoint = getTimeDataPoint(p.time, p.gyroX, p.gyroY, p.gyroZ);
            if(gyroTimeQ.push(gyroPoint) === qSize)
                gyroTimeQ.shift();

            let magPoint = getTimeDataPoint(p.time, p.magX, p.magY, p.magZ);
            if(magTimeQ.push(magPoint) === qSize)
                magTimeQ.shift();

            populateAmplitudes(accPoint, gyroPoint, magPoint);
        }

        if(ampls.acc.x.length === 300) {
            populateFrequencyData();
            setAmplitudes();
        }
        updateTimeSeriesView();
    }

    function populateAmplitudes(accPoint, gyroPoint, magPoint) {
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
        gAccTime.redrawAxes(startTime, endTime,
            selectors.gAccTime.scale,
            -selectors.gAccTime.scale);
        gGyroTime.redrawAxes(startTime, endTime,
            selectors.gGyroTime.scale,
            -selectors.gGyroTime.scale);
        gMagTime.redrawAxes(startTime, endTime,
            selectors.gMagTime.scale,
            -selectors.gMagTime.scale);
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

    this.processNewData = function(data) {
        populateTimeSeries(data);
    };
}