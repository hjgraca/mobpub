var mobilepub = (function () {
	return {
		setTitle: function(title){
			$("div[data-role=header]:not(.head):visible h1").text(title);
			mobilepub.diagram.diagramTitle = title;
		},
		load: function(){
			$.getJSON("settings.json", function(data) {
				mobilepub.settings = data;
				mobilepub.getProperties();
				$("#appVersion").text(data.version);
				$(".datetime").text(" [" + data.dateTime + "] ");

				mobilepub.buildDiagramStruct();
				mobilepub.buildCategoryStruct();
			});
		},
		getProperties: function(){
			$.ajax({
				type: "GET",
				url: mobilepub.settings.publicationpath + "publicationproperties.xml",
				dataType: "xml",
				success: function(xml) {				
					mobilepub.title = $(xml).find("PublicationProperties > Title").text();
					mobilepub.home = $(xml).find("PublicationProperties > Navigation > HomePage").attr('DocumentID');
					if(typeof(mobilepub.home) != 'undefined'){
						$('#homediagramlink').show();
					}
					var canSend =$(xml).find("PublicationFeedback").attr("Enabled");
					if(canSend != undefined && canSend.toLowerCase() != "false"){
						canSend = true;
					}else{
						canSend = false;
					}
					mobilepub.feedback ={
						canSendFeedback:  canSend,
						email:  $(xml).find("PublicationContacts > Contact").attr("Email"),
					};

					$("#apptitle").text(mobilepub.title);
					document.title = mobilepub.title;
				}
			});
		},
		diagram:{},
		category:{},
		panzoom:{},
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

		if(window.mobilecheck()){
			mobilepub.diagram.imagescroll = new IScroll('#imagewrapper', { zoom:true, 
				zoomStart: 0.5, zoomMin:0.3, 
				zoomMax: 3,scrollX: true, click:true, tap: true});	
		}else{
			$('#zoomcontrol').show();
			mobilepub.diagram.imagescroll = new IScroll('#imagewrapper');

			mobilepub.panzoom = $('#imagescroller').panzoom({
			    //cursor: 'default',
			    increment: 0.5,
			    minScale: 0.5,
			    maxScale: 4,
			    transition: true,
			    duration: 200,
			    easing: "ease-in-out",
			    $zoomIn: $('#_zi_icon'),
			    $zoomOut: $('#_zo_icon'),
			    $reset: $('#_rs_icon'),
				//startTransform: 'scale(1.1)',
			    focal: {
			        clientX: 10,
			        clientY: 50
			    },
				//contain:'invert'
			});
		}

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
$('#imagescroller').css({'width': "100%", 'height' : "100%"});

								// if(window.mobilecheck()){
					   //          	$('#imagescroller').css({'width': $('#im').width(), 'height' : $('#im').height()});
					   //      	}else{
					   //      		$('#imagewrapper').css({'width': $('#im').width(), 'height' : $('#im').height()});
					   //      	}

									$('#im').maphilight({
										wrapClass:true,
										fade:false
									}).ImageMapResize({ origImageWidth: mobilepub.diagram.image.width });

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

					//$('.responsive-image').remove();					
					mobilepub.buildDiagramPages(currentPage.id);

					var ind = $(xml).find('Navigation > Indicators'),
						showDocLinks = $(ind).attr('ShowDocLinks') == "true",
						showDiagLinks = $(ind).attr('ShowDiagLinks') == "true",
						showIssues = $(ind).attr('ShowIssues') == "true",
						iconPositioning = $(ind).attr('Positioning');


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

									var imageRight = $("#im").width(),
										imageBottom = $("#im").height(),
										xLong = mobilepub.ConvertXorYCoordinate(dimensions.left.value,  0, currentPage.pageSize.width.value, 0, imageRight, 0),
    									yLong = mobilepub.ConvertXorYCoordinate(dimensions.top.value,  0, currentPage.pageSize.height.value, 0, imageBottom, 1),
        								scaleX = imageRight / currentPage.pageSize.width.value,
        								scaleY = imageBottom / currentPage.pageSize.height.value,
        								sWidth = dimensions.width.value * scaleX,
        								sHeight = dimensions.height.value * scaleY;

									            // xLong += sWidth;
									            // yLong += sHeight;
										// These give values for xLong / yLong that give the CENTRE of the row/column
										// of meta-data indicators.  Individual MDI locations are set in the loop below
									        if (iconPositioning == 'left') {
									            yLong += Math.floor(sHeight / 2);
									        } else if (iconPositioning == 'right') {
									            xLong += sWidth;
									            yLong += Math.floor(sHeight / 2);
									        } else if (iconPositioning == 'top') {
									            xLong += Math.floor(sWidth / 2);
									        } else if (iconPositioning == 'bottom') {
									            xLong += Math.floor(sWidth / 2);
									            yLong += sHeight;
									        }
									// var x = xLong - (this.MDIndicatorDivs[i][idx].clientWidth / 2);
					    //             var y = yLong - ((this.MDIndicatorDivs[i][idx].clientHeight * nMDIs) / 2) + MDIoffset;
					    //             MDIoffset += this.MDIndicatorDivs[i][idx].clientHeight;
					    //             this.MDIndicatorDivs[i][idx].style.posLeft = x
					    //             this.MDIndicatorDivs[i][idx].style.posTop = y;
								
									if(isDiagLink && showDiagLinks){

										$(div).find("img").attr("src", mobilepub.settings.imagesFolder + "hasdiaglinks.gif");

										if(!isDocLink && !isIssues){
											$(div).css({"top": yLong - $(".responsive-image").width(), "left": xLong - $(".responsive-image").width()});	
										}else{
											$(div).css({"top": yLong, "left": xLong - $(".responsive-image").width()});
										}

										$(div).clone().prependTo("#imagescroller");
									}

									if(isIssues && showIssues){
										$(div).find("img").attr("src", mobilepub.settings.imagesFolder + "hasissues.gif");
										$(div).css({"top": yLong - $(".responsive-image").width(), "left": xLong - $(".responsive-image").width()});
										$(div).attr("onclick",'mobilepub.showShapeInfoByFile(\''+ source +'\',\'Issues\')');
										
										$(div).clone().prependTo("#imagescroller");
									}

									if(isDocLink && showDocLinks){
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
		showShapeInfo: function(path, target, openInfoLevel){
			$.ajax({
				type: "GET",
				url: path,
				dataType: "xml",
				success: function(xml) {
					mobilepub.diagram.current = mobilepub.buildDiagramInfo(xml);

					var opensShape =true;
					if(supports_html5_storage()){
					 opensShape = isShapeClickActive();
					}

					if(target){
						$(target).trigger('alwaysOn.maphilight');
					}
					
					//$( "[data-role=collapsible-set]" ).children().collapsible( "collapse" );

					if($("#diagraminfopanel").data("mobilePanel")._open){
						mobilepub.loadDiagramInfoPanel(); 
					}else{
						if(opensShape){
							$("#diagraminfopanel").panel("open");
						}
					}

					if(openInfoLevel != undefined){
						if(openInfoLevel == "Issues"){
							$("[data-id=collissues]").collapsible( "expand" );
						}
					}
					

				},error:function(){
					// $("#diagraminfopanel").panel("close");
				}
			});
		},
		showShapeInfoByFile: function(file, openInfoLevel){
			var path = mobilepub.diagram.currentPath + file;
			mobilepub.showShapeInfo(path, undefined, openInfoLevel);
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
						// $.mobile.changePage('/partials/shapechildpopup.html', {
				  //           transition: 'slidedown',
				  //           // changeHash: true,
				  //           // role: 'dialog'
				  //       });
						mobilepub.buildShapePopupOptions();
						$("#multirelationpopup").popup( "open" );
					}
				}
			});
		},
		buildShapePopupOptions: function(){
			console.log(mobilepub.diagram.shapeOptions);
			var opt = mobilepub.diagram.shapeOptions;
			$("#itemslist").empty()
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

	//// if want to show the document in a jqm window
	//$("#filedownload").attr("href", "/partials/fileviewer.html?url=" + url).click();

	window.location = url;
};

