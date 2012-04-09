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
