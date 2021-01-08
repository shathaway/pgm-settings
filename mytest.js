'use strict';

var { getProgramSettings } = require('./index.js'); //.getProgramSettings;

(async function () {

  let options = {
    'default': {
      Default1: 'Default Value 1'
    },
    'file': 'settings-file.json'
  };

//  var theSettings = await 

  getProgramSettings().then(function (theSettings) {

  if (typeof theSettings === 'object') console.log('TEST OF PROGRAM SETTINGS = \n' +
    JSON.stringify(theSettings,null,2));

  console.log('END OF TEST');
  });
}());




