
function FrequencyGraph() {
    let graph, xScale, yScale, g,
        xAxis, yAxis,
        sel;

    this.init = function(selectors) {
        sel = selectors;
        initAxes();
        initGraph();
        appendAxes();
        appendLabels();
    };

    function initGraph() {
        graph = d3.select(sel.graph)
            .attr('width', props.dimensions.width
                + props.dimensions.margins.left
                + props.dimensions.margins.right)
            .attr('height', props.dimensions.height
                + props.dimensions.margins.top
                + props.dimensions.margins.bottom);
        g = graph.append("g");
    }

    function initAxes() {
        xScale = d3.scaleBand()
            .range([props.dimensions.margins.left,
                props.dimensions.width - props.dimensions.margins.right]);
        yScale = d3.scaleLinear()
            .range([props.dimensions.height - props.dimensions.margins.top,
                props.dimensions.margins.bottom]);
        xAxis = d3.axisBottom()
            .scale(xScale);
        yAxis = d3.axisLeft()
            .scale(yScale);
    }

    function appendAxes() {
        graph.append("svg:g")
            .attr('class', sel.axes.x)
            .attr("transform", "translate(0," + (props.dimensions.height - props.dimensions.margins.bottom) + ")")
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
            .attr("x", props.dimensions.width/2 + 50)
            .attr("y", props.dimensions.height + 10)
            .text(sel.labels.xAxis);

        graph.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 5)
            .attr("dy", ".75em")
            .attr("x", -60)
            .attr("transform", "rotate(-90)")
            .text(sel.labels.yAxis);
    }

    function getD3Selector(selector) {
        return selector.split(' ').join('.');
    }

    this.redraw = function(data) {
        xScale.domain(data.data.map(function(d) { return d.index; }));
        yScale.domain([0, data.maxValue]);

        graph.selectAll(getD3Selector(sel.axes.x))
            .call(xAxis);
        graph.selectAll(getD3Selector(sel.axes.y))
            .call(yAxis);

        // Create group for overlapped bars
        let group = g.selectAll(".bar")
            .remove()
            .exit()
            .data(data.data)
            .enter();

        ['x', 'y', 'z'].forEach(function(c) {
            group.append("rect")
                .attr("class", "bar")
                .attr("fill", props.colors[c])
                .attr("opacity", 0.7)
                .attr("x", function(d) { return xScale(d.index); })
                .attr("y", function(d) { return yScale(d[c]); })
                .attr("width", xScale.bandwidth())
                .attr("height", function(d) { return props.dimensions.height - props.dimensions.margins.bottom  - yScale(d[c]); });
        });
    };
}