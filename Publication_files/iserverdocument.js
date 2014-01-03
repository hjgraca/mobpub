
var MENU_TIMEOUT = 10000; // length of time in milliseconds that menus will stay open
var DEFAULT_METADATA_INDICATORS = [
    true,       // RESERVED (No effect)
    true,       // Mark shapes with issues?
    true,       // Mark shapes with links to documents?
    true        // Mark shapes with links to diagrams?
    ];

/*
  NO USER EDITABLE CONTENT BELOW THIS LINE
*/

var menuTimer = null;

var queryString = window.location.search.substring(1);
var link = new ShapeLink(queryString);

function CreateDocument(xmlNode)
{
    if (xmlNode != null) {
        var document = new iServerDocument (xmlNode);
    }
    return document;
}

function iServerDocument (xmlNode)
{
    this.iServerID = null;
    this.Properties = null;
    this.CustomAttributes = [];
    this.Issues = [];
    this.Hyperlinks = [];
    this.Relations = [];
    this.Shapes = [];
    this.Pages = [];    // WARNING: This comes from the iServerProperties block, but is represented in this object
    this.IssueWindow = null;
    this.CurrentIssue = null;
    this.CurrentShapePageID = null;
    this.CurrentShapeShapeID = null;

    if (xmlNode != null)
    {
        
        var iserverid = xmlNode.selectSingleNode("iServerDiagram").attributes.getNamedItem("ID");
        if (iserverid != null && iserverid.text.length > 0)
        {
            this.iServerID = ReplaceSymbols (iserverid.text);
        } else {
            this.iServerID = "";
        }           
    
        var properties = xmlNode.selectSingleNode("iServerDiagram/iServerProperties");
        if (properties != null)
        {
            this.Properties = new Properties(properties);
        }
        
        var issues = xmlNode.selectSingleNode("iServerDiagram/Issues");
        if (issues != null)
        {
            var theseissues = [];
            for (var nTag = 0; nTag < issues.childNodes.length; nTag++) {
                theseissues[theseissues.length] = new Issue(issues.childNodes[nTag]);
            }
            this.Issues = theseissues;
        }
        
        var attributes = xmlNode.selectSingleNode("iServerDiagram/CustomAttributes");
        if (attributes != null)
        {
            var customattributes = [];
            for (var nTag = 0; nTag < attributes.childNodes.length; nTag++) {
                customattributes[customattributes.length] = new CustomAttribute(attributes.childNodes[nTag]);
            }
            this.CustomAttributes = customattributes;
        }
        
        var shapes = xmlNode.selectSingleNode("iServerDiagram/Shapes");
        if (shapes != null)
        {
            var theseshapes = [];
            for (var nTag = 0; nTag < shapes.childNodes.length; nTag++) {
                theseshapes[theseshapes.length] = new Shape(shapes.childNodes[nTag]);
            }
            this.Shapes = theseshapes;
        }
        
        var relations = xmlNode.selectSingleNode('iServerDiagram/Relations');
        if (relations != null) {
            this.Relations = [];
            for (var nTag = 0; nTag < relations.childNodes.length; nTag++) {
                this.Relations[this.Relations.length] = new Relation(relations.childNodes[nTag]);
            }
        }
        
        var pages = xmlNode.selectSingleNode('iServerDiagram/iServerProperties/Pages');
        if (pages) {
            this.Pages = [];
            for (var nTag = 0; nTag < pages.childNodes.length; nTag++) {
                var p = new Page(pages.childNodes[nTag]);
                this.Pages[p.ID] = p;
            }
        }
            
    }

}

function Properties (xmlNode) {

    this.RepositoryName = null;
    this.Description = null;
    this.Timestamp = null;
    this.Category = null;
    this.Logo = null;
    this.Owner = null;
    this.ShapeMaster = null;
        // WARNING:  The Pages tag from this block is represented in the document
    
    if (xmlNode != null)
    {

        var name = xmlNode.selectSingleNode("RepositoryName");
        if (name != null && name.text.length > 0)
        {
            this.RepositoryName = ReplaceSymbols (name.text);
        } else {
            this.RepositoryName = "";
        }

        var desc = xmlNode.selectSingleNode("Description");
        if (desc != null && desc.text.length > 0)
        {
            this.Description = ReplaceSymbols (desc.text);
        } else {
            this.Description = "";
        }

        var timestamp = new Timestamp(xmlNode.selectSingleNode("Timestamp"));
        if (timestamp != null)
        {
            this.Timestamp = timestamp;
        }
        
        // Only shapes have a ShapeMaster node
        var shapeMaster = xmlNode.selectSingleNode("ShapeMaster");
        if (shapeMaster != null && shapeMaster.text.length > 0) {
            this.ShapeMaster = ReplaceSymbols (shapeMaster.text);
        } else {
            this.ShapeMaster = '';
        }

        //Shapes do not have a category node
        var category = xmlNode.selectSingleNode("Category");
        if (category != null && category.text.length > 0)
        {
            this.Category = ReplaceSymbols (category.text);
        } else {
            this.Category = "";
        }    

        //Shapes do not have a logo node        
        var logo = xmlNode.selectSingleNode("Logo");
        if (logo != null && logo.text.length > 0)
        {
            this.Logo = ReplaceSymbols (logo.text);
        } else {
            this.Logo = "";
        }    

        //Shapes do not have an owner node
        var OwnerNode = xmlNode.selectSingleNode("Owner")
        if (OwnerNode != null)
        {
            var owner = new Owner(xmlNode.selectSingleNode("Owner"));
            if (owner != null)
            {
                this.Owner = owner;
            }
        }                    
    }
}

function Owner (xmlNode)
{
    this.UserID = null;
    this.Name = null;
    this.Email = null;
    
    var id = xmlNode.attributes.getNamedItem ("UserID");
    if (id != null && id.text.length > 0)
    {
        this.UserID = ReplaceSymbols (id.text);
    } else {
        this.UserID = "";
    }

    var name = xmlNode.attributes.getNamedItem ("Name");
    if (name != null && name.text.length > 0)
    {
        this.Name = ReplaceSymbols (name.text);
    } else {
        this.Name = "";
    }
            
    var email = xmlNode.attributes.getNamedItem ("Email");
    if (email != null && email.text.length > 0)
    {
        this.Email = ReplaceSymbols (email.text);
    } else {
        this.Email = "";
    }

}

function Timestamp (xmlNode)
{
    this.CreatedOn = null;
    this.CreatedBy = null;
    this.LastModifiedOn = null;
    this.LastModifiedBy = null;

    if (xmlNode != null)
    {
        var createdOn = xmlNode.attributes.getNamedItem ("CreatedOn");
        if (createdOn != null && createdOn.text.length > 0)
        {
            this.CreatedOn = ReplaceSymbols (createdOn.text);
        } else {
            this.CreatedOn = "Unknown";
        }

        var createdBy = xmlNode.attributes.getNamedItem ("CreatedBy");
        if (createdBy != null && createdBy.text.length > 0)
        {
            this.CreatedBy = ReplaceSymbols (createdBy.text);
        } else {
            this.CreatedBy = "Unknown";
        }

        var lastModifiedOn = xmlNode.attributes.getNamedItem ("LastModifiedOn");
        if (lastModifiedOn != null && lastModifiedOn.text.length > 0)
        {
            this.LastModifiedOn = ReplaceSymbols (lastModifiedOn.text);
        } else {
            this.LastModifiedOn = "Unknown";
        }

        var lastModifiedBy = xmlNode.attributes.getNamedItem ("LastModifiedBy");
        if (lastModifiedBy != null && lastModifiedBy.text.length > 0)
        {
            this.LastModifiedBy = ReplaceSymbols (lastModifiedBy.text);
        } else {
            this.LastModifiedBy = "Unknown";
        }
    }
}

