"use strict";

let locationData = [];
let parktypesData = [];
let ntlParksData = [];

window.onload = function() {
    // load the ntl parks data first because there's a lot of it 
    $.getJSON('data/nationalparks.json', function(returnedNtlData) {
        ntlParksData = returnedNtlData.parks;

        // load the location data
        $.getJSON('data/locations.json', function(returnedLocationData) {
            locationData = returnedLocationData;
        });

        // load the park types data
        $.getJSON('data/parktypes.json', function(returnedParkTypesData) {
            parktypesData = returnedParkTypesData;
        });
    });

    // REMINDER! You CANNOT access any data pulled from the above JSON below

    // hook up on change event handler for filterDDL
    const filterDDL = document.getElementById("filterDDL");
    filterDDL.onchange = filterDDLSelectionMade;

    // hook up filter change
    const chosenFilterDDL = document.getElementById("chosenFilterDDL");
    chosenFilterDDL.onchange = chosenFilterMade;

    // hook up view all btn
    const viewAllBtn = document.getElementById("viewAllBtn");
    viewAllBtn.onclick = viewAll;

    // hook up hide all btn
    const hideAllBtn = document.getElementById("hideAllBtn");
    hideAllBtn.onclick = hideAll;

    // hook up show contact info
    const contactInfo = document.getElementById("contactInfo");
    contactInfo.onclick = showContactInfo;
};

/* ---------- EVENT HANDLERS ---------- */
function filterDDLSelectionMade() {
    // find the selected filter category
    const filterDDL = document.getElementById("filterDDL");
    let selectedFilterCategory = filterDDL.value;

    // clear old results before processing new selection
    clearOldResults();

    // show view all btn
    const viewAllBtn = document.getElementById("viewAllBtn");
    viewAllBtn.classList.remove("d-none");

    // hide hide all btn
    const hideAllBtn = document.getElementById("hideAllBtn");
    hideAllBtn.classList.add("d-none");
    

    // determine option to run
    if (selectedFilterCategory === "By location:") {
        loadSecondDDL(locationData);
        hideContactInfoBtn();
    }
    else if (selectedFilterCategory === "By park type:") {
        loadSecondDDL(parktypesData);
        hideContactInfoBtn();
    }
    else {
        const chosenFilterDDL = document.getElementById("chosenFilterDDL");
        chosenFilterDDL.classList.add("d-none");
        hideContactInfoBtn();
    }
}

function chosenFilterMade() {
    // find the selected filter
    const filterDDL = document.getElementById("filterDDL");
    let selectedFilterCategory = filterDDL.value;
    const chosenFilterDDL = document.getElementById("chosenFilterDDL");
    let selectedFilter = chosenFilterDDL.value;

    // if user selects blank category, exit event handler
    if (selectedFilter === "Select one:") {
        // clear WHOLE table - *OPPORTUNITY TO CHANGE*
        clearOldResults();
        // show view all btn
        const viewAllBtn = document.getElementById("viewAllBtn");
        viewAllBtn.classList.remove("d-none");

        // hide hide all btn
        const hideAllBtn = document.getElementById("hideAllBtn");
        hideAllBtn.classList.add("d-none");
        hideContactInfoBtn();
    }
    else {
        let matchingParks;
        
        // find what to filter by
        if (selectedFilterCategory === "By location:") {
            // find matching parks based on selected state filter
            matchingParks = ntlParksData.filter(parks => parks.State === selectedFilter);
        }
        else {
            // find matching parks based on selected type filter
            matchingParks = ntlParksData.filter(parks => parks.LocationName.toLowerCase().includes(selectedFilter.toLowerCase()));
        }
        
        // prevent stacking of tables
        clearOldResults();

        if (matchingParks.length == 0) {
            const tableContainer = document.getElementById("tableContainer");
            tableContainer.innerHTML = "NO MATCHES FOUND";
            return;
        }

        // create table and display data
        createTable();
        createTableHeaders();
        loadTableData(matchingParks);
        // uncheck show contact info button when new selection made
        const contactInfo = document.getElementById("contactInfo");
        contactInfo.checked = false;
        showContactInfoBtn();
    }
}

function viewAll() {
    clearOldResults();
    createTable();
    createTableHeaders();
    loadTableData(ntlParksData);

    // return first DDL to starting position
    const filterDDL = document.getElementById("filterDDL");
    filterDDL.value = "";

    // hide second DDL
    const chosenFilterDDL = document.getElementById("chosenFilterDDL");
    chosenFilterDDL.classList.add("d-none");

    // show hide all btn
    const hideAllBtn = document.getElementById("hideAllBtn");
    hideAllBtn.classList.remove("d-none");

    // hide view all btn
    const viewAllBtn = document.getElementById("viewAllBtn");
    viewAllBtn.classList.add("d-none");
    showContactInfoBtn();
}

