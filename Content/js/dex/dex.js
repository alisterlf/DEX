﻿window.dex = new function ($, window, document, undefined) {
	var self = this;
	var traceLevel = {
		off: -1,
		error: 0,
		warning: 1,
		info: 2,
		verbose: 3
	};
	this.traceLevel = traceLevel;
	this.trace = traceLevel.error;
	this.componentsUrl = '/Content/js/dex';
	function onDOMChanged(element) {
		if (!element.tagName) return;
		self.load(element);
	}
	function onReady() {
		self.load(document.body);
		return;
		if (window.MutationObserver) {
			var target = document.querySelector('body');
			var observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					onDOMChanged(mutation.target);
				});
			});
			var config = {
				subtree: true,
				childList: true
			};
			observer.observe(target, config);
		} else if (document.addEventListener) {
			document.body.addEventListener("DOMNodeInserted", function (e) {
				e = e || event;
				onDOMChanged(e.srcElement || e.target || document.body);
			}, false);
		}
	}
	this.load = function (container) {
		var $components = $('.dex', container);
		$components.each(function (index, element) {
			loadComponent(element);
		});
	};
	function loadComponent(element) {
		var $element = $(element);
		var component = $element.data('dex');
		if (!component) {
			self.log('Component property is empty on element "{0}".', element.id, traceLevel.warning);
			return;
		}
		if ($element.data('dex-loaded') == true) {
			self.log('Component already loaded on element {0}({1}).', element.tagName, element.id || 'NULL', traceLevel.verbose);
			return;
		}
		if (!self[component]) return loadComponentCode(component, element);
		self.log('Setting up component "{0}" on element {2}({1})".', component, element.id || 'NULL', element.tagName, traceLevel.info);
		var config = loadConfig(element);
		var events = loadEvents(element);
		self[component].load(element, config, events);
		if (!self[component].requiresAsyncLoad) {
			//console.log('fazendo load: ' + component);
			if (events.onload) events.onload.call(element, null, config);
			delete events.onload;
		}
		$element.data('dex-loaded', true);
	};
	var loaders = {};
	function loadComponentCode(component, element) {
		if (loaders[component]) {
			if (!loaders[component].hasError) loaders[component].push(element);
			return;
		}
		var url = self.componentsUrl + '/' + component + '.js';
		self.log('Loading code from "{0}" for component "{1}".', url, component, traceLevel.info);
		loaders[component] = [];
		var elements = loaders[component];
		elements.push(element);
		loadScript(url, component,
        function () {
        	self.log('Loaded component code "{0}".', component, traceLevel.verbose);
        	if (!self[component]) self.log('Error initializing component "{0}".', component, traceLevel.error);
        	else while (elements.length)
        		loadComponent(elements.pop(), true);
        },
        function (error) {
        	self.log('Error loading component code "{0}" ({1}).', component, error, 0);
        });
	}
	function loadScript(url, component, callback, errorCallback) {
		//Not using $.getScript because code with SyntaxError will get harder to debug
		var el = document.createElement('script');
		el.src = url;
		if (navigator.userAgent.match(/MSIE 7.0/) || navigator.userAgent.match(/MSIE 8.0/)) //IE8- don't support onload.
			el.onreadystatechange = function (e) {
				if (this.readyState == 'loaded' || this.readyState == 'complete') callback();
			};
		else el.onload = callback;
		el.onerror = errorCallback;
		document.body.appendChild(el);
	}
	function getAttributes(element, filter) {
		var rt = [];
		var filter = filter || "";
		for (var i = 0, j = element.attributes.length; i < j; i++) {
			if (element.attributes[i].name.indexOf('data') != 0) continue;
			if (element.attributes[i].name.indexOf(filter) == 0) rt.push({
				name: element.attributes[i].name.substring(filter.length),
				value: element.attributes[i].value
			});
		};
		return rt;
	};
	function loadConfig(element) {
		var rt = {};
		var attrs = getAttributes(element, "data-dex-");
		for (var i = 0, j = attrs.length; i < j; i++) {
			rt[attrs[i].name.toLowerCase()] = attrs[i].value;
		};
		return rt;
	}
	this.loadConfig = function (element) {
		return loadConfig(element);
	}
	function loadEvents(element, defaultPrefix) {
		defaultPrefix = defaultPrefix || "data-event-";
		var rt = {};
		var attrs = getAttributes(element, defaultPrefix);
		for (var i = 0, j = attrs.length; i < j; i++) {
			var fn = function () {
				var args = [];
				for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
				return arguments.callee.fn.apply(arguments.callee.obj, args);
			};
			var _fn = null;
			try {
				if (canBeFunctionName(attrs[i].value)) _fn = eval(attrs[i].value);
			} catch (ex) { }
			if (_fn && typeof _fn == 'function') {
				fn.fn = _fn;
			} else {
				try {
					fn.fn = new Function("args", "config", 'return (' + attrs[i].value + ');');
				} catch (e) {
					fn.fn = new Function("args", "config", attrs[i].value);
				}
			}
			fn.obj = element;
			rt[attrs[i].name.toLowerCase()] = fn;
		};
		return rt;
	};
	this.log = function (text) {
		var level = arguments[arguments.length - 1];
		if (arguments.length > 2) {
			level = arguments[arguments.length - 1];
			var args = [];
			for (var i = 1; i < arguments.length; i++)
				args.push(arguments[i]);
			text = stringFormat(text, args);
		}
		if (level == traceLevel.off) return;
		if ((level || 0) > self.trace || !window.console) return;
	}
	function stringFormat(text, args) {
		for (var i = 0; i < args.length; i++)
			text = text.split('{' + i + '}').join(args[i] || ""); //global replace
		return text;
	}
	function canBeFunctionName(name) {
		for (var i = 0; i < name.length; i++) {
			var c = name.charAt(i);
			if (c != '.' && !(c >= 'a' && c <= 'z') && !(c >= 'A' && c <= 'Z') && !(c >= '0' && c <= '9')) return false;
		}
		return true;
	}
	$(document).ready(onReady);
}(jQuery, window, document);
function logout(request, isManual, whereAmI, onSuccess) {
	var request = request || "1";
	var isManual = isManual || "2";
	var whereAmI = whereAmI || "3";
	var onSuccess = onSuccess || "4";
}
function logout(obj) {
	var defaults = {
		request: "1",
		isManual: "2",
		whereAmI: "3",
		onSuccess: "4"
	}
	for (var prop in defaults) {
		if (!obj.hasOwnProperty(prop)) {
			obj[prop] = defaults[prop];
		}
	}
}