function Issue (xmlNode)
{
    this.Name = null;
    this.Description = null;
    this.Category = null;
    this.ActionType = null;
    this.Priority = null;
    this.Status = null;
    this.Closed = null;
    this.Timestamp = null;
    this.ActionUsers = [];
    this.InformationUsers = [];

    if (xmlNode != null)
    {
        var name = xmlNode.selectSingleNode("Name");
        if (name != null && name.text.length > 0)
        {
            this.Name = ReplaceSymbols (name.text);
        } else {
            this.Name = "";
        }
        var desc = xmlNode.selectSingleNode("Description");
        if (desc != null && desc.text.length > 0)
        {
            this.Description = ReplaceSymbols (desc.text);
        } else {
            this.Description = "";
        }
        var category = xmlNode.selectSingleNode("Category");
        if (category != null && category.text.length > 0)
        {
            this.Category = ReplaceSymbols (category.text);
        } else {
            this.Category = "";
        }
        var actiontype = xmlNode.selectSingleNode("ActionType");
        if (actiontype != null && actiontype.text.length > 0)
        {
            this.ActionType = ReplaceSymbols (actiontype.text);
        } else {
            this.ActionType = "";
        }
        var priority = xmlNode.selectSingleNode("Priority");
        if (priority != null && priority.text.length > 0)
        {
            this.Priority = ReplaceSymbols (priority.text);
        } else {
            this.Priority = "";
        }
        var status = xmlNode.selectSingleNode("Status");
        if (status != null && status.text.length > 0)
        {
            this.Status = ReplaceSymbols (status.text);
        } else {
            this.Status = "";
        }
        var closed = xmlNode.selectSingleNode("Closed");
        if (closed != null && closed.text.length > 0)
        {
            this.Closed = ReplaceSymbols (closed.text);
        } else {
            this.Closed = "";
        }
        var timestamp = new Timestamp(xmlNode.selectSingleNode("Timestamp"));
        if (timestamp != null)
        {
            this.Timestamp = timestamp;
        }

        var informationusers = [];
        var infousersnode = xmlNode.selectSingleNode("InformationUsers");
        if (infousersnode != null)
        {
            for (var nTag = 0; nTag < infousersnode.childNodes.length; nTag++) {

                informationusers[informationusers.length] = new User(infousersnode.childNodes[nTag]);
            }
            this.InformationUsers = informationusers;
        }

        var actionusers = [];
        var actionusersnode = xmlNode.selectSingleNode("ActionUsers");
        if (actionusersnode != null)
        {
            for (var nTag = 0; nTag < actionusersnode.childNodes.length; nTag++) {

                actionusers[actionusers.length] = new User(actionusersnode.childNodes[nTag]);
            }
            this.ActionUsers = actionusers;
        }
    }
}

function CustomAttribute (xmlNode)
{
    this.Name = null;
    this.Description = null;
    this.Value = null;
    this.DataType = null;

    if (xmlNode != null)
    {
        var name = xmlNode.selectSingleNode("Name");
        if (name != null && name.text.length > 0)
        {
            this.Name = ReplaceSymbols (name.text);
        } else {
            this.Name = "";
        }
        var desc = xmlNode.selectSingleNode("Description");
        if (desc != null && desc.text.length > 0)
        {
            this.Description = ReplaceSymbols (desc.text);
        } else {
            this.Description = "";
        }
        var value = xmlNode.selectSingleNode("Value");
        if (value != null && value.text.length > 0)
        {
            this.Value = ReplaceSymbols (value.text);
        } else {
            this.Value = "";
        }
        var datatype = xmlNode.selectSingleNode("DataType");
        if (datatype != null && datatype.text.length > 0)
        {
            this.DataType = ReplaceSymbols (datatype.text);
        } else {
            this.DataType = "";
        }
    }
}

function RelationTarget(destName, destType, destExt, xmlNode) {
    this.Title = null;
    this.URL = null;

    // Build URL    
    var id = xmlNode.selectSingleNode('@DocumentID').text;
    this.URL = id + '/' + id + destExt;
    var pidnode = xmlNode.selectSingleNode('@PageID')
    var sidnode = xmlNode.selectSingleNode('@ShapeID');
    var bmnode = xmlNode.selectSingleNode('@BookmarkName');
    if (pidnode && sidnode) {
        this.URL = this.URL + '?PageID=' + pidnode.text + '&ShapeID=' + sidnode.text;
    }
    if (bmnode) {
        this.URL = this.URL + '#' + bmnode.text;
    }
    
    var subname = xmlNode.selectSingleNode('@DocumentName').text;
    if (destType == 'MSVisioShape' || destType == 'MSWordBookmark') {
        this.Title = destName + ' in ' + subname;
    } else {
        this.Title = destName;
    }
}

function Relation (xmlNode)
{
    this.Title = null;
    this.DestName = null;
    this.DestType = null;
    this.DestExt = null;
    this.Reason = null;
    this.Description = null;
    this.Targets = [];
    if (xmlNode != null)
    {  
        var desc = xmlNode.selectSingleNode('Description');
        if (desc != null && desc.text.length > 0) {
            this.Description = ReplaceSymbols(desc.text);
        } else {
            this.Description = '';
        }
        
        var reason = xmlNode.selectSingleNode('Reason');
        if (desc != null && desc.text.length > 0) {
            this.Reason = ReplaceSymbols(reason.text);
        } else {
            this.Reason = '';
        }
        var dest = xmlNode.selectSingleNode('Destination');
        this.DestName = dest.selectSingleNode('Name').text;
        this.DestType = dest.selectSingleNode('ApplicationType').text;
        this.DestExt = dest.selectSingleNode('Ext').text;
        var targets = dest.selectNodes('Target');
        if (targets) {
            for (var i = 0; i < targets.length; i++) {                    
                this.Targets[this.Targets.length] = new RelationTarget(this.DestName, this.DestType, this.DestExt, targets[i]);
            }
        }
        this.Title = this.Description + ' ' + this.DestName;
    }        
}

function Dimension(xmlNode) {
    if (xmlNode) {
        this.Unit = xmlNode.selectSingleNode('@Unit').value;
        this.Value = parseFloat(xmlNode.text);
    }
}
function Dimensions(xmlNode) {
    this.Width = new Dimension(xmlNode.selectSingleNode('Width'));
    this.Height = new Dimension(xmlNode.selectSingleNode('Height'));
    this.Top = new Dimension(xmlNode.selectSingleNode('Top'));
    this.Left = new Dimension(xmlNode.selectSingleNode('Left'));
    this.Bottom = new Dimension(xmlNode.selectSingleNode('Bottom'));
    this.Right = new Dimension(xmlNode.selectSingleNode('Right'));
}

function Page(xmlNode) {
    var idNode = xmlNode.selectSingleNode('@ID');
    if (idNode) {
        this.ID = idNode.value;
    }
    var dimsNode = xmlNode.selectSingleNode('Dimensions');
    this.Dimensions = new Dimensions(dimsNode);
}

function Shape (xmlNode)
{
    this.ShapeID = null;
    this.PageID = null;
    this.isRelationship = false;
    this.iServerID = null;
    this.XMLSource = null;
    this.Properties = null;
    this.CustomAttributes = [];
    this.Issues = [];
    this.Hyperlinks = [];
    this.Relations = [];
    this.Dimensions = null;
    this.loadedInFull = false;
    this.gotIssues = false;
    this.gotDocLinks = false;
    this.gotDiagLinks = false;
    
    this.update = function (xmlNode) {

       if (xmlNode != null)
        {

            this.gotIssues = (xmlNode.attributes.getNamedItem("Issues") && (xmlNode.attributes.getNamedItem("Issues")).text === "Y");
            this.gotDocLinks = (xmlNode.attributes.getNamedItem("DocLinks") && (xmlNode.attributes.getNamedItem("DocLinks")).text === "Y");
            this.gotDiagLinks = (xmlNode.attributes.getNamedItem("DiagLinks") && (xmlNode.attributes.getNamedItem("DiagLinks")).text === "Y");

            var id = xmlNode.attributes.getNamedItem ("ID");
            if (id != null && id.text.length > 0)
            {
                this.ShapeID = ReplaceSymbols (id.text);
            } else {
                this.ShapeID = "";
            }

            var pageid = xmlNode.attributes.getNamedItem ("PageID");
            if (pageid != null && pageid.text.length > 0)
            {
                this.PageID = ReplaceSymbols (pageid.text);
            } else {
                this.PageID = "";
            }
            
            var isrelationship = xmlNode.attributes.getNamedItem ("IsRelationship");
            if (isrelationship != null && isrelationship.text.length > 0)
            {
                if (isrelationship.text == "Y")
                {
                    this.isRelationship = true;
                }
                else
                {
                    this.isRelationship = false;
                }
            } else {
                this.isRelationship = false;
            }           

            var iserverid = xmlNode.attributes.getNamedItem ("ObjectID");           
            if (iserverid != null && iserverid.text.length > 0)
            {
                this.iServerID = ReplaceSymbols (iserverid.text);
            } else {
                this.iServerID = "";
            }           
            
            var source = xmlNode.attributes.getNamedItem("Source");
            if (source != null && source.text.length > 0)
            {
                this.Source = source.text;
            }

            var properties = xmlNode.selectSingleNode("iServerProperties");
            if (properties != null)
            {
                this.Properties = new Properties(properties);
            }

            var issues = xmlNode.selectSingleNode("Issues");
            if (issues != null)
            {
                var theseissues = [];
                for (var nTag = 0; nTag < issues.childNodes.length; nTag++) {
                    theseissues[theseissues.length] = new Issue(issues.childNodes[nTag]);
                }
                this.Issues = theseissues;
            }

            var attributes = xmlNode.selectSingleNode("CustomAttributes");
            if (attributes != null)
            {
                var customattributes = [];
                for (var nTag = 0; nTag < attributes.childNodes.length; nTag++) {
                    customattributes[customattributes.length] = new CustomAttribute(attributes.childNodes[nTag]);
                }
                this.CustomAttributes = customattributes;
            }
            var relations = xmlNode.selectSingleNode('Relations');
            if (relations != null) {
                this.Relations = [];
                for (var nTag = 0; nTag < relations.childNodes.length; nTag++) {
                    this.Relations[this.Relations.length] = new Relation(relations.childNodes[nTag]);
                }
            }
     
            var dimensions = xmlNode.selectSingleNode('Dimensions');
            if (dimensions != null) {
                this.Dimensions = new Dimensions(dimensions);
            }
            
        }
    }

    this.loadXML = function () {
        if (this.Source) {
            var shapePath = DiagramPath + "/"   + this.Source;
            var shapeXML = XMLData(shapePath);
            if (shapeXML) {
                this.update(shapeXML.documentElement);
                this.loadedInFull = true;
            }
        }
    }

    this.update(xmlNode);
}

