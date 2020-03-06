
var MAPLABELLAYER = null;
var MAPLAYER = null;
var _TiandituSLLabelPath = "http://t{s}.tianditu.gov.cn/cva_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=c&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=e4df97a35d629ba51376541018624b95";
var _TiandituYXLabelPath = "http://t{s}.tianditu.gov.cn/cia_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=e4df97a35d629ba51376541018624b95";
var _TiandituYXPath = "http://t{s}.tianditu.gov.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=87c942f4f4a2b17270f52f797df4537c";

var map = null;
function initMap() {
	var initCenter = Center;
	var initZoom = Zoom;
	map = MAP = new L.map("map", {
		minZoom: 9,
		maxZoom: 19,
		center: initCenter,
		zoom: initZoom,
		zoomControl: false,
		attributionControl: false,
        crs:L.CRS.EPSG4326,
        editable: true,
        doubleClickZoom:false
	});

   
	map.on('drag', function(){
		
    });
    // var drawLayer = new L.featureGroup().addTo(map);
    MAPtu= new L.featureGroup().addTo(map);
    MAThangfei=new L.featureGroup().addTo(map);
    MAPhuzu= new L.featureGroup().addTo(map);
    MAPvillage= new L.featureGroup().addTo(map);
    HUZUTU=new L.featureGroup().addTo(map);
    initMaps( "http://t{s}.tianditu.gov.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=87c942f4f4a2b17270f52f797df4537c")
  
} 


function initMaps(html) {
      
    MAPLAYER = new L.tileLayer(html, { subdomains: [1, 2, 3] , errorTileUrl:"../img/kong.png", minZoom: 9, maxZoom: 17, maxNativeZoom:17,storagetype: 0 }).addTo(map);
          for(var i=0;i<mapscope.length;i++){
       MAPaircraft= new L.tileLayer(mapscope[i].MapURL, { opacity:1.0, errorTileUrl:"../img/kong.png",subdomains: [1, 2, 3], minZoom: 9, maxZoom: 19, storagetype: 0,tiletype:"arcgis" }).addTo(MAThangfei)
          }
        //   MAPaircraft= new L.tileLayer(mapscope[0].MapURL, { opacity:1.0,subdomains: [1, 2, 3], minZoom: 11, maxZoom: 20, storagetype: 0,tiletype:"arcgis" }).addTo(map)
	MAPLABELLAYER = new L.tileLayer(_TiandituYXLabelPath, { subdomains: [1, 2, 3],errorTileUrl:"../img/kong.png", minZoom: 9, maxZoom: 17, maxNativeZoom:17, storagetype: 0 });
    MAPLABELLAYER.addTo(map);  
    var url = "http://3dmap.skyimin.com:8082/geoserver/xatree/wms?cql_filter=MCID='" + treeTypes + "'"
    console.log(url)
       // 矢量数据
       MAPVector =new L.tileLayer.wms(url, {
		layers:'xatree:mapconfig_vectordata',
		crs:L.CRS.EPSG4326,
        format:'image/png',
        errorTileUrl:"../img/kong.png",
		minZoom: 9,
		maxZoom: 19,
		transparent:true
    }).addTo(map);
    // 红线
     MAPredline =new L.tileLayer.wms(url, {
		layers:'xatree:mapconfig_redline',
		crs:L.CRS.EPSG4326,
        format:'image/png',
        errorTileUrl:"../img/kong.png",
		minZoom: 9,
		maxZoom: 19,
		transparent:true
    }).addTo(map);
    wmsmMps()

}

function wmsmMps(){
    //圆点
    var url = "http://3dmap.skyimin.com:8082/geoserver/xatree/wms?cql_filter=MCID='" + treeTypes + "'"
    MAPhouse =new L.tileLayer.wms(url, {
        layers:'xatree:mapconfig_building_point',
		crs:L.CRS.EPSG4326,
        format:'image/png',
        errorTileUrl:"../img/kong.png",
		minZoom: 9,
		maxZoom: 19,
		transparent:true
    }).addTo(map);
    //房屋
    var url = "http://3dmap.skyimin.com:8082/geoserver/xatree/wms?cql_filter=MCID='" + treeTypes + "'"
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


