/*global $*/
'use strict';

var Http = (function(){

	function get(parms){

		var deferred = parms.promise || $.Deferred();

		parms.tryNumber = !parms.tryNumber ? 3 : parms.tryNumber;

	    $.ajax({ url: parms.url })
		 .done(function(data, textStatus, jqXHR) {
	     	if (parms.onSuccess) {
	        	parms.onSuccess({ data: data, status: textStatus, jqxhr: jqXHR }); 	     		
	     	}

	     	deferred.resolve(data);
		 })
		 .fail(function(jqXHR, textStatus, errorThrown) {
	        if (parms.tryNumber > 0) {
	        	parms.tryNumber--;
	        	parms.promise = deferred;
	          	get(parms);
	        } else {
	        	if (parms.onFail) {
	        		parms.onFail({ errorThrown: errorThrown, status: textStatus, jqxhr: jqXHR });	
	        	}
	        	deferred.reject(); 
	        }
		 });

		return deferred;
	}

	return {
		get: get
	};
})();

module.exports = Http;