function User (xmlNode)
{
    this.Name = null;
    this.JobTitle = null;

    if (xmlNode != null)
    {

        var name = xmlNode.attributes.getNamedItem ("Name");
        if (name != null && name.text.length > 0)
        {
            this.Name = ReplaceSymbols (name.text);
        } else {
            this.Name = "Unknown";
        }
        var jobtitle = xmlNode.attributes.getNamedItem ("JobTitle");
        if (jobtitle != null && jobtitle.text.length > 0)
        {
            this.JobTitle = ReplaceSymbols (jobtitle.text);
        } else {
            this.JobTitle = "Unknown";
        }
    }
}

function getShape(pageID, shapeID)
{
    var shapes = iServerData.Shapes;

    for (var nTag = 0; nTag < shapes.length; nTag++) {

        if ((shapes[nTag].PageID == pageID) && (shapes[nTag].ShapeID == shapeID))
        {
            return shapes[nTag];
        }
    }
    return null;
}

function ItemExists (item)
{
    return ((item != null) && (item.length > 0));
}

/* Menu timeout */
function renewMenuTimer() {
    if (menuTimer != null) {
        setMenuTimer();
    }
}
function cancelMenuTimer() {
    clearTimeout(menuTimer);
    menuTimer = null;
}
function setMenuTimer() {
    cancelMenuTimer();
    menuTimer = setTimeout(clickMenu, MENU_TIMEOUT);
}

var arrLinkCatsHTML = []

function ShowLinkCategoriesMenu() {
    goiServerMenu("menu2");
}

function ShowLinkCategory(linkType) {

    window.frmDrawing.menu3.innerHTML = arrLinkCatsHTML[linkType];
    goiServerMenu("menu3");
}

function linkTypeToName(type) {
    if (type === 'MSVisioDiagram') {
        return 'Diagram';
    } else if (type === 'MSVisioShape') {
        return 'Shape';
    } else {
        return 'Document';
    }
}

