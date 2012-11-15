//demo data
var bills = [
    { name: "Bill 1", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
    { name: "Bill 2", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
    { name: "Bill 3", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
];

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
	}
]



//define product model
var Bill = Backbone.Model.extend({
    defaults: {
	
    },
    url: "http://open.nysenate.gov/legislation/2.0/bill/S1234-2011.json",  
    sync: function(method, model, options){  
	options.timeout = 10000;  
	options.dataType = "jsonp";  
	return Backbone.sync(method, model, options);  
    }  
});

//define BillTimeline collection
var BillTimeline = Backbone.Collection.extend({
    model: Bill
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

