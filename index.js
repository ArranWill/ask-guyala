// This is where the script starts. It gets the text the user types in and waits for the user to hit the search button or the enter key.
function listenForInput() {
    const input = document.getElementById("input");
    const submit_button = document.getElementById("submit_button");
    submit_button.addEventListener("click", () => respondToInput(input.value));
    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            submit_button.click();
        }
    });
}

// This function checks the input is valid, then writes the page information.
async function respondToInput(search_term) {
    if (validateInput(search_term)) {
        const waste_item = await getWasteItemOrDefualt(search_term);
        setPageBody(waste_item);
        setTrafficLights(waste_item.disposal);
        displayPageBody();
    }    
}

// This function checks the user has typed in appropriate input.
function validateInput(input) {
    if (input.length < 1) {
        alert("Please type in a waste item. 🙃");
        document.getElementById("form").reset();
        return false;
    }
    else if (input.length > 50) {
        alert("Maximum search term length is 50 characters. 😤")
        document.getElementById("form").reset();
        return false;
    }
    else {
        return true;
    }
}

// This function returns the waste item information, or the default if the item isn't in the data.
async function getWasteItemOrDefualt(item) {
    const pattern = new RegExp("^"+item.toLowerCase()+"s?$");
    const waste_items = await getWasteItems();
    for (let i = 1; i < waste_items.length; i++) {  // For each waste item in the database...
        for (let j = 0; j < waste_items[i].terms.length; j++) {
            if (pattern.test(waste_items[i].terms[j])) {  // Match each recorded search term against the input
                return waste_items[i];
            }
        }
    }
    return waste_items[0];
}

// This function fetches the data from "waste_items.json".
async function getWasteItems() {
    const response = await fetch("./waste_items.json");
    return await response.json();
}

// This function generates the page information.
function setPageBody(waste_item) {
    if (waste_item.name === "default") {
        setDefault();
    }
    else {
        document.getElementById("heading").innerHTML = waste_item.name;
        document.getElementById("disposal").innerHTML = getDisposal(waste_item.name, waste_item.disposal);
        document.getElementById("information").innerHTML = waste_item.information; 
    }     
}

function setDefault() {
    document.getElementById("heading").innerHTML = "No Information";
    document.getElementById("disposal").innerHTML = "The item you have searched for currently doesn't exist in our database of waste items.";
    document.getElementById("information").innerHTML = "The safest option would be to put the item in general waste. Alternatively, you could take the item to a council transfer station or specialist recycler, and they may be able to help you. "; 
}

// This function generates the disposal information based on the disposal array.
function getDisposal(name, disposal_array) {
    let disposal_string = ``;
    const disposal_templates = {
        0: `${name} are biodegradable, meaning they will break down naturally over time. Dispose of ${name} in a compost or organics bin. Explore how you can <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/which-bin-do-i-put-it-in/love-food-hate-waste/compost-your-food-waste">compost food waste</a>. `,
        1: `${name} are recyclable, meaning they can be re-processed and turned into something new! Dispose of ${name} in a recycling bin. `,
        2: `${name} can be disposed of in a general waste bin. `, 
        3: `You can take ${name} to a council transfer station for re-processing, and if the material can be recovered it will be recycled and turned into a useful product! Read more about <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/facilities">waste transfer stations</a> in Cairns. `,
        4: `Some common waste items are more difficult to recycle. You can take ${name} to a specialist recycler for re-processing, and if the material can be recovered it will be recycled and turned into a useful product! Read more about <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/what-happens-to-my-waste/specialist-recycling">specialist recycling</a> in Cairns. `
    }   
    for (let i = 0; i < 5; i++) {
        if (disposal_array[i]) {
            disposal_string += disposal_templates[i];
        }
    }
    return disposal_string;
}

// This function changes the colour of the traffic lights based on the disposal array.
function setTrafficLights(disposal_array) {
    let current_traffic_light;
    const traffic_lights = {
        0: "organic-light",
        1: "recycling-light",
        2: "waste-light",
        3: "transfer-station-light",
        4: "specialist-recycler-light"
    }
    for (let i = 0; i < 5; i++) {
        current_traffic_light = document.getElementById(traffic_lights[i]);
        if (disposal_array[i]) {
            current_traffic_light.classList.remove("off");
            current_traffic_light.classList.add(traffic_lights[i])
        }
        else {
            current_traffic_light.classList.remove(traffic_lights[i]);
            current_traffic_light.classList.add("off");
        }
    }
}

// This function makes the information appear in a cool way.
function displayPageBody() {
    document.getElementById("information-container").style.height = document.getElementById("information-inner").clientHeight + "px";
    document.getElementById("body-container").classList.add("fade-in");
}

// This makes the script run.
listenForInput();
