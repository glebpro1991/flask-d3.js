function FrequencyGraph() {
    let graph, xScale, yScale, g,
        barX, barY, barZ,
        data = [],
        selectors;

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

    this.init = function(sel) {
        selectors = sel;
        initArrays();
        initAxes();
        initGraph();
        redrawBars();
    };

    function initAxes() {
        xScale = d3.scaleBand()
            .range([graphDim.margins.left,
                graphDim.width - graphDim.margins.right]);
        yScale = d3.scaleLinear()
            .range([graphDim.height - graphDim.margins.top,
                graphDim.margins.bottom]);

        xScale.domain(data.map(function(d) { return d.index; }));
        yScale.domain([0, d3.max(data, function(d) { return d.value; })]);
    }

    function initGraph() {
        graph = d3.select(selectors.graph)
            .attr('width', graphDim.width
                + graphDim.margins.left
                + graphDim.margins.right)
            .attr('height', graphDim.height
                + graphDim.margins.top
                + graphDim.margins.bottom);

        g = graph.append("g");
        g.append("g")
            .attr("transform", "translate(0," + (graphDim.height - graphDim.margins.bottom) + ")")
            .call(d3.axisBottom(xScale));
        g.append("g")
            .attr("transform", "translate(" + (graphDim.margins.left) + ",0)")
            .call(d3.axisLeft(yScale));
    }

    function redrawBars() {
        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return xScale(d.index); })
            .attr("y", function(d) { return yScale(d.value); })
            .attr("width", xScale.bandwidth())
            .attr("height", function(d) { return graphDim.height - graphDim.margins.bottom  - yScale(d.value); });
    }


    //
    // function initAxes() {
    //     xScale = d3.scaleBand().range([graphDim.margins.left, graphDim.width]);
    //     yScale = d3.scaleLinear().range([graphDim.height - graphDim.margins.bottom, 0]);
    //
    //     xScale.domain(data.map(function(d, i) {
    //         return i;
    //     }));
    //     yScale.domain([0, d3.max(data, function(d) {
    //         return d.value;
    //     })]);
    //
    //     xAxis = d3.axisBottom()
    //         .scale(xScale);
    //     yAxis = d3.axisLeft()
    //         .scale(yScale);
    // }
    //
    // function appendAxes() {
    //     graph.append("svg:g")
    //         .attr('class', selectors.axes.x)
    //         .attr("transform", "translate(0," + (graphDim.height - graphDim.margins.bottom) + ")")
    //         .call(xAxis);
    //     graph.append("svg:g")
    //         .attr('class', selectors.axes.y)
    //         .attr("transform", "translate(" + (graphDim.margins.left) + ",0)")
    //         .call(yAxis);
    // }
    //
    // function redrawBars() {
    //     graph.selectAll("rect")
    //         .data(data)
    //         .enter()
    //         .append("rect")
    //         .attr("class", "bar")
    //         .attr("x", function(d) { return xScale(d.value); })
    //         .attr("y", function(d, i) { return yScale(i); })
    //         .attr("height", function(d) {
    //             return graphDim.height - yScale(d.value) - graphDim.margins.bottom;
    //         })
    //         .attr("width", xScale.bandwidth());
    //
    //     xAxis = d3.axisBottom()
    //         .scale(xScale);
    //
    //     graph.selectAll(getD3Selector(selectors.axes.x))
    //         .call(xAxis);
    // }
    //
    function initArrays() {
        for (let i = 0; i < 256; i++) {
            data[i] = {index: i, value: Math.floor(Math.random() * (2000))};
        }
        //
        console.log(data);
    }
    //
    // // function redrawAxes(max) {
    // //     yScale.domain([0, max]);
    // //     yAxis = d3.axisLeft()
    // //         .scale(yScale)
    // //
    // //     graph.selectAll(getD3Selector(selectors.axes.y))
    // //         .call(yAxis);
    // // };
    //
    // function getD3Selector(selector) {
    //     return selector.split(' ').join('.');
    // }
}