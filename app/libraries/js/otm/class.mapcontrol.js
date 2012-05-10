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
		id: null,
		visable: true,
		css: {},
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
			icon: '/img/otm.panel-expand.png',
			tooltip: 'Display sidebar',
			id: -1,
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
	id: null,
	visable: false,

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
		if (this.options.visable){
			this.toggle();
		}
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
	},
	toggle: function(){
		if (this.visable){
			this.map.controls[this.options.position].removeAt(this.id);
		}
		else{
			// push returns the length, so we need to substract
			this.id = this.map.controls[this.options.position].push(this.div) - 1;
		}
		this.visable = !this.visable;
	}
	
});
