#!/usr/bin/env node

import program from "commander";
import { BashCli, IBashCliOptions } from "./bwcli"
program
    .version('0.1.0')
    .option('-c|--create-sample [value]', "Creates a sample bash script", false)
    .option('-i|--input-file [file]', 'Represents the input bash or JSON file.  if not specified, STDIN is assumed', "stdin")
    .option('-o|--output-file [file]', 'Represents the output bash or JSON file.  If not specified, STDOUT is assumed', "stdout")
    .option('-p|--parse-and-create [value]', 'Parses the input file and creates a bash file specified --output-file (-o)', false)
    .option('-d|--vs-code-debug-info [value]', "Outputs the JSON config needed for the VS Code Bash Debug extension", false)
    .option('-a|--add-parameters [file]', 'takes a JSON file as input (stdin or -i) and merges the parameters from the -a file outputting a new bash script to stdout or -o.  example: curl http://somescript-from-web.sh  | bw --json common.json | bw --json specific.json --add-parameters > output.sh', "")
    .option('-j|--json [value]', 'Outputs the JSON file given the bash file.  e.g. \"cat foo.sh | bw -j\", \" cat foo.sh | bw -j > foo.json\", or \"cat foo.sh | bw -j -o foo.json\"', false)
    .option('-k|--output-json-input-config [value]', 'outputs the json file that has all of the input variables to set', false)

    .parse(process.argv);



const options: IBashCliOptions = {
    inputFile: program.inputFile,
    outputFile: program.outputFile,
    addParameters: program.addParameters,
    vsCodeDebugInfo: program.vsCodeDebugInfo,
    createSample: program.createSample,
    json: program.json,
    parseAndCreate: program.parseAndCreate,
    outputJsonInputConfig: program.outputJsonInputConfig
}
//console.log ("options:" + JSON.stringify(options));
const cli = new BashCli(options);
try {
    cli.Execute().catch( (reason) => {
        console.error(reason);    
    });
}
catch (err) {
    console.error(err);
}
