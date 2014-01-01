var ID_IFRAME_PREVIEW = 'docPreview';
var ID_OPEN_DOC = 'openDoc';
var FILE_DEFAULT_DOCUMENT = 'pubdocdefault.html';

var documentPresent = false;

function navigateIfNecessary(href) {
    var ifrm = document.getElementById(ID_IFRAME_PREVIEW);
    if (ifrm && ifrm.contentWindow) {
        ifrm.contentWindow.navigate(href);
    }
}
function hasDocument() {
    return documentPresent;
}

function clearDocument() {
    // Clears the loaded document
    var ifrm = document.getElementById(ID_IFRAME_PREVIEW);
    if (ifrm && ifrm.contentWindow) {
        navigateIfNecessary(FILE_DEFAULT_DOCUMENT);
    }
    var openDoc = document.getElementById(ID_OPEN_DOC);
    if (openDoc) {
        openDoc.style.display = "none";
    }
    ensureFrameClosed();
    documentPresent = false
}
function loadDocument(href) {
    // Loads a document into the preview window
    var ifrm = document.getElementById(ID_IFRAME_PREVIEW);
    if (ifrm && ifrm.contentWindow) {
        navigateIfNecessary(href);
    }
    var openDoc = document.getElementById(ID_OPEN_DOC);
    if (openDoc) {
        openDoc.style.display = "inline";
    }
    ensureFrameOpen();
    documentPresent = true;
}
function openDocument() {
    // Opens currently previewed document in new window
    var ifrm = document.getElementById(ID_IFRAME_PREVIEW);
    if (ifrm && ifrm.contentWindow) {
        if (parent.openNewWindow) {
            parent.openNewWindow(ifrm.contentWindow.location.href);
        } else {
            window.open(ifrm.contentWindow.location.href);
        }
    }
}

function pubdocOnLoad() {
    clearDocument();
}
function pubdocOnUnload() {
}
