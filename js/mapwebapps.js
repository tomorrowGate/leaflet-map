
var MAPLABELLAYER = null;
var _TiandituSLLabelPath = "http://t{s}.tianditu.gov.cn/cva_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=c&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=e4df97a35d629ba51376541018624b95";
var _TiandituYXLabelPath = "http://t{s}.tianditu.gov.cn/cia_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=e4df97a35d629ba51376541018624b95";
var _TiandituYXPath = "http://t{s}.tianditu.gov.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=87c942f4f4a2b17270f52f797df4537c";
var map = null;
var CRSObject = null;

function initMap(mapConfig) {
	if(map){
		try{
			map.remove();
		}catch(e){
			//TODO handle the exception
		}
	}
	var initCenter = [30.26,120.14];
	var initZoom = 9;
	var mapOptions = {
		minZoom: 0,
		maxZoom: 22,
		center: initCenter,
		zoom: initZoom,
		zoomControl: false,
		attributionControl: false,
		crs:L.CRS.EPSG4326
	};
	
	var isCustomMap = false;
	if(mapConfig){
		initCenter = [mapConfig.cy, mapConfig.cx];
		initZoom = mapConfig.level;
		mapOptions.center = initCenter;
		mapOptions.zoom = initZoom;
		if(mapConfig.template != 'tianditu'){
			var resolutions = [];
			var sresolutions = mapConfig.resolutions;
			sresolutions = sresolutions.split(',');
			for(var i = 0;i < sresolutions.length;i++){
				try{
					resolutions.push(parseFloat(sresolutions[i]));
				}catch(e){
					//TODO handle the exception
				}
			}
			CRSObject = new L.Proj.CRS(mapConfig.crs, mapConfig.crsproj,
			{
				origin: [mapConfig.orginX ,mapConfig.orginY],  // 将刚刚的 Origin 复制到这里
				resolutions: resolutions
			});
			//let center_latLng = L.latLng(initCenter);
			//let center_latLng_project = crs.project(center_latLng);
			var point = L.point(mapConfig.cx, mapConfig.cy);
			
			mapOptions.center  = CRSObject.unproject(point);
			mapOptions.crs = CRSObject;
			isCustomMap = true;
		} 
	} 
	
	map = MAP = new L.map("map", mapOptions);
	map.on('click', function(e){
	});
	map.on('drag', function(){
		
	});
	if(!isCustomMap){
		new L.tileLayer(_TiandituYXPath, { subdomains: [1, 2, 3], minZoom: 8, maxZoom: 20, storagetype: 0 }).addTo(map);
	}
	
	if(mapConfig){
		for(var i = 0;i < mapConfig.mapURLInput.length;i++){
			new L.tileLayer(mapConfig.mapURLInput[i], { opacity:1.0,subdomains: [1, 2, 3], minZoom: 0, maxZoom: 20, storagetype: 0,tiletype:"arcgis" }).addTo(map);
		}
	}
	MAPLABELLAYER = new L.tileLayer(_TiandituYXLabelPath, { subdomains: [1, 2, 3], minZoom: 8, maxZoom: 20, storagetype: 0 });
    MAPLABELLAYER.addTo(map);
	map.addControl(new L.Control.MousePosition());
}

//图层控制
function layerControl(treeTypes){
	if(_treeTypeLayer != null){
		map.removeLayer(_treeTypeLayer);
	}     
	var url = "http://39.96.47.88:8080/geoserver/xatree/wms?cql_filter=TreeType%20IN%20(" + treeTypes + ")";
	_treeTypeLayer = L.tileLayer.wms(url, {
		layers:'xatree:treelocation',
		crs:L.CRS.EPSG4326,
		format:'image/png',
		maxZoom: 22,
		transparent:true
	}).addTo(map);
	_treeTypeLayer.setOpacity(0.7);
}

var resolutions = [0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 6.866455078125E-4, 3.4332275390625E-4, 1.71661376953125E-4, 8.58306884765625E-5, 4.291534423828125E-5, 2.1457672119140625E-5, 1.0728836059570312E-5, 5.364418029785156E-6, 2.682209014892578E-6, 1.341104507446289E-6, 6.705522537231445E-7, 3.3527612686157227E-7];
function getTreeInfo(x,y){
	var zoom = map.getZoom();
	var resolution = resolutions[zoom];
	var col = (x + 180) / (resolution);
	var colp = col % 256;
	col = Math.floor(col / 256);
	var row = (90 - y) / (resolution);
	var rowp = row % 256;
	row = Math.floor(row / 256);
	
	
	var url = "http://39.96.47.88:8080/geoserver/gwc/service/wmts?VERSION=1.0.0&LAYER=xatree:treelocation&STYLE=&TILEMATRIX=EPSG:4326:" + zoom + "&TILEMATRIXSET=EPSG:4326&SERVICE=WMTS&FORMAT=image/png&SERVICE=WMTS&REQUEST=GetFeatureInfo&INFOFORMAT=application/json&TileCol=" + col + "&TileRow=" + row + "&I=" + colp + "&J=" + rowp;

	jQuery.get(url, null,function(data){
		if(data.features && data.features.length > 0){
			var fea = data.features[0];
			var prop = fea.properties;
			var geom = fea.geometry.coordinates;
			var x = geom[0];
			var y = geom[1];
			debugger
		}
	});
}




//面积计算
function CalArea(latLngs) {
    var pointsCount = latLngs.length,
		area = 0.0,
		d2r = L.LatLng.DEG_TO_RAD,
		p1, p2;

    if (pointsCount > 2) {
        for (var i = 0; i < pointsCount; i++) {
            p1 = latLngs[i];
            p2 = latLngs[(i + 1) % pointsCount];
            area += ((p2.lng - p1.lng) * d2r) *
					(2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
        }
        area = area * 6378137.0 * 6378137.0 / 2.0;
    }

    return Math.abs(area);
}

///////////////////////draw end///////////////////////////////////


