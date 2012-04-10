if (otm == undefined) var otm = {};
/*
---

name: Otm

script: prune-otm.js

description: Contains OTM integration in webPrune

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: [Core, UI]

provides: [otm.prune]

...
*/

otm.prune = {
	rpc: '/rpc.php',
	opts: {},
	trails: {
		visable: false,
		checkEle: null,
		inst: null,
		toggle: function(){
			if (!otm.prune.trails.visable){
				otm.prune.trails.checkEle = new Element('div', {
					'class': 'check'
				}).inject($('wmTrails'));
	
				if (!otm.prune.trails.inst){
					otm.prune.trails.inst = new Trails(prune.map, {
						colorGraded: false,
						polyline: true,
						exclude: [Number(otm.prune.opts.id)]
					});
				}
				else
					otm.prune.trails.inst.setupEvents();
					
				otm.prune.trails.inst.redraw();
					
			}
			else{
				otm.prune.trails.checkEle.destroy();
				otm.prune.trails.inst.clearEvents();
				otm.prune.trails.inst.clear();
			}
			otm.prune.trails.visable = !otm.prune.trails.visable;
		}
	},
	toggleTrails: function(){
		console.log("function depricated");
	}
};

otm.prune.initializeWindows = function(){

	MUI.otmAddTrail = function() {
		new MUI.Modal({
			id: 'otmAddTrail',
			title: 'Upload track to opentrailmap',			
			contentURL: 'pages/otm.trail.add.html',
			type: 'modal1',
			width: 350,
			height: 340,
			onContentLoaded: function(){
				prune.keyboard.deactivate();
				$('otmAddTrailForm').addEvent('submit', function(event){
					event.stop();		
					otm.prune.addTrail(this);
				});
				
				$('btnCancel').addEvent('click', function(event){
					event.stop();
					MochaUI.closeWindow($('otmAddTrail'));
					prune.keyboard.activate();
				});			
			},
			scrollbars: true
		});
	};	
}

/*
	This function will take us from standards mode to 
*/
otm.prune.init = function(){
	otm.prune.opts = window.location.search.substr(1).parseQueryString();
	if (otm.prune.opts.otm && otm.prune.opts.otm == 1){
		// validate inputs before loading
		if (!otm.prune.opts.id) {prune.dlgError('Reason: no ID suplied', 'Error calling webPrune'); return; }
		if (!otm.prune.opts.type) {prune.dlgError('Reason: no Type suplied', 'Error calling webPrune'); return; }
	
		// initialize challange menu for opentrailmap
		// TODO: finnish challenge
		//otm.challenge.init();
		
		// load opentrailmap data
		var getTrack = new Request.JSON({
			url: otm.prune.rpc, 
			onSuccess: function(callback){
				if (callback.code != 0){
					MUI.updateTitle({
						element: $('mainPanel'), 
						title: callback.name
					});
					prune.load(callback.trail);
					prune.ui.setTip();
					prune.ui.updateActions();
				}
				else
					prune.dlgError(callback.error);
			},
			data:{
				'call': 'edit', 
				'type': otm.prune.opts.type, 
				'id': otm.prune.opts.id
			}
		}).get();
		
		prune.ui.setupExit(function(){
			if (otm.prune.opts.type == 'trail')
				window.location = '/viewtrail/?id='+ otm.prune.opts.id+'&edit=1';
			else
				window.location = '/viewtraining/?id=' + otm.prune.opts.id;
		});
		
	}
}

otm.prune.save = function(){
	MUI.notification('Saving...');
	 $('spinner').show();
	var points = [];
	for(var i = 0; i < prune.points.count; i++)
		points.push({
			idx: prune.points.marker[i].idx,
			lat: prune.points.marker[i].center.lat(),
			lng: prune.points.marker[i].center.lng(),
			ele: prune.points.marker[i].ele,
			xml: prune.points.marker[i].xml
		});
	
	var saveTrack = new Request.JSON({
		url: otm.prune.rpc, 
		method: 'post', 
		onSuccess: function(callback){
			$('spinner').hide();
			if (callback.code != 0){
				MUI.notification('Track saved sucsessfully');
			}
			else
				prune.dlgError('Saved failed: ' + callback.error);
		},
		onFailure: function(xhr){
			 $('spinner').hide();
			prune.dlgError('Saved failed: ' + xhr);			
		}
	});
	saveTrack.post({'call': 'prune.track.save', 'type': otm.prune.opts.type, 'id': otm.prune.opts.id, 'points': points});
}

