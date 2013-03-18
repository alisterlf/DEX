dex.institutionalPages = {
    load: function (element, config, events) {
        this.bind(element);
    },
    bind: function (element) {
        var $button = $(element).find("button");
        $button.click(function () {
            if ($(this).data("page"))
                dex.institutionalPages.loadPage($(this).data("page"))
            else if ($(this).hasClass('closeButton')) {
                //ações botão cancel
                Main.cancel();
            }
        });
    },
    loadPage: function (pageName) {
        var url = "", id = "";
        switch (pageName) {
            case "Regulamento":
                url = '/Home/Regulamento';
                id = 'Regulamento';
                _gaq.push(['_trackPageview', '/999-motivos/regulamento']);
                break;
            case "ComoFunciona":
                url = '/Home/ComoFunciona';
                id = 'ComoFunciona';
                _gaq.push(['_trackPageview', '/999-motivos/como-funciona']);
                break;
            case "Vantagens":
                url = '/Home/Vantagens';
                id = 'Vantagens';
                _gaq.push(['_trackPageview', '/999-motivos/vantagens']);
                break;
            default:
                this.showPage($("#" + pageName));
                return;
                break;
        }
        $.ajax({
            url: url,
            success: function (html) {                
                var $page = $('#' + id);
                $page.html(html);
                dex.institutionalPages.showPage($page);
                $page.find(".close").click(function () {
                	dex.institutionalPages.hidePage(this);
                });
                $("#main").removeAttr("class").addClass("page-" + pageName.toLowerCase());
            }
        });
    },
    showPage: function (page) {
        $page = $(page);
        $siblings = $page.siblings();
        $activePage = $siblings.filter(":visible");
        var backPage = "";
        if ($activePage.find(".close").size() > 0) {
            backPage = $activePage.find(".close").data("back-page");
        } else {
            backPage = $activePage.attr("id");
        }
        $page.find(".close").data("back-page", backPage);
        $siblings.hide();
        $page.show();
        FB.Canvas.setSize({ height: $("#main").height() });
        dex.load($page);
        $(".cliqueAgora").click(function () {
        	var $page = $('#' + "motivos");
        	dex.institutionalPages.showPage($page);
        });
    },
    hidePage: function (elem) {
        var page = $(elem).data("back-page");
        this.loadPage(page);
    }
}