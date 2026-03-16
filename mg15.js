const suits = ["club", "diamond", "heart", "spade"]
const digits = ["1","2","3","4","5","6"]
var grid = [] // shows locations of cards on the board
var allCardIDs = {}; // Maps the IDs of cards to the 
var initialShuffle = false; // Signals if the board has been shuffled at least once since creation
var clickedCards = []; // An array of cards that have been clicked by a user during a game.
var isGameActive = false // Signals if there is currently a game taking place


// Toggles the visibility of an element by it's ID
function toggleVisibility(elementId){
    const targetElement = document.getElementById(elementId)
    if (targetElement.style.display == "none"){
        targetElement.style.display = "block"
    } else if (targetElement.className == "card-container" & targetElement.style.display == "none") {
        targetElement.style.display = "grid"
    }else{
        targetElement.style.display = "none"
    }
}


// Generates a <img> inside a <div>. This is the card; takes in a suit, value, and an ID to be assigned to the card. 
function generateCard(suit, value, newCardId){
    var el = document.createElement("div")
    el.className = "card"
    el.id = newCardId
    el.onclick = function() {handleCardClick(this); console.log("clicked on card")}

    const imageEl = document.createElement("img")
    imageEl.src = `/images/${suit}_${value}.png`

    el.append(imageEl)
    return el
}

// Populates the HTML grid with cards, based on the selected radio button.
function populateCardGrid(){
    console.log("populating card grid")
    const size2x4 = document.getElementById("2x4")
    const size4x4 = document.getElementById("4x4")
    const size6x4 = document.getElementById("6x4")

    // delete previous cards if there are any
    const cardContainer = document.getElementById("card-container")
    cardContainer.innerHTML = ""

    if (size2x4.checked == true){
        var rowCount = 2
    } else if (size4x4.checked == true){
        var rowCount = 4
    } else if (size6x4.checked == true){
        var rowCount = 6
    }

    // Resizes the grid appropriately
    resizeGridVar(4,rowCount)

    // Fills in the grid with new cards, adds the card IDs to a 
    // dict called allCardIDs which maps the cardID to the card's HTML code.
    for (var i=1; i<rowCount+1; i++){
        for (var j=0; j<4; j++){ 
            var newCardId = `card_${suits[j]}_${i}`
            cardElement = generateCard(suits[j], i, newCardId)
            cardContainer.appendChild(cardElement)
            grid[i-1][j] = newCardId;
            allCardIDs[newCardId] = cardElement;
            //console.log(grid)
        }
    }
}


// Resizes the grid variable to the correct dimentions when the grid size is changed by the user
function resizeGridVar(width,height){
    grid = []
    for (i=0; i<height; i++){
        grid.push(new Array(width))
    }
    console.log("New grid: " + grid)
}


// Shuffles the cards in the grid variable by flattening the grid, shuffling, then reconstructing it
function shuffle(){
    if (!initialShuffle){
        initialShuffle = true
    }

    width = grid[0].length
    height = grid.length

    flatGrid = grid.flat(Infinity)
    flatGrid = flatGrid.flat(Infinity)

    //Fisher-Yates algorithm
    for (let x =flatGrid.length-1; x>0; x--){
        let idiot = Math.floor(Math.random() * (x + 1));
        //alert(y)
        [flatGrid[x], flatGrid[idiot]] = [flatGrid[idiot], flatGrid[x]]
    }
    
    // Grid Reconstuction
    let reconstructedGrid = []
    let start=0
    for (let i=4; i<flatGrid.length+4; i+=width){
        reconstructedGrid.push(flatGrid.slice(start,i))
        start = i
    }

    // Display current state of the grid
    grid = reconstructedGrid
    displayGrid(grid)

}


// Displays the grid using the IDs that it stores
function displayGrid(grid){
    const cardContainer = document.getElementById("card-container")
    cardContainer.innerHTML = ""

    for (let row=0; row<grid.length; row++){
        for (let col=0; col<grid[0].length; col++){
            currentCardID = grid[row][col]
            cardContainer.appendChild(allCardIDs[currentCardID])
        }
    }
}


