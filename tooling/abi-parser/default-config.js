module.exports = {
  "paths": {
    "base": "@base", // used only if asPackage: false
    "interfaces": "@interfaces",
    "abi": "@abi",
    "methods": "@methods",
    "events": "@events"
  },
  "output": {
    "interfaceDir": "",
    "classDir": "",
    "eventsDir": ""
  },
  "overwrite": {
    "interface": false,
    "class": false,
    "events": false
  },
  "asPackage": false,
}
