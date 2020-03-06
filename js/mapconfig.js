//地图保存提交
function saveMap(mapConfig){
	var url = MAPURL + 'map/mapconfig';	
	var method = 'post';
	if(mapConfig.ID){
		url = MAPURL + 'map/mapconfigedit';	
	}
	$.ajax({
		type: method,
		url: url,
		contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(mapConfig),
		success: function (d) {
			if(d.code == 1){
				VueObj.$message('保存成功！');
				VueObj.loadMapConfig(ProjID);
			} else {
				VueObj.$message('保存失败！');
			}
		}
    });
}
//根据项目ID加载地图配置
function loadMapConfig(projID){
	var url = MAPURL + 'map/mapconfigs?proid=' + projID;	
	jQuery.get(url, null,function(data){
		if(data.length > 0){
			if(VueObj){
                VueObj.mapConfig = data[0];
                console.log(data[0])
                VueObj.geoJSONParseUploadURL= MAPURL+ '/ImportBuilding2DB.ashx?mcid='+data[0].ID;
                console.log( VueObj.geoJSONParseUploadURL)
				loadRedlines(data[0].ID);
				loadBuildings(data[0].ID);
				loadVectors(data[0].ID);
			}
		}
	});
}
//保存红线范围
function saveRedline(fileName, mapID, features){
	var url = MAPURL + 'map/redlines';	
	var data = [];

	for(var i = 0;i < features.length;i++){
		
		data.push({
			MCID: mapID,
			FileName: fileName,
			LayerName: features[i].Layer,
			WKT: features[i].Geom
		});
	}
	var method = 'post';
	$.ajax({
		type: method,
		url: url,
		contentType: 'application/json',
		dataType: 'json',
		data: JSON.stringify(data),
		success: function (d) {
			if(d.code == 1){
				VueObj.$message('上传成功！');
			} else {
				VueObj.$message('上传失败！');
			}
		},
		fail: function(d){
			VueObj.buildingLoading = false;
		}
	});
}

//加载红线范围
function loadRedlines(mapID){ 
    //console.log(a)
	var url = MAPURL + 'map/redlines?mapid=' + mapID;	
	jQuery.get(url, null,function(data){
		if(data.length > 0){
			if(VueObj){
				VueObj.redlines = data;		
				//绘制红线
				if(data.length > 0){
					showRedline(data[0].FileName,data);
					var files = [{
						name: data[0].FileName,
						size: 1000,
						status: 'success',
						uid: 0,
						url: ''
					}];
					VueObj.showRedlineList(files);
				}				
			}
		}
	});
}

