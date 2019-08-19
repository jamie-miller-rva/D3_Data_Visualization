
//========================================================
// Extra Responsive Chart (from Extra Content Section of Day 2)
// =======================================================

d3.select(window).on("resize", handleResize);

// When the browswer loads, loadChart() is called
loadChart();

function handleResize() {
  var svgArea = d3.select("svg");

  // If there is already an svg container on the page,
  // remove it and reload the chart
  if (!svgArea.empty()) {
    svgArea.remove();
    loadChart();
  }
};

function loadChart() {
  // Define SVG area dimensions using innerWidth and innerHeight
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  // Define the chart's margins as an object and adjust chartWidth and chartHeight
  var margin = {
  top: 30,
  right:40,
  bottom: 150,
  left: 100
  };  

  var chartWidth = svgWidth - margin.left - margin.right;
  var chartHeight = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper 
  // Use D3 to select the location for the chart,
  // Append SVG area to fit chart, and set dimensions
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append SVG chartGroup and shift ('translate')
  // to the right and down to adhere to the margins
  // set in the "margin" object.
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // ============================================================================
  // Initial Params
  var chosenXAxis = "in_poverty";
  
  // function used for updating x-scale var upon click on axis label
  function xScale(stateData, chosenXAxis) {
    
  }

  // =============================================================================
  // Import/Load data from stateData.csv in the assets/data folder
  // =============================================================================

  // Use D3 to load data from stateData.csv
  d3.csv("assets/data/stateData.csv").then(function(stateData) {

  // Console log the stateData to aid in debugging
  // console.log(stateData);

    // Parse Data & Cast values used in chart(s) below 
    // using forEach and the unary + operator
    // values include: healthcare, poverty, smokes, age
    stateData.forEach(function(data) {
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.smokes = +data.smokes;
      data.age = +data.age;

      // console.log "cast" values
      console.log("state:", data.state);
      console.log("abbr:", data.abbr);
      console.log("healtCare:", data.healthcare);    
      console.log("poverty:", data.poverty);
      console.log("smokes", data.smokes);
      console.log("age", data.age);
    });

    // Create scale functions using d3.scaleLinear
    // Note if using categorical data use d3.scaleBand to evenly space along the x axis
    var xLinearScale = d3.scaleLinear()
      .domain(d3.extent(stateData, d => d.poverty)) // using d3.extent to return min and max for domain
      .range([0, chartWidth]);
   
    var yLinearScale = d3.scaleLinear()
      .domain([d.min(stateData, d => d.), d3.max(stateData, d => d.healthcare)])  // using d3.max to return max for domain
      .range([chartHeight, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axes to chart
    // Note: This syntax allows us to call the axis function
    // and pass in the selector without breaking the chaining

    // set x to the bottom of the chart using var bottomAxis
    chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    // set y to the left of the chart using var leftAxis
    chartGroup.append("g")
      .call(leftAxis);

    // Append Circles to stateData data points using chartGroup
    var circlesGroup = chartGroup.selectAll("Circle")
      .data(stateData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "15")
      .attr("fill", "rgb(51, 102, 153)" )  // blueish gray color
      .attr("opacity", "0.7")
      .attr("stroke-width", "1")
      .attr("stroke", "gray");

    // Add State labels (data.abbr) in the circles
    // Note: the use of selectAll(null) was mentioned as a solution on stackoverflow at https://stackoverflow.com/questions/55988709/how-can-i-add-labels-inside-the-points-in-a-scatterplot
    var circleLabels = chartGroup.selectAll(null)
      .data(stateData)
      .enter()
      .append("text");
  
    circleLabels
      .attr("x", function(d) {
        return xLinearScale(d.poverty);
      })
      .attr("y", function(d) {
        return yLinearScale(d.healthcare);
      })

      .text(function(d) {
        return d.abbr;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle") // use of text-anchor as middle was a tip from stackoverflow at same link as above
      .attr("fill", "#ffffff"); // Note: #ffffff is the same as white

      // ===============================================================
      // ToolTip - Work in Progress Code References Day 03: D3_Tips
      // ===============================================================
      // Initalize Tooltip and Append a div to the body to create tooltips, assign it to a class
      var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
          return (`"State:"${d.abbr}<hr>"% In Poverty:"${d.poverty}
          <hr>"% W/O Healthcare:"${d.healthcare}`);
        });  
      
      // Create the tooltip in chartGroup
      chartGroup.call(toolTip);

      // Create "on-mouse-over event listener to display a tooltip
      circlesGroup.on("click", function(data) {
        toolTip.show(data, this);
      })

      // Create "on-mouse-out" event listener to hide tooltip  
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    })
    
    // Create axes lables
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em") // Note: The dy attribute indicates a shift along the y-axis on the position of an element or its content. And em are scalable units which are translated by the browser into pixel values
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${chartWidth /2}, ${chartHeight + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");  
};
