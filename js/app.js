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

    isRootBillVersion : function(){
        // Amendments are lettered. Root bills don't have these letters.
        //     Root Bill: S7033 -2011
        //     Amendment: S7033B-2011
        return this.get("senateBillNo").match(/[A-Z][0-9]{1,5}-[0-9]{4}/);
    },

    // Bill diff
    // here we need to pass in 2 different items, and get back the pretty html diff.
    // args
    // a = origin string
    // b = modified string 
    // pretty = boolian to return html or array

    getBillDiff : function(a,b,pretty){
        // this is basic
        var dmp = new diff_match_patch();
        var ds = dmp.diff_main(a, b, false);
        if(pretty){
            var ds = dmp.diff_prettyHtml(ds);
        }
        return ds;
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
            var c = new BillVersion_Collection();
            c.push(new BillVersion({
                    id : this.get("id")
            }));

            // Cycle through and fetch all of the linked amendments.
            _.each( this.get("amendments"), function( bill_id ){
                var amendment = new BillVersion({
                    id : bill_id
                });

                c.push(amendment);
            }.bind(this));

            return c;
        }
    },
    
    // the url function should return a string that represents the url
    // where the resource is located.

    url: function(){
	   return  "http://open.nysenate.gov/legislation/2.0/bill/" + this.get("id") + ".jsonp";
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

// This is the view for instances of BillVersion Models
// it should only ever worry about displaying the actual data for
// a single BillVersion - never a collection of bill versions
// that is what the BillVersion_Collection_View is for

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
	$(this.el).html(tmpl(this.model.toJSON()));
	return this;
    }
});

// This view will be responsible for instantiating individual model views
// and then calling 'render' on each one.  after they have been rendered
// then changes to the model will automatically be re-rendered because of the
// 'this.model.bind('change',this.render)'  line in the model view initializer

var BillVersion_Collection_View = Backbone.View.extend({

    initialize: function () {
	this._views = [];
    },
    
    // This should render the last N items in the collection    
    renderLastN : function(number){
	this.$el.empty();
	for( var i = number; i > 0; i--){
	    // haha - boundary checking, what is this C?
	    if( this.collection.at( this.collection.length - i ) ){
		var model_id = this.collection.at( this.collection.length - i ).get("id");	
		this.$el.append("<article id='" + model_id + "' class='bill-container'>")
		var view = new BillVersion_View({
		    model: this.collection.get(model_id),
		    el : "#" + model_id
		});

		// this assumes the model has not already be fetched which
		// is bad practice, if it has been fetched and nothing has
		// changed,  there will be no "change" event and so nothing
		// will be rendered,  that will need to be resolved definately.
		
		this.collection.get(model_id).fetch();
	    }
	}
	
    },
    
    render: function () {
	if( !this._views.length ){
	    this.collection.each( function(item) {
		// create a container and append it for the view that we're about to create/render
		this.$el.append("<article id='" + item.get("id") + "' class='contact-container'>")

		// create the view for the model
		var billView = new BillVersion_View({
		    model: item,
		    el : "#" + item.get("id"),
		});

		// add the view so we have access to it later
		this._views.push( billView );

		// Go out and get the actual model data - this should
		// trigger the view's render function when it gets that
		// 'change' event that we bind to in the view's initization
		// funciton (mm... programing in asynchronous environments)
		item.fetch();


	    }.bind(this));
	} else {

	    // assume that if we've alredy got the views,  we've already got the
	    // models so just fetch/render them - this could lead to bugs though...
	    _.each(this._views, function(view){ view.model.fetch() });
	}
	return this;
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


// Note:  these are here to facilitate in browser manipulation
//        eventually they should be moved into the .ready closure
var b;
var bill_collection
var bill_collection_view

jQuery(document).ready(function(){

    var bill_form = $('#getbill');
    var bill_input = $('[name=bill-id]');

    $.urlParam = function(name, default_value) {
        var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
        return (results != null) ? results[1] : default_value;
    }

    bill_input.val($.urlParam('bill-id','S7033-2011'));

    bill_form.bind("submit", function() {

        // pull the bill ID from the input element
        // TODO: Verify that the input is valid first
        var bill_id = bill_input.val();
        if( bill_id) {

            // Try to strip the amendment version from in the input string
            // TODO: It'd be better to use a given amendment version as a "start back from here"
            bill_id = bill_id.replace(/([A-Z])0*([0-9]{1,5})[A-Z]?-([0-9]{4})/,'$1$2-$3')
            // billVersion = new BillVersion({
            //     id : bill_id
            // });

            // // technically we would want to bootstrap this data from the server
            // // that would resolve quite a few little ugly hacks that we're going to
            // // encounter
            // billVersion.bind("change", function(){
            //     bill_collection = billVersion.getBillVersionAmendmentsAsCollection();
            //     bill_collection_view = new BillVersion_Collection_View({
            //         el : "#bills",
            //         collection : bill_collection
            //     });

            //     bill_collection_view.renderLastN(2);
            // }.bind(billVersion));

            // billVersion.fetch();


            getBillData(bill_id, function(data) {
                
                if (data.response.metadata.totalresults == '0') {
                    alert('No Bills Match');
                    return false;
                }   

                var results = data.response.results;

                if (results) {

                    // Iterate over matching bills
                    for(key in results) {

                        var billData = results[key].data.bill;

                        // CREATE NEW BILL
                        var bill = new Bill(billData);    
                    }
                }
            });

            return false;
        }
    }).submit();
});



function getBillData(billID, callback) {

    var url = "http://open.nysenate.gov/legislation/2.0/bill/" + billID + ".jsonp";

    // Make the request.
    return $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: url,
        success: function(data) {
            callback(data);
        },
        processData: false,
    });
}

function BillDiff(a,b,pretty){
    // this is basic
    var dmp = new diff_match_patch();
    var ds = dmp.diff_main(a, b, false);
    if(pretty){
        var ds = dmp.diff_prettyHtml(ds);
    }
    return ds;
}


function Bill(data) {

    console.log(data);

    // Merge objects
    for (key in data) {
        this[key] = data[key];
    }
    // console.log(data)

    // Amendments
    for(bkey in data.amendments) {
        var amendmentID = data.amendments[bkey]
        console.log(amendmentID)
    }
   
}
Bill.prototype.example = 'ex';
Bill.prototype.render = function(){
    
};

