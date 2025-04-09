
let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

let cards = {};
let names = new Object();

// Append SVG to the container
const svg = d3.select("#card-area")
   .append("svg")
   .attr("width", width)
   .attr("height", height);

async function loadData() 
{
   d3.csv("Data/Business_Cards.csv").then(function(data) {
      data.forEach(function(d) {
         console.log(d.Name);      // Prints name column
         names[String(d.Name)] = Number(count);
         console.log("type: ", typeof d.Name);
         let card = svg.append("image")
            .attr("xlink:href", "../Data/" + d.Name + "_front.jpg")
            .attr("x", 0)            // x-coordinate
            .attr("y", 0)            // y-coordinate
            .attr("width", 500)      // rectangle width
            .attr("height", 500)     // rectangle height
            .attr("preserveAspectRation", "none");
         cards[count] = card;
         console.log("count: ", count);
         count++;
      })
   }); 
   
}


Promise.resolve(loadData());

let count = 0;

// d3.csv("Data/Business_Cards.csv").then(function(data) 
// {
//    let count = 0;

console.log("after: ", names["Bottom_Top"]);
//   console.log(names["Bottom_Top"]);
// });



// cards[names["Bottom_Top"]]
//    .attr("x", 500);

// Function to resize rectangle based on window size
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    const relWidth = width / 2.5;
    const relHeight = relWidth * 0.5714;

    svg.attr("width", width)
       .attr("height", height);

    cards[0].attr("x", 0)               // x-coordinate
        .attr("y", 0)                   // y-coordinate
        .attr("transform", "scale(" + relWidth + "," + relHeight + ")");
}


//resize();

//window.addEventListener("resize", resize);