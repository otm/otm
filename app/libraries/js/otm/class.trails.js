if (otm === undefined) var otm = {};
/*
---

name: Trails

script: class.trails.js

description: Trails Class that provides an overlay on Google Maps with trails

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: []

provides: [Trails, otm.Trails]

...
*/
var Trails = new Class({

	Implements: [Options, Events],
	
	options: {
		color: otm.color.trail,
		colorGraded: true,
		zIndex: null,
		polyline: true,
		overlay: 'auto',
		opacity: 0.5,
		marker: true,
		minZoom: 10, 		// The zoom level to switch from polylines to markers
		maxZoom: 0,
		exclude: []
		//onDrawTrail: 
		//onUnlinkTrail: 
	},
	
	map: null,
	call: '',
	callback: function(){},
	polylines: [],
	markers: [],
	isRedrawing: false,
	_opacity: null,
	
	initialize: function(map, options){
		this.setOptions(options);

		this.map = map;
		this._opacity = this.options.opacity;
			
		this.setupEvents();
		/* Removed temporarly
		google.maps.event.addListenerOnce(this.map, 'bounds_changed', function(){
		 	this.requestTrails();
			this.setupEvents();
      }.bind(this));
      */		
	},
	
	redraw: function(){
			this.requestTrails();
	},

	clear: function(){
		this.polylines.each(function(trail, trailId, polylines){
			this.fireEvent('onUnlinkTrail', [trail]);
			trail.setMap(null);
			delete(polylines[trailId]);
		}.bind(this));
	},	

	/*
	* set the opacity of the trails
	* @var opacity, a value between 0 and 1. if null the opacity will be reset to the 
	* value specified in the options
	*/
	opacity: function(opacity){
		if (!opacity){
			opacity = this.options.opacity;
		}

		this.polylines.each(function(e){
			e.setOptions({
				strokeOpacity: opacity
			})
		});
		this._opacity = opacity;

		return true;
	},

	exclude: function(id){
		if (!id){
			return false;		
		}

		// Check if it's already excluded
		if (this.options.exclude.indexOf(id) == -1){
			this.options.exclude.push(id);
			return true;
		}

		return false;
	},

	include: function(id){
		if (!id){
			this.options.exclude.empty();
			return true;
		}

		var idx = this.options.exclude.indexOf(id)
		if (idx != -1){
			this.options.exclude.splice(idx, 1);
			return true;
		}

		return false;
	},

	getTrail: function(id){
		if(this.polylines[id])
			return this.polylines[id];
		else if (this.markers[id])
			return this.markers[id]
		else
			return false;
	},

	setupEvents: function(){
		google.maps.event.addListener(this.map, 'idle', this.redraw.bind(this));
	},
	
	clearEvents: function(){
		google.maps.event.clearListeners(this.map, 'idle');
	},

	setupRequest: function(){
		var zoom = this.map.getZoom();
		if (this.options.markers  && (this.options.minZoom >= zoom || !this.options.polyline) && this.options.maxZoom <= zoom){
			this.call = 'trails.get.marker';
			this.callback = this.drawMarkers;
			return true;
		}
		else if (this.options.polyline && this.options.maxZoom <= zoom){
				this.call = 'trails.get.polyline';
				this.callback = this.drawTrails;
				return true;
		}
		else 
			return false;
	},

	requestTrails: function(){
		if (!this.setupRequest())
			return;
			
		var envelope = this.map.getBounds();		
		
		new Request.JSON({
			url: '/trail/find.json', 
			onSuccess: this.callback.bind(this),
			data: {
				'swlat': envelope.getSouthWest().lat(), 
				'swlng': envelope.getSouthWest().lng(),
				'nelat': envelope.getNorthEast().lat(), 
				'nelng': envelope.getNorthEast().lng(),
				'zoom': this.map.getZoom()
			}
		}).get();
	},
	
	drawTrails: function(response){
		
		// Mark all polylines to be unlinked
		for (var i in this.polylines){
			this.polylines[i].unlink = 1;
		}
		// Mark all polylines to be unlinked
		for (var i in this.markers){
			this.markers[i].unlink = 1;
		}

		Object.each(response.trails, function(el, i){
			var trail;
			
			if (this.options.exclude.indexOf(Number(response.trails[i].id)) != -1)
				return;
				
			if (this.polylines && this.polylines[response.trails[i].id]) // Excisting trail
				delete(this.polylines[response.trails[i].id].unlink);
			else{	// new trail
				trail = otm.drawTrail(response.trails[i].polyline, {
					map: this.map,
					zIndex: this.options.zIndex,
					color: this.options.colorGraded ? otm.color.grade[response.trails[i].grade] : this.options.color,
					opacity: this._opacity
				});

				trail.trail = 1;
				trail.id = response.trails[i].id;
				trail.name = response.trails[i].name;
				trail.grade = response.trails[i].grade;
				trail.length = response.trails[i].distance;
				this.polylines[trail.id] = trail;
				
				this.fireEvent('onDrawTrail', [trail]);
			}
		}, this);
		
		// TODO: Add this as function
		// Remove trails that are not visable
		this.polylines.each(function(trail, id, polylines){
			if (trail.unlink && trail.unlink == 1){
				this.fireEvent('onUnlinkTrail', [trail]);
				trail.setMap(null);
				delete(polylines[id]);
			}
		}.bind(this));
		
		// Remove markers that are not visable
		this.markers.each(function(trail, id, markers){
			if (trail.unlink && trail.unlink == 1){
				this.fireEvent('onUnlinkMarker', [trail]);
				trail.setMap(null);
				delete(markers[id]);
			}
		}.bind(this));
	},
	
	drawMarkers: function(response){
		if (response.code == 0)
			return;

		// Mark all polylines to be unlinked
		for (var i in this.polylines){
			this.polylines[i].unlink = 1;
		}
		
		// Mark all polylines to be unlinked
		for (var i in this.polylines){
			this.polylines[i].unlink = 1;
		}

		for (var i = 0; i < response.count; i++){
			var trail;
			
			if (this.options.exclude.indexOf(parseInt(response.trails[i].trailId)) != -1)
				continue;
				
			if (this.markers && this.markers[response.trails[i].trailId]) // Excisting trail
				delete(this.markers[response.trails[i].trailId].unlink);
			else{	// new trail
				trail = new google.maps.Marker({
			      position: new google.maps.LatLng(response.trails[i].lat, response.trails[i].lng),  
      			map: this.map,
      			icon: otm.icons.trail
				});   

				trail.trail = 1;
				trail.trailId = response.trails[i].trailId;
				trail.name = response.trails[i].name;
				trail.grade = response.trails[i].grade;
				trail.length = response.trails[i].distance;
				this.markers[trail.trailId] = trail;
				
				this.fireEvent('onDrawTrailMarker', [trail]);
			}
		}
		
		// TODO: Add this as function
		// Remove trails that are not visable
		this.polylines.each(function(trail, trailId, polylines){
			this.fireEvent('onUnlinkTrail', [trail]);
			trail.setMap(null);
			delete(polylines[trailId]);
		}.bind(this));
		
		// Remove markers that are not visable
		this.markers.each(function(trail, trailId, markers){
			if (trail.unlink && trail.unlink == 1){
				this.fireEvent('onUnlinkMarker', [trail]);
				trail.setMap(null);
				delete(markers[trailId]);
			}
		}.bind(this));
	
	}
	
});
