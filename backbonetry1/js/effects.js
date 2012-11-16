

$(document).ready(function(){


	$('.collapsible .toggle').live('click', function(e){
		e.preventDefault();
		$(this).parents('.collapsible').find('.collapse').slideToggle();
	});

});