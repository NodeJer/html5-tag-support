(function() {
	if (window.HTMLDetailsElement) return;

	var ie8 = !-[1, ];

	try {
		document.body.addEventListener("DOMSubtreeModified", DOMSubtreeModified);
	} catch (e) {
		document.body.attachEvent("onpropertychange", DOMSubtreeModified);
	}

	try {
		document.body.addEventListener("click", bodyClick);
	} catch (e) {
		document.body.attachEvent("onclick", bodyClick);
	}

	if (ie8) {
		var removeAttribute = Element.prototype.removeAttribute;
		var setAttribute = Element.prototype.setAttribute;

		var appendChild = Element.prototype.appendChild;

		Element.prototype.appendChild = function(el) {
			appendChild.call(this, el);

			if (el.tagName.toLowerCase() == "details") {
				initOpen([el]);
			}
		}

		Element.prototype.removeAttribute = function(name) {
			removeAttribute.call(this, name);

			if (this.tagName.toLowerCase() == "details" && name == "open") {
				this.color = "red";
			}
		}
		/*
		Element.prototype.setAttribute = function(name, value) {
			setAttribute.call(this, name, value);

			if (this.tagName.toLowerCase() == "details" && name == "open") {
				this.color = "red";
			}
		}*/
	}

	initOpen();

	function bodyClick(ev) {
		var ev = ev || window.event;
		var target = ev.srcElement || ev.target;

		if (target.tagName.toLowerCase() == "summary") {
			var parent = target.parentNode;
			var open = parent.hasAttribute("open");

			if (open) {
				parent.removeAttribute("open");
			} else {
				parent.setAttribute("open", true);
			}
		}
	}

	function DOMSubtreeModified(ev) {
		var ev = ev || window.event;

		var target = ev.srcElement || ev.target;

		if (target.tagName.toLowerCase() == "details") {
			initOpen([target]);
		} else {
			initOpen();
		}
	}

	function initOpen(detailsList) {
		var detailsList = detailsList || document.getElementsByTagName("details");

		for (var i = 0; i < detailsList.length; i++) {
			var detail = detailsList[i];
			var children = detail.children;
			var open = detail.hasAttribute("open");
			var display = open ? "block" : "none";

			for (var j = 0; j < children.length; j++) {
				var element = children[j];

				if (element.tagName.toLowerCase() == "summary") {
					if(ie8)element.className = element.className;

					continue;
				} else {
					element.style.display = display;
				}
			}

			if (ie8 && detail.onpropertychange instanceof Function == false) {
				detail.onpropertychange = function(ev) {
					DOMSubtreeModified(ev || window.event);
				}
			}
		}
	}
	var style = "details,summary{\
		display:block; position:relative\
	}\
	summary:before{\
		position: absolute; top:50%; left:-16px; margin-top:-5px;\
		content: '';border-width: 5px 8px; border-style:solid; border-color:transparent; border-left-color: black\
	}\
	details[open] >summary:before{\
		border-width: 8px 5px!important; border-left-color:transparent!important; border-top-color: black!important;\
	}";

	try {
		document.createStyleSheet().cssText = style;
	} catch (e) {
		var styleElement = document.createElement("style");

		document.head.insertBefore(styleElement, document.head.children[0]);

		styleElement.innerHTML = style;
	}
})();