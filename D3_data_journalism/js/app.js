var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "age";
var chosenYAxis = "smokes";

// function used for updating x-scale var upon click on axis label
function xScale(smokesData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(smokesData, d => d[chosenXAxis]-1),
      d3.max(smokesData, d => d[chosenXAxis])
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating y-scale var upon click on axis label
function yScale(smokesData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(smokesData, d => d[chosenYAxis]-1) * 0.8,
      d3.max(smokesData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to new circles for xAxis
function renderCircles (circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}
function renderText(textValues, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textValues.transition()
    .duration(1000)
    .attr("x", d => (newXScale(d[chosenXAxis])))
    .attr("y", d => (newYScale(d[chosenYAxis])));

  return textValues;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, textValues) {

  if (chosenXAxis === "age") {
    var labelX = "Age:";
  }
  else {
    var labelX = "Household income:";
  }

  if (chosenYAxis === "smokes") {
    var labelY = "Smokes:";
  }
  else {
    var labelY = "Poverty:";
  }

  var toolTip = d3.tip()
    // .attr("class", "tooltip")
    .attr("class", "d3-tip")
    .offset([40,-60])
    .html(function(d) {
      return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
  });

  svg.call(toolTip);

  textValues.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });
    return textValues;
  }


  // Retrieve data from the CSV file and execute everything below
d3.csv("D3_data_journalism/data/data.csv").then( function(smokesData, err) {
  if (err) throw err;
  console.log(smokesData)
  // parse data
  smokesData.forEach(function(data) {
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.income = +data.income;
    data.poverty = +data.poverty
});

  // Create x scale and y scale functions from above csv import
  var xLinearScale = xScale(smokesData, chosenXAxis);
  var yLinearScale = yScale(smokesData, chosenYAxis);

    // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

 

    // append initial circles and circle attributes
  var circlesGroup = chartGroup.selectAll("circle")
    .data(smokesData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "skyblue")
    .attr("stroke", "skyblue")
    .attr("stroke-width", "1")
    .attr("fill-opacity", ".4");
 
   //Add Text Element for circles
  var textValues = chartGroup.selectAll(null)
   .data(smokesData)
   .enter()
   .append('text');

   textValues
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(d =>d.abbr)
    .attr('fill', 'black')
    .attr('font-family','sans-sefir')
    .attr('font-size', '10px')
    .attr('text-anchor', 'middle')  

    // Create group for 2 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var agesLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Age");

  var householdIncomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household income");

  // Create group for  2 y- axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var smokesLabel = ylabelsGroup.append("text")
    .attr("y", -480)
    .attr("x", 250)
    .attr("transform", "rotate(-90)")
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smokes (%)");

  var povertyLabel = ylabelsGroup.append("text")
    .attr("y", -460)
    .attr("x", 250)
    .attr("transform", "rotate(-90)")
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("Poverty(%)");
  
    // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(smokesData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        textValues = renderText(textValues, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        textValues = updateToolTip(chosenXAxis, chosenYAxis, textValues);

         // changes classes to change bold text
         if (chosenXAxis === "income") {
          householdIncomeLabel
            .classed("active", true)
            .classed("inactive", false);
          agesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          householdIncomeLabel
            .classed("active", false)
            .classed("inactive", true);
          agesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

    // y axis labels event listener
  ylabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var yvalue = d3.select(this).attr("value");
    if (yvalue !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = yvalue;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      yLinearScale = yScale(smokesData, chosenYAxis);

      // updates x axis with transition
      yAxis = renderYAxis(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      textValues = renderText(textValues, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      
      // updates tooltips with new info
      textValues = updateToolTip(chosenXAxis, chosenYAxis, textValues);

       // changes classes to change bold text
       if (chosenYAxis === "poverty") {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
});














