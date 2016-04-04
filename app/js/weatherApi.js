/*global $*/

'use strict'; 

var config = require('./../../config.js'); 
var Http = require('./util/http.js');

var WeatherApi = (function() {

	//var geoloc = null;
	var dailyWeather = null;
	var currWeather = null;

	function _getDailyURL(geolocation){
		return 'http://api.openweathermap.org/data/2.5/forecast/daily?' + 
			   'lat='    + geolocation.lat       			     + 
			   '&lon='   + geolocation.lng                       +
			   '&units=' + config.units 					     + 
			   '&appid=' + config.weatherApi.key                 +
			   '&cnt=8';
	}

	function _getCurrentWeatherURL(geolocation){
		return 'http://api.openweathermap.org/data/2.5/weather?' + 
			   'lat='    + geolocation.lat       			     + 
			   '&lon='   + geolocation.lng                       +
			   '&units=' + config.units 					     + 
			   '&appid=' + config.weatherApi.key;
	}

	function _getLocaleString(unixDate){
		return new Date(unixDate * 1000).toLocaleString();
	}

	function _getLocaleDate(unixDate){
		return new Date(unixDate * 1000).toLocaleDateString();
	}

	function _getDay(unixDate){
		return new Date(unixDate * 1000).getDay(); 
	}

	function _dayToString(day){
		var string = "";
		switch(day){
			case 0 :
				string = "Sunday";
				break;
			case 1 :
				string = "Monday";
				break;
			case 2 :
				string = "Tuesday";
				break;
			case 3 :
				string = "Wednesday";
				break;
			case 4 :
				string = "Thursday";
				break;
			case 5 :
				string = "Friday";
				break;
			case 6 :
				string = "Saturday";
				break;
		}
		return string;
	}

	function _getTemperatureSymbol() {
		var symbol = "";
		switch(config.units) {
			case "metric":
			 	symbol = "\u00B0C";
				break;
			default:
			 	symbol = "\u00B0C";
				break;
		}
		return symbol;
	}

	function getCurrentWeather(){
		return {
			temp: currWeather.main.temp + _getTemperatureSymbol(),
			city: currWeather.name,
			desc: currWeather.weather[0].description,
			icon: currWeather.weather[0].icon,
			windSpeed: currWeather.wind.speed,
			dataTime: _getLocaleString( currWeather.dt ) 
		};
	}

	function getWeeklyWeather(){
		var weekly = [];

		var i = 0;
		for (i; i < dailyWeather.list.length; i++) {
			weekly.push({
				date: _getLocaleDate(dailyWeather.list[i].dt),
				day: _dayToString(_getDay(dailyWeather.list[i].dt)),
				dayTemp: dailyWeather.list[i].temp.day + _getTemperatureSymbol(),
				minTemp: dailyWeather.list[i].temp.min + _getTemperatureSymbol(),
				maxTemp: dailyWeather.list[i].temp.max + _getTemperatureSymbol(),
				weatherDesc: dailyWeather.list[i].weather[0].description,
				weatherIcon: dailyWeather.list[i].weather[0].icon
			});
		}

		return {
			city: dailyWeather.city.name,
			week: weekly
		};
	}

	/*function refresh(){
		init(geoloc);
	}*/

	function getImgURL(id){
		return 'http://openweathermap.org/img/w/' + id + '.png';
	}

	function init(geolocation, callback){

		var dailyReq = Http.get({ url: _getDailyURL(geolocation) });
		var currReq = Http.get({ url: _getCurrentWeatherURL(geolocation) });

		$.when(currReq ,dailyReq).done(function(currResp, dailyResp){
			dailyWeather = dailyResp;
			currWeather  = currResp;

			if (callback) {
				callback();				
			}
		});
	}

	return {
		init: init,
		//refresh: refresh,
		getCurrentWeather: getCurrentWeather,
		getWeeklyWeather: getWeeklyWeather,
		getImgURL: getImgURL
	};

})();

module.exports = WeatherApi;