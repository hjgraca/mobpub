var ITEMTYPE_PUBLICATION = "publication";
var ITEMTYPE_FOLDER = "folder";
var ITEMTYPE_DOCUMENT = "document";
var ITEMTYPE_DIAGRAM = "diagram";

var RELATIONSHIP_TYPE_DIAGRAM = "diagram";
var RELATIONSHIP_TYPE_DOCUMENT = "document";
var RELATIONSHIP_TYPE_SHAPE = "shape";

var OPTION_REUSE_NEW_WINDOWS = "reusePopups";
var OPTION_NEW_WINDOW_FEATURES = "popupFeatures";
var OPTION_LINK_DIAGRAM_NEW_WINDOW = "popupDiagramLinks";
var OPTION_LINK_SHAPE_NEW_WINDOW = "popupShapeLinks";
var OPTION_LINK_DOCUMENT_NEW_WINDOW = "popupDocumentLinks";

/* Frame open/closure message distribution */
function documentPreviewLoaded() {
    if (window.frames["frmInfo"] && window.frames("frmInfo").documentPreviewLoaded) {
        window.frames("frmInfo").documentPreviewLoaded();
    }
}
function documentPreviewCleared() {
    if (window.frames["frmInfo"] && window.frames("frmInfo").documentPreviewCleared) {
        window.frames("frmInfo").documentPreviewCleared();
    }
}
function frameClosed(frmID) {
    if (window.frames("frmInfo") && window.frames("frmInfo").frameClosed) {
        window.frames("frmInfo").frameClosed(frmID);
    }
}
function openFrame(frmID) {
    if (window.frames[frmID]) {
        if (window.frames(frmID).ensureFrameOpen) {
            window.frames(frmID).ensureFrameOpen();
        }
    }
}
function isFrameOpen(frmID) {
    if (window.frames[frmID]) {
        if (window.frames(frmID).isFrameOpen) {
            return window.frames(frmID).isFrameOpen();
        }
    }
    return true; // frame probably doesn't implement toggling interface, so might as well let
        // caller believe frame is open as there's nothing it can do about it otherwise.
}

/* Tree Window management */
function doTreeNodeClick(item) {

    var itemType = item.itemType;
    if (item.itemInfo) {
        openInfo(item.itemInfo);
    }
    if ((itemType === ITEMTYPE_DOCUMENT) && item.itemDoc) {
            openDocumentPreview(item.itemDoc);
    } else {
        clearDocumentPreview();
    }
}

/* Document Preview Window management */
function documentPreviewAvailable() {
    return window.frames["frmDoc"];
}
function openDocumentPreview(href) {
    if (window.frames["frmDoc"]) {
        window.frames("frmDoc").loadDocument(href)
    }
}
function clearDocumentPreview() {
    if (window.frames["frmDoc"]) {
        window.frames("frmDoc").clearDocument();
    }
}

/* Info Window management */
function openInfo(href) {
    if (window.frames["frmInfo"]) {
        window.frames("frmInfo").navigate(href);
    }
}

/* Document / Diagram window management */
var viewWindow = null;
function openNewWindow(href) {
    if (getBooleanOption(OPTION_REUSE_NEW_WINDOWS) && viewWindow && (!viewWindow.closed)) {
        viewWindow.navigate(href);
        viewWindow.focus();
    } else {
        var windowFeatures = getOption(OPTION_NEW_WINDOW_FEATURES);
        if (windowFeatures) {
            viewWindow = window.open(href, "_blank", windowFeatures);
        } else {
            viewWindow = window.open(href);
        }
    }
}

function openRelationship(type, href) {
    var loadInNewWindow = false;
    if (type === RELATIONSHIP_TYPE_DIAGRAM) {
        loadInNewWindow = getBooleanOption(OPTION_LINK_DIAGRAM_NEW_WINDOW);
    } else if (type === RELATIONSHIP_TYPE_SHAPE) {
        loadInNewWindow = getBooleanOption(OPTION_LINK_SHAPE_NEW_WINDOW);
    } else if (type === RELATIONSHIP_TYPE_DOCUMENT) {
        loadInNewWindow = getBooleanOption(OPTION_LINK_DOCUMENT_NEW_WINDOW);
    }
    if (loadInNewWindow) {
        openNewWindow(href);
    } else {
        window.open(href, "_top");
    }
}
