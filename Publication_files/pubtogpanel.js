// These will be appended to the pathToRoot option on load
var IMG_EXPAND = 'Images/paneldown.gif';
var IMG_COLLAPSE = 'Images/panelup.gif';

var STYLE_PANELTITLE_MOUSEOVER = 'divPanelTitle divPanelTitleHighlighted';
var STYLE_PANELTITLE_MOUSEOUT = 'divPanelTitle';
var STYLE_RELATIONSHIP_MOUSEOVER = 'divRelationship divRelationshipHighlighted';
var STYLE_RELATIONSHIP_MOUSEOUT = 'divRelationship';
var STYLE_RELATIONSHIP_DESTINATION_MOUSEOVER = 'divRelationshipDestination divRelationshipDestinationHighlighted';
var STYLE_RELATIONSHIP_DESTINATION_MOUSEOUT = 'divRelationshipDestination';
var STYLE_RELATIONSHIP_MOUSEOVER_TITLE = 'divRelationshipTitle divRelationshipTitleHighlighted';
var STYLE_RELATIONSHIP_MOUSEOUT_TITLE = 'divRelationshipTitle';

var STYLE_PANELBUTTON_MOUSEOVER = 'divPanelButton divPanelButtonHighlighted';
var STYLE_PANELBUTTON_MOUSEOUT = 'divPanelButton';

var ERROR_OPEN_RELATIONSHIP_UNAVAILABLE = "Publication error:  The Relationship could not be opened, as the information page's context is not correct.  Please re-open the publication and re-try.";
var ERROR_OPEN_RELATIONSHIP_BROKEN = "This Relationship could not be opened.";

var OPTION_PATH_TO_ROOT = 'pathToRoot';
var OPTION_AUTO_TOGGLE_PANELS = 'autoTogglePanels';

function openAllPanels(firstPanel) {
    if (firstPanel.collapsed) {
        togglePanel(firstPanel);
    }
    if (firstPanel.nextSibling) {
        openAllPanels(firstPanel.nextSibling);
    }
}

function togglePanel(panel) {
    if (panel.collapsed) {
        panel.firstChild.childNodes[1].firstChild.src = IMG_COLLAPSE;
        for (var i = 1; i < panel.childNodes.length; i++) {
            panel.childNodes[i].style.display = "";
        }
        panel.collapsed = false;
    } else {
        panel.firstChild.childNodes[1].firstChild.src = IMG_EXPAND;
        for (var i = 1; i < panel.childNodes.length; i++) {
            panel.childNodes[i].style.display = "none";
        }
        panel.collapsed = true;
    }    
}
function doPTMouseOver(pTitle) {
    pTitle.className = STYLE_PANELTITLE_MOUSEOVER;
}
function doPTMouseOut(pTitle) {
    pTitle.className = STYLE_PANELTITLE_MOUSEOUT;
}
function doHLMouseOver(hLink) {
    hLink.className = STYLE_RELATIONSHIP_MOUSEOVER;
    hLink.firstChild.className = STYLE_RELATIONSHIP_MOUSEOVER_TITLE;
}
function doHLMouseOut(hLink) {
    hLink.className = STYLE_RELATIONSHIP_MOUSEOUT;
    hLink.firstChild.className = STYLE_RELATIONSHIP_MOUSEOUT_TITLE;
}
function doHLDMouseOver(hLinkDest) {
    hLinkDest.className = STYLE_RELATIONSHIP_DESTINATION_MOUSEOVER;
}
function doHLDMouseOut(hLinkDest) {
    hLinkDest.className = STYLE_RELATIONSHIP_DESTINATION_MOUSEOUT;
}
function doODMouseOver(pButton) {
    pButton.className = STYLE_PANELBUTTON_MOUSEOVER;
}
function doODMouseOut(pButton) {
    pButton.className = STYLE_PANELBUTTON_MOUSEOUT;
}
function pubtogpanelOnLoad() {
    // Locate images
    if (getOption(OPTION_PATH_TO_ROOT)) {
        IMG_EXPAND = getOption(OPTION_PATH_TO_ROOT) + IMG_EXPAND;
        IMG_COLLAPSE = getOption(OPTION_PATH_TO_ROOT) + IMG_COLLAPSE;
    }

    var atpOpt = getOption(OPTION_AUTO_TOGGLE_PANELS);
    var togglePanels = [];
    if (atpOpt) {
        var togglePanels = atpOpt.split(",");
    }
    
    // Toggle auto-toggle panels    
    var i;
    for (i = 0; i < togglePanels.length; i++) {
        if (document.getElementById(togglePanels[i])) {
            togglePanel(document.getElementById(togglePanels[i]));
        }
    }

}
function pubtogpanelOnUnload() {
}
