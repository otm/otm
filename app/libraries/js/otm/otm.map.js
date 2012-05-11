if (otm == undefined) var otm = {};
/*
---

name: otm-map

script: otm.map.js

description: Contains the core map function for the opentrailmap.

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: [otm-config]

provides: [otm-map]

...
*/


otm.trail = null;

otm.trails = null;

otm.map = {
	trail: [],
	trails: [],
	markers: [],
	
	// This is the actual google maps object
	instance: null,
	geocoder: null,
	options: {
		zoom: 2,
		center: null,
      mapTypeId: null
	},
	init: function(options){
		if (!google)
			alert("Google maps not loaded");

		otm.map.options.center = new google.maps.LatLng(0, 0);
      otm.map.options.mapTypeId = google.maps.MapTypeId.ROADMAP;
			
  		var history = window.location.hash.substr(1).parseQueryString();
		if (history.lat && history.lng && history.zoom){ 
			otm.map.options.center = new google.maps.LatLng(history.lat, history.lng);
			otm.map.options.zoom = parseInt(history.zoom);
		}
		else if (options && options.lat && options.lng){
			otm.map.options.center = new GLatLng(options.lat, options.lng);
			otm.map.options.zoom = 12;
		}
		else{
			otm.map.options.center = otm.map.geoLocation();
			otm.map.options.zoom = 12;
		}
		
		otm.map.options.mapTypeControlOptions = {
			mapTypeIds: [
				'OSM', 
				google.maps.MapTypeId.ROADMAP, 
				google.maps.MapTypeId.HYBRID, 
				google.maps.MapTypeId.SATELLITE, 
				google.maps.MapTypeId.TERRAIN
			]
		};

	  	otm.map.geocoder = new google.maps.Geocoder(); 		 
	  	
	  	otm.map.osmMapType = new google.maps.ImageMapType({
			getTileUrl: function(coord, zoom) {
				return "http://tile.openstreetmap.org/" +
				zoom + "/" + coord.x + "/" + coord.y + ".png";
			},
			tileSize: new google.maps.Size(256, 256),
			isPng: true,
			alt: "Visa OpenStreetMap karta",
			name: "OSM",
			maxZoom: 19
		});

		otm.map.instance = new google.maps.Map(document.getElementById("map_canvas"), otm.map.options);
	  	otm.map.instance.mapTypes.set('OSM', otm.map.osmMapType);
		
		return otm.map.instance;
	},
	geoLocation: function(setCenter){
		var center;
		if (google.loader && google.loader.ClientLocation)
			center = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
		else
			center = new google.maps.LatLng(59.2833, 18.05);
		
		if (setCenter)
			otm.map.instance.setCenter(center, 12);
		else
			return center;
	},
	osmMapType: null,
	showAddress: function(address) {
		if (!otm.map.geocoder)
			return false;
			
		if (address.indexOf(',') == -1 && google.loaderClientLocation){
			address = address + ", " + google.loader.ClientLocation.address.country;
		}
		otm.map.geocoder.geocode({'address': address}, function(results, status) {
			if (status != google.maps.GeocoderStatus.OK) {
  					alert(address + " not found");
			}else {
				otm.map.instance.setCenter(results[0].geometry.location, 11);
			}
		});
	},
	search: {
		init: function(){
			var mapSearch = $('mapLocationSearch')
			if (mapSearch){
				mapSearch.addEvent('submit', function(e){
					e.preventDefault();
					otm.map.showAddress(this.address.value); 
					return false;
				});
			}
		}
	}
};