function hideAll() {
    clearOldResults();

    // reset first DDL to starting position
    const filterDDL = document.getElementById("filterDDL");
    filterDDL.value = "";
    
    // hide hide all btn
    const hideAllBtn = document.getElementById("hideAllBtn");
    hideAllBtn.classList.add("d-none");

    // show view all btn
    const viewAllBtn = document.getElementById("viewAllBtn");
    viewAllBtn.classList.remove("d-none");

    // hide second DDL
    const chosenFilterDDL = document.getElementById("chosenFilterDDL");
    chosenFilterDDL.classList.add("d-none");

    // hide contact info btn
    hideContactInfoBtn();
}

function showContactInfo() {
    // find contact info checkbox
    const contactInfo = document.getElementById("contactInfo");

    // show contact info of selected parks if checked
    if (contactInfo.checked === true) {
    // find the selected filter
    const filterDDL = document.getElementById("filterDDL");
    let selectedFilterCategory = filterDDL.value;
    const chosenFilterDDL = document.getElementById("chosenFilterDDL");
    let selectedFilter = chosenFilterDDL.value;

    // if user selects blank category, exit event handler
    if (selectedFilter === "Select One:") {
        // clear WHOLE table - *OPPORTUNITY TO CHANGE*
        clearOldResults();
    }
    else {
        let matchingParks;
        
        // find what to filter by
        if (selectedFilterCategory === "By location:") {
            // find matching parks based on selected state filter
            matchingParks = ntlParksData.filter(parks => parks.State === selectedFilter);
        }
        else {
            // find matching parks based on selected type filter
            matchingParks = ntlParksData.filter(parks => parks.LocationName.toLowerCase().includes(selectedFilter.toLowerCase()));
        }
        
        // prevent stacking of tables
        clearOldResults();

        if (matchingParks.length == 0) {
            const tableContainer = document.getElementById("tableContainer");
            tableContainer.innerHTML = "NOTHING TO SHOW WHY DID YOU CLICK THIS";
            return;
        }

        // create table and display data
        createTable();
        createTableHeadersContact();
        loadTableDataWithContact(matchingParks);
    }
    }
    else {
        chosenFilterMade();
    }
}

/* ---------- HELPER FUNCTIONS ---------- */
function createTable() {
    // I don't want the table there on load - dynamically create it
    let createTable = document.createElement("table");
    createTable.id = "parkDataTable";
    createTable.className = "table table-striped";

    const tableContainer = document.getElementById("tableContainer");
    tableContainer.appendChild(createTable);
}

function createTableHeaders() {
    // find the table the headers will go into
    let createdTable = document.getElementById("parkDataTable");
    
    // create table row
    let tr = document.createElement("tr");

    // create table headers
    let nameHead = document.createElement("th");
    nameHead.innerHTML = "Location Name";

    let addressHead = document.createElement("th");
    addressHead.innerHTML = "Address";

    let cityHead = document.createElement("th");
    cityHead.innerHTML = "City";

    let stateHead = document.createElement("th");
    stateHead.innerHTML = "State";
    
    let locationIdHead = document.createElement("th");
    locationIdHead.innerHTML = "Location ID";

    // put it together
    tr.appendChild(nameHead);
    tr.appendChild(addressHead);
    tr.appendChild(cityHead);
    tr.appendChild(stateHead);
    tr.appendChild(locationIdHead);

    // display it
    createdTable.appendChild(tr);
}

function createTableHeadersContact() {
        // find the table the headers will go into
        let createdTable = document.getElementById("parkDataTable");
    
        // create the row
        let tr = document.createElement("tr");
    
        // create the headers
        let nameHead = document.createElement("th");
        nameHead.innerHTML = "Location Name";
    
        let addressHead = document.createElement("th");
        addressHead.innerHTML = "Address";
    
        let cityHead = document.createElement("th");
        cityHead.innerHTML = "City";
    
        let stateHead = document.createElement("th");
        stateHead.innerHTML = "State";
        
        let locationIdHead = document.createElement("th");
        locationIdHead.innerHTML = "Location ID";

        let phoneHead = document.createElement("th");
        phoneHead.innerHTML = "Phone Number";

        let faxHead = document.createElement("th");
        faxHead.innerHTML = "Fax Number";
    
        // put it together
        tr.appendChild(nameHead);
        tr.appendChild(addressHead);
        tr.appendChild(cityHead);
        tr.appendChild(stateHead);
        tr.appendChild(locationIdHead);
        tr.appendChild(phoneHead);
        tr.appendChild(faxHead);
    
        // display it
        createdTable.appendChild(tr);
}

