/*global $, document*/
'use strict'; 

var ipcRenderer = require('electron').ipcRenderer;
var WeatherApi = require('./app/js/weatherApi.js');
var GeolocationApi = require('./app/js/geolocationApi.js');

(function() {

	var view = {
		header: null,
		currWeather: null,
		nextWeather: null
	};

	function _createEl(name, className){
		return $(document.createElement(name)).addClass(className);
	}

	function _renderWeatherImg(imgId, cssClass) {
		return _createEl("img", cssClass).attr("src", WeatherApi.getImgURL(imgId));
	}

	function _renderCurrentWeather($curr){
		$curr.empty();

		var weather = WeatherApi.getCurrentWeather();

		var _getImg = function() {
			return _createEl("li", "").append(_renderWeatherImg(weather.icon, "curr-img")); 
		};

		var _getDetails = function() {
			return _createEl("li", "").append(_createEl("span", "").text(weather.temp))   // Temperature
									  .append(_createEl("span", "").text(weather.desc));  // Description
		};

		var _getDataTime = function () {
			return _createEl("div", "curr-datatime").append(_createEl("span", "update-text").text("Data updated on : "))
				   					   				.append(_createEl("span", "update-time").text(weather.dataTime));
		}

		// City Name
		$curr.append(_createEl("div", "curr-city").text(weather.city));

		// Weather details
		var $details = _createEl("ul", "");
		$details.append(_getImg()); // Weather Icon
		$details.append(_getDetails()); // Weather details

		$curr.append($details);  
		$curr.append(_getDataTime()); // Data update time
	}

	function _renderNextWeather($next){
		$next.empty();

		var nextDays = WeatherApi.getWeeklyWeather();
		var _renderLine = function(obj) {
			// Temperature
			var $temp = _createEl("div", "").append(_renderWeatherImg(obj.weatherIcon, "next-img"))
									        .append(_createEl("span", "").text(obj.maxTemp))
									        .append(_createEl("span", "").text(obj.minTemp)); 
			// Line
			return _createEl("li", "").append(_createEl("span", "").text(obj.day))  // Day
								      .append($temp);				  
		};

		// Weather details
		var $details = _createEl("ul", "");
		var i = 1;
		for (i; i < nextDays.week.length; i++) {
			$details.append(_renderLine(nextDays.week[i]));
		}

		$next.append($details);  
	}

	function _renderPage(callback){
		GeolocationApi.getCurrentPosition().done(function(loc){
			WeatherApi.init(loc, callback);
		});		
	}

	function _refresh() {
		_renderCurrentWeather(view.currWeather);
		_renderNextWeather(view.nextWeather);
	}

	function _renderMenu(){
		var $list = _createEl("ul", "app-menu");

		$list.append(_createEl("li", "menu-refresh")) 
			 .append(_createEl("li", "menu-hide")) 
			 .append(_createEl("li", "menu-close")); 

		$list.children(".menu-refresh").on("click", function() {
			_renderPage(_refresh);
		});

		$list.children(".menu-hide").on("click", function() {
			ipcRenderer.send('app-hide');
		});
		
		$list.children(".menu-close").on("click", function() {
			ipcRenderer.send('app-quit');
		});
		
		return $list;
	}

	function _renderHeader($header){
		// App title
		$header.append(_createEl("span", "app-title").text("WeatherApp"));
		// Menu items
		$header.append(_renderMenu());
	}

	function _autoRefresh(){
		setTimeout(function(){
			_renderPage(_refresh); 
			_autoRefresh();
		}, 300000);
	}

	function _init() {
		// get dom element
		view.header = $('#header');
		view.currWeather = $('#weather-current');
		view.nextWeather = $('#weather-next');
		// Render view
		_renderHeader(view.header);
		_renderCurrentWeather(view.currWeather);
		_renderNextWeather(view.nextWeather);
		// Auto refresh
        _autoRefresh();
	}

	/*
	* Main process
	*/
	GeolocationApi.init().done(function(){
		_renderPage(_init);
	});
	
})();