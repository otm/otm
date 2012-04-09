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