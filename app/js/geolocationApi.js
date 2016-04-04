/*global $, navigator*/

'use strict'; 

var config = require('./../../config.js'); 
var Http = require('./util/http.js');

var GeolocationApi = (function() {

	function _getGeolocationApi(){
		return 'https://maps.googleapis.com/maps/api/js?key=' + config.googleApi.key;
	}

	function init(){
		return Http.get({ url: _getGeolocationApi( ) });
	}

	function getCurrentPosition() {
		
		var promise = $.Deferred();
		navigator.geolocation.getCurrentPosition(function(position){
			promise.resolve({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			});
		});

		return promise;
	}

	return {
		init: init,
		getCurrentPosition: getCurrentPosition
	};

})();

module.exports = GeolocationApi;