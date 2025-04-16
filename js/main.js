let svgWidth = window.innerWidth;
let svgHeight = window.innerHeight;

let animate = false;
let isAnimating = false;

let cards = {};
let names = new Object();
let currIndex = 0;
let prevIndex = 0;
let prevPrevIndex = 0;
let nextIndex = 0;
let isFlipped = false;
let isGoingUp = false;

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
   let centerX = svgWidth / 2.0 - cardWidth / 2.0;
   if (offset != 0) { animate = true; }
   else { animate = false; }
   if (offset < 0) { prevPrevIndex = nextIndex; isGoingUp = true; }
   else if (offset > 0) { prevPrevIndex = prevIndex; isGoingUp = false; }

   currIndex += offset;
   currIndex = currIndex % cardCount;
   if (currIndex < 0) 
   {
      currIndex = (-currIndex) % cardCount; 
      currIndex = cardCount - currIndex; 
   }
   nextIndex = (currIndex + 1) % cardCount;
   prevIndex = currIndex - 1 < 0 ? cardCount - 1 : (currIndex - 1) % cardCount;

   if (isGoingUp) { cards[prevIndex].attr("x", centerX).attr("y", -(cardHeight * 2) / 3 + window.innerHeight * 1.5); }
   else if (animate) { cards[nextIndex].attr("x", centerX).attr("y", -window.innerHeight * 0.5 - (cardHeight) / 3); } //-(cardHeight * 2) / 3 - window.innerHeight * 1.5
}

function UpdateCards() 
{
   let centerX = svgWidth / 2.0 - cardWidth / 2.0;
   let centerY = window.innerHeight / 2.0 - cardHeight / 2.0;

   cards[prevIndex]
      .attr("width", cardWidth)        // rectangle width
      .attr("height", cardHeight)      // rectangle height
      .attr("display", "block")
   cards[currIndex]
      .attr("width", cardWidth)        // rectangle width
      .attr("height", cardHeight)      // rectangle height
      .attr("display", "block")
   cards[nextIndex]
      .attr("width", cardWidth)        // rectangle width
      .attr("height", cardHeight)      // rectangle height
      .attr("display", "block")

   if (animate) 
   {
      cards[prevIndex]
         .transition()
         .duration(1000)
         .ease(d3.easeCubicInOut)
         .attr("x", centerX)
         .attr("y", window.innerHeight - (cardHeight) / 3)
      cards[currIndex]
         .transition()
         .duration(1000)
         .ease(d3.easeCubicInOut)
         .attr("x", centerX)
         .attr("y", centerY)
      cards[nextIndex]
         .transition()
         .duration(1000)
         .ease(d3.easeCubicInOut)
         .attr("x", centerX)
         .attr("y", -(cardHeight * 2) / 3);
      
      let animDest = isGoingUp ? -(cardHeight * 2) / 3 - window.innerHeight * 1.5 : -(cardHeight) / 3 + window.innerHeight * 1.5;//-window.innerHeight * 0.5 - (cardHeight) / 3

      cards[prevPrevIndex]
         .transition()
         .duration(1000)
         .on("start", function() {
            isAnimating = true;
          })
         .ease(d3.easeCubicInOut)
         .attr("x", centerX)
         .attr("y",  animDest)
         .on("end", function() {
            cards[prevPrevIndex].attr("display", "none");
            isAnimating = false;
         });
   }
}

const defs = svg.append("defs");

const filter = defs.append("filter")
   .attr("id", "card-shadow")
   .attr("x", "-50%")
   .attr("y", "-50%")
   .attr("width", "200%")


filter.append("feDropShadow")
   .attr("dx", 5)
   .attr("dy", 5)
   .attr("stdDeviation", 4)
   .attr("flood-color", "#000")
   .attr("flood-opacity", 1.0);

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
            .style("filter", "url(#card-shadow)");

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
      cards[prevIndex]
         .attr("x", centerX)
         .attr("y", window.innerHeight - (cardHeight) / 3)
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
         .attr("y", -(cardHeight * 2) / 3)
         .attr("width", cardWidth)        // rectangle width
         .attr("height", cardHeight)      // rectangle height
         .attr("display", "block")

      return data;
      
   } catch (error) {
      console.error("Error reading csv:", error);
      return [];
   }
   
}

window.addEventListener("click", function(event) {
   if (isPaused || isAnimating) { return; }
   const y = event.clientY; // Y coordinate relative to the viewport
   const screenHeight = window.innerHeight;
 
   if (y < screenHeight / 2) {
     CrementCurrIndex(-1);
     UpdateCards();
   } else {
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

   svgHeight = Math.ceil(count / cardsPerRow) * (cardHeight + cardSpacing);
   svg.attr("height", svgHeight);

   svg.attr("width", svgWidth)
      .attr("height", svgHeight);

   UpdateCards();
}

readCSV("../Data/Business Cards.csv").then(() => {
   resize(); // ensure correct sizing after load
   window.addEventListener("resize", resize);
});