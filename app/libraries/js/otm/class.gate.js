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
