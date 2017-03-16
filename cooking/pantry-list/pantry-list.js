const fs = require("fs");
const argv = require("yargs").argv;

let list = JSON.parse(fs.readFileSync("pantry-list.json", "utf8"));

Object.prototype.addItem = function(category, item) {
  let itemExisted = false;
  for (prop in this) {
    if (typeof this[prop] !== "function") {
      if (this[prop].indexOf(item) > -1) {
        console.log(item + " has already existed in " + prop);
        itemExisted = true;
        break;
      };
    };
  };
  if (!itemExisted) {
    if(!this[category]) {
      this[category] = [];
    };
    this[category].push(item);
    console.log(item + " added to " + category);
  };
};

list.addItem(argv.c, argv.i);
fs.writeFileSync("pantry-list.json", JSON.stringify(list));