function ShowiServerPage ()
{
    //CREATE POPUP MENUS

    // Determine targets for links
    var diagramTarget = "_top";
    var shapeTarget = "_top";
    var documentTarget = "_top"; 
    var targetFrameNodes = parent.PublicationPropertiesData.getElementsByTagName('TargetFrame');
    if (targetFrameNodes(0)) {
        diagramTarget = targetFrameNodes(0).getAttribute("diagram_link_diagram");
        shapeTarget = targetFrameNodes(0).getAttribute("diagram_link_shape");
        documentTarget = targetFrameNodes(0).getAttribute("diagram_link_document");
    }
    
    clickMenu();
    
    var count = 0;
    striServerHTML = "";
    
    count++;
    
    striServerHTML += "<table onmousemove='parent.renewMenuTimer()' class='popupDiagramTable' id='table1'>";
    strLinkTypesHTML = striServerHTML;
    strLinkCatBaseHTML = striServerHTML;
    arrLinkCatsHTML = [];
    
    striServerHTML += "<tr><td class='popupDiagramHeader'><table cellpadding='0' width='100%' id='tableheader'><td class='popupDiagramHeader' width='90%'><strong>" + iServerData.Properties.RepositoryName + "</strong><td width='10%' align='center' valign='middle'><img src='../../Images/closeframe.gif' border='0'/></td></table></td></tr>";
    striServerHTML += "<tr><td class='popupShapeTdMouseoverNoLink'><img src='../../Images/visio.gif' border='0'/>&nbsp;&nbsp;Type: <strong>" + iServerData.Properties.Category + "</strong></td></tr>";

    strLinkTypesHTML += "<tr><td class='popupDiagramHeader'><table cellpadding='0' width='100%' id='tableheader'><td class='popupDiagramHeader' width='90%'><strong>Relationship Types</strong><td width='10%' align='center' valign='middle'><img src='../../Images/closeframe.gif' border='0'/></td></table></td></tr>";
    strLinkCatBaseHTML += "<tr><td class='popupDiagramHeader'><table cellpadding='0' width='100%' id='tableheader'><td class='popupDiagramHeader' width='90%'><strong>Relationships</strong><td width='10%' align='center' valign='middle'><img src='../../Images/closeframe.gif' border='0'/></td></table></td></tr>";
    if (iServerData.Relations.length < 1) 
    {

    } else {
    
        var firstTierLinks = -1;  // Default to full three-tier menus always
        var popupMenuNodes = PublicationPropertiesData.getElementsByTagName('PopupMenu');
        if (popupMenuNodes(0)) {
            firstTierLinks = popupMenuNodes(0).getAttribute('first_tier_links');
        }
    
        var linkTypeExistsFunction;
        var newLinkTypeFunction;
        var addLinkFunction;
    
        if (iServerData.Relations.length > firstTierLinks) {
            // Links will be shown in submenus
            striServerHTML += "<tr><td class='popupDiagramTdMouseout' onmouseover='this.className=\"popupDiagramTdMouseover\"' onmouseout='this.className=\"popupDiagramTdMouseout\"' onclick='parent.ShowLinkCategoriesMenu()'><img src='../../Images/treeunknownfile.gif' border='0'/>&nbsp;&nbsp;Relationships</td></tr>";
    
            linkTypeExistsFunction = function (type) {
                return arrLinkCatsHTML[linkTypeToName(type)];
            }
            newLinkTypeFunction = function (linktype) {
                arrLinkCatsHTML[linkTypeToName(linktype)] = strLinkCatBaseHTML;
                strLinkTypesHTML += "<tr><td class='popupDiagramTdMouseout' onmouseover='this.className=\"popupDiagramTdMouseover\"' onmouseout='this.className=\"popupDiagramTdMouseout\"' onclick='parent.ShowLinkCategory(\"" + linkTypeToName(linktype) + "\")' ><img src='../../Images/treeunknownfile.gif' border='0'/>&nbsp;&nbsp;" + linkTypeToName(linktype) + "</td></tr>";
            }
            addLinkFunction = function (linktype, html) {
                arrLinkCatsHTML[linkTypeToName(linktype)] += html;
            }
    
        } else {
            // Links will be shown in main menu
    
            linkTypeExistsFunction = function (type) {
                return true;
            }
            newLinkTypeFunction = function (type) {
            }
            addLinkFunction = function (type, html) {
                striServerHTML += html;
            }
        }
    
        for (var rcount = 0; rcount < iServerData.Relations.length; rcount++) {
        
            var curRel = iServerData.Relations[rcount];
            
            // Determine icon filename
            var relIcon = 'treeunknownfile.gif';
            var relIcon = 'treeunknownfile.gif';
            if (curRel.DestType == 'MSVisioShape') {
                relIcon = 'visio.gif';
            } else if (curRel.DestType == 'MSVisioDiagram') {
                relIcon = 'visiodiagram.gif';
            } else if ((curRel.DestType == 'MSWord') || (curRel.DestType == 'MSWordBookmark')) {
                relIcon = 'word.gif';
            } else if (curRel.DestType == 'MSPowerpoint') {
                relIcon = 'powerpoint.gif';
            } else if (curRel.DestType == 'MSExcel') {
                relIcon = 'excel.gif';
            }
            
            // Determine display text
            var relText = curRel.Title;
            
            // Determine display URL
            relURL = curRel.Targets[0].URL;
            
            // Determine display target
            var relTarget = '';
            if (curRel.DestType == 'MSVisioDiagram') {
                relTarget = diagramTarget;
            } else if (curRel.DestType == 'MSVisioShape') {
                relTarget = shapeTarget;
            } else {
                relTarget = documentTarget;
            }

            // Construct HTML                
            var relHTML = "<tr><td class='popupDiagramTdMouseout' title='" + curRel.Reason + "'";
            if (curRel.Targets.length < 2) {
                relHTML += "onmouseover='this.className=\"popupDiagramTdMouseover\"' onmouseout='this.className=\"popupDiagramTdMouseout\"' onclick='this.firstChild.click()'";
            }
            relHTML += '>';

            if (curRel.Targets.length < 2) {
                relHTML += "<a style=\"text-decoration: none;\" href=\"../../" + relURL + "\" target=\"" + relTarget + "\"";
                if (relTarget == 'frmdocument') {
                    relHTML += " onclick=\"parent.notifyPreviewPane('" + relURL + "');\"";
                }
                relHTML += '>';
                relHTML += "<img src='../../Images/" + relIcon + "' border='0'/>&nbsp;&nbsp;";
            }
            relHTML += relText;
            if (curRel.Targets.length < 2) {
                relHTML += "</a>";
            }
            relHTML += "</td></tr>";

            if (!linkTypeExistsFunction(curRel.DestType)) {
                newLinkTypeFunction(curRel.DestType);
            }
            addLinkFunction(curRel.DestType, relHTML);
            
            // If more than one destination, then generate those too
            if (curRel.Targets.length > 1) {
                for (var dCount = 0; dCount < curRel.Targets.length; dCount++) {

                    var relURL = curRel.Targets[dCount].URL;
                    var relText = curRel.Targets[dCount].Title;

                    // Construct HTML
                    var relHTML = "<tr><td class='popupDiagramTdMouseout' style='padding-left: 12px;' onmouseover='this.className=\"popupDiagramTdMouseover\"' onmouseout='this.className=\"popupDiagramTdMouseout\"'";
                    relHTML += " onclick='this.firstChild.click()'";
                    relHTML += ">";

                    relHTML += "<a style=\"text-decoration: none;\" href=\"../../" + relURL + "\" target=\"" + relTarget + "\"";
                    if (relTarget == 'frmdocument') {
                        relHTML += " onclick=\"parent.notifyPreviewPane('" + relURL + "');\"";
                    }
                    relHTML += '>';

                    relHTML += "<img src='../../Images/" + relIcon + "' border='0'/>&nbsp;&nbsp;" + relText + "</a></td></tr>";
                    
                    addLinkFunction(curRel.DestType, relHTML);
                }
            }
            
        }
    
    }

    if (PublicationData.Enabled == "true") {
        striServerHTML += "<tr><td class='popupDiagramTdMouseout' onclick='parent.ShowFeedback(0,0, true, false);' onmouseover='this.className=\"popupDiagramTdMouseover\"' onmouseout='this.className=\"popupDiagramTdMouseout\"'><img src='../../Images/comments.gif' border='0'/>&nbsp;&nbsp;Create a Comment</td></tr>";
    }

    var diagramDescription = iServerData.Properties.Description;
    if (diagramDescription != "")
    {
        striServerHTML += "<tr><td class='popupDiagramTdMouseout'><img src='../../Images/spacer.gif'/><br><img src='../../Images/spacer.gif'/><div class='popupDiagramDescScrollbars' id='ShapeDescription'>" + diagramDescription + "</div><img src='../../Images/spacer.gif'/></td></tr>"
    }

    striServerHTML += "</table>";
    strLinkTypesHTML += "</table>";
    for (var i = 0; i < arrLinkCatsHTML.length; i++) {
        arrLinkCatsHTML[i] += "</table>";
    }

    frmDrawing.menu1.innerHTML = striServerHTML;
    frmDrawing.menu2.innerHTML = strLinkTypesHTML;
    frmDrawing.menu2.supermenu = frmDrawing.menu1;
    frmDrawing.menu3.supermenu = frmDrawing.menu2;
    goiServerMenu("menu1");

    //UPDATE LEFT HAND PANEL
    ViewProperties(0,0, true, "");
}

function ViewProperties (pageID, shapeID, isDiagram, service)
{
        ShowiServerProperties(pageID, shapeID, isDiagram, true);
        ShowCustomAttributes(pageID, shapeID, isDiagram, false);
        ShowIssues(pageID, shapeID, isDiagram, false);

    if (frmToolbar.widgets.Details)
    {
        if (service == "visioproperties")
        {
            if (frmToolbar.hideDetails.style.display == "none")
            {
                frmToolbar.ToggleWidget(frmToolbar.hideDetails);
            }

            if (isDiagram != true)
            {
                UpdateProps(pageID, shapeID);
            } else {
                frmToolbar.hideDetails.innerHTML = "<P class=\"p2\" class=\"detsPara\" align=\"center\">Visio Custom Properties can only be viewed for a shape.</P>";
            }
        } else {
            if (isDiagram != true)
        {
                UpdateProps(pageID, shapeID);
            } else {
                frmToolbar.hideDetails.innerHTML = "<P class=\"p2\" class=\"detsPara\" align=\"center\">Visio Custom Properties can only be viewed for a shape.</P>";
            }
        }
    }
}

function ViewNoniServerShape(pageID, shapeID)
{
    UpdateProps(pageID, shapeID);
    frmToolbar.hideiServerCustom.innerHTML = "<P class=\"p2\" class=\"detsPara\" align=\"center\">This is a non-iServer shape so no Custom Attributes exist</P>";
    frmToolbar.hideiServerIssues.innerHTML = "<P class=\"p2\" class=\"detsPara\" align=\"center\">This is a non-iServer shape so no Issues exist</P>";
    frmToolbar.hideiServerProperties.innerHTML = "<P class=\"p2\" class=\"detsPara\" align=\"center\">This is a non-iServer shape so no Properties exist</P>";
}

