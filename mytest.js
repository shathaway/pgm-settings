'use strict';

var getSettings = require('./index.js'); //.getProgramSettings;
//const getSettings = xindex.getProgramSettings;

(async function () {

  let options = {
    'default': {
      'Default1': 'Default Value 1'
    },
    'file': 'settings-file.json',
    'argenv': 'SETTINGS'
  };

//  var theSettings = await 

  getSettings(options).then(function (theSettings) {

  if (typeof theSettings === 'object') console.log('TEST OF PROGRAM SETTINGS = \n' +
    JSON.stringify(theSettings,null,2));

  console.log('END OF TEST');
  });
}());




