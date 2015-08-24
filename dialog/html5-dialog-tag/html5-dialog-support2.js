(function() {
    if (window.HTMLDialogElement) return;

    var ie8 = !-[1, ];
    var constructor = document.createElement('dialog').constructor;

    if (ie8) {

        var appendChild = Element.prototype.appendChild;
        var removeChild = Element.prototype.removeChild;

        Element.prototype.appendChild = function(el) {
            appendChild.call(this, el);

            DOMSubtreeModified();
        }
        Element.prototype.removeChild = function(el) {
            removeChild.call(this, el);

            if (el.tagName.toLowerCase() == "dialog") {
                el.backdrop.parentNode.removeChild(el.backdrop);
                el.backdrop = null;
            }
        }
    }

    constructor.prototype.show = function() {
        this.setAttribute("open", true);
    }
    constructor.prototype.close = function(value) {
        this.removeAttribute("open");
        this.returnValue = value;

        if (document.dispatchEvent) {
            var e = document.createEvent('HTMLEvents');
            e.initEvent('close', true, true);
            e.eventType = 'close';

            this.dispatchEvent(e);
        } else {
            var e = document.createEventObject();

            e.eventType = 'close';
            e.target = this;

            if (this.onclose instanceof Function) {
                this.onclose(e);
            }

        }
    }
    constructor.prototype.showModal = function() {
        this.setAttribute("open", true);

        this.backdrop = document.createElement("dialogbackdrop");

        try {
            this.addEventListener("DOMNodeRemoved", function() {
                this.backdrop.parentNode.removeChild(this.backdrop);
                this.backdrop = null;

                //console.log("DOMNodeRemoved");
            });
        } catch (e) {
            //console.log(e);
        }

        this.parentNode.appendChild(backdrop);
    }


    try {
        document.body.addEventListener("DOMSubtreeModified", DOMSubtreeModified);
    } catch (e) {
        document.body.attachEvent("onpropertychange", DOMSubtreeModified);
    }

    function DOMSubtreeModified(event) {
        initOpen();
        initForms();
    }

    DOMSubtreeModified();

    function initOpen() {
        var dialogList = document.getElementsByTagName("dialog");

        for (var i = 0; i < dialogList.length; i++) {
            var dialogElement = dialogList[i];

            switch (dialogElement.hasAttribute("open")) {
                case true:
                    dialogElement.style.display = "block";

                    try {
                        dialogElement.backdrop.style.display = "block";
                    } catch (e) {
                        //console.log(e);
                    }
                    break;
                default:
                    dialogElement.style.display = "none";

                    try {
                        dialogElement.backdrop.style.display = "none";
                    } catch (e) {
                        //console.log(e);
                    }
                    break;
            }

            if (ie8 && dialogElement.onpropertychange instanceof Function == false) {
                dialogElement.onpropertychange = function() {
                    DOMSubtreeModified();
                }
            }
        }
    }

    function initForms() {
        for (var i = 0; i < document.forms.length; i++) {
            var form = document.forms[i];

            if (form.getAttribute("method") == "dialog") {
                var inputs = form.getElementsByTagName("input");

                for (var s = 0; s < inputs.length; s++) {
                    var input = inputs[s];
                    if (input.type == "submit") {
                        form.onsubmit = function() {
                            return false;
                        }
                        input.onclick = function(ev) {
                            var parent = this.parentNode;

                            while (parent.tagName.toLowerCase() != "dialog" && parent.tagName.toLowerCase() != "body") {
                                parent = parent.parentNode;
                            }
                            try {
                                parent.close(this.value);
                            } catch (e) {}
                        }
                    }
                }
            }
        }
    }

    var style = "dialog {\
        position: absolute;\
        left:0px;right:0px;\
        z-index:1000;\
        width: -webkit-fit-content;\
        height: -webkit-fit-content;\
        width: -moz-fit-content;\
        height: -moz-fit-content;\
        width: fit-content;\
        height: fit-content;\
        margin: auto;\
        border: solid;\
        padding: 1em;\
        background: white;\
        color: black;\
    }\
    dialogbackdrop{\
        display:block;\
        position: fixed;\
        top: 0px;\
        right: 0px;\
        bottom: 0px;\
        left: 0px;\
        background: #000;\
        opacity: 0.5;\
        filter: alpha(opacity=50)\
    }";

    try {
        document.createStyleSheet().cssText = style;
    } catch (e) {
        var styleElement = document.createElement("style");

        document.head.insertBefore(styleElement, document.head.children[0]);
        styleElement.innerHTML = style;
    }
})();