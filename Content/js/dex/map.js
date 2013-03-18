dex.map = new function() {
	var scriptLoaded = false;
	var self = this;
	var queue = [];
		
	this.load = function(element, config, events) {
		var cfg = {element : element, config : config, events: events};
		if (!scriptLoaded  && (!window.google || !google.maps)) {
			queue.push(cfg);
			$.getScript("//maps.google.com/maps/api/js?sensor=true&region=nz&async=2&callback=dex.map.googleMapApiLoaded");
		}
		else {
			setupMap(cfg);
		}
	}
	
	this.googleMapApiLoaded = function()
	{
		if (!window.google || !google.maps || !google.maps.Map)
			return setTimeout(googleMapApiLoaded, 100);
		
		scriptLoaded = true; 
		while(queue.length) 
			setupMap(queue.pop());
	}
	
	function setupMap(map) {
		var initialLocation;
		var center = map.config.center.split(',');
		center = new google.maps.LatLng(parseFloat(center[0]), parseFloat(center[1]));
		var myOptions = {mapTypeId : google.maps.MapTypeId.ROADMAP, zoom : parseInt(map.config.zoom||12) };

		var map = new google.maps.Map(map.element, myOptions);
		map.setCenter(center);
	}
	function addInfoWindow(map, marker, content) {
		var infowindow = new google.maps.InfoWindow({
			content : content,
			maxWidth : 350
		});
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(map, marker);
		});
	}
}