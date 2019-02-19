
function TimeGraph() {
    let graph, xScale, yScale,
        xAxis, yAxis,
        lineX, lineY, lineZ;
    let sel;

    this.init = function(selectors) {
        sel = selectors;
        initGraph();
        initAxes();
        appendAxes();
        appendLabels();
        initLineFunctions();
        initLines();
    };

    function initGraph() {
        graph = d3.select(sel.graph)
            .attr('width', props.dimensions.width
                + props.dimensions.margins.left
                + props.dimensions.margins.right)
            .attr('height', props.dimensions.height
                + props.dimensions.margins.top
                + props.dimensions.margins.bottom);
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
            .range([props.dimensions.margins.left,
                props.dimensions.width - props.dimensions.margins.right]);
        yScale = d3.scaleLinear()
            .range([props.dimensions.height - props.dimensions.margins.top,
                props.dimensions.margins.bottom]);
        xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(5);
        yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);
    }

    function initLines() {
        initLine(sel.lines.x, props.colors.x);
        initLine(sel.lines.y, props.colors.y);
        initLine(sel.lines.z, props.colors.z);
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
            .attr('class', sel.axes.x)
            .attr("transform", "translate(0," + (props.dimensions.height - props.dimensions.margins.bottom) + ")")
            .text("Label")
            .call(xAxis);

        graph.append("svg:g")
            .attr('class', sel.axes.y)
            .attr("transform", "translate(" + (props.dimensions.margins.left) + ",0)")
            .call(yAxis);
    }

    function appendLabels() {
        graph.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", props.dimensions.width/2)
            .attr("y", props.dimensions.height + 10)
            .text(sel.labels.xAxis);

        graph.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 5)
            .attr("dy", ".75em")
            .attr("x", -40)
            .attr("transform", "rotate(-90)")
            .text(sel.labels.yAxis);
    }

    this.redrawLines = function(queue) {
        graph.select(getD3Selector(sel.lines.x))
            .attr('d', lineX(queue));

        graph.select(getD3Selector(sel.lines.y))
            .attr('d', lineY(queue));

        graph.select(getD3Selector(sel.lines.z))
            .attr('d', lineZ(queue));
    };

    this.redrawAxes = function(timeStart, timeEnd, max, min) {
        xScale.domain([timeStart, timeEnd]);
        yScale.domain([min - props.dimensions.offset, max + props.dimensions.offset]);
        xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(d3.timeFormat('%d %b - %H:%M:%S'))
            .ticks(5);
        yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);

        graph.selectAll(getD3Selector(sel.axes.x))
            .call(xAxis);

        graph.selectAll(getD3Selector(sel.axes.y))
            .call(yAxis);
    };

    function getD3Selector(selector) {
        return selector.split(' ').join('.');
    }
}