function ShowiServer(pageID, shapeID)
{

    //GENERATE POPUP MENU
    var diagramTarget = "_top";
    var shapeTarget = "_top";
    var documentTarget = "_top";
    var targetFrameNodes = parent.PublicationPropertiesData.getElementsByTagName('TargetFrame');

    if (targetFrameNodes(0)) {
        diagramTarget = targetFrameNodes(0).getAttribute("diagram_link_diagram");
        shapeTarget = targetFrameNodes(0).getAttribute("diagram_link_shape");
        documentTarget = targetFrameNodes(0).getAttribute("diagram_link_document");
    }

    clickMenu();

    if (isUpLevel)
    {
        var striServerHTML = "";
        var strLinkTypesHTML = "";
        var strLinkCatHTMLBase = "";
        arrLinkCatsHTML = [];

        var shapeNode = FindShapeXML (pageID, shapeID);
        var ShapeClick = getShape(pageID, shapeID);
        if (ShapeClick != null)
        {
            if (!ShapeClick.loadedInFull) {
                ShapeClick.loadXML();
            }

            var count=0;
            count++;

            var shapeName = ShapeClick.Properties.RepositoryName;
            var shapeDescription = ShapeClick.Properties.Description;           
            var shapeMaster = ShapeClick.Properties.ShapeMaster;            
            var isRelationship = ShapeClick.isRelationship;
            
            var shapeNameTrimmed = shapeName.substr(0,22);
            if (shapeNameTrimmed.length < shapeName.length)
            {
                shapeNameTrimmed += "..";
            }

            striServerHTML += "<table class='popupShapeTable' cellpadding='0' width='100%' id='table2' onmousemove='parent.renewMenuTimer()'>";
            strLinkTypesHTML = striServerHTML;
            strLinkCatHTMLBase = striServerHTML;

            striServerHTML += "<tr><td class='popupShapeHeader'><table cellpadding='0' width='100%' id='tableheader'><td class='popupShapeHeader' width='90%'>";
            
            if (isRelationship) 
            {       
                striServerHTML += shapeDescription;
            }
            else
            {
                striServerHTML += shapeNameTrimmed;
            }
            
            striServerHTML += "</td><td width='10%' align='center' valign='middle'><img src='../../Images/closeframe.gif' border='0'/></td></table></td></tr>";
            
            if (isRelationship)
            {
                striServerHTML += "<tr><td class='popupShapeTdMouseoverNoLink'><img src='../../Images/relationship.gif' border='0'/>&nbsp;&nbsp;Type: <strong>" + shapeMaster + "</strong></td></tr>";              
            }
            else
            {
                striServerHTML += "<tr><td class='popupShapeTdMouseoverNoLink'><img src='../../Images/visioshape.gif' border='0'/>&nbsp;&nbsp; Type: <strong>" + shapeMaster + "</strong></td></tr>";               
            
                strLinkTypesHTML += "<tr><td class='popupShapeHeader'><table cellpadding='0' width='100%' id='tableheader'><td class='popupShapeHeader' width='90%'><strong>Relationship Categories</strong><td width='10%' align='center' valign='middle'><img src='../../Images/closeframe.gif' border='0'/></td></table></td></tr>";
                strLinkCatHTMLBase += "<tr><td class='popupShapeHeader'><table cellpadding='0' width='100%' id='tableheader'><td class='popupShapeHeader' width='90%'><strong>Relationships</strong><td width='10%' align='center' valign='middle'><img src='../../Images/closeframe.gif' border='0'/></td></table></td></tr>";
                
                var visioHyperlinks;

                if (shapeNode != null)
                {
                    visioHyperlinks = shapeNode.selectNodes ("Scratch/B/SolutionXML/HLURL:Hyperlinks/HLURL:Hyperlink");
                }

                var visioLinkCount = visioHyperlinks.length;
                
                //Read XML to find out whether Visio Hyperlinks are to be hidden.
                var visioHyperlinksSetting = PublicationPropertiesData.getElementsByTagName('VisioHyperlinks');
                var showVisioHyperlinks = false;
                
                if (visioHyperlinksSetting(0)) 
                {
                    showVisioHyperlinks = visioHyperlinksSetting(0).getAttribute("publish");
                }           

                //If visio hyperlinks are to be hidden, total number of links is set to 0 
                if (showVisioHyperlinks == "false")
                {
                    visioLinkCount = 0;
                }       
                
                var iServerLinkCount = ShapeClick.Relations.length;
                var firstTierLinks = -1;  // Default to full three-tier menus always
                var popupMenuNodes = PublicationPropertiesData.getElementsByTagName('PopupMenu');
                if (popupMenuNodes(0)) {
                    firstTierLinks = popupMenuNodes(0).getAttribute('first_tier_links');
                }
                
                if ((iServerLinkCount < 1) && (visioLinkCount < 1))
                {

                } else {

                    var linkTypeExistsFunction;
                    var newLinkTypeFunction;
                    var addLinkFunction;
                    if ((visioLinkCount + iServerLinkCount) <= firstTierLinks) {
                        // Links will all be added to main menu
                        linkTypeExistsFunction = function (typename) {
                            return true;
                        }
                        newLinkTypeFunction = function (typename) {
                            // We don't care about link types
                        }
                        addLinkFunction = function (type, html) {
                            // We add this directly to the main menu
                            striServerHTML += html;
                        }

                    } else {
                        // Links will be in submenus
                        striServerHTML += "<tr><td class='popupShapeTdMouseout' onmouseover='this.className=\"popupShapeTdMouseover\"' onmouseout='this.className=\"popupShapeTdMouseout\"' onclick='parent.ShowLinkCategoriesMenu()'><img src='../../Images/treeunknownfile.gif' border='0'/>&nbsp;&nbsp;Relationships</td></tr>";
                        linkTypeExistsFunction = function (typename) {
                            return arrLinkCatsHTML[linkTypeToName(typename)];
                        }
                        newLinkTypeFunction = function (typename) {
                            arrLinkCatsHTML[linkTypeToName(typename)] = strLinkCatHTMLBase;
                            strLinkTypesHTML += "<tr><td class='popupShapeTdMouseout' onmouseover='this.className=\"popupShapeTdMouseover\"' onmouseout='this.className=\"popupShapeTdMouseout\"' onclick='parent.ShowLinkCategory(\"" + linkTypeToName(typename) + "\")'><img src='../../Images/treeunknownfile.gif' border='0'/>&nbsp;&nbsp;" + linkTypeToName(typename) + "</td></tr>";
                        }
                        addLinkFunction = function (type, html) {
                            // We add the links to their own type's menu
                            arrLinkCatsHTML[linkTypeToName(type)] += html;
                        }
                    }

                    // We have now established functions for new link types and new links which
                    // should route links appropriately to menus
                    
                    if (showVisioHyperlinks == "true")
                    {               
                        if (visioLinkCount > 0)
                        {
                            linktype = "Visio Link";
                            newLinkTypeFunction(linktype);

                            for (var count = 0; count < visioLinkCount; count++)
                            {
                                var hlObj = CreateHLObj (visioHyperlinks.item(count));
                                if (hlObj != null)
                                {

                                    if (hlObj.Desc.length > 0)
                                    {

                                        var linkHTML = "<tr><td class='popupShapeTdMouseout' onmouseover='this.className=\"popupShapeTdMouseover\"' onmouseout='this.className=\"popupShapeTdMouseout\"' onclick='";

                                        if (hlObj.DoFunction.length > 0)
                                            {
                                            linkHTML += hlObj.DoFunction;
                                        }
                                        else
                                        {
                                            if (hlObj.NewWindow) {

                                                //SC
                                                linkHTML += "parent.window.open(\"" + HTMLEscape(hlObj.Hyperlink).replace(" ", "%20") + "\");";
                                            } else {

                                                //SC                                                                                    
                                                linkHTML += "parent.window.location = \"" + HTMLEscape(hlObj.Hyperlink).replace(" ", "%20") + "\";";
                                            }

                                        }

                                        linkHTML += "'><img src='../../Images/relationship.gif' border='0'/>&nbsp;&nbsp;" + hlObj.Desc + "</td></tr>";
                                        addLinkFunction(linktype, linkHTML);
                                    }
                                }
                            }
                        }
                    }

                    for (var rcount = 0; rcount < ShapeClick.Relations.length; rcount++) {
                    
                        var curRel = ShapeClick.Relations[rcount];
                        
                        // Determine icon filename
                        var relIcon = 'treeunknownfile.gif';
                        if (curRel.DestType == 'MSVisioShape') {
                            relIcon = 'visio.gif';
                        } else if (curRel.DestType == 'MSVisioDiagram') {
                            relIcon = 'visiodiagram.gif';
                        } else if ((curRel.DestType == 'MSWord') || (curRel.DestType == 'MSWordBookmark')) {
                            relIcon = 'word.gif';
                        } else if (curRel.DestType == 'MSPowerpoint') {
                            relIcon = 'powerpoint.gif';
                        } else if (curRel.DestType == 'MSExcel') {
                            relIcon = 'excel.gif';
                        }
                        
                        // Determine display text
                        var relText = curRel.Title;
                        
                        // Determine display URL
                        relURL = curRel.Targets[0].URL;
                        
                        // Determine display target
                        var relTarget = '';
                        if (curRel.DestType == 'MSVisioDiagram') {
                            relTarget = diagramTarget;
                        } else if (curRel.DestType == 'MSVisioShape') {
                            relTarget = shapeTarget;
                        } else {
                            relTarget = documentTarget;
                        }

                        // Construct HTML                
                        var relHTML = "<tr><td class='popupDiagramTdMouseout' title='" + curRel.Reason + "'";
                        if (curRel.Targets.length < 2) {
                            relHTML += "onmouseover='this.className=\"popupDiagramTdMouseover\"' onmouseout='this.className=\"popupDiagramTdMouseout\"' onclick='this.firstChild.click()'";
                        }
                        relHTML += '>';
            
                        if (curRel.Targets.length < 2) {
                            relHTML += "<a style=\"text-decoration: none;\" href=\"../../" + relURL + "\" target=\"" + relTarget + "\"";
                            if (relTarget == 'frmdocument') {
                                relHTML += " onclick=\"parent.notifyPreviewPane('" + relURL + "');\"";
                            }
                            relHTML += '>';
                            relHTML += "<img src='../../Images/" + relIcon + "' border='0'/>&nbsp;&nbsp;";
                        }
                        relHTML += relText;
                        if (curRel.Targets.length < 2) {
                            relHTML += "</a>";
                        }
                        relHTML += "</td></tr>";
            
                        if (!linkTypeExistsFunction(curRel.DestType)) {
                            newLinkTypeFunction(curRel.DestType);
                        }
                        addLinkFunction(curRel.DestType, relHTML);
                        
                        // If more than one destination, then generate those too
                        if (curRel.Targets.length > 1) {
                            for (var dCount = 0; dCount < curRel.Targets.length; dCount++) {
            
                                var relURL = curRel.Targets[dCount].URL;
                                var relText = curRel.Targets[dCount].Title;
            
                                // Construct HTML
                                var relHTML = "<tr><td class='popupDiagramTdMouseout' style='padding-left: 12px;' onmouseover='this.className=\"popupDiagramTdMouseover\"' onmouseout='this.className=\"popupDiagramTdMouseout\"' title='" + curRel.Reason + "'";
                                relHTML += " onclick='this.firstChild.click()'";
                                relHTML += ">";
            
                                relHTML += "<a style=\"text-decoration: none;\" href=\"../../" + relURL + "\" target=\"" + relTarget + "\"";
                                if (relTarget == 'frmdocument') {
                                    relHTML += " onclick=\"parent.notifyPreviewPane('" + relURL + "');\"";
                                }
                                relHTML += '>';
            
                                relHTML += "<img src='../../Images/" + relIcon + "' border='0'/>&nbsp;&nbsp;" + relText + "</a></td></tr>";
                                
                                addLinkFunction(curRel.DestType, relHTML);
                            }
                        }
                        
                    }
            
                }

                if (shapeDescription != "")
                {
                    striServerHTML += "<tr><td class='popupShapeTdMouseout'><img src='../../Images/spacer.gif'/><br><img src='../../Images/spacer.gif'/><div class='popupShapeDescScrollbars' id='ShapeDescription'>" + shapeDescription + "</div><img src='../../Images/spacer.gif'/></td></tr>"
                }               
                
            }

            if (PublicationData.Enabled == "true")
            {
                striServerHTML += "<tr><td class='popupShapeTdMouseout' onclick='parent.ShowFeedback(" + pageID + "," + shapeID + ", false, false);' onmouseover='this.className=\"popupShapeTdMouseover\"' onmouseout='this.className=\"popupShapeTdMouseout\"'><img src='../../Images/comments.gif' border='0'/>&nbsp;&nbsp;Create a Comment</td></tr>";

            }

            striServerHTML += "</table>";
            strLinkTypesHTML += "</table>";
            for (var i = 0; i < arrLinkCatsHTML.length; i++) {
                arrLinkCatsHTML[i] += "</table>";
            }


        //POPULATE LEFT PANEL

        ViewProperties(pageID,shapeID, false, "");

        } else //IF A NON-ISERVER SHAPE>>>>
          {
			//Build menu with hyperlinks only
			var visioLinkCount = 0		

			if (shapeNode != null) {
				var shapeNameTrimmed = "LINK1";

				striServerHTML += "<table class='popupShapeTable' cellpadding='0' width='100%' id='table2' onmousemove='parent.renewMenuTimer()'>";
				strLinkTypesHTML = striServerHTML;
				strLinkCatHTMLBase = striServerHTML;
				striServerHTML += "<tr><td class='popupShapeHeader'><table cellpadding='0' width='100%' id='tableheader'><td class='popupShapeHeader' width='90%'>";
				var name = shapeNode.selectSingleNode("Text");
				if (name != null && name.text.length > 0) {
					striServerHTML += ReplaceSymbols (name.text);
				} 
				else {
					//
				}
				striServerHTML += "</td><td width='10%' align='center' valign='middle'><img src='../../Images/closeframe.gif' border='0'/></td></table></td></tr>";

				visioHyperlinks = shapeNode.selectNodes ("Scratch/B/SolutionXML/HLURL:Hyperlinks/HLURL:Hyperlink");
				var visioLinkCount = visioHyperlinks.length;

                //Read XML to find out whether Visio Hyperlinks are to be hidden.
                var visioHyperlinksSetting = PublicationPropertiesData.getElementsByTagName('VisioHyperlinks');
                var showVisioHyperlinks = false;
                if (visioHyperlinksSetting(0)) 
                {
                    showVisioHyperlinks = visioHyperlinksSetting(0).getAttribute("publish");
                }           

                //If visio hyperlinks are to be hidden, total number of links is set to 0 
                if (showVisioHyperlinks == "false")
                {
                    visioLinkCount = 0;
                }
				
				if (showVisioHyperlinks == "true")
                    {               
                        if (visioLinkCount > 0)
                        {
                            linktype = "Visio Link";
                            //newLinkTypeFunction(linktype);

                            for (var count = 0; count < visioLinkCount; count++)
                            {
                                var hlObj = CreateHLObj (visioHyperlinks.item(count));
                                if (hlObj != null)
                                {

                                    if (hlObj.Desc.length > 0)
                                    {

                                        var linkHTML = "<tr><td class='popupShapeTdMouseout' onmouseover='this.className=\"popupShapeTdMouseover\"' onmouseout='this.className=\"popupShapeTdMouseout\"' onclick='";

                                        if (hlObj.DoFunction.length > 0)
                                            {
                                            linkHTML += hlObj.DoFunction;
                                        }
                                        else
                                        {
                                            if (hlObj.NewWindow) {
                                                linkHTML += "parent.window.open(\"" + HTMLEscape(hlObj.Hyperlink).replace(" ", "%20") + "\");";
                                            } else {
                                                linkHTML += "parent.window.location = \"" + HTMLEscape(hlObj.Hyperlink).replace(" ", "%20") + "\";";
                                            }
                                        }
                                        linkHTML += "'><img src='../../Images/relationship.gif' border='0'/>&nbsp;&nbsp;" + hlObj.Desc + "</td></tr>";
                                        striServerHTML += linkHTML;
                                    }
                                }
                            }
                        }
                    }				
				striServerHTML += "</table>";
			}
			//If no hiperlinks display the page details and menu
            if (visioLinkCount == 0) {
				ShowiServerPage();
				return;
			}
        }

        frmDrawing.menu1.innerHTML = striServerHTML;
        frmDrawing.menu2.innerHTML = strLinkTypesHTML;
        frmDrawing.menu2.supermenu = frmDrawing.menu1;
        frmDrawing.menu3.supermenu = frmDrawing.menu2;
        goiServerMenu("menu1");
    }

}

