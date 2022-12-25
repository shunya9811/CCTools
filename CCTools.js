// showAvailableLocales: 
// 引数は受け取らず、変換するための利用可能なロケールのリストを表示します。

// showDenominations [locale]: 
// 利用可能なロケールのリストから1つの要素を引数として受け取り、
// そのロケールでサポートされているデノミテーション（通貨の単位）のリストを表示します。

// convert [sourceDenomination][sourceAmount][destinationDenomination]: 
// 変換前の通貨の単位、通貨量、変換先の通貨の単位の3つの引数を受け取り、通貨を変換し、
// 入力と出力の値、通貨単位を表示します。sourceAmountは数値に変換される必要があります。

const source = {
    "Japan": {"Yen": 1},
    "India": {"Rupee": 1.4442, "Paisa": 0.014442},
    "USA": {"Dollar": 106.10, "USCent": 1.0610},
    "Europe": {"Euro": 125.56, "EuroCent": 1.2556},
    "UAE": {"Dirham": 28.89, "Fils": 0.2889}
};

const locales = Object.keys(source);
const rates = {};
const denominations = [];

locales.forEach(locale => {
    Object.assign(rates, source[locale]);
    Object.keys(source[locale]).forEach(item => {
        denominations.push(item);
    });
});

let CLIOutputDiv = document.getElementById("shell");
let CLITextInput = document.getElementById("shellInput");

CLITextInput.addEventListener("keyup", (event) => {outputCommand(event)});

function outputCommand(event){
    if (event.key == "Enter"){
        // 入力されたテキストを解析して、"packageName commandName arguments "
        //を表す3つの文字列要素の配列にします。
        let parsedCLIArray = CCTools.commandLineParser(CLITextInput.value);

        // 入力されたテキストがCLIにechoされます。 
        CCTools.appendEchoParagraph(CLIOutputDiv);

        // 提出後、テキストフィールドをクリアにします。
        CLITextInput.value = '';

        // 入力の検証を行い、 {'isValid': <Boolean>, 'errorMessage': <String>} の形をした連想配列を作成します。
        let validatorResponse = CCTools.parsedArrayValidator(parsedCLIArray);
        if(validatorResponse['isValid'] == false) CCTools.appendResultParagraph(CLIOutputDiv, false, validatorResponse['errorMessage']);

        else CCTools.appendResultParagraph(CLIOutputDiv, true, CCTools.evaluatedResultsStringFromParsedCLIArray(parsedCLIArray));
        
        // 出力divを常に下にスクロールします。 
        CLIOutputDiv.scrollTop = CLIOutputDiv.scrollHeight;
    }
}

class CCTools{

    //MToolsとここは同じ
    static commandLineParser(CLIInputString)
    {
        let parsedStringInputArray = CLIInputString.trim().split(" ");
        return parsedStringInputArray;
    }

    static parsedArrayValidator(parsedStringInputArray)
    {
        // すべてのコマンドに適用されるルールに照らし合わせて入力をチェックします。
        let validatorResponse = CCTools.universalValidator(parsedStringInputArray);
        if (!validatorResponse['isValid']) return validatorResponse;
      
        // 入力が最初のvalidatorを通過した場合、どのコマンドが与えられたかに基づいて、
        // より具体的な入力の検証を行います。
        validatorResponse = CCTools.commandArgumentsValidator(parsedStringInputArray.slice(1, 5));
        if (!validatorResponse['isValid']) return validatorResponse;

        return {'isValid': true, 'errorMessage':''}
    }

    static universalValidator(parsedStringInputArray)
    {
        let validCommandList = ["convert", "showDenominations", "showAvailableLocales"];
        if (parsedStringInputArray[0] != 'CCTools'){
            return {'isValid': false, 'errorMessage': `only CCTools package supported by this app. input must start with 'CCTools'`}
        }
        // 変更点 コマンドは5個以上にならない
        if (parsedStringInputArray.length > 5){
            return {'isValid': false, 'errorMessage': `command line input maximum contain exactly 5 elements: 'packageName commandName arguments'`};
        }
        if (validCommandList.indexOf(parsedStringInputArray[1]) == -1){
            return {'isValid': false, 'errorMessage': `CCTools only supports the following commands: ${validCommandList.join(",")}`};
        }
        
        return {'isValid': true, 'errorMessage': ''}
    }