function OnShapeClick(a,b,evt){
	evt.preventDefault();
	// higlight
	var data = $(evt.currentTarget).mouseout().data('maphilight') || {"strokeColor":"0000ff","strokeWidth":5,"fillOpacity":0.3},
		isOn = !data.alwaysOn;

	mobilepub.clearAllAreaStyles();

	if(!isOn){
		// if($("#diagraminfopanel").data("mobilePanel")._open){
		// 	$("#diagraminfopanel").panel( "close" );
		// }
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
	//$.mobile.orientationChangeEnabled = false;
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

if(mobilepub.feedback.canSendFeedback){
	$("#commentbtn").removeClass('ui-disabled');
	$("form#commentform input[name=email]").val(mobilepub.feedback.email);


$("#_mr_icon, #_md_icon,#_ml_icon,#_mu_icon").click(function(){
	var pan = $(this).data("pan"),x=0,y=0;
	if(pan=="up"){
		y =-10;
	}else if(pan=="down"){
		y =10;
	}
	else if(pan=="left"){
		x =-10;
	}
	else{
		x =10;
	}
	mobilepub.panzoom.panzoom('pan',x,y,{
		relative:true,
		animate:true});
});

}

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
	
	if(supports_html5_storage()){
		$("#chckShaspeClick").prop('checked', isShapeClickActive()).checkboxradio("refresh");
	}


    $("#chckShaspeClick").change(function(){
		if(supports_html5_storage()){
			localStorage.setItem("openinfoshapeclick", $("#chckShaspeClick").is(':checked'));
		}
    });
});

