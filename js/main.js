let svgWidth = window.innerWidth;
let svgHeight = window.innerHeight;

let cards = {};
let names = new Object();
let currIndex = 0;
let prevIndex = 0;
let nextIndex = 0;
let isFlipped = false;

let xScale = 3;

const speed = 0.5; // pixels per frame; adjust for faster/slower motion
let cardWidth = 0;
let cardHeight = 0;

let cardCount = 0;
let cardGroup;

// A flag to pause the conveyor belt
let isPaused = false;

// Append SVG to the container
const svg = d3.select("#card-area")
   .append("svg")
   .attr("width", svgWidth)
   .attr("height", svgHeight);

// Create the <g> group that will hold all cards
cardGroup = svg.append("g");

function CrementCurrIndex(offset) 
{
   if (offset < 0) { cards[nextIndex].attr("display", "none"); }
   else { cards[prevIndex].attr("display", "none"); }

   currIndex += offset;
   currIndex = currIndex % cardCount;
   if (currIndex < 0) 
   {
      currIndex = (-currIndex) % cardCount; 
      currIndex = cardCount - currIndex; 
   }
   nextIndex = (currIndex + 1) % cardCount;
   prevIndex = currIndex - 1 < 0 ? cardCount - 1 : (currIndex - 1) % cardCount;
}

function UpdateCards() 
{
   let centerX = svgWidth / 2.0 - cardWidth / 2.0;
   let centerY = window.innerHeight / 2.0 - cardHeight / 2.0;

   cards[prevIndex]
      .attr("x", centerX)
      .attr("y", -(cardHeight * 2) / 3)
      .attr("width", cardWidth)        // rectangle width
      .attr("height", cardHeight)      // rectangle height
      .attr("display", "block")
   cards[currIndex]
      .attr("x", centerX)
      .attr("y", centerY)
      .attr("width", cardWidth)        // rectangle width
      .attr("height", cardHeight)      // rectangle height
      .attr("display", "block")
   cards[nextIndex]
      .attr("x", centerX)
      .attr("y", window.innerHeight - (cardHeight) / 3)
      .attr("width", cardWidth)        // rectangle width
      .attr("height", cardHeight)      // rectangle height
      .attr("display", "block")
}

async function readCSV(csvFilePath) {

   try {
      var data = await d3.csv(csvFilePath);
      
      cardCount = data.length;

      data.forEach(function(d, index) {

         names[String(d.Name)] = index;

         let card = cardGroup.append("image")
            .attr("xlink:href", "../Data/" + d.Name + "_front.jpg")
            .attr("width", cardWidth)      // rectangle width
            .attr("height", cardHeight)     // rectangle height
        
         card.on('mouseover', function(d) { isPaused = true; });
         card.on('mouseout', function(d) { isPaused = false; });

         card.on('click', function(d) {
            if (cards[currIndex] !== card) { return; }
            isFlipped = !isFlipped;
            switch(isFlipped) 
            {
               case false:
                  d3.select(this)
                     .transition()
                     .attr("xlink:href", "../Data/" + data[index].Name + "_front.jpg");
                  break;
               case true:
                  d3.select(this)
                     .transition()
                     .attr("xlink:href", "../Data/" + data[index].Name + "_back.jpg")
                  break;
            }
         });
         svg.selectAll("image").attr("display", "none")
         cards[index] = card;
      });

      CrementCurrIndex(Math.floor(Math.random() * cardCount % cardCount));
      UpdateCards();

      return data;
      
   } catch (error) {
      console.error("Error reading csv:", error);
      return [];
   }
   
}

window.addEventListener("click", function(event) {
   if (isPaused) { return; }
   const y = event.clientY; // Y coordinate relative to the viewport
   const screenHeight = window.innerHeight;
 
   if (y < screenHeight / 2) {
     console.log("Clicked top half of screen");
     CrementCurrIndex(-1);
     UpdateCards();
   } else {
     console.log("Clicked bottom half of screen");
     CrementCurrIndex(1);
     UpdateCards();
   }
});

// Function to resize rectangle based on window size
function resize() {
   svgWidth = window.innerWidth;
   svgHeight = window.innerHeight;

   cardWidth = svgWidth / xScale;
   cardHeight = cardWidth * 0.5714;

   svg.attr("width", svgWidth)
      .attr("height", svgHeight);

   UpdateCards();
}

readCSV("../Data/Business Cards.csv").then(() => {
   resize(); // ensure correct sizing after load
   window.addEventListener("resize", resize);
});