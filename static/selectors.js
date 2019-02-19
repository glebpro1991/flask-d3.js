const props = {
    dimensions: {
        margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        },
        width: 700,
        height: 200,
        offset: 5
    },
    colors: {
        x: "red",
        y: "green",
        z: "blue"
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
        }
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
        }
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
        }
    },
    gAccFreq: {
        graph: '#accFreq',
        axes: {
            x: ' accX x freq axis',
            y: ' accX y freq axis'
        },
        labels: {
            xAxis: 'Frequency (bin)',
            yAxis: 'Amplitude'
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
            yAxis: 'Amplitude'
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
            yAxis: 'Amplitude'
        }
    }
};