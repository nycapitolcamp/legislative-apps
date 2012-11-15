//demo data

var realBills = [
	{
		"year":"2011",
		"senateBillNo":"S607-2011",
		"title":"Relates to the definition of alternate energy production facilities",
		"lawSection":"Public Service Law",
		"sameAs":"A3536",
		"previousVersions":["S8310-2009"],
		"sponsor":{"fullname":"MAZIARZ"},
		"coSponsors":null,
		"multiSponsors":null,
		"summary":"Adds lithium ion energy batteries to the definition of alternate energy production facilities.",
		"currentCommittee":null,
		"actions":[null, null, null],
		"fulltext": "A really long string",
		"memo": "A much shorter string",
		"law":"Amd S2, Pub Serv L ",
		"votes":[null, null, null]
	},
	{
		"year":"2011",
		"senateBillNo":"S607A-2011A",
		"title":"Relates to the definition of alternate energy production facilities",
		"lawSection":"Public Service Law",
		"sameAs":"A3536",
		"previousVersions":["S8310-2009"],
		"sponsor":{"fullname":"MAZIARZ"},
		"coSponsors":null,
		"multiSponsors":null,
		"summary":"Adds lithium ion energy batteries to the definition aaaa of alternate energy production facilities.",
		"currentCommittee":null,
		"actions":[null, null, null],
		"fulltext": "A really long string",
		"memo": "A much shorter string",
		"law":"Amd S2, Pub Serv L ",
		"votes":[null, null, null]
	}
]



var bills;


//define product model
var Bill = Backbone.Model.extend({
    defaults: {
	
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

//define BillTimeline collection
var BillTimeline = Backbone.Collection.extend({
    model: Bill,
    generateDiffs: function(){
        for (index in this.models) {
            if( index ){ 
            origin = this.models[index-1]
            updated = this.models[index]
            var dmp = new diff_match_patch();
            var d = dmp.diff_main(origin, updated, false);
            console.log(d);
            // var ds = dmp.diff_prettyHtml(d);
            // console.log(ds);
           }; 
        } }
});




//define individual contact view
var BillView = Backbone.View.extend({
    tagName: "article",
    className: "contact-container",
    template: $("#billTemplate").html(),

    render: function () {
	var tmpl = _.template(this.template);
	

	$(this.el).html(tmpl(this.model.toJSON()));
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

//create instance of master view
var BillTimeline = new BillTimelineView();

