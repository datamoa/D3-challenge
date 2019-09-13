
var svgWidth = 850;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 50,
  bottom: 60,
  left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("data/data.csv")
  .then(function(smokesData) {
    // Step 1: Parse data as numbers
    smokesData.forEach(function(data) {
      data.age = +data.age;
      data.smokes = +data.smokes;
    });
    // Step 2: Create scale functions
    var xLinearScale = d3.scaleLinear()
      .domain([25, d3.max(smokesData, d => d.age)])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(smokesData, d => d.smokes)])
      .range([height, 0]);

      // Step 3: Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

     // Step 4: Append Axes to the chart
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

      // Step 5: Create Circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(smokesData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.age))
    .attr("cy", d => yLinearScale(d.smokes))
    .attr("r", "15")
    .attr("fill", "green")
    .attr("stroke", "green")
    .attr("stroke-width", "2")
    .attr("fill-opacity", ".4")
    .append('text')
    .attr("dy", ".3em")
    .style("text-anchor", "middle")
    .text(function(d) { return d.state; });    

    // Step 6: Initialize tool tip
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>Age: ${d.age}<br>Smokers : ${d.smokes}%`);
      });

    // Step 7: Create tooltip in the chart
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    circlesGroup.on("click", function(data) {
        toolTip.show(data, this);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });

        // Create axes labels
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 5)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Smokers percentage");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 10})`)
      .attr("class", "axisText")
      .text("Age");
    });