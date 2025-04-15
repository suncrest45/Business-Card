let svgWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let svgHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

let cards = {};
let names = new Object();
let count = 0;

// Card details
const cardsPerRow = 5;
const cardSpacing = 10;
const speed = 0.5; // pixels per frame; adjust for faster/slower motion
let offset = 0;
let cardWidth = 0;
let cardHeight = 0;

let cardGroup;

// A flag to pause the conveyor belt
let isPaused = false;
let isSelected = false;
let prevIsSelected = isSelected;
let selectedCard;
let cardPos = {};
let cardDims = {};
let clickCount = 0;

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

      const numRows = Math.ceil(data.length / cardsPerRow);
      svgHeight = numRows * (cardHeight + cardSpacing);
      svg.attr("height", svgHeight);


      data.forEach(function(d, index) {
         const row = Math.floor(index / cardsPerRow);
         const col = index % cardsPerRow;

         names[String(d.Name)] = index;

         let card = cardGroup.append("image")
            .attr("xlink:href", "../Data/" + d.Name + "_front.jpg")
            .attr("x", col * (cardWidth + cardSpacing))  // x-coordinate
            .attr("y", row * (cardHeight + cardSpacing)) // y-coordinate
            .attr("width", cardWidth)      // rectangle width
            .attr("height", cardHeight)     // rectangle height
        
         card.on('mouseover', function(d) { isPaused = true; });
         card.on('mouseout', function(d) { isPaused = false; });

         card.on('click', function(d) {
            clickCount++;
            switch(clickCount) 
            {
               case 1:
                  isSelected = true;
                  selectedCard = card;
                  cardGroup.selectAll("image")
                     .filter(function() {
                        return this !== selectedCard.node();
                     })
                     .attr("display", "none");
                  cardPos[0] = card.attr("x");
                  cardPos[1] = card.attr("y");
                  cardDims[0] = card.attr("width");
                  cardDims[1] = card.attr("height");
                  cardWidth = svgWidth / 2.5;
                  cardHeight = cardWidth * 0.5714;
                  let centerX = svgWidth / 2.0 - cardWidth / 2.0;
                  let centerY = svgHeight / 2.0 - cardHeight / 2.0;
                  selectedCard
                     .attr("x", centerX)             // x-coordinate
                     .attr("y", centerY)             // y-coordinate
                     .attr("width", cardWidth)       // rectangle width
                     .attr("height", cardHeight)     // rectangle height
                     .attr("transform", "translate(" + -offset + ", 0)");
                  break;
               case 2:
                  selectedCard
                     .transition()
                     .duration(200)
                     .attr("width", 0)
                     .on("end", function(){
                        d3.select(this)
                           .attr("xlink:href", "../Data/" + data[index].Name + "_back.jpg")
                           .transition()
                           .duration(200)
                           .ease(d3.easeCubic)
                           .attr("width", cardWidth)
                     });
                  break;
               case 3:
                  selectedCard
                  .transition()
                  .duration(200)
                  .ease(d3.easeCubic)
                  .attr("width", 0)
                  .on("end", function() {
                     d3.select(this)
                        .attr("xlink:href", "../Data/" + data[index].Name + "_front.jpg")
                        .transition()
                        .duration(200)
                        .ease(d3.easeCubic)
                        .attr("width", cardWidth)
                        .on("end", function() {
                           cardGroup.selectAll("image")
                              .filter(function() {
                                 return this !== selectedCard.node();  // Exclude the selected card
                              })
                              .attr("display", "block");
            
                           selectedCard
                              .attr("x", cardPos[0])
                              .attr("y", cardPos[1])
                              .attr("width", cardDims[0])
                              .attr("height", cardDims[1])
                              .attr("transform", "translate(0, 0)");
                           isSelected = false;
                           clickCount = 0;
                        });
                  });
                  break;
            }
         });

         cards[index] = card;
         count++;
      });

      return data;
      
   } catch (error) {
      console.error("Error reading csv:", error);
      return [];
   }
   
}

d3.timer((time) => {
   if (isPaused | isSelected) { return;}

   offset -= speed;

   const totalWidth = (cardWidth + cardSpacing) * cardsPerRow;

   // If we've scrolled past one full row of cards, reset offset
   if (Math.abs(offset) > totalWidth) {
      offset = 0;
   }

   cardGroup.attr("transform", `translate(${offset}, 0)`);
});

// Function to resize rectangle based on window size
function resize() {
   svgWidth = window.innerWidth;
   svgHeight = window.innerHeight;

   cardWidth = (svgWidth - (cardsPerRow - 1) * cardSpacing) / cardsPerRow;
   cardHeight = cardWidth;

   svgHeight = Math.ceil(count / cardsPerRow) * (cardHeight + cardSpacing);
   svg.attr("height", svgHeight);

   svg.attr("width", svgWidth)
      .attr("height", svgHeight);

   if (isSelected) 
   {
      cardWidth = svgWidth / 2.5;
      cardHeight = cardWidth * 0.5714;
      let centerX = svgWidth / 2.0 - cardWidth / 2.0;
      let centerY = svgHeight / 2.0 - cardHeight / 2.0;
      selectedCard
         .attr("x", centerX)             // x-coordinate
         .attr("y", centerY)             // y-coordinate
         .attr("width", cardWidth)       // rectangle width
         .attr("height", cardHeight)     // rectangle height
   }
   else 
   {
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
}

readCSV("../Data/Business Cards.csv").then(() => {
   resize(); // ensure correct sizing after load
   window.addEventListener("resize", resize);
});
