
// https://www.ftlwiki.com/wiki/Events_file_structure


// Import modules
const xml2js = require("xml2js");
const fs = require("fs");
const util = require("util");


function readXML(filename) {
  return new Promise((res, rej) => {

    // Read XML file
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) rej(err);

      // Parse XML to js
      xml2js.parseString(data, (err, js) => {
        if (err) rej(err);

        // Return value
        res(js);
      });
    });
  })
}


function getFileNames(dir, check) {
  return new Promise((res, rej) => {

    // Get all filenames
    fs.readdir(dir, (err, files) => {
      if (err) rej(err);

      // Return those that match
      res(files.filter(check));
    });
  });
}


async function main() {
  // Setup variables
  let parsed = { texts: [], events: [] };
  let count = [0, 0];

  // Parse texts
  let parseText = txt => {

    // - String
    if (typeof(txt) === "string") {
      count[0] += 1;
      return {
        type: "single",
        text: txt };

    // - Text no name
    } else if (!txt.$) {
      count[0] += 1;
      return {
        type: "single",
        text: txt._ };

    // - Text with name
    } else if (txt.$.name) {
      count[0] += 1;
      return {
        type: "single",
        name: txt.$.name,
        text: txt._ };

    //  - Load with id / load
    } else if (txt.$.id || txt.$.load) {
      return {
        type: "load",
        name: txt.$.id || txt.$.load };
    }
  };

  // Parse text lists
  let parseTextList = list => {

    // - List of texts
    return {
      type: "list",
      name: list.$.name,
      texts: list.text ? list.text.map(parseText) : []
    };
  };

  // Parse event
  let parseEvent = evt => {

    // - Load event
    if (evt.$ && evt.$.load) return {
      type: "load",
      name: evt.$.load
    }

    // - Get various attributes
    count[1] += 1;
    let res = { type: "single" };
    if (evt.text) res.text = parseText(evt.text[0]);
    if (evt.$ && evt.$.name) res.name = evt.$.name;
    if (evt.augment) res.augment = evt.augment[0].$.name;
    if (evt.weapon) res.weapon = evt.weapon[0].$.name;
    if (evt.drone) res.drone = evt.drone[0].$.name;
    if (evt.crewMember) res.addCrew = evt.crewMember[0].$;
    if (evt.damage) res.damage = evt.damage.map(d => d.$);
    if (evt.autoReward) res.autoReward = {
      reward: evt.autoReward[0]._,
      level: evt.autoReward[0].$.level };
    if (evt.status) res.status = evt.status[0].$;
    if (evt.store) res.store = true;
    if (evt.quest) res.quest = evt.quest[0].$;
    if (evt.reveal_map) res.revealMap = true;
    if (evt.unlockShip) res.unlockShip = evt.unlockShip[0].$;
    if (evt.ship) res.ship = evt.ship[0].$;
    if (evt.removeCrew) res.removeCrew = {
      clone: !!evt.removeCrew[0].clone[0],
      text: parseText(evt.removeCrew[0].text[0]) };
    if (evt.remove) res.remove = evt.remove[0].$;
    if (evt.boarders) res.boarders = evt.boarders[0].$;
    if (evt.modifyPursuit) res.modifyPursuit = evt.modifyPursuit[0].$;
    if (evt.item_modify) res.itemModify = {
      steal: (evt.item_modify[0].$ != null && evt.item_modify[0].$.steal),
      items: evt.item_modify[0].item.map(i => i.$) };

    // - Get choices
    if (evt.choice) {
      res.choices = evt.choice.map(c => {
        let res = {};
        if (c.$) res.config = c.$;
        if (c.text) res.text = parseText(c.text[0]);
        if (c.event) res.event = parseEvent(c.event[0]);
        return res;
      });
    }

    // - Return result
    return res;
  };

  // Parse event list
  let parseEventList = list => {

    // - List of events
    return {
      type: "list",
      name: list.$.name,
      events: list.event ? list.event.map(parseEvent) : []
    };
  };


  // Get single text
  let textData = await readXML("data/text_events.xml");
  for (let txt of textData.FTL.text) {
    let name = txt.$.name;
    parsed.texts[name] = parseText(txt);
  }

  // For each event file
  let fileNames = await getFileNames("data", name => name.toLowerCase().includes("events") && name != "text_events.xml");
  for (let file of fileNames) {
    let eventData = await readXML("data/" + file);

    // Load text lists
    if (eventData.FTL.textList) {
      for (let list of eventData.FTL.textList) {
        let name = list.$.name;
        parsed.texts[name] = parseTextList(list);
      }
    }

    // Load single events
    if (eventData.FTL.event) {
      for (let evt of eventData.FTL.event) {
        let name = evt.$.name;
        parsed.events[name] = parseEvent(evt);
      }
    }

    // Load event lists
    if (eventData.FTL.eventList) {
      for (let list of eventData.FTL.eventList) {
        let name = list.$.name;
        parsed.events[name] = parseEventList(list);
      }
    }
  }

  // Save to json and print
  let parsedData = util.inspect(parsed, false, null);
  parsedData = "let parsed = " + parsedData;
  parsedData = parsedData.replace("{\n  texts: [", "{\n  texts: {");
  parsedData = parsedData.replace("],\n  events: [", "},\n  events: {");
  parsedData = parsedData.replace("]\n}", "}\n}");
  let filename = "../parsed.js";
  fs.writeFile(filename, parsedData, err => {
    if (err) throw err;
    console.log("File saved to " + filename);
    console.log(count[0] + " text / text lists");
    console.log(count[1] + " event / event lists");
  });
}


// Call main
main();