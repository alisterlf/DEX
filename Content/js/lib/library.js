SystemLambdas = [];
String._Formats = [];
String.Space = ' ';

String.prototype.Trim = function(b, a) {
	return this.TrimEnd(b, a).TrimStart(b, a);
};

String.prototype.TrimStart = function(b, c) {
	b = b || String.Space;
	var a = this;
	if (!c && b.length > 1) {
		while (b.indexOf(a.substring(0, 1)) >= 0) {
			a = a.substring(1, a.length);
		}
	} else {
		while (a.substring(0, b.length) == b) {
			a = a.substring(b.length, a.length);
		}
	}
	return a;
};

String.prototype.Replace = function(a, b) {
	a = new RegExp(a, "g");
	var c = this.replace(a, b);
	return c;
};

String.Format = function() {
	var e = "\"";
	if (!arguments.length) {
		return "";
	}
	var g = arguments;
	if (arguments.length == 1 && arguments[0].length) {
		g = arguments[0];
	}
	var a = g[0];
	if (String._Formats[a]) {
		return String._Formats[a](g);
	}
	a = a.Replace("\n", "\\n").Replace("\r", "\\r");
	for (var i = a.length - 1, d = 0, c = [], b = 0; b < a.length; b++) {
		if (a.charAt(b) == "{" && b < i && a.charAt(b + 1) != "{") {
			c.push((c.length ? "+\"" : e) + a.substring(d, b).Replace(e, "\\\"") + e);
			d = b;
			while (a.charAt(d) != "}") {
				d++;
			}
			var f = a.substring(b + 1, d).split(":");
			if (f.length == 1) {
				c.push("+args[" + (parseInt(f[0]) + 1) + "]");
			} else {
				c.push("+args[" + (parseInt(f[0]) + 1) + "].ToString(\"" + f[1] + "\")");
			}
			d++;
		}
	}
	c.push((c.length ? "+\"" : e) + a.substring(d, a.length).Replace(e, "\\\"") + e);
	var h = "return " + c.join("") + ";";
	String._Formats[a] = new Function("args", h);
	return String._Formats[a](g);
};

String.prototype.TrimEnd = function(b, c) {
	b = b || String.Space;
	var a = this;
	if (!c && b.length > 1) {
		while (b.indexOf(a.substring(a.length - 1, a.length)) >= 0) {
			a = a.substring(0, a.length - 1);
		}
	} else {
		while (a.substring(a.length - b.length, a.length) == b) {
			a = a.substring(0, a.length - b.length);
		}
	}
	return a;
};

Array.Create = function(arr) {
	var rt = [];
	for (var i = 0; i < arr.length; i++)
		rt[i] = arr[i];
	return rt;
};

Array.prototype.RemoveAt = function(c) {
	var a = this;
	if (c >= a.length || c < 0) {
		return;
	}
	for (var b = c; b < a.length; b++) {
		a[b] = a[b + 1];
	}
	a.length = a.length - 1;
};

Array.prototype.Where = function(b) {
	b = $L.apply(null, arguments);
	for (var c = [], a = 0; a < this.length; a++) {
		b(this[a]) && c.push(this[a]);
	}
	return c;
};

Array.prototype.First = function(b) {
	b = $L.apply(null, arguments);
	for (var c = [], a = 0; a < this.length; a++) {
		b(this[a]) && c.push(this[a]);
	}
	if (c.length >= 1)
		return c[0];
	return null;
};

Array.prototype.GetPage = function(page, itemsPerPage) {
	var temp = [];
	for (var i = ((page * itemsPerPage) - itemsPerPage); i < (page * itemsPerPage); i++)
		temp.push(this[i]);
	return temp;
};

Function.prototype.GetName = function() {
	var a = this;
	if (a.name) {
		return a.name;
	}
	var c = a.toString();
	if (c == "[function]") {
		var b = a;
		if (b == String) {
			a.name = "String";
		} else if (b == Number) {
			a.name = "Number";
		} else if (b == Function) {
			a.name = "Function";
		} else if (b == Date) {
			a.name = "Date";
		} else if (b == Error) {
			a.name = "Error";
		} else if (b == Boolean) {
			a.name = "Boolean";
		} else if (b == Array) {
			a.name = "Array";
		} else {
			a.name = "Object";
		}
		return a.name;
	}
	for (var d = c.indexOf("function") + 9; c.charAt(d) == " "; ) {
		d++;
	}
	var e = d;
	while (c.charAt(e) != " " && c.charAt(e) != "(") {
		e++;
	}
	a.name = c.substring(d, e);
	return a.name;
};
function $GetType(a) {
	if ( a instanceof Function) {
		return "Function";
	}
	if (a !== null && a !== undefined && a.constructor && a.constructor.GetName) {
		return a.constructor.GetName();
	}
	return null;
}

function $L(a) {
	if (!a) {
		return new Function("return true;");
	}
	if ($GetType(a) != "String") {
		return a;
	}
	if (a.indexOf("=>") < 0) {
		return new Function(a);
	}
	if (arguments.length == 1 && SystemLambdas[a]) {
		return SystemLambdas[a];
	}
	var d = a.split("=>"), f = d[0].Trim().TrimStart("(").TrimEnd(")").Trim();
	d.RemoveAt(0);
	d = d.join("=>");
	var e = String.Format("return {0};", d);
	if (arguments.length > 1) {
		var b = 1;
		for ( b = 1, l = arguments.length; b < l; b++) {
			e = "var p" + b + " = arguments.callee.p" + b + ";\r\n" + e;
		}
		var c = new Function(f, e);
		window.LastL = c;
		for ( b = 1, l = arguments.length; b < l; b++) {
			c["p" + b] = arguments[b];
		}
		return function() {
			return c.apply(c.p1, arguments);
		};
	}
	var c = new Function(f, e);
	SystemLambdas[a] = c;
	return c;
}

String.prototype.removeAccents = function() {
	var strAccents = this.split('');
	var strAccentsOut = [];
	var strAccentsLen = strAccents.length;
	var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
	var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
	for (var y = 0; y < strAccentsLen; y++) {
		if (accents.indexOf(strAccents[y]) != -1) {
			strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
		} else
			strAccentsOut[y] = strAccents[y];
	}
	strAccentsOut = strAccentsOut.join('');
	return strAccentsOut;
};
function queryString(Key) {
	return unescape(window.location.href.replace(new RegExp("^(?:.*[&\\?]" + escape(Key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

// Avoid `console` errors in browsers that lack a console.
if (!(window.console && console.log)) {( function() {
			var noop = function() {
			};
			var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
			var length = methods.length;
			var console = window.console = {};
			while (length--) {
				console[methods[length]] = noop;
			}
		}());
}