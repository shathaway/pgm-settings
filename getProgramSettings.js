// MODULE - Get Program Settings - merge of json documents
//
// Called as an async function:
//   rtnObject = await getProgramSettings({options});
//
// Called returning a promise:
//   getProgramSettings({options}).then(theSettings, error)
//
// OPTIONS
//   default: object    This is a template of default setting property values.
//   file: string       This is the name of a json filepath to open and parse
//   env: string        This is the name of an environment variable
//                      containing either a json filepath 
//                      or the content of a json document
//   arg: string        This is the name of a program argument variable
//                      containing a json filepath
//   argenv: string     env[argenv.toUpperCase()] and arg[argenv.toLowerCase)] are assumed.
//
// If no options are given, then env['SETTINGS'] and arg['settings'] are assumed.
//
// Preparing a program environment with BASH
//
//   SETTINGS=filepath.json
// or 
//   SETTINGS=`cat filepath.json`
//
//   export SETTINGS
//
// Calling a node project with a settings argument
//
//   node nodefile.js --settings=filepath.json
// 
// The underscore library is used to merge the various program settings objects.
//

'use strict';

const Promise = require('promise');
const fs = require('fs');
const _ = require('underscore');
const stripComments = require('strip-json-comments');
const minimist = require('minimist')


//--------------------------------------------
// INITIAL Processing State Variables

var args; // cached program arguments

var doSettings = false;
var doFileSettings = false;
var doEnvSettings = false;
var doArgSettings = false;

var parseFileName = '';
var parseEnvName = 'SETTINGS';  // default for Version 1.0.0
var parseArgName = 'settings';  // default for Version 1.0.0

//---------------------------------------------
// Defer closing an open file descriptor.

var deferCloseFd = null;

async function deferClose(){
  if (deferCloseFd){
    await fs.close(deferCloseFd,(err)=>{});
    deferCloseFd = null;
  }
}

//-------------------------------------------
// Function fnDoFileSettings()
// Input = global parseFileName string
// Output is a parsed json file object.
//-------------------------------------------

async function fnDoFileSettings() {
// MYDEBUG('fnDoFileSettings()');
// console.log(JSON.stringify(
//   { doFileSettings: doFileSettings,
//     parseFileName: parseFileName
//   },null,2)
// );

  var tmpJson = {};
// Promise Wrapper
  return new Promise(async function(resolve,reject) {
    if (! doFileSettings) {
      resolve( {} );
    } else {
      try {
        await fs.open(parseFileName,'r',async function (err,fd) {
          deferCloseFd = fd;     // save file handle for defer closing
          if (err) {
            // SHOW ERROR
            console.error('ERROR: fnDoFileSettings() unable to open: %s', parseFileName);
            console.error(err);
            // BUT RESOLVE AS NOTHING TO PARSE
            resolve( {} ) // unable to open 'parseFileName - assuming {} return.
          } else {
            try {
              await fs.readFile(fd,'utf8',async function (err,data) {
                // file descriiptor 'fd' is not automatically closed - ensure it is closed.
                // we already have an err or data content.
                deferClose();
                if (err) {
                  console.error('ERROR, unable to read file: ' + parseFileName + ' as a json document.');
                  resolve( {} ); // nothing parsed
                } else {
                  try {
                    tmpJson = await JSON.parse(stripComments(data));
                    if (typeof tmpJson === 'object') resolve( tmpJson );
                    resolve( {} ); // nothing for json to parse
                  }
                  catch(jError) {
                    console.error('ERROR, unable to parse file: ' + parseFileName + ' as json document.');
                    resolve( {} );
                  }
                }
              }); // end of readFile callback
            }
            catch(err) {
              deferClose();
              resolve( {} ); // nothing parsed.
            }
          }
        });
      }
      catch(err) {
         deferClose();
         resolve( {} );
      }
    }
  // code does not get here - promise is already fulfilled
  }); // end of promise wrapper
}

