if (otm == undefined) var otm = {};
/*
---

name: Challange

script: prune-challange.js

description: Contains OTM challange integration in webPrune

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: [otm.prune]

provides: [otm.challange]

...
*/

otm.challenge = {
	edit: false,
	gates: [],
	init: function(){
		$('challenge').removeClass('hide');
		
		MUI.saveChallenge = function() {
			new MUI.Modal({
				id: 'saveChallenge',
				title: 'Save Challenge',			
				contentURL: 'pages/otm.challenge.save.html',
				type: 'modal1',
				width: 300,
				height: 225,
				//headerHeight: 27,
				//padding: { top: 10, right: 12, bottom: 10, left: 12 },
				scrollbars: true
			});
		};	
		MUI.helpChallenge = function() {
			new MUI.Modal({
				id: 'helpChallenge',
				title: 'Help - Challenge',			
				contentURL: 'pages/otm.challenge.help.html',
				type: 'modal1',
				width: 400,
				height: 425,
				//headerHeight: 27,
				//padding: { top: 10, right: 12, bottom: 10, left: 12 },
				scrollbars: true
			});
		};	
		prune.mapMenu.unshift({
			label: 'Add Gate',
			action: function(){
				otm.challenge.gates.push(new Gate(prune.map, prune.lastClick, prune.points.polyline));
				prune.hideContextMenu();
			},
			options: {bottomSeparator: true}
		});
	},	
	addGate: function(){
		google.maps.event.addListenerOnce(prune.map, 'click', function(point){
			otm.challenge.gates.push(new Gate(prune.map, point.latLng, prune.points.polyline));		
		});
	},
	removeGate: function(gate){
		var gates = otm.challenge.gates;
		var idx = gates.indexOf(gate);
		gates.splice(idx, 1);
		console.log('gate removed');
	},
	autoAddGates: function(gatesToAdd){
		this.gatesAdded = 0;
		this.dist = 0;
		var path = prune.points.polyline.getPath();
		
		// calculate distance
		var length = {dist: 0, prev: null, last: 0}; 
		path.forEach(function(point, i){
			if (i == 0){
				this.prev = point;
				return;
			}
			this.dist = this.dist + Number(prune.distance(this.prev, point));
			this.prev = point			
		}.bind(length));

		if (!gatesToAdd)
			gatesToAdd = 10;
		this.gateDistance = (length.dist) / (gatesToAdd-1);
		this.lastIdx = path.getLength() - 2;		
		
		path.forEach(function(point, i){
			if (i == 0){
				this.prev = point;
				return;
			}
			
			this.dist = this.dist + Number(prune.distance(this.prev, point));
			if (this.dist >= this.gateDistance * this.gatesAdded || i == this.lastIdx){
				this.gatesAdded = otm.challenge.gates.push(new Gate(prune.map, point, prune.points.polyline, {autoTune: true, distance: 50}));
				otm.challenge.gates[this.gatesAdded-1].addEvent('delete', otm.challenge.removeGate);
			}
			this.prev = point;
		}.bind(this));
		console.log(this.gatesAdded);
		//new Gate(otm.map.instance, path.getAt(path.getLength() - 2), otm.trail.polyline, {autoTune: true, distance: 50});
		//path.getLength()
	},
	save: function(data){
		MUI.notification('Saving...');
		 $('spinner').show();
		var gates = [];
		otm.challenge.gates.each(function(gate){
			gates.push(gate.toArray());
		});
		
		if (!data.onSave)
			data.onSave = $lamda(true);
		
		var points = [];
		for(var i = 0; i < prune.points.count; i++)
			points.push({idx: prune.points.marker[i].idx});
				
		new Request.JSON({
			url: rpc, 
			method: 'post', 
			onSuccess: function(callback){
				var onSave = data.onSave;
				$('spinner').hide();
				if (callback.code != 0){
					MUI.notification('Challenge saved sucsessfully');
					onSave(true);
				}
				else{
					prune.dlgError('Saved failed: ' + callback.error);
					onSave(false);
				}
			},
			onFailure: function(xhr){
				prune.dlgError('Saved failed: ' + xhr);			
			}
		}).post({
			'call': 'save.challenge', 
			'name': data.name, 
			'view': data.view, 
			'access': data.access,
			'gates': gates,
			'points': points,
			'type': otm.prune.opts.type,
			'id': otm.prune.opts.id
		});
	
	}
};