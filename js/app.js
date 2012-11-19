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

function BillDiffStats(diffs){
    /** Definitions from diff_match_patch **/
    var DIFF_DELETE = -1;
    var DIFF_INSERT = 1;
    var DIFF_EQUAL = 0;

    var insertions = 0;
    var deletions = 0;
    var unchanged = 0;

    for(var i=0; i<diffs.length; i++){
     if(diffs[i][0]==DIFF_EQUAL) unchanged=unchanged+diffs[i][1].split(/\s+/).length;
     if(diffs[i][0]==DIFF_DELETE) deletions=deletions+diffs[i][1].split(/\s+/).length;
     if(diffs[i][0]==DIFF_INSERT) insertions=insertions+diffs[i][1].split(/\s+/).length;
    }

    var summarystats = 'Total Words = '+(unchanged+deletions+insertions)+'   Unchanged: '+unchanged+'   Deleted: '+deletions+'   Inserted: '+insertions;
    return summarystats;
}

function format_bill_diffs(diffs) {
    var ignore_white_space = false;
    var html = [];
    var cursor = 0;
    for (var x = 0; x < diffs.length; x++) {
        var text = diffs[x][1].replace(/&/g, '&amp;')
                               .replace(/</g, '&lt;')
                               .replace(/>/g, '&gt;')
                               .replace(/\n/g, '<br/>');

        var diff_type = diffs[x][0];
        if (ignore_white_space && text.match(/^\s*$/)) {
            diff_type = DIFF_EQUAL;
        }
        switch (diff_type) {
            case DIFF_INSERT:
                html.push('<span class="added_text">' + text + '</span>');
                break;
            case DIFF_DELETE:
                html.push('<span class="deleted_text">' + text + '</span>');
                break;
            case DIFF_EQUAL:
                html.push('<span class="unaltered_text">' + text + '</span>');
                break;
        }
    }
    return html.join('');
};


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


var clean_text_formatting = function(messy_text){
    var cleaned_lines = []
    var dirty_lines = messy_text.split(/\r?\n/)
    var i = 0;
    do {
        var line = dirty_lines[i];
        // Skip the page breaks:
        //
        //  EXPLANATION--Matter in ITALICS (underscored) is new; matter in brackets
        //                       [ ] is old law to be omitted.
        //                                                            LBD00121-02-1
        //
        // S. 39                               2
        //
        if (line.match(/EXPLANATION--Matter in ITALICS \(underscored\)/)) {
            cleaned_lines.pop() // Skip the leading blank line

            do { // Skip all the lines in between..
                i+=1;
                if (i >= dirty_lines.length) {
                    break;
                } else {
                    line = dirty_lines[i];
                }
            } while (!line.match(/[A-Z]\. [0-9]{1,5}/));
            i++; // Skip the trailing blank line

        } else {
            // Remove the leading white-space and line numbers
            original_length = line.length
            fixed_line = line.replace(/^[0-9 ]{7}/, "");
            if (fixed_line.length != 72) {
                fixed_line+='\n'
            } else {
                if (fixed_line[71] == '-') {
                    fixed_line = fixed_line.slice(0,71);
                } else {
                    fixed_line += ' ';
                }
            }
            fixed_line = fixed_line.replace(/([^ ]) +/g,'$1 ');


            console.log(fixed_line)
            cleaned_lines.push(fixed_line);
        }
        i++;
    } while (i < dirty_lines.length);
    return cleaned_lines.join('');
}


Bill.prototype.template = $("#billTemplate").html();
Bill.prototype.diffstatstemplate = $("#diffstatsTemplate").html();
Bill.prototype.render = function(){
    console.log('reader');

    var dmp = new diff_match_patch();
    var bill_original = clean_text_formatting(this.fulltext);
    var bill_amended = clean_text_formatting(this.amendments[0].fulltext);
    var billDiffs = dmp.diff_main(bill_original, bill_amended,false);
    dmp.diff_cleanupSemantic(billDiffs);
    this.difftext = format_bill_diffs(billDiffs);

    this.diffstatstext = BillDiffStats(billDiffs);

    var statstmpl = _.template(this.diffstatstemplate);
    var statsview = $("<article class='bill-container'>").html(statstmpl({diffstatstext:this.diffstatstext}));
    $('#diffstats').empty().html(statsview);

    var tmpl = _.template(this.template);
    var view = $("<article class='bill-container'>").html(tmpl({difftext:this.difftext}));
    $('#bills').empty().html(view);
};
