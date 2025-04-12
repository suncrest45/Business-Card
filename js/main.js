let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

let cards = {};
let names = new Object();
let count = 0;
let row = 0;
let column = 0;
let xOffset = 400;


console.log(width);
console.log(height);

// Append SVG to the container
const svg = d3.select("#card-area")
              .append("svg")
              .attr("width", width)
              .attr("height", height);


async function readCSV(csvFilePath) {

   try {
      const data = await d3.csv(csvFilePath);
      data.forEach(function(d){
         names[String(d.Name)] = Number(count);
         let card = svg.append("image")
            .attr("xlink:href", "../Data/" + d.Name + "_front.jpg")
            .attr("x", 500 * column)            // x-coordinate
            .attr("y", 500 * row)            // y-coordinate
            .attr("width", 500)      // rectangle width
            .attr("height", 500)     // rectangle height
            .attr("preserveAspectRation", "none");
         cards[count] = card;
         console.log("count: ", count);
         column++;
         count++;
         if (count % 5 == 0) {
            row++;
            column = 0;
         }
      })

      return data;
      
   } catch (error) {
      console.error("Error reading csv:", error);
      return [];
   }
   
}



// Function to resize rectangle based on window size
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    const relWidth = width / 2.5;
    const relHeight = relWidth * 0.5714;

    svg.attr("width", width)
       .attr("height", height);

    cards[0].attr("x", 0)                   // x-coordinate
        .attr("y", 0)                 // y-coordinate
        .attr("transform", "scale(" + relWidth + "," + relHeight + ")")
}

const data = readCSV("../Data/Business Cards.csv");
resize();

window.addEventListener("resize", resize);