function goiServerMenu(menuTag) {


        var menu = frmDrawing.document.all(menuTag);
        if (menu != null)
        {
            menu.style.visibility = "hidden";
            menu.style.display = "inline";

            var e = window.frmDrawing.event;
            var elem = e.srcElement;

            var clientWidth = frmDrawing.document.body.clientWidth;
            var clientHeight = frmDrawing.document.body.clientHeight;

            var menuWidth = menu.clientWidth;
            var menuHeight = menu.clientHeight;

            // changed this to reflect possibility that the shape menu might be triggered by
            // clicking a meta-data indicator, as well as by clicking a shape itself.
            var menuLeft = e.clientX;
            var menuTop = e.clientY;

            var doc = frmDrawing.document;
            var img = doc.all("ConvertedImage");

            var scrollBarSize = 20;
            if ( menu.supermenu ) {
                menuLeft = menu.supermenu.style.posLeft - frmDrawing.document.body.scrollLeft + (menu.supermenu.clientWidth /2);
                menuTop = menu.supermenu.style.posTop - frmDrawing.document.body.scrollTop + 10;
                if (menuLeft + menuWidth > clientWidth - scrollBarSize) {
                    menuLeft = menu.supermenu.style.posLeft - frmDrawing.document.body.scrollLeft - menuWidth;
                }
                if (menuTop + menuHeight > clientHeight - scrollBarSize) {
                    menuTop = clientHeight - scrollBarSize - menuHeight + 10;
                }

            } else {
        /* Commented out to accomodate above changes.
                if( (menuLeft + doc.body.scrollLeft < elem.offsetLeft) || (menuLeft + doc.body.scrollLeft > elem.offsetLeft + elem.offsetWidth + img.offsetLeft) )
                {
                    menuLeft = elem.offsetLeft + img.offsetLeft + elem.offsetWidth/2;
                }

                if( (menuTop + doc.body.scrollTop < elem.offsetTop) || (menuTop + doc.body.scrollTop > elem.offsetTop + elem.offsetHeight + img.offsetTop) )
                {
                    menuTop = elem.offsetTop + img.offsetTop + elem.offsetHeight/2;
                }
        */
                if (menuLeft + menuWidth > clientWidth - scrollBarSize)
                {
                    menuLeft = clientWidth - menuWidth - scrollBarSize;
                }

                if (menuTop + menuHeight > clientHeight - scrollBarSize)
                {
                    menuTop = clientHeight - menuHeight - scrollBarSize;
                }

            }
            menu.style.posLeft = menuLeft + frmDrawing.document.body.scrollLeft;
            menu.style.posTop = menuTop + frmDrawing.document.body.scrollTop;
            menu.style.visibility = "visible";

            var firstLink = menu.all(g_HLMenuEntry + "0");

            if (e.keyCode == 13)
            {
                toggleMenuLink(firstLink, true);
            }

            e.cancelBubble = true;
        }
        setMenuTimer();
}

