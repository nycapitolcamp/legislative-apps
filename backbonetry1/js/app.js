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
var BillVersion_Collection = Backbone.Collection.extend({
    model: BillVersion,
});

//define product model
var BillVersion = Backbone.Model.extend({
    defaults: {
	
    },

    // This does a rudimentary check to see if the amendments data
    // has more than one element.  if it does then we can assume
    // that it is a 'root' bill version,  which is to say,  it knows about
    // all children bill versions.
    //
    // I don't know if this accurately reflects the nature of the domain though 
    // - Chris (11/12/25)

    isRootBillVersion : function(){
	// this is crapy
	if(this.get("amendments") && this.get("amendments") > 1){	    
	    return this.get("amendments").length;
	}
	return false;
    },

    // Assuming the current bill model is a "root" bill as defined by the function
    // isRootBillVersion() then we generate a new Collection of models fetching their data
    // remember though that the fetch is just a wrapper around an ajax call. this means
    // it will run asynchronously. The function should return immediately,  but the data
    // won't be there right away.  In the long run it may not be the best idea to run
    // the model fetch here right away.  Of course in the long run we'll be able to query
    // a url that returns all the Bill versions in the 'results' array which means this
    // functionality will become deprecated and instead that url will be used on the 
    // BillVersion Collection object


    getBillVersionAmendmentsAsCollection : function(){
	if( this.isRootBillVersion() ){
	    c = new BillVersion_Collection();
	    _.each( this.get("amendments"), function( id ){
		var m = new BillVersion;
		m.set("id", id);
		m.fetch();
		c.push(m);
	    }.bind(this));
	    return c;
	}
    },
    
    // the url function should return a string that represents the url
    // where the resource is located.

    url: function(){ 
	return  "http://play.fearthecloud.net/index.php/legislation/2.0/bill/" + this.get("id") + ".json"; 
    },

    // backbone was originally designed to work with a Rails style REST implementation.  It has more general
    // applicability now,  but it still makes certain assumptions about the nature of the data that is available
    // at the resource returned by this.url(). the 'fetch' function is supposed to provide (mostly) seamless
    // ajax GET integration with the resource,  unfortunately we need to be a little more fancy because of the
    // whole cross domain thing.  To do this we rewrite the function that underlies 'fetch' -  the 'sync' function
    // this lets us get away with using jsonp

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

    // While sync is the underlying function for making calls to the server,  'parse' is the underlying
    // function that manages the data and assigns it to the backbone model.  In this case the actual data
    // is wrapped by a bunch of message metadata - this metadata is great,  and could probably be more
    // elegantly used to do error handling,  but for now,  we just drill down and return the actual data
    // that we want.

    parse: function(data) {
	// this is a little silly,  there is a better way i just havn't looked it up - Chris (11/15/2012)
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
var BillVersion_View = Backbone.View.extend({
    template: $("#billTemplate").html(),
    
    initialize: function(){
	// this line makes sure that when we run the render function that
	// the 'this' inside the render function still refers to the bill
	// view and not something else (closures are ridiculous)
	this.render = _.bind(this.render, this);

	// this is a quick and dirty way to get the view to render when
	// the model 'fetch' finally returns.  on the return,  the model
	// fires a 'change' event which we mind to here.  essetially this
	// means whenever the model data changes,  the view runs the
	// 'render' function

	this.model.bind("change", this.render);
    },
    
    // render the model by grabbing the template script and using
    // underscore's template function - currently this just appends
    // to the 'el' (current the '#contacts') div. as the interface
    // evolves that will probably have to change. - Chris (11/15/2012)

    render: function () {
	var tmpl = _.template(this.template);	
	$(this.el).append(tmpl(this.model.toJSON()));
	return this;
    }
});

//define master view
var BillVersion_CollectionView = Backbone.View.extend({
    el: $("#contacts"),

    initialize: function () {
	this.collection = new BillVersion_Collection(realBills);
	this.render();
    },

    render: function () {
	var that = this;
    var i =0;

	// This is where we'd do the diff?

    _.each(this.collection.models, function (item) {
        that.renderBillVersion(item);
        
    }, this);
 
    },

    renderBillVersion: function (item) {
	var billView = new BillVersion_View({
	    model: item
	});
	this.$el.append(billView.render().el);
    }
});

/*
 *  This is the code that gets the whole ball rolling.
 */

jQuery(document).ready(function(){

    // pull the bill ID from the input element
    // moving forward we'll probably want to move this into
    // a function which can be set on the form 'submit' button
    // instead of actually submitting the form we catch the
    // submit event and run this code instead.

    if( $('[name=bill-id]').val() ){
	var b = new BillVersion({
	    id : $('[name=bill-id]').val()
	});

	var billView = new BillVersion_View({
	    model : b,
	    el : "#contacts"
	});

	b.fetch();	
    }

});