//-------------------------------------------
// Function fnDoEnvSettings()
// Input = environment variable SETTINGS
// Output = configuration object
// If .env.SETTINGS = filepath to json file
//   Output = constructed from the json file content
// If .env.SETTINGS != filepath
//   Output = constructed from env.SETTINGS as a json document

async function fnDoEnvSettings(){
// MYDEBUG('fnDoEnvSettings()');
// console.log(JSON.stringify(
// {doEnvSettings: doEnvSettings,
//  parseEnvName: parseEnvName
// }
// ,null,2));

  var tmpJson = {};
// Promise Wrapper
  return new Promise(async function(resolve,reject) {
    if (! doEnvSettings) {
      resolve( {} );
    } else {
      try {
        await fs.open(process.env[parseEnvName],'r',async function (err,fd) {
          deferCloseFd = fd;
          if (err) {
            deferClose();
            // parse the environment variable string as a json document - not a filepath
            tmpJson = await JSON.parse(stripComments(process.env[parseEnvName]));
            if (typeof tmpJson === 'object') resolve(tmpJson);
            resolve( {} ); // nothing parsed
          } else {
            try {
              await fs.readFile(fd,'utf8',async function (err,data) {
                // file descriiptor 'fd' is not automatically closed - ensure it is closed.
                // we already have an err or data content.
                deferClose();
                if (err) {
                  console.error('ERROR: fnDoEnvSettings - unable to read file: ', err);
                  // FILE DESCRIPTOR fd WAS PROBABLY CLOSED BEFORE fs.readFile()
                  resolve( {} ); // nothing parsed - a filename is not a json document.
                } else {
                  try {
                    tmpJson = await JSON.parse(stripComments(data));
                    if (typeof tmpJson === 'object') resolve( tmpJson );
                    resolve( {} );
                  }
                  catch(jError) {
                    // NOTE: fs.readFile return buffer(data) should be utf8 encoding.
                    console.error('ERROR: unable to parse ' + process.env[parseEnvName] + ' file as json document.');
                    console.error('ERROR json parse: ', jerror);
                    resolve( {} );    // nothing parsed
                  }
                }
              });
            }
            catch (err) {
              deferClose();
              console.error('ERROR: fnDoEnvSettings fs.fileRead(): ', err);
              resolve( {} );  // json not parsed - fd closed before fs.readFile(fd...)
            }
          }
        });
      }
      catch(err) {
         deferClose();
         resolve( {} );
      }
    }
  }); // end of promise wrapper
}


//-------------------------------------------
// Function fnDoArgSettings()
// Input = program argument --settings=filepath
// Output = configuration object
// If --settings is a filepath to json file
//   Output = constructed from the json file content
// If --settings is a json document
//   Output = constructed from env.SETTINGS as a json document


async function fnDoArgSettings(){
// MYDEBUG('fnDoArgSettings()');
// console.log(JSON.stringify(
// {doArgSettings: doArgSettings,
//  parseArgName: parseArgName,
//  argFilename: args[parseArgName]
// }
// ,null,2));

  var tmpJson = {};
// Promise Wrapper
  return new Promise(async function(resolve,reject) {
    if (! doArgSettings) {
      resolve( {} );
    } else {
      try {
        await fs.open(args[parseArgName],'r',async function (err,fd) {
          if (err) {
            resolve( {} );
          } else {
            deferCloseFd = fd;
            try {
              await fs.readFile(fd,'utf8',async function (jerr,data) {
                // file descriiptor 'fd' is not automatically closed - ensure it is closed.
                // we already have an err or data content.
                // Closing the fd within callback -- OK to close here.
                deferClose();
                if (jerr) {
                  console.error('ERROR: readFile returns error: ', jerr);
                  resolve( {} ); // nothing parsed
                } else {
                  try {
                    tmpJson = await JSON.parse(stripComments(data));
                    if (typeof tmpJson === 'object') resolve( tmpJson );
                    resolve( {} );
                  }
                  catch(jError) {
                    console.error('ERROR: unable to parse env.SETTINGS file as json document.');
                    console.error('ERROR: ' + jError);
                    resolve( {} );  // nothing parsed
                  }
                }
              });
            }
            catch(err) {
              deferClose();
              console.error('ERROR: ' + err);
              resolve( {} );  // nothing parsed
            }
          }
        });
      }
      catch(err) {
        deferClose();
        resolve( {} );
      }
    }
  }); // end of promise wrapper.
}

