var Main = {
	init : function() {

	},
	testeFunc : {
		nivelUmFunc : function() {
			console.log("nivelUm");
		},
		nivelDois: {
			nivelDoisFunc : function(a) {
				console.log(a);
			}
		}

	}
};
$(function() {
	Main.init();
});
function nivelZeroFunc () {
	console.log("nivel zero");
}