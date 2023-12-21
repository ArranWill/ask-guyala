// This is where the script starts. Inputs are seperated into different types.
function listenForInput() {
  listenForSearch();
  listenForTrafficLightClick();
  listenForGuyalaClick();
}

// This function waits for the user to click the search button or press the enter key, then initiates the query.
function listenForSearch() {
  BUTTON_SUBMIT.addEventListener("click", () => respondToInput(INPUT.value));
  INPUT.addEventListener("keypress", (event) => submitOnEnter(event));
}

// This function allows the user to press the enter key to initiate a query.
function submitOnEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    BUTTON_SUBMIT.click();
  }
}

// This function waits for the user to click on a traffic light. This feature exists primarily to make the mobile experience more interactive.
function listenForTrafficLightClick() {
  TRAFFIC_LIGHT_ORGANIC.addEventListener("click", () => animateTrafficLight(TRAFFIC_LIGHT_ORGANIC));
  TRAFFIC_LIGHT_RECYCLING.addEventListener("click", () => animateTrafficLight(TRAFFIC_LIGHT_RECYCLING));
  TRAFFIC_LIGHT_WASTE.addEventListener("click", () => animateTrafficLight(TRAFFIC_LIGHT_WASTE));
  TRAFFIC_LIGHT_TRANSFER_STATION.addEventListener("click", () => animateTrafficLight(TRAFFIC_LIGHT_TRANSFER_STATION));
  TRAFFIC_LIGHT_SPECIALIST_RECYCLER.addEventListener("click", () => animateTrafficLight(TRAFFIC_LIGHT_SPECIALIST_RECYCLER));
}

// This function makes the clicked traffic light expand then contract, provided it is on.
function animateTrafficLight(current_traffic_light) {
  if (current_traffic_light.classList.contains("on")) {
    current_traffic_light.classList.add("traffic-light-clicked");
    setTimeout(() => current_traffic_light.classList.remove("traffic-light-clicked"), 1500);
  }
}

// This function waits for the user to click/tap on Guyala.
function listenForGuyalaClick() {
  GUYALA.addEventListener("click", () => animateGuyala());
}

// This function makes Guyala move when you click/tap on him.
function animateGuyala() {
  GUYALA.classList.add("guyala-clicked");
  setTimeout(() => GUYALA.classList.remove("guyala-clicked"), 750);
}

// This function checks the input is valid, then writes the page information.
async function respondToInput(search_term) {
  if (isValidInput(search_term)) {
    const WASTE_ITEM = await getWasteItemOrDefualt(search_term);
    setPageBody(WASTE_ITEM);
    setTrafficLights(WASTE_ITEM.disposal);
    if (is_first_query) {
      fadeInElements();
      is_first_query = false;
    }
  }    
}

// This function checks the user has typed in appropriate input.
function isValidInput(input) {
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
  const PATTERN = new RegExp("^"+item.toLowerCase()+"s?$");
  const WASTE_ITEMS = await getWasteItems();
  for (let i = 1; i < WASTE_ITEMS.length; i++) {  // For each waste item in the database...
    for (let j = 0; j < WASTE_ITEMS[i].terms.length; j++) {
      if (PATTERN.test(WASTE_ITEMS[i].terms[j])) {  // Match each recorded search term against the input
        return WASTE_ITEMS[i];
      }
    }
  }
  return WASTE_ITEMS[0];  // This is the default.
}

// This function fetches the data from "waste_items.json".
async function getWasteItems() {
  const RESPONSE = await fetch("./waste_items.json");
  return await RESPONSE.json();
}

// This function generates the page information.
function setPageBody(WASTE_ITEM) {
  if (WASTE_ITEM.name === "default") {
    setDefault();
  }
  else {
    document.getElementById("heading").innerHTML = WASTE_ITEM.name;
    document.getElementById("disposal").innerHTML = getDisposal(WASTE_ITEM.name, WASTE_ITEM.disposal, WASTE_ITEM.pluralisation);
    document.getElementById("information").innerHTML = WASTE_ITEM.information; 
  }     
}

