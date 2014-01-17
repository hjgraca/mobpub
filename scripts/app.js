var mobilepub = (function () {
	return {
		setTitle: function(title){
			$("div[data-role=header]:visible h1").text(title);
		},

		load: function(){
			$.getJSON("settings.json", function(data) {
				mobilepub.settings = data;
				mobilepub.getTitle();
				$("#appVersion").text(data.version);
				$(".datetime").text(" [" + data.dateTime + "] ");

				mobilepub.buildDiagramStruct();
				mobilepub.buildCategoryStruct();
			});
		},
		getTitle: function(){
			$.ajax({
				type: "GET",
				url: mobilepub.settings.publicationpath + "publicationproperties.xml",
				dataType: "xml",
				success: function(xml) {				
					mobilepub.title = $(xml).find("PublicationProperties > Title").text();
					$("#apptitle").text(mobilepub.title);
					document.title = mobilepub.title;
				}
			});
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
			$("#diagramlist").listview('refresh').trigger("updatelayout");

		},
		loadDiagramImage: function(id, currentPage, currentShape){
			var path = mobilepub.settings.publicationpath + id + mobilepub.settings.diagramImageFile,
				diagramPath = mobilepub.settings.publicationpath + id + '/' + id + '_files/';
			mobilepub.diagram.currentPath = diagramPath;
			mobilepub.diagram.currentId = id;

			mobilepub.diagram.imagescroll = new iScroll('imagewrapper', { zoom:true, zoomStart: 0.5, zoomMin:0.4, zoomMax: 3, mouseWheel: true, wheelAction: 'zoom'});	
currentShape = currentShape;
			$.ajax({
				type: "GET",
				url: path,
				dataType: "xml",
				success: function(xml) {
					$(xml).find('iServerDiagram').each(function(){

						mobilepub.diagram.base = mobilepub.buildDiagramInfo(xml);

						mobilepub.setTitle($(xml).find('RepositoryName').text());

						if(currentPage && currentPage !== "undefined"){
							mobilepub.diagram.currentPage = parseInt($(this).find("Pages Page[ID="+ currentPage +"]").index());
							//mobilepub.diagram.currentPage = parseInt(currentPage);
						}else{
							mobilepub.diagram.currentPage = 0;
						}
						var gif = 'gif_' + (mobilepub.diagram.currentPage + 1);
						
						//add diagram
						 var imagesrc = diagramPath + gif +'.gif';
						// $('#im').attr('src',imagesrc);
						
						// in memory img for size
						$("<img/>")
				        .attr("src", imagesrc)
				        //.css("width", $(window).width())
				        .load(function() {
							$(this).attr("id", "im");
							
							$("#imagescroller").append($(this));
							 mobilepub.diagram.image ={
				            	width: this.width,
				            	height: this.height
				            }
				        	
				        	$.get(diagramPath + gif +'.html', function(data) {

								  	var map = $(data).find("map");
								  
									//$('#im').css({'width': $(window).width(), 'height' : $(window).height()}).parent().append(map);
									$('#im').parent().append(map);
									$('#im').attr("usemap", "#"+ map.attr("name"));
									$("area").attr("href", "#").removeAttr("onmouseover")
									.removeAttr("onfocus").removeAttr("onkeyup");

									$("area").each(function(){ 
										$(this).attr("shapeid" , $(this).attr("onclick").split(",")[1]) 
									});	

								mobilepub.buildDiagramExtraIcons(xml);
					            $('#imagescroller').css({'width': $('#im').width(), 'height' : $('#im').height()});

									$('#im').maphilight({
										wrapClass:true,
										fade:false
									}).ImageMapResize({ origImageWidth: mobilepub.diagram.image.width });

									// $('.iscroll-scroller').trigger( "updatelayout" )

								setTimeout(function(){
									mobilepub.diagram.imagescroll.refresh();

									if(currentShape && currentShape !== "undefined"){
										$("area[shapeid="+ currentShape +"]").data('maphilight',{"alwaysOn":true, "strokeColor":"00ff00","strokeWidth":2,"fillOpacity":0.5})
										.trigger('alwaysOn.maphilight');
									}

								},100);
							});
				        });
					});
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
					},
					pages: properties.find('Pages > Page').map(function(i,e){
						return $(e).attr("ID")
					}).toArray()
				},
				attributes: attributes.find("Attribute").map(function(i,e){ 
					return {
						name: $(e).find("Name").text(), 
						description: $(e).find("Description").text(),
						value: $(e).find("Value").text(),
						dataType: $(e).find("DataType").text(),  
					};
				}).toArray(),
				issues: issues.find("Issue").map(function(i,e){ 
					return {
						name: $(e).find("Name").text(), 
						description: $(e).find("Description").text(),
						actionType: $(e).find("ActionType").text(),
						priority: $(e).find("Priority").text(),  
						status: $(e).find("Status").text(),
						closed: $(e).find("Closed").text(),
						createdOn: issues.find('Timestamp').attr('CreatedOn'),
						createdBy: issues.find('Timestamp').attr('CreatedBy'),
						lastModifiedOn: issues.find('Timestamp').attr('LastModifiedOn'),
						lastModifiedBy: issues.find('Timestamp').attr('LastModifiedBy')
					};
				}).toArray(),
				relations: relations.find("Relation").map(function(i,e){ 
					var target = $(e).find("Target"),
						dest = $(e).find("Destination");
				 	return {
				 		docId: target.attr("DocumentID"),
						docName: target.attr("DocumentName"),
						destExt: $(dest).children("Ext").text(),
						destName: $(dest).children("Name").text(),
			 			destPageId: target.attr("PageID") || 0,
						destShapeId: target.attr("ShapeID") || 0,
						description: $(e).children("Description").text() + " " + $(dest).children("Name").text()
				 	};
				}).toArray()
			};

			return diagram;
		},
		buildDiagramExtraIcons: function(xml){
			$.ajax({	
				type: "GET",
				url: mobilepub.diagram.currentPath + "/data.xml",
				dataType: "xml",
				success: function(res) {						
					mobilepub.diagram.pages = $(xml).find("Pages > Page").map(function(i,e){
						return {
							id: $(e).attr("ID"),
							pageSize : $(e).find("Dimensions").map(function(r,dim){
								return {
									width: {
										unit: $(dim).children("Width").attr("Unit"),
										value: $(dim).children("Width").text(),
									},
									height:{
										unit: $(dim).children("Height").attr("Unit"),
										value: $(dim).children("Height").text(),
									}
								};
							}).toArray()[0]
						};
					});

					var currentPage = mobilepub.diagram.pages[mobilepub.diagram.currentPage],
						diagData = $(res).find("VisioDocument Pages Page[ID='" + currentPage.id + "']");
					
					mobilepub.buildDiagramPages(currentPage.id);

					// search shapes with diaglinks, issues or doclinks
					$(xml).find('Shapes Shape[DiagLinks="Y"][PageID='+ currentPage.id +'], Shape[DiagLinks="True"][PageID='+ currentPage.id +'],[Issues="Y"][PageID='+ currentPage.id +'],[Issues="True"][PageID='+ currentPage.id +'],[DocLinks="Y"][PageID='+ currentPage.id +'],[DocLinks="True"][PageID='+ currentPage.id +']').each(function(){
						var shapeId = $(this).attr("ID"), 
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

								diagData.find("Shapes > Shape[ID='"+ shapeId +"']").each(function(){
									var x = $(this).find("XFORM > PinX").text(),
										y = $(this).find("XFORM > PinY").text(),
										div = $('<div style="z-index:4; position: absolute; opacity: 0.7; filter: alpha(opacity=85)" onclick="mobilepub.navigateToChild(' + currentPage.id +', ' + shapeId + ',\''+ source +'\')"><img class="responsive-image" src=""></div>');

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
										xLong = mobilepub.ConvertXorYCoordinate(dimensions.left.value,  0, currentPage.pageSize.width.value, 0, imageRight, 0),
    									yLong = mobilepub.ConvertXorYCoordinate(dimensions.top.value,  0, currentPage.pageSize.height.value, 0, imageBottom, 1),
        								scaleX = imageRight / currentPage.pageSize.width.value,
        								scaleY = imageBottom / currentPage.pageSize.height.value,
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
										$(div).css({"top": yLong, "left": xLong - $(".responsive-image").width()});

										$(div).clone().prependTo("#imagescroller");
										//$("#imagescroller").prepend(diagDiv);
									}

									if(isIssues){
										$(div).find("img").attr("src", mobilepub.settings.imagesFolder + "hasissues.gif");
										$(div).css({"top": yLong - $(".responsive-image").width(), "left": xLong - $(".responsive-image").width()});
										$(div).attr("onclick",'mobilepub.showShapeInfoByFile(\''+ source +'\')');
										
										$(div).clone().prependTo("#imagescroller");
									}

									if(isDocLink){
										$(div).find("img").attr("src", mobilepub.settings.imagesFolder + "hasdoclinks.gif");
										$(div).css({"top": yLong - $(".responsive-image").width(), "left": xLong - $(".responsive-image").width()});
										$(div).attr("onclick",'mobilepub.navigateToChild(' + currentPage.id +', ' + shapeId + ',\''+ source +'\',\'doc\')');

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
		buildDiagramPages: function(currentPage){
			var url = "/partials/diagram.html?id=" + mobilepub.diagram.currentId + "&page=";

			if(mobilepub.diagram.pages.length === 1){
				// $("#nextpage, #prevpage").remove();
			}else{
				var array = _.pluck(mobilepub.diagram.pages, "id");
				if(mobilepub.diagram.currentPage < mobilepub.diagram.pages.length -1){
					var nextpg = mobilepub.diagram.pages[_.indexOf(array, currentPage) + 1].id; 
					$("#nextpage").attr("href", url + nextpg).removeClass('ui-disabled');
					
					// if(mobilepub.diagram.currentPage == 0){
					// 	$("#prevpage").remove();
					// }
				}else{
					//$("#nextpage").remove();
					if(mobilepub.diagram.currentPage > 0){
					 	var prevpg = mobilepub.diagram.pages[_.indexOf(array, currentPage) - 1].id; 
						$("#prevpage").attr("href", url + prevpg).removeClass('ui-disabled');
					}else{
						// $("#prevpage").remove();
					}
				}
			}
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

				current.children("Document").each(function(){
					items.push({
						id: $(this).attr('ID'),
						name: $(this).attr('Name'),
						category: $(this).attr('Category'),
						ext: $(this).attr('Ext'),
						isDoc: true,
						childCount: $(this).children().length,
						isImage: true,
						image: '<img class="ui-li-icon" src="/Publication_files/Images/word.gif" style="top: 12px;left: 16px;">'
					});
				});

				mobilepub.setTitle($(current[0]).attr("Name"));
			}

			_.each(items, function(val){
				var icon = val.isImage ? 'data-icon="action"' : '',
					count = val.isImage ? '' : '<span class="ui-li-count">'+ val.childCount +'</span>',
					url= val.isImage ? '/partials/diagram.html?id='+ val.id : '/partials/browsecategory.html?id='+ val.id + '&name=' + val.name,
					link = '<a href="'+ url +'" data-transition="slide">';

				if(val.isDoc){
					url = mobilepub.settings.publicationpath + val.id + "/" + val.id + val.ext;
					link = '<a onclick="downloadURL(\''+ url +'\')" data-transition="slide">'
				}	

				$("#categorylist").append('<li '+ icon +'>'+ link + val.image + val.name + count + '</a></li>');	
				
			});

			// refresh list
			$("#categorylist").listview('refresh');	
		},
		loadDiagramInfoPanel : function(){

				$("#propertiesinfolist, #attributesinfolist, #issuesinfolist, #relatedinfolist").empty();

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

				var divprop = $('<div class="ui-grid-a">')
					separator = '<div class="ui-block-a" style="margin-bottom:15px"></div>';

				for (var i = 0; i < props.length; i++) {
					
					divprop.append('<div class="ui-block-a">'+ props[i].name +'</div>')
					.append('<div class="ui-block-b"><div class="ui-bar-a">'+ props[i].value +'</div></div>');
				};
				divprop.append('</div>');
				$("#propertiesinfolist").append(divprop);

				
				// add attributes
				var divattr = $('<div class="ui-grid-a">');
				if(mobilepub.diagram.current.attributes.length === 0){
					divattr.append('<div class="ui-block-a"><small>No attributes</small></div>');
				}else{
					_.each(mobilepub.diagram.current.attributes, function(val){
						divattr.append('<div class="ui-block-a">'+ val.name +'</div>')
						.append('<div class="ui-block-b"><div class="ui-bar-a">'+ val.value +'</div></div>');
					});
				}
				divattr.append('</div>');
				$("#attributesinfolist").append(divattr);

				// add issues
				if(mobilepub.diagram.current.issues.length === 0){
					$("#issuesinfolist").append('<small>No issues</small>');
				}else{

					var issueset = $('<div data-role="collapsible-set" data-inset="false"/>');

					_.each(mobilepub.diagram.current.issues, function(val){
						var divissues = $('<div data-role="collapsible" data-theme="b" data-content-theme="d" data-inset="false"/>').clone();
						var issuegrid = $('<div class="ui-grid-a"/>');
						divissues.append("<h3>"+ val.name +"</h3>");

						Object.keys(val).forEach(function(key) {
							if(key !== "name"){
							    issuegrid.append('<div class="ui-block-a">'+ key +'</div>')
								.append('<div class="ui-block-b"><div class="ui-bar-a">'+ val[key] +'</div></div>');
							}
						});

						issueset.append(divissues.append(issuegrid));
					});
					$("#issuesinfolist").append(issueset.collapsibleset());
				}
				
				// add relations
				//var divrel = $('<div class="ui-grid-a"/>');

				if(mobilepub.diagram.current.relations.length === 0){
					$("#relatedinfolist").append('<small>No relations</small>');
				}else{
					var rel = mobilepub.diagram.current.relations.map(function(val){
						return {
							name: val.destName,
							description: val.description,
							documentName: val.docName,
							ext: val.destExt,
							docId: val.docId,
							pageId: val.destPageId,
							shapeId: val.destShapeId
						};
					});
					var relset = $('<div data-role="collapsible-set" data-inset="false"/>');

					_.each(rel, function(val){
						
						var divrel = $('<div data-role="collapsible" data-theme="b" data-content-theme="d" data-inset="false"/>').clone(),
							relgrid = $('<div class="ui-grid-a"/>'),
							navigate = $("<a href='#' onclick='mobilepub.navigateToRelation(\""+ val.docId+ "\", \""+ val.ext +"\", \""+ val.pageId +"\", \""+ val.shapeId +"\")' class='ui-btn ui-btn-icon-right ui-icon-action'>Navigate</a>").clone();

						divrel.append("<h3>"+ val.name +"</h3>").append(navigate);

						Object.keys(val).forEach(function(key) {
							if(key !== "name" && key !== "ext" && key !== "docId"){
							    relgrid.append('<div class="ui-block-a">'+ key +'</div>')
								.append('<div class="ui-block-b"><div class="ui-bar-a">'+ val[key] +'</div></div>');
							}
						});

						relset.append(divrel.append(relgrid));
					});

					$("#relatedinfolist").append(relset.collapsibleset());
				}

				// must clear
				mobilepub.diagram.current = undefined;
		},
		navigateToRelation : function(docId, ext, pageId, shapeId){
			if(ext === ".doc"){
					downloadURL(mobilepub.settings.publicationpath + docId + "/" + docId + ext);
			}else{
				$.mobile.changePage('/partials/diagram.html?id='+ docId + "&page=" + pageId + "&shapeid=" + shapeId);
			}
		},
		showShapeInfo: function(path, target){
			$.ajax({
				type: "GET",
				url: path,
				dataType: "xml",
				success: function(xml) {
					mobilepub.diagram.current = mobilepub.buildDiagramInfo(xml);

					if(target){
						$(target).trigger('alwaysOn.maphilight');
					}

					if($("#diagraminfopanel").data("mobilePanel")._open){
						mobilepub.loadDiagramInfoPanel(); 
					}else{
						$("#diagraminfopanel").panel("open");
					}
				}
			});
		},
		showShapeInfoByFile: function(file){
			var path = mobilepub.diagram.currentPath + file;
			mobilepub.showShapeInfo(path);
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
							 			destPageId: target.attr("PageID") || 0,
							 			destShapeId: target.attr("ShapeID") || 0,
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
							$.mobile.changePage('/partials/diagram.html?id='+ result.docId + "&page=" + result.destPageId + "&shapeid=" + result.destShapeId);
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
					$("#itemslist").append('<a href="/partials/diagram.html?id='+ opt.items[i].docId + "&page=" + opt.items[i].destPageId + "&shapeid=" + opt.items[i].destShapeId + '" data-transition="slide" class="ui-btn ui-shadow ui-corner-all ui-btn-b">'+ opt.items[i].description +'</a>')	
				}else{
					var url = mobilepub.settings.publicationpath + opt.items[i].docId + "/" + opt.items[i].docId + opt.items[i].destExt;
					$("#itemslist").append('<a onclick="downloadURL(\''+ url +'\')" data-transition="slide" class="ui-btn ui-shadow ui-corner-all ui-btn-b">'+ opt.items[i].description +'</a>')	
				}
			};
		},
		clearAllAreaStyles:function(){
			$("area").each(function(){
				var data = {"strokeColor":"0000ff","strokeWidth":5,"fillOpacity":0.3};
				data.alwaysOn = undefined;
				$(this).data('maphilight',data).trigger('alwaysOn.maphilight');
			});
		}
	}
})();


var downloadURL = function downloadURL(url) {

	$("#filedownload").attr("href", "/partials/fileviewer.html?url=" + url).click();
	//window.location = url;
    // var hiddenIFrameID = 'hiddenDownloader',
    //     iframe = document.getElementById(hiddenIFrameID);
    // if (iframe === null) {
    //     iframe = document.createElement('iframe');
    //     iframe.id = hiddenIFrameID;
    //     iframe.style.display = 'none';
    //     document.body.appendChild(iframe);
    // }
    // iframe.src = url;
};

function OnShapeClick(a,b,evt){
	evt.preventDefault();
	// higlight
	var data = $(evt.currentTarget).mouseout().data('maphilight') || {"strokeColor":"0000ff","strokeWidth":5,"fillOpacity":0.3},
		isOn = !data.alwaysOn;

	mobilepub.clearAllAreaStyles();

	if(!isOn){
		if($("#diagraminfopanel").data("mobilePanel")._open){
			$("#diagraminfopanel").panel( "close" );
		}
	}else{
		// show info
		var path = mobilepub.diagram.currentPath + a + "_" + b + '.xml';
		data.alwaysOn = isOn;
		$(evt.currentTarget).data('maphilight',data);
		mobilepub.showShapeInfo(path, evt.currentTarget);
	}
	
};
function UpdateTooltip(){}

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
	$.mobile.pushStateEnabled = false;
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
	mobilepub.loadDiagramImage(getQueryVariable(parameters, "id"), getQueryVariable(parameters, "page"), getQueryVariable(parameters, "shapeid"));

// $('img[usemap]').load(function(){
// 	console.log("s");
// 	$('img[usemap]').ImageMapResize({ origImageWidth: mobilepub.diagram.image.width });
// });

	// setTimeout(function(){
	    
	// 	$("div:jqmData(role='collapsible')").on("collapsibleexpand", function(event, ui) {
	// 		setTimeout(function(){mobilepub.diagram.diagWrapper.refresh();},10);
	// 	});

	// },1000);

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

    $("#changes").trigger("updatelayout");
});

$(document).on("pagebeforeshow", '#shapechildpopup',function(event, data){
    mobilepub.buildShapePopupOptions();
});

$(document).on("panelbeforeopen", '#diagraminfopanel',function(event, data){
	mobilepub.loadDiagramInfoPanel();  
	$("#diagrambackbtn").hide();
});

$(document).on("panelopen", '#diagraminfopanel',function(event, data){
	$("div:jqmData(role='collapsible')").on("collapsibleexpand", function(event, ui) {
			// setTimeout(function(){mobilepub.diagram.diagWrapper.refresh();},1000);
		});
	
});

$(document).on("panelbeforeclose", '#diagraminfopanel',function(event, data){
	mobilepub.clearAllAreaStyles();
	$("#diagrambackbtn").show();
});

$(document).on("pagebeforeshow", '#fileviewer',function(event, data){
	var parameters = $(this).data("url").split("?")[1];
	$("#filecontainer").append('<iframe src="'+ getQueryVariable(parameters, "url") +'" seamless></iframe>');

// setTimeout(function(){
	
// 	new iScroll('filecontainer', { zoom:true, zoomStart: 0.4, zoomMin:0.2, zoomMax: 3, mouseWheel: true, wheelAction: 'zoom'});
// 	$("#filecontainer").trigger("updatelayout");

// },1000);
	
});

// $(document).on("pageshow",function(event, data){
// 	// setTimeout(function(){
// 	// if($(".wrapper:visible").length > 0){
// 	// 	// mobilepub.diagram.diagWrapper = new iScroll($(".wrapper:visible")[0]);

// 	// 	// mobilepub.diagram.diagWrapper = new Scroller(render, {
// 	// 	// 					zooming: true
// 	// 	// 				});

// 	// 	// mobilepub.diagram.diagWrapper = new EasyScroller(listTable, {
// 	//  //        scrollingX: true,
// 	//  //        scrollingY: true,
// 	//  //        zooming: true
// 	//  //    });
// 	// }
// 	// },100);


// setTimeout(function(){
// 	//new Scroller($(".scroller:visible")[0].parentNode);
// 	//$(".scroller:visible").overscroll();


// },100);
// });

$( document ).on("pageinit", "#searchpage", function() {
    $("#autocomplete").on("filterablebeforefilter", function ( e, data ) {
        var $ul = $( this ),
            $input = $( data.input ),
            value = $input.val(),
            html = "";
        $ul.html( "" );
        if ( value && value.length > 0 ) {
            $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
            //$ul.listview( "refresh" );

			$.each(mobilepub.diagram.folders.find(":iAttrStart(Name, "+ $input.val() +")"), function ( i, val ) {
                    
                    var src = "href='/partials/diagram.html?id=" + $(val).attr("ID") + "'";
					if($(val).is("Folder")){
						html +="<li><a data-transition='slide' href='/partials/browsediagram.html?id="+ $(val).attr("ID") +"'><img class='ui-li-icon' src='"+ mobilepub.settings.imagesFolder + "/treefolder.gif' style='top: 12px;left: 16px;'/>" + $(val).attr("Name") + "</a></div>"
                    }else{
	                    if($(val).is("Document")){
	                    	var url = mobilepub.settings.publicationpath + $(val).attr("ID") + "/" + $(val).attr("ID") + $(val).attr("Ext");
	                		src = 'onclick="downloadURL(\''+ url +'\')"';	
	                    }

	                    html += "<li><a data-transition='slide' "+ src +"><img class='ui-li-icon' src='"+ mobilepub.settings.publicationpath + "/" + $(val).attr("Logo") + "' style='top: 12px;left: 16px;'/>" + $(val).attr("Name") + "</a></li>";
                	}
                });

            $ul.html(html);
            $ul.listview("refresh");
            $ul.trigger("updatelayout");
        }
    });
});


$.expr[':'].iAttrStart = function(obj, params, meta, stack) {
    var opts = meta[3].match(/(.*)\s*,\s*(.*)/);
    return (opts[1] in obj.attributes) && ($(obj).attr(opts[1]).toLowerCase().indexOf(opts[2].toLowerCase()) !== -1);
};


//https://github.com/ftlabs/ftscroller
//https://github.com/cubiq/iscroll/


