"use strict";

let mountainsData = [];

window.onload = function() {
    // get data from JSON
    $.getJSON('data/mountains.json', function(returnedMtnsData) {
        mountainsData = returnedMtnsData.mountains;
        
        // load DDL with data
        const mtnsDDL = document.getElementById("mtnsDDL");
        let mountainsLength = mountainsData.length;
        for (let i = 0; i < mountainsLength; i++) {
        let mountainOptions = new Option(mountainsData[i].name);
        mtnsDDL.appendChild(mountainOptions);
    }
    });

    // view image hookup
    const viewImgBtn = document.getElementById("viewImgBtn");
    viewImgBtn.onclick = onViewImgBtnClicked;

    // clear all hookup
    const clearAllBtn = document.getElementById("clearAllBtn");
    clearAllBtn.onclick = onClearAllBtnClicked;
};

function onViewImgBtnClicked() {
    // find the div in which to put the cards
    const mtnsCardContainer = document.getElementById("mtnsCardContainer");
    // find drop down list
    const mtnsDDL = document.getElementById("mtnsDDL");

    // find selected drop down list choice
    let mtnsDDLSelection = mtnsDDL.value;

    // find the corresponding info for the selection - pull the name(actual source) from the data in the JS 
    let matchingImage = (mountainsData.find(data => data.name === mtnsDDLSelection)).img;

    // find corresponding name
    let matchingName = (mountainsData.find(data => data.name === mtnsDDLSelection)).name;

    //find corresponding description
    let matchingDesc = (mountainsData.find(data => data.name === mtnsDDLSelection)).desc;

    // find corresponding elevation
    let matchingElevation = (mountainsData.find(data => data.name === mtnsDDLSelection)).elevation;

    // find the long and lat
    let mtnData = mountainsData.find(data => data.name === mtnsDDLSelection);
    let mtnCoords = mtnData.coords;
    let mtnLat = mtnCoords.lat;
    let mtnLng = mtnCoords.lng;
    let createdURL = "https://api.sunrise-sunset.org/json?lat="+mtnLat+"&lng="+mtnLng+"&date=today";
    let JSONresults = [];
   
    $.getJSON(createdURL, function(results) {
        JSONresults = results;
        console.log(JSONresults);
        let sunriseTime = JSONresults.results.sunrise;
        console.log(sunriseTime);
        let sunsetTime = JSONresults.results.sunset;
        console.log(sunsetTime);

        // disable ability to add same image multiple times
        const allImagesInDiv = mtnsCardContainer.getElementsByTagName("img");
        let length = allImagesInDiv.length;
        for (let i = 0; i < length; i++) {
            let imgSource = allImagesInDiv[i].src;
            if (imgSource.includes(matchingImage)) {
                return;
            }
        }

        // pass information to create card
        createCard(matchingImage, matchingName, matchingDesc, matchingElevation, sunriseTime, sunsetTime);
    });
}

/* ---------- HELPER FUNCTIONS ---------- */
function createCard(matchingImage, matchingName, matchingDesc, matchingElevation, sunriseTime, sunsetTime) {
        // create the card "parts" 
        let cardDiv = document.createElement("div");
        cardDiv.className = "card col-lg-4 col-sm-12";
        cardDiv.style.width = "18rem";
    
        let cardImage = document.createElement("img");
        cardImage.src = "images/"+matchingImage;
        cardImage.className = "card-img-top";
        cardImage.alt = matchingName;
    
        let cardBody = document.createElement("div");
        cardBody.className = "card-body";
    
        let headerFive = document.createElement("h5");
        headerFive.className = "card-title";
        headerFive.innerText = matchingName;
    
        let cardText = document.createElement("p");
        cardText.className = "card-text";
        cardText.innerText = matchingDesc;
    
        let cardElevation = document.createElement("p");
        cardElevation.className = "card-text";
        cardElevation.innerText = "Elevation: " + matchingElevation + "ft";

        // Dev note: HAHAHAHA GOT ITTTTTTTT
        let sunriseSunset = document.createElement("p");
        sunriseSunset.className = "card-text";
        sunriseSunset.innerText = `Sunrise is at: ${sunriseTime} UTC and sunset is at: ${sunsetTime} UTC`;
    
        // avengers assemble
        // assemble the card "parts" into a card
        cardDiv.appendChild(cardImage);
        cardBody.appendChild(headerFive);
        cardBody.appendChild(cardText);
        cardBody.appendChild(cardElevation);
        cardDiv.appendChild(cardBody);
        cardDiv.appendChild(sunriseSunset);

        // show the card
        const mtnsCardContainer = document.getElementById("mtnsCardContainer");
        mtnsCardContainer.appendChild(cardDiv);
}
// clear the div lol
function onClearAllBtnClicked() {
    const mtnsCardContainer = document.getElementById("mtnsCardContainer");
    mtnsCardContainer.innerHTML = "";

    // return DDL to Select one: on clear
    const mtnsDDL = document.getElementById("mtnsDDL");
    mtnsDDL.value= "";
}
