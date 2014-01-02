var mobilepub = (function () {
	return {
		setTitle: function(title){
			$("div[data-role=header]:visible h1").text(title);
		},

		loadSettings: function(){
			var self = this;
			$.getJSON("settings.json", function(data) {
				self.settings = data;
			});
		},
		buildDiagramChildren: function(item){
			var self = this, children = [];

			item.children('Folder').each(function(){             
	            children.push({
					id:$(this).attr('ID'),
					name: $(this).attr('Name'),
					children: self.buildDiagramChildren($(this))
				});
	         });
			return children;
		},
		diagram:{},
		category:{},
		buildDiagramStruct: function(){
			var self = this;
			
			$.ajax({
				type: "GET",
				url: self.settings.publicationpath + self.settings.diagramFile,
				dataType: "xml",
				success: function(xml) {				
					self.diagram.folders = $(xml).find('PublicationStructure');	
					self.diagram.init = true;
				}
			});

		},
		loadDiagramPage: function(id){
			var items =[], 
			defaultImage = '<img class="ui-li-icon" src="/Publication_files/Images/treefolder.gif" style="top: 12px;left: 16px;">'
			self = this;
			
			if(!id){
				mobilepub.diagram.folders.find(">Folder").each(function(){
					items.push({
						id: $(this).attr('ID'),
						name: $(this).attr('Name'),
						childCount: $(this).children().length,
						isImage: false,
						image: defaultImage
					});

					// $("#diagramlist").append('<li><a href="/partials/browsediagram.html?id='+ $(this).attr('ID') +'" data-transition="slide">'+ $(this).attr('Name') +'<span class="ui-li-count">'+ $(this).children().length +'</span></a></li>');
				});
			}else{
				var current = mobilepub.diagram.folders.find("Folder[ID="+ id +"]");

				current.children("Folder").each(function(){
					
					items.push({
						id: $(this).attr('ID'),
						name: $(this).attr('Name'),
						childCount: $(this).children().length,
						isImage: false,
						image: defaultImage
					});
				});

				current.children("Diagram").each(function(){
					items.push({
						id: $(this).attr('ID'),
						name: $(this).attr('Name'),
						childCount: $(this).children().length,
						isImage: true,
						image: '<img class="ui-li-icon" src="/Publication_files/Images/visio.gif" style="top: 12px;left: 16px;">'
					});
				});

				self.setTitle($(current[0]).attr("Name"));
			}

			_.each(items, function(val){
				var icon = val.isImage ? 'data-icon="action"' : '',
					count = val.isImage ? '' : '<span class="ui-li-count">'+ val.childCount +'</span>',
					url= val.isImage ? '/partials/diagram.html?id='+ val.id : '/partials/browsediagram.html?id='+ val.id;

				$("#diagramlist").append('<li '+ icon +'><a href="'+ url +'" data-transition="slide">'+ val.image + val.name + count + '</a></li>');
			});

			// refresh list
			$("#diagramlist").listview('refresh');	

		},
		loadDiagramImage: function(id){
			var self = this;

			var path = self.settings.publicationpath + id + self.settings.diagramImageFile,
				diagramPath = self.settings.publicationpath + id + '/' + id + '_files/';
			self.diagram.currentPath = diagramPath;
			self.diagram.imagescroll = new iScroll('imagewrapper', { zoom:true });	

			$.ajax({
				type: "GET",
				url: path,
				dataType: "xml",
				success: function(xml) {

					//debugger;
					$(xml).find('iServerDiagram').each(function(){

						self.diagram.base = self.buildDiagramInfo(xml);

						self.setTitle($(xml).find('RepositoryName').text());

						//add diagram
						var imagesrc = diagramPath + 'gif_1.gif';
						// $('#im').attr('src','');
						$('#im').attr('src',imagesrc);

						$.get(diagramPath + 'gif_1.html', function(data) {
						  	var map = $(data).find("map");
						  
							$('#im').parent().append(map);
							$('#im').attr("usemap", "#"+ map.attr("name"));
						});
					});

					self.buildDiagramExtraIcons(xml);

					setTimeout(function(){
					    // set size after dom created
					    $('#imagescroller').css('width',$('#im').width());
						$('#imagescroller').css('height',$('#im').height());
						self.diagram.imagescroll.refresh();

					},1000);

				}
			});
		},
		buildDiagramInfo: function(xml){
			var properties = $(xml).find('iServerProperties'),
				attributes = $(xml).find('CustomAttributes'),
				issues = $(xml).find('Issues'),
				relations = $(xml).find('Relations');

			var diagram ={
				properties: {
					repositoryName: properties.find('RepositoryName').text(),
					category: properties.find('Category').text(),
					description: properties.find('Description').text(),
					timestamp: {
						createdOn: properties.find('Timestamp').attr('CreatedOn'),
						createdBy: properties.find('Timestamp').attr('CreatedBy'),
						lastModifiedOn: properties.find('Timestamp').attr('LastModifiedOn'),
						lastModifiedBy: properties.find('Timestamp').attr('LastModifiedBy')
					}
				},
				attributes: attributes.find("Attribute").map(function(i,e){ 
					return {
						name: $(e).find("Name").text(), 
						description: $(e).find("Description").text(),
						value: $(e).find("Value").text(),
						dataType: $(e).find("DataType").text(),  
					};
				}).toArray(),
				// issues: issues.find("Issue").map(function(i,e){ 
				// 	return {
				// 		name: $(e).find("Name").text(), 
				// 		description: $(e).find("Description").text(),
				// 		value: $(e).find("Value").text(),
				// 		dataType: $(e).find("DataType").text(),  
				// 	};
				// }).toArray(),
				// relations: relations.find("Relation").map(function(i,e){ 
				// 	return {
				// 		name: $(e).find("Name").text(), 
				// 		description: $(e).find("Description").text(),
				// 		value: $(e).find("Value").text(),
				// 		dataType: $(e).find("DataType").text(),  
				// 	};
				// }).toArray(),
			};

			return diagram;
		},
		buildDiagramExtraIcons: function(xml){

			//Issues="N" DiagLinks="Y" DocLinks="N"
			$.ajax({	
				type: "GET",
				url: self.diagram.currentPath + "/data.xml",
				dataType: "xml",
				success: function(res) {	
					var diagData = $(res).find("VisioDocument Pages"),
						pageSize = $(xml).find("Pages > Page Dimensions").map(function(i,e){
										return {
											width: {
												unit: $(e).children("Width").attr("Unit"),
												value: $(e).children("Width").text(),
											},
											height:{
												unit: $(e).children("Height").attr("Unit"),
												value: $(e).children("Height").text(),
											}
										};
									})[0];

					// search shapes with diaglinks, issues or doclinks
					$(xml).find('Shapes Shape[DiagLinks="Y"],[Issues="Y"],[DocLinks="Y"]').each(function(){
						var shapeId = $(this).attr("ID"), 
							pageId = $(this).attr("PageID"),
							isDiagLink = $(this).attr("DiagLinks") === "Y",
							isIssues = $(this).attr("Issues") === "Y"
							isDocLink = $(this).attr("DocLinks") === "Y";
						
						// get shape
						$.ajax({
							type: "GET",
							url: self.diagram.currentPath + "/" + $(this).attr("Source"),
							dataType: "xml",
							success: function(shapexml) {				
								
								diagData.find("Pages Page[ID='" + pageId + "'] > Shapes > Shape[ID='"+ shapeId +"']").each(function(){
									var x = $(this).find("XFORM > PinX").text(),
										y = $(this).find("XFORM > PinY").text(),
										div = '<div style="z-index:4; position: relative; opacity: 0.7; filter: alpha(opacity=85); " onclick="OnShapeClick(' + pageId +', ' + shapeId + ')"><img title="iServer diagram links available for this object" src="@imageSrc"></div>';

									var dimensions = $(shapexml).find("Dimensions").map(function(i,e){
										return {
											width: {
												unit: $(e).children("Width").attr("Unit"),
												value: $(e).children("Width").text(),
											},
											height:{
												unit: $(e).children("Height").attr("Unit"),
												value: $(e).children("Height").text(),
											},
											left:{
												unit: $(e).children("Left").attr("Unit"),
												value: $(e).children("Left").text(),
											},
											bottom:{
												unit: $(e).children("Bottom").attr("Unit"),
												value: $(e).children("Bottom").text(),
											},
											right:{
												unit: $(e).children("Right").attr("Unit"),
												value: $(e).children("Right").text(),
											},
											top:{
												unit: $(e).children("Top").attr("Unit"),
												value: $(e).children("Top").text(),
											}
										};
									})[0];

									// ViewMgrPostZoomMDIUpdate() vml_1.js

									// var xLong = self.ConvertXorYCoordinate(dimensions.left.value,  0, pageSize.width.value, imageLeft, imageRight, 0),
        							// yLong = self.ConvertXorYCoordinate(dimensions.top.value,  0, pageSize.height.value, imageTop, imageBottom, 1);

									debugger;	
									var xLong = self.ConvertXorYCoordinate(dimensions.left.value,  0, pageSize.width.value, 0, 543, 0),
    									yLong = self.ConvertXorYCoordinate(dimensions.top.value,  0, pageSize.height.value, 0, 384, 1),
        								scaleX = (/*imageRight*/ 543 - 0) / pageSize.width.value,
        								scaleY = (/*imageBottom*/ 384 - 0) / pageSize.height.value,
        								sWidth = dimensions.width.value * scaleX,
        								sHeight = dimensions.height.value * scaleY;

										// These give values for xLong / yLong that give the CENTRE of the row/column
										// of meta-data indicators.  Individual MDI locations are set in the loop below
									        // if (this.showMDIsPosition == 'left') {
									        //     yLong += Math.floor(sHeight / 2);
									        // } else if (this.showMDIsPosition == 'right') {
									            xLong += sWidth;
									            yLong += Math.floor(sHeight / 2);
									        // } else if (this.showMDIsPosition == 'top') {
									        //     xLong += Math.floor(sWidth / 2);
									        // } else if (this.showMDIsPosition == 'bottom') {
									        //     xLong += Math.floor(sWidth / 2);
									        //     yLong += sHeight;
									        // }
									// var x = xLong - (this.MDIndicatorDivs[i][idx].clientWidth / 2);
					    //             var y = yLong - ((this.MDIndicatorDivs[i][idx].clientHeight * nMDIs) / 2) + MDIoffset;
					    //             MDIoffset += this.MDIndicatorDivs[i][idx].clientHeight;
					    //             this.MDIndicatorDivs[i][idx].style.posLeft = x
					    //             this.MDIndicatorDivs[i][idx].style.posTop = y;

									
									if(isDiagLink){
										div.replace('@imageSrc', "../../Images/hasdiaglinks.gif");
									}

									if(isIssues){
										div.replace('@imageSrc', "../../Images/hasissues.gif");
									}

									if(isDocLink){
										div.replace('@imageSrc', "../../Images/hasdoclinks.gif");
									}

									$("body").append(div);

									$(div).attr('style', 'left:'+ xLong+'px; top:'+ yLong +'px; width:24px; height:24px');
								});
							}
						});
					});

				}
			});
		},
		ConvertXorYCoordinate: function(PosValue, OldMin, OldMax, NewMin, NewMax, MapBackwards)
		{
			var OldMid = (OldMax - OldMin) / 2;
			var NewMid = (NewMax - NewMin) / 2;
			var ConvertResult = 1 * PosValue;
			ConvertResult = ConvertResult - (OldMin + OldMid);
			ConvertResult = ConvertResult / OldMid;
			if(MapBackwards != 0)
			{
				ConvertResult = 0 - ConvertResult;
			}
			ConvertResult = ConvertResult * NewMid;
			ConvertResult = ConvertResult + (NewMin + NewMid);
			return ConvertResult;
		},
		buildCategoryStruct: function(){
			var self = this;
			
			$.ajax({
				type: "GET",
				url: self.settings.publicationpath + self.settings.categoryFile,
				dataType: "xml",
				success: function(xml) {				
					self.category.folders = $(xml).find('PublicationStructure');

					self.category.init = true;
				}
			});
		},
		loadCategoryPage: function(id, name){
			var items =[], 
			defaultImage = '<img class="ui-li-icon" src="/Publication_files/Images/treefolder.gif" style="top: 12px;left: 16px;">'
			self = this;
			
			if(!id && !name){
				mobilepub.category.folders.find(">Folder").each(function(){
					items.push({
						id: $(this).attr('ID'),
						name: $(this).attr('Name'),
						category: $(this).attr('Category'),
						childCount: $(this).children().length,
						isImage: false,
						image: defaultImage
					});
				});
			}else{
				var current;
				if(id){
					current = mobilepub.category.folders.find("Folder[ID="+ id +"]");
				}else{
					current = mobilepub.category.folders.find("Folder[Name='"+ name +"']");
				}

				current.children("Folder").each(function(){
					
					items.push({
						id: $(this).attr('ID'),
						name: $(this).attr('Name'),
						category: $(this).attr('Category'),
						childCount: $(this).children().length,
						isImage: false,
						image: defaultImage
					});
				});

				current.children("Diagram").each(function(){
					items.push({
						id: $(this).attr('ID'),
						name: $(this).attr('Name'),
						category: $(this).attr('Category'),
						childCount: $(this).children().length,
						isImage: true,
						image: '<img class="ui-li-icon" src="/Publication_files/Images/visio.gif" style="top: 12px;left: 16px;">'
					});
				});

				self.setTitle($(current[0]).attr("Name"));
			}

			_.each(items, function(val){
				var icon = val.isImage ? 'data-icon="action"' : '',
					count = val.isImage ? '' : '<span class="ui-li-count">'+ val.childCount +'</span>',
					url= val.isImage ? '/partials/diagram.html?id='+ val.id : '/partials/browsecategory.html?id='+ val.id + '&name=' + val.name;

				$("#categorylist").append('<li '+ icon +'><a href="'+ url +'" data-transition="slide">'+ val.image + val.name + count + '</a></li>');
			});

			// refresh list
			$("#categorylist").listview('refresh');	
		},
		loadDiagramInfoPanel : function(){

				$("#diagraminfolist").empty();

				if(!self.diagram.current){
					self.diagram.current = self.diagram.base;
				}

				// add properties
				var props =[];
				props.push({
					name: "Repository Name",
					value: self.diagram.current.properties.repositoryName 
				},{
					name: "Category",
					value: self.diagram.current.properties.category
				},{
					name: "Description",
					value: self.diagram.current.properties.description
				},{
					name: "Created On",
					value: self.diagram.current.properties.timestamp.createdOn
				},{
					name: "Created By",
					value: self.diagram.current.properties.timestamp.createdBy 
				},{
					name: "LastModified On",
					value: self.diagram.current.properties.timestamp.lastModifiedOn 
				},{
					name: "LastModified By",
					value: self.diagram.current.properties.timestamp.lastModifiedBy 
				});

				$("#diagraminfolist").append('<h3>Properties</h3>');
				var divprop = $('<div class="ui-grid-a">');

				for (var i = 0; i < props.length; i++) {
					
					divprop.append('<div class="ui-block-a">'+ props[i].name +'</div>')
					.append('<div class="ui-block-b"><div class="ui-bar-a">'+ props[i].value +'</div></div>');
				};
				divprop.append('</div>');
				$("#diagraminfolist").append(divprop);

				
				$("#diagraminfolist").append('<h3>Attributes</h3>');
				var divattr = $('<div class="ui-grid-a">');

				_.each(self.diagram.current.attributes, function(val){

					divattr.append('<div class="ui-block-a">'+ val.name +'</div>')
					.append('<div class="ui-block-b"><div class="ui-bar-a">'+ val.value +'</div></div>');

				});

				divattr.append('</div>');
				$("#diagraminfolist").append(divattr);

				//new iScroll('diagraminfowrapper');
				// $("#diagraminfopanel").trigger("updatelayout");

				mobilepub.diagram.diagWrapper.refresh();

				// must clear
				self.diagram.current = undefined;
		}
	}
})();