function setDefault() {
  document.getElementById("heading").innerHTML = "No Information";
  document.getElementById("disposal").innerHTML = "The item you have searched for doesn't exist in our database of waste items.";
  document.getElementById("information").innerHTML = "Take the item to a council transfer station or specialist recycler, and they may be able to help you. "; 
}

// This function generates the disposal information based on the disposal array.
function getDisposal(name, disposal_array, pluralisation) {
  let disposal_string = ``;
  const DISPOSAL_TEMPLATES = {
    0: `${name} ${pluralisation} biodegradable, and will break down naturally over time. Dispose of ${name} in a compost or organics bin. Explore how you can <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/which-bin-do-i-put-it-in/love-food-hate-waste/compost-your-food-waste">compost food waste</a>. `,
    1: `${name} ${pluralisation} recyclable, and can be re-processed and turned into something new! Dispose of ${name} in a recycling bin. `,
    2: `${name} can be disposed of in a general waste bin. `, 
    3: `You can take ${name} to a council transfer station for re-processing, and if the material can be recovered it will be recycled and turned into a useful product! Read more about <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/facilities">waste transfer stations</a> in Cairns. `,
    4: `Some common waste items are more difficult to recycle. You can take ${name} to a specialist recycler for re-processing, and if the material can be recovered it will be recycled and turned into a useful product! Read more about <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/what-happens-to-my-waste/specialist-recycling">specialist recycling</a> in Cairns. `
  }   
  for (let i = 0; i < 5; i++) {
    if (disposal_array[i]) {
      disposal_string += DISPOSAL_TEMPLATES[i];
    }
  }
  return disposal_string;
}

// This function changes the colour of the traffic lights based on the disposal array.
function setTrafficLights(disposal_array) {
  let current_traffic_light;
  for (let i = 0; i < 5; i++) {
    current_traffic_light = document.getElementById(TRAFFIC_LIGHTS[i]);
    if (disposal_array[i]) {
      current_traffic_light.classList.remove("off");
      current_traffic_light.classList.add("on")
    }
    else {
      current_traffic_light.classList.remove("on");
      current_traffic_light.classList.add("off");
    }
  }
}

// This function makes the information fade in. The ugly implementation is due to chrome not allowing the backdrop-filter effect to be nested within divs.
function fadeInElements() {
  for (let i = 0; i < ELEMENTS_TO_FADE_IN.length; i++) {
    document.getElementById(ELEMENTS_TO_FADE_IN[i]).classList.add("fade-in");
  }
}

// These are global constants.
const BUTTON_SUBMIT = document.getElementById("submit_button");
const ELEMENTS_TO_FADE_IN = ["organic-light", "recycling-light", "waste-light", "transfer-station-light", "specialist-recycler-light", "information-container", "reminder", "acknowledgement"];
const GUYALA = document.getElementById("guyala");
const INPUT = document.getElementById("input");
const TRAFFIC_LIGHT_ORGANIC = document.getElementById("organic-light");
const TRAFFIC_LIGHT_RECYCLING = document.getElementById("recycling-light");
const TRAFFIC_LIGHT_SPECIALIST_RECYCLER = document.getElementById("specialist-recycler-light");
const TRAFFIC_LIGHT_TRANSFER_STATION = document.getElementById("transfer-station-light");
const TRAFFIC_LIGHT_WASTE = document.getElementById("waste-light");
const TRAFFIC_LIGHTS = {
  0: "organic-light",
  1: "recycling-light",
  2: "waste-light",
  3: "transfer-station-light",
  4: "specialist-recycler-light"
}

var is_first_query = true;  // This is so the fade in effect only runs the first time the user enters an item.
listenForInput();  // This makes the script run.
