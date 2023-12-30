// This is where the script starts. Inputs are seperated into different types.
function listenForInput() {
  listenForSearch();
  listenForTrafficLightClick();
  listenForGuyalaClick();
}

// This function waits for the user to click the search button or press the enter key, then initiates the query.
function listenForSearch() {
  BUTTON_SUBMIT.addEventListener("click", () => respondToSearch(INPUT.value));
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
function animateTrafficLight(traffic_light) {
  if (traffic_light.classList.contains("on")) {
    traffic_light.classList.add("traffic-light-clicked");
    setTimeout(() => traffic_light.classList.remove("traffic-light-clicked"), 750);
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
async function respondToSearch(input) {
  if (isValidWasteItem(input)) {
    const WASTE_ITEM = await getWasteItemOrDefualt(input);
    setTrafficLights(WASTE_ITEM);
    setPageBody(WASTE_ITEM);
    if (is_first_query) {
      fadeInElements();
      is_first_query = false;
    }
  }    
}

// This function checks the user has typed in appropriate input.
function isValidWasteItem(input) {
  if (input.length < 1) {
    alert("Please type in a waste item 🙃");
    document.getElementById("form").reset();
    return false;
  }
  else if (input.length > 50) {
    alert("Maximum search term length is 50 characters 🙃");
    document.getElementById("form").reset();
    return false;
  }
  else {
    return true;
  }   
}

// This function returns the waste item information, or the default if the item isn't in the data.
async function getWasteItemOrDefualt(input) {
  const WASTE_ITEMS = await getWasteItems();
  const PATTERN = new RegExp(`^${input.trim().toLowerCase()}s?$`);  // ^ = must start with, ${input...} = input, s? = one optional s, $ means must end.
  for (let i = 1; i < WASTE_ITEMS.length; i++) {  // For each waste item in the database...
    for (let j = 0; j < WASTE_ITEMS[i].terms.length; j++) {
      if (PATTERN.test(WASTE_ITEMS[i].terms[j])) {  // Match each recorded search term against the input.
        return WASTE_ITEMS[i];
      }
    }
  }
  return WASTE_ITEMS[0];  // This is the default if there is no match.
}

// This function fetches the data from "waste_items.json".
async function getWasteItems() {
  const RESPONSE = await fetch("./waste_items.json");
  return await RESPONSE.json();
}

// This function changes the colour of the traffic lights based on the disposal array.
function setTrafficLights(waste_item) {
  let traffic_light;
  for (let i = 0; i < 5; i++) {
    traffic_light = document.getElementById(TRAFFIC_LIGHTS[i]);  // Traffic lights are defined at the bottom of the page.
    if (waste_item.disposal[i]) {
      traffic_light.classList.remove("off");
      traffic_light.classList.add("on")
    }
    else {
      traffic_light.classList.remove("on");
      traffic_light.classList.add("off");
    }
  }
}

// This function generates the page information.
function setPageBody(waste_item) {
  if (waste_item.name === "default") {
    document.getElementById("heading").innerHTML = "No Information";
    document.getElementById("disposal").innerHTML = "The item you have searched for doesn't exist in our database of waste items. Take the item to a council transfer station or specialist recycler, and they may be able to help you.";
    document.getElementById("information").innerHTML = ""; 
  }
  else {
    document.getElementById("heading").innerHTML = waste_item.name;
    document.getElementById("disposal").innerHTML = getDisposal(waste_item);
    document.getElementById("information").innerHTML = waste_item.information + (waste_item.information.length > 0 ? "<br><br>" : "");
  }     
}

// This function generates the disposal information based on the disposal array.
function getDisposal(waste_item) {
  let disposal_string = ``;
  const DISPOSAL_TEMPLATES = {
    0: `${waste_item.name} ${waste_item.pluralisation} biodegradable, and will break down naturally over time. Dispose of ${waste_item.name} in a compost or organics bin. Explore how you can <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/which-bin-do-i-put-it-in/love-food-hate-waste/compost-your-food-waste">compost food waste</a>. `,
    1: `${waste_item.name} ${waste_item.pluralisation} recyclable, and can be re-processed and turned into something new! Dispose of ${waste_item.name} in a recycling bin. `,
    2: `${waste_item.name} can be disposed of in a general waste bin. `, 
    3: `You can take ${waste_item.name} to a council transfer station for re-processing, and if the material can be recovered it will be recycled and turned into a useful product! Read more about <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/facilities">waste transfer stations</a> in Cairns. `,
    4: `Some common waste items are more difficult to recycle. You can take ${waste_item.name} to a specialist recycler for re-processing, and if the material can be recovered it will be recycled and turned into a useful product! Read more about <a href="https://www.cairns.qld.gov.au/water-waste-roads/waste-and-recycling/what-happens-to-my-waste/specialist-recycling">specialist recycling</a> in Cairns. `
  }   
  for (let i = 0; i < 5; i++) {
    if (waste_item.disposal[i]) {  // Disposal is an array of booleans.
      disposal_string += DISPOSAL_TEMPLATES[i];
    }
  }
  return disposal_string;
}

// This function makes specified page elements fade in.
function fadeInElements() {
  for (let i = 0; i < ELEMENTS_TO_FADE_IN.length; i++) {
    document.getElementById(ELEMENTS_TO_FADE_IN[i]).classList.add("fade-in");
  }
}

// These are global constants.
const BUTTON_SUBMIT = document.getElementById("submit_button");
const ELEMENTS_TO_FADE_IN = ["organic-light", "recycling-light", "waste-light", "transfer-station-light", "specialist-recycler-light", "information-container", "reminder", "acknowledgement", "about"];
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

let is_first_query = true;  // This is so the fade in effect only runs the first time the user enters an item.
listenForInput();  // This makes the script run.
