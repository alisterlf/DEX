dex.calendar = {
	events : null,
	options : {
		closeText : 'Fechar',
		prevText : '&#x3C;Anterior',
		nextText : 'Próximo&#x3E;',
		currentText : 'Hoje',
		monthNames : ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
		monthNamesShort : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
		dayNames : ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
		dayNamesShort : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
		dayNamesMin : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
		weekHeader : 'Sm',
		dateFormat : 'dd/mm/yy',
		firstDay : 0,
		isRTL : false,
		showMonthAfterYear : false,
		yearSuffix : ''
	},
	load : function(element, config, events) {
		var temp = element.value;
		$(element).datepicker({
			dateFormat : 'dd/mm/yyyy',
			showOn : 'focus',
			onSelect : function(date, instance) {
				this.select(date, config, instance);
				events.tryCall('onchange', date, config);
			},
			beforeShowDay : function(date) {
				if (events.tryCall('validateday', date) === false)
					return [false];
				return [1];
			}
		}).datepicker('option', this.options);
		element.value = temp;
	},
	display : function(format, date) {
		var today = {
			"yy" : date.selectedYear,
			"mm" : date.selectedMonth + 1,
			"dd" : date.selectedDay
		};
		format = format.split("/");
		return today[format[0]] + "/" + today[format[1]] + "/" + today[format[2]];
	},
	select : function(date, config, instance) {
		instance.input.val(this.display.call(this, this.options.dateFormat, instance));
	},
	format : function(date) {
		if (!date)
			return;
		if ( typeof date[0] !== "string")
			return date;
		$.each(date, function(i, day) {
			date[i] = day.split("/");
			date[i] = new Date(date[i][2], ~~date[i][1] - 1, date[i][0]);
		});
		return date;
	}
};