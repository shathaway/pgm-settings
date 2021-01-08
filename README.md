
# node.js / Module: pgmsettings

This module implements **getProgramSettings([options])** as an async function to collect and merge various JSON documents into a returned node.js object. If there is no located settings document, an empty node.js object is returned.

Source JSON documents may also include C/C++ style comments that are removed before creating configuration objects.

The **getProgramSettings({options})** is able to merge multiple JSON documents.
An optional default node.js object can allow multiple calls to merge sequences of JSON documents.

### JSON Comments - C/C++

These comments are allowed in JSON files that are consumed by the **getProgramSettings()** function.

    /* A C style comment
       that supports multiple lines.
    */
    // A C++ comment that extends to current end-of-line.

### Sources of program settings are:

1. A default node.js object
2. A document retrieved by explicit filename
3. A document referenced by a process environment variable
4. A document referenced by a program argument variable

The returned object is a merge of all specified configuration sources.

## Version 1.0.0 getProgramSettings()

The getProgramSettings() function is called without any options.

The *environment variable* **SETTINGS** is assumed.

The *program argument* **--settings=filepath** is assumed.

The collection uses the environment variable SETTINGS if it exists.
The environment variable may contain either a filepath to a JSON file or
a string representation of a JSON document.

## Version 1.1.0 getProgramSettings({options})

If the {options} is absent, then functionality of Version 1.0.0 is assumed.

### The Options:

| OPTION   | TYPE  | SEQ | DESCRIPTION  |
|--|--|--|--|
| default: | object | 1 | default node.js configuration object |
| file:    | string | 2 | A filepath to a JSON file |
| env:     | string | 3 | The environment variable name |
| arg:     | string | 4 | The program arguement name |
| argenv:  | string | 5 | Composite env/arg name |

The **default:** allows configuration setting collection to be chained. Additional settings sources have their keys added to the default collection.

The **file:** specifies a path to a JSON file.

The **env:** specifies the environment variable to be analyzed.
The value may either be a string containing a JSON filename path or the content of a JSON document.

The **arg** specifies the name of a program argument.
The value is parsed as --argname=filepath.json

The **argenv:** specifies a composite for **arg:** and **env:** but has no effect if either argument is also specified. The **arg:** is the same as **argenv.toLowerCase()**. The **env:** is the same as **argenv.toUpperCase()**.

## Usage Patterns

    const getSettings = require('pgmsettings').getProgramSettings;
    
    var theSettings;
    (async function() {
     // async-await
      theSettings = await getSettings({options});
     // or promise  
      getSettings({options}).then(settings =>{}).catch(err =>{})
    })();

## The Package

    package.json // the package definition
    index.js     // or getProgramSettings.js
    test/        // mocha.js regression tests

### Example Files
mytest.js
settings-env.json
settings-file.json
settings-json

### Mocha Tests: (npm test)

    test/testing.js		// the regression test file
    test/settings-arg.json	// configuration file for program argument testing
    test/settings-env.json	// configuration file for program environment testing
    test/settings-env.json	// configuration file for options {file: filename.json} testing


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

