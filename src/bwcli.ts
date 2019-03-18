import { ScriptModel } from "bash-models/scriptModel"
import { ParameterType, IErrorMessage, ValidationOptions } from "bash-models/commonModel"
import fs from "fs"
import getStdIn from "get-stdin"
import path from "path";
import ParameterModel from "bash-models/ParameterModel";

export interface IBashCliOptions {
    inputFile: string;
    outputFile: string;
    json: boolean;
    createSample: boolean;
    parseAndCreate: boolean;
    vsCodeDebugInfo: boolean;
    outputJsonInputConfig: boolean;

    addParameters: string;
}

export class BashCli {
    private myOptions: IBashCliOptions;
    constructor(state: IBashCliOptions) {
        this.myOptions = state;
        //        console.log (JSON.stringify(this.myOptions, null, 5))
    }

    /**
     * 
     */
    public async Execute() {

        if (this.myOptions.createSample) { // -c
            const sm: ScriptModel = new ScriptModel();
            sm.addParameter(ParameterType.Create);
            sm.addParameter(ParameterType.Verify)
            sm.addParameter(ParameterType.Delete)
            sm.addParameter(ParameterType.Verbose)
            sm.addParameter(ParameterType.InputFile)
            sm.addParameter(ParameterType.Logging)
            sm.description = "sample bash script"
            sm.scriptName = "sample.sh"
            this.writeOutput(this.myOptions.outputFile, sm.toBash());
            return;
        }

        if (this.myOptions.addParameters !== "") {
            if (!fs.existsSync(this.myOptions.inputFile) && this.myOptions.inputFile !== "stdin") {
                throw `--add-parameter Error: specified file does not exist: ${this.myOptions.inputFile}`
            }
            //
            //  convert the input into a ScriptModel
            const sm: ScriptModel = await this.fromFileContents(this.myOptions.inputFile);
            this.checkForParseErrors(sm);

            //
            //  open the merge file - could be JSON or Bash            
            const merge: ScriptModel = await this.fromFileContents(this.myOptions.addParameters)
            this.checkForParseErrors(merge);
            //
            //  add the parameters to the input
            sm.parameters = sm.parameters.concat(merge.parameters);
            this.checkForParseErrors(sm);
            this.writeOutput(this.myOptions.outputFile, sm.toBash());
            return;
        }

        const sm: ScriptModel = await this.fromFileContents(this.myOptions.inputFile);
        if (this.myOptions.json) { // -j 
            this.writeOutput(this.myOptions.outputFile, sm.stringify());
        }
        if (this.myOptions.parseAndCreate) { // -p
            this.writeOutput(this.myOptions.outputFile, sm.toBash());
        }
        if (this.myOptions.vsCodeDebugInfo) { // -d        
            this.writeOutput(this.myOptions.outputFile, sm.debugConfig);
        }
        if (this.myOptions.outputJsonInputConfig) { // -k           
            this.writeOutput(this.myOptions.outputFile, sm.inputJSON)
        }
    }
    dumpLongParamaters = (model: ScriptModel) => {
        model.parameters.map((param: ParameterModel, index: number) => {
            console.log(`${index}:\t${param.longParameter}`)
        });
    }


    writeOutput = (file: string, content: string) => {
        if (file === "stdout") {
            console.log(content);
        }
        else {
            fs.writeFileSync(file, content, "utf8");
        }
    }

    readInput = (file: string): Promise<string> => {
        if (file === "stdin") {
            return new Promise<string>((resolve, reject) => {
                getStdIn().then(str => {
                    str = str.replace(/(\r?\n|\r)/gm, '\n');
                    resolve(str);
                });
            })
        }
        else {
            return this.readText(file);
        }
    }
    readText = (filePath: string): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(
                path.normalize(filePath),
                (err: NodeJS.ErrnoException, data: Buffer) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data.toString());
                }
            );
        });
    }

    fromFileContents = async (file: string): Promise<ScriptModel> => {

        const inputContents: string = await this.readInput(file);
        if (inputContents === "") {
            throw "The file is empty";
        }

        const model: ScriptModel = new ScriptModel();

        if (inputContents[0] === "#") {
            model.parseBash(inputContents);
        }
        else if (inputContents[0] === "{") {
            model.parseJSON(inputContents, "");
        }
        else {
            const err: string = `input file contents must start with a \"#\" if it is a shell script of a \"{\" if it is a JSON file.\n ${file} starts with: ${inputContents.substr(0, 300)}`;
            throw err;
        }

        return model;
    }

    checkForParseErrors = (model: ScriptModel) => {
        model.clearErrorsAndValidateParameters(ValidationOptions.ClearErrors);
        if (model.ErrorModel.Errors.length > 0) {
            model.ErrorModel.Errors.map((value: IErrorMessage, index: number) => {
                console.error(`${index}\t${value.message}`);
            })
            console.error("");
            throw "fix these errors and try again";
        }
    }
}