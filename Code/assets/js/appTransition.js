
//========================================================
// Create a Responsive Chart with function(handleResize)
// =======================================================

d3.select(window).on("resize", handleResize);

// When the browswer loads, handleResize is called
handleResize(); 

// Automatically resize the chart
function handleResize() {
  var svgArea = d3.select("body").select("svg");

  // If there is already an svg container on the page,
  // remove it and reload the chart
  if (!svgArea.empty()) {
    svgArea.remove();    
  }
 
  // Define SVG area dimensions using innerWidth and innerHeight
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  // Define the chart's margins as an object, use to make minnir adjustments to chartWidth and chartHeight
  var margin = {
  top: 20,
  right:40,
  bottom: 250,
  left: 130
  };  

  var chartWidth = svgWidth - margin.left - margin.right;
  var chartHeight = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper and use D3 to select the location for the chart,
  // Append SVG area to fit chart, and set dimensions of the chart
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append SVG chartGroup and shift ('translate') to the right and down to adhere to the margins set in the "margin" object above.
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // ============================================================================
  // ============================================================================
  // Prep Work (prior to loading csv)
  // ===========================================================================

  // Initial Parameters for X and Y Axis
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";
  
  // ===============================================================
  // Update X and Y Scale
  // ===============================================================
  // function used for updating x-Scale var upon click on axis label
  function xScale(stateData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8, 
          d3.max(stateData, d => d[chosenXAxis]) * 1.2])
        .range([0, chartWidth]);
    return xLinearScale;
  }

  // function used for updating y-Scale var upon click on axis label
  function yScale(stateData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8, 
      d3.max(stateData, d => d[chosenYAxis]) * 1.2 ])
      .range([chartHeight, 0]);
    return yLinearScale;
  }  
  // ===============================================================
  // Update X and Y Axis
  // ===============================================================
  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
  function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }
  // ===============================================================
  // Update Circles with Transition 
  // ===============================================================
  // function used for updating circles group with a transition to new circles
  function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) { 
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }
  // ===============================================================
  // function used for updating the text in the circles group with a transition to 
  // new circles when clicking on new axis
  function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis])+6);  // the +6 drops the stateText to the center of the circle
    return textGroup;
  }  
  // ===============================================================
  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, textGroup) {
    if (chosenXAxis === "poverty") {
        var xlabel = "In Poverty:";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Median Age:";
    }
    else {  // chosenXAxis === income
        var xlabel = "Median Income:";
    }
    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare:";
    }
    else if (chosenYAxis === "smokes") {
        var ylabel = "Smokes:";
    }
    else {  // chosenYAxis === obesity
        var ylabel = "Obese";
    }    

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);            
      });
    textGroup.call(toolTip);

    textGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })

    // onmouseout event
    .on("mouseout", function(data) { // note: index is not used
        toolTip.hide(data);
        });
    return textGroup;
  } // close function updateToolTip

  // ============================================================================
  // Prep work complete
  // =============================================================================

  // ============================================================================
  // Import data from csv
  // =============================================================================

  // Use D3 to load data from stateData.csv in the assets/data folder and console.log
  var dataFile = "./assets/data/stateData.csv"
  d3.csv(dataFile).then(successHandle, errorHandle);
  function errorHandle(err){
    throw err;
  }

  function successHandle(stateData) {

    // Parse Data & Cast values used in chart(s) below using forEach and the unary + operator to ensure any string is re-cast as a number
    stateData.forEach(function(data) {
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      console.log(data.state, data.abbr); // console.log to assist in debugging (identifies that data has been loaded)    
    });

    // ===============================================================
    // Data Import Complete
    // ===============================================================

    // ===============================================================
    // Create inital "scatterplot"
    // ===============================================================
    // Create scale functions
    // note: x and y LinearScale function above csv import
    var xLinearScale = xScale(stateData, chosenXAxis);
    var yLinearScale = yScale(stateData, chosenYAxis);

    // Create inital axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    // ===================================================
    // Append axes to chart
    // Append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);
    // ====================================================
    // Create Circles: Append circles to stateData using chartGroup
    var circlesGroup = chartGroup.selectAll(".stateCircle") 
      .data(stateData)
      .enter()
      .append("circle")
      .attr("class", "stateCircle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "14")
      // .attr("fill", "rgb(51, 102, 153)" )  //attributes now in d3Style.css
      // .attr("opacity", "0.7")
      // .attr("stroke-width", "1")
      // .attr("stroke", "gray");

    var textGroup = chartGroup.selectAll(".stateText")
      .data(stateData)
      .enter()
      .append("text")
      .attr("class", "stateText")
      //.attr("text-anchor", "middle")  // attributes now in d3Style.css
      .text(function(d) {return d.abbr;})
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis])+6)
      //.attr("fill", "#ffffff") // Note: #ffffff is white
      //.attr("font-family", "sans-serif");
    // ===============================================================
    // Create group for 3 x-axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
      
    var inPovertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Create group for 3 y-axis lables
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")
      .attr("class", "axisText")
      .attr("x", 0 - (chartHeight / 2))
      .style("text-anchor", "middle");

    var obesityLabel = ylabelsGroup.append("text")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (chartHeight / 2))
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .attr("dy", "1em")
      .text("Obese (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("y", 20 - margin.left)
      .attr("x", 0 - (chartHeight / 2))
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .attr("dy", "1em")
      .text("Smokes (%)");

    var healthcareLabels = ylabelsGroup.append("text")
      .attr("y", 40 - margin.left)
      .attr("x", 0 - (chartHeight / 2))
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .attr("dy", "1em")
      .text("Lacks Healthcare (%)");
    // ===============================================================
    // Note: UpdateToolTip function in Prep (above csv import) 
    var textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
          // get value of selection
          var xvalue = d3.select(this).attr("value");
          if (xvalue !== chosenXAxis) {
              
            // replaces chosenXAxis with value
            chosenXAxis = xvalue;     
            
            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(stateData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis); 

            // update text in circles with new x values
            textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new information
            textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

            // changes classes (active vs. inactive) to bold text on chosen axis labels
            if (chosenXAxis === "poverty") {
              inPovertyLabel
                .classed("active", true)
                .classed("inactive", false);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            
            else if (chosenXAxis === "age") {
              inPovertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }

            else { // chosenXAxis === "income"
              inPovertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            }

          } // close if (xvalue !== chosenXAxis)
      }); // close labelsGroup .on function
      // ===============================================================
      // y axis labels event listener
      ylabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var yvalue = d3.select(this).attr("value");
        if (yvalue !== chosenYAxis) {

        // replace chosenYAxis with value
        chosenYAxis = yvalue;

        // updates y scale for new data
        yLinearScale = yScale(stateData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);  

        // update text in circles with new x values
        textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // update tooltips with new information
        textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabels
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabels
            .classed("active", false)
            .classed("inactive", true);
        }
        else {  // chosenYAxis === "healthcare"
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabels
            .classed("active", true)
            .classed("inactive", false);
        }

        } // close if (yvalue !== chosenYAxis)
      }); // close ylabelsGroup .on function
    }  // close function successHandle(stateData) 
  }; // close function handleResize()

 