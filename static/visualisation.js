
function Visualisation() {
    let accTimeQ = [], gyroTimeQ = [], magTimeQ = [],
        accXAmpl = [], accYAmpl = [], accZAmpl = [],
        gyroXAmpl = [], gyroYAmpl = [], gyroZAmpl = [],
        magXAmpl = [], magYAmpl = [], magZAmpl = [],
        // Graphs
        gAccTime, gGyroTime, gMagTime,
        gAccXFreq, gAccYFreq, gAccZFreq,
        gGyroXFreq, gGyroYFreq, gGyroZFreq,
        gMagXFreq, gMagYFreq, gMagZFreq,
        // Other
        qSize = 5000;

    this.init = function() {
        createTimeGraphs();
        initTimeGraphs();
        createFftGraphs();
        initFftGraphs();
    };

    function createTimeGraphs() {
        gAccTime = new TimeGraph();
        gGyroTime = new TimeGraph();
        gMagTime = new TimeGraph();
    }

    function initTimeGraphs() {
        gAccTime.init(selectors.gAccTime);
        gGyroTime.init(selectors.gGyroTime);
        gMagTime.init(selectors.gMagTime);
    }

    function createFftGraphs() {
        gAccXFreq = new FrequencyGraph();
        // gAccYFreq = new FrequencyGraph();
        // gAccZFreq = new FrequencyGraph();
        gGyroXFreq = new FrequencyGraph();
        // gGyroYFreq = new FrequencyGraph();
        // gGyroZFreq = new FrequencyGraph();
        gMagXFreq = new FrequencyGraph();
        // gMagYFreq = new FrequencyGraph();
        // gMagZFreq = new FrequencyGraph();
    }

    function initFftGraphs() {
        gAccXFreq.init(selectors.gAccXFreq);
        // gAccYFreq.init(selectors.gAccYFreq);
        // gAccZFreq.init(selectors.gAccZFreq);
        gGyroXFreq.init(selectors.gGyroXFreq);
        // gGyroYFreq.init(selectors.gGyroYFreq);
        // gGyroZFreq.init(selectors.gGyroZFreq);
        gMagXFreq.init(selectors.gMagXFreq);
        // gMagYFreq.init(selectors.gMagYFreq);
        // gMagZFreq.init(selectors.gMagZFreq);
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
        let fft = {
            acc: {
                x: getFft(accXAmpl),
                y: getFft(accYAmpl),
                z: getFft(accZAmpl)
            },
            gyro: {
                x: getFft(gyroXAmpl),
                y: getFft(gyroYAmpl),
                z: getFft(gyroZAmpl)
            },
            mag: {
                x: getFft(magXAmpl),
                y: getFft(magYAmpl),
                z: getFft(magZAmpl)
            }
        };

        // let accx =  getFft(accXAmpl),
        //     accy = getFft(accYAmpl),
        //     accz = getFft(accZAmpl),
        //     gyrox = getFft(gyroXAmpl),
        //     gyroy = getFft(gyroYAmpl),
        //     gyroz = getFft(gyroZAmpl),
        //     magx = getFft(magXAmpl),
        //     magy = getFft(magYAmpl),
        //     magz = getFft(magZAmpl);
        //
        // let accVals = [], gyroVals = [], magVals = [];
        // for (let i = 0; i < 255; i++) {
        //     accVals[i] = {"x": accx[i], "y": accy[i], "z": accz[i]};
        // }

        redrawFreqGraphs(fft);
    }

    function getFft(data) {
        let fft = cfft(data.slice(0, 256)); // Trim to pow 2
        fft.shift(); // Remove 0 Hz component
        return fft;
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

    function redrawFreqGraphs(fft) {
        gAccXFreq.redraw(fft.acc.x, "red");
        // gAccYFreq.redraw(fft.acc.y, "green");
        // gAccZFreq.redraw(fft.acc.z, "blue");
        // gGyroXFreq.redraw(fft.gyro.x, "red");
        // gGyroYFreq.redraw(fft.gyro.y, "green");
        // gGyroZFreq.redraw(fft.gyro.z, "blue");
        // gMagXFreq.redraw(fft.mag.x, "red");
        // gMagYFreq.redraw(fft.mag.y, "green");
        // gMagZFreq.redraw(fft.mag.z, "blue");
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






