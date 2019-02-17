function FrequencyGraph() {
    let graph, xScale, yScale,
        xAxis, yAxis,
        barX, barY, barZ,
        data = [];

    const graphDim = {
        margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        },
        width: 768,
        height: 200
    };

    let x, y, barWidth, selectors;


    this.init = function(sel) {
        selectors = sel;
        initArray();
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

        barWidth = (graphDim.width/data.length);

        graph.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", function(d) {
                return graphDim.height - d
            })
            .attr("height", function(d) {
                return d;
            })
            .attr("width", barWidth)
            .attr("transform", function (d, i) {
                let translate = [barWidth * i, 0];
                return "translate("+ translate +")";
            });

    }

    function initBarFunctions() {

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

    }

    function initArray() {
        for (let i = 0; i < 256; i++) {
            data[i] = i;
        }
        console.log(data);
    }

    // this.redrawAxis = function(max) {
    //     yScale.domain([0, max]);
    //     yAxis = d3.axisLeft()
    //         .scale(yScale);
    //     graph.selectAll(getD3Selector(selectors.axes.y))
    //         .call(yAxis);
    // };

    function getD3Selector(selector) {
        return selector.split(' ').join('.');
    }
}