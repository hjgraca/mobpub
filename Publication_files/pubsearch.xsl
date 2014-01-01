<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ms="urn:schemas-microsoft-com:xslt"
    xmlns:js="urn:orbussoftware-com:xslt-js">
  <xsl:output
      method="xml"
      omit-xml-declaration="yes" />

  <xsl:param name="searchKeywordsXML"></xsl:param>
  <xsl:param name="searchKeywords"></xsl:param>
  <xsl:param name="searchFor"></xsl:param>
  <xsl:param name="includeFolders" select="0"></xsl:param>
  <xsl:param name="includeDocuments" select="0"></xsl:param>
  <xsl:param name="includeDiagrams" select="0"></xsl:param>
  <xsl:param name="includeShapes" select="0"></xsl:param>
  <xsl:param name="searchName" select="0"></xsl:param>
  <xsl:param name="searchDescription" select="0"></xsl:param>
  <xsl:param name="searchAttributes" select="0"></xsl:param>

  <xsl:param name="ucTransFrom">abcdefghijklmnopqrstuvwxyz</xsl:param>
  <xsl:param name="ucTransTo">ABCDEFGHIJKLMNOPQRSTUVWXYZ</xsl:param>

  <ms:script language="JScript" implements-prefix="js">
    <![CDATA[  
        function echo(n) {
            return n[0].selectNodes('//K').length;
        }
        function containsKeywords(haystack, needles) {
            var o = '';
            var ks = needles[0].selectNodes('//K');
            var n;
            if (haystack[0].firstChild) {
                n = haystack[0].firstChild.nodeValue.toUpperCase();
            } else {
                return 0;
            }
            for (var i = 0; i < ks.length; i++) {
                if (n.indexOf(ks[i].firstChild.nodeValue) < 0) {
                    return 0;
                }
            }
            return 1;
        }
        
    
        function containsXML(documentlocation, needles)
        {
			var splitRe = /,/;
			var keywords = needles.toUpperCase().split(splitRe);
                    
        	xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = "false";
			//xmlDoc.onreadystatechange = readXML;
			//xmlDoc.load("49ab6eb5-c51f-4e36-9495-869897ef0d0d/iserverdiagram.xml");
			xmlDoc.load(documentlocation[0].firstChild.nodeValue);

			if (xmlDoc.readyState == 4) {
				for (var i = 0; i < xmlDoc.documentElement.childNodes.length; ++i) {
					if (xmlDoc.documentElement.childNodes[i].tagName == "CustomAttributes") {

						for (var a = 0; a < xmlDoc.documentElement.childNodes[i].childNodes.length; ++a) {

							for (var b = 0; b < xmlDoc.documentElement.childNodes[i].childNodes[a].childNodes.length; ++b) {

								// alert(xmlDoc.documentElement.childNodes[i].childNodes[a].childNodes[b].nodeTypedValue);

								if (xmlDoc.documentElement.childNodes[i].childNodes[a].childNodes[b].nodeName == "Value") {
									 for (var c = 0; c < keywords.length; c++) {
									 
										 if(xmlDoc.documentElement.childNodes[i].childNodes[a].childNodes[b].firstChild)
										 {
											var str = xmlDoc.documentElement.childNodes[i].childNodes[a].childNodes[b].nodeTypedValue.toUpperCase();
											if (str.search(keywords[c]) != -1) {
												return 1;
											}
										
							 
										}
									}
								}
							}
						}
					}
				}	
			}	
			
	        return 0;
        }
        
        function fileExists(url) {
            var srcXML = new ActiveXObject('MSXML2.DOMDocument');
            srcXML.async = false;
            if (srcXML.load(url[0].firstChild.nodeValue)) { 
                return 1;
            } else {
                return 0;
            }
        }
    ]]>
  </ms:script>

  <xsl:template match="/">
    <xsl:apply-templates select="//PublicationStructure" />
  </xsl:template>

  <xsl:template match="PublicationStructure">
    <xsl:call-template name="searchObject" />
  </xsl:template>

  <xsl:template name="testObject">
    <xsl:if test="(name() = 'Shape' and $includeShapes) or (name() = 'Folder' and $includeFolders) or (name() = 'Document' and $includeDocuments) or (name() = 'Diagram' and $includeDiagrams)">
      <xsl:variable name="objXMLLocation">
        <xsl:choose>
          <xsl:when test="name() = 'Folder'">
            <xsl:value-of select="concat(@ID, '/iserverfolder.xml')" />
          </xsl:when>
          <xsl:when test="name() = 'Document'">
            <xsl:value-of select="concat(@ID, '/iserverdocument.xml')" />
          </xsl:when>
          <xsl:when test="name() = 'Diagram'">
            <xsl:value-of select="concat(@ID, '/iserverdiagram.xml')" />
          </xsl:when>
          <xsl:when test="name() = 'Shape'">
            <xsl:value-of select="concat(../../@ID, '/', ../../@ID, '_files/', @Source)" />
          </xsl:when>
        </xsl:choose>
      </xsl:variable>



      <xsl:if test="js:fileExists($objXMLLocation)">
        <xsl:variable name="objXML" select="document($objXMLLocation)" />

        <!--
				<xsl:choose>
				
					<xsl:when test="$searchName">
						<xsl:if test="js:containsKeywords($objXML/*/iServerProperties/RepositoryName, $searchKeywordsXML)">
							<xsl:apply-templates mode="render" select=".">
								<xsl:with-param name="fullXML" select="$objXML" />
							</xsl:apply-templates>
						</xsl:if>
					</xsl:when>
					<xsl:when test="$searchDescription">
						<xsl:if test="js:containsKeywords($objXML/*/iServerProperties/Description, $searchKeywordsXML)">
							<xsl:apply-templates mode="render" select=".">
								<xsl:with-param name="fullXML" select="$objXML" />
							</xsl:apply-templates>
						</xsl:if>
					</xsl:when>
					
					<xsl:when test="$searchAttributes">
						<xsl:if test="js:containsXML($objXMLLocation,$searchKeywords)">
							<xsl:apply-templates mode="render" select=".">
								<xsl:with-param name="fullXML" select="$objXML" />
							</xsl:apply-templates>	
						</xsl:if>
					</xsl:when>
				</xsl:choose>
				-->
        <xsl:choose>
          <xsl:when test="
                    ($searchName and js:containsKeywords($objXML/*/iServerProperties/RepositoryName, $searchKeywordsXML)) or
                    ($searchDescription and js:containsKeywords($objXML/*/iServerProperties/Description, $searchKeywordsXML)) or
                    ($searchAttributes and js:containsXML($objXMLLocation,$searchKeywords))">
            <xsl:apply-templates mode="render" select=".">
              <xsl:with-param name="fullXML" select="$objXML" />
            </xsl:apply-templates>
          </xsl:when>
        </xsl:choose>
      </xsl:if>

    </xsl:if>
  </xsl:template>

  <xsl:template name="searchObject">
    <xsl:choose>
      <xsl:when test="name() = 'Folder' or name() = 'PublicationStructure'">
        <xsl:for-each select="*">
          <xsl:call-template name="testObject" />
          <xsl:call-template name="searchObject" />
        </xsl:for-each>
      </xsl:when>
      <xsl:when test="name() = 'Diagram'">
        <xsl:for-each select="document(concat(@ID, '/', 'iserverdiagram.xml'))/*/Shapes/Shape">
          <xsl:call-template name="testObject" />
        </xsl:for-each>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="Folder" mode="render">
    <div class="divItem" itemType="folder">
      <xsl:attribute name="id">
        <xsl:value-of select="@ID" />
      </xsl:attribute>
      <xsl:if test="@ID != ''">
        <xsl:attribute name="itemInfo">
          <xsl:value-of select="@ID" />/iserverfolder.xml
        </xsl:attribute>
      </xsl:if>
      <div class="divItemLabel" onmouseover="doItemMouseIn(this.parentNode)" onmouseout="doItemMouseOut(this.parentNode)">
        <div class="divIcon" onclick="doIconClick(this.parentNode.parentNode)" ondblclick="doItemDoubleClick(this.parentNode.parentNode);">
          <img src="Images/treefolder.gif" class="imgIcon" />
        </div>
        <div class="divText" onclick="doTextClick(this.parentNode.parentNode)" ondblclick="doItemDoubleClick(this.parentNode.parentNode);">
          <xsl:value-of select="@Name" />
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="Document" mode="render">
    <div class="divItem" itemType="document">
      <xsl:attribute name="id">
        <xsl:value-of select="@ID" />
      </xsl:attribute>
      <xsl:attribute name="itemInfo">
        <xsl:value-of select="@ID" />/iserverdocument.xml
      </xsl:attribute>
      <xsl:attribute name="itemDoc">
        <xsl:value-of select="@ID" />/<xsl:value-of select="@ID" /><xsl:value-of select="@Ext" />
      </xsl:attribute>
      <div class="divItemLabel" onmouseover="doItemMouseIn(this.parentNode)" onmouseout="doItemMouseOut(this.parentNode)">
        <div class="divIcon" onclick="doIconClick(this.parentNode.parentNode)" ondblclick="doItemDoubleClick(this.parentNode.parentNode);">
          <img class="imgIcon">
            <xsl:attribute name="src">
              <xsl:value-of select="@Logo" />
            </xsl:attribute>
          </img>
        </div>
        <div class="divText" onclick="doTextClick(this.parentNode.parentNode)" ondblclick="doItemDoubleClick(this.parentNode.parentNode);">
          <xsl:value-of select="@Name" />
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="Diagram" mode="render">
    <div class="divItem" itemType="diagram">
      <xsl:attribute name="id">
        <xsl:value-of select="@ID" />
      </xsl:attribute>
      <xsl:attribute name="itemInfo">
        <xsl:value-of select="@ID" />/iserverdiagram.xml
      </xsl:attribute>
      <xsl:attribute name="itemDoc">
        <xsl:value-of select="@ID" />/<xsl:value-of select="@ID" />.html
      </xsl:attribute>
      <div class="divItemLabel" onmouseover="doItemMouseIn(this.parentNode)" onmouseout="doItemMouseOut(this.parentNode)">
        <div class="divIcon" onclick="doIconClick(this.parentNode.parentNode)" ondblclick="doItemDoubleClick(this.parentNode.parentNode);">
          <img class="imgIcon">
            <xsl:attribute name="src">
              <xsl:value-of select="@Logo" />
            </xsl:attribute>
          </img>
        </div>
        <div class="divText" onclick="doTextClick(this.parentNode.parentNode)" ondblclick="doItemDoubleClick(this.parentNode.parentNode);">
          <xsl:value-of select="@Name" />
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="Shape" mode="render">
    <xsl:param name="fullXML" />
    <div class="divItem" itemType="diagram">
      <xsl:attribute name="id">
        <xsl:value-of select="../../@ID" />
      </xsl:attribute>
      <xsl:attribute name="itemInfo">
        <xsl:value-of select="../../@ID" />/iserverdiagram.xml
      </xsl:attribute>
      <xsl:attribute name="itemDoc">
        <xsl:value-of select="../../@ID" />/<xsl:value-of select="../../@ID" />.html?ShapeID=<xsl:value-of select="@ID" />&amp;PageID=<xsl:value-of select="@PageID" />
      </xsl:attribute>
      <div class="divItemLabel" onmouseover="doItemMouseIn(this.parentNode)" onmouseout="doItemMouseOut(this.parentNode)">
        <div class="divIcon" onclick="doIconClick(this.parentNode.parentNode)" ondblclick="doItemDoubleClick(this.parentNode.parentNode);">
          <img class="imgIcon" src="Images/visioshape.gif" />
        </div>
        <div class="divText" onclick="doTextClick(this.parentNode.parentNode)" ondblclick="doItemDoubleClick(this.parentNode.parentNode);">
          <xsl:value-of select="$fullXML/*/iServerProperties/RepositoryName" /> (<xsl:value-of select="$fullXML/*/iServerProperties/ShapeMaster" />) in <xsl:value-of select="../../iServerProperties/RepositoryName" />
        </div>
      </div>
    </div>
  </xsl:template>

</xsl:stylesheet>