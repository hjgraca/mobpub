<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:variable name="reportSettings" select="document('publicationproperties.xml')/iServerPublication/PublicationProperties/Reporting" />

  <xsl:template match="/">
    <html>
      <head>
        <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />
        <link rel="stylesheet" type="text/css" media="screen">
          <xsl:attribute name="href">
            <xsl:value-of select="$pathToRoot" />pubinfo.css
          </xsl:attribute>
        </link>
        <link rel="stylesheet" type="text/css" media="print">
          <xsl:attribute name="href">
            <xsl:value-of select="$pathToRoot" />pubinfo.printing.css
          </xsl:attribute>
        </link>
        <link rel="stylesheet" type="text/css">
          <xsl:attribute name="href">
            <xsl:value-of select="$pathToRoot" />pubtogframe.css
          </xsl:attribute>
        </link>
        <script language="jscript" type="text/jscript">
          <xsl:attribute name="src">
            <xsl:value-of select="$pathToRoot" />puboptions.js
          </xsl:attribute>
        </script>
        <script language="jscript" type="text/jscript">
          <xsl:attribute name="src">
            <xsl:value-of select="$pathToRoot" />pubtogpanel.js
          </xsl:attribute>
        </script>
        <script language="jscript" type="text/jscript">
          var STYLE_TOOLBAR_HIGHLIGHTED = "divToolbarButton divFrameToolbarButton divFrameToolbarButtonHighlighted";
          var STYLE_TOOLBAR_DISABLED = "divToolbarButton divFrameToolbarButton divFrameToolbarButtonDisabled";
          var STYLE_TOOLBAR_ENABLED = "divToolbarButton divFrameToolbarButton";
          var STYLE_CONTROL = "divControlButton";
          var STYLE_CONTROL_HIGHLIGHTED = STYLE_CONTROL + " divControlButtonHighlighted";
          var STYLE_MENU = "divControlMenuItem";
          var STYLE_MENU_LAST = "divControlMenuItem divControlMenuItemLast";
          var STYLE_MENU_HIGHLIGHTED = "divControlMenuItemHighlighted";
          window.onbeforeprint = function () {

          }
          window.onafterprint = function () {

          }

          function setShowTreeButtonState() {
          var showButton;
          showButton = document.getElementById('divShowTree');
          if (showButton) {
          if (parent.window.frames['frmTree']) {
          showButton.onmouseover = function () { if (this.className === STYLE_TOOLBAR_ENABLED) { this.className = STYLE_TOOLBAR_HIGHLIGHTED; } };
          showButton.onmouseout = function () { if (this.className === STYLE_TOOLBAR_HIGHLIGHTED) { this.className = STYLE_TOOLBAR_ENABLED; } };
          showButton.onclick = function () { openFrame('frmTree'); };
          if (isFrameOpen("frmTree")) {
          showButton.className = STYLE_TOOLBAR_DISABLED;
          } else {
          showButton.className = STYLE_TOOLBAR_ENABLED;
          }
          } else {
          showButton.style.display = 'none';
          }
          }
          }

          function setShowPreviewButtonState() {
          showButton = document.getElementById('divShowPreview');
          if (showButton) {
          if (parent.window.frames["frmDoc"]) {
          showButton.onmouseover = function () { if (this.className === STYLE_TOOLBAR_ENABLED) { this.className = STYLE_TOOLBAR_HIGHLIGHTED; } };
          showButton.onmouseout = function () { if (this.className === STYLE_TOOLBAR_HIGHLIGHTED) { this.className = STYLE_TOOLBAR_ENABLED; } };
          if (isFrameOpen("frmDoc") || (!parent.window.frames["frmDoc"].hasDocument()) ) {
          showButton.className = STYLE_TOOLBAR_DISABLED;
          showButton.onclick = function () { };
          } else {
          showButton.className = STYLE_TOOLBAR_ENABLED;
          showButton.onclick = function () { openFrame('frmDoc'); };
          }
          } else {
          // Hide button entirely if frame doesn't exist.
          showButton.style.display = "none";
          }
          }
          }

          function getAbsoluteTop(obj) {
          var offset;
          if (obj.nodeName === 'BODY') {
          return 0;
          } else {
          return obj.offsetTop + getAbsoluteTop(obj.offsetParent);
          }
          }
          function getAbsoluteLeft(obj) {
          var offset;
          if (obj.nodeName === 'BODY') {
          return 0;
          } else {
          return obj.offsetLeft + getAbsoluteLeft(obj.offsetParent);
          }
          }

          window.onload = function () {
          puboptionsOnLoad();
          pubtogpanelOnLoad();
          setShowTreeButtonState();
          setShowPreviewButtonState();
          showButton = document.getElementById('divOpenObject');
          if (showButton) {
          showButton.onmouseover = function () { this.className = STYLE_CONTROL_HIGHLIGHTED; };
          showButton.onmouseout = function () { this.className = STYLE_CONTROL; };
          }
          showButton = document.getElementById('divPrintProperties');
          showMenu = document.getElementById('divPrintMenu');
          if (showButton) {
          if (showMenu) {
          showButton.onmouseover = function () {
          this.className = STYLE_CONTROL_HIGHLIGHTED;
          var menu = document.getElementById('divPrintMenu');
          menu.style.display = 'block';
          menu.style.left = getAbsoluteLeft(this) + this.offsetWidth - menu.offsetWidth;
          menu.style.top = getAbsoluteTop(this) + this.offsetHeight;
          }
          showButton.onmouseout = function () {
          this.className = STYLE_CONTROL;
          var menu = document.getElementById('divPrintMenu');
          menu.style.display = 'none';
          }
          showMenu.onmouseover = function() {
          this.style.display = 'block';
          }
          showMenu.onmouseout = function() {
          this.style.display = 'none';
          }
          var subMenu = showMenu.firstChild;
          while (subMenu) {
          if (subMenu.nextSibling) {
          subMenu.className = STYLE_MENU;
          } else {
          subMenu.className = STYLE_MENU + ' ' + STYLE_MENU_LAST;
          }
          subMenu.onmouseover = function() {
          if (this.nextSibling) {
          this.className = STYLE_MENU + ' ' + STYLE_MENU_HIGHLIGHTED;
          } else {
          this.className = STYLE_MENU_LAST + ' ' + STYLE_MENU_HIGHLIGHTED;
          }
          }
          subMenu.onmouseout = function () {
          if (this.nextSibling) {
          this.className = STYLE_MENU;
          } else {
          this.className = STYLE_MENU_LAST;
          }
          }
          subMenu = subMenu.nextSibling;
          }
          showMenu.style.height =  showMenu.childNodes.length * showMenu.firstChild.style.height;
          } else {
          showButton.onmouseover = function () { this.className = STYLE_CONTROL_HIGHLIGHTED; };
          showButton.onmouseout = function () { this.className = STYLE_CONTROL; };
          showButton.onclick = printProperties;
          }
          }


          }

          function openLink(href, linkType) {
          if (linkType === "MSVisioShape") {
          window.open(href, "<xsl:value-of select="*/iServerProperties/Navigation/TargetFrame/@repository_link_shape" />");
          } else if (linkType === "MSVisioDrawing") {
          window.open(href, "<xsl:value-of select="*/iServerProperties/Navigation/TargetFrame/@repository_link_diagram" />");
          } else {
          if (parent.documentPreviewAvailable) {
          if (parent.documentPreviewAvailable()) {
          parent.openDocumentPreview(href);
          } else {
          window.open(href, "<xsl:value-of select="*/iServerProperties/Navigation/TargetFrame/@repository_link_document" />");
          }
          } else {
          window.open(href, "<xsl:value-of select="*/iServerProperties/Navigation/TargetFrame/@repository_link_document" />");
          }
          }
          }

          function openObject() {
          <xsl:choose>
            <xsl:when test="count(iServerDocument) &gt; 0">
              window.open("<xsl:value-of select="*/@ID" /><xsl:value-of select="*/iServerProperties/Ext" />", "<xsl:value-of select="*/iServerProperties/Navigation/TargetFrame/@repository_open_document" />");
            </xsl:when>
            <xsl:when test="count(iServerDiagram) &gt; 0">
              window.open("<xsl:value-of select="*/@ID" /><xsl:value-of select="*/iServerProperties/Ext" />", "<xsl:value-of select="*/iServerProperties/Navigation/TargetFrame/@repository_open_diagram" />");
            </xsl:when>
          </xsl:choose>
          }
          function openPrintReportHTML() {
          window.open('iserverdiagramreport.xml');
          }
          function openPrintReportWord() {
          window.open('<xsl:value-of select="*/@ID" />.docx');
          }
          function openPrintDiagram() {
          window.open('<xsl:value-of select="*/@ID" />_files/diagrampreview.html');
          }
          function printProperties() {
          openAllPanels(document.getElementById('pnlProperties'));
          window.print();
          }
          function frameClosed(frameID) {
          if (frameID === "frmTree") {
          setShowTreeButtonState();
          } else if (frameID === "frmDoc") {
          setShowPreviewButtonState();
          }
          }
          function openFrame(frameID) {
          if (parent.openFrame) {
          parent.openFrame(frameID);
          }
          if (frameID === "frmTree") {
          setShowTreeButtonState();
          } else if (frameID === "frmDoc") {
          setShowPreviewButtonState();
          }
          }
          function documentPreviewCleared() {
          // Accepts notification that the document preview window has been emptied
          setShowPreviewButtonState();
          }
          function documentPreviewLoaded() {
          // Accepts notification that the document preview window has been filled
          setShowPreviewButtonState();
          }
          function isFrameOpen(frameID) {
          if (parent != this) {
          if (parent.isFrameOpen) {
          return parent.isFrameOpen(frameID);
          }
          }
          }
        </script>
        <xml id="publicationOptions">
          <publicationOptions>
            <!-- option autoTogglePanels: a comma-separated list of panel ids which should be toggle-closed on load -->
            <publicationOption optionName="autoTogglePanels" optionValue="pnlIssues,pnlRelationships" />
            <!-- path to root of the publication (for location of images, scripts, etc) -->
            <publicationOption optionName="pathToRoot">
              <xsl:attribute name="optionValue">
                <xsl:value-of select="$pathToRoot" />
              </xsl:attribute>
            </publicationOption>
          </publicationOptions>
        </xml>
      </head>
      <body>
        <div class="divTopMatter">
          <div class="divToolbar">
            <div id="divShowTree" class="divToolbarButton divFrameToolbarButton">Show tree</div>
            <div id="divShowPreview" class="divToolbarButton divFrameToolbarButton">Show preview</div>
          </div>
          <div class="divHeader">
            <xsl:if test="count(*/iServerProperties/Logo) &gt; 0">
              <img style="margin-right: 4px;">
                <xsl:attribute name="src">
                  <xsl:value-of select="*/iServerProperties/Logo" />
                </xsl:attribute>
              </img>
            </xsl:if>
            <xsl:choose>
              <xsl:when test="count(iServerDocument)">
                <xsl:choose>
                  <xsl:when test="count(iServerDocument/iServerProperties/RepositoryName) = 0">
                    Unnamed Document
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="iServerDocument/iServerProperties/RepositoryName" />
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:when>
              <xsl:when test="count(iServerDiagram)">
                <xsl:choose>
                  <xsl:when test="count(iServerDiagram/iServerProperties/RepositoryName) = 0">
                    Unnamed Diagram
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="iServerDiagram/iServerProperties/RepositoryName" />
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:when>
              <xsl:when test="count(iServerFolder)">
                <xsl:choose>
                  <xsl:when test="count(iServerFolder/iServerProperties/RepositoryName) = 0">
                    Unnamed Folder
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="iServerFolder/iServerProperties/RepositoryName" />
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:when>
              <xsl:when test="count(iServerPublication)">
                <xsl:choose>
                  <xsl:when test="count(iServerPublication/PublicationProperties/Title) = 0">
                    Unnamed Publication
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="iServerPublication/PublicationProperties/Title" />
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:when>
            </xsl:choose>
          </div>
          <div class="divControls">
            <div class="divRightToolbarPortion">
              <xsl:if test="count(iServerDocument)">
                <div id="divOpenObject" onclick="openObject()" class="divControlButton">Open document</div>
              </xsl:if>
              <xsl:if test="count(iServerDiagram)">
                <div id="divOpenObject" onclick="openObject()" class="divControlButton">Open diagram</div>
              </xsl:if>
              <xsl:choose>
                <xsl:when test="count(iServerDiagram)">
                  <div id="divPrintProperties" class="divControlButton">Print options...</div>
                  <div id="divPrintMenu" class="divControlMenu">
                    <xsl:if test="$reportSettings/@html_enabled = 'true'">
                      <div id="divPrintReportHTML" class="divControlMenuItem" onclick="this.parentNode.style.display = 'none'; openPrintReportHTML();">Report (HTML)</div>
                    </xsl:if>
                    <xsl:if test="$reportSettings/@word_enabled = 'true'">
                      <div id="divPrintReportWord" class="divControlMenuItem" onclick="this.parentNode.style.display = 'none'; openPrintReportWord();">Report (Word)</div>
                    </xsl:if>
                    <xsl:if test="$reportSettings/@image_enabled = 'true'">
                      <div id="divPrintDiagram" class="divControlMenuItem divControlMenuItemLast" onclick="this.parentNode.display = 'none'; openPrintDiagram();">Diagram preview</div>
                    </xsl:if>
                  </div>
                </xsl:when>
                <xsl:otherwise>
                  <div id="divPrintProperties" class="divControlButton">Print...</div>
                </xsl:otherwise>
              </xsl:choose>
            </div>
          </div>
        </div>
        <div class="divBottomMatter">
          <div class="divBottomMatterInner">
            <xsl:apply-templates />
            <xsl:if test="count(iServerDiagram) &gt; 0">
              <div class="divPanel" id="pnlPreview">
                <div class="divPanelTitle"
                    ondblclick ="togglePanel(this.parentNode)"
                    onclick="togglePanel(this.parentNode)"
                    onmouseover="doPTMouseOver(this)"
                    onmouseout="doPTMouseOut(this)">
                  <div class="divPanelLabel">Preview</div>
                  <div class="divPanelToggler">
                    <img>
                      <xsl:attribute name="src">
                        <xsl:value-of select="$pathToRoot" />Images/panelup.gif
                      </xsl:attribute>
                    </img>
                  </div>
                </div>
                <div class="divPanelBody divPreviewPanelBody" style="width: 100%">
                  <!-- begin changed ASW March 2009 Issue #3010 -->
                  <xsl:call-template name="emitDiagramPages">
                    <xsl:with-param name="emitPage" select="1" />
                    <xsl:with-param name="totalPages">
                      <xsl:choose>
                        <xsl:when test="count(/*/iServerProperties/Pages) &gt; 0">
                          <xsl:value-of select="/*/iServerProperties/Pages/@Count" />
                        </xsl:when>
                        <xsl:otherwise>
                          <xsl:value-of select="1" />
                        </xsl:otherwise>
                      </xsl:choose>
                    </xsl:with-param>
                  </xsl:call-template>
                  <!-- end changed -->
                </div>
              </div>
            </xsl:if>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
  <!-- begin added ASW March 2009 Issue #3010 -->
  <xsl:template name="emitDiagramPages">
    <xsl:param name="emitPage" />
    <xsl:param name="totalPages" />
    <img class="imgPreview" onclick="openObject()" title="Open diagram browser" alt="Open diagram browser">
      <xsl:attribute name="src">
        <xsl:value-of select="iServerDiagram/@ID" />_files/gif_<xsl:value-of select="$emitPage" />.gif
      </xsl:attribute>
    </img>
    <xsl:if test="$emitPage &lt; $totalPages">
      <br />
      <br />
      <xsl:call-template name="emitDiagramPages">
        <xsl:with-param name="emitPage" select="$emitPage + 1" />
        <xsl:with-param name="totalPages" select="$totalPages" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>
  <!-- end added ASW -->

  <xsl:template match="Timestamp">
    <div class="divNameValPair">
      <div class="divName">
        Created
      </div>
      <div class="divValue">
        <xsl:value-of select="@CreatedOn" /> by <xsl:value-of select="@CreatedBy" />
      </div>
    </div>
    <div class="divNameValPair divNameValPairLast">
      <div class="divName">
        Last Modified
      </div>
      <div class="divValue">
        <xsl:value-of select="@LastModifiedOn" /> by <xsl:value-of select="@LastModifiedBy" />
      </div>
    </div>
  </xsl:template>

  <!-- begin added ASW March 09 Issue #4230 -->
  <xsl:template name="breakify">
    <xsl:param name="target" />
    <xsl:choose>
      <xsl:when test="contains($target, '&#xa;')">
        <xsl:value-of select="substring-before($target, '&#xa;')" />
        <br />
        <xsl:call-template name="breakify">
          <xsl:with-param name="target" select="substring-after($target, '&#xa;')" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$target" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- end added ASW -->

  <xsl:template match="iServerProperties | PublicationProperties">
    <div class="divPanel" id="pnlProperties">
      <div class="divPanelTitle"
          ondblclick ="togglePanel(this.parentNode)"
          onclick="togglePanel(this.parentNode)"
          onmouseover="doPTMouseOver(this)"
          onmouseout="doPTMouseOut(this)">
        <div class="divPanelLabel">Properties</div>
        <div class="divPanelToggler">
          <img>
            <xsl:attribute name="src">
              <xsl:value-of select="$pathToRoot" />Images/panelup.gif
            </xsl:attribute>
          </img>
        </div>
      </div>
      <div class="divPanelBody">
        <div class="divNameValPair">
          <div class="divName">
            Title
          </div>
          <div class="divValue">
            <xsl:if test="count(RepositoryName) &gt; 0">
              <xsl:value-of select="RepositoryName" />
            </xsl:if>
            <xsl:if test="count(Title) &gt; 0">
              <xsl:value-of select="Title" />
            </xsl:if>
          </div>
        </div>
        <div class="divNameValPair">
          <div class="divName">
            Description
          </div>
          <div class="divValue">
            <!-- begin changed ASW March 2009 Issue #4230 -->
            <xsl:call-template name="breakify">
              <xsl:with-param name="target" select="Description" />
            </xsl:call-template>
            <!-- end changed ASW -->
          </div>
        </div>
        <xsl:if test="count(../../iServerDocument | ../../iServerDiagram) &gt; 0">
          <div class="divNameValPair">
            <div class="divName">
              Template
            </div>
            <div class="divValue">
              <xsl:value-of select="Category" />
            </div>
          </div>
        </xsl:if>
        <div class="divNameValPair">
          <div class="divName">
            Notes
          </div>
          <div class="divValue">
            <!-- begin changed ASW March 2009 Issue #4230 -->
            <xsl:call-template name="breakify">
              <xsl:with-param name="target" select="Notes" />
            </xsl:call-template>
            <!-- end changed ASW -->
          </div>
        </div>
        <xsl:apply-templates select="Timestamp" />
      </div>
    </div>
  </xsl:template>

  <xsl:template match="Relations">
    <xsl:if test="count(Relation) &gt; 0">
      <div class="divPanel" id="pnlRelationships">
        <div class="divPanelTitle"
            ondblclick ="togglePanel(this.parentNode)"
            onclick="togglePanel(this.parentNode)"
            onmouseover="doPTMouseOver(this)"
            onmouseout="doPTMouseOut(this)">
          <div class="divPanelLabel">Relationships</div>
          <div class="divPanelToggler">
            <img>
              <xsl:attribute name="src">
                <xsl:value-of select="$pathToRoot" />Images/panelup.gif
              </xsl:attribute>
            </img>
          </div>
        </div>
        <div class="divPanelBody">
          <xsl:for-each select="Relation">
            <div class="divRelationship">
              <xsl:if test="count(Destination/Target) = 1">
                <xsl:attribute name="onclick">openLink(this.href, this.linkType)</xsl:attribute>
                <xsl:attribute name="onmouseover">doHLMouseOver(this)</xsl:attribute>
                <xsl:attribute name="onmouseout">doHLMouseOut(this)</xsl:attribute>
                <xsl:attribute name="linkType">
                  <xsl:value-of select="Destination/ApplicationType" />
                </xsl:attribute>
                <xsl:attribute name="href">
                  ../<xsl:value-of select="Destination/Target/@DocumentID" />/<xsl:value-of select="Destination/Target/@DocumentID" /><xsl:value-of select="Destination/Ext" /><xsl:if test="count(Destination/Target/@ShapeID) &gt; 0">
                    ?ShapeID=<xsl:value-of select="Destination/Target/@ShapeID" />&amp;PageID=<xsl:value-of select="Destination/Target/@PageID" />
                  </xsl:if><xsl:if test="count(Target/@BookmarkName)">
                    #<xsl:value-of select="Target/@BookmarkName" />
                  </xsl:if>
                </xsl:attribute>
              </xsl:if>
              <div class="divRelationshipTitle">
                <xsl:value-of select="Description" />
                <xsl:text> </xsl:text>
                <xsl:value-of select="Destination/Name" />
                <xsl:text> </xsl:text>
                <xsl:if test="count(Destination/Target) = 1 and Destination/ApplicationType = 'MSVisioShape'">
                  <xsl:text> in </xsl:text>
                  <xsl:value-of select="Destination/Target/@DocumentName" />
                </xsl:if>
                <xsl:if test="count(Destination/Target) &gt; 1">
                  in <xsl:value-of select="count(Destination/Target)" />
                  <xsl:if test="Destination/ApplicationType = 'MSVisioShape'"> diagrams:</xsl:if>
                  <xsl:if test="Destination/ApplicationType = 'MSWordBookmark'"> documents:</xsl:if>
                  <xsl:for-each select="Destination/Target">
                    <div class="divRelationshipDestination">
                      <xsl:attribute name="onclick">openLink(this.href, this.linkType)</xsl:attribute>
                      <xsl:attribute name="onmouseover">doHLDMouseOver(this)</xsl:attribute>
                      <xsl:attribute name="onmouseout">doHLDMouseOut(this)</xsl:attribute>
                      <xsl:attribute name="linkType">
                        <xsl:value-of select="../ApplicationType" />
                      </xsl:attribute>
                      <xsl:attribute name="href">
                        ../<xsl:value-of select="@DocumentID" />/<xsl:value-of select="@DocumentID" /><xsl:value-of select="../Ext" /><xsl:if test="count(@ShapeID) &gt; 0">
                          ?ShapeID=<xsl:value-of select="@ShapeID" />&amp;PageID=<xsl:value-of select="@PageID" />
                        </xsl:if><xsl:if test="count(@BookmarkName)">
                          #<xsl:value-of select="@BookmarkName" />
                        </xsl:if>
                      </xsl:attribute>
                      <xsl:value-of select="Name" /> in <xsl:value-of select="@DocumentName" />
                    </div>
                  </xsl:for-each>
                </xsl:if>
              </div>
              <div class="divRelationshipProperties">
                <div class="divRelationshipProperty">
                  <div class="divName">
                    Destination
                  </div>
                  <div class="divValue">
                    <xsl:value-of select="Destination/Category" />
                    <br />
                  </div>
                </div>
                <div class="divRelationshipProperty">
                  <div class="divName">
                    Reason
                  </div>
                  <div class="divValue">
                    <xsl:value-of select="Reason" />
                  </div>
                </div>
              </div>
            </div>
          </xsl:for-each>
        </div>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="InformationUsers">
    <div class="divNameValPair">
      <div class="divName">
        Information Users
      </div>
      <div class="divValue">
        <xsl:for-each select="InformationUser">
          <xsl:value-of select="@Name" />
          <xsl:if test="count(@JobTitle) &gt; 0">
            (<xsl:value-of select="JobTitle" />)
          </xsl:if>
          <xsl:if test="position() != last()">, </xsl:if>
        </xsl:for-each>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="ActionUsers">
    <div class="divNameValPair">
      <div class="divName">
        Action Users
      </div>
      <div class="divValue">
        <xsl:for-each select="ActionUser">
          <xsl:value-of select="@Name" />
          <xsl:if test="count(@JobTitle) &gt; 0">
            (<xsl:value-of select="JobTitle" />)
          </xsl:if>
          <xsl:if test="position() != last()">, </xsl:if>
        </xsl:for-each>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="Issues">
    <xsl:if test="count(Issue) &gt; 0">
      <div class="divPanel" id="pnlIssues">
        <div class="divPanelTitle"
            ondblclick ="togglePanel(this.parentNode)"
            onclick="togglePanel(this.parentNode)"
            onmouseover="doPTMouseOver(this)"
            onmouseout="doPTMouseOut(this)">
          <div class="divPanelLabel">Issues</div>
          <div class="divPanelToggler">
            <img>
              <xsl:attribute name="src">
                <xsl:value-of select="$pathToRoot" />Images/panelup.gif
              </xsl:attribute>
            </img>
          </div>
        </div>
        <div class="divPanelBody">
          <xsl:for-each select="Issue">
            <div class="divIssue">
              <div class="divIssueTitle">
                <xsl:value-of select="Name" />
              </div>
              <div class="divIssueDetails">
                <div class="divNameValPair">
                  <div class="divName">
                    Description
                  </div>
                  <div class="divValue">
                    <!-- begin changed ASW March 2009 Issue #4230 -->
                    <xsl:call-template name="breakify">
                      <xsl:with-param name="target" select="Description" />
                    </xsl:call-template>
                    <!-- end changed ASW -->
                  </div>
                </div>
                <!-- begin added ASW March 2009 Issue #4178 -->
                <div class="divNameValPair">
                  <div class="divName">
                    Category
                  </div>
                  <div class="divValue">
                    <xsl:value-of select="Category" />
                  </div>
                </div>
                <!-- end added ASW -->
                <div class="divNameValPair">
                  <div class="divName">
                    Action
                  </div>
                  <div class="divValue">
                    <xsl:value-of select="ActionType" />
                  </div>
                </div>
                <!-- begin added ASW March 2009 Issue #4178 -->
                <div class="divNameValPair">
                  <div class="divName">
                    Status
                  </div>
                  <div class="divValue">
                    <xsl:value-of select="Status" />
                  </div>
                </div>
                <div class="divNameValPair">
                  <div class="divName">
                    Priority
                  </div>
                  <div class="divValue">
                    <xsl:value-of select="Priority" />
                  </div>
                </div>
                <div class="divNameValPair">
                  <div class="divName">
                    Closed
                  </div>
                  <div class="divValue">
                    <xsl:value-of select="Closed" />
                  </div>
                </div>
                <!-- end added ASW -->
                <xsl:apply-templates select="ActionUsers" />
                <xsl:apply-templates select="InformationUsers" />
                <xsl:apply-templates select="Timestamp" />
              </div>
            </div>
          </xsl:for-each>
        </div>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="CustomAttributes">
    <xsl:if test="count(Attribute) &gt; 0">
      <div class="divPanel" id="pnlCustomAttribs">
        <div class="divPanelTitle"
            ondblclick ="togglePanel(this.parentNode)"
            onclick="togglePanel(this.parentNode)"
            onmouseover="doPTMouseOver(this)"
            onmouseout="doPTMouseOut(this)">
          <div class="divPanelLabel">Attributes</div>
          <div class="divPanelToggler">
            <img>
              <xsl:attribute name="src">
                <xsl:value-of select="$pathToRoot" />Images/panelup.gif
              </xsl:attribute>
            </img>
          </div>
        </div>
        <div class="divPanelBody">
          <xsl:for-each select="Attribute">
            <xsl:choose>
              <xsl:when test="position() = last()">
                <div class="divNameValPair divNameValPairLast">
                  <div class="divDName">
                    <xsl:value-of select="Name" />
                  </div>
                  <div class="divDValue">
                    <!-- begin changed ASW March 2009 Issue #4230 -->
                    <xsl:call-template name="breakify">
                      <xsl:with-param name="target" select="Value" />
                    </xsl:call-template>
                    <!-- end changed ASW -->
                  </div>
                  <div class="divDescription">
                    <!-- begin changed ASW March 2009 Issue #4230 -->
                    <xsl:call-template name="breakify">
                      <xsl:with-param name="target" select="Description" />
                    </xsl:call-template>
                    <!-- end changed ASW -->
                  </div>
                </div>
              </xsl:when>
              <xsl:otherwise>
                <div class="divNameValPair">
                  <div class="divDName">
                    <xsl:value-of select="Name" />
                  </div>
                  <div class="divDValue">
                    <!-- begin changed ASW March 2009 Issue #4230 -->
                    <xsl:call-template name="breakify">
                      <xsl:with-param name="target" select="Value" />
                    </xsl:call-template>
                    <!-- end changed ASW -->
                  </div>
                  <div class="divDescription">
                    <!-- begin changed ASW March 2009 Issue #4230 -->
                    <xsl:call-template name="breakify">
                      <xsl:with-param name="target" select="Description" />
                    </xsl:call-template>
                    <!-- end changed ASW -->
                  </div>
                </div>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:for-each>
        </div>
      </div>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
