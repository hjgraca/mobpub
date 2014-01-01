var STYLE_ITEM = "divItem";
var STYLE_TEXT = "divText";
var STYLE_TEXT_MOUSEOVER = "divText divTextMouseover";
var STYLE_TEXT_SELECTED = "divText divTextSelected";
var STYLE_TEXT_SELECTED_MOUSEOVER = "divText divTextSelectedMouseover";

var activeItem;


function SearchXMLDocument(doclocation, searchwords)
{
	xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	xmlDoc.async = "false";
	//xmlDoc.onreadystatechange = readXML;
	//xmlDoc.load("iserverdiagram.xml");
	xmlDoc.load(doclocation);
	if (xmlDoc.readyState != 4)
		alert("DOC NOT READY");

	for (i = 0; i < xmlDoc.documentElement.childNodes.length; ++i) {
		if (xmlDoc.documentElement.childNodes[i].tagName == "CustomAttributes") {

			for (a = 0; a < xmlDoc.documentElement.childNodes[i].childNodes.length; ++a) {

				for (b = 0; b < xmlDoc.documentElement.childNodes[i].childNodes[a].childNodes.length; ++b) {

					// alert(xmlDoc.documentElement.childNodes[i].childNodes[a].childNodes[b].nodeTypedValue);

					var str = xmlDoc.documentElement.childNodes[i].childNodes[a].childNodes[b].firstChild.nodeValue;
					
					for(var c=0;c<searchwords.length;++c)
					{
						if (str.search(searchwords[c]) != -1) return 1;
					}
				}
			}
		}
	}
	
	return 0;
 }  

function doItemMouseIn(targetItem) {
    var itemText = targetItem.childNodes[0].childNodes[1];
    if (itemText.className === STYLE_TEXT) {
        itemText.className = STYLE_TEXT_MOUSEOVER;
    } else if (itemText.className === STYLE_TEXT_SELECTED) {
        itemText.className = STYLE_TEXT_SELECTED_MOUSEOVER;
    }
}
function doItemMouseOut(targetItem) {
    var itemText = targetItem.childNodes[0].childNodes[1];
    if (itemText.className === STYLE_TEXT_MOUSEOVER) {
        itemText.className = STYLE_TEXT;
    } else if (itemText.className === STYLE_TEXT_SELECTED_MOUSEOVER) {
        itemText.className = STYLE_TEXT_SELECTED;
    }
}
function doIconClick(targetItem) {
    doTextClick(targetItem);
}
function doTextClick(targetItem) {
    /* Adjust selected tree element, and tree expansion */
    if (activeItem) {
        var itemText = activeItem.childNodes[0].childNodes[1];
        itemText.className = STYLE_TEXT;
    }
    activeItem = targetItem;
    var itemText = targetItem.childNodes[0].childNodes[1];
    itemText.className = STYLE_TEXT_SELECTED;
    
    /* Call parent to notify a tree node has been selected */
    if (parent.doTreeNodeClick) {
        parent.doTreeNodeClick(targetItem);
    }
}
function doItemDoubleClick(targetItem) {
    doTextClick(targetItem);
    document.selection.empty();
    if (targetItem.itemDoc) {
        if (parent.openNewWindow) {
            parent.openNewWindow(targetItem.itemDoc);
        } else {
            window.open(targetItem.itemDoc);
        }
    } else {
        alert('Nothing more to show for ' + targetItem.itemType + 's');
    }
    return false;
}

var XML_SOURCE = 'publication.structview.xml';
var XSL_SEARCH = 'pubsearch.xsl';
var ID_SEARCH_FOR = 'inputSearchFor';
var ID_SEARCH_TYPE = 'inputSearchType';
var ID_SEARCH_NAME = 'inputSearchName';
var ID_SEARCH_DESCRIPTION = 'inputSearchDescription';
var ID_SEARCH_ATTRIBUTES = 'inputSearchAttributes';
var ID_RESULTS_STAGE = 'resultsStage';
var ID_SEARCH_DIALOG = 'divSearch';
var ID_SEARCHING_DIALOG = 'divSearching';
var ID_SEARCHED_DIALOG = 'divSearched';
var ID_RESULTS_DIALOG = 'pnlSearchResults';

function doBack() {
    window.navigate('pubtree.html');
}