otm.prune.addTrail = function(form){
	var showErr = function(msg){
		$('formInfo').addClass('red');
		$('formInfo').set('text', msg);
		$('formInfo').highlight('#FF9999')
		return false;
	}
	if (form.trailname.value == ''){
		return showErr('Please enter a name');
	}
	if (form.getElements('input[type=checkbox]:checked').map(function(e){return e.value;}).length == 0){
		return showErr('Please choose a type');
	}
	if (!form.getElement('input[name=grade]:checked')){
		return showErr('Please choose a grade');
	}

	MUI.notification('Saving...');
	 $('spinner').show();
	var points = [];
	for(var i = 0; i < prune.points.count; i++)
		points.push({
			idx: prune.points.marker[i].idx,
			lat: prune.points.marker[i].center.lat(),
			lng: prune.points.marker[i].center.lng(),
			ele: prune.points.marker[i].ele,
			xml: prune.points.marker[i].xml
		});

	var saveTrack = new Request.JSON({
		url: otm.prune.rpc, 
		method: 'post', 
		onSuccess: function(callback){
			$('spinner').hide();
			if (callback.code != 0){
				var win = $('otmAddTrail_content');
				win.empty();
				new Element('h2', {
					html: 'Trail added successfully' 
				}).inject(win);
				new Element('p', {
					html: 'You can either continue working in webPrune or you can view your trail on opentrailmap' 
				}).inject(win);
				
				var btns = new Element('div', {'class': 'buttonRow'});				
				new Element('input', {
					'class': 'button right',
					'type': 'button',
					'value': 'View trail',
					'events': {
						'click': function(){
							window.location = '/viewtrail/?id=' + callback.id;
						}				
					}
				}).inject(btns);
				new Element('input', {
					'class': 'button right',
					'type': 'button',
					'value': 'Continue working',
					'events': {
						'click': function(){
							MochaUI.closeWindow($('otmAddTrail'));
							prune.keyboard.activate();
						}				
					}
				}).inject(btns);
				win.grab(btns);
				$('otmAddTrail').retrieve('instance').resize({width:350,height:120});
			}
			else
				prune.dlgError('Saved failed: ' + callback.error);
		},
		onFailure: function(xhr){
			 $('spinner').hide();
			prune.dlgError('Saved failed: ' + xhr);			
		}
	});

	saveTrack.post({
		'call': 'prune.trail.add', 
		'type': otm.prune.opts.type, 
		'id': otm.prune.opts.id, 
		'points': points,
		'trkName': form.trailname.value,
		'trkDescription': form.traildescription.value,
		'trkType': form.getElements('input[type=checkbox]:checked').map(function(e){return e.value;}),
		'trkGrade': parseInt(form.getElement('input[name=grade]:checked').value)
	});
}

otm.prune.export = function(){
	var points = [];
	for(var i = 0; i < prune.points.count; i++)
		points.push({
			idx: prune.points.marker[i].idx,
			lat: prune.points.marker[i].center.lat(),
			lng: prune.points.marker[i].center.lng(),
			ele: prune.points.marker[i].ele,
			xml: prune.points.marker[i].xml
		});

	prune.dlgError('Exporting data to GPX...');
	new Request.JSON({url: otm.prune.rpc, onSuccess: function(callback){
		if (callback.code != 0 && callback.file){
			// The preventDestroy is needed because setting window.location triggers
			// onbeforeunload which will cause highcharts to call destroy() and the
			// graph will be removed
			prune.chart.preventDestroy = true;
			window.location = '/download/' + '?f=' + callback.file + '&fc=custom.gpx';
			delete prune.chart.preventDestroy;
		}
		else{
			prune.dlgError('Export failed: ' + callback.error);
		}
	}}).post({'call': 'prune.export.gpx', 'type': otm.prune.opts.type, 'id': otm.prune.opts.id, 'points': points});	
}


prune.save = otm.prune.save;
prune.export = otm.prune.export;
prune.ui.extUI = otm.prune.initializeWindows;
prune.ui.onInit = otm.prune.init;

