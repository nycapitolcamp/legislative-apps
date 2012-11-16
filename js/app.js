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

    // Merge objects
    for (key in data) {
        this[key] = data[key];
    }
    this.data = data;
    // console.log(data)


    // Get Amendment info
    this.amendments = [];
    this.numAmendments = 0
    for(bkey in data.amendments) {
        var amendmentID = data.amendments[bkey]

        var thisBill = this;
        thisBill.numAmendments++;
        getBillData(amendmentID, function(data) {

            var results = data.response.results;

            // Iterate over matching bills
            for(key in results) {
                // console.log(results[key].data.bill);
                thisBill.amendments.push(results[key].data.bill);
                thisBill.amendments[thisBill.amendments.length-1] = results[key].data.bill;
            }
            
            // Wait till we have all the amendments
            if (thisBill.numAmendments == thisBill.amendments.length) {                
               thisBill.render();
            }
        });
        

        
    }
}

Bill.prototype.template = $("#billTemplate").html();
Bill.prototype.render = function(){
    console.log('reader');
    this.difftext = BillDiff(this.fulltext, this.amendments[0].fulltext, true);

    
    var tmpl = _.template(this.template);   
    var view = $("<article class='bill-container'>").html(tmpl({difftext:this.difftext}));
    $('#bills').empty().html(view);

 
    // console.log(this.difftext);

};
