var STYLE_ITEM = "divItem";
var STYLE_TEXT = "divText";
var STYLE_TEXT_MOUSEOVER = "divTextMouseover";
var STYLE_TEXT_SELECTED = "divTextSelected";
var STYLE_TEXT_SELECTED_MOUSEOVER = "divTextSelectedMouseover";
var STYLE_SUBITEMS = "divSubitems";
var STYLE_SUBITEMS_HIDDEN = "divHiddenSubitems";
var IMGSRC_PLUS = "Images/treeplus.gif";
var IMGSRC_MINUS = "Images/treeminus.gif";
var ID_TREE = 'tree';
var COOKIE_EXPANSIONS = "expStatus";
var SEP_EXPANSION_STATUS = "|"; // This must be different, and must not interfere with
var SEP_EXPANSION_PARTS = ":";  // document.cookie format

var OPTION_TREE_STATE_ID = 'treeStateID';

var activeItem;

function setPreviewDocuments(b) {
    // We don't permit setting preview to true unless the document frame is present
    optionPreviewDocuments = b && (parent.getDocumentPreviewFrame());
}
function doPMClick(targetItem) {
    toggleExpansion(targetItem);
}
function canBeCollapsed(item) {
    return (item.childNodes[2] && (item.childNodes[2].className === STYLE_SUBITEMS));
}
function canBeExpanded(item) {
    return (item.childNodes[2] && (item.childNodes[2].className === STYLE_SUBITEMS_HIDDEN));
}
function toggleExpansion(targetItem) {
    var pmimg = targetItem.firstChild.firstChild;
    var subitems = targetItem.childNodes[2];
    if (pmimg && subitems && (subitems.className === STYLE_SUBITEMS)) {
        pmimg.src = IMGSRC_PLUS;
        subitems.className = STYLE_SUBITEMS_HIDDEN;
    } else if (subitems && (subitems.className === STYLE_SUBITEMS_HIDDEN)) {
        pmimg.src = IMGSRC_MINUS;
        subitems.className = STYLE_SUBITEMS;
    } else if (pmimg) {
        pmimg.style.display = "none";
    }
}
// Higher-order function mapping 'func' over the items in a tree, starting with
// the argument 'item'.  Depth-first over tree.
function treeMap(func, item) {
    func(item);
    if (item.childNodes[2] && item.childNodes[2].firstChild) {
        treeMap(func, item.childNodes[2].firstChild);
    }
    if (item.nextSibling) {
        treeMap(func, item.nextSibling);
    }
}
// Toggles expansion of the item if there are no subitems or if the style
// of the subitems matches 'onStyle'.
function styleCondExpansionToggle(onStyle, item) {
    var subitems = item.childNodes[2];
    if ((subitems && (subitems.className === onStyle)) || !subitems) {
        // Include !subitems above to get the windows 'disappearing plus/minus' behaviour
        // where no subtree is present
        toggleExpansion(item);
    }
}
function ensureExpanded(item) {
    styleCondExpansionToggle(STYLE_SUBITEMS_HIDDEN, item);
}
function ensureContracted(item) {
    styleCondExpansionToggle(STYLE_SUBITEMS, item);
}
function contractAll(item) {
    if (item) {
        treeMap(ensureContracted, item);
    } else {
        treeMap(ensureContracted, document.getElementById(ID_TREE).firstChild);
    }
}
function expandAll(item) {
    if (item) {
        treeMap(ensureExpanded, item);
    } else {
        treeMap(ensureExpanded, document.getElementById(ID_TREE).firstChild);
    }
}
function installEventHandlers(item) {
/*
    if (item.className === STYLE_ITEM) {
        item.firstChild.onclick = function () { doPMClick(item.id); }
        item.firstChild.ondblclick = function () { doPMClick(item.id); }
        item.childNodes[1].onmouseover = function () { doItemMouseIn(item.id); }
        item.childNodes[1].onmouseout = function() { doItemMouseOut(item.id); }
        item.childNodes[1].firstChild.onclick = function () { doIconClick(item.id); }
        item.childNodes[1].childNodes[1].onclick = function () { doTextClick(item.id); }
    }
*/
}
function doItemMouseIn(targetItem) {
    var itemText = targetItem.childNodes[1].childNodes[1];
    if (itemText.className === STYLE_TEXT) {
        itemText.className = STYLE_TEXT_MOUSEOVER;
    } else if (itemText.className === STYLE_TEXT_SELECTED) {
        itemText.className = STYLE_TEXT_SELECTED_MOUSEOVER;
    }
}
function doItemMouseOut(targetItem) {
    var itemText = targetItem.childNodes[1].childNodes[1];
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
        activeItem.childNodes[1].childNodes[1].className = STYLE_TEXT;
        if (canBeCollapsed(activeItem) && activeItem.parentNode.contains(targetItem) && targetItem.parentNode.contains(activeItem)
            && !targetItem.contains(activeItem) && !activeItem.contains(targetItem)) {
            toggleExpansion(activeItem);
        }
    }
    activeItem = targetItem;
    targetItem.childNodes[1].childNodes[1].className = STYLE_TEXT_SELECTED;
    if (canBeExpanded(activeItem)) {
        toggleExpansion(activeItem);
    }
    
    /* Call parent to notify a tree node has been selected */
    if (parent.doTreeNodeClick) {
        parent.doTreeNodeClick(targetItem);
    }
}

/* System to ensure tree state is restored when navigating back */
var itemStatuses = "";
function restoreExpansions(statuses) {
    var exps = statuses.split(SEP_EXPANSION_STATUS);
    var i;
    for (i = 0; i < exps.length; i++) {
        var parts = exps[i].split(SEP_EXPANSION_PARTS);
        if (parts[1] && parts[1] === "+") {
            var item = document.getElementById(parts[0]);
            if (item) { ensureExpanded(item); }
        } else if (parts[1] && parts[1] === "-") {
            var item = document.getElementById(parts[0]);
            if (item) { ensureContracted(item); }
        }
    }
}
function recordItemStatus(item) {
    if (canBeExpanded(item)) {  itemStatuses = itemStatuses + item.id + SEP_EXPANSION_PARTS + "-" + SEP_EXPANSION_STATUS; }
    if (canBeCollapsed(item)) { itemStatuses = itemStatuses + item.id + SEP_EXPANSION_PARTS + "+" + SEP_EXPANSION_STATUS; }
}

function pubtreeOnLoad() {
    // Install event handlers on tree elements
    treeMap(installEventHandlers, document.getElementById(ID_TREE).firstChild);

    // Try to use a unique cookie so state isn't confused across different trees
    if (getOption(OPTION_TREE_STATE_ID)) {
        COOKIE_EXPANSIONS = COOKIE_EXPANSIONS + getOption(OPTION_TREE_STATE_ID);
    }
    
    // Restore expansion statuses from cookie
    var crumbs = document.cookie.split("; ");
    var i;
    for (i = 0; i < crumbs.length; i++) {
        var parts = crumbs[i].split("=");
        if (parts[0] && parts[0] === COOKIE_EXPANSIONS) {
            restoreExpansions(unescape(parts[1]));
            break;
        }
    }
}
function pubtreeOnUnload() {
    treeMap(recordItemStatus, tree.firstChild);
    document.cookie = COOKIE_EXPANSIONS + "=" + escape(itemStatuses);
    
}

