window.dex = (function($, window, document, undefined) {
	$(document).ready(onReady);
	var self = this;
	var traceLevel = {
		off : -1,
		error : 0,
		warning : 1,
		info : 2,
		verbose : 3
	};
	this.traceLevel = traceLevel;
	this.trace = traceLevel.verbose;
	this.componentsUrl = '/Content/js/dex';
	this.load = function(container) {
		var $components = $('.dex', container);
		$components.each(function(index, element) {
			loadComponent(element);
		});
	};
	this.loadConfig = function(element) {
		return loadConfig(element);
	};
	this.log = function(text) {
		var level = arguments[arguments.length - 1];
		if (arguments.length > 2) {
			level = arguments[arguments.length - 1];
			var args = [];
			for (var i = 1; i < arguments.length; i++)
				args.push(arguments[i]);
			text = stringFormat(text, args);
		}
		if (level == traceLevel.off)
			return;
		if ((level || 0) > self.trace || !window.console)
			return;
		console.log(text);
	};

	function onReady() {
		self.load(document.body);
	}

	function loadComponent(element) {
		var $element = $(element);
		var component = $element.data('dex');
		if (!component) {
			self.log('Component property is empty on element "{0}".', element.id, traceLevel.warning);
			return;
		}
		if ($element.data('dex-loaded') === true) {
			self.log('Component already loaded on element {0}({1}).', element.tagName, element.id || 'NULL', traceLevel.verbose);
			return;
		}
		if (!self[component])
			return loadComponentCode(component, element);
		self.log('Setting up component "{0}" on element {2}({1})".', component, element.id || 'NULL', element.tagName, traceLevel.info);
		var config = loadConfig(element);
		var events = loadEvents(element);
		self[component].load(element, config, events);
		if (!self[component].requiresAsyncLoad) {
			if (events.onload)
				events.onload.call(element, null, config);
			delete events.onload;
		}
		$element.data('dex-loaded', true);
	}

	function loadComponentCode(component, element) {
		var loaders = {};
		if (loaders[component]) {
			if (!loaders[component].hasError)
				loaders[component].push(element);
			return;
		}
		var url = self.componentsUrl + '/' + component + '.js';
		self.log('Loading code from "{0}" for component "{1}".', url, component, traceLevel.info);
		loaders[component] = [];
		var elements = loaders[component];
		elements.push(element);
		loadScript(url, component, function() {
			self.log('Loaded component code "{0}".', component, traceLevel.verbose);
			if (!self[component])
				self.log('Error initializing component "{0}".', component, traceLevel.error);
			else
				while (elements.length)loadComponent(elements.pop(), true);
		}, function(error) {
			self.log('Error loading component code "{0}" ({1}).', component, error, 0);
		});
	}

	function loadScript(url, component, callback, errorCallback) {
		//Not using $.getScript because code with SyntaxError will get harder to debug
		var el = document.createElement('script');
		el.src = url;
		if (navigator.userAgent.match(/MSIE 7.0/) || navigator.userAgent.match(/MSIE 8.0/))//IE8- don't support onload.
			el.onreadystatechange = function(e) {
				if (this.readyState == 'loaded' || this.readyState == 'complete')
					callback();
			};
		else
			el.onload = callback;
		el.onerror = errorCallback;
		document.body.appendChild(el);
	}

	function getAttributes(element, filter) {
		var rt = [];
		filter = filter || "";
		for (var i = 0, j = element.attributes.length; i < j; i++) {
			if (element.attributes[i].name.indexOf('data') !== 0)
				continue;
			if (element.attributes[i].name.indexOf(filter) === 0)
				rt.push({
					name : element.attributes[i].name.substring(filter.length),
					value : element.attributes[i].value
				});
		}
		return rt;
	}

	function loadConfig(element) {
		var rt = {};
		var attrs = getAttributes(element, "data-dex-");
		for (var i = 0, j = attrs.length; i < j; i++) {
			rt[attrs[i].name.toLowerCase()] = attrs[i].value;
		}
		return rt;
	}

	function loadEvents(element, defaultPrefix) {
		defaultPrefix = defaultPrefix || "data-event-";
		var rt = {};
		var attrs = getAttributes(element, defaultPrefix);
		for (var i = 0, j = attrs.length; i < j; i++) {
			var eventName = attrs[i].name;
			var jsCode = attrs[i].value;
			var targetFunc = getFunctionFromAttr(jsCode);
			var proxy = function() {
				var arr = Array.prototype.slice.call(arguments);
				try {
					return arguments.callee.targetFunction.apply(arguments.callee.obj, arr);
				} catch (ex) {
					var debug = arguments.callee.debug;
					self.log('Proxy error on event:"{0}" code:"{1}"', debug.eventName, debug.jsCode, traceLevel.error);
					self.log(arr, traceLevel.error);
					throw ex;
				}
			};
			proxy.debug = {
				eventName : eventName,
				jsCode : jsCode
			};
			proxy.targetFunction = targetFunc;
			proxy.obj = element;
			rt[attrs[i].name.toLowerCase()] = proxy;
		}
		rt.tryCall = function(eventName) {
			if (!rt[eventName])
				return;
			var arr = [];
			for (var i = 1; i < arguments.length; i++)
				arr.push(arguments[i]);
			return rt[eventName].apply(element, arr);
		};
		return rt;
	}

	function stringFormat(text, args) {
		for (var i = 0; i < args.length; i++)
			text = text.split('{' + i + '}').join(args[i] || "");
		//global replace
		return text;
	}

	function getFunctionFromAttr(jsCode) {
		console.log("jsCode = " + jsCode);
		var isFunction = true;
		var targetFunc;
		for (var i = 0; i < jsCode.length; i++) {
			var c = jsCode.charAt(i);
			if (c != '.' && !(c >= 'a' && c <= 'z') && !(c >= 'A' && c <= 'Z') && !(c >= '0' && c <= '9'))
				isFunction = false;
		}
		if (isFunction) {
			try {
				var func = eval(jsCode);
				if (func && typeof func == 'function')
					targetFunc = func;
			} catch (ex) {
			}
		} else {
			if (!targetFunc) {
				try {
					targetFunc = new Function("args", "config", 'return (' + jsCode + ');');
				} catch (e) {
					targetFunc = new Function("args", "config", jsCode);
				}
			}
		}
		return targetFunc;
	}

	return this;
})(jQuery, window, document);
