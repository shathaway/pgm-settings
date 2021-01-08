
# node.js / Module: pgm-settings

This is a node module to retrieve program settings from various json document sources. The source objects are merged into a single node object. Any node object can be used as a set of default parameters, thus allowing setting collections to be chained.

The source json documents may contain C/C++ style comments that are removed before parsing.

The **getProgramSettings({options})** is an async function that can also return a node promise.

## Configuration Sources

* default settings object
* specified json file
* program environment variable
* program startup argument

## Usage

    const getProgramSettings = require('pgm-settings').getProgramSettings

    var theSettings = await getProgramSettings({options})

### The Options:

Option = name of option
Type = typeof option
Seq = processing sequence
Description = purpose of option

| OPTION   | TYPE  | SEQ | DESCRIPTION  |
|--|--|--|--|
| default: | object | 1 | default configuration object |
| file:    | string | 2 | A filepath to a json file |
| env:     | string | 3 | The environment variable name |
| arg:     | string | 4 | The program arguement name |
| argenv:  | string | 5 | Composite env/arg name |

If the {options} is empty, then the following is assumed:

    env: 'SETTINGS'       env.SETTINGS can be a filepath or json document
    arg: 'settings'       parsed as --settings=filepath

The argenv: argument is ignored if either env: or arg: are specified.

    env = argenv.toUpperCase()
    arg = argenv.toLowerCase()

### JSON Comments - C/C++

Source json files may have C/C++ style comments. The comments are removed before the json document is parsed.

    /* A C style comment
       that supports multiple lines.
    */
    // A C++ comment that extends to current end-of-line.

### Example Files - for your own tests
mytest.js

settings-env.json

settings-file.json

settings.json

### Mocha Test Suite: (npm test)

    test/testing.js		// the regression test file
    test/settings-arg.json	// configuration file for program argument testing
    test/settings-env.json	// configuration file for program environment testing
    test/settings-file.json	// configuration file for options {file: filename.json} testing

    Testing getProgramSettings
        ✓ No Configurations Supplied
            getProgramSettings()
        ✓ File Configuration Supplied
            getProgramSettings({file:'settings-file.json'})
        ✓ Default Configuration Supplied
            getProgramSettings({default:{object}})
        ✓ Default+File Configuration Supplied
            getProgramSettings({default:{object},file:'settings-file.json'})
        ✓ Environment Default SETTINGS:settings-env.json Configuration Supplied
            process.env[SETTINGS]='settings-env.json';
            getProgramSettings();
        ✓ Environment Default SETTINGS:<json-document> Configuration Supplied
            process.env[SETTINGS]='{a json document}';
            getProgramSettings();
        ✓ Environment NODE_SETTINGS:settings-env.json Configuration Supplied
            process.env[NODE_SETTINGS]='settings-env.json';
            getProgramSettings({env:'NODE_SETTINGS'})
        ✓ Environment NODE_SETTINGS:<json-document> Configuration Supplied
            process.env[NODE_SETTINGS]='{a json document}';
            getProgramSettings({env:'NODE_SETTINGS'})
        ✓ Program Arg: --settings=settings-arg.json Configuration File
            process.argv.push('--node_settings=settings-arg.json');
            getProgramSettings({arg:'node_settings'})
        ✓ Program argenv: Node_Settings - Combined Configurations
            getProgramSettings({argenv:'Node_Settings'})
            // implies env:'NODE_SETTINGS' and arg:'node_settings'

