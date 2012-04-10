if (prune === undefined) var prune = {};
/*
---

name: UI

script: mocha-init.js

description: Contains the webPrune interface.

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: [MUI, Core]

provides: [UI, prune.ui]

...
*/

if (prune.ui === undefined) prune.ui = {};

prune.ui.toolboxActions = function(e){
	e.preventDefault();
	
	if (e.target.hasClass('disabled'))
		return;
		
	// there is no wmExit event as it is only relevant in an embeded application
	switch(e.target.id){
		case 'wmOpen':
			MUI.openGpxWindow();
			break;
		case 'wmSave':
			prune.save();
			//MUI.notification('Save not implemented');
			break;
		case 'wmExportGpx':
			prune.export();
			break;
		case 'mtHelp':
		case 'wmHelp':
			MUI.helpWindow();
			break;
		case 'wmKeyboard':
			MUI.keyboardWindow();
			break;
		case 'wmAbout':
			MUI.aboutWindow();
			break;
		case 'mtFirst':
			if (prune.points.marker[0])
				prune.select(prune.points.marker[0]);
			break;
		case 'mtPrevious':
			prune.selectNext(-1);
			break;
		case 'mtNext':
			prune.selectNext();
			break;
		case 'mtLast':
			if (prune.points.marker[prune.points.count-1])
				prune.select(prune.points.marker[prune.points.count-1]);
			break;
		case 'mtDeselect':
			prune.deselectAll();
			break;
		case 'mtSelectAll':
			prune.selectRange(prune.points.marker[0], prune.points.marker[prune.points.count-1]);
			break;
		case 'mtUndo':
		case 'wmUndo':
			prune.undo();
			break;
		case 'mtDelete':
		case 'wmDelete':
			prune.actDelete();
			break;
		case 'wmEleOffset':
			MUI.eleOffsetWindow();
			break;
		case 'wmReverse':
			prune.reverse();
			break;
		case 'wmEleAdjust':
			prune.altitudeCorrection();
			break;
		case 'wmUndoAll':
			while (prune.undo() > 0){}
			break;
		case 'wmCompress':
			MUI.compressWindow();
			break;
		case 'wmZoomAll':
			prune.zoomAll();
			break;
		case 'wmZoomSelected':
		case 'mtZoomSelected':
			prune.zoomSelected();
			break;
		case 'wmTrails':
			otm.prune.trails.toggle();
			break;
		case 'wmAddGate':
			otm.challenge.addGate();
			break;
		case 'wmAutoAddGates':
			otm.challenge.autoAddGates();
			break;
		case 'wmAddTrail':
			MUI.otmAddTrail();
			break;
		case 'wmSaveChallenge':
			MUI.saveChallenge();
			break;
		case 'wmChallengeHelp':
			MUI.helpChallenge();
			break;
		default:
			MUI.notification('Not implemented');
	}
};

prune.ui.initializeWindows = function(){

	
	MUI.aboutWindow = function() {
		new MUI.Modal({
			id: 'about',
			title: 'web<span class="grey">Prune</span>',			
			contentURL: 'pages/webPrune.about.html',
			type: 'modal2',
			width: 350,
			height: 255,
			headerHeight: 27,
			padding: { top: 10, right: 12, bottom: 10, left: 12 },
			scrollbars: false
		});
	};

	MUI.compressWindow = function() {
		new MUI.Modal({
			id: 'compress',
			title: 'Compress',			
			contentURL: 'pages/webPrune.compress.html',
			type: 'modal1',
			width: 300,
			height: 150,
			//headerHeight: 27,
			//padding: { top: 10, right: 12, bottom: 10, left: 12 },
			scrollbars: true
		});
	};	

	MUI.eleOffsetWindow = function() {
		new MUI.Modal({
			id: 'eleOffset',
			title: 'Altitude Offset',			
			contentURL: 'pages/webPrune.eleOffset.html',
			type: 'modal1',
			width: 300,
			height: 150,
			//headerHeight: 27,
			//padding: { top: 10, right: 12, bottom: 10, left: 12 },
			scrollbars: true
		});
	};	

	MUI.openGpxWindow = function() {
		new MUI.Modal({
			id: 'openGpx',
			title: 'Open GPS trail',			
			contentURL: 'pages/webPrune.load.html',
			type: 'modal1',
			width: 300,
			height: 150,
			//headerHeight: 27,
			//padding: { top: 10, right: 12, bottom: 10, left: 12 },
			scrollbars: true
		});
	};	
	
	MUI.helpWindow = function() {
		new MUI.Modal({
			id: 'help',
			title: 'Help',			
			contentURL: 'pages/webPrune.help.html',
			type: 'modal1',
			width: 450,
			height: 510,
			//headerHeight: 27,
			//padding: { top: 10, right: 12, bottom: 10, left: 12 },
			scrollbars: true
		});
	};

	MUI.keyboardWindow = function() {
		new MUI.Modal({
			id: 'keyboard',
			title: 'Keyboard Shortcuts',			
			contentURL: 'pages/webPrune.keyboardShortcuts.html',
			type: 'modal1',
			width: 400,
			height: 253,
			//headerHeight: 27,
			//padding: { top: 10, right: 12, bottom: 10, left: 12 },
			scrollbars: true
		});
	};


	$$('a.menu').each(function(el){
		el.addEvent('click', prune.ui.toolboxActions);
	});


	//if (this.hasClass('disabled'))
	// Deactivate menu header links
	$$('a.returnFalse').each(function(el) {
		el.addEvent('click', function(e) {
			new Event(e).stop();
		});
	});
	
	// Build windows onLoad
	//MUI.parametricsWindow();
	MUI.myChain.callChain();
};