    // コマンド別の挙動を記述
    static commandArgumentsValidator(commandArgsArray)
    {
        if (commandArgsArray[0] === "showAvailableLocales"){
            return CCTools.showAvailableLocalesValidator(commandArgsArray);
        }
        if (commandArgsArray[0] === "showDenominations"){
            return CCTools.showDenominationsValidator(commandArgsArray);
        }
        if (commandArgsArray[0] === "convert"){
            return CCTools.convertValidator(commandArgsArray);
        }

        return {'isValid': true, 'errorMessage':''}
    }

    static showAvailableLocalesValidator(argsArray)
    {
        if (argsArray.length != 1){
            return {'isValid': false, 'errorMessage': `command showAvailableLocales requires exactly 0 argument`};
        }

        return {'isValid': true, 'errorMessage':''}
    }

    static showDenominationsValidator(argsArray)
    {
        if (argsArray.length != 2){
            return {'isValid': false, 'errorMessage': `command showAvailableLocales requires exactly 1 argument`};
        }
        if (!locales.includes(argsArray[1])){
            return {'isValid': false, 'errorMessage': `That locale ${argsArray[1]} is not an available locale`}; 
        }
        return {'isValid': true, 'errorMessage':''}
    }

    static convertValidator(argsArray)
    {   
        if (argsArray.length != 4){
            return {'isValid': false, 'errorMessage': `command showAvailableLocales requires exactly 3 argument`};
        }
        if (!denominations.includes(argsArray[1])){
            return {'isValid': false, 'errorMessage': `That sourceDenomination ${argsArray[1]} is not an available Denomination`}; 
        }
        if (typeof Number(argsArray[2]) != "number"){
            return {'isValid': false, 'errorMessage': `The second argument must be numeric`};
        }
        if (!denominations.includes(argsArray[3])){
            return {'isValid': false, 'errorMessage': `That destinationDenomination ${argsArray[3]} is not an available Denomination`}; 
        }
        if (isNaN(Number(argsArray[2]))){
            return {'isValid': false, 'errorMessage': `The second argument is NaN. The second argument must be numeric`};
        }
        if (Number(argsArray[2]) <= 0){
            return {'isValid': false, 'errorMessage': `The second argument must be a number greater than or equal to 1.`};
        }

        return {'isValid': true, 'errorMessage':''}
    }

    static appendEchoParagraph(parentDiv)
    {
        parentDiv.innerHTML+=
            `<p class="m-0">
                <span style='color:green'>student</span>
                <span style='color:magenta'>@</span>
                <span style='color:blue'>recursionist</span>
                : ${CLITextInput.value}
            </p>`;

        return;
    }

    static appendResultParagraph(parentDiv, isValid, message)
    {
        let promptName = "";
        let promptColor = "";
        if (isValid){
            promptName = "CCTools";
            promptColor = "turquoise";
        }
        else{
            promptName = "CCToolsError";
            promptColor = "red";
        }
        parentDiv.innerHTML+=
                `<p class="m-0">
                    <span style='color: ${promptColor}'>${promptName}</span>: ${message}
                </p>`;
        return;
    }

    static evaluatedResultsStringFromParsedCLIArray(PCA){
        let result = '';

        // コマンド別のリターンを返す
        if (PCA[1] === "showAvailableLocales"){
            result += `<br>`;
            locales.forEach(locale => result += locale +  `<br>`);
        }
        else if (PCA[1] === "showDenominations"){
            result += PCA[2] + `<br>`;
            Object.keys(source[PCA[2]]).forEach(denomination => result += denomination + `<br>`);
        }
        else {
            let res = Number(PCA[3]) * rates[PCA[2]];
            res *= (1 / rates[PCA[4]]);
            result += res + ` ` + PCA[4] + `<br>`;
        }

        return "your result is: " + result;
    }
}