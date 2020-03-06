L.TileLayer.WMSProvider = L.TileLayer.extend({

    initialize: function(url, options) { // (type, Object)

        options.filter = filter;
        L.TileLayer.prototype.initialize.call(this, url, options);
        //
    },
    getTileUrl: function (coords) {
        var data = {
            r: L.Browser.retina ? '@2x' : '',
            s: this._getSubdomain(coords),
            x: coords.x,
            y: coords.y,
            z: this._getZoomForUrl() + 1
        };

        return L.Util.template(this._url, L.extend(data, this.options));
    }
});



L.tileLayer.wmsProvider = function(url, options) {
    return new L.TileLayer.WMSProvider(url, options);
};