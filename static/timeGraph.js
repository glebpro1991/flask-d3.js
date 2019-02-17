
function TimeGraph() {
    let graph, xScale, yScale,
        xAxis, yAxis,
        lineX, lineY, lineZ;

    const offset = 5;

    const graphDim = {
        margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        },
        width: 700,
        height: 200
    };

    let selectors;

    this.init = function(sel) {
        selectors = sel;
        initGraph();
        initAxes();
        appendAxes();
        initLineFunctions();
        initLines();
    };

    function initGraph() {
        graph = d3.select(selectors.graph)
            .attr('width', graphDim.width
                + graphDim.margins.left
                + graphDim.margins.right)
            .attr('height', graphDim.height
                + graphDim.margins.top
                + graphDim.margins.bottom);
    }

    function initLineFunctions() {
        lineX = d3.line().x(function(d) {
            return xScale(d.timestamp);
        }).y(function(d) {
            return yScale(d.x);
        });

        lineY = d3.line().x(function(d) {
            return xScale(d.timestamp);
        }).y(function(d) {
            return yScale(d.y);
        });

        lineZ = d3.line().x(function(d) {
            return xScale(d.timestamp);
        }).y(function(d) {
            return yScale(d.z);
        });
    }

    function initAxes() {
        xScale = d3.scaleLinear()
            .range([graphDim.margins.left,
                graphDim.width - graphDim.margins.right]);
        yScale = d3.scaleLinear()
            .range([graphDim.height - graphDim.margins.top,
                graphDim.margins.bottom]);
        xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(5);
        yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);
    }

    function initLines() {
        initLine(selectors.lines.x, 'red');
        initLine(selectors.lines.y, 'blue');
        initLine(selectors.lines.z, 'green');
    }

    function initLine(className, color) {
        graph.append('svg:path')
            .attr('class', className)
            .attr('stroke', color)
            .attr('stroke-width', 1)
            .attr('fill', 'none');
    }

    function appendAxes() {
        graph.append("svg:g")
            .attr('class', selectors.axes.x)
            .attr("transform", "translate(0," + (graphDim.height - graphDim.margins.bottom) + ")")
            .call(xAxis);
        graph.append("svg:g")
            .attr('class', selectors.axes.y)
            .attr("transform", "translate(" + (graphDim.margins.left) + ",0)")
            .call(yAxis);
    }

    this.redrawLines = function(queue) {
        graph.select(getD3Selector(selectors.lines.x))
            .attr('d', lineX(queue));

        graph.select(getD3Selector(selectors.lines.y))
            .attr('d', lineY(queue));

        graph.select(getD3Selector(selectors.lines.z))
            .attr('d', lineZ(queue));
    };

    this.redrawAxes = function(timeStart, timeEnd, max, min) {
        xScale.domain([timeStart, timeEnd]);
        yScale.domain([min - offset, max + offset]);
        xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(d3.timeFormat('%H:%M:%S'))
            .ticks(5);
        yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);

        graph.selectAll(getD3Selector(selectors.axes.x))
            .call(xAxis);

        graph.selectAll(getD3Selector(selectors.axes.y))
            .call(yAxis);
    };

    function getD3Selector(selector) {
        return selector.split(' ').join('.');
    }
}