otm.drawTrail = function(trail, options){
	if (!options)
		var options = {};
		
	var length = trail.length;
	var points = [];
	for (var i = 0; i < length; i++){
		points.push(new google.maps.LatLng(trail[i].lat, trail[i].lng));
	}
	
	// create polyline
	var polyline = new google.maps.Polyline({
		path: points,
		strokeColor: options.color ? options.color : otm.color.trail,
		strokeOpacity: options.opacity ? options.opacity : 0.5,
		strokeWeight: options.weight ? options.weight : 2,
		zIndex: options.zIndex ? options.zIndex : null,
		map: options.map ? options.map : otm.map.instance 
	});

	return polyline;		
};

	
otm.onDrawTrail = function(trail){

	/* TODO: on mouse over effect 
	google.maps.event.addListener(trail, 'mouseover', function(latlng){
		window.cursor = 'point';
		$('name').set('text', this.name);
		$('name').set('href', otm.url.view.trail + this.trailId);
		$('name').addEvent('click', otm.setHistory);
		$('length').set('text', this.length + 'km');
		$('grade').set('text', this.grade);	
	});		
	*/	

	var trailinfo = new Element('div', {
		id: trail.id,
		'class': 'trail-info-short',
		events: {
			'mouseover': function(){
				var trail = otm.trails.getTrail(this.get('id'));
				if (!trail){
					return false;
				}
				trail.origColor = trail.strokeColor;
				trail.origOpacity = trail.strokeOpacity;
				trail.setOptions({
					strokeColor: '#9400d3',
					strokeOpacity: 1
				});
				/*
				$('name').set('text', trail.name);
				$('name').set('href', otm.url.view.trail + trail.trailId);
				$('name').addEvent('click', otm.setHistory);
				$('length').set('text', trail.length + 'km');
				$('grade').set('text', trail.grade);
				*/
			},
			'mouseout': function(){
				var trail = otm.trails.getTrail(this.get('id'));
				if  (!trail){
					return false;
				}
				trail.setOptions({
					strokeColor: trail.origColor,
					strokeOpacity: trail.origOpacity
				});
			},
			'click': function(){
				otm.showTrail(trail.id);
			}
		}
	});
	
	var panel = $('trailpanel');
	if (panel.retrieve('empty' , true)){
		panel.empty();
		panel.store('empty', false);
	}	
	trailinfo.grab(new Element('h3',{
		'class': otm.grade[trail.grade],
		text: trail.name
	}));
	
	trailinfo.grab(new Element('p', {
		text: "En bit av beskrivningen"
	}));

	var subinfo = new Element('p', {
		'class': 'subinfo'	
	})

	subinfo.grab(new Element('a', {
		'text': 'GPX',
		href: "#",
		events: {
			'click': function(){console.log('GPX, trialid=' + trail.id);}
		}
	}));
	subinfo.grab(new Element('span', {
		'text': " - "
	}));
	subinfo.grab(new Element('a', {
		'text': 'KML',
		href: "#",
		events: {
			'click': function(){console.log('KML, trialid=' + trail.id);}
		}
	}));
	trailinfo.grab(subinfo);
	panel.grab(trailinfo);
	
	otm.onTrailClick(trail);
};

otm.showTrail = function(id){
	// remove trail
	if (!id){
		if (!otm.trail){
			return false;
		}

		otm.trails.opacity(otm.trails.options.opacity);
		otm.trail.remove;
		delete otm.trail;
		return true;
	}

	if (this.trail){
		otm.trail.remove();
		otm.trails.include();
		delete otm.trail;
	}

	otm.trails.exclude(id);
	otm.trails.opacity(0.1);
	otm.trail = new Trail(id, otm.map.instance);
}

otm.onTrailClick = function(trail){
	google.maps.event.addListener(trail, 'click', function(latlng){
		otm.setHistory();
		if (this.poi)
			window.location = viewpoi + this.poi;
		else if (this.trail)
			window.location = otm.url.view.trail + this.id;
	});

};


otm.onUnlinkTrail = function(trail){
	var ele = $(trail.trailId);
			
	// TODO: Implement in CSS
	if (ele.getFirst().hasClass('top') && ele.getNext())
		ele.getNext().getFirst().addClass('top');
	$(trail.trailId).destroy();
};

otm.onDrawMarker = function(trail){
	google.maps.event.addListener(trail, "mouseover", function(){
		var resEl = $('result');
		resEl.empty();
		var ul = new Element('ul', {'class': 'sidelist'});
		var addTrailData = function(text){
			var li = new Element('li');
			var div = new Element('div', {html: text});
			if (resEl.getChildren().length > 0 && !resEl.contains('firstResult')){
				li.set('id', 'firstResult');
				div.set('class', 'top');
			}
			div.inject(li);
			li.inject(ul);					
		};
		addTrailData('Namn: ' + this.name);
		addTrailData('Längd: ' + this.length + 'km');
		var grade = "";
		switch(this.grade){
		case '1':
		  grade = 'grön';
		  break;
		case '2':
		  grade = 'blå';
		  break;
		case '3':
		  grade = 'röd';
		  break;
		case '4':
		  grade = 'svart';
		  break;
		default:
			grade = this.grade;
		}
		
		addTrailData('Grad: ' + grade);
					
		$('result').grab(ul);	
	});
	otm.onTrailClick(trail);

};

