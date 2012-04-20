if (otm == undefined) var otm = {};
/*
---

name: otm-config

script: otm.config.js

description: Contains basic configuration

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: [ ]

provides: [otm-config]

...
*/

otm.url = {
	rpc: '/rpc.php',
	view: {
		trails: '/trail/envelope',
		trail: '/trail/?id=',
		training: '/viewtraining/?id=',
		poi: '/poi/'
	}
};

otm.color = {
	trail: '#ff0000',
	grade: ['#FFFFFF', '#00FF00', '#0000FF', '#FF0000', '#000000']
};

otm.icons = {
	base: '/img/map/',
	grade: [
		'/img/map/cyclingmountainnotrated.png',
		'/img/map/cyclingmountain1.png', 
		'/img/map/cyclingmountain2.png', 
		'/img/map/cyclingmountain3.png', 
		'/img/map/cyclingmountain4.png'
	],
	numeric: '/img/map/km/red',
	finish: '/img/map/finish.png',
	high: '/img/map/up.png',
	low: '/img/map/down.png',
	trail: '/img/map/smallRoundRed.png',
	poi: {
		landmark: '/img/map/smallRoundRed.png'
	},
	getNumeric: function(i){return otm.icons.numeric + i + '.png';}
};

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
					otm.map.showAddress(this.address.value); return false;
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

	google.maps.event.addListener(trail, 'mouseover', function(latlng){
		window.cursor = 'point';
		$('name').set('text', this.name);
		$('name').set('href', otm.url.view.trail + this.trailId);
		$('name').addEvent('click', otm.setHistory);
		$('length').set('text', this.length + 'km');
		$('grade').set('text', this.grade);	
	});		
		

	var li = new Element('li', {
		id: trail.trailId,
		events: {
			'mouseover': function(){
				var trail = otm.trails.getTrail(this.get('id'));
				trail.origColor = trail.strokeColor;
				trail.setOptions({strokeColor: '#9400d3'});
				//currentTrail = this.get('id');
				$('name').set('text', trail.name);
				$('name').set('href', otm.url.view.trail + trail.trailId);
				$('name').addEvent('click', otm.setHistory);
				$('length').set('text', trail.length + 'km');
				$('grade').set('text', trail.grade);
			},
			'mouseout': function(){
				var trail = otm.trails.getTrail(this.get('id'));
				trail.setOptions({strokeColor: trail.origColor});
			}
		}
	});
	
	var result = $('result');
	if (result.retrieve('empty' , true)){
		result.empty();
		result.store('empty', false);
	}	
	var div = new Element('div');

	var a = new Element('a', {
		href: otm.url.view.trail + trail.trailId,
		'events': {
			'click': otm.setHistory
		},
		text: trail.name
	});
	div.grab(a);
	li.grab(div)
	result.grab(li);

	if (!result.getFirst().getFirst().hasClass('top'))
		result.getFirst().getFirst().addClass('top');
	
	otm.onTrailClick(trail);
};