function ShowiServerProperties (pageID, shapeID, isDiagram, focus)
{

    var isRelationship = false;
    var iServerProperties = null;

    if (isDiagram) {
        iServerProperties = iServerData.Properties;
    } else {
        var ShapeClick = getShape(pageID, shapeID);
        iServerProperties = ShapeClick.Properties;
        isRelationship = ShapeClick.isRelationship;
    }

    var outputDivObj = frmToolbar.hideiServerProperties;

    var strCPHTML = "";
    var strStartTable = "<table class='widgetTable'>";
    var strEndTable = "</TABLE>";

    strCPHTML += "<TR class='widgetPanel'>";

    if (iServerProperties != null && outputDivObj != null)
    {
        //if((outputDivObj.style.display == "none") && (focus == true))
        //{
            //frmToolbar.ToggleWidget(outputDivObj);
        //}

        var strCPHTML = "";

        var Name, Desc, CreatedBy, DateCreated, LastModifiedBy, DateLastModified = null;
        
        if (isRelationship)
        {
            Name = ReplaceSymbols(iServerProperties.Description);
        }
        else
        {
            Name = ReplaceSymbols(iServerProperties.RepositoryName);        
            Desc = iServerProperties.Description;           
            CreatedBy = iServerProperties.Timestamp.CreatedBy;
            DateCreated = iServerProperties.Timestamp.CreatedOn;
            LastModifiedBy = iServerProperties.Timestamp.LastModifiedBy;
            DateLastModified = iServerProperties.Timestamp.LastModifiedOn;
        }
                
        if (Name)
        {
            strCPHTML += "<TR class='WidgetPanel'>";
            strCPHTML += "<TD class='tdWidgetPanelHeader' width='120'><strong>Name:</strong></TD>";
            strCPHTML += "<TD class='tdWidgetPanel'><strong>" + ReplaceSymbols(Name) + "</strong></TD></TR>";
        }
        if (isDiagram)
        {
            strCPHTML += "<TR class='WidgetPanel'>";
            strCPHTML += "<TD class='tdWidgetPanelHeader' width='120'>Diagram Type:</TD>";
            strCPHTML += "<TD class='tdWidgetPanel'>" + iServerProperties.Category + "</TD></TR>";
        } else {
            strCPHTML += "<TR class='WidgetPanel'>";
            strCPHTML += "<TD class='tdWidgetPanelHeader' width='120'>Shape Type:</TD>";
            if (iServerProperties.ShapeMaster) {
                strCPHTML += "<TD class='tdWidgetPanel'>" + iServerProperties.ShapeMaster + "</TD></TR>";
            } else {
                strCPHTML += "<TD class='tdWidgetPanel'>Shape</TD></TR>";
            }
        }

        if (CreatedBy)
        {
            strCPHTML += "<TR class='WidgetPanel'>";
            strCPHTML += "<TD class='tdWidgetPanelHeader' width='120'>Created By:</TD>";
            strCPHTML += "<TD class='tdWidgetPanel'>" + ReplaceSymbols(CreatedBy) + "</TD></TR>";
        }
        if (DateCreated)
        {
            strCPHTML += "<TR class='WidgetPanel'>";
            strCPHTML += "<TD class='tdWidgetPanelHeader' width='120'>Date Created:</TD>";
            strCPHTML += "<TD class='tdWidgetPanel'>" + ReplaceSymbols(DateCreated) + "</TD></TR>";
        }

        if (LastModifiedBy)
        {
            strCPHTML += "<TR class='WidgetPanel'>";
            strCPHTML += "<TD class='tdWidgetPanelHeader' width='120'>Last Modified By:</TD>";
            strCPHTML += "<TD class='tdWidgetPanel'>" + ReplaceSymbols(LastModifiedBy) + "</TD></TR>";
        }
        if (DateLastModified)
        {
            strCPHTML += "<TR class='WidgetPanel'>";
            strCPHTML += "<TD class='tdWidgetPanelHeader' width='120'>Date Last Modified:</TD>";
            strCPHTML += "<TD class='tdWidgetPanel'>" + ReplaceSymbols(DateLastModified) + "</TD></TR>";
        }

        if ((Desc) && (Desc != ""))
        {
            strCPHTML += "<TR class='WidgetPanel'>";
            strCPHTML += "<TD colspan='2' class='tdWidgetPanel'>" + ReplaceSymbols(Desc) + "</TD></TR>";
        }

        if(strCPHTML != "")
        {
            strCPHTML = strStartTable + strCPHTML + strEndTable;
      } else {
        strCPHTML = "No Details Available.";
    }

    outputDivObj.innerHTML = strCPHTML;

    }
}

function ShowCustomAttributes (pageID, shapeID, isDiagram, focus)
{

    if (isDiagram) {

        var iCustom = iServerData.CustomAttributes;
    } else {
        var ShapeClick = getShape(pageID, shapeID);
        var iCustom = ShapeClick.CustomAttributes;
    }

    var outputDivObj = frmToolbar.hideiServerCustom;

    var strCPHTML = "";
    var strStartTable = "<table class='widgetTable'>";
    var strEndTable = "</TABLE>";

    if (iCustom != null && outputDivObj != null)
    {
        //if((outputDivObj.style.display == "none") && (focus == true))
        //{
        //    frmToolbar.ToggleWidget(outputDivObj);
        //}

        if (iCustom.length > 0) {

            var attrCount = iCustom.length;

            for (var count = 0; count < attrCount; count++)
            {
                strCPHTML += "<TR class='widgetPanel'>";

                var strLabelText = "";

                var AttributeName = iCustom[count].Name;
                var AttributeDesc = iCustom[count].Description;
                var AttributeValue = iCustom[count].Value;
                var AttributeDataType = iCustom[count].DataType;

                if (AttributeName != null)
                {
                    strLabelText = ReplaceSymbols (AttributeName);
                }

                if (strLabelText.length > 0)
                {
                    strCPHTML += "<TD class='tdWidgetPanelHeader'>" + strLabelText + "<br/>";

                    var strValueText = "";  

                    if (AttributeValue)
                    {
                        strValueText = "<span style='color:#000;'>" + ReplaceSymbols (AttributeValue) + "</span>";
                    }
                    strCPHTML += strValueText + "</TD></TR>";
                }
            }

            if(strCPHTML != "")
            {
                strCPHTML = strStartTable + strCPHTML + strEndTable;
            }
            else
            {
                strCPHTML = "No Details Available.";
            }

        } else
        {
            strCPHTML = "<p align='center' class='propViewerTD'><br>No Custom Attributes are available for this object<br><br></p>";
        }
    }
    outputDivObj.innerHTML = strCPHTML;

}

