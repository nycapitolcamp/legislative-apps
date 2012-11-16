
// The  diff_match_patch library needs to be loaded, probably by the host page
var dmp = new diff_match_patch();

var bill_text_v0 = null; // Replace null with appropirate RESTfull API call
var bill_text_v1 = null; // Replace null with appropirate RESTfull API call

// Strip distracting translation artifacts (line #s and manual jusitifcation)
var clean_text_formatting = function(messy_text){
	var cleaned_text = messy_text.replace(/^ {0,6}[0-9]* */, "");
	return cleaned_text.replace(/  +/, " ");
}

var bill_text_v0 = clean_text_formatting( bill_text_v0 );
var bill_text_v1 = clean_text_formatting( bill_text_v1 );

// Initialize the text delta history object from the original text (as string)
var init_text_diffs_history = function(org_text_version){
	var basearray = org_text_version.match(/./g);
	return basearray;
}
var history_text = init_text_diffs_history(bill_text_v0);

// Get the API's diff array, the format supported by custom history log object
var bill_diff = dmp.diff_main(bill_text_v0, bill_text_v1);

// From array of diff_chunks returned by dmp.diff_main, add next history state
var extend_history_with_diff_array = function(history_log_obj, new_diff_array){
	var newarray = [];
	var version = history_log_obj[0].length;
	while(new_diff_array.length > 0){
		while ( !(history_log_obj[0][version-1]) )
			newarray.push(history_log_obj.shift());
		var segment = new_diff_array.shift();
		var segchars = segment[1].match(/./g) ;
		if ( segment[0] === -1 ) { // deleted if -1; new version is null
			for ( var i=0; i<segchars.length; i++ ) {
				history_log_obj[0][version]=null;
				newarray.push(history_log_obj.shift());
			}
		} else if ( segment[0] === 0 ) { // unchanged; dup to array end
			for ( var i=0; i<segchars.length; i++ ) {
				history_log_obj[0][version]=segchars[i];
				newarray.push(history_log_obj.shift());
			}
		} else { // otherwise added if 1 ; pad history & add this at end
			for ( var i=0; i<segchars.length; i++ ) {
				var t = [];
				t[version] = segchars[i];
				newarray.push(t);
			}
		}
	}
	while ( !(history_log_obj[0][version-1]) )
	newarray.push(history_log_obj.shift());
}

// Store an updated diff history, as an array of chars with all non-null values at a given subscript are the text of that version (history_text[0...n][0] is the initial version, [0...n][1] for first revision, etc., recreate bill by concatinating all non-false values; detect addition by testing if [char_position][version-1] is a falsey value; detect deletion the same way, but checking version+1 instead.
history_text = extend_history_with_diff_array(history_text, bill_diff);


