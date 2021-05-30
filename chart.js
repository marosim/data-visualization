function pageLoad() {

// Set the dimensions and margins of the graph
const margin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 60
};

const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read the data
d3.csv('snakes_count_1000.csv', 
  function (d) {
    return {
      num: d.game,
      value: d.duration
    }
  }).then(
    function (data) {

      // X axis
      const x = d3.scaleLinear()
        .domain([1, 1000])
        .range([0, width]);
      const xAxis = svg.append("g")
        .style("font-size", "15px")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
  
      // Y axis
      const y = d3.scaleLinear()
        .domain([0, 200])
        .range([height, 0]);
      const yAxis = svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "15px");
  
      // ClipPath: everything out of this area won't be drawn
      const clip = svg.append("defs")
        .append("svg:clipPath")
          .attr("id", "clip")
          .append("svg:rect")
          .attr("width", width )
          .attr("height", height )
          .attr("x", 0)
          .attr("y", 0);
  
      // Brushing
      const brush = d3.brushX()
        .extent([[0, 0], [width,height]])
        .on("end", updateChart);
  
      // Line variable: where both the line and the brush take place
      const line = svg.append("g")
        .attr("clip-path", "url(#clip)");
  
      // Line
      line.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "#00e676")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
          .x(function (d) { return x(d.num) })
          .y(function (d) { return y(d.value) })
        )
  
      // Brushing
      line.append("g")
        .attr("class", "brush")
        .call(brush);
  
      // A function that update the chart for given boundaries
      function updateChart(event) {
        const extent = event.selection;
  
        // If no selection, back to initial coordinate, otherwise, update X axis domain
        if (extent) {
          x.domain([x.invert(extent[0]), x.invert(extent[1])]);
          line.select(".brush").call(brush.move, null);
        }
  
        // Update axis and line position
        xAxis.transition().duration(1000).call(d3.axisBottom(x));
        line.select('.line')
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function (d) { return x(d.num) })
            .y(function (d) { return y(d.value) })
          );
      }
  
      // If user double clicks, reinitialize the chart
      svg.on("dblclick", function () {
        x.domain([1, 1000]);
        xAxis.transition().call(d3.axisBottom(x));
        line.select('.line')
          .transition()
          .attr("d", d3.line()
            .x(function (d) { return x(d.num) })
            .y(function (d) { return y(d.value) })
          );
      });

      // Tooltip
      const tooltip = svg.append("g").append("text").style("fill","white");

      function mousemove() {     
        const x0 = x.invert(d3.pointer(event,this)[0]);
        const mouseX = d3.pointer(event,this)[0];
        const mouseY = d3.pointer(event,this)[1];
        const i = Math.round(x0);
        tooltip.attr("transform", `translate(${mouseX+15},${mouseY-15})`);
        tooltip.text(data[i].value);
      }

      function mouseout() {
        tooltip.style("opacity", 0);
      }

      function mouseover() {
        tooltip.style("opacity", 1);
      }

      svg.on("mousemove", mousemove);
      svg.on("mouseout", mouseout);
      svg.on("mouseover", mouseover);
  });
};

window.addEventListener("load", pageLoad);