/*
  
INITIALIZE COLUMNS AND PANELS  

	Creating a Column and Panel Layout:
	 
	 - If you are not using panels then these columns are not required.
	 - If you do use panels, the main column is required. The side columns are optional.
	 
	 Columns
	 - Create your columns from left to right.
	 - One column should not have it's width set. This column will have a fluid width.
	 
	 Panels
	 - After creating Columns, create your panels from top to bottom, left to right.
	 - One panel in each column should not have it's height set. This panel will have a fluid height.	 
	 - New Panels are inserted at the bottom of their column. 
 
-------------------------------------------------------------------- */


prune.ui.initializeColumns = function() {
	new MUI.Column({
		id: 'mainColumn',
		placement: 'main',
		resizeLimit: [100, 300]
	});
	
	var sidecolumn = new MUI.Column({
		id: 'sideColumn',
		placement: 'right',
		onResize: function(){prune.resize($('mainPanel'));},
		onCollapse: function(){prune.resize($('mainPanel'));},
		onExpand: function(){prune.resize($('mainPanel'));},
		width: 220,
		resizeLimit: [200, 300]
	});
	
	// Add panels to main column	
	new MUI.Panel({
		id: 'mainPanel',
		title: 'No file loaded',
		content: '<div id="map_canvas" style="width: 200px; height: 200px"></div>',
		padding: {top: 0, bottom: 0, left: 0, right: 0},
		onResize: function(){prune.resize($('mainPanel'));},
		column: 'mainColumn',
		scrollbars: false,
		headerToolbox: true,
		headerToolboxURL: 'pages/mainPanel.toolbox.html',
		headerToolboxOnload: function(){
			$$('.mainTool').each(function(element){
				element.removeEvents();
				element.addEvent('click', prune.ui.toolboxActions);
			});
		}
	})
	window.addEvent('resize', function(){prune.resize($('mainPanel'));});
	
	var graphPanel = new MUI.Panel({
		id: 'graphPanel',
		addClass: 'mochaConsole',
		title: 'Graph - Altitude',
		content: '<div id="graph"></div>',
		column: 'mainColumn',
		scrollbars: false,
		height: 190,
		resizable: false,
		padding: {top: 0, bottom: 0, left: 0, right: 0},
		headerToolbox: false,
		headerToolboxURL: 'pages/graphPanel.toolbox.html',
		headerToolboxOnload: prune.ui.toolboxActions,
	});
	graphPanel.toggle();	
	

	
	
	// Add panels to second side column
	new MUI.Panel({
		id: 'pointDetails',
		title: 'Point Details',
		content: 'No track loaded',
		column: 'sideColumn',
		height: 70
	});

	new MUI.Panel({
		id: 'rangeDetails',
		title: 'Range Details',
		content: 'No track loaded',
		column: 'sideColumn',
		height: 120
	});	
	new MUI.Panel({
		id: 'tips-panel',
		title: 'Tips',
		content: '<div id="tip">Load a GPX file to start editing</div>',
		column: 'sideColumn',
		//height: 120,
	});

	MUI.myChain.callChain();
};

