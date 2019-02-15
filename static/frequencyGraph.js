function FrequencyGraph() {
    let graph, xScale, yScale,
        xAxis, yAxis;

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

    function initAxes() {
        xScale = d3.scaleLinear()
            .range([graphDim.margins.left,
                graphDim.width - graphDim.margins.right]);
        yScale = d3.scaleLinear()
            .range([graphDim.height - graphDim.margins.top,
                graphDim.margins.bottom]);
        xAxis = d3.axisBottom()
            .scale(xScale);
        yAxis = d3.axisLeft()
            .scale(yScale);
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
}