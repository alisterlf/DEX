dex.map = {
	scriptLoaded : false,
	self : this,
	queue : [],
	requiresAsyncLoad : true,
	load : function(element, config, events) {
		var cfg = {
			element : element,
			config : config,
			events : events
		};
		cfg.module = config.provider == 'Bing' ? this.bingModule : this.googleModule;
		if (!cfg.module.isReady()) {
			this.queue.push(cfg);
			cfg.module.loadScript();
		} else {
			this.setupMap(cfg);
		}
	},
	timeout : 100,
	apiLoaded : function() {
		if (this.timeout > 5000) {
			dex.log('Second map script not loaded properly.', dex.traceLvel.error);
		}
		for (var i = 0; i < this.queue.length; i++) {
			if (!this.queue[i].module.isReady()) {
				return setTimeout(this.apiLoaded, Math.min(this.timeout *= 2, 1000));
			}
		}
		this.scriptLoaded = true;
		while (this.queue.length) {
			this.setupMap(this.queue.pop());
		}
	},
	setupMap : function(mapSettings) {
		var module = mapSettings.module;
		var cfg = mapSettings.config;
		var map = module.createMap(mapSettings);

		for (var e in mapSettings.events) {
			if (e.indexOf('onmarker') === 0 || e == 'onload') {
				continue;
			}
			module.attachEvent(map, e.substr(2), function(ev) {
				mapSettings.events[e].call(mapSettings.element, {
					map : map,
					event : ev
				}, mapSettings.config);
			});
		}

		var markers = [];
		if (mapSettings.config.markersdatasource) {
			dex.log('map::Adding markers', dex.traceLevel.info);

			$(mapSettings.config.markersdatasource).each(function() {
				var config = dex.loadConfig(this);
				var point = this.getPosition(config.latlng);
				var marker = module.createMarker(map, point, config);
				markers.push(marker);

				dex.log('map::Adding marker {0}.', point, dex.traceLevel.verbose);

				for (var e in mapSettings.events) {
					if (e.indexOf('onmarker') !== 0) {
						continue;
					}

					var ev = e.substr(6);
					var handler = function(ev) {
						var c = arguments.callee;
						var args = {
							map : map,
							markerElement : c.element,
							event : ev,
							marker : c.marker
						};
						arguments.callee.event.call(arguments.callee.element, args, mapSettings.config);
					};
					handler.event = mapSettings.events[e];
					handler.marker = marker;
					handler.element = this;

					module.attachEvent(marker, e.substr(8), handler);
				}
			});
		}
		if (mapSettings.config.center == "auto") {
			module.fitBounds(map, markers);
		} else if (mapSettings.config.center != "auto") {
			module.setCenter(map, this.getPosition(mapSettings.config.center), parseInt(mapSettings.config.zoom, 10) || 12);
		}
		if (mapSettings.events.onload) {
			mapSettings.events.onload.call(mapSettings.element, map, mapSettings.config);
		}
	},
	getPosition : function(point) {
		if (!point) {
			throw new Error('Invalid point');
		}
		var p = point.split(',');
		if (p.length != 2) {
			throw new Error('Invalid point: ' + point);
		}
		var r = new RegExp(' ', 'g');
		return {
			latitude : parseFloat(p[0].replace(r, '')),
			longitude : parseFloat(p[1].replace(r, ''))
		};
	},
	googleModule : {
		isReady : function() {
			return !!(window.google && google.maps);
		},
		loadScript : function() {
			$.getScript("//maps.google.com/maps/api/js?sensor=true&region=nz&async=2&callback=dex.map.apiLoaded");
		},

		createMap : function(mapSettings) {
			var myOptions = {
				mapTypeId : google.maps.MapTypeId.ROADMAP,
				zoom : 1
			};
			return new google.maps.Map(mapSettings.element, myOptions);
		},

		attachEvent : function(obj, eventName, handler) {
			return google.maps.event.addListener(obj, eventName, handler);
		},

		createMarker : function(map, point, cfg) {
			var marker = new google.maps.Marker();
			marker.setPosition(new google.maps.LatLng(point.latitude, point.longitude));
			marker.setMap(map);
			return marker;
		},

		setCenter : function(map, point, zoom) {
			map.setCenter(new google.maps.LatLng(point.latitude, point.longitude));
			map.setZoom(zoom);
		},

		fitBounds : function(map, markers) {
			var bound = new google.maps.LatLngBounds();
			for (var i = 0; i < markers.length; i++) {
				dex.map.getPosition();
			}
			map.fitBounds(bound);
		}
	},
	bingModule : {
		isReady : function() {
			return !!(window.Microsoft && Microsoft.Maps && Microsoft.Maps.Map);
		},
		loadScript : function() {
			window.__mapapi_function_callback = dex.map.apiLoaded;
			$.getScript("//ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onscriptload=__mapapi_function_callback");
		},
		createMap : function(mapSettings) {
			mapSettings.element.style.position = 'relative';
			var map = new Microsoft.Maps.Map(mapSettings.element, {
				credentials : mapSettings.config.apikey,
				enableClickableLogo : false,
				enableSearchLogo : false
			});
			map.setView({
				mapTypeId : Microsoft.Maps.MapTypeId.road
			});
			return map;
		},
		attachEvent : function(obj, eventName, handler) {
			return Microsoft.Maps.Events.addHandler(obj, eventName, handler);
		},
		createMarker : function(map, point, cfg) {
			var pin = new Microsoft.Maps.Pushpin(point);
			map.entities.push(pin);

			return pin;
		},
		setCenter : function(map, point, zoom) {
			map.setView({
				center : point,
				zoom : zoom
			});
		},
		fitBounds : function(map, markers) {
			var locations = [];
			for (var i = 0; i < markers.length; i++) {
				locations.push(markers[i].getLocation());
			}
			var bound = Microsoft.Maps.LocationRect.fromLocations(locations);
			map.setView({
				bounds : bound
			});
		}
	}
};