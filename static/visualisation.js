
function Visualisation() {
    let accTimeQ = [], gyroTimeQ = [], magTimeQ = [],
        accXAmpl = [], accYAmpl = [], accZAmpl = [],
        gyroXAmpl = [], gyroYAmpl = [], gyroZAmpl = [],
        magXAmpl = [], magYAmpl = [], magZAmpl = [],
        gAccTime, gGyroTime, gMagTime,
        gAccXFreq, gAccYFreq, gAccZFreq,
        gGyroXFreq, gGyroYFreq, gGyroZFreq,
        gMagXFreq, gMagYFreq, gMagZFreq,
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
        // Accelerometer
        gAccXFreq = new FrequencyGraph();
        gAccXFreq.init(selectors.gAccXFreq);

        gAccYFreq = new FrequencyGraph();
        gAccYFreq.init(selectors.gAccYFreq);

        gAccZFreq = new FrequencyGraph();
        gAccZFreq.init(selectors.gAccZFreq);

        // Gyroscope
        gGyroXFreq = new FrequencyGraph();
        gGyroXFreq.init(selectors.gGyroXFreq);

        gGyroYFreq = new FrequencyGraph();
        gGyroYFreq.init(selectors.gGyroYFreq);

        gGyroZFreq = new FrequencyGraph();
        gGyroZFreq.init(selectors.gGyroZFreq);

        // Magnetometer
        gMagXFreq = new FrequencyGraph();
        gMagXFreq.init(selectors.gMagXFreq);

        gMagYFreq = new FrequencyGraph();
        gMagYFreq.init(selectors.gMagYFreq);

        gMagZFreq = new FrequencyGraph();
        gMagZFreq.init(selectors.gMagZFreq);
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
        accYAmpl = [];
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
        redrawFreqGraphs(fft);
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

    function getMax(arr) {
        return Math.max.apply(null, arr);
    }

    function getMin(arr) {
        return Math.min.apply(null, arr);
    }

    function redrawFreqGraphs(fft) {
        fft.acc.x.shift(); // Remove 0 Hz component
        gAccXFreq.redraw(fft.acc.x, "red");
        fft.acc.y.shift(); // Remove 0 Hz component
        gAccYFreq.redraw(fft.acc.y, "green");
        fft.acc.z.shift(); // Remove 0 Hz component
        gAccZFreq.redraw(fft.acc.z, "blue");

        fft.gyro.x.shift(); // Remove 0 Hz component
        gGyroXFreq.redraw(fft.gyro.x, "red");
        fft.gyro.y.shift(); // Remove 0 Hz component
        gGyroYFreq.redraw(fft.gyro.y, "green");
        fft.gyro.z.shift(); // Remove 0 Hz component
        gGyroZFreq.redraw(fft.gyro.z, "blue");

        fft.mag.x.shift(); // Remove 0 Hz component
        gMagXFreq.redraw(fft.mag.x, "red");
        fft.mag.y.shift(); // Remove 0 Hz component
        gMagYFreq.redraw(fft.mag.y, "green");
        fft.mag.z.shift(); // Remove 0 Hz component
        gMagZFreq.redraw(fft.mag.z, "blue");
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






