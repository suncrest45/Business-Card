let svgWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let svgHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

let cards = {};
let names = new Object();
let count = 0;

const cardsPerRow = 5;
const cardSpacing = 10;

console.log(svgWidth);
console.log(svgHeight);

// Append SVG to the container
const svg = d3.select("#card-area")
              .append("svg")
              .attr("width", svgWidth)
              .attr("height", svgHeight);


async function readCSV(csvFilePath) {

   try {
      const data = await d3.csv(csvFilePath);

      const cardWidth = (svgWidth - (cardsPerRow - 1) * cardSpacing) / cardsPerRow;
      const cardHeight = cardWidth; // Assuming the cards are square


      data.forEach(function(d, index){
         
         const row = Math.floor(index / cardsPerRow);
         const col = index % cardsPerRow;

         names[String(d.Name)] = index;
         
         let card = svg.append("image")
            .attr("xlink:href", "../Data/" + d.Name + "_front.jpg")
            .attr("x", col * (cardWidth + cardSpacing))  // x-coordinate
            .attr("y", row * (cardHeight + cardSpacing)) // y-coordinate
            .attr("width", cardWidth)      // rectangle width
            .attr("height", cardHeight)     // rectangle height
            .attr("preserveAspectRation", "xMidYMid slice");
         cards[index] = card;
         console.log("count: ", count);
         count++;
      })

      return data;
      
   } catch (error) {
      console.error("Error reading csv:", error);
      return [];
   }
   
}



// Function to resize rectangle based on window size
function resize() {
    svgWidth = window.innerWidth;
    svgHeight = window.innerHeight;

    const cardWidth = (svgWidth - (cardsPerRow - 1) * cardSpacing) / cardsPerRow;
    const cardHeight = cardWidth;


    svg.attr("width", svgWidth)
       .attr("height", svgHeight);

   for (let i = 0; i < count; i++) {
   const row = Math.floor(i / cardsPerRow);
   const col = i % cardsPerRow;

   cards[i]
      .attr("x", col * (cardWidth + cardSpacing))
      .attr("y", row * (cardHeight + cardSpacing))
      .attr("width", cardWidth)
      .attr("height", cardHeight);
   }
}

readCSV("../Data/Business Cards.csv").then(() => {
   resize(); // ensure correct sizing after load
   window.addEventListener("resize", resize);
});

