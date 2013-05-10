behaviors = function(context) {
	var elements;
	var elLen = 0;
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
	this.behaviorsFilesUrl = '/Content/js/behaviors';

	if (context === undefined) {
		context = document.body;
	}
	if (context.querySelectorAll !== undefined) {
		elements = context.querySelectorAll("[data-behavior]");
	} else {
		elements = getElementsByAttribute("[data-behavior]", context);
	}
	elLen = elements.length;
	while (elLen--) {
		if(elements[elLen].getAttribute("data-behavior-loaded") !== "true"){
			loadBehavior(elements[elLen]);
		}
	}

	function loadBehavior(element) {
		var behaviorNames = element.getAttribute("data-behavior").split(" ");
		var j = behaviorNames.length;
		while (j--) {
			var behaviorName = behaviorNames[j];
			try {
				var behaviorClass = behaviorNames[behaviorName];
				var config = loadConfig(element);
				var events = loadEvents(element);
				var initializedbehavior = new behaviorClass(element, config, events);
				element.setAttribute("data-behavior-loaded", true);
			} catch(e) {
				// No Operation
			}
		}
	}

	function getElementsByAttribute(attr, context) {
		var elements, match = [];
		if (context === undefined) {
			context = document.body;
		}
		elements = context.getElementsByTagName("*");
		for (var i = 0, ln = elements.length; i < ln; i++) {
			if (elements[i].hasAttribute(attr))
				match.push(elements[i]);
		}
		return match;
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
		defaultPrefix = defaultPrefix || "data-events-";
		var rt = {};
		var attrs = getAttributes(element, defaultPrefix);
		for (var i = 0, j = attrs.length; i < j; i++) {
			rt[attrs[i].name] = makeFunction(element, attrs[i].value);
		}
		return rt;
	}

	function makeFunction(element, value) {
		return function() {
			fn = new Function(attrs[i].value);
			fn.apply(element);
		};
	}


	this.addLoadEvent = function(func) {
		var oldonload = window.onload;
		if ( typeof window.onload != 'function') {
			window.onload = func;
		} else {
			window.onload = function() {
				oldonload();
				func();
			};
		}
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
};
if (jQuery) {
	$(function() {
		behaviors.loadbehavior();
	});
} else {
	behaviors.addLoadEvent(function() {
		behaviors.loadbehavior();
	});
}
