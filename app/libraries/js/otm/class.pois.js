/*
---

name: Pois

script: class.Pois.js

description: Pois Class that provides POI widget on Google Maps

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: []

provides: [Pois, otm.Pois]

...
*/
var Pois = new Class({
	Implements: [Options, Events],
	
	options: {
		maxZoom: 10,
		enabled: true,
		exclude: []
	},
	
	map: null,
	call: '',
	callback: function(){},
	markers: [],
	isRedrawing: false,

	initialize: function(map, options){
		this.map = map;
		this.setOptions(options);
		this.setupEvents();
	},
	
	setupEvents: function(){
		google.maps.event.addListener(this.map, "idle", this.redraw.bind(this));
	},
	
	redraw: function(){
		this.requestPois();
	},
	
	setupRequest: function(){
		var zoom = this.map.getZoom();
		if (this.options.enabled  && this.options.maxZoom <= zoom ){
			this.call = 'pois.get.marker';
			this.callback = this.drawMarkers;
			return true;
		}
		else {
			this.call = '';
			this.callback = function(){};
		}
		return false;
	},

	requestPois: function(){
		if (!this.setupRequest())
			return;
			
		var envelope = this.map.getBounds();		
		
		new Request.JSON({
			url: otm.url.rpc, 
			onSuccess: this.callback.bind(this),
			data: {
				'call': this.call, 
				'swlat': envelope.getSouthWest().lat(), 
				'swlng': envelope.getSouthWest().lng(),
				'nelat': envelope.getNorthEast().lat(), 
				'nelng': envelope.getNorthEast().lng(),
				'zoom': this.map.getZoom()
			}
		}).get();
	},
	
	drawMarkers: function(response){
		if (response.code == 0)
			return;
		
		// Mark all polylines to be unlinked
		for (var i in this.markers){
			this.markers[i].unlink = 1;
		}

		for (var i = 0; i < response.count; i++){
			var marker;
			
			if (this.options.exclude.indexOf(Number(response.poi[i].id)) != -1)
				continue;
				
			if (this.markers[response.poi[i].id]) // Excisting trail
				delete(this.markers[response.poi[i].id].unlink);
			else{	// new trail
				poi = new google.maps.Marker({
			      position: new google.maps.LatLng(response.poi[i].lat, response.poi[i].lng),
			      icon: otm.icons.poi.landmark,
      			map: this.map
				});   
				poi.poi = 1;
				poi.id = response.poi[i].id;
				poi.name = response.poi[i].name;
				poi.description = response.poi[i].description;
				this.markers[poi.id] = poi;

				google.maps.event.addListener(poi, 'click', function(latlng){
					otm.setHistory();
					window.location = otm.url.view.poi + this.id;
				});

				
				this.fireEvent('onDrawPoi', [poi]);
			}
		}
		
		// Remove pois that are not visable
		this.markers.each(function(poi, id, markers){
			if (poi.unlink && poi.unlink == 1){
				this.fireEvent('onUnlinkPoi', [poi]);
				poi.setMap(null);
				delete(markers[id]);
			}
		}.bind(this));
	}

});
