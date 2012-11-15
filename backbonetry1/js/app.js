/**
  *  Notes - HOORAY
  * 
  *  Backbone does its best to enforce a seperation between data models and how that data is presented
  *  Those familier with the MVC patter will recognize some similarities. This can be particularly confusing
  *  because this is all implemented in Javascript which is often refered to as "Frontend" and therefore
  *  presentation oriented,  as opposed to "Backend"  which traditionally deals with models, collections
  *  (ie. arrays, iterables etc) and other non-presentation related "STUFF."
  * 
  *  Backbone breaks this worldview a little by providing another layer of abstraction. Now on the traditional 
  *  "Frontend"  we also have a "Backend."  Websites for the most part are HTML affairs,  browser requests html
  *  server delivers html,  browser renders html. In the world where backbone lives,  The browser requests javascript
  *  and data in the form of JSON.  This is great beacuse if the data is on your client then you can play around
  *  with it visually without waiting for the server to get back to you.  BUT  when you move the data from the server
  *  to the client,  you also have to move the stuff that processes that data.  This is where backbone models and
  *  collections come in.  These objects hold the data,  and the functions that operate on that data.  Backbone
  *  views on the other hand take models and collections as arguments,  then they present or 'render' things to
  *  the browser DOM.  Models/Collections and Views may be seperate,  but they talk quite a bit to eachother. This
  *  is managed throug events.  i'll point some of these out in further documentation.
  *
  *  Chris - 11/15/2012
  **/

/*
 *  Backend Models and Collections
 */

//define BillTimeline collection
var BillTimeline = Backbone.Collection.extend({
    model: Bill,
});

//define product model
var Bill = Backbone.Model.extend({
    defaults: {
	
    },
    isRootBill : function(){
	// this is crapy
	if(this.get("amendments") && this.get("amendments") > 1){	    
	    return this.get("amendments").length;
	}
	return false;
    },
    getBillAmendmentsAsCollection : function(){
	if( this.isRootBill() ){
	    c = new BillTimeline();
	    _.each( this.get("amendments"), function( id ){
		var m = new Bill;
		m.set("id", id);
		m.fetch();
		c.push(m);
	    }.bind(this));
	    return c;
	}
    },
    
    url: function(){ return  "http://play.fearthecloud.net/index.php/legislation/2.0/bill/" + this.get("id") + ".json"; },
    sync: function(method, model, options) {
	// Default JSON-request options.
	var params = _.extend({
	    type:         'GET',
	    dataType:     'jsonp',
	    url:model.url(),
	    jsonp: "jsonpCallback",   // the api requires the jsonp callback name to be this exact name
	    processData:  false,
	}, options);
	
	// Make the request.
	return $.ajax(params);
    },
    parse: function(data) {
	// parse can be invoked for fetch and save, in case of save it can be undefined so check before using 
	if (data) {
	    if ( data.response ) {
		if (data.response.results) {
		    if (data.response.results[0] ){
			if( data.response.results[0].data){
			    if( data.response.results[0].data.bill ){
				return data.response.results[0].data.bill;
			    }
			}
		    }
		}
	    }
	}
    }
});



/*
 *  Frontend Views
 */


//define individual contact view
var BillView = Backbone.View.extend({
    template: $("#billTemplate").html(),
    
    initialize: function(){
	this.render = _.bind(this.render, this);
	this.model.bind("change", this.render);
    },
    
    render: function () {
	var tmpl = _.template(this.template);
	
	$(this.el).append(tmpl(this.model.toJSON()));
	return this;
    }
});

//define master view
var BillTimelineView = Backbone.View.extend({
    el: $("#contacts"),

    initialize: function () {
	this.collection = new BillTimeline(realBills);
	this.render();
    },

    render: function () {
	var that = this;
    var i =0;

	// This is where we'd do the diff?

    _.each(this.collection.models, function (item) {
        that.renderBill(item);
        
    }, this);
 
    },

    renderBill: function (item) {
	var billView = new BillView({
	    model: item
	});
	this.$el.append(billView.render().el);
    }
});

/*
 *  This is the code that gets the whole ball rolling.
 */

jQuery(document).ready(function(){
    // pull the billID from the input element
    // moving forward we'll probably want to move this into
    // a function which can be set on the form 'submit' button
    // instead of actually submitting the form we catch the
    // submit event and run this code instead.

    if( $('[name=bill-id]').val() ){
	var b = new Bill();
	b.set("id", $('[name=bill-id]').val());

	var billView = new BillView({
	    model : b,
	    el : "#contacts"
	});

	b.fetch();	
    }

});


