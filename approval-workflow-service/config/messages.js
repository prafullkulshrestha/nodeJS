let apimessages;
try {
    apimessages = require("../setup/apimessages.project.config.js");
} catch(e){
    console.log("Unable to load apimessages.project.config.js");
    apimessages = require("../setup/apimessages.config.js");
} finally {
    if(Object.keys(apimessages).length === 0){
        apimessages = require("../setup/apimessages.config.js");
    }
}
module.exports = apimessages;
