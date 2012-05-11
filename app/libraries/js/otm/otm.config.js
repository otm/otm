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

otm.grade = [
	'white', 'green', 'blue', 'red', 'black'
],
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