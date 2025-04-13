let svgWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let svgHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

let cards = {};
let names = new Object();
let count = 0;

const cardsPerRow = 5;
const cardSpacing = 10;
const speed = 0.5; // pixels per frame; adjust for faster/slower motion
let offset = 0;
let cardWidth = 0;
let cardHeight = 0;

let cardGroup;

console.log(svgWidth);
console.log(svgHeight);

// Append SVG to the container
const svg = d3.select("#card-area")
              .append("svg")
              .attr("width", svgWidth)
              .attr("height", svgHeight);

// Create the <g> group that will hold all cards
cardGroup = svg.append("g");


async function readCSV(csvFilePath) {

   try {
      const data = await d3.csv(csvFilePath);

      cardWidth = (svgWidth - (cardsPerRow - 1) * cardSpacing) / cardsPerRow;
      cardHeight = cardWidth; // Assuming the cards are square


      data.forEach(function(d, index){
         
         const row = Math.floor(index / cardsPerRow);
         const col = index % cardsPerRow;

         names[String(d.Name)] = index;
         
         let card = cardGroup.append("image")
            .attr("xlink:href", "../Data/" + d.Name + "_front.jpg")
            .attr("x", col * (cardWidth + cardSpacing))  // x-coordinate
            .attr("y", row * (cardHeight + cardSpacing)) // y-coordinate
            .attr("width", cardWidth)      // rectangle width
            .attr("height", cardHeight)     // rectangle height
            .attr("preserveAspectRation", "xMidYMid slice");

         card.on('mouseover', function(d) {
            console.log(this);
            d3.select(this)
            .transition()
            .attr("xlink:href", "../Data/" + data[index].Name + "_back.jpg")
         });

         card.on('mouseout', function(d) {
            console.log(this);
            d3.select(this)
            .transition()
            .attr("xlink:href", "../Data/" + data[index].Name + "_front.jpg")
         });

         card.on("click", function (event) {
            if (event.button === 0) 
               {
                  console.log("Left click on card");
               }
         });

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

function animate() {
   d3.timer(() => {
      offset -= speed;

      const totalWidth = (cardWidth + cardSpacing) * cardsPerRow;

      // If we've scrolled past one full row of cards, reset offset
      if (Math.abs(offset) > totalWidth) {
            offset = 0;
      }

      cardGroup.attr("transform", `translate(${offset}, 0)`);
   });
}

// Function to resize rectangle based on window size
function resize() {
    svgWidth = window.innerWidth;
    svgHeight = window.innerHeight;

   cardWidth = (svgWidth - (cardsPerRow - 1) * cardSpacing) / cardsPerRow;
   cardHeight = cardWidth;


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

window.addEventListener("resize", resize);

readCSV("../Data/Business Cards.csv").then(() => {
   resize(); // ensure correct sizing after load
   animate();
});