//-------------------------------------------
// Function fnDoSettings(defaultSettings)
//  calls fnDoFileSettings()
//  calls fnDoEnvSettings()
//  calls fnDoArgSettings()
// Output = merge of settings objects.

async function fnDoSettings(defaultSettings){
  var rtnSettings = defaultSettings || {};
  if ( doSettings ) {
    let firstSettings = await fnDoFileSettings();
    await deferClose();
    let secondSettings = await fnDoEnvSettings();
    await deferClose();
    let thirdSettings = await fnDoArgSettings();
    await deferClose();
    rtnSettings = _.extend(rtnSettings,firstSettings);
    rtnSettings = _.extend(rtnSettings,secondSettings);
    rtnSettings = _.extend(rtnSettings,thirdSettings);
    return rtnSettings;
  } else {
    return rtnSettings;
  }
}

// getProgramSettings(options) -- main function for this module
//
//   options.default: object / default settings object
//   options.file: string / json filepath
//   options.env: string / environment variable name (default = SETTINGS)
//   options.arg: string / program argument name (default = settings)
//   options.argenv: string / env = argenv.toUpperCase, arg = argenv.toLowerCase
//
// Supplemental Objects
//   defaultSettings = options.default or {}
//   fileSettings = open options.file and parse as a json document.
//   envSettings = open (env[options.env]) and parse as a json document ||
//                 json parse (env[options.env])
//   argSettings = open (arg[options.arg]) and parse as a json document
//
// Return the composite settings object
//

async function getProgramSettings(options){
  // Set Module Defaults

  let rtnVal = {};

  parseFileName = '';
  parseEnvName = 'SETTINGS';  // default for Version 1.0.0
  parseArgName = 'settings';  // default for Version 1.0.0

  doSettings = false;
  doFileSettings = false;
  doEnvSettings = false;
  doArgSettings = false;

  return new Promise( async function(resolve,reject) {
    try {
      if (typeof options === 'object'){ // new for Version 2.0.0
        parseFileName='';
        parseEnvName='';
        parseArgName='';
        rtnVal = options['default'] ? options['default'] : {};
        if (options.argenv && typeof options.argenv === 'string' 
            && options.argenv.length > 0
            && typeof options.arg === 'undefined' 
            && typeof options.env === 'undefined'){
          parseEnvName = options.argenv.toUpperCase();
          parseArgName = options.argenv.toLowerCase()
        }
        if (typeof options.env === 'string' && options.env.length > 0){
          parseEnvName = options.env;
        }
        if (typeof options.arg === 'string' && options.arg.length > 0){
          parseArgName = options.arg;
        }
        if (typeof options.file === 'string' && options.file.length > 0){
          parseFileName = options.file;
        }
      }
      // Determine what we need to process.
    
      args = await minimist(process.argv.slice(2));
      doFileSettings = (typeof parseFileName === 'string' && parseFileName.length > 0);
      doEnvSettings = (typeof process.env[parseEnvName] === 'string' && process.env[parseEnvName].length > 0);
      doArgSettings = (typeof args === 'object' && typeof args[parseArgName] === 'string' && args[parseArgName].length > 0);
      doSettings = (doFileSettings || doEnvSettings || doArgSettings);
    
      rtnVal = await fnDoSettings(rtnVal); // seeded with default settings.
      await deferClose();
      resolve(rtnVal);
    }
    catch(er) {
      reject (er);
    }
  });
}

module.exports.getProgramSettings = getProgramSettings;

module.exports = async function (options) {
 if (typeof options === 'object')
   return await getProgramSettings(options);
 else
   return await getProgramSettings();
}


