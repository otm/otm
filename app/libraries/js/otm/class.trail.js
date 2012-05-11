/*
---

name: Trail

script: class.trail.js

description: Trail Class that provides an overlay on Google Maps with trail

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: []

provides: [Trail, otm.Trail]

...
*/
var Trail = new Class({

	Implements: [Options, Events],
	
	options: {
		colorGraded: false,
		color: otm.color.trail,
		polyline: true,
		opacity: 0.5,
		weight : 2,
		center: true,
		url: '/trail/{id}.json',
		call: '',
		overlay: {
			start: false,
			end: false,
			km: false,
			highest: false,
			lowest: false
		},
		events: {
			click: null
		}
		//onDrawTrail: 
		//onUnlinkTrail: 
	},
	
	map: null,
	id: null,
	bounds: null,
	start: null, //marker
	end: null, //marker
	km: [],
	highest: null, //marker
	polyline: null,
	elePolylines: null, //array
	isRedrawing: false,
	
	initialize: function(id, map, options){
		this.setOptions(options);

		this.map = map;
		this.id = id;
		this.bounds = new google.maps.LatLngBounds();
		this.setupControls();
		this.request();	
	},
	
	redraw: function(){
		this.remove()
		this.request();
	},

	request: function(){

		new Request.JSON({
			url: this.options.url.substitute({id: this.id}),
			onSuccess: this.draw.bind(this)
			/*,
			data: {
				'call': this.options.call,
				'id': this.id
			}
			*/
		}).get();
	},
	
	setupControls: function(){
		var ctrlCenter = document.getElementById('centerControl');
		if (ctrlCenter){
			ctrlCenter.addEvent('click', function(e){
				e.preventDefault();
				this.center();
			}.bind(this));		
		}		
		
		var ctrlStartEnd = document.getElementById('startControl');
		if (ctrlStartEnd){
			ctrlStartEnd.addEvent('click', function(e){
				e.preventDefault();
				if (ctrlStartEnd.hasClass('active'))
					ctrlStartEnd.set('text', 'visa start/slut');
				else
					ctrlStartEnd.set('text', 'dölj start/slut');
					
				ctrlStartEnd.toggleClass('active');
				this.toggleEndIcon();
				this.toggleStartIcon();
			}.bind(this));
		}

		var ctrlKm = document.getElementById('kmControl');
		if (ctrlKm){
			ctrlKm.addEvent('click', function(e){
				e.preventDefault();
				if (ctrlKm.hasClass('active'))
					ctrlKm.set('text', 'visa km markeringar');
				else
					ctrlKm.set('text', 'dölj km markeringar');
					
				ctrlKm.toggleClass('active');
				this.toggleKmIcons();
			}.bind(this));
		}
		
		var ctrlEle = document.getElementById('contourTrailControl');
		if (ctrlEle){
			ctrlEle.addEvent('click', function(e){
				e.preventDefault();
				if (ctrlEle.hasClass('active'))
					ctrlEle.set('text', 'visa höjdkurva');
				else
					ctrlEle.set('text', 'dölj höjdkurva');
					
				ctrlEle.toggleClass('active');
				this.toggleElevationOverlay();
			}.bind(this));
		}
		
		var ctrlHigh = document.getElementById('highControl');
		if (ctrlHigh){
			ctrlHigh.addEvent('click', function(e){
				e.preventDefault();
				if (ctrlHigh.hasClass('active'))
					ctrlHigh.set('text', 'visa högsta punkt');
				else
					ctrlHigh.set('text', 'dölj högsta punkt');
					
				ctrlHigh.toggleClass('active');
				this.toggleHighOverlay();
			}.bind(this));
		}

		var ctrlLow = document.getElementById('lowControl');
		if (ctrlLow){
			ctrlLow.addEvent('click', function(e){
				e.preventDefault();
				if (ctrlLow.hasClass('active'))
					ctrlLow.set('text', 'visa lägsta punkt');
				else
					ctrlLow.set('text', 'dölj lägsta punkt');
					
				ctrlLow.toggleClass('active');
				this.toggleLowOverlay();
			}.bind(this));
		}

	},
	
	toggleStartIcon: function(){
		//endIcon
		if (!this.start)
			this.start = new google.maps.Marker({
				position: new google.maps.LatLng(this.polyline.points.start.lat, this.polyline.points.start.lng),
				//icon: (this.polyline.grade) ? startIconUrl + this.polyline.grade + ".png" : altStartIconUrl
				icon: (this.polyline.grade) ? otm.icons.grade[this.polyline.grade] : otm.icons.grade[0] 
			});
		
		if(this.start.map)
			this.start.setMap(null);
		else
			this.start.setMap(this.map);

	},

	toggleEndIcon: function(){
		if (!this.end)
			this.end = new google.maps.Marker({
				position: new google.maps.LatLng(this.polyline.points.end.lat, this.polyline.points.end.lng),
				icon: otm.icons.finish
			});
		
		if(this.end.map)
			this.end.setMap(null);
		else
			this.end.setMap(this.map);
	},	
	
	toggleKmIcons: function(){
		if (this.km.length == 0){
			this.polyline.points.km.each(function(km, i){
				this.km.push(new google.maps.Marker({
					position: new google.maps.LatLng(km.lat, km.lng),
					icon: otm.icons.getNumeric(i+1)
				}));
			}.bind(this));
		}
		
		this.km.each(function(km){
			if (km.map)
				km.setMap(null);
			else
				km.setMap(this.map);
		}.bind(this));
		
	},
	
	toggleHighOverlay: function(){
		if (!this.high)
			this.high = new google.maps.Marker({
				position: new google.maps.LatLng(this.polyline.points.highest.lat, this.polyline.points.highest.lng),
				icon: otm.icons.high
			});
		
		if(this.high.map)
			this.high.setMap(null);
		else
			this.high.setMap(this.map);
		
	},

	toggleLowOverlay: function(){
		if (!this.low)
			this.low = new google.maps.Marker({
				position: new google.maps.LatLng(this.polyline.points.lowest.lat, this.polyline.points.lowest.lng),
				icon: otm.icons.low
			});
		
		if(this.low.map)
			this.low.setMap(null);
		else
			this.low.setMap(this.map);		
	},
	
	toggleElevationOverlay: function(){	
		if (this.polyline.map){
			this.polyline.setMap(null);
			
			if (!!this.elePolylines){
				this.elePolylines.each(function(polyline){
					polyline.setMap(this.map);			
				}.bind(this));
			}
			else{
				new Request.JSON({
					url: otm.url.rpc, 
					onSuccess: this.loadElevationOverlay.bind(this),
					data: {
						call: this.options.call + '.elevation', 
						id: this.polyline.trailId
					}
				}).get();
			}
		}
		else{
			
			this.elePolylines.each(function(polyline){
				polyline.setMap(null);			
			});
			this.polyline.setMap(this.map);
		}
		
	},

	loadElevationOverlay: function(response){
		if (response.code == 0)	
			alert('Unable to load color coded map trail');

		if (!this.elePolylines)
			this.elePolylines = [];
		
		response.trail.each(function(trail){
			var points = [];
			trail.points.each(function(point){
				points.push(new google.maps.LatLng(point.lat, point.lng));
			});
			
			this.elePolylines.push(new google.maps.Polyline({
				path: points,
				strokeColor: trail.color,
				strokeOpacity: this.options.opacity,
				strokeWeight: this.options.weight,
				map: this.map
			}));

		}.bind(this));	
	},
	
	center: function(zoom){
		this.map.fitBounds(this.bounds);
	},
	
	draw: function(response){
		if (response.code == 0)
			return;
		
		// remove polyline
		if (this.polyline){
			this.polyline.setMap(null);
			this.polyline = null;
		}
		
		// set color of trail
		if (this.options.colorGraded && response.grade)
			this.options.color = otm.color.grade[response.grade]
			
		// Create array for initializing the polyline
		var trail = response.polyline;
		var length = trail.length;
		var points = [];
		for (var i = 0; i < length; i++){
			var point = new google.maps.LatLng(trail[i].lat, trail[i].lng)
			points.push(point);
			this.bounds.extend(point);
		}
		
		// create polyline
		var polyline = new google.maps.Polyline({
			path: points,
			strokeColor: this.options.color,
			strokeOpacity: this.options.opacity,
			strokeWeight: this.options.weight,
			map: this.map 
		});
		
		if (this.options.events.click)
			google.maps.event.addListener(polyline, 'click', this.options.events.click);		
		
		if (this.options.center)
			this.center();

		// add meta data to polyline
		polyline.trailId = response.id;
		polyline.name = response.name;
		polyline.grade = response.grade;
		polyline.length = response.distance;
		polyline.points = response.points;
		this.polyline = polyline;
				

		//this.fireEvent('onDrawTrail', [trail]);
		
	},
	
	remove: function(){
		if (this.polyline){
			this.fireEvent('onUnlinkTrail', [this.polyline]);
			this.polyline.setMap(null);
			this.polyline = null;
		}
	}
	
});