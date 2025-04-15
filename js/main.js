let svgWidth = window.innerWidth;
let svgHeight = window.innerHeight;

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

function dragstarted() {
   console.log("Drag started!")
   d3.select(this).raise();
   cardGroup.attr("cursor", "grabbing");
}

function dragged(event, d) {
   console.log("Dragged!")
   offset = event.y;
   d3.select(this).attr("cy", d.y = event.y);
}

function dragended() {
   console.log("Drag ended!")
   cardGroup.attr("cursor", "grab");
}

async function readCSV(csvFilePath) {

   try {
      var data = await d3.csv(csvFilePath);

      cardWidth = svgWidth / 2.5;
      cardHeight = cardWidth * 0.5714;

      data.forEach(function(d, index) {
         let centerX = svgWidth / 2.0 - cardWidth / 2.0;
         let centerY = window.innerHeight / 2.0 - cardHeight / 2.0;

         const row = Math.floor(index / cardsPerRow);
         const col = index % cardsPerRow;

         names[String(d.Name)] = index;

         let card = cardGroup.append("image")
            .attr("xlink:href", "../Data/" + d.Name + "_front.jpg")
            .attr("x", centerX)  // x-coordinate
            .attr("y", index * cardHeight) // y-coordinate
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
                  selectedCard
                     .attr("x", centerX)             // x-coordinate
                     .attr("y", centerY - offset);             // y-coordinate
                  break;
               case 2:
                  d3.select(this)
                     .transition()
                     .duration(500)
                     .attr("transform", `translate(${svgWidth / 2.0 - 0.5}, ${svgHeight / 2.0 - 0.5}) scale(${1/cardWidth}, ${1/cardHeight})`)
                     .transition()
                     .duration(500)
                     .attr("transform", `scale(${cardWidth / d3.select(this).attr("width")}, ${cardHeight / d3.select(this).attr("height")}) `)
                     .attr("xlink:href", "../Data/" + data[index].Name + "_back.jpg");
                  break;
               case 3:
                  d3.select(this)
                     .transition()
                     .attr("xlink:href", "../Data/" + data[index].Name + "_front.jpg");
                  cardGroup.selectAll("image")
                     .filter(function() {
                        return this !== selectedCard.node();  // Exclude the selected card
                     })
                     .attr("display", "block");
                  selectedCard
                     .attr("x", cardPos[0])           // x-coordinate
                     .attr("y", cardPos[1])           // y-coordinate
                     .attr("width", cardDims[0])      // rectangle width
                     .attr("height", cardDims[1])     // rectangle height
                     .attr("transform", "translate(0, 0)")
                  isSelected = false;
                  clickCount = 0;
                  break;
            }
         });

         cards[index] = card;
         count++;
      });

      svg
         .data(data)
         //.join("image")
         .attr("cx", ({x}) => x)
         .attr("cy", ({y}) => y)
         .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

      return data;
      
   } catch (error) {
      console.error("Error reading csv:", error);
      return [];
   }
   
}

d3.timer((time) => {
   if (isSelected) { return;}

   //offset -= speed;

   // const totalWidth = (cardWidth + cardSpacing) * cardsPerRow;

   // // If we've scrolled past one full row of cards, reset offset
   // if (Math.abs(offset) > totalWidth) {
   //    offset = 0;
   // }

   cardGroup.attr("transform", `translate(0, ${offset})`);
});

// Function to resize rectangle based on window size
function resize() {
   svgWidth = window.innerWidth;
   svgHeight = window.innerHeight;

   cardWidth = svgWidth / 2.5;
   cardHeight = cardWidth * 0.5714;

   let centerX = svgWidth / 2.0 - cardWidth / 2.0;
   let centerY = window.innerHeight / 2.0 - cardHeight / 2.0;

   svg.attr("width", svgWidth)
      .attr("height", svgHeight);

   if (isSelected) 
   {
      selectedCard
         .attr("x", centerX)             // x-coordinate
         // .attr("y", centerY)             // y-coordinate
         .attr("width", cardWidth)       // rectangle width
         .attr("height", cardHeight)     // rectangle height
   }
   else 
   {
      for (let i = 0; i < count; i++) {
         //const row = Math.floor(i / cardsPerRow);
         //const col = i % cardsPerRow;
   
         cards[i]
            .attr("x", centerX)  // x-coordinate
            // .attr("y", i * cardHeight) // y-coordinate
            .attr("width", cardWidth)      // rectangle width
            .attr("height", cardHeight)     // rectangle height
         }
   }
}

readCSV("../Data/Business Cards.csv").then(() => {
   resize(); // ensure correct sizing after load
   window.addEventListener("resize", resize);
});