function loadSecondDDL(selectedFilterCategory) {
    // find the DDL to load options into
    const chosenFilterDDL = document.getElementById("chosenFilterDDL");
    chosenFilterDDL.classList.remove("d-none");

    // prevent compounding of DDL selections
    chosenFilterDDL.innerHTML="";
    let categoryOption = new Option("Select one:");
    chosenFilterDDL.appendChild(categoryOption);

    // load the filter options
    let numCategories = selectedFilterCategory.length;
    for (let i = 0; i < numCategories; i++) {
        let categoryOption = new Option(selectedFilterCategory[i]);
        chosenFilterDDL.appendChild(categoryOption);
    }
}
    
function loadTableData(matchingParks) {
    // find the table
    let createdTable = document.getElementById("parkDataTable");

    // loop through matching data and put into the table
    let numParks = matchingParks.length;
    for (let i = 0; i < numParks; i++) {
        let createdRow = createdTable.insertRow(-1);

        let nameCell = createdRow.insertCell(0);
		nameCell.innerHTML = matchingParks[i].LocationName;

		let addressCell = createdRow.insertCell(1);
		addressCell.innerHTML = matchingParks[i].Address;

		let cityCell = createdRow.insertCell(2);
		cityCell.innerHTML = matchingParks[i].City;
       
        let stateCell = createdRow.insertCell(3);
		stateCell.innerHTML = matchingParks[i].State;
        
        let idCell = createdRow.insertCell(4);
		idCell.innerHTML = matchingParks[i].LocationID;
    }

    // hide view all btn
    const viewAllBtn = document.getElementById("viewAllBtn");
    viewAllBtn.classList.add("d-none");

    // show hide all btn
    const hideAllBtn = document.getElementById("hideAllBtn");
    hideAllBtn.classList.remove("d-none");
}

function loadTableDataWithContact(matchingParks) {
    // same as above function but with loaded contact info
    let createdTable = document.getElementById("parkDataTable");

    let numParks = matchingParks.length;
    for (let i = 0; i < numParks; i++) {
        let createdRow = createdTable.insertRow(-1);

        let nameCell = createdRow.insertCell(0);
		nameCell.innerHTML = matchingParks[i].LocationName;

		let addressCell = createdRow.insertCell(1);
		addressCell.innerHTML = matchingParks[i].Address;

		let cityCell = createdRow.insertCell(2);
		cityCell.innerHTML = matchingParks[i].City;
       
        let stateCell = createdRow.insertCell(3);
		stateCell.innerHTML = matchingParks[i].State;
        
        let idCell = createdRow.insertCell(4);
		idCell.innerHTML = matchingParks[i].LocationID;
        
        let phoneCell = createdRow.insertCell(5);
        if (matchingParks[i].Phone === 0) {
            phoneCell.innerHTML = "Not Available";
        }
        else {
            phoneCell.innerHTML = matchingParks[i].Phone;
        }

        let faxCell = createdRow.insertCell(6);
        if (matchingParks[i].Fax === 0) {
            faxCell.innerHTML = "Not Available";
        }
        else {
            faxCell.innerHTML = matchingParks[i].Fax;
        }
    }
    const viewAllBtn = document.getElementById("viewAllBtn");
    viewAllBtn.classList.add("d-none");
    const hideAllBtn = document.getElementById("hideAllBtn");
    hideAllBtn.classList.remove("d-none");
}

function clearOldResults() {
    // prevent compounding of tables
    let createdTable = document.getElementById("tableContainer");
    createdTable.innerHTML = "";
}

function showContactInfoBtn() {
    // show contact info btn
    const contactInfoDiv = document.getElementById("contactInfoDiv");
    contactInfoDiv.classList.remove("d-none");
}

function hideContactInfoBtn() {
    // hide contact info btn
    const contactInfoDiv = document.getElementById("contactInfoDiv");
    contactInfoDiv.classList.add("d-none");

    // find the show contact info and set value to none when hiding so it doesn't autopopulate when it disappears and reappears
    const contactInfo = document.getElementById("contactInfo");
    contactInfo.checked = false;

}
