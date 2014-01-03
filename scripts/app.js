var mobilepub = (function () {
	return {
		setTitle: function(title){
			$("div[data-role=header]:visible h1").text(title);
		},

		load: function(){
			$.getJSON("settings.json", function(data) {
				mobilepub.settings = data;
				$("#appVersion").text(data.version);
				$(".datetime").text(" [" + data.dateTime + "] ");

				mobilepub.buildDiagramStruct();
				mobilepub.buildCategoryStruct();
			});
		},
		buildDiagramChildren: function(item){
			var children = [];

			item.children('Folder').each(function(){             
	            children.push({
					id:$(this).attr('ID'),
					name: $(this).attr('Name'),
					children: mobilepub.buildDiagramChildren($(this))
				});
	         });
			return children;
		},
		diagram:{},
		category:{},
		buildDiagramStruct: function(){
			$.ajax({
				type: "GET",
				url: mobilepub.settings.publicationpath + mobilepub.settings.diagramFile,
				dataType: "xml",
				success: function(xml) {				
					mobilepub.diagram.folders = $(xml).find('PublicationStructure');	
					mobilepub.diagram.init = true;
				}
			});

		},
		loadDiagramPage: function(id){
			var items =[], 
			defaultImage = '<img class="ui-li-icon" src="/Publication_files/Images/treefolder.gif" style="top: 12px;left: 16px;">';

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

				mobilepub.setTitle($(current[0]).attr("Name"));
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
			var path = mobilepub.settings.publicationpath + id + mobilepub.settings.diagramImageFile,
				diagramPath = mobilepub.settings.publicationpath + id + '/' + id + '_files/';
			mobilepub.diagram.currentPath = diagramPath;
			mobilepub.diagram.imagescroll = new iScroll('imagewrapper', { zoom:true });	

			$.ajax({
				type: "GET",
				url: path,
				dataType: "xml",
				success: function(xml) {
					$(xml).find('iServerDiagram').each(function(){

						mobilepub.diagram.base = mobilepub.buildDiagramInfo(xml);

						mobilepub.setTitle($(xml).find('RepositoryName').text());

						//add diagram
						var imagesrc = diagramPath + 'gif_1.gif';
						// $('#im').attr('src','');
						$('#im').attr('src',imagesrc);

						$.get(diagramPath + 'gif_1.html', function(data) {
						  	var map = $(data).find("map");
						  
							//$('#im').css({'width': $(window).width(), 'height' : $(window).height()}).parent().append(map);
							$('#im').parent().append(map);
							$('#im').attr("usemap", "#"+ map.attr("name"));
						});
					});

					mobilepub.buildDiagramExtraIcons(xml);

					setTimeout(function(){
					    // set size after dom created
					    $('#imagescroller').css({'width': $('#im').width(), 'height' : $('#im').height()});
						//$('#imagescroller').css('height',$('#im').height());
						mobilepub.diagram.imagescroll.refresh();

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
			$.ajax({	
				type: "GET",
				url: mobilepub.diagram.currentPath + "/data.xml",
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
					$(xml).find('Shapes Shape[DiagLinks="Y"], Shape[DiagLinks="True"],[Issues="Y"],[Issues="True"],[DocLinks="Y"],[DocLinks="True"]').each(function(){
						var shapeId = $(this).attr("ID"), 
							pageId = $(this).attr("PageID"),
							isDiagLink = $(this).attr("DiagLinks") === "Y" || $(this).attr("DiagLinks") === "True",
							isIssues = $(this).attr("Issues") === "Y" || $(this).attr("Issues") === "True",
							isDocLink = $(this).attr("DocLinks") === "Y" || $(this).attr("DocLinks") === "True",
							source = $(this).attr("Source").trim();
						
						// get shape
						$.ajax({
							type: "GET",
							url: mobilepub.diagram.currentPath + "/" + source,
							dataType: "xml",
							success: function(shapexml) {				

								diagData.find("Pages Page[ID='" + pageId + "'] > Shapes > Shape[ID='"+ shapeId +"']").each(function(){
									var x = $(this).find("XFORM > PinX").text(),
										y = $(this).find("XFORM > PinY").text(),
										div = $('<div style="z-index:4; position: absolute; opacity: 0.7; filter: alpha(opacity=85)" onclick="mobilepub.navigateToChild(' + pageId +', ' + shapeId + ',\''+ source +'\')"><img style="width:24px;height:24px" title="iServer diagram links available for this object" src=""></div>');

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
									var imageRight = $("#im").width(),
										imageBottom = $("#im").height(),
										xLong = mobilepub.ConvertXorYCoordinate(dimensions.left.value,  0, pageSize.width.value, 0, imageRight, 0),
    									yLong = mobilepub.ConvertXorYCoordinate(dimensions.top.value,  0, pageSize.height.value, 0, imageBottom, 1),
        								scaleX = imageRight / pageSize.width.value,
        								scaleY = imageBottom / pageSize.height.value,
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

										$(div).find("img").attr("src", mobilepub.settings.imagesFolder + "hasdiaglinks.gif");
										$(div).css({"top": yLong, "left": xLong - 24});

										$(div).clone().prependTo("#imagescroller");
										//$("#imagescroller").prepend(diagDiv);
									}

									if(isIssues){
										$(div).find("img").attr("src", mobilepub.settings.imagesFolder + "hasissues.gif");
										$(div).css({"top": yLong - 36, "left": xLong - 24});
										$(div).attr("onclick",'mobilepub.navigateToChild(' + pageId +', ' + shapeId + ',\''+ source +'\',\'issue\')');
										
										$(div).clone().prependTo("#imagescroller");
									}

									if(isDocLink){
										$(div).find("img").attr("src", mobilepub.settings.imagesFolder + "hasdoclinks.gif");
										$(div).css({"top": yLong - 24, "left": xLong - 24});
										$(div).attr("onclick",'mobilepub.navigateToChild(' + pageId +', ' + shapeId + ',\''+ source +'\',\'doc\')');

										$(div).clone().prependTo("#imagescroller");
									}

									//$(div).css({"top": yLong, "left": xLong - 24});
									//$("#imagescroller").prepend(div);
									//$(div).attr('style', 'left:'+ xLong+'px; top:'+ yLong +'px; width:24px; height:24px');
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
			$.ajax({
				type: "GET",
				url: mobilepub.settings.publicationpath + mobilepub.settings.categoryFile,
				dataType: "xml",
				success: function(xml) {				
					mobilepub.category.folders = $(xml).find('PublicationStructure');
					mobilepub.category.init = true;
				}
			});
		},
		loadCategoryPage: function(id, name){
			var items =[], 
			defaultImage = '<img class="ui-li-icon" src="/Publication_files/Images/treefolder.gif" style="top: 12px;left: 16px;">';
			
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

				mobilepub.setTitle($(current[0]).attr("Name"));
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

				if(!mobilepub.diagram.current){
					mobilepub.diagram.current = mobilepub.diagram.base;
				}

				// add properties
				var props =[];
				props.push({
					name: "Repository Name",
					value: mobilepub.diagram.current.properties.repositoryName 
				},{
					name: "Category",
					value: mobilepub.diagram.current.properties.category
				},{
					name: "Description",
					value: mobilepub.diagram.current.properties.description
				},{
					name: "Created On",
					value: mobilepub.diagram.current.properties.timestamp.createdOn
				},{
					name: "Created By",
					value: mobilepub.diagram.current.properties.timestamp.createdBy 
				},{
					name: "LastModified On",
					value: mobilepub.diagram.current.properties.timestamp.lastModifiedOn 
				},{
					name: "LastModified By",
					value: mobilepub.diagram.current.properties.timestamp.lastModifiedBy 
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

				_.each(mobilepub.diagram.current.attributes, function(val){

					divattr.append('<div class="ui-block-a">'+ val.name +'</div>')
					.append('<div class="ui-block-b"><div class="ui-bar-a">'+ val.value +'</div></div>');

				});

				divattr.append('</div>');
				$("#diagraminfolist").append(divattr);

				//new iScroll('diagraminfowrapper');
				// $("#diagraminfopanel").trigger("updatelayout");

				mobilepub.diagram.diagWrapper.refresh();

				// must clear
				mobilepub.diagram.current = undefined;
		},
		showShapeInfo: function(path){
			$.ajax({
				type: "GET",
				url: path,
				dataType: "xml",
				success: function(xml) {
					mobilepub.diagram.current = mobilepub.buildDiagramInfo(xml);
					$("#diagraminfopanel").panel("open");
				}
			});
		},
		navigateToChild: function(pageId, shapeId, source, action){
			$.ajax({
				type: "GET",
				url: mobilepub.diagram.currentPath + source,
				dataType: "xml",
				success: function(xml) {
					
					var result = {
						name: $(xml).find("iServerProperties > RepositoryName").text(),
						items: $(xml).find('Relations > Relation').map(function(i,e){
									var target = $(e).find("Target"),
										dest = $(e).find("Destination");
								 	return {
								 		repName: $(e).find("iServerProperties > RepositoryName").text(),
								 		docId: target.attr("DocumentID"),
							 			docName: target.attr("DocumentName"),
							 			destExt: $(dest).children("Ext").text(),
							 			destName: $(dest).children("Name").text(),
							 			description: $(e).children("Description").text() + " " + $(dest).children("Name").text()
								 	};
								}).toArray()
					};

					if(result.items.length === 1){
						result = result.items[0];
						if(action){
							if(action === "doc"){
								downloadURL(mobilepub.settings.publicationpath + result.docId + "/" + result.docId + result.destExt);
							}else if(action === "issue"){

							}
						}else{
							$.mobile.changePage('/partials/diagram.html?id='+ result.docId);
						}
					}else{
						mobilepub.diagram.shapeOptions = result;
						$.mobile.changePage('/partials/shapechildpopup.html', {
				            transition: 'slidedown',
				            // changeHash: true,
				            // role: 'dialog'
				        });

					}
				}
			});
		},
		buildShapePopupOptions: function(){
			console.log(mobilepub.diagram.shapeOptions);
			var opt = mobilepub.diagram.shapeOptions;

			$("#shapepopuptitle").text(opt.name);
			for (var i = 0; i < opt.items.length; i++) {
				if(opt.items[i].destExt.indexOf("html") !== -1){
					$("#itemslist").append('<a href="/partials/diagram.html?id='+ opt.items[i].docId +'" data-transition="slide" class="ui-btn ui-shadow ui-corner-all ui-btn-b">'+ opt.items[i].description +'</a>')	
				}else{
					var url = mobilepub.settings.publicationpath + opt.items[i].docId + "/" + opt.items[i].docId + opt.items[i].destExt;
					$("#itemslist").append('<a onclick="downloadURL(\''+ url +'\')" data-transition="slide" class="ui-btn ui-shadow ui-corner-all ui-btn-b">'+ opt.items[i].description +'</a>')	
				}
			};
		}
	}
})();


var downloadURL = function downloadURL(url) {
    var hiddenIFrameID = 'hiddenDownloader',
        iframe = document.getElementById(hiddenIFrameID);
    if (iframe === null) {
        iframe = document.createElement('iframe');
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    iframe.src = url;
};

function OnShapeClick(a,b,evt){
	evt.preventDefault();
	var path = mobilepub.diagram.currentPath + a + "_" + b + '.xml';
	mobilepub.showShapeInfo(path);
};
function UpdateTooltip(){

}

function getDateTime() {
  now = new Date();
  year = "" + now.getFullYear();
  month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
  day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
  hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
  minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
  second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
  return day + "-" + month + "-" + year + " " + hour + ":" + minute + ":" + second;
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
	mobilepub.load();
});

// $(document).on("pagebeforeshow", '#browsediagrampage',function(event, data){
// 	// if(!mobilepub.diagram.init){
// 	// 	mobilepub.buildDiagramStruct();
// 	// }
// });

$(document).on("pageshow", '#browsediagrampage',function(event, data){
	var parameters = $(this).data("url").split("?")[1];
	mobilepub.loadDiagramPage(getQueryVariable(parameters, "id"));
});

$(document).on("pageshow", '#diagrampage',function(event, data){
	var parameters = $(this).data("url").split("?")[1];
	mobilepub.loadDiagramImage(getQueryVariable(parameters, "id"));
});

// $(document).on("pagebeforeshow", '#browsecategorypage',function(event, data){
//     if(!mobilepub.category.init){
// 		mobilepub.buildCategoryStruct();
// 	}
// });

$(document).on("pageshow", '#browsecategorypage',function(event, data){
	var parameters = $(this).data("url").split("?")[1];
	mobilepub.loadCategoryPage(getQueryVariable(parameters, "id"), getQueryVariable(parameters, "name"));
});

$(document).on("pagebeforeshow", '#searchpage',function(event, data){
    // Load all files to search
});

$(document).on("pagebeforeshow", '#setuppage',function(event, data){
    for (var i = 0; i < mobilepub.settings.changes.length; i++) {
    	mobilepub.settings.changes[i]
    	$("#changes").append("<li>"+ mobilepub.settings.changes[i] +"</li>");
    };
});

$(document).on("pagebeforeshow", '#shapechildpopup',function(event, data){
    mobilepub.buildShapePopupOptions();
});

$(document).on("panelbeforeopen", '#diagraminfopanel',function(event, data){
	mobilepub.loadDiagramInfoPanel();    
});

$(document).on("pageshow",function(event, data){
	if($(".wrapper").length > 0){
		mobilepub.diagram.diagWrapper = new iScroll($(".wrapper")[0]);
	}
});