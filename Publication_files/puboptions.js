// For reading options from the XML data island in the HTML

var ID_PUBLICATION_OPTIONS = "publicationOptions";
var TAG_PUBLICATION_OPTIONS = ID_PUBLICATION_OPTIONS;
var TAG_PUBLICATION_OPTION = "publicationOption";
var ATTRIB_OPTION_NAME = 'optionName';
var ATTRIB_OPTION_VALUE = 'optionValue';
var OPTIONS = [];

function checkOptions() {
    var xmlData = document.getElementById(ID_PUBLICATION_OPTIONS);
    if (xmlData) {
        var optionsBlocks = xmlData.getElementsByTagName(TAG_PUBLICATION_OPTIONS);
        for (var i = 0; i < optionsBlocks.length; i++) {
            var optBlock = optionsBlocks[i];
            for (var j = 0; j < optBlock.childNodes.length; j++) {
                var option = optBlock.childNodes[j];
                if (option.tagName === TAG_PUBLICATION_OPTION) {
//                    alert(option.attributes.getNamedItem(ATTRIB_OPTION_NAME).nodeValue + " = " + option.attributes.getNamedItem(ATTRIB_OPTION_VALUE).nodeValue);
                    OPTIONS[option.attributes.getNamedItem(ATTRIB_OPTION_NAME).nodeValue] = 
                                    option.attributes.getNamedItem(ATTRIB_OPTION_VALUE).nodeValue;
                }
            }
        }
    }
}

function getBooleanOption(name) {
    var opt = getOption(name);
    return ( opt && ((opt.toUpperCase() === "TRUE") || (opt.toUpperCase() === "YES") || (opt === "1")));
}

function getOption(name) {
    return OPTIONS[name];
}

function puboptionsOnLoad() {
    checkOptions();
}

function puboptionsOnUnload() {
}
