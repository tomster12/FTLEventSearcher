
// Declare variables
let inputEl, outputEl;


function setup() {
  // Get elements
  inputEl = document.getElementById("searchInput");
  outputEl = document.getElementById("outputDiv");
  outputEl.tabIndex = "-1";

  // Catch keycode
  document.onkeydown = e => {
    let focused = window.getSelection().anchorNode;

    // Dont focus input on tab / shift / enter
    if (focused != inputEl &&
    (e.keyCode == 9
    || e.keyCode == 16
    || e.keyCode == 13)) {

      // - Collapse event on enter
      if (e.keyCode == 13
      && focused != null
      && focused.className == "event") toggleCollapse(focused);

    // Focus input on all other keys
    } else {

      // - Focus input
      inputEl.focus();

      // - Clear input on esc
      if (e.keyCode == 27) inputEl.value = "";
    }
  };
}


function loadEvents(check) {
  outputDiv.innerHTML = "";

  // Specified events
  let toCheck = [
    "FRIENDLY_BEACON",
    "NEBULA_SLUG_MEDBAY"];

  // For each event
  for (let evtName in parsed.events) {
    let evt = parsed.events[evtName];

    // Check all text
    let texts = [];
    let getTexts = subEvt => {
      if (subEvt.text) texts = texts.concat(evalText(subEvt.text));
      if (subEvt.choices) subEvt.choices.forEach(c => getTexts(c.event));
    }; getTexts(evt);
    let found = texts.find(t => t.toLowerCase().includes(check.toLowerCase()));

    // Load event
    if (found) {
      let eventEl = createEventElement(evt);
      outputEl.appendChild(eventEl);
    }
  }
}


function createEventElement(evt, choiceInfo=null) {
  // Handle load
  while (evt.type == "load") evt = parsed.events[evt.name];

  // Handle list
  if (evt.type == "list") {
    if (choiceInfo) {
      choiceInfo.config = choiceInfo.config || {};
      choiceInfo.config.type = "list";
    }
    let container = createEventElement({}, choiceInfo);
    for (let subEvt of evt.events) {
      let subEventEl = createEventElement(subEvt);
      container.appendChild(subEventEl);
    }
    return container;
  }

  // Create event element
  let eventEl = document.createElement("div");
  eventEl.className = "event";
  eventEl.tabIndex = "0";


  // Info for each specific choice
  if (choiceInfo != null) {

    // - Choice text
    if (choiceInfo.text) {
      let text = evalText(choiceInfo.text);
      let textEl = document.createElement("p");
      textEl.className = "choiceInfo";
      textEl.textContent = text;
      textEl.onclick = () => toggleCollapse(eventEl);
      eventEl.append(textEl);
    }

    // - Choice config - requirement
    if (choiceInfo.config) {
      if (choiceInfo.config.req) {
        let addInfoEl = document.createElement("p");
        addInfoEl.className = "choiceSubInfo";
        let text = "Required: " + choiceInfo.config.req;
        if (choiceInfo.config.lvl)
          text += " at level " + choiceInfo.config.lvl;
          if (choiceInfo.config.max_lvl)
            text += " with max level " + choiceInfo.config.max_lvl;
        addInfoEl.textContent = text;
        eventEl.append(addInfoEl);
      }

      // - Choice config - list
      if (choiceInfo.config.type == "list") {
        let addInfoEl = document.createElement("p");
        addInfoEl.className = "choiceSubInfo";
        addInfoEl.textContent = "(1 of the following)";
        eventEl.append(addInfoEl);
      }
    }
  }


  // Title of current event
  if (evt.name != null) {
    let formattedTitle = evt.name.toLowerCase().replaceAll("_", " ");
    formattedTitle = formattedTitle.charAt(0).toUpperCase() + formattedTitle.slice(1);
    let contentEl = document.createElement("p");
    contentEl.className = "title";
    contentEl.textContent = formattedTitle;
    contentEl.onclick = () => toggleCollapse(eventEl);
    eventEl.append(contentEl);
  }

  // Main text for event
  if (evt.text != null) {
    let texts = evalText(evt.text);
    for (let subText of texts) {
      let contentEl = document.createElement("p");
      contentEl.className = "content";
      contentEl.textContent = subText;
      eventEl.append(contentEl);
    }
  }


  // Item / Scrap reward for completion
  if (evt.autoReward != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Auto reward: " + JSON.stringify(evt.autoReward, null, 2);
    eventEl.append(contentEl);
  }

  // Augment reward for completion
  if (evt.augment != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Augment: " + JSON.stringify(evt.augment, null, 2);
    eventEl.append(contentEl);
  }

  // Weapon reward for completion
  if (evt.weapon != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Weapon: " + JSON.stringify(evt.weapon, null, 2);
    eventEl.append(contentEl);
  }

  // Drone reward for completion
  if (evt.drone != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Drone: " + JSON.stringify(evt.drone, null, 2);
    eventEl.append(contentEl);
  }

  // Crew member reward for completion
  if (evt.addCrew != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Crew member: " + JSON.stringify(evt.addCrew, null, 2);
    eventEl.append(contentEl);
  }

  // Reveal full map on completion
  if (evt.revealMap != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Reveal map: " + JSON.stringify(evt.revealMap, null, 2);
    eventEl.append(contentEl);
  }


  // Deal / take damage
  if (evt.damage != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Damage: " + JSON.stringify(evt.damage, null, 2);
    eventEl.append(contentEl);
  }

  // Change status of a system
  if (evt.status != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Status: " + JSON.stringify(evt.status, null, 2);
    eventEl.append(contentEl);
  }


  // Enemy ship
  if (evt.ship != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Ship: " + JSON.stringify(evt.ship, null, 2);
    eventEl.append(contentEl);
  }

  // TODO
  if (evt.remove != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Remove: " + JSON.stringify(evt.remove, null, 2);
    eventEl.append(contentEl);
  }

  // Boarders onboard
  if (evt.boarders != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Boarders: " + JSON.stringify(evt.boarders, null, 2);
    eventEl.append(contentEl);
  }

  // Slow / speed pursuit
  if (evt.modifyPursuit != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Modify Pursuit: " + JSON.stringify(evt.modifyPursuit, null, 2);
    eventEl.append(contentEl);
  }

  // Change current beacon into store
  if (evt.store != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Store: " + JSON.stringify(evt.store, null, 2);
    eventEl.append(contentEl);
  }

  // TODO
  if (evt.quest != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Quest: " + JSON.stringify(evt.quest, null, 2);
    eventEl.append(contentEl);
    let questEl = createEventElement({ type: "load", name: evt.quest.event});
    eventEl.append(questEl);
  }

  // TODO
  if (evt.itemModify != null) {
    let contentEl = document.createElement("p");
    contentEl.className = "additional";
    contentEl.textContent = "Item Modify: " + JSON.stringify(evt.itemModify, null, 2);
    eventEl.append(contentEl);
  }


  // Each choice for this event
  if (evt.choices != null) {
    for (let choice of evt.choices) {
      let choiceInfo = { config: choice.config, text: choice.text };

      // - Create element and add
      let choiceEl = createEventElement(choice.event, choiceInfo);
      eventEl.append(choiceEl);
    }
  }


  // Return output
  return eventEl;
}