function doSearch() {
    var searchForm = document.forms[0];
    if ((searchForm.searchFor.value != '') &&
        (searchForm.searchName.checked || searchForm.searchDescription.checked || searchForm.searchAttributes.checked) &&
        (searchForm.searchTypeShapes.checked || searchForm.searchTypeDocuments.checked || searchForm.searchTypeDiagrams.checked || searchForm.searchTypeFolders.checked)) {
            document.getElementById(ID_SEARCH_DIALOG).style.display = 'none';
            document.getElementById(ID_SEARCHING_DIALOG).style.display = '';
            window.setTimeout('doActualSearch()', 1);
    } else {
        alert('Please enter a search string, and ensure at least one search field and one type of object is checked.');
    }
}

function doActualSearch() {

    var srcXML = new ActiveXObject('MSXML2.DOMDocument');
//    var xsltXML = new ActiveXObject('MSXML2.DOMDocument');
    var xsltXML = new ActiveXObject('MSXML2.FreeThreadedDOMDocument.3.0');
 
    // Load source XML
    srcXML.async = false;
    srcXML.load(XML_SOURCE);
    if (srcXML.parseError.errorCode != 0) {
        alert("Source XML could not be parsed:\n" + srcXML.parseError.reason);
        return;
    }
    
    // Load XML stylesheet
    xsltXML.async = false;
    xsltXML.load(XSL_SEARCH);
    if (xsltXML.parseError.errorCode != 0) {
        alert("Transformation XML could not be parsed:\n" + xsltXML.parseError.reason);
        return;
    }
    var xslTemplate = new ActiveXObject('MSXML2.XSLTemplate');
    xslTemplate.stylesheet = xsltXML;
    var xslProc = xslTemplate.createProcessor;
    xslProc.input = srcXML;
    
    var searchForm = document.forms[0];
    xslProc.addParameter('searchFor', document.getElementById(ID_SEARCH_FOR).value.toUpperCase());
    var splitRe = /\s+/;
    var keywords = searchForm.searchFor.value.toUpperCase().split(splitRe);

    var keywordsXML = new ActiveXObject('MSXML2.DOMDocument');
    keysElement = keywordsXML.createElement('KS');
    keywordsXML.appendChild(keysElement);
    for (var i = 0; i < keywords.length; i++) {
        if (keywords[i] != '') {
            var keyElement = keywordsXML.createElement('K');
            keyElement.appendChild(keywordsXML.createTextNode(keywords[i]));
            keysElement.appendChild(keyElement);
        }
    }
    xslProc.addParameter('searchKeywordsXML', keywordsXML.selectSingleNode('/'));
    

	var keywordsText;
    for (var i = 0; i < keywords.length; i++) {
        if (keywords[i] != '') {
        keywordsText+= ',';
        keywordsText+= keywords[i];
       }
    }
    xslProc.addParameter('searchKeywords', keywordsText);
    


    if (searchForm.searchTypeFolders.checked) {
        xslProc.addParameter('includeFolders', '1');
    }
    if (searchForm.searchTypeDocuments.checked) {
        xslProc.addParameter('includeDocuments', '1');
    }
    if (searchForm.searchTypeDiagrams.checked) {
        xslProc.addParameter('includeDiagrams', '1');
    }
    if (searchForm.searchTypeShapes.checked) {
        xslProc.addParameter('includeShapes', '1');
    }
    

    if (searchForm.searchName.checked) {
        xslProc.addParameter('searchName', '1');
    }
    if (searchForm.searchDescription.checked) {
        xslProc.addParameter('searchDescription', '1');
    }
    if (searchForm.searchAttributes.checked) {
        xslProc.addParameter('searchAttributes', '1');
    }
    xslProc.transform();
    var resXMLCode = xslProc.output;
    
    var stage = document.getElementById(ID_RESULTS_STAGE);
    if (resXMLCode) {
        stage.innerHTML = '<div style="border-bottom: 1pt dotted #999; padding-bottom: 4px; margin-bottom: 4px;">Double-click an object to open in a new window</div>' + resXMLCode;
    } else {
        stage.innerHTML = 'Your search returned no results.';
    }
    document.getElementById(ID_SEARCHING_DIALOG).style.display = 'none';
    document.getElementById(ID_RESULTS_DIALOG).style.display = '';
    document.getElementById(ID_SEARCHED_DIALOG).style.display = '';
}

function doSearchAgain() {
    activeItem = null;
    document.getElementById(ID_RESULTS_DIALOG).style.display = 'none';
    document.getElementById(ID_RESULTS_STAGE).innerHTML = '';
    document.getElementById(ID_SEARCH_DIALOG).style.display = '';
    document.getElementById(ID_SEARCHED_DIALOG).style.display = 'none';
    
}