prune.ui.initializePanelContent = function(){
	MUI.updateContent({
		element: $('pointDetails'),
		content: '<ul id="pt" class="infoList"></ul>'
	});
	var pt = $('pt');
	prune.ui.addInfo(pt, 'ptLat', 'Latitude'); 
	prune.ui.addInfo(pt, 'ptLng', 'Longitude'); 
	prune.ui.addInfo(pt, 'ptEle', 'Altitude');
	pt.grab(new Element('input', {
		type: 'button',
		value: 'Edit',
		class: 'button right',
		id: 'btnEditPt',
		name: 'Edit',
		styles: {
			visibility: 'hidden'
		},
		events: {
			'click': function(){prune.edit(prune.cSelect.focus);}
		}
	}));
	pt.grab(new Element('input', {
		type: 'button',
		value: 'Cancel',
		class: 'button right',
		id: 'btnEditPtCancel',
		name: 'Edit',
		styles: {
			visibility: 'hidden',
			marginLeft: '3px'
		},
		events: {
			click: function(){prune.editCancel();}
		}
	}));
	pt.grab(new Element('input', {
		type: 'button',
		value: 'Done',
		class: 'button right',
		id: 'btnEditPtDone',
		name: 'Done',
		styles: {
			visibility: 'hidden'
		},
		events: {
			'click': function(){prune.editEnd();}
		}
	}));


	// <input type="submit" value="Submit" class="button" id="submitter" name="button">
	
	MUI.updateContent({
		element: $('rangeDetails'),
		content: '<ul id="rng" class="infoList"></ul>'
	});
	var rng = $('rng');
	prune.ui.addInfo(rng, 'rngSel', 'Selected'); 
	prune.ui.addInfo(rng, 'rngDist', 'Distance'); 
	prune.ui.addInfo(rng, 'rngAlt', 'Altitude');
	prune.ui.addInfo(rng, 'rngHgh', 'Highest');
	prune.ui.addInfo(rng, 'rngLow', 'Lowest');
	prune.ui.addInfo(rng, 'rngAsc', 'Climb'); 
	prune.ui.addInfo(rng, 'rngDsc', 'Descend'); 
}

prune.ui.setTip = function(){
	$('tip').set('html',
		'<p>To view, and edit, points zoom in on the map.</p>'
	);
}

prune.ui.addInfo = function(parent, id, text, action){
	if (typeof(parent)  == 'string')	
		parent = $(parent);
		
	if (!parent)
		return false;
		
	var li = new Element('li');
	var div = new Element('div', {'html': text + ': <span id="'+id+'"></span>'});
	if (action){
		div.addEvent('click', action);
		div.setStyle('cursor','pointer');
	}
	
	div.set('id', 'lbl' + id);
	if (parent.getChildren().length == 0){
		div.set('class', 'top');
	}
	div.inject(li);
	li.inject(parent);					
};

prune.ui.updateInfo = function(id, text){
	if (typeof(id)  == "string")	
		id = $(id);
		
	if (id){
		id.set('html', text);
		return true;
	}
	else
		return false;
};	

/*
	initialize prune for standalone mode
*/
prune.ui.init = function(){
	
	prune.init({graphId: 'graph', graphParent: 'graphPanel'});
	
	$('wmExit').addClass('hide');
	$('wmOpen').removeClass('disabled');

	prune.onLoad = prune.ui.initializePanelContent;

	prune.onSelect = function(){
		prune.ui.setPointInfo();
		prune.ui.setRangeInfo();
		prune.ui.updateActions();
	};
	prune.onDeselect = prune.onSelect;
	prune.onUndo = prune.onSelect;
	prune.onViewChange = prune.ui.updateTip;

	prune.onPtEdit = function(action){
		if (action == 'start'){
			$('btnEditPtDone').setStyle('visibility', 'visible');
			$('btnEditPtCancel').setStyle('visibility', 'visible');
			$('btnEditPt').setStyle('display', 'none');
		}
		else if (action == 'end' || action == 'cancel'){
			$('btnEditPtDone').setStyle('visibility', 'hidden');
			$('btnEditPtCancel').setStyle('visibility', 'hidden');
			$('btnEditPt').setStyle('display', 'block');			
		}
		else
			alert('Unknown edit event');
	};

	prune.ui.onInit();
	
			
	
	/* for loading xml
	var getTrack = new Request.JSON({url: rpc, onSuccess: function(callback){
		if (callback.code != 0)
			prune.loadGPX(callback.gpx);
		else
			prune.dlgError(callback.error);
	}}).get({'call': 'gpxStr', 'type': opts.type, 'id': opts.id});
	*/		
}


prune.ui.clearInfo = function(target){
	if (typeof(target)  == "string")	
		target = $(target);
		
	if (target){
		target.empty();
		return true;
	}
	else
		return false;
}

prune.ui.setPointInfo = function(){
	var point = prune.cSelect.focus;
	
	if (point){
		prune.ui.updateInfo('ptLat', point.getCenter().lat());
		prune.ui.updateInfo('ptLng', point.getCenter().lng());
		if (point.ele)
			prune.ui.updateInfo('ptEle', point.ele + 'm');
		else
			prune.ui.updateInfo('ptEle', '-');
		$('btnEditPt').setStyle('visibility', 'visible');
	}
	else{
		prune.ui.updateInfo('ptLat', '-');
		prune.ui.updateInfo('ptLng', '-');
		prune.ui.updateInfo('ptEle', '-');
		$('btnEditPt').setStyle('visibility', 'hidden');
	}
}

prune.ui.setRangeInfo = function(){
	var range = prune.cSelect.range;
	if (prune.cSelect.range.length > 1){
		prune.ui.updateInfo('rngSel', range[0].idx + ' to ' + range[range.length-1].idx);
		prune.ui.updateInfo('rngDist', Math.round(range[range.length-1].dist - range[0].dist) + 'm');
		if (range[0].ele){
			var hightStats = prune.eleChange(range);
			prune.ui.updateInfo('rngAlt', Math.round(range[0].ele) + 'm to ' + Math.round(range[range.length-1].ele) + 'm');
			prune.ui.updateInfo('rngHgh', Math.round(hightStats.highest) + 'm'); 
			prune.ui.updateInfo('rngLow', Math.round(hightStats.lowest) + 'm');
			prune.ui.updateInfo('rngAsc', Math.round(hightStats.climb) + 'm'); 
			prune.ui.updateInfo('rngDsc', Math.round(hightStats.descent) + 'm');
		}
	}
	else{
		prune.ui.updateInfo('rngSel', '-');
		prune.ui.updateInfo('rngDist', '-');
		prune.ui.updateInfo('rngAlt', '-');
		prune.ui.updateInfo('rngHgh', '-'); 
		prune.ui.updateInfo('rngLow', '-');
		prune.ui.updateInfo('rngAsc', '-'); 
		prune.ui.updateInfo('rngDsc', '-');
	}
}

prune.ui.updateTip = function(){
	if (prune.cSelect.focus)
		prune.ui.updateInfo('tip', 
			'<p>You can delete a point, or range of points</p>'
			+'<p>You can also use your keyboard to navigate and delete points. ctrl+left and ctrl+right '
			+'select next respective right point. [del] to delte a point.</p>'
			+'<p>to learn more about keyboard shortcuts click [help->Keyboard Shortcuts]</p>');
	else if (prune.points.visable > 0)
		prune.ui.updateInfo('tip', '<p>Select points to edit.</p><p>You can select multiple points by shift+click a point</p>');
}

prune.ui.updateActions = function(){
	if (prune.cSelect.range.length != 0){
		//$('wmDeselect').removeClass('disabled');
		$('mtDeselect').removeClass('disabled');
		$('wmDelete').removeClass('disabled');
		$('mtDelete').removeClass('disabled');
		$('mtZoomSelected').removeClass('disabled');
		$('wmZoomSelected').removeClass('disabled');
	}
	else{
		//$('wmDeselect').addClass('disabled');
		$('mtDeselect').addClass('disabled');
		$('wmDelete').addClass('disabled');
		$('mtDelete').addClass('disabled');	
		$('mtZoomSelected').addClass('disabled');
		$('wmZoomSelected').addClass('disabled');
	}

	if (prune.history.length > 0){
		$('wmUndo').removeClass('disabled');
		$('wmUndoAll').removeClass('disabled');
		$('mtUndo').removeClass('disabled');
		$('wmSave').removeClass('disabled');
	}
	else{
		$('wmUndo').addClass('disabled');
		$('wmUndoAll').addClass('disabled');
		$('mtUndo').addClass('disabled');
		$('wmSave').addClass('disabled');
	}
	prune.ui.updateTip();
}

/*
* There is no default exit event as it is only relevant 
* in embeded applications
*/
prune.ui.setupExit = function(func){
	var exit = $('wmExit');
	exit.removeEvents('click');
	exit.addEvent('click', func);
	exit.removeClass('hide');
}

// This is for extending the base prune UI with more functionality
prune.ui.extUI = Function.from(true);

prune.ui.onInit = Function.from(true);

// Initialize MochaUI when the DOM is ready
window.addEvent('load', function(){ //using load instead of domready for IE8

	MUI.myChain = new Chain();
	MUI.myChain.chain(
		function(){MUI.Desktop.initialize();},
		function(){MUI.Dock.initialize({dockVisible: false});},
		function(){prune.ui.initializeColumns();},		
		function(){prune.ui.initializeWindows(); MUI.Dock.toggle();},
		function(){
			prune.ui.extUI(); MUI.myChain.callChain();
		},
		function(){
			prune.ui.init();
		}
	).callChain();	
	prune.resize($('mainPanel'));
});