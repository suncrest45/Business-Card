
let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

console.log(width);
console.log(height);

// Append SVG to the container
const svg = d3.select("#card-area")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

// Add a rectangle
let card = svg.append("image")
   .attr("xlink:href", "../Data/Bottom_Top_back.jpg")
   .attr("x", 0)          // x-coordinate
   .attr("y", 0)          // y-coordinate
   .attr("width", 1)      // rectangle width
   .attr("height", 1)     // rectangle height

// Function to resize rectangle based on window size
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    const relWidth = width / 2.5;
    const relHeight = relWidth * 0.5714;

    svg.attr("width", width)
       .attr("height", height);

    card.attr("x", 0)                   // x-coordinate
        .attr("y", 0)                 // y-coordinate
        .attr("transform", "scale(" + relWidth + "," + relHeight + ")")
}

resize();

window.addEventListener("resize", resize);