// Handles the start of the game
function start(){
    // Reset click cound and number of pairs
    document.getElementById("click-count").innerHTML = 0
    document.getElementById("pair-count").innerHTML = 0

    // Check if cards have been shuffled at least once
    if (!initialShuffle){
        alert("You need to shuffle the cards first!")
        return;
    }

    for (const [cardID, element] of Object.entries(allCardIDs)){
        hideCard(cardID);
    }

    // Hide UI that selects grid size and the shuffle + start buttons
    toggleVisibility("board-size-selector")
    toggleVisibility("button-container")

    isGameActive = true
}


// Hides a card based on it's ID
function hideCard(id){
    for (let row=0; row<grid.length; row++){
        for (let col=0; col<grid[0].length; col++){
            if (grid[row][col] == id){
                allCardIDs[id].childNodes[0].src = "images/back.jpg"
            }
        }
    }   
    displayGrid(grid)
    console.log(`Hidden hard of id: ${id}`)
}


// Shows a card based on it's ID
function showCard(id){
    for (let row=0; row<grid.length; row++){
        for (let col=0; col<grid[0].length; col++){
            if (grid[row][col] == id){
                parsedID = id.split("_")
                allCardIDs[id].childNodes[0].src = `images/${parsedID[1]}_${parsedID[2]}.png`
            }
        }
    }
    displayGrid(grid)
    console.log(`Shown card of id: ${id}`)
}


// Handles the clicking of a card
async function handleCardClick(cardElement){
    if (!isGameActive){
        return;
    }
    // Increases click count
    increaseClickCount(1);

    // Show the card and disable it from being clicked and add it's ID to the clicked cards array
    showCard(cardElement.id)
    console.log(cardElement)
    cardElement.style["pointer-events"] = "none";
    clickedCards.push(cardElement.id)

    // Check if two cards have been clicked, and if yes then compare if they make a pair. If not they are flipped back
    if (clickedCards.length == 2){
        let card1parsed = clickedCards[0].split("_")
        let card2parsed = clickedCards[1].split("_")
        console.log("clickedCards content: " + clickedCards)
        if (card1parsed[2] == card2parsed[2]){
            increasePairCount(1)
            console.log(`Pair found! Cards in pair: ${clickedCards[0]} ${clickedCards[1]}`)

            // Add yellow border to the cards and reset the clickedCards array
            for (const cardId of clickedCards){
                allCardIDs[cardId].childNodes[0].style.border = "2px yellow solid";
                console.log("added border")
            }
            clickedCards.length = 0
        }else{

            await new Promise(r => setTimeout(r, 1000)); // sleep for 1 second so the user sees what they clicked
            for (const cardId of clickedCards){
                hideCard(cardId)
                allCardIDs[cardId].style["pointer-events"] = "auto";
            }
            clickedCards.length = 0 // resets the array without creating a new one 
        }

        // Check if user won or lost
        if (getClickCount() > Object.keys(allCardIDs).length * 2){ // if user lost
            showModal("Game over! Try again!")
        }
        else if (checkIfWon()) {
            showModal("Congratulations!")
        }
    }
}


// Increases (or decreases) the click count
function increaseClickCount(number){
    let newVal = parseInt(document.getElementById("click-count").innerHTML) + number;
    document.getElementById("click-count").innerHTML = newVal.toString();
}


// Gets current click count and returns as string
function getClickCount(){
    return document.getElementById("click-count").innerHTML
}


// Increases (or decreases) the pair count
function increasePairCount(number){
    let newVal = parseInt(document.getElementById("pair-count").innerHTML) + number
    document.getElementById("pair-count").innerHTML = newVal.toString()
}


// Gets nummber of pairs and returns as string
function getPairCount(){
    return document.getElementById("pair-count").innerHTML
}

// Checks if all card elements are disabled (if all pairs have been found)
function checkIfWon(){
    for (let row=0; row<grid.length; row++){
        for (let col=0; col<grid[0].length; col++){
            let cardId = grid[row][col]
            if (allCardIDs[cardId].style["pointer-events"] !== "none"){
                return false
            }
        }
    }
    return true 
}


// Shows the modal with a custom message
function showModal(message){
    document.getElementById("modal-text").innerHTML = message
    
    document.getElementById("end-screen-modal").showModal()
}

/*
Listeners
*/

window.onload = function(){
    populateCardGrid()
}



/*
Finished on successfully adjusting the board size. Finished on part 2 bullet point 2.

TODO:
- add shuffle functionality
- make it so when the cards are generated, they are generated in the correct values and suits
- 

*/ 