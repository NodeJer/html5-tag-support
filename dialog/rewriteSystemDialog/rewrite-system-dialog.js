(function() {
	window.systemAlert = window.alert;
	window.systemConfirm = window.confirm;

	window.alert = function(title, message, callback) {
		createDialog(title, message, callback, ["确认"]);
	}
	window.confirm = function(title, message, callback) {
		createDialog(title, message, callback, ["确认", "取消"]);
	}

	function createDialog(title, message, callback, lables) {
		var dialog = new AlertDialog(document.body);

		if (callback instanceof Function) {
			var close = function() {
				callback && callback(this.returnValue);
			}
			if (document.addEventListener) {
				dialog.getWindow().addEventListener("close", close);
			}
			//ie8 
			else {
				dialog.getWindow().onclose = close;
			}
		}

		dialog.setTitle(title);
		dialog.setMessage(message);

		for (var i = 0; lables && i < lables.length; i++) {
			dialog.setButton(lables[i], "click", function(ev, value) {
				dialog.closeWindow(value == "确认" ? true : false);
				dialog.getContext().removeChild(dialog.getWindow());

				dialog = null;
			}, 100 / lables.length + "%");
		}

		dialog.showWindow();

		dialog.toHorizontalCenter();
		dialog.toVerticalCenter();
	}
})();