function evalText(text) {
  // Load text
  if (text.type == "load") {
    if (text.name == "continue") return "continue...";
    return evalText(parsed.texts[text.name]);

  // Single text
  } else if (text.type == "single") {
    return [text.text];

  // List text
  } else if (text.type == "list") {
    let texts = [];
    text.texts.forEach(t => texts = texts.concat(evalText(t)));
    return texts;
  }
}


function formSubmit(e) {
  // Submit input form
  e.preventDefault();
  loadEvents(inputEl.value);
}


function toggleCollapse(e) {
  // Toggle collapse
  e.collapsed = e.collapsed == null ? false : !e.collapsed;


  // Uncollapse
  if (e.collapsed) {

    // For each child
    for (let child of e.childNodes) {

      // - Allow to be tabbable
      if (child.className == "event") {
        child.style.display = "block";

      // - Unshorten text
      } else if (child.className == "content") {
        child.textContent = child.fullTextContent;
      }
    }

    // Unlimit height
    e.style.height = "auto";
    e.style.overflow = "auto";


  // Collapse
  } else {

    // Get height of visible children
    let currentHeight = 0;
    for (let child of e.childNodes) {

      // - Allow titles / choice infos
      if (child.className == "title"
      || child.className == "choiceInfo"
      || child.className == "choiceSubInfo") {
        currentHeight += child.offsetHeight;

      // - Allow text but shorten
      } else if (child.className == "content") {
        child.fullTextContent = child.textContent;
        let shortened = child.textContent.substring(0, 60) + "...";
        child.textContent = shortened;
        currentHeight += child.offsetHeight;

      // - Dont allow events and make untabbable
      } else if (child.className == "event") {
        console.log("Hiding child");
        child.style.display = "none";
      }
    }

    // - Limit height
    e.style.height = currentHeight + "px";
    e.style.overflow = "hidden";
  }
}


// Call main
setup();