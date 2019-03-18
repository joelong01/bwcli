"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_line_args_1 = __importDefault(require("command-line-args"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const sections = [
    {
        header: "bwcli",
        content: "A Command Line Interface for creating and manipulating Bash Files"
    },
    {
        header: "Options",
        optionList: [
            {
                name: "create-sample",
                alias: "c",
                typeLabel: Boolean,
                description: "Creates a sample bash script"
            },
            {
                name: "input-file",
                alias: "i",
                typeLabel: "File",
                description: "Represents the input bash or JSON file.  if not specified, STDIN is assumed"
            },
            {
                name: "output-file",
                alias: "o",
                typeLabel: "File",
                description: "Represents the output bash or JSON file.  If not specified, STDOUT is assumed"
            },
            {
                name: "parse-and-create",
                alias: "p",
                typeLabel: Boolean,
                description: "Parses the input file and creates a bash file specified --output-file (-o)"
            },
            {
                name: "vs-code-debug-info",
                alias: "d",
                typeLabel: Boolean,
                description: "Outputs the JSON config needed for the VS Code Bash Debug extension"
            },
            {
                name: "add-parameters",
                alias: "a",
                typeLabel: Boolean,
                description: "takes a JSON file as input (stdin or -i) and merges the parameters from the -a file outputting a new bash script to stdout or -o.  example: curl http://somescript-from-web.sh  | bw --json common.json | bw --json specific.json --add-parameters > output.sh"
            },
            {
                name: "json",
                alias: "j",
                typeLabel: Boolean,
                description: "Outputs the JSON file given the bash file.  e.g. \"cat foo.sh | bw -j\", \" cat foo.sh | bw -j > foo.json\", or \"cat foo.sh | bw -j -o foo.json\""
            },
            {
                name: "output-json-input-config",
                alias: "k",
                typeLabel: Boolean,
                description: "outputs the json file that has all of the input variables to set"
            },
            {
                name: "help",
                alias: "h",
                typeLabel: Boolean,
                description: "Prints the help"
            }
        ]
    }
];
const inputParameters = [
    { type: Boolean, alias: "c", name: "create-sample" },
    { type: String, alias: "-i", name: "--input-file" },
    { type: String, alias: "-o", name: "--output-file" },
    { type: Boolean, alias: "-p", name: "--parse-and-create" },
    { type: Boolean, alias: "-d", name: "--vs-code-debug-info" },
    { type: Boolean, alias: "-a", name: "--add-parameters" },
    { type: Boolean, alias: "-j", name: "--json" },
    { type: Boolean, alias: "-k", name: "--output-json-input-config" },
    { type: Boolean, alias: "-h", name: "--help" }
];
const usage = command_line_usage_1.default(sections);
console.log(usage);
const options = command_line_args_1.default(inputParameters);
//# sourceMappingURL=main.js.map