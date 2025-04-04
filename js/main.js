// An array containing the IDs of all the sliders being used
let sliderIds = [ 
  "#winMultiplierFromGUI",  
  "#numTrialsFromGUI", 
  "#percentToBetFromGUI",
  "#numSimsFromGUI",
  "#chanceOfBlowupFromGUI",
  "#percentOfBetToBlowupFromGUI",
  "#binNumberFromGUI",
  "#kernelEpFromGUI"
];

// An array containing the IDs of all the text boxes being used
let textBoxIds = [
  "#winMultiplierFromGUILabel",  
  "#numTrialsFromGUILabel", 
  "#percentToBetFromGUILabel",
  "#numSimsFromGUILabel",
  "#chanceOfBlowupFromGUILabel",
  "#percentOfBetToBlowupFromGUILabel" ,
  "#binNumberFromGUILabel",
  "#kernelEpFromGUILabel"
];

let n = new Object();

n["winMult"] = 0;
n["numTrials"] = 1;
n["betPercent"] = 2;
n["numSims"] = 3;
n["chanceOfBetToBlowup"] = 4;
n["percentOfBetToBlowup"] = 5;
n["binNumber"] = 6;
n["kernelEp"] = 7;

var variables = {};


// An array of all the variables to be set by the sliders
variables[0] = Number(document.getElementById(sliderIds[0].slice(1)).value);
variables[1] = Number(document.getElementById(sliderIds[1].slice(1)).value);
variables[2] = Number(document.getElementById(sliderIds[2].slice(1)).value);
variables[3] = Number(document.getElementById(sliderIds[3].slice(1)).value);
variables[4] = Number(document.getElementById(sliderIds[4].slice(1)).value);
variables[5] = Number(document.getElementById(sliderIds[5].slice(1)).value);
variables[6] = Number(document.getElementById(sliderIds[6].slice(1)).value);
variables[7] = Number(document.getElementById(sliderIds[7].slice(1)).value);

let biggest_capital = 0.0;
let money_array = [];

// Updates the sliders and their corresponding variables every frame
function UpdateSliders() 
{
  for(let i in sliderIds) 
  {
    // When the slider is changed update the variable
    d3.select(sliderIds[i]).on("change", function() {
        variables[i] = this.value;
        console.log(sliderIds[i] + ": " + variables[i]);
        updateSimulation();
        updateChart(variables[n["binNumber"]]);
        money_array.length = 0;
    });

    // When the text box is changed update the variable and slider
    d3.select(textBoxIds[i]).on("change", function(){
        variables[i] = this.value;
        console.log(textBoxIds[i] + ": " + variables[i]);
        let val = document.getElementById(sliderIds[i].slice(1));
        val.value = variables[i];
        updateSimulation();
        updateChart(variables[n["binNumber"]]);
        money_array.length = 0;
    });
  }
}

// Does the math for the Monte Carlo simulation
function runSimulation(total_money)
{
  //console.log("total_money" + total_money);
  let bet_amount = total_money * variables[n["betPercent"]] * .01;
  let chance = variables[n["chanceOfBetToBlowup"]] * .01;
  let bet_outcome = (1000 * chance) > Math.random() * (1000-1)  + 1 ? 0 : 1;
  let bet_result = bet_amount * variables[n["winMult"]] * bet_outcome; 
  return total_money - bet_amount + bet_result;
}

function updateSimulation()
{ 
  // Number of simulations
  for (let i = 0; i < variables[n["numSims"]]; ++i)
  {
      let simulation_amount = 100.0;
      
      // Number of trials per simulation
      for(let j = 0; j < variables[n["numTrials"]]; ++j)
      {
        simulation_amount = runSimulation(simulation_amount);
      }

     let length = money_array.push(Math.floor(simulation_amount)); 
  }

  biggest_capital = Math.max(...money_array);
}


// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 30, left: 50},
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#chart-area")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// add the x Axis
let x = d3.scaleLinear()
  .domain([-100, biggest_capital + 500])
  .range([0, width]);

let xAxis = svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// add the y Axis
let y = d3.scaleLinear()
  .range([height, 0])
  .domain([0, 0.01]);

let yAxis = svg.append("g")
  .call(d3.axisLeft(y));

//----------------------------------------------Density-------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------
// Compute kernel density estimation
let kde = kernelDensityEstimator(kernelEpanechnikov(variables[n["kernelEp"]]), x.ticks(variables[n["binNumber"]]));
updateSimulation();
let density = kde( money_array );
console.log("init density: ", density);

let curve = svg
  .append('g')
  .append("path")
    .attr("class", "mypath")
    .datum(density)
    .attr("fill", "#69b3a2")
    .attr("opacity", ".8")
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", "round")
    .attr("d",  d3.line()
      .curve(d3.curveBasis)
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); })
    );


var jitterWidth = 10;
let points = svg.append('g')
.selectAll("circle")
.data(density)
.enter()
.append("circle")
  .attr("cx", d => x(d[0]))
  .attr("cy", d => y(d[1]))
  .attr("r", 2.0)
  .style("fill", "black")


function updateChart(binNumber) {
  // console.log("binNumber: ", binNumber);
  // console.log("kernelEp: ", variables[n["kernelEp"]]);
  //svg.selectAll("indpoints").remove();

  // recompute density estimation
  kde = kernelDensityEstimator(kernelEpanechnikov(variables[n["kernelEp"]]), x.ticks(binNumber));
  density =  kde( money_array );
  console.log("money array: " + money_array);
  console.log("density: " + density);

  x.domain([0, biggest_capital + 500]);
  xAxis.transition().duration(1000).call(d3.axisBottom(x));

  // console.log(biggest_capital);
  points.remove();

  let largest_density = 0;

  for (let i in density)
  {
    largest_density = Math.max(largest_density, density[i][1]);
  }

  //console.log(largest_density);

  // add the y Axis
  y.domain([0, largest_density]);
  yAxis.transition().duration(1000).call(d3.axisLeft(y));

  // update the chart
  curve
    .datum(density)
    .transition()
    .duration(1000)
    .attr("d",  d3.line()
      .curve(d3.curveBasis)
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); })
    );

  points.append('g')
    .selectAll("circle")
    .data(density)
    .enter()
    .append("circle")
      .attr("cx", d => x(d[0]))
      .attr("cy", d => y(d[1]))
      .attr("r", 2.0)
      .style("fill", "black")

    
}

// Function to compute density
function kernelDensityEstimator(kernel, X) 
{
  return function(V) {
    return X.map(function(x) {
      return [x, d3.mean(V, function(v) { return kernel(x - v); })];
    });
  };
}

function kernelEpanechnikov(k) 
{
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}

//run the function.
UpdateSliders();

//----------------------------------------------Jitter-------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------

