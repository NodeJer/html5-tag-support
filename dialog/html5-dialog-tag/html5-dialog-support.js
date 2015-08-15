(function(){
    /**
     * 重写了addEventListener方法 同时也让ie得到支持
     * 支持自定义事件
     */
    var ie8 = !-[1, ];
    var addEventListener = Element.prototype.addEventListener;
    var attachEvent = Element.prototype.attachEvent;
    var documentClass = document.constructor;

    Element.prototype.addEventListener = documentClass.prototype.addEventListener = function(type, listenner) {
        var self = this;
        var splitName = type.split(" ");

        if(splitName.length > 0){
        	for(var i=0; i<splitName.length; i++){
        		var eventName = splitName[i];

        		if (addEventListener) {
		            addEventListener.call(this, eventName, listenner, false);
		        } else {
		            if ("on" + eventName in this) {
		            	attachEvent.call(this, "on" + eventName, listenner);
			        }else{
			        	if(!this.$$watchList){
			        		this.$$watchList = [];
			        	}
			        	
			        	this.$$watchList.push({type: eventName, listenner: listenner});
		            }
		        }
        	}
        }
    }
    var removeEventListener = Element.prototype.removeEventListener;
    var detachEvent = Element.prototype.detachEvent;

    Element.prototype.removeEventListener = documentClass.prototype.removeEventListener = function(type, listenner) {

		if (removeEventListener) {
		    removeEventListener.call(this, type, listenner);
		} else {
			if ("on" + type in this) {
				detachEvent.call(this, "on" + type, listenner);
	        } else {
	        	var res = [];

	        	for(var i=0; i<this.$$watchList.length; i++){
	        		var watch = this.$$watchList[i];

	        		if(watch.type == type && watch.listenner == listenner){
	        			res.push(i);
	        		}
	        	}

	        	for(var i=0; i<res.length; i++){
	        		this.$$watchList.splice(i, 1);
	        	}
	        }
		    
		}
    }

    var dispatchEvent = Element.prototype.dispatchEvent;
    var fireEvent = Element.prototype.fireEvent;

    Element.prototype.dispatchEvent = documentClass.prototype.dispatchEvent = function(type) {
		if (dispatchEvent) {
			var e = document.createEvent('HTMLEvents');
				e.initEvent(type, true, true);
				e.eventType = type;

		    dispatchEvent.call(this, e);
		} else {
			var e = document.createEventObject();

			e.eventType = type;
			e.target = this;

			try{
				this.fireEvent("on" + type, e);
			}catch(ce){
				for(var i=0; i<this.$$watchList.length; i++){
	        		var watch = this.$$watchList[i];

	        		if(watch.type == type && watch.listenner instanceof Function){
	        			watch.listenner.call(this, e);
	        		}
	        	}
			}
		    
		}
    }
})();

(function() {
	var ie8 = !-[1, ];

	var constructor = document.createElement('dialog').constructor;

    var setAttribute = constructor.prototype.setAttribute;
    var removeAttribute = constructor.prototype.removeAttribute;
    var appendChild = Element.prototype.appendChild;
    var documentClass = document.constructor;

    constructor.prototype.setAttribute = function(){
    	setAttribute.apply(this, arguments);

    	if(ie8)document.body.dispatchEvent("DOMSubtreeModified");
    }
    constructor.prototype.removeAttribute = function(){
    	removeAttribute.apply(this, arguments);

    	if(ie8)document.body.dispatchEvent("DOMSubtreeModified");
    }
    Element.prototype.appendChild = documentClass.prototype.appendChild = function(){
    	appendChild.apply(this, arguments);

    	if(ie8)document.body.dispatchEvent("DOMSubtreeModified");
    }

    /**
     *  给dialog元素原型添加show和close方法
     */

    constructor.prototype.show = function() {
        this.setAttribute("open", true);
    }
    constructor.prototype.close = function(value) {
        this.removeAttribute("open");

        this.returnValue = value;

        this.dispatchEvent("close");
    }
    document.body.addEventListener("DOMSubtreeModified", function(event) {
        initOpen();
        initForms();
    });



    document.body.dispatchEvent("DOMSubtreeModified");

    function initOpen() {
    	var dialogList = document.getElementsByTagName("dialog");
    	
        for (var i = 0; i < dialogList.length; i++) {
            var dialogElement = dialogList[i];

            switch(dialogElement.hasAttribute("open")){
            	case true:
            		dialogElement.style.display = "block";
            		break;
            	default:
            		dialogElement.style.display = "none";
            		break;
            }
        }
    }

    function initForms(){
    	for (var i = 0; i < document.forms.length; i++) {
        	var form = document.forms[i];

        	if(form.getAttribute("method") == "dialog"){
        		var inputs = form.getElementsByTagName("input");

        		for(var s=0; s<inputs.length; s++){
	            	var input = inputs[s];
	            	if(input.type == "submit"){
	            		form.onsubmit = function(){return false}
	            		input.onclick = function(ev){
	            			var parent = this.parentElement;

	            			while(parent.tagName.toLowerCase() != "dialog"){
	            				parent = parent.parentNode;
	            			}
	            			parent.close(this.value);
	            		}
	            	}
	            }
        	}
        }
    }
    
    var style = "dialog {\
	    position: absolute;\
        top:0;\
	    left:0px;right:0px;\
	    width: -webkit-fit-content;\
	    height: -webkit-fit-content;\
	    width: -moz-fit-content;\
	    height: -moz-fit-content;\
	    width: fit-content;\
	    height: fit-content;\
	    margin: auto;\
	    border: solid;\
	    border-image-source: initial;\
	    border-image-slice: initial;\
	    border-image-width: initial;\
	    border-image-outset: initial;\
	    border-image-repeat: initial;\
	    padding: 1em;\
	    background: white;\
	    color: black;\
	}";

    try {
        document.createStyleSheet().cssText = style;
    } catch (e) {
        var styleElement = document.createElement("style");

        document.head.insertBefore(styleElement, document.head.children[0]);
        styleElement.innerHTML = style;
    }

})();
