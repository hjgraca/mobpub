<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="iServerPublication">
<html>
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />
        <title>Publisher</title>
        <link rel="stylesheet" href="pubtree.css" type="text/css" />
        <script language="jscript" type="text/jscript" src="pubtree.js"></script>
        <script language="jscript" type="text/jscript" src="puboptions.js"></script>
        <xml id="publicationOptions">
            <publicationOptions>
                <!-- This must be unique across any trees likely to be loaded in the same session,
                    specifically between the category- and stucture-view trees -->
                <publicationOption optionName="treeStateID">
                    <xsl:attribute name="optionValue">
                        <xsl:value-of select="$treeStateID" />
                    </xsl:attribute>
                </publicationOption>
            </publicationOptions>
        </xml>
    </head>
    <body onload="puboptionsOnLoad(); pubtreeOnLoad();" onunload="puboptionsOnUnload(); pubtreeOnUnload();">
        <div class="divTree" id="tree">
            <xsl:apply-templates />
        </div>
    </body>
</html>
</xsl:template>

<xsl:template match="PublicationProperties">
</xsl:template>

<xsl:template match="PublicationStructure">
    <div class="divItem" id="idPublication" itemType="publication" itemInfo="publicationproperties.xml">
        <div class="divPlusMinus" onclick="doPMClick(this.parentNode)" ondblclick="doPMClick(this.parentNode)">
            <img src="Images/treeminus.gif" class="imgPlusMinus" />
        </div>
        <div class="divItemLabel" onmouseover="doItemMouseIn(this.parentNode)" onmouseout="doItemMouseOut(this.parentNode)">
            <div class="divIcon" onclick="doIconClick(this.parentNode.parentNode)"><img src="Images/treefolder.gif" class="imgIcon" /></div>
            <div class="divText" onclick="doTextClick(this.parentNode.parentNode)"><xsl:value-of select="../PublicationProperties/Title" /> (<xsl:value-of select="$viewName" />)</div>
        </div>
        <div class="divSubitems">
            <xsl:apply-templates />
        </div>
    </div>
</xsl:template>

<xsl:template match="Folder">
    <div class="divItem" itemType="folder">
        <xsl:attribute name="id">
            <xsl:value-of select="@ID" />
        </xsl:attribute>
        <xsl:if test="@ID != ''">
            <xsl:attribute name="itemInfo">
                <xsl:value-of select="@ID" />/iserverfolder.xml
            </xsl:attribute>
        </xsl:if>
        <xsl:choose>
            <xsl:when test="count(Document | Diagram | Folder) &gt; 0">
                <div class="divPlusMinus" onclick="doPMClick(this.parentNode)" ondblclick="doPMClick(this.parentNode)">
                    <img src="Images/treeplus.gif" class="imgPlusMinus" />
                </div>
            </xsl:when>
            <xsl:otherwise>
                <div class="divPlusMinus">
                </div>
            </xsl:otherwise>
        </xsl:choose>
        <div class="divItemLabel" onmouseover="doItemMouseIn(this.parentNode)" onmouseout="doItemMouseOut(this.parentNode)">
            <div class="divIcon" onclick="doIconClick(this.parentNode.parentNode)"><img src="Images/treefolder.gif" class="imgIcon" /></div>
            <div class="divText" onclick="doTextClick(this.parentNode.parentNode)"><xsl:value-of select="@Name" /></div>
        </div>
        <xsl:if test="count(Document | Diagram | Folder) &gt; 0">
            <div class="divHiddenSubitems">
                <xsl:apply-templates />
            </div>
        </xsl:if>
    </div>
</xsl:template>

<xsl:template match="Document">
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
        <div class="divPlusMinus">
            <!--<img src="Images/treeplus.gif" class="imgPlusMinus">-->
        </div>
        <div class="divItemLabel" onmouseover="doItemMouseIn(this.parentNode)" onmouseout="doItemMouseOut(this.parentNode)">
            <div class="divIcon" onclick="doIconClick(this.parentNode.parentNode)"><img class="imgIcon"><xsl:attribute name="src"><xsl:value-of select="@Logo" /></xsl:attribute></img></div>
            <div class="divText" onclick="doTextClick(this.parentNode.parentNode)"><xsl:value-of select="@Name" /></div>
        </div>
    </div>
</xsl:template>

<xsl:template match="Diagram">
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
        <div class="divPlusMinus">
            <!--<img src="Images/treeplus.gif" class="imgPlusMinus">-->
        </div>
        <div class="divItemLabel" onmouseover="doItemMouseIn(this.parentNode)" onmouseout="doItemMouseOut(this.parentNode)">
            <div class="divIcon" onclick="doIconClick(this.parentNode.parentNode)"><img class="imgIcon"><xsl:attribute name="src"><xsl:value-of select="@Logo" /></xsl:attribute></img></div>
            <div class="divText" onclick="doTextClick(this.parentNode.parentNode)"><xsl:value-of select="@Name" /></div>
        </div>
    </div>
</xsl:template>
    
</xsl:stylesheet>
