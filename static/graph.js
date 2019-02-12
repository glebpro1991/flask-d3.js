
function Graph() {
    var graph, xScale, yScale,
        xAxis, yAxis,
        lineX, lineY, lineZ;

    var graphDim = {
        margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        },
        width: 700,
        height: 200
    };

    this.init = function(selectors) {
        this.selectors = selectors;
        initGraph(selectors.graph);
        initAxes();
        appendAxes(selectors.axes);
        initLineFunctions();
        initLines(selectors.lines);
    };

    function initGraph(selector) {
        graph = d3.select(selector)
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

    function initLines(selectors) {
        initLine(selectors.x, 'red');
        initLine(selectors.y, 'blue');
        initLine(selectors.z, 'green');
    }

    function initLine(className, color) {
        graph.append('svg:path')
            .attr('class', className)
            .attr('stroke', color)
            .attr('stroke-width', 1)
            .attr('fill', 'none');
    }

    function appendAxes(selectors) {
        graph.append("svg:g")
            .attr('class', selectors.x)
            .attr("transform", "translate(0," + (graphDim.height - graphDim.margins.bottom) + ")")
            .call(xAxis);
        graph.append("svg:g")
            .attr('class', selectors.y)
            .attr("transform", "translate(" + (graphDim.margins.left) + ",0)")
            .call(yAxis);
    }

    this.redrawLines = function(queue) {
        graph.select(getD3Selector(this.selectors.lines.x))
            .attr('d', lineX(queue));

        graph.select(getD3Selector(this.selectors.lines.y))
            .attr('d', lineY(queue));

        graph.select(getD3Selector(this.selectors.lines.z))
            .attr('d', lineZ(queue));
    };

    this.redrawAxes = function(timeStart, timeEnd, yDomain) {
        xScale.domain([timeStart, timeEnd]);
        yScale.domain([-Math.abs(yDomain), yDomain]);
        xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(5);
        yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);

        graph.selectAll(getD3Selector(this.selectors.axes.x))
            .call(xAxis);

        graph.selectAll(getD3Selector(this.selectors.axes.y))
            .call(yAxis);
    };

    function getD3Selector(selector) {
        return selector.split(' ').join('.');
    }
}