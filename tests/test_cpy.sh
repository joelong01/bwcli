#!/bin/bash
#---------- see https://github.com/joelong01/Bash-Wizard----------------
# bashWizard version 0.910
# this will make the error text stand out in red - if you are looking at these errors/warnings in the log file
# you can use cat <logFile> to see the text in color.
function echoError() {
    RED=$(tput setaf 1)
    NORMAL=$(tput sgr0)
    echo "${RED}${1}${NORMAL}"
}
function echoWarning() {
    YELLOW=$(tput setaf 3)
    NORMAL=$(tput sgr0)
    echo "${YELLOW}${1}${NORMAL}"
}
function echoInfo {
    GREEN=$(tput setaf 2)
    NORMAL=$(tput sgr0)
    echo "${GREEN}${1}${NORMAL}"
}
# make sure this version of *nix supports the right getopt
! getopt --test 2>/dev/null
if [[ ${PIPESTATUS[0]} -ne 4 ]]; then
    echoError "'getopt --test' failed in this environment. please install getopt."
    read -r -p "install getopt using brew? [y,n]" response
    if [[ $response == 'y' ]] || [[ $response == 'Y' ]]; then
        ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" < /dev/null 2> /dev/null
        brew install gnu-getopt
        #shellcheck disable=SC2016
        echo 'export PATH="/usr/local/opt/gnu-getopt/bin:$PATH"' >> ~/.bash_profile
        echoWarning "you'll need to restart the shell instance to load the new path"
    fi
   exit 1
fi
# we have a dependency on jq
    if [[ ! -x "$(command -v jq)" ]]; then
        echoError "'jq is needed to run this script. Please install jq - see https://stedolan.github.io/jq/download/"
        exit 1
    fi
function usage() {
    echoWarning "Parameters can be passed in the command line or in the input file. The command line overrides the setting in the input file."
    echo "sample bash script"
    echo ""
    echo "Usage: $0  -c|--create -v|--verify -d|--delete -e|--verbose -i|--input-file -l|--log-directory " 1>&2
    echo ""
    echo " -c | --create            Optional     calls the onCreate function in the script"
    echo " -v | --verify            Optional     calls the onVerify function in the script"
    echo " -d | --delete            Optional     calls the onDelete function in the script"
    echo " -e | --verbose           Optional     echos the parsed input variables and creates a $verbose variable to be used in user code"
    echo " -i | --input-file        Optional     the name of the input file. pay attention to $PWD when setting this"
    echo " -l | --log-directory     Optional     Directory for the log file. The log file name will be based on the script name."
    echo ""
    exit 1
}
function echoInput() {
    echo "sample.sh:"
    echo -n "    create........... "
    echoInfo "$create"
    echo -n "    verify........... "
    echoInfo "$verify"
    echo -n "    delete........... "
    echoInfo "$delete"
    echo -n "    verbose.......... "
    echoInfo "$verbose"
    echo -n "    input-file....... "
    echoInfo "$inputFile"
    echo -n "    log-directory.... "
    echoInfo "$logDirectory"

}

function parseInput() {
    
    local OPTIONS=cvdei:l:
    local LONGOPTS=create,verify,delete,verbose,input-file:,log-directory:

    # -use ! and PIPESTATUS to get exit code with errexit set
    # -temporarily store output to be able to check for errors
    # -activate quoting/enhanced mode (e.g. by writing out "--options")
    # -pass arguments only via -- "$@" to separate them correctly
    ! PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@")
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        # e.g. return value is 1
        # then getopt has complained about wrong arguments to stdout
        usage
        exit 2
    fi
    # read getopt's output this way to handle the quoting right:
    eval set -- "$PARSED"
    while true; do
        case "$1" in
        -c | --create)
            create=true
            shift 1
            ;;
        -v | --verify)
            verify=true
            shift 1
            ;;
        -d | --delete)
            delete=true
            shift 1
            ;;
        -e | --verbose)
            verbose=true
            shift 1
            ;;
        -i | --input-file)
            inputFile=$2
            shift 2
            ;;
        -l | --log-directory)
            logDirectory=$2
            shift 2
            ;;
        --)
            shift
            break
            ;;
        *)
            echoError "Invalid option $1 $2"
            exit 3
            ;;
        esac
    done
}
# input variables 
declare create=false
declare verify=false
declare delete=false
declare verbose=false
declare inputFile=
declare logDirectory="./"

parseInput "$@"

# if command line tells us to parse an input file
if [ "${inputFile}" != "" ]; then
    # load parameters from the file
    configSection=$(jq . <"${inputFile}" | jq '."sample.sh"')
    if [[ -z $configSection ]]; then
        echoError "$inputFile or sample.sh section not found "
        exit 3
    fi
    create=$(echo "${configSection}" | jq '.["create"]' --raw-output)
    verify=$(echo "${configSection}" | jq '.["verify"]' --raw-output)
    delete=$(echo "${configSection}" | jq '.["delete"]' --raw-output)
    verbose=$(echo "${configSection}" | jq '.["verbose"]' --raw-output)
    logDirectory=$(echo "${configSection}" | jq '.["log-directory"]' --raw-output)

    # we need to parse the again to see if there are any overrides to what is in the config file
    parseInput "$@"
fi

#logging support
declare LOG_FILE="${logDirectory}sample.sh.log"
{
    mkdir -p "${logDirectory}" 
    rm -f "${LOG_FILE}"
} 2>>/dev/null
#creating a tee so that we capture all the output to the log file
{
    time=$(date +"%m/%d/%y @ %r")
    echo "started: $time"
   if [[ $"verbose" == true ]];then
        echoInput
    fi

    # --- BEGIN USER CODE ---
       function onVerify() {
        echo "onVerify"
    }
    function onDelete() {
        echo "onDelete"
    }
    function onCreate() {
        echo "onCreate"
    }

    

    #
    #  this order makes it so that passing in /cvd will result in a verified resource being created
    #

    if [[ $delete == "true" ]]; then
        onDelete
    fi

    if [[ $create == "true" ]]; then
        onCreate
    fi

    if [[ $verify == "true" ]]; then
        onVerify
    fi
    # --- END USER CODE ---

    time=$(date +"%m/%d/%y @ %r")
    echo "ended: $time"
} | tee -a "${LOG_FILE}"

