<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:variable name="pathToRoot">../</xsl:variable>

<xsl:template match="/">
    <xsl:apply-templates select="document(concat(iServerDiagram/@ID, '/iserverdiagram.xml'))" mode="diagram">
        <xsl:with-param name="pathToData" select="concat(iServerDiagram/@ID, '/', iServerDiagram/@ID, '_files/')" />
    </xsl:apply-templates>
</xsl:template>

<xsl:template match="/" mode="diagram">
    <xsl:param name="pathToData" />
    <xsl:apply-templates mode="diagram">
        <xsl:with-param name="pathToData" select="$pathToData" />
    </xsl:apply-templates>
</xsl:template>

<xsl:template name="emitDiagramPages">
  <xsl:param name="emitPage" />
  <xsl:param name="totalPages" />
  <img class="imgPreview">
    <xsl:attribute name="src">
      <xsl:value-of select="@ID" />_files/gif_<xsl:value-of select="$emitPage" />.gif
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

<xsl:template match="iServerDiagram" mode="diagram">
  <xsl:param name="pathToData" />
  <html>
    <head>
      <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$pathToRoot" />/pubinfo-report.css
        </xsl:attribute>
      </link>
      <title>
        <xsl:value-of select="iServerProperties/RepositoryName" /> - report
      </title>
    </head>
    <body>
      <div id="content">
        <div class="divPanel" id="pnlPreview">

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
        </div>
        <xsl:apply-templates mode="diagram">
          <xsl:with-param name="pathToData" select="$pathToData" />
        </xsl:apply-templates>
      </div>
    </body>
  </html>
</xsl:template>

<xsl:template match="Timestamp" mode="diagram">
    <tr>
        <td class="name">
            Created
        </td>
        <td class="value">
            <xsl:value-of select="@CreatedOn" /> by <xsl:value-of select="@CreatedBy" />
        </td>
    </tr>
    <tr>
        <td class="name">
            Last Modified
        </td>
        <td class="value">
            <xsl:value-of select="@LastModifiedOn" /> by <xsl:value-of select="@LastModifiedBy" />
        </td>
    </tr>
</xsl:template>

<xsl:template match="iServerProperties" mode="diagram">
    <h1><xsl:value-of select="RepositoryName" /></h1>
    <h2>Diagram properties</h2>
    <table>
    <tr>
        <td class="name">
            Title
        </td>
        <td class="value">
            <xsl:if test="count(RepositoryName) &gt; 0">                    
                <xsl:value-of select="RepositoryName" />
            </xsl:if>
            <xsl:if test="count(Title) &gt; 0">
                <xsl:value-of select="Title" />
            </xsl:if>
        </td>
    </tr>
    <tr>
        <td class="name">
            Description
        </td>
        <td class="value">
            <xsl:value-of select="Description" />
        </td>
    </tr>
    <tr>
        <td class="name">
            Template
        </td>
        <td class="value">
            <xsl:value-of select="Category" />
        </td>
    </tr>
    <tr>
        <td class="name">
            Notes
        </td>
        <td class="value">
            <xsl:value-of select="Notes" />
        </td>
    </tr>
    <xsl:apply-templates select="Timestamp" mode="diagram" />
    </table>
</xsl:template>

<xsl:template match="Relations" mode="diagram" />

<xsl:template match="Issues" mode="diagram" />

<xsl:template match="CustomAttributes" mode="diagram">
    <xsl:if test="count(Attribute) &gt; 0">
        <h2>Attributes</h2>
        <table>
        <xsl:for-each select="Attribute">
                <tr>
                    <td class="name">
                        <xsl:value-of select="Name" />
                    </td>
                    <td class="value">
                        <xsl:value-of select="Value" /><br />
                        <span class="description">
                            <xsl:value-of select="Description" />
                        </span>
                    </td>
                </tr>
        </xsl:for-each>
        </table>
    </xsl:if>
</xsl:template>

  
<xsl:template match="Shapes" mode="diagram">
    <xsl:param name="pathToData" />
    <h2>Shapes</h2>
    <xsl:apply-templates select="Shape" mode="diagram">
      <xsl:with-param name="pathToData" select="$pathToData" /> 
    </xsl:apply-templates>
  
  </xsl:template>

  
  <xsl:template match="Shape" mode="diagram">
    <xsl:param name="pathToData" />
    <xsl:apply-templates select="document(concat($pathToData, @Source))/Shape" mode="shape" />
</xsl:template>

  
<!-- Ignore dimensions -->
<xsl:template match="Dimensions" mode="shape" /> 
  
<xsl:template match="iServerProperties" mode="shape">
    <h3><xsl:if test="count(ShapeMaster)">
      <xsl:value-of select="ShapeMaster" />: </xsl:if><xsl:value-of select="RepositoryName" /></h3>
</xsl:template>


<xsl:template match="Relations" mode="shape" />

<xsl:template match="Issues" mode="shape" />

<xsl:template match="CustomAttributes" mode="shape">
    <xsl:choose>
        <xsl:when test="count(Attribute) &gt; 0">
            <table>
            <xsl:for-each select="Attribute">
                    <tr>
                        <td class="name">
                            <xsl:value-of select="Name" />
                        </td>
                        <td class="value">
                            <xsl:value-of select="Value" /><br />
                            <span class="description">
                                <xsl:value-of select="Description" />
                            </span>
                        </td>
                    </tr>
            </xsl:for-each>
            </table>
        </xsl:when>
        <xsl:otherwise>
        <span style="color: #666">No attributes</span>
			
        </xsl:otherwise>
    </xsl:choose>
</xsl:template>

</xsl:stylesheet>
