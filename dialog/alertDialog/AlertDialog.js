(function() {
	function AlertDialog(context, theme) {
		this.context = context;
		this.theme = theme || "";

		this.onCreate();
	}

	AlertDialog.prototype = {
		onCreate: function() {
			this.dialog = document.createElement("dialog");
			this.getContext().appendChild(this.dialog)

			var div = document.createElement("div");

			div.className = "alertDialog "+this.theme;

			this.setContentView(div);
		},
		addContentView: function(view) {
			if (view instanceof Element) {
				this.getWindow().appendChild(view);
			} else {
				this.getWindow().innerHTML += view;
			}
		},
		setContentView: function(view) {
			this.getWindow().innerHTML = "";

			this.addContentView(view);
		},
		getWindow: function() {
			return this.dialog;
		},
		getContext: function() {
			return this.context;
		},
		addView: function(view, childWindow) {
			if(view == null)return;

			var win = childWindow || this.getWindow().firstChild;

			if (view instanceof Element) {
				win.appendChild(view);
			} else {
				win.innerHTML += view;
			}
		},
		setTitle: function(title) {
			if(title == "" || title == null)return;

			var titleBar = findByClass(this.getWindow().firstChild, "titleBar");
			var text = document.createElement("div");

			text.className = "titleText";
			text.innerHTML = title;

			if (!titleBar) {
				titleBar = document.createElement("div");
				titleBar.className = "titleBar";
				this.addView(titleBar);
			}

			titleBar.appendChild(text);
		},
		setIcon: function(src) {
			if(src == "" || src == null)return;

			var img = document.createElement("img");
			img.className = "titleIcon";
			img.src = src;

			var titleBar = findByClass(this.getWindow().firstChild, "titleBar");
			var text = findByClass(titleBar, "titleText");

			if (!titleBar) {
				titleBar = document.createElement("div");
				titleBar.className = "titleBar";

				this.addView(titleBar);
			}

			if (text) {
				titleBar.insertBefore(img, text);
			} else {
				titleBar.appendChild(img);
			}
		},
		setMessage: function(message) {
			if(message == "" || message == null)return;

			var content = findByClass(this.getWindow().firstChild, "content");

			if (!content) {
				content = document.createElement("div");
				content.className = "content";

				this.addView(content);
			}

			content.innerHTML = message;
		},
		setButton: function(text, type, listener, width, height) {
			var actionBar = findByClass(this.getWindow().firstChild, "actionBar");
			var button = document.createElement("div");

			button.className = "button";
			button.innerHTML = text;
			if(listener instanceof Function){
				if (button.addEventListener) {
					button.addEventListener(type, function(ev) {
						ev.stopPropagation();
						
						listener.call(button, ev, button.innerHTML);
					}, false);
				} else {
					button.attachEvent("on" + type, function(ev) {
						listener.call(button, ev, button.innerHTML);
					});
				}
			}
			if (!actionBar) {
				actionBar = document.createElement("div");
				actionBar.className = "actionBar";

				this.addView(actionBar);
			}
			if(parseInt(width) > 0){
				button.style.width = width;
			}
			if(parseInt(height) > 0){
				button.style.height = height;
			}
			actionBar.appendChild(button);
		},
		setView: function(view) {
			var content = findByClass(this.getWindow().firstChild, "content");

			if (!content) {
				content = document.createElement("div");
				content.className = "content";

				this.addView(content);
			}

			content.innerHTML = "";

			this.addView(view, content);
		},
		showWindow: function() {
			var dialogElement = this.getWindow();

			dialogElement.showModal();
		},
		closeWindow: function(value) {
			this.getWindow().close(value);
		},
		toHorizontalCenter: function() {
			var context = this.getContext();
			var dialogElement = this.getWindow();

			dialogElement.style.position = "fixed";
			dialogElement.style.right = "auto";

			if (("transform" in context.style) == false) {
				dialogElement.style.left = (document.documentElement.clientWidth - dialogElement.offsetWidth) / 2 + "px";
			} else {
				dialogElement.style.left = "50%";
				dialogElement.style.webKitTransform += " translateX(-50%)";
				dialogElement.style.transform += " translateX(-50%)";
			}

		},
		toVerticalCenter: function(position) {
			var context = this.getContext();
			var dialogElement = this.getWindow();

			dialogElement.style.position = "fixed";

			if (("transform" in context.style) == false) {
				dialogElement.style.top = (document.documentElement.clientHeight - dialogElement.offsetHeight) / 2 + "px";
			} else {
				dialogElement.style.top = "50%";
				dialogElement.style.webKitTransform += " translateY(-50%)";
				dialogElement.style.transform += " translateY(-50%)";
			}
		}
	}

	function findByClass(element, className) {
		if (!element) return null;
		var children = element.children;

		for (var i = 0; i < children.length; i++) {
			if (children[i].className.search(className) != -1) {
				return children[i];
				break;
			}
		}

		return null;
	};

	window.AlertDialog = AlertDialog;
})();