function isShapeClickActive(){
	return localStorage.getItem("openinfoshapeclick") == "true" ? true : false;
}

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

$(document).on("pagebeforeshow", '#shapechildpopup',function(event, data){
    mobilepub.buildShapePopupOptions();
});

$(document).on("panelbeforeopen", '#diagraminfopanel',function(event, data){
	mobilepub.loadDiagramInfoPanel();  
	$("#diagrambackbtn").hide();

	$("#imagewrapper").css("bottom","0px");
	$(".ui-panel-wrapper").css("position","static");

});

$(document).on("panelopen", '#diagraminfopanel',function(event, data){
	$("div:jqmData(role='collapsible')").on("collapsibleexpand", function(event, ui) {
			// setTimeout(function(){mobilepub.diagram.diagWrapper.refresh();},1000);
		});
	
});

$(document).on("panelbeforeclose", '#diagraminfopanel',function(event, data){
	mobilepub.clearAllAreaStyles();
	$("#diagrambackbtn").show();
	$(".ui-panel-wrapper").css("position","relative");
});

$(document).on("panelclose", '#diagraminfopanel',function(event, data){
	$("#imagewrapper").css("bottom","48px");
	$(".ui-panel-wrapper").css("position","static");
	
});

$(document).on("pagebeforeshow", '#fileviewer',function(event, data){
	var parameters = $(this).data("url").split("?")[1];
	$("#filecontainer").append('<iframe src="'+ getQueryVariable(parameters, "url") +'" seamless></iframe>');
	
});

$(document).on("pageshow",function(event, data){

$("input[data-type=search]").attr({
	autocapitalize:"off", autocorrect:"off", autocomplete:"off"	
});

});

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

$(document).on("click", '#sendComment',function(event, data){
	
	var form = $("form#commentform").serializeObject(),
		subject = "New comment to " + mobilepub.diagram.diagramTitle,
		body = form.name + " commented on " + mobilepub.diagram.diagramTitle + "%0D%0A%0D%0AComment:%0D%0A" + form.comment

	if(form.name == "" || form.comment == ""){
		return;
	}
	// if(!window.mobilecheck()){
	// 	window.open('mailto:'+ form.email +'?subject='+subject+'&body=' + body);
	// 	$("#commentpopup").popup( "close" );

	// }else{
		window.location = 'mailto:'+ form.email +'?subject='+subject+'&body=' + body;	
	// }

	$("#commentpopup").popup("close");
	$("form#commentform").find("input, textarea").val("");
	$("form#commentform input[name=email]").val(mobilepub.feedback.email);
});

$(document).on("click", '#cancelComment',function(event, data){
	$("form#commentform").find("input, textarea").val("");
	$("form#commentform input[name=email]").val(mobilepub.feedback.email);
});

$(document).on("click", '#homediagramlink',function(event, data){
	$.mobile.changePage('/partials/diagram.html?id='+ mobilepub.home);
});

$.expr[':'].iAttrStart = function(obj, params, meta, stack) {
    var opts = meta[3].match(/(.*)\s*,\s*(.*)/);
    return (opts[1] in obj.attributes) && ($(obj).attr(opts[1]).toLowerCase().indexOf(opts[2].toLowerCase()) !== -1);
};


window.mobilecheck = function() {
var check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
return check; }

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

