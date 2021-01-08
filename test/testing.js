//var Mocha = require('mocha');

const fs = require('fs');
const assert = require('assert-js');
const _ = require('underscore');

// The following 10 tests excersize features of 
// asynchronous (promise aware) getProgramSettings({options})

const getSettings = require('../index.js').getProgramSettings;

describe('Testing getProgramSettings', function() {

  it('No Configurations Supplied', async function() {
    let theSettings = await getSettings();
    assert.objectEqual(theSettings,{},'Empty object {} expected.');
    return;
  });

  it('File Configuration Supplied', async function() {
    let expected = JSON.parse( fs.readFileSync('settings-file.json', {encoding: 'utf8'}));
    let theSettings = await getSettings({file: 'settings-file.json'});
    if (typeof theSettings != 'object') {
      throw new Error('ERROR: Bad return from: getProgramSettings()');
    }
    if (theSettings == {}) {
      throw new Error('ERROR: Empty object return from: getProgramSettings()');
    }
    assert.objectEqual(theSettings, expected, 'Settings not equal to: settings-file.json');
    return;
  });

  it('Default Configuration Supplied', async function() {
    let defSettings = {
      'default-A': 'A',
      'default-B': 'B'};
    let expected = defSettings;
    let theSettings = await getSettings({default: defSettings, file: 'settings-file.json'});
    if (typeof theSettings != 'object') {
      throw new Error('ERROR: Bad return from: getProgramSettings()');
    }
    if (theSettings == {}) {
      throw new Error('ERROR: Empty object return from: getProgramSettings()');
    }
    assert.objectEqual(theSettings, expected, 'Settings not equal to: settings-file.json');
    return;
  });

  it('Default+File Configuration Supplied', async function() {
    let defSettings = {
      'default-A': 'A',
      'default-B': 'B'};
    let expected = JSON.parse( fs.readFileSync('settings-file.json', {encoding: 'utf8'}));
    expected = _.extend(defSettings, expected);
    let theSettings = await getSettings({default: defSettings, file: 'settings-file.json'});
    if (typeof theSettings != 'object') {
      throw new Error('ERROR: Bad return from: getProgramSettings()');
    }
    if (theSettings == {}) {
      throw new Error('ERROR: Empty object return from: getProgramSettings()');
    }
    assert.objectEqual(theSettings, expected, 'Settings not equal to combined: default + settings-file.json');
    return;
  });

  it('Environment Default SETTINGS:settings-env.json Configuration Supplied', async function() {
    process.env['SETTINGS']='settings-env.json';
    let expected = JSON.parse( fs.readFileSync('settings-env.json', {encoding: 'utf8'}));
    let theSettings = await getSettings();
    if (typeof theSettings != 'object') {
      throw new Error('ERROR: Bad return from: getProgramSettings()');
    }
    if (theSettings == {}) {
      throw new Error('ERROR: Empty object return from: getProgramSettings()');
    }
    assert.objectEqual(theSettings, expected, 'Settings not equal to: settings-env.json');
    return;
  });

  it('Environment Default SETTINGS:<json-document> Configuration Supplied', async function() {
    let expected = JSON.parse( fs.readFileSync('settings-env.json', {encoding: 'utf8'}));
    process.env['SETTINGS']=JSON.stringify(expected);
    let theSettings = await getSettings();
    if (typeof theSettings != 'object') {
      throw new Error('ERROR: Bad return from: getProgramSettings()');
    }
    if (theSettings == {}) {
      throw new Error('ERROR: Empty object return from: getProgramSettings()');
    }
    assert.objectEqual(theSettings, expected, 'Settings not equal to: settings-env.json');
    return;
  });

  it('Environment NODE_SETTINGS:settings-env.json Configuration Supplied', async function() {
    process.env['NODE_SETTINGS']='settings-env.json';
    let expected = JSON.parse( fs.readFileSync('settings-env.json', {encoding: 'utf8'}));
    let theSettings = await getSettings({env: 'NODE_SETTINGS'});
    if (typeof theSettings != 'object') {
      throw new Error('ERROR: Bad return from: getProgramSettings()');
    }
    if (theSettings == {}) {
      throw new Error('ERROR: Empty object return from: getProgramSettings()');
    }
    assert.objectEqual(theSettings, expected, 'Settings not equal to: settings-env.json');
    return;
  });

  it('Environment NODE_SETTINGS:<json-document> Configuration Supplied', async function() {
    let expected = JSON.parse( fs.readFileSync('settings-env.json', {encoding: 'utf8'}));
    process.env['NODE_SETTINGS']=JSON.stringify(expected);
    let theSettings = await getSettings({env: 'NODE_SETTINGS'});
    if (typeof theSettings != 'object') {
      throw new Error('ERROR: Bad return from: getProgramSettings()');
    }
    if (theSettings == {}) {
      throw new Error('ERROR: Empty object return from: getProgramSettings()');
    }
    assert.objectEqual(theSettings, expected, 'Settings not equal to: settings-env.json');
    return;
  });

  it('Program Arg: --settings=settings-arg.json Configuration File', async function() {
    let expected = JSON.parse( fs.readFileSync('settings-arg.json', {encoding: 'utf8'}));
    process.argv.push("--node_settings=settings-arg.json");
    let theSettings = await getSettings({arg: 'node_settings'});
    if (typeof theSettings != 'object') {
      throw new Error('ERROR: Bad return from: getProgramSettings()');
    }
    if (theSettings == {}) {
      throw new Error('ERROR: Empty object return from: getProgramSettings()');
    }
    assert.objectEqual(theSettings, expected, 'Settings not equal to: settings-arg.json');
    return;
  });

  it('Program argenv: Node_Settings - Combined Configurations', async function() {
    let expected = JSON.parse( fs.readFileSync('settings-arg.json', {encoding: 'utf8'}));
    let extendenv = JSON.parse( fs.readFileSync('settings-env.json', {encoding: 'utf8'}));
    expected = _.extend(extendenv, expected);
    process.env['NODE_SETTINGS']='settings-env.json';
//    Side effect: --node_settings=settings-arg.json // from previous it: test
//    process.argv.push("--node_settings=settings-arg.json");
//    console.log('EXPECTING: ' + JSON.stringify(expected,null,2));
    let theSettings = await getSettings({argenv:'Node_Settings'});
    if (typeof theSettings != 'object') {
      throw new Error('ERROR: Bad return from: getProgramSettings()');
    }
    if (theSettings == {}) {
      throw new Error('ERROR: Empty object return from: getProgramSettings()');
    }
    assert.objectEqual(theSettings, expected, 'Settings not equal to combined: settings-env.json + settings-arg.json');
    return;
  });

});

