function FrequencyGraph() {
    let graph, xScale, yScale, g,
        xAxis, yAxis,
        selectors;

    const graphDim = {
        margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        },
        width: 400,
        height: 200
    };

    this.init = function(sel) {
        selectors = sel;
        initAxes();
        initGraph();
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
        g = graph.append("g");
    }

    function initAxes() {
        xScale = d3.scaleBand()
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

    function getD3Selector(selector) {
        return selector.split(' ').join('.');
    }

    this.redraw = function(data, color) {
        let newData = data.map(function(d, i) {
            return {index: i, value: Math.sqrt(d.re*d.re + d.im*d.im)} ;
        });

        xScale.domain(newData.map(function(d) { return d.index; }));
        yScale.domain([0, d3.max(newData, function(d) { return d.value; })]);

        graph.selectAll(getD3Selector(selectors.axes.x))
            .call(xAxis);
        graph.selectAll(getD3Selector(selectors.axes.y))
            .call(yAxis);

        g.selectAll(".bar")
            .remove()
            .exit()
            .data(newData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("fill", color)
            .attr("x", function(d) { return xScale(d.index); })
            .attr("y", function(d) { return yScale(d.value); })
            .attr("width", xScale.bandwidth())
            .attr("height", function(d) { return graphDim.height - graphDim.margins.bottom  - yScale(d.value); });
    };
}