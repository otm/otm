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
	
