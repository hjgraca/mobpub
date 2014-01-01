var STYLE_BODY_FRAME_OPEN = 'bodyFrameOpen';
var STYLE_BODY_FRAME_CLOSED = 'bodyFrameClosed';
var STYLE_FRAME_CONTENTS = 'divFrameContents';
var STYLE_FRAME_CONTENTS_HIDDEN = 'divFrameContentsHidden';
var ID_FRAME_CONTENTS_OPEN = 'frameContentsOpen';
var ID_FRAME_CONTENTS_CLOSED = 'frameContentsClosed';

var OPTION_AUTO_CLOSE_FRAME = 'autoCloseFrame';
var OPTION_MINIMIZED_ROWS = 'minimizedRows';
var OPTION_MINIMIZED_COLS = 'minimizedCols';

var minimizedCols;
var maximizedCols;
var minimizedRows;
var maximizedRows;

var maxNoResize;

function isFrameOpen() {
    var openContents = document.getElementById(ID_FRAME_CONTENTS_OPEN);
    var closedContents = document.getElementById(ID_FRAME_CONTENTS_CLOSED);
    return (openContents && (openContents.className === STYLE_FRAME_CONTENTS));
}

function ensureFrameClosed() {
    if (isFrameOpen()) {  toggleFrame(); }
}
function ensureFrameOpen() {
    if (!isFrameOpen()) { toggleFrame(); }
}
function toggleFrame() {
    if (window.event) { window.event.cancelBubble = true; }
    var openContents = document.getElementById(ID_FRAME_CONTENTS_OPEN);
    var closedContents = document.getElementById(ID_FRAME_CONTENTS_CLOSED);
    var frameSet = window.frameElement.parentNode;
    var bodyNode = document.getElementsByTagName('BODY')[0];
    if (openContents && closedContents && frameSet && bodyNode) {
        if (isFrameOpen()) {
            openContents.className = STYLE_FRAME_CONTENTS_HIDDEN;
            closedContents.className = STYLE_FRAME_CONTENTS;
            
            if (minimizedCols) {
                maximizedCols = frameSet.cols;
                frameSet.cols = minimizedCols;
            }
            if (minimizedRows) {
                maximizedRows = frameSet.rows;
                frameSet.rows = minimizedRows;
            }
            bodyNode.className = STYLE_BODY_FRAME_CLOSED;
            maxResize = window.frameElement.noResize;
            // We can't use the noResize property, as it enforces noResize in *both* dimensions.
            // Use this more selective version instead.    
            window.frameElement.onresize = function () {
                if (!isFrameOpen()) {
                    if (minimizedRows) {
                        window.frameElement.parentNode.rows = minimizedRows;
                    }
                    if (minimizedCols) {
                        window.frameElement.parentNode.cols = minimizedCols;
                    }
                }
            }
            
            // Notify parent, in case other frames are interested in the status of this frame
            if (parent.frameClosed) {
                parent.frameClosed(window.frameElement.id);
            }   
        } else {
            openContents.className = STYLE_FRAME_CONTENTS;
            closedContents.className = STYLE_FRAME_CONTENTS_HIDDEN;
            
            if (maximizedCols) {
                frameSet.cols = maximizedCols;
            }
            if (maximizedRows) {
                frameSet.rows = maximizedRows;
            }
            bodyNode.className = STYLE_BODY_FRAME_OPEN;
            window.frameElement.onResize = null;
        }
    }
}

function pubtogframeOnLoad() {
    minimizedRows = getOption(OPTION_MINIMIZED_ROWS);
    minimizedCols = getOption(OPTION_MINIMIZED_COLS);
    
    if (getBooleanOption(OPTION_AUTO_CLOSE_FRAME)) {
        ensureFrameClosed();
    }
}
function pubtogframeOnUnload() {
}
