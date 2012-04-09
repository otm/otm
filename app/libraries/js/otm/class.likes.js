/*
---

name: Likes

script: class.Likes.js

description: Likes Class that provides controls for liking a trail

copyright: &copy;, Nils Lagerkvist.

license: GPLv3.

authors:
  - Nils Lagerkvist

requires: [SimpleModal/SimpleModal]

provides: [Likes, otm.Likes]

...
*/
var Likes = new Class({

	Implements: [Options, Events],

	options: {
		baseClass: 'star',
		onClass: 'star-enabled',
		type: 'trail'
	},
	target: null,
	id: null,
	
	initialize: function(target, id, options){
		if (typeOf(target) == 'string')
			this.target = $(target);
		else
			this.target = target;
		
		this.id = id;
		
		this.attatchListner(this.target);
	},
	
	attatchListner: function(target){
		target.addEvent('click', function(e){
			e.preventDefault();
			if(this.isLiked())
				this.dislike();
			else	
				this.like();
		}.bind(this));
	},
	
	isLiked: function(){
		return this.target.hasClass(this.options.onClass);
	},
	
	like: function(){
		new Request.JSON({
			url: otm.url.rpc, 
			onSuccess: this.likeResult.bind(this),
			data: {
				call: this.options.type + '.like', 
				id: this.id
			}
		}).get();
	},
	
	likeResult: function(response){
		if (response.code == 0){
			if (response.error == 'notLoggedIn'){
				var sm = new SimpleModal({"btn_ok":"Alert button"});
				sm.show({
					"title":"Inte inloggad",
					"contents":"Du måste logga in för att gilla stigar."
				});
			}	
			else{
				alert(response.error);
			}
			return false;
		}
		
		var childs = this.target.getChildren('.label');
		this.target.addClass('star-enabled');
		childs.each(function(child){
			child.set('text', response.likes);
		});
	},
	
	dislike: function(){
		new Request.JSON({
			url: otm.url.rpc, 
			onSuccess: this.dislikeResult.bind(this),
			data: {
				call: this.options.type + '.dislike', 
				id: this.id
			}
		}).get();
	},

	dislikeResult: function(response){
		if (response.code == 0){
					alert(response.error);
			return false;
		}
		
		var childs = this.target.getChildren('.label');
		this.target.removeClass('star-enabled');
		childs.each(function(child){
			child.set('text', response.likes);
		});
	}


});