function OnShapeClick(a,b,evt){
			var path = self.diagram.currentPath + a + "_" + b + '.xml';
			console.log(path);

			$.ajax({
				type: "GET",
				url: path,
				dataType: "xml",
				success: function(xml) {

					// debugger;
					var docId;
					$(xml).find('Relations > Relation').each(function(){
					 docId = $(this).find("Target").attr("DocumentID");
					});

					// $.mobile.changePage('/partials/shapeinfo.html', {
			  //           transition: 'slidedown',
			  //           changeHash: true,
			  //           role: 'dialog'
			  //       });
					self.diagram.current = self.buildDiagramInfo(xml);
					$("#diagraminfopanel").panel("open");

					//getDiagramContent(docId, parent, currentId);
				}
			});
		};
function UpdateTooltip(){

}

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

function getQueryVariable(query, variable) {
if(!query){
	return undefined;
}
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

$(document).on("mobileinit", function(event){ 
	// load settings
	mobilepub.loadSettings();
	
});

$(document).on("pagebeforeshow", '#browsediagrampage',function(event, data){
	if(!mobilepub.diagram.init){
		mobilepub.buildDiagramStruct();
	}
});

$(document).on("pageshow", '#browsediagrampage',function(event, data){
	var parameters = $(this).data("url").split("?")[1];
	mobilepub.loadDiagramPage(getQueryVariable(parameters, "id"));
});

$(document).on("pageshow", '#diagrampage',function(event, data){
	var parameters = $(this).data("url").split("?")[1];
	mobilepub.loadDiagramImage(getQueryVariable(parameters, "id"));
});

$(document).on("pagebeforeshow", '#browsecategorypage',function(event, data){
    if(!mobilepub.category.init){
		mobilepub.buildCategoryStruct();
	}
});


$(document).on("pageshow", '#browsecategorypage',function(event, data){
	var parameters = $(this).data("url").split("?")[1];
	mobilepub.loadCategoryPage(getQueryVariable(parameters, "id"), getQueryVariable(parameters, "name"));
});

$(document).on("pagebeforeshow", '#searchpage',function(event, data){
    
    // Load all files to search


});

$(document).on("panelbeforeopen", '#diagraminfopanel',function(event, data){
	self.loadDiagramInfoPanel();    
});

$(document).on("pageshow",function(event, data){
	if($(".wrapper").length > 0){
		mobilepub.diagram.diagWrapper = new iScroll($(".wrapper")[0]);
	}
});