//显示红线
function showRedline(fileName,features){
	var errorData = false;
	for(var i = 0;i < features.length;i++){
		var WKT = features[i].Geom;
		if(!WKT){
			WKT = features[i].WKT;
		}
		if(WKT.toLowerCase().indexOf("polygon") == -1){
			errorData = true;	
		}
	}		
	if(errorData){
		alert("数据类型错误，请检查数据！");
		return;
	}
	var lyr = L.featureGroup([]).addTo(map);
	
	for(var i = 0;i < features.length;i++){
		var WKT = features[i].Geom;
		if(!WKT){
			WKT = features[i].WKT;
		}
		try{
			
			if(WKT.indexOf("MULTI") != -1){
				var nwkt = "MULTIPOLYGON(((";
				var tWKT = WKT.substring(15,WKT.length - 3);
				if(tWKT.substring(0,1) == "("){
					tWKT = WKT.substring(16,WKT.length - 3);
					nwkt = "MULTIPOLYGON (((";
				}
				WKT = tWKT;
				var awkt = WKT.split(")),((");
				for(var j = 0;j < awkt.length;j++){
					var wk = awkt[j];
					var pwk = wk.split("),(");
					if(j != 0){
						nwkt += ")),((";
					}
					for(var k = 0;k < pwk.length;k++){
						var pk = pwk[k];
						var coords = pk.split(",");
						if(k != 0){
							nwkt += "),(";
						}
						for(var m = 0;m < coords.length;m++){
							var coord = coords[m].split(" ");
							if(m != 0){
								nwkt += ",";
							}
							nwkt += coord[0] + " " + coord[1];
						}

					}
					

				}
				nwkt += ")))";
				WKT = nwkt;
			}else{
				var nwkt = "POLYGON((";
				var tWKT = WKT.substring(9,WKT.length - 2);
				if(tWKT.substring(0,1) == "("){
					tWKT = WKT.substring(10,WKT.length - 2);
					nwkt = "POLYGON ((";
				}
				WKT = tWKT;
				var coords = WKT.split(",");
				for(var m = 0;m < coords.length;m++){
					var coord = coords[m].split(" ");
					if(m != 0){
						nwkt += ",";
					}
					nwkt += coord[0] + " " + coord[1];
				}
				nwkt += "))";
				WKT = nwkt;
			}
			features[i].Geom = WKT;
			features[i].WKT = WKT;
		
			var fea = omnivore.wkt.parse(WKT);
			fea.setStyle({
				color: 'red',
				opacity: 1,
				fillColor: 'red',
				fillOpacity: 0.1,
				weight: 2
			});
			lyr.addLayer(fea);	
		}catch(e){
			
		}
	}
	try{
		var bounds = lyr.getBounds();
		map.fitBounds(bounds);	
	}catch(e){}					
	VueObj.fileFeatures[fileName] = lyr;
	return features;
}

//保存房屋单体范围
function saveBuilding(fileName){
   if(fileName.successinfo!=""){
    VueObj.$message('上传成功！');
     showBuilding(VueObj.mapConfig.ID)
   }else{
    VueObj.$message('上传失败！');
   }
    
   VueObj.buildingLoading = false;
	
	
}

//加载房屋单体数据
function loadBuildings(mapID){ 	
	var url = MAPURL + 'map/buildings?mapid=' + mapID;	
	jQuery.get(url, null,function(data){
		if(data.length > 0){
			if(VueObj){
				VueObj.buildings = data;	
				//绘制房屋单体
				if(data.length > 0){
					showBuilding(mapID);
					var files = [{
						name: data[0].FileName,
						size: 1000,
						status: 'success',
						uid: 0,
						url: ''
					}];
				
					VueObj.showBuildingList(files);
				}
			}
		}
	});
}

//显示房屋单体
function showBuilding(fileName,features){			
    var url = "http://3dmap.skyimin.com:8082/geoserver/xatree/wms?cql_filter=MCID='" + fileName + "'"
    MAPhouse =new L.tileLayer.wms(url, {
		layers:'xatree:mapconfig_building',
        crs:L.CRS.EPSG4326,
        errorTileUrl:"../img/kong.png",
        serverType:new Date().getTime() + "",
		format:'image/png',
		minZoom: 9,
		maxZoom: 19,
		transparent:true
    }).addTo(map);							
	
}

//保存矢量数据
function saveVector(fileName, mapID, features){
	var url = MAPURL + 'map/vectors';	
	var data = [];
	for(var i = 0;i < features.length;i++){
		
		data.push({
			MCID: mapID,
			FileName: fileName,
			LayerName: features[i].Layer,
			WKT: features[i].Geom
		});
	}
	var method = 'post';
	$.ajax({
		type: method,
		url: url,
		contentType: 'application/json',
		dataType: 'json',
		data: JSON.stringify(data),
		success: function (d) {
			if(d.code == 1){
				VueObj.$message('上传成功！');
			} else {
				VueObj.$message('上传失败！');
			}
		},
		fail: function(d){
			VueObj.vectorLoading = false;
		}
	});
}

//加载矢量数据
function loadVectors(mapID){ 
    //console.log(a)
	var url = MAPURL + 'map/vectors?mapid=' + mapID;	
	jQuery.get(url, null,function(data){
		if(data.length > 0){
			if(VueObj){
				VueObj.vectors = data;		
				//绘制红线
				if(data.length > 0){
					showVector(data[0].FileName,data);
					var files = [{
						name: data[0].FileName,
						size: 1000,
						status: 'success',
						uid: 0,
						url: ''
					}];
					VueObj.showVectorList(files);
				}				
			}
		}
	});
}

//显示矢量数据
function showVector(fileName,features){
	var errorData = false;
	for(var i = 0;i < features.length;i++){
		var WKT = features[i].Geom;
		if(!WKT){
			WKT = features[i].WKT;
		}
		if(WKT.toLowerCase().indexOf("polygon") == -1){
			errorData = true;	
		}
	}		
	if(errorData){
		alert("数据类型错误，请检查数据！");
		return;
	}
	var lyr = L.featureGroup([]).addTo(map);
	
	for(var i = 0;i < features.length;i++){
		var WKT = features[i].Geom;
		if(!WKT){
			WKT = features[i].WKT;
		}
		try{
			
			if(WKT.indexOf("MULTI") != -1){
				var nwkt = "MULTIPOLYGON(((";
				var tWKT = WKT.substring(15,WKT.length - 3);
				if(tWKT.substring(0,1) == "("){
					tWKT = WKT.substring(16,WKT.length - 3);
					nwkt = "MULTIPOLYGON (((";
				}
				WKT = tWKT;
				var awkt = WKT.split(")),((");
				for(var j = 0;j < awkt.length;j++){
					var wk = awkt[j];
					var pwk = wk.split("),(");
					if(j != 0){
						nwkt += ")),((";
					}
					for(var k = 0;k < pwk.length;k++){
						var pk = pwk[k];
						var coords = pk.split(",");
						if(k != 0){
							nwkt += "),(";
						}
						for(var m = 0;m < coords.length;m++){
							var coord = coords[m].split(" ");
							if(m != 0){
								nwkt += ",";
							}
							nwkt += coord[0] + " " + coord[1];
						}

					}
					

				}
				nwkt += ")))";
				WKT = nwkt;
			}else{
				var nwkt = "POLYGON((";
				var tWKT = WKT.substring(9,WKT.length - 2);
				if(tWKT.substring(0,1) == "("){
					tWKT = WKT.substring(10,WKT.length - 2);
					nwkt = "POLYGON ((";
				}
				WKT = tWKT;
				var coords = WKT.split(",");
				for(var m = 0;m < coords.length;m++){
					var coord = coords[m].split(" ");
					if(m != 0){
						nwkt += ",";
					}
					nwkt += coord[0] + " " + coord[1];
				}
				nwkt += "))";
				WKT = nwkt;
			}
			features[i].Geom = WKT;
			features[i].WKT = WKT;
			
			var fea = omnivore.wkt.parse(WKT);
			fea.setStyle({
				color: 'red',
				opacity: 1,
				fillColor: 'red',
				fillOpacity: 0.1,
				weight: 2
			});
			lyr.addLayer(fea);	
		}catch(e){
			
		}
	}
	try{
		var bounds = lyr.getBounds();
		map.fitBounds(bounds);	
	}catch(e){}					
	VueObj.fileFeatures[fileName] = lyr;
	return features;
}

//删除空间数据
function deleteMapData(mapID,dataType,fileName){
	var url = MAPURL + 'map/';
	url += dataType + 'delete?mapid=' + mapID + '&filename=' + fileName;
	var data = [];
	var method = 'post';
	$.ajax({
		type: method,
		url: url,
		contentType: 'application/json',
		dataType: 'json',
		data: JSON.stringify(data),
		success: function (d) {
			if(d.code == 1){
				VueObj.$message('删除成功！');
			} else {
				VueObj.$message('删除失败！');
			}
		},
		fail: function(d){
		}
	});
}