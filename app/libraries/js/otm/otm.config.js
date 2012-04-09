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
		trails: '/viewtrails/',
		trail: '/viewtrail/?id=',
		training: '/viewtraining/?id=',
		poi: '/poi/?id='
	}
};

otm.color = {
	trail: '#ff0000',
	grade: ['#FFFFFF', '#00FF00', '#0000FF', '#FF0000', '#000000']
};

otm.icons = {
	base: '/images/gIcons/',
	grade: [
		'/images/gIcons/cyclingmountainnotrated.png',
		'/images/gIcons/cyclingmountain1.png', 
		'/images/gIcons/cyclingmountain2.png', 
		'/images/gIcons/cyclingmountain3.png', 
		'/images/gIcons/cyclingmountain4.png'
	],
	numeric: '/images/gIcons/km/red',
	finish: '/images/gIcons/finish.png',
	high: '/images/gIcons/up.png',
	low: '/images/gIcons/down.png',
	trail: '/images/gIcons/smallRoundRed.png',
	poi: {
		landmark: '/images/gIcons/smallRoundRed.png'
	},
	getNumeric: function(i){return otm.icons.numeric + i + '.png';}
};