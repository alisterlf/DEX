var Main = {
	totalPaginas: 0,
	itensPagina: 0,
	pagina: 0,
	seed: 0,
	paginasMotivos: [],
	init: function () {
		this.totalPaginas = window.motivoTotalPaginas;
		this.itensPagina = window.motivoItensPagina;
		this.pagina = window.motivoPagina;
		this.seed = window.motivoSeed;
		this.paginasMotivos.push(window.listaMotivos);
		Main.bindClick();
		Main.loadImages();
	},
	showMessage: function (title, msg, type) {
		var title = title || "";
		var text = msg || "";
		var type = type || "alert";
		var msg = {
			title: title,
			text: text,
			type: type
		}
		var html = '<div id="msgDiv"><div id="fade"></div><div id="msgModal"><img src="/Content/img/bg/' + msg.type + '.png" alt="" /><div class="title">' + msg.title + '</div><div class="msg">' + msg.text + '</div></div></div>';
		$("#main").append(html);
		setTimeout(function () {
			$("#msgDiv").remove();
		}, 3000);
	},
	facebookScript: function () {
		window.fbAsyncInit = function () {
			FB.init({
				appId: window.appId, // App ID
				status: true, // check login status
				cookie: true, // enable cookies to allow the server to access the session
				xfbml: true  // parse XFBML
			});
			FB.Canvas.setAutoGrow(1000);
			FB.Canvas.scrollTo(0, 0);
			Main.init();
		};
		// Load the SDK Asynchronously
		(function (d) {
			var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
			if (d.getElementById(id)) { return; }
			js = d.createElement('script'); js.id = id; js.async = true;
			js.src = "//connect.facebook.net/en_US/all.js";
			ref.parentNode.insertBefore(js, ref);
		}(document));

	},
	bindClick: function () {
		var width;
		var leftPosition;
		$('.friendsSlider span').click(function () {
			var sliderWidth = $(".friendsList  ul").width();
			stopPosition = sliderWidth - 588 * 2;
		});

		$('.friendsSlider span.left').click(function () {
			offset = $(".friendsList ul").offset();
			leftPosition = offset.left;
			if (leftPosition !== 111) {
				$(".friendsList ul").animate({ marginLeft: '+=588px' }, 500);
			}
		});

		$('.friendsSlider span.right').click(function () {
			offset = $(".friendsList ul").offset();

			if (-offset.left < stopPosition) {
				$(".friendsList ul").animate({ marginLeft: '-=588px' }, 500);
			}
		});
		$(".reload").click(function () {
			Main.proximaPagina();
		});
		$('#search').keyup(function () {
			if ($('#search').val() === '') {
				$('.friendsSlider ').fadeIn();
			} else {
				$('.friendsSlider ').fadeOut();
			}
			Main.searchFriend(this);
		});
	},
	loadImages: function () {
		if (this.pagina > this.totalPaginas)
			this.pagina = 1;

		$('#divImagens').empty();
		var motivos;
		if (Main.paginasMotivos[this.pagina - 1] === undefined) {
			$.ajax({
				type: "POST",
				url: "/Home/Motivos",
				data: {
					seed: Main.seed,
					pagina: Main.pagina
				},
				dataType: "json",
				success: function (response) {
					Main.paginasMotivos.push(response.Items)
					Main.loadImages();
				}
			});
			return false
		} else {
			motivos = this.paginasMotivos[this.pagina - 1];
		}
		window.listaMotivos = motivos;

		var north = "top center",
			south = "bottom center",
			east = "right center",
			west = "left center",
			northeast = "top right",
			northwest = "top left",
			southeast = "bottom right",
			southwest = "bottom left",
			center = "top left center";

		var cfg = [
			{ css: northwest },
			[{ css: north }, { css: center }],
			{ css: north },
			[{ css: northeast }, { css: east }],
			[{ css: west }, { css: west }],
			{ css: center },
			[{ css: center }, { css: center }],
			{ css: east },
			[{ css: west }, { css: west }],
			[{ css: center }, { css: center }],
			{ css: center },
			[{ css: center }, { css: center }],
			[{ css: east }, { css: east }],
			{ css: southwest },
			[{ css: center }, { css: south }],
			{ css: south },
			[{ css: east }, { css: southeast }]
		];

		var idx = 0;
		for (var i = 0; i < cfg.length; i++) {
			if (cfg[i].length) {
				cfg[i][0].obj = motivos[idx++];
				cfg[i][1].obj = motivos[idx++];
			}
			else
				cfg[i].obj = motivos[idx++];
		}

		$("#galleryTemplate").tmpl(cfg).appendTo("#divImagens");
		$("#divImagens .img").click(function () {
			var id = $(this).data("id");
			Main.participar(id)
		})
	},
	proximaPagina: function () {
		FB.Canvas.scrollTo(0, 0);
		Main.pagina++;
		Main.loadImages();
		_gaq.push(['_trackPageview', '/999-motivos/ver-mais-motivos']);
	},
	participar: function (motivoID) {
		if (window.listaAmigos == null) {
			$.ajax({
				type: "POST",
				url: "/Home/Amigos",
				data: {
					signed_request: window.signedRequest
				},
				dataType: "json",
				success: function (response) {
					window.listaAmigos = response;
					Main.participar(motivoID);
				}
			});
			return false;
		}

		FB.Canvas.scrollTo(0, 0);
		$('#motivos').hide();
		$('#participacao').show();
		$('.motivoID').val(motivoID);
		var motivo = window.listaMotivos.First("i => i.ID == p1", motivoID);
		$("#headerTemplate").tmpl({ "Motivo": motivo }).appendTo("#participacao > header");
		if (!$(".friendsList .container ul li").size() > 0) {
			$("#friendTemplate").tmpl(window.listaAmigos).appendTo(".friendsList .container ul");
			Main.friendsList();
		}
		_gaq.push(['_trackPageview', '/999-motivos/motivo-' + motivo.NumeroExibicao]);
	},
	cancel: function () {
		$('#participacao').hide();
		$('#motivos').show();
		$('#participacao > header').empty();

		//track voltando para home
		_gaq.push(['_trackPageview', '/999-motivos/inicio/pos-curtir']);
	},
	friendsList: function () {
		FB.Canvas.setSize({ height: $("#main").height() });
		$(".friendsList button").click(function () {
			Main.selectFriend(this);
		});
		$(".cancel, #participacao .close").click(function () {
			Main.cancel();
		});
		$(".send").click(function () {
			//Validação de mensagem
			if ($('#mensagem').val() == '') {
				Main.showMessage('Por favor', "Preencha a mensagem", "alert");
				FB.Canvas.scrollTo(0, 0);
				$('#mensagem').focus();
				return;
			}

			//Validação de amigo
			if ($('#friendID').val() == '') {
				Main.showMessage('Por favor', "Selecione o amigo", "alert");
				FB.Canvas.scrollTo(0, 0);
				$('#search').focus();
				return;
			}

			$(".send")[0].disabled = "disabled"; //desabilita o botão enviar, quando está enviado
			$('form').submit();
		});
		var count = $(".friendsList li").size();
		count = (count % 2 == 0) ? count : count + 1;
		$(".friendsList ul").css("width", (count * 84 / 2) + "px");
	},
	selectFriend: function (elem) {
		if ($(elem).hasClass("selected")) {
			$(elem).removeClass("selected");
			return
		}
		$(elem).addClass("selected").parent().siblings().children("button").removeClass("selected");
		$("#friendID").val($(elem).data("id"));
	},
	RemoveAccents: function (strAccents) {
		var strAccents = strAccents.split('');
		var strAccentsOut = new Array();
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
	},
	searchFriend: function (elem) {
		$(".friendsList ul").css("margin-left", "0px"); //Volta para primeira página

		var txt = Main.RemoveAccents($(elem).val());
		var elements = Array.Create($('.friendsList li'));

		var text = $('#search').val().toLowerCase().trim();
		for (var i = 0; i < elements.length; i++)
			elements[i].style.display = (txt == '' || Main.RemoveAccents($(elements[i]).data('name')).toLowerCase().indexOf(text) >= 0 ? 'block' : 'none');

		var count = $('.friendsList li:visible').size();
		if (count > 14) {
			count = (count % 2 == 0) ? count : count + 1;
		} else {
			count = 14;
		}
		$(".friendsList ul").css("width", (count * 84 / 2) + "px");
	}
}
$(function () {
	Main.facebookScript();
});