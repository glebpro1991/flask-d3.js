const props = {
    dimensions: {
        margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        },
        width: 400,
        frequencyWidth: 400,
        height: 150,
        offset: 5
    },
    sensorAxes: [{
        name: 'x',
        colour: 'red'
    },{
        name: 'y',
        colour: 'blue'
    },{
        name: 'z',
        colour: 'green'
    }],
    colors: {
        x: "red",
        y: "blue",
        z: "green"
    }
};

const selectors = {
    gAccTime: {
        graph: '#accTime',
        axes: {
            x: ' acc x time axis',
            y: ' acc y time axis'
        },
        lines: {
            x: ' accX line',
            y: ' accY line',
            z: ' accZ line'
        },
        labels: {
            xAxis: 'Time',
            yAxis: 'Acceleration (m/s^2)'
        },
        scale: 40
    },
    gGyroTime: {
        graph: '#gyroTime',
        axes: {
            x: ' gyro x time axis',
            y: ' gyro y time axis'
        },
        lines: {
            x: ' gyroX line',
            y: ' gyroY line',
            z: ' gyroZ line'
        },
        labels: {
            xAxis: 'Time',
            yAxis: 'Angular velocity (rad/s)'
        },
        scale: 30
    },
    gMagTime: {
        graph: '#magTime',
        axes: {
            x: ' mag x time axis',
            y: ' mag y time axis'
        },
        lines: {
            x: ' magX line',
            y: ' magY line',
            z: ' magZ line'
        },
        labels: {
            xAxis: 'Time',
            yAxis: 'Magnetic field (μT)'
        },
        scale: 100
    },
    gAccFreq: {
        graph: '#accFreq',
        axes: {
            x: ' accX x freq axis',
            y: ' accX y freq axis'
        },
        labels: {
            xAxis: 'Frequency (bin)',
            yAxis: 'Amplitude (m/s^2)'
        }
    },
    gGyroFreq: {
        graph: '#gyroFreq',
        axes: {
            x: ' gyro x freq axis',
            y: ' gyro y freq axis'
        },
        labels: {
            xAxis: 'Frequency (bin)',
            yAxis: 'Amplitude (rad/s)'
        }
    },
    gMagFreq: {
        graph: '#magFreq',
        axes: {
            x: ' mag x freq axis',
            y: ' mag y freq axis'
        },
        labels: {
            xAxis: 'Frequency (bin)',
            yAxis: 'Amplitude (μT)'
        }
    }
};