otm.onTrailClick = function(trail){
	google.maps.event.addListener(trail, 'click', function(latlng){
		otm.setHistory();
		if (this.poi)
			window.location = viewpoi + this.poi;
		else if (this.trail)
			window.location = otm.url.view.trail + this.trailId;
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



if (otm == undefined) var otm = {};
/*
---

name: OpenTrailmap

script: otm-core.js

description: Contains the core of the opentrailmap.

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: [otm-config, otm-map]

provides: [otm-core]

...
*/

otm.setHistory = function(){
	window.location.hash = 'lat=' + otm.map.instance.getCenter().lat() + '&lng=' + otm.map.instance.getCenter().lng() + '&zoom=' + otm.map.instance.getZoom();
};


otm.distance = function(p1, p2) {
	var R = 6367445;
	var rad = function(deg){
		return deg*Math.PI/180;
	};
	var dLat  = rad(p2.lat() - p1.lat());
	var dLong = rad(p2.lng() - p1.lng());
	
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(dLong/2) * Math.sin(dLong/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;

	return d.toFixed(3);
};

otm.challange = function(){
	var map = otm.map.init();
	otm.map.instance = map;
	
	var trail = new Trail(13, map, {
		events: {
			click: function(point){
				new Gate(otm.map.instance, point.latLng, otm.trail.polyline, {autoTune: true});
			}
		}		
	});
	otm.trail = trail;
			
	
	$('autoAdd').addEvent('click', function(e){
		e.preventDefault();
		
		this.gates = 0;
		this.dist = 0;
		var path = otm.trail.polyline.getPath();
		path.forEach(function(point, i){
			if (i == 0){
				this.prev = point;
				return;
			}
			
			this.dist = this.dist + Number(otm.distance(this.prev, point));
			if (this.dist > 1000 * this.gates){
				new Gate(otm.map.instance, point, otm.trail.polyline, {autoTune: true, distance: 50});
				this.gates = this.gates + 1;
			}
			this.prev = point
		}.bind(this));
		
		new Gate(otm.map.instance, path.getAt(path.getLength() - 2), otm.trail.polyline, {autoTune: true, distance: 50});
		path.getLength()
	}.bind(this));
	
	$('startGate').addEvent('click', function(e){
		e.preventDefault();
		
		var gate = new Gate(otm.map.instance, otm.trail.polyline.getPath().getAt(0), otm.trail.polyline);
	}.bind(this));
	
	$('addGate').addEvent('click', function(e){
		e.preventDefault();
		
		google.maps.event.addListenerOnce(otm.map.instance, 'click', function(point){
			new Gate(otm.map.instance, point.latLng, otm.trail.polyline);
		});
	});
	
};

otm.refresh = function(){
	var headerHight = 45;
	var contentHeight = window.getSize().y - headerHight;
	$('map_canvas').setStyle('height', contentHeight);
	$$('.auto-size-v').setStyle('height', contentHeight);
	$$('.auto-size-bv').each(function(el){
		var size = el.getComputedSize();
		var totalSize = size.totalHeight + ((el.getStyle('margin-top') == "") ? 0 : parseInt(el.getStyle('margin-top'))) + ((el.getStyle('margin-botom') == "") ? 0 : parseInt(el.getStyle('margin-botom')));
		el.setStyle('height', contentHeight-(totalSize-size.height));
	});
	$('ds-v').getChildren().setStyle('height', contentHeight);
	if (otm.map.instance)
		google.maps.event.trigger(otm.map.instance, 'resize');
};

otm.viewTrailsFluid = function(){
	var opts = window.location.search.substr(1).parseQueryString();
	var options;
	var timer;
	
	otm.refresh();
	window.addEvent('resize', function(){
	  $clear(timer);
	  timer = (otm.refresh).delay(50);
	});
	
	$$('.trail-info-short').addEvent('click', function(){
		$('trail-info').removeClass('hide');
		var trails = new Fx.Tween('trails-info', {
			transition: 'quad:out',
			duration: 1000,
			property: 'right'
		});
		var trail = new Fx.Tween('trail-info', {
			transition: 'quad:out',
			duration: 1000,
			property: 'right'
		});
		trails.start(0, -350);
		trail.start(350, 0);
	});
	
	$$('.panel-arrow').addEvent('click', function(){
		var trails = new Fx.Tween(this.getParent('.sidebar'), {
			transition: 'linear',
			duration: 500,
			property: 'right'
		});
		var map = new Fx.Tween('map', {
			transition: 'linear',
			duration: 500,
			property: 'margin-right'
		});
		var redraw = function(){
			google.maps.event.trigger(otm.map.instance, 'resize');
			new MapControl(otm.map.instance, {
				controls: ['showPanel'], 
				restore: {
				action: function(){window.location = otm.url.view.trails;}
			}
		});

		};
		trails.start(-350);
		map.start(0).chain(redraw);

	});		
	
	if (opts.fullscreen && opts.fullscreen == 1)
		$('map_canvas').setStyle('height', window.innerHeight-70);

	var map = otm.map.init();
			
	otm.trails = new Trails(map, options);
	otm.pois = new Pois(map, {maxZoom: 1});
};


otm.viewTrails = function(){
	var opts = window.location.search.substr(1).parseQueryString();
	var options;
	
	if (opts.fullscreen && opts.fullscreen == 1)
		$('map_canvas').setStyle('height', window.innerHeight-70);

	var map = otm.map.init();
	
	if (opts.fullscreen && opts.fullscreen == 1){
		new MapControl(map, {
			controls: ['restore'], 
			restore: {
				action: function(){window.location = otm.url.view.trails;}
			}
		});
		options = {
			onDrawTrail: otm.onTrailClick
		};
	}
	else{
		new MapControl(map, {
			controls: ['maximize'], 
			maximize: {
				action: function(){window.location = otm.url.view.trails + '?fullscreen=1';}
			}
		});
		options = {
			onDrawTrail: otm.onDrawTrail,
			onUnlinkTrail: otm.onUnlinkTrail,
			onDrawTrailMarker: otm.onDrawMarker
		};
	}
	otm.map.search.init();
	
	options.markers = true;
	otm.trails = new Trails(map, options);
	otm.pois = new Pois(map, {maxZoom: 1});
};
	
otm.viewTrail = function(){
	var opts = window.location.search.substr(1).parseQueryString();
	var id = (opts.id) ? opts.id : -1;
	
	var map = otm.map.init();
	new Trail(id, map);

	if (opts.fullscreen && opts.fullscreen == 1){
		$('map_canvas').setStyle('height', window.innerHeight-70);
		new MapControl(map, {
			controls: ['allTrails', 'restore'],
			restore: {
				id: id,
				action: function(){var _id = id; window.location = otm.url.view.trail + _id;}
				
			},
			allTrails: {
				id: id
			}
		});
		return;
	}
			
	new MapControl(map, {
		controls: ['maximize'], 		
		maximize: {
			id: id,
			action: function(){var _id = id; window.location = otm.url.view.trail + _id + '&fullscreen=1';}
		}
	});
	new Likes('star', id);		
	
	new Request.JSON({
		url: otm.url.rpc, 
		onSuccess: function(response){
			if (response.error){
				if (console && console.log)
					console.log(response.error);
				return false;
			}
				
			var series = [{
				name: 'Höjd över havet (m)',
   			color: '#177245',
   			data: response.data
      	}];
			new Chart('contourLine', {series: series});
		},
		data: {
			call: 'trail.get.elevation', 
			id: id
		}
	}).get();
	
	//setupControl(true);
	//setupMap({'fullscreen': true});

};

otm.viewTraining = function(){
	var opts = window.location.search.substr(1).parseQueryString();
	var id = (opts.id) ? opts.id : -1;

	var map = otm.map.init();
	otm.trail = new Trail(id, map, {call: 'training.get.polyline'});

	if (opts.fullscreen && opts.fullscreen == 1){
		$('map_canvas').setStyle('height', window.innerHeight-70);

		new MapControl(map, {
			controls: ['allTrails', 'restore'],
			restore: {
				id: id,
				action: function(){var _id = id; window.location = otm.url.view.training + _id;}
				
			},
			allTrails: {
				id: id
			}
		});
	}
	else{
		new MapControl(map, {
			controls: ['maximize'], 		
			maximize: {
				id: id,
				action: function(){var _id = id; window.location = otm.url.view.training + _id + '&fullscreen=1';}
			}
		});

		otm.viewControl();

		new Request.JSON({
			url: otm.url.rpc, 
			onSuccess: function(response){
				var graphs = $('graphs');
				if (response.datasets.altitude){
					var holder = new Element('div');	
					var series = [{
						name: 'Höjd över havet (m)',
						shortname: 'm ö.h.',
         			color: '#177245',
         			data: response.datasets.altitude.data
         			//unit: 'm'
	         	}];
	         	if (response.datasets.heartrate)
						series.push({
							name: 'Puls (slag/min)',
							shortname: 'Puls',
							color: '#fc6355',
							type: 'line',
							yAxis: 1,
							data: response.datasets.heartrate.data
							//unit: 'bpm'
						});
					new Chart(graphs, {series: series});
				}
			},
			data: {
				call: 'training.get.graphs', 
				id: id
			}
		}).get();
	}

};
	
otm.workoutTable = function(id){
	var rows = document.id('workouts').getElement('tbody').getElements('tr');

	rows.each(function(tr, trCount){
		tr.addEvent('click', function(){
			window.location = otm.url.view.training + tr.get('id').slice(2);
		});
		tr.getElements('td.delete').addEvent('click', function(e){
			e.preventDefault();
			new Event(e).stop();
			if (confirm('Vill du verkligen tabort träningsrundan?')){
				new Request.JSON({
					url: otm.url.rpc, 
					onSuccess: function(callback){
						if (callback.code == 1)
							tr.dispose();
						else
							alert('Det gick inte att ta bort träningsrundan');
					},
					data: {
						call: 'training.delete',
						id: tr.get('id').slice(2)
					}
				}).get();					
			}
		});
	});
};
	
otm.viewControl = function(){
	var viewcontrol = $('viewcontrol');
	if (!viewcontrol)
		return false;
		
	var context = new ContextMenu({
		targets: '#viewcontrol', //menu only available on links
		menu: 'contextmenu',
		trigger: 'click',
		targetParent: true,
		actions: {
			startend: function(element,ref) {
				otm.trail.toggleStartIcon();
				otm.trail.toggleEndIcon();
				element.toggleClass('enabled');
				if (element.hasClass('enabled'))
					element.set('text', 'dölj start/slut');
				else
					element.set('text', 'visa start/slut');
			},
			kmMarkers: function(element, ref){
				otm.trail.toggleKmIcons();
				element.toggleClass('enabled');
				if (element.hasClass('enabled'))
					element.set('text', 'dölj km markeringar');
				else
					element.set('text', 'visa km markeringar');
			},
			highest: function(element, ref){
				otm.trail.toggleHighOverlay();
				element.toggleClass('enabled');
				if (element.hasClass('enabled'))
					element.set('text', 'dölj högsta punkt');
				else
					element.set('text', 'visa högsta punkt');
			},
			lowest: function(element, ref){
				otm.trail.toggleLowOverlay();	
				element.toggleClass('enabled');
				if (element.hasClass('enabled'))
					element.set('text', 'dölj lägsta punkt');
				else
					element.set('text', 'visa lägsta punkt');
			},
			contour: function(element, ref){
				otm.trail.toggleElevationOverlay();
				element.toggleClass('enabled');
				if (element.hasClass('enabled'))
					element.set('text', 'dölj höjdkurva');
				else
					element.set('text', 'visa höjdkurva');
			},	
			center: function(element, ref){
				otm.trail.center();
			}
		},
		//offsets: { x:-104, y:11 }
		offsets: { x:-145, y:11 }
	});
	
	//sample usages of the enable/disable functionality
	/*
	$('enable').addEvent('click',function(e) { e.stop(); context.enable(); });
	$('disable').addEvent('click',function(e) { e.stop(); context.disable(); });
	$('enable-copy').addEvent('click',function(e) { e.stop(); context.enableItem('copy'); });
	$('disable-copy').addEvent('click',function(e) { e.stop(); context.disableItem('copy'); });
	*/

};

otm.viewPoi = function(){
	var id = 0;
	var opts = window.location.search.substr(1).parseQueryString();
	if (opts.id){
		id = opts.id;	
	}
	var map = otm.map.init();

	new Request.JSON({
		url: otm.url.rpc, 
		onSuccess: function(callback){
			if (callback.code == 1){
				poi = new google.maps.Marker({
			      position: new google.maps.LatLng(callback.lat, callback.lng),
			      icon: otm.icons.poi.landmark,
      			map: otm.map.instance
				});
				otm.map.instance.setCenter(poi.getPosition());
				
				$('centerControl').addEvent('click', function(e){
					e.preventDefault();
					otm.map.instance.panTo(poi.getPosition());
				});
			}
			else{
				console.log("callback error: " + callback.error);
			}
		}
	}).get({
		'call': 'getPoi', 
		'id': id
	});

	SqueezeBox.initialize({
		handler: 'image',
		overlayOpacity: 0.2
	});
	
	
	SqueezeBox.assign($$('.thumbnail'));
};
	


/*
---

name: Chart

script: class.chart.js

description: Chart Class that provides an interface to Highcharts.

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: []

provides: [Chart, otm.Chart]

...
*/
var Chart = new Class({
	Implements: [Options, Events],
	
	options: {
		series: null,
		title: null,
		id: null,
		y: {
			title: '',
			unit: ''
		}
	},

	target: null,
	chart: null,

	initialize: function(target, options){
		this.setOptions(options);
		this.target = target;
		
		if (!this.options.series && this.options.call && this.options.id)
			this.request();
		else if(this.options.series){
			//this.options.title = this.options.dataset.title;
			//this.options.y.unit = this.options.dataset.unit.y;
			/*
			[{
	         name: 'Altitude',
	         color: '#177245',
	         data: dataArray
	      }]
	      */
			this.createChart(this.options.series);
		}				
	},

	request: function(){
		new Request.JSON({
			url: otm.url.rpc, 
			onSuccess: this.requestCallback.bind(this),
			data: {
				call: this.options.call, 
				id: this.options.id
			}
		}).get();
	},
	
	requestCallback: function(response){
		if (response.status == 0){
			alert('unable to load graph data: ' + response.errorMessage);
			return;
		}
		
		if (response.data)
			this.createChart(response.data);
			
	},
	
	createChart: function(series){
		var self = this;
		var yAxis = [
		{
	   	labels: {
	      	formatter: function() {
	      		return this.value + ((series[0].unit) ? series[0].unit : '');
	      	}
	      },
	      title: {
	      	enabled: true,
	      	text: ((series[0].name) ? series[0].name : ''),
	      	margin: 35
	      }
	   },
		{
			labels: {
	      	formatter: function() {
	      		return this.value + ((series[1] && series[1].unit) ? series[1].unit : '');
	      	}
	      },
	      opposite: true,
	      title: {
	      	enabled: true,
	      	text: ((series[1] && series[1].name) ? series[1].name : ''),
	      	margin: 40
	      }
		}];
		this.chart = new Highcharts.Chart({
	      chart: {
	         renderTo: this.target, 
	         defaultSeriesType: 'area',
	         width: document.getElementById('map_canvas').get('width'),
	         height: 250,
	      	//zoomType: 'x',
	         margin: [10, 55, 60, 50] //top, right, bottom, left
	      },
	      credits:{
	      	enabled: false
	      },
	      title:{
	      	text: this.options.title
	      },
	      yAxis: yAxis,
	      xAxis: {
		   	labels: {
		      	formatter: function() {
		      		return this.value/1000;
		      	}
		      }	      
	      },
	      plotOptions: {
         	area: {
         		animation: false,
         		allowPointSelect: false,
         		threshold: -100000,
            	marker: {
               	enabled: false,
	               symbol: 'circle',
	               radius: 2,
	               states: {
	                  hover: {
	                     enabled: false
	                  }
	               }
	            }
         	},
         	line: {
         		animation: false,
         		lineWidth: 1,
         		allowPointSelect: false,
         	   marker: {
               	enabled: false,
	               symbol: 'circle',
	               radius: 2,
	               states: {
	                  hover: {
	                     enabled: false
	                  }
	               }
	            },
	            states: {
	            	hover:{
	            		lineWidth: 1
	            	}
	            }
         	}
      	},
      	tooltip: {
      		enabled: false
      		/*
	         formatter: function() {
	         	//return this.options.title + ': ' + Highcharts.numberFormat(this.y, 0, null, ' ') + this.options.y.unit;
	         	return this.series.name + ': ' + Highcharts.numberFormat(this.y, 0, null, ' ') + self.options.y.unit;

	         }*/
	      },
	      legend:{
	      	enabled: true
	      },
	      series: series
	   });
	}
});

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
		call: 'trail.get.polyline',
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
			url: otm.url.rpc, 
			onSuccess: this.draw.bind(this),
			data: {
				'call': this.options.call,
				'id': this.id
			}
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
		var trail = response.trail;
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

/*
---

name: Line

script: class.line.js

description: Line Class that provides a line widget in Google Maps

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: []

provides: [Line, otm.Line]

...
*/
var Line = new Class({
	Implements: [Options],
	Binds: ['intersect'],
	
	options: {
		display: true
	},
	
	p1: null,
	p2: null,
	polyline: null,
	map: null,
	
	initialize: function(pt1, pt2, options){
		this.map = (options.map) ? options.map : null;
		options.map = null;
		this.setOptions(options);
		
		this.p1 = pt1;
		this.p2 = pt2;
		
		if (this.map)
			this.polyline = new google.maps.Polyline({
				map: this.map,
				path: [pt1, pt2]				
			});

		this._calculate();
	},

	update: function(pt1, pt2){
		this.p1 = pt1;
		this.p2 = pt2;
		this.polyline.getPath().setAt(0, this.p1);
		this.polyline.getPath().setAt(1, this.p2);
		this._calculate();
	},	
	
	// y => lat
	_calculateDDD: function(){
		this.dx = this.p1.lng() - this.p2.lng();
		this.dy = this.p1.lat() - this.p2.lat();  
	},
	
	_calculate: function(){
		this.xm = (this.p1.lat()/2 + this.p2.lat()/2);
		this.ym = (this.p1.lng() + this.p2.lng())/2;
		 
		this.a = this.p2.lat() - this.p1.lat();
		this.b = this.p1.lng() - this.p2.lng();
		this.c = this.a * (this.p1.lng() - this.xm) + this.b * (this.p1.lat() - this.ym);	
	},
	
	_intersect: function(line, doNotReverceCheck){
		var c1 = this.a * (line.p1.lng() - this.xm) + this.b * (line.p1.lat() - this.ym) - this.c;
		var c2 = this.a * (line.p2.lng() - this.xm) + this.b * (line.p2.lat() - this.ym) - this.c;
		
		// check if point is on the line		
		if (c1 == 0 || c2 == 0)
			return true;
		
		// check if the points are on different sides of the line
		if ((c1 > 0 && c2 < 0) || (c1 < 0 && c2 > 0)){
			if (doNotReverceCheck)
				return true;
			else
				return new Line(line.p1, line.p2)._intersect(this, true);
		}
		
		return false; 
	},
	
	
	intersect: function(polyline){
		var path = polyline.getPath();
		
		var pLatLng;
		try{
		path.forEach(function(cLatLng, idx){
			if (idx == 0){
				pLatLng = cLatLng;
				return;
			}
				
			if (this._intersect({p1: pLatLng, p2: cLatLng})){
				throw 'intersect';
			}
			
			pLatLng = cLatLng;
		}.bind(this));
		} catch (exception){
			if (exception == 'intersect')
				return true;
		}
		return false;
	} 
	
	
});


/*
---

name: Gate

script: class.gate.js

description: Gate Class that provides an gate widget in Google Maps.

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: [Trail, Line]

provides: [Gate, otm.Gate]

...
*/
var Gate = new Class({
	Implements: [Options, Events],
	
	options: {
		trail: null,
		autoTune: false,
		distance: 12,
		heading: 90,
		author: 'nils',
		events: {
			rightclick: Function.from(true)
		}
		//onDelete
	},
	
	map: null,
	marker1: null,
	marker2: null,
	polyline: null,
	line: null,
	
	initialize: function(map, point, trail, options){
		this.setOptions(options);
		this.map = map;
		this.trail = trail;
				
		if (this.options.autoTune){
			var min = {
				dist: 99999999,
				idx: -1,
				point: null
			};
			
			var path = this.trail.getPath();
			path.forEach(function(latLng, i){
				var _min = min; 
				var _point = point;
				var dist = google.maps.geometry.spherical.computeDistanceBetween(_point, latLng);
				if (_min.dist > dist){
					_min.dist = dist;
					_min.idx = i;
					_min.point = latLng;
				}
			});
			this.options.heading = google.maps.geometry.spherical.computeHeading(path.getAt(min.idx-1), path.getAt(min.idx+1));
			point = min.point;
			
		}

		
		this.marker1 = new google.maps.Marker({
			map: this.map,
			position: new google.maps.geometry.spherical.computeOffset(point, this.options.distance, this.options.heading - 90),
			draggable: true,
			raiseOnDrag: false,
			flat: true,
			title: 'Drag me!'
		});
		this.marker2 = new google.maps.Marker({
			map: this.map,
			position: new google.maps.geometry.spherical.computeOffset(point, this.options.distance, this.options.heading + 90),
			raiseOnDrag: false,
			flat: true,
			draggable: true,
			title: 'Drag me!'
		});
		this.line = new Line(this.marker1.getPosition(), this.marker2.getPosition(), {map: this.map});
		
		Event.Keys.shift = 16;

		var myKeyboard = new Keyboard({
			events: { 
				'keydown:shift': function(){
					this.shift = true;
				}.bind(this),
				'keyup:shift': function(){
					this.shift = true;
				}.bind(this)
			}
		});
		myKeyboard.activate()	
		
		window.addEvent('keydown', function(event){
			if (event.key == "shift") this.shift = true;
		}.bind(this));
		window.addEvent('keyup', function(event){
	    	if (event.key == "shift") this.shift = false;
		}.bind(this));	

		google.maps.event.addListener(this.marker1, 'drag', this.marker1moved.bind(this));
		google.maps.event.addListener(this.marker1, 'rightclick', this.showContextMenu.bind(this));
      google.maps.event.addListener(this.marker2, 'drag', this.marker2moved.bind(this));
		google.maps.event.addListener(this.marker2, 'rightclick', this.showContextMenu.bind(this));
		
	},
	
	toArray: function(){
		return [{
				lat: this.marker1.getPosition().lat(),
				lng: this.marker1.getPosition().lng()
			},
			{
				lat: this.marker2.getPosition().lat(),
				lng: this.marker2.getPosition().lng()
			}
		];
	},	
	
	showContextMenu: function(mouseEvent){
		var oldMenu = $('contextmenu');
		if (oldMenu)
			oldMenu.dispose();
			
		var menuItems = [{
			label: 'Delete',
			event: function(){
				this.marker1.setMap(null);
				this.marker2.setMap(null);
				this.line.polyline.setMap(null);
				delete this.marker1;
				delete this.marker2;
				delete this.line;
				this.fireEvent('delete', this);
				$('contextmenu').dispose();
			}		
		}];
		var contextMenu = Element('ul', {'id': 'contextmenu'});

		menuItems.each(function(menuItem){ //label, event, options
			var li = new Element('li');
			li.grab(new Element('a',{
				'id': menuItem.id ? menuItem.id : null,
				'text': menuItem.label,
				'styles': {
					'cursor': 'default',
					'border-top': menuItem.separator ? '1px solid #999' : null,
					'border-bottom': menuItem.bottomSeparator ? '1px solid #999' : null
				},
				'events': {
					'click': menuItem.event.bind(this)
				}
			}));
			contextMenu.grab(li);
		}.bind(this));

		$(prune.map.getDiv()).grab(contextMenu);
		
	   var mapSize = $('map_canvas').getSize();
		var menuSize = contextMenu.getSize();		
		//var click = prune.mapOverlay.getProjection().fromLatLngToContainerPixel(latlng.latLng);
		var click = mouseEvent.pixel;
		click.y = click.y - 15;
		
		//if to close to the map border, decrease x position
		if((mapSize.x - click.x ) < menuSize.x)
			click.x = mapSize.x - menuSize.x;
		//if to close to the map border, decrease y position
		if((mapSize.y - click.y ) < menuSize.y)
			click.y = click.y - menuSize.y;
		
		contextMenu.setStyles({
			'left': click.x, 
			'top': click.y, 
			'visibility': 'visible',
			'display': 'block'
		});	
	},	
	
	marker1moved: function(e){
		if (this.shift){
			var start = this.line.polyline.getPath().getAt(0);
			var end = this.marker1.getPosition();
			var latChange = end.lat() - start.lat();
			var lngChange = end.lng() - start.lng();
			var pos = this.marker2.getPosition();
			this.marker2.setPosition(new google.maps.LatLng(pos.lat() + latChange, pos.lng() + lngChange)); 
		}
		this.redraw();
	},	

	marker2moved: function(e){
		if (this.shift){
			var start = this.line.polyline.getPath().getAt(1);
			var end = this.marker2.getPosition();
			var latChange = end.lat() - start.lat();
			var lngChange = end.lng() - start.lng();
			var pos = this.marker1.getPosition();
			this.marker1.setPosition(new google.maps.LatLng(pos.lat() + latChange, pos.lng() + lngChange)); 
		}
		this.redraw();
	},	
	
	redraw: function(e){
		this.line.update(this.marker1.getPosition(), this.marker2.getPosition());
		this.check();
	},
	
	check: function(){
		return this.line.intersect(this.trail);
	}
});


/*
---
name: SimpleModal

description: SIMPLE MODAL is a small plugin to create modal windows. It can be used to generate alert or confirm messages with few lines of code. Confirm configuration involves the use of callbacks to be applied to affirmative action;i t can work in asynchronous mode and retrieve content from external pages or getting the inline content. SIMPLE MODAL is not a lightbox although the possibility to hide parts of its layout may partially make it similar.

license: MIT-style

authors: Marco Dell'Anna

requires: [Core/Class, Core/Element, Core/Element.Style, Core/Element.Event]

provides: [SimpleModal]
...
*/
/*
* Mootools Simple Modal
* Version 1.0
* Copyright (c) 2011 Marco Dell'Anna - http://www.plasm.it
*
* Requires:
* MooTools http://mootools.net
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*
* Log:
* 1.0 - Inizio implementazione release stabile [Tested on: ie7/ie8/ie9/Chrome/Firefox7/Safari]
*/
var SimpleModal = new Class({
    // Implements
    Implements: [Options],
    request:null,
    buttons:[],
    // Options
    options: {
        onAppend:      Function, // callback inject in DOM
        offsetTop:     null,
        overlayOpacity:.3,
        overlayColor:  "#000000",
        width:         400,
        draggable:     true,
        keyEsc:        true,
        overlayClick:  true,
        closeButton:   true, // X close button
        hideHeader:    false, 
        hideFooter:    false,
        btn_ok:        "OK", // Label
        btn_cancel:    "Cancel", // Label
        template:"<div class=\"simple-modal-header\"> \
            <h1>{_TITLE_}</h1> \
          </div> \
          <div class=\"simple-modal-body\"> \
            <div class=\"contents\">{_CONTENTS_}</div> \
          </div> \
          <div class=\"simple-modal-footer\"></div>"
    },

    /**
     * Initialization
     */
    initialize: function(options) {
        //set options
        this.setOptions(options);
    },
    
    /**
    * public method show
    * Open Modal
    * @options: param to rewrite
    * @return node HTML
    */
    show: function(options){
      if(!options) options = {};
      // Inserisce Overlay
      this._overlay("show");
      // Switch different modal
      switch( options.model ){
        // Require title && contents && callback
        case "confirm":
          // Add button confirm
          this.addButton(this.options.btn_ok, "btn primary btn-margin", function(){
              try{ options.callback() } catch(err){};
              this.hide();
          })
          // Add button cancel
          this.addButton(this.options.btn_cancel, "btn secondary");
					// Rendering
					var node = this._drawWindow(options);
					// Add Esc Behaviour
					this._addEscBehaviour();
        break;
        // Require title && contents (define the action buttons externally)
        case "modal":
					// Rendering
					var node = this._drawWindow(options);
					// Add Esc Behaviour
					this._addEscBehaviour();
        break;
        // Require title && url contents (define the action buttons externally)
        case "modal-ajax":
					// Rendering
					var node = this._drawWindow(options);
          this._loadContents({
            "url":options.param.url || "",
            "onRequestComplete":options.param.onRequestComplete||Function
          })
        break;
        // Require title && contents
        default:
					// Alert
          // Add button
          this.addButton(this.options.btn_ok, "btn primary");
					// Rendering
					var node = this._drawWindow(options);
					// Add Esc Behaviour
					this._addEscBehaviour();
        break;
      }
			   
      // Custom size Modal
      node.setStyles({width:this.options.width});
      
      // Hide Header &&/|| Footer
      if( this.options.hideHeader ) node.addClass("hide-header");
      if( this.options.hideFooter ) node.addClass("hide-footer");

      // Add Button X
      if( this.options.closeButton ) this._addCloseButton();
      
      // Enabled Drag Window
      if( this.options.draggable ){
        var headDrag = node.getElement(".simple-modal-header");
          new Drag(node, { handle:headDrag });
          // Set handle cursor
          headDrag.setStyle("cursor", "move")
          node.addClass("draggable");
      }
      // Resize Stage
      this._display();
    },
    
    /**
    * public method hide
    * Close model window
    * return
    */
    hide: function(){
			try{
				if( typeof(this.request) == "object" )  this.request.cancel();
			}catch(err){}
		 this._overlay('hide');
     return;
    },
    
    /**
    * private method _drawWindow
    * Rendering window
    * return node SM
    */
		_drawWindow:function(options){
			// Add Node in DOM
      var node = new Element("div#simple-modal", {"class":"simple-modal"});
          node.inject( $$("body")[0] );
			// Set Contents
			var html = this._template(this.options.template, {"_TITLE_":options.title || "Untitled", "_CONTENTS_":options.contents || ""});
		      node.set("html", html);
					// Add all buttons
		      this._injectAllButtons();
		      // Callback append
		      this.options.onAppend();
			return node;
		},

    /**
    * public method addButton
    * Add button to Modal button array
    * require @label:string, @classe:string, @clickEvent:event
    * @return node HTML
    */
     addButton: function(label, classe, clickEvent){
         var bt = new Element('a',{
                                     "title" : label,
                                     "text"  : label,
                                     "class" : classe,
                                     "events": {
                                         click: (clickEvent || this.hide).bind(this)
                                     }
                               });
         this.buttons.push(bt);
 		     return bt;
     },
     
    /**
    * private method _injectAllButtons
    * Inject all buttons in simple-modal-footer
    * @return
    */
    _injectAllButtons: function(){
      this.buttons.each( function(e, i){
        e.inject( $("simple-modal").getElement(".simple-modal-footer") );
      });
		return;
    },

    /**
    * private method _addCloseButton
    * Inject Close botton (X button)
    * @return node HTML
    */
    _addCloseButton: function(){
      var b = new Element("a", {"class":"close", "href":"#", "html":"x"});
          b.inject($("simple-modal"), "top");
          // Aggiunge bottome X Close
          b.addEvent("click", function(e){
            if(e) e.stop();
            this.hide();
          }.bind( this ))
      return b;
    },

    /**
    * private method _overlay
    * Create/Destroy overlay and Modal
    * @return
    */
    _overlay: function(status) {
       switch( status ) {
           case 'show':
               this._overlay('hide');
               var overlay = new Element("div", {"id":"simple-modal-overlay"});
                   overlay.inject( $$("body")[0] );
                   overlay.setStyle("background-color", this.options.overlayColor);
                   overlay.fade("hide").fade(this.options.overlayOpacity);
                // Behaviour
                if( this.options.overlayClick){
                  overlay.addEvent("click", function(e){
                    if(e) e.stop();
                    this.hide();
                  }.bind(this))
                }
               // Add Control Resize
               this.__resize = this._display.bind(this);
               window.addEvent("resize", this.__resize );
           break;
           case 'hide':
               // Remove Event Resize
               window.removeEvent("resize", this._display);
               // Remove Event Resize
               if(this.options.keyEsc){
                 var fixEV = Browser.name != 'ie' ? "keydown" : "onkeydown";
                 window.removeEvent(fixEV, this._removeSM);
               }
               
               // Remove Overlay
               try{
                 $('simple-modal-overlay').destroy();
               }
               catch(err){}
               // Remove Modal
               try{
                 $('simple-modal').destroy();
               }
               catch(err){}
           break;
       }
       return;
    },

    /**
    * private method _loadContents
    * Async request for modal ajax
    * @return
    */
    _loadContents: function(param){
			// Set Loading
			$('simple-modal').addClass("loading");
			// Match image file
			var re = new RegExp( /([^\/\\]+)\.(jpg|png|gif)$/i );
			if( param.url.match(re) ){
				// Hide Header/Footer
	      $('simple-modal').addClass("hide-footer");
				// Remove All Event on Overlay
				$("simple-modal-overlay").removeEvents(); // Prevent Abort
				// Immagine
				var images = [param.url];
				new Asset.images(images, {
							onProgress: function(i) {
								immagine = this;
							},
							onComplete: function() {
								try{
									// Remove loading
									$('simple-modal').removeClass("loading");
									// Imposta dimensioni
									var content = $('simple-modal').getElement(".contents");
									var padding = content.getStyle("padding").split(" ");
									var width   = (immagine.get("width").toInt()) + (padding[1].toInt()+padding[3].toInt())
									var height  = immagine.get("height").toInt();
									// Width
									var myFx1 = new Fx.Tween($("simple-modal"), {
									    duration: 'normal',
									    transition: 'sine:out',
									    link: 'cancel',
									    property: 'width'
									}).start($("simple-modal").getCoordinates().width, width);
									// Height
									var myFx2 = new Fx.Tween(content, {
									    duration: 'normal',
									    transition: 'sine:out',
									    link: 'cancel',
									    property: 'height'
									}).start(content.getCoordinates().height, height).chain(function(){
										// Inject
										immagine.inject( $('simple-modal').getElement(".contents").empty() ).fade("hide").fade("in");
		                this._display();
		                // Add Esc Behaviour
  									this._addEscBehaviour();
									}.bind(this));
									// Left
									var myFx3 = new Fx.Tween($("simple-modal"), {
									    duration: 'normal',
									    transition: 'sine:out',
									    link: 'cancel',
									    property: 'left'
									}).start($("simple-modal").getCoordinates().left, (window.getCoordinates().width - width)/2);
								}catch(err){}
							}.bind(this)
						});
						
			}else{
				// Request HTML
	      this.request = new Request.HTML({
	          evalScripts:false,
	          url: param.url,
	          method: 'get',
	          onRequest: function(){
	          },
	          onSuccess: function(responseTree, responseElements, responseHTML, responseJavaScript){
	            $('simple-modal').removeClass("loading");
	            param.onRequestComplete();
	            $('simple-modal').getElement(".contents").set("html", responseHTML);
	            // Execute script page loaded
	            eval(responseJavaScript)
	            // Resize
	            this._display();
	            // Add Esc Behaviour
							this._addEscBehaviour();
	          }.bind(this),
	          onFailure: function(){
	            $('simple-modal').removeClass("loading");
	            $('simple-modal').getElement(".contents").set("html", "loading failed")
	          }
	      }).send();
			}
    },
    
    /**
    * private method _display
    * Move interface
    * @return
    */
     _display: function(){
      // Update overlay
      try{
        $("simple-modal-overlay").setStyles({
          height: window.getCoordinates().height //$$("body")[0].getScrollSize().y
        });
      } catch(err){}
         
      // Update position popup
      try{
        var offsetTop = this.options.offsetTop || 40; //this.options.offsetTop != null ? this.options.offsetTop : window.getScroll().y + 40;
        $("simple-modal").setStyles({
          top: offsetTop,
          left: ((window.getCoordinates().width - $("simple-modal").getCoordinates().width)/2 )
        });
      } catch(err){}
 		  return;
     },
     
     /**
     * private method _addEscBehaviour
     * add Event ESC
     * @return
     */
     _addEscBehaviour: function(){
       if(this.options.keyEsc){
         this._removeSM = function(e){
           if( e.key == "esc" ) this.hide();
         }.bind(this)
          // Remove Event Resize
         if(this.options.keyEsc){
           var fixEV = Browser.name != 'ie' ? "keydown" : "onkeydown";
           window.addEvent(fixEV, this._removeSM );
         }
  		  }
     },
      
    /**
    * private method _template
    * simple template by Thomas Fuchs
    * @return
    */
    _template:function(s,d){
     for(var p in d)
       s=s.replace(new RegExp('{'+p+'}','g'), d[p]);
     return s;
    }
});

/*
---

name: Likes

script: class.Likes.js

description: Likes Class that provides controls for liking a trail

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: [SimpleModal/SimpleModal]

provides: [Likes, otm.Likes]

...
*/
var Likes = new Class({

	Implements: [Options, Events],

	options: {
		baseClass: 'star',
		onClass: 'star-enabled',
		type: 'trail'
	},
	target: null,
	id: null,
	
	initialize: function(target, id, options){
		if (typeOf(target) == 'string')
			this.target = $(target);
		else
			this.target = target;
		
		this.id = id;
		
		this.attatchListner(this.target);
	},
	
	attatchListner: function(target){
		target.addEvent('click', function(e){
			e.preventDefault();
			if(this.isLiked())
				this.dislike();
			else	
				this.like();
		}.bind(this));
	},
	
	isLiked: function(){
		return this.target.hasClass(this.options.onClass);
	},
	
	like: function(){
		new Request.JSON({
			url: otm.url.rpc, 
			onSuccess: this.likeResult.bind(this),
			data: {
				call: this.options.type + '.like', 
				id: this.id
			}
		}).get();
	},
	
	likeResult: function(response){
		if (response.code == 0){
			if (response.error == 'notLoggedIn'){
				var sm = new SimpleModal({"btn_ok":"Alert button"});
				sm.show({
					"title":"Inte inloggad",
					"contents":"Du måste logga in för att gilla stigar."
				});
			}	
			else{
				alert(response.error);
			}
			return false;
		}
		
		var childs = this.target.getChildren('.label');
		this.target.addClass('star-enabled');
		childs.each(function(child){
			child.set('text', response.likes);
		});
	},
	
	dislike: function(){
		new Request.JSON({
			url: otm.url.rpc, 
			onSuccess: this.dislikeResult.bind(this),
			data: {
				call: this.options.type + '.dislike', 
				id: this.id
			}
		}).get();
	},

	dislikeResult: function(response){
		if (response.code == 0){
					alert(response.error);
			return false;
		}
		
		var childs = this.target.getChildren('.label');
		this.target.removeClass('star-enabled');
		childs.each(function(child){
			child.set('text', response.likes);
		});
	}


});

if (otm == undefined) var otm = {};
/*
---

name: MapControl

script: class.mapcontrol.js

description: MapControl Class that provides icons on Google Maps

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: []

provides: [MapControl, otm.MapControl]

...
*/
var MapControl = new Class({

	Implements: [Options, Events],

	options: {
		position: null,
		css: {},
		index: -1,
		controls: [],
		maximize: {
			icon: '/images/arrow_expand.png',
			id: -1,
			tooltip: 'Maximera kartan',
			action: function(){
				window.location = otm.url.view.trail + this.options.maximize.id + '&fullscreen=1';}
		},
		restore: {
			icon: '/images/arrow_contract.png',
			tooltip: 'Återställ kartan',
			id: -1,
			action: function(){window.location = otm.url.view.trail + this.options.restore.id;}
		},
		showPanel: {
			icon: '/images/prospect/otm.panel-expand.png',
			tooltip: 'Display sidebar',
			id: -1,
			action: function(){console.log('show sidebar'); }
		},

		allTrails: {
			icon: '/images/add.png',
			tooltip: 'Visa närliggande stigar',			
			visable: false,
			id: -1,
			map: null,
			icon_add: '/images/add.png',
			tooltip_add: 'Visa närliggande stigar',			
			icon_remove: '/images/remove.png',
			tooltip_remove: 'Göm närliggande stigar',
			action: function(){
				this.visable = !this.visable;
				if (this.visable){
					if (!this.trails){
						this.trails = new Trails(this.map, {
							color: '#0000ff',
							colorGraded: false,
							markers: false,
							zIndex: -1,
							maxZoom: 13,
							exclude: [parseInt(this.id)]
						});
					} else{
						this.trails.setupEvents();					
					}
					
					$('ctrl_allTrails').set({
						src: this.icon_remove,
						title: this.tooltip_remove
					});
					this.trails.redraw();
				}
				else{
					$('ctrl_allTrails').set({
						src: this.icon_add,
						title: this.tooltip_add
					});
					this.trails.clearEvents();
					this.trails.clear();
				}
			}
		}
	},

	map: null,
	div: null,

	initialize: function(map, options){
		this.setOptions(options);
		this.map = map;
		this.options.allTrails.map = map;
		
		if (!this.options.position)
			this.options.position = google.maps.ControlPosition.RIGHT_BOTTOM;
			
		this.createHtml();
		this.options.controls.each(function(control){
			this.add(control);	
		}.bind(this));
		this.map.controls[this.options.position].push(this.div);
		

	},
	
	createHtml: function(){
		this.div = new Element('div', {'class': 'mapControl'});
		this.div.index = this.options.index;
		this.controlUi = new Element('div', {'class': 'mapControlUi'});
		this.controlUi.setStyles(this.options.css);
		this.div.grab(this.controlUi);
	},
	add: function(control){
		if (!this.options[control])
			return;
			
		this.controlUi.grab(new Element('img', {
			src: this.options[control].icon, 
			title: this.options[control].tooltip,
			id: 'ctrl_' + control,
			events: {
				click: function(){
					var _control = control;
					this.options[control].action();
					if (this.options[_control].toggle)
						this.options[_control].toggle.action();
				}.bind(this)
			}
		}));		
	}
	
});


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
			url: '/poi/find.json', 
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
	
	drawMarkers: function(response){		
		// Mark all polylines to be unlinked
		for (var i in this.markers){
			this.markers[i].unlink = 1;
		}

		var count = response.pois.length;
		for (var i = 0; i < count; i++){
			var marker;
			
			if (this.options.exclude.indexOf(Number(response.pois[i].id)) != -1)
				continue;
				
			if (this.markers[response.pois[i].id]) // Excisting trail
				delete(this.markers[response.pois[i].id].unlink);
			else{	// new trail
				poi = new google.maps.Marker({
			    	position: new google.maps.LatLng(response.pois[i].lat, response.pois[i].lng),
			    	icon: otm.icons.poi.landmark,
      				map: this.map
				});   
				poi.poi = 1;
				poi.id = response.pois[i].id;
				poi.name = response.pois[i].name;
				poi.description = response.pois[i].description;
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
	
	initialize: function(map, options){
		this.setOptions(options);

		this.map = map;
			
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
					color: this.options.colorGraded ? otm.color.grade[response.trails[i].grade] : this.options.color
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