function ShowIssues (pageID, shapeID, isDiagram, focus)
{
    if (isDiagram)
    {
        var IssueList = iServerData.Issues;
    } else {
        var ShapeClick = getShape(pageID, shapeID);
        var IssueList = ShapeClick.Issues;
    }

    var outputDivObj = frmToolbar.hideiServerIssues;

    var strCPHTML = "";
    var strStartTable = "<table class='widgetTable'>";
    var strEndTable = "</TABLE>";

    if (IssueList != null && outputDivObj != null)
    {
        //if((outputDivObj.style.display == "none") && (focus == true))
        //{
        //    frmToolbar.ToggleWidget(outputDivObj);
        //}

        if (IssueList.length > 0)
        {
            var issueCount = IssueList.length;

            for (var count = 0; count < issueCount; count++)
            {

                var href = "Javascript:parent.ShowIssueDetails(" + pageID + "," + shapeID + "," + count + "," + isDiagram + ")";
                strCPHTML += "<TR class='widgetPanel' onclick='" + href + "' onmouseover='javascript:this.className=\"widgetPanelMouseOver\"' onmouseout='javascript:this.className=\"widgetPanel\"'>";

                var strLabelText = "";

                var Issue = IssueList[count];
                var IssueName = Issue.Name;
                var IssueDescription = Issue.Description;

                if (IssueName != null)
                {
                    strLabelText = ReplaceSymbols (IssueName);
                    issuename=strLabelText;
                }

                if (strLabelText.length > 0)
                {

                    var strValueText = "&nbsp;";
                    if (IssueDescription && (IssueDescription.length > 0))
                    {
                        strValueText = "&nbsp;(" + ReplaceSymbols (IssueDescription) + ")";
                    }

                    strCPHTML += "<td class='tdWidgetPanel' width='100%'><strong><a class='widgetLink' href='" + href + "'>" + strLabelText + "</a></strong>" + strValueText + "</TD>";
                }
            }

            if(strCPHTML != "")
            {
                strCPHTML = strStartTable + strCPHTML + strEndTable;
            }
            else
            {
                strCPHTML = "No Issues Available.";
            }

        } else {
            strCPHTML = "<p align='center' class='propViewerTD'><br>No Issues are available for this object<br><br></p>";
        }
    }
    outputDivObj.innerHTML = strCPHTML;

}

function ShowIssueDetails (pageID, shapeID, IssueID, isDiagram)
{
    if (isDiagram)
    {
        var Issue = iServerData.Issues[IssueID];
    } else {
        var ShapeClick = getShape(pageID, shapeID);
        var Issue = ShapeClick.Issues[IssueID];
    }

    iServerData.CurrentIssue = Issue;

    var page = "../../issuedetails.html";
    windowprops = "height=600,width=490,location=no, scrollbars=no,menubars=no,toolbars=no,resizable=no";
    windowname = "iServerIssue";

    if (! window.focus)
    {
        return true;
    }

    var href;
    if (typeof(page) == 'string')
    {
        href=page;
    } else {
        href=page.href;
    }

    iServerData.IssueWindow = window.parent.open(href, windowname, windowprops);
    iServerData.IssueWindow.focus();
}

function CreatePublicationNotes(xmlNode)
{
    var publicationData = new PublicationData(xmlNode);
    if (publicationData != null)
    {
        return publicationData;
    }
}

function PublicationData(xmlNode)
{
    this.Enabled = "false";
    this.FeedbackWindow = null;
    this.CurrentObjectName = "";
    this.CurrentObjectID = "";
    this.CurrentTypeIndex = 0;

    if (xmlNode != null)
    {
        var feedbacknode = xmlNode.selectSingleNode("iServerPublication/PublicationFeedback");
        if (feedbacknode != null)
        {
            var enabled = feedbacknode.attributes.getNamedItem ("Enabled");
            
            if (enabled != null && enabled.text.length > 0)
            {
                this.Enabled = ReplaceSymbols (enabled.text);
            } else {
                this.Enabled = "false";
            }
        }
        
    }
}

function ShowFeedback (pageID, shapeID, isDiagram, isVisio)
{
    var page = "../../feedback.html";
    windowprops = "height=600,width=490,location=no, scrollbars=no,menubars=no,toolbars=no,resizable=no";
    windowname = "iServerComment";

    if (! window.focus)
    {
        return true;
    }

    var href = null;
    if (typeof(page) == 'string')
    {
        href=page;
    } else {
        href=page.href;
    }

    var isOpen = false;

    if (PublicationData.FeedbackWindow)
    {
        if (!PublicationData.FeedbackWindow.closed)
        {
            alert("You already have one comment open for this diagram. Please close before creating a new comment.");
            PublicationData.FeedbackWindow.focus();
            return;
        }
    }

        if (isDiagram)
        {

            PublicationData.CurrentObjectName = ReplaceSymbols(iServerData.Properties.RepositoryName);
            PublicationData.CurrentObjectID = ReplaceSymbols(iServerData.iServerID);
            PublicationData.CurrentTypeIndex = 0;

        } else {

            if (isVisio)
            {
                var shapeNode = FindShapeXML (pageID, shapeID);
                PublicationData.CurrentObjectName = ReplaceSymbols(shapeNode.attributes.getNamedItem ("Name").text);
                PublicationData.CurrentTypeIndex = 1;

            } else {

                var ShapeClick = getShape(pageID, shapeID);
                PublicationData.CurrentObjectName = ReplaceSymbols(ShapeClick.Properties.RepositoryName);
                PublicationData.CurrentObjectID = ReplaceSymbols(ShapeClick.iServerID);
                PublicationData.CurrentTypeIndex = 1;
            }
        }

        PublicationData.FeedbackWindow = window.parent.open(href, windowname, windowprops);
        PublicationData.FeedbackWindow.focus();
}

function InitializeMetaDataIndicators() {
    for (var sIdx = 0; sIdx < iServerData.Shapes.length; sIdx++) {
        var s = iServerData.Shapes[sIdx];
        if (s.PageID == frmDrawing.pageID) {
           var sNode = FindShapeXML(s.PageID, s.ShapeID);
           if (sNode) {
        
               var pinX = (sNode.selectSingleNode("XForm/PinX/textnode()")).text;
               var pinY = (sNode.selectSingleNode("XForm/PinY/textnode()")).text;
        
               if (!s.loadedInFull) {
                   s.loadXML();
               }
               
               viewMgr.drawMetaDataIndicator(s, pinX, pinY, s.gotAttrs, s.gotIssues, s.gotDocLinks, s.gotDiagLinks);
           }
        }
    }
    // begin added ASW March 2009 Issue #4575
    if (frmToolbar && frmToolbar.updateMDICheckboxes) {
        frmToolbar.updateMDICheckboxes(viewMgr.showMDIs);
    }
    // end added ASW
        
    viewMgr.updateMDIVisibility();
    viewMgr.PostZoomMDIUpdate();

}

function CheckLinks()
{
    if (link.isLink)
    {
        var searchNode = FindShapeXML (link.PageID, link.ShapeID);
        if (searchNode)
        {
            var pinx = (searchNode.selectSingleNode("XForm/PinX/textnode()")).text;
            var piny = (searchNode.selectSingleNode("XForm/PinY/textnode()")).text;
            frmToolbar.FindQuerySelect(link.PageID, link.ShapeID, pinx, piny);

        var ShapeClick = getShape(link.PageID, link.ShapeID);

        if (ShapeClick != null)
            {
        if (!ShapeClick.loadedInFull) {
            ShapeClick.loadXML();
        }
        }

            //display shape properties in left panel
            ViewProperties(link.PageID, link.ShapeID, false, "");
        }
        return true;
    }
    else
    {
        //display diagram properties in left panel
        ViewProperties(0, 0, true, "");
        return false;
    }
}

function isInteger(input)
{
    if (!input)
    {
        return false;
    }
    var valid = "0123456789"
    for (var i=0; i<input.length; i++)
    {
        var currentchar = "" + input.substring(i, i+1);
        if (valid.indexOf(currentchar) == "-1")
        {
            return false;
        }
    }
    return true;
}

function ShapeLink(queryString)
{
    this.queryString = queryString;
    this.isLink = false;
    this.PageID = null;
    this.ShapeID = null;

    var vars = unescape(queryString).split("&");
    for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if (pair[0] == "PageID")
            {
            this.PageID = pair[1];
            } else if (pair[0] == "ShapeID")
            {
            this.ShapeID = pair[1];
            }
    }

    if ((isInteger(this.PageID)) && (isInteger(this.ShapeID)))
    {
        this.isLink = true;
    }
}


function ReplaceSymbols(str)
{
    if(str.indexOf('&gt;') != -1)
    {
        str = str.replace('&gt;','>');
    }
    if(str.indexOf('&lt;') !=-1)
    {
        str = str.replace('&lt;','<');
    }
    if(str.indexOf('&#38') != -1)
    {
        str = str.replace('&#38;','&');
    }

    return str;
}

