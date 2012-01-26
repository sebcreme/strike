// ~~~~~~~~~~~~~~~~~~~~ Utils
// mini jquery
window.$ = HTMLElement.prototype.$ = function(selector) {
    if (selector == null) return null
    var context=this==window?document:this,results=context.querySelectorAll(selector),isId=/^\#[0-9a-zA-Z_\-]*$/;
    if (isId.test(selector) && results) return results[0]
    else return results
}
var each = function(c) {
    for(var i=0; i<this.length; i++) {
        c(this[i], i);
    }
}
Array.prototype.each = each;
NodeList.prototype.each = each;
$hasClass = function(element, className) {
    if (element) {
        var elementClassName = element.className;
        return (elementClassName.length > 0 && (elementClassName == className || 
            new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
    }
}
$addClass = function(element, className) {
    if (element) {
        if (!$hasClass(element, className)) element.className += (element.className ? ' ' : '') + className;
        return element;
    }
    return null;
}
$removeClass = function(element, className) {
    if (element) {
        element.className = element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ');
        element.className = element.className.replace(/^\s+|\s+$/g, ""); // strip whitespace
        return element;
    }
    return null;
}
Element.prototype.width = function(){return window.getComputedStyle(this,"").getPropertyValue("width").replace('px','');}
Element.prototype.height = function(){return window.getComputedStyle(this,"").getPropertyValue("height");}
/* -----------------------------------------------
 * Used in animation // TODO check validity
 * -----------------------------------------------
 */
function css(prop, value)
{
    if (value)
        this.style.setProperty(prop, value);
    else
        return window.getComputedStyle(this, null)[prop]
}
//test
HTMLElement.prototype.css = css;

$ajax = function(method, url, callback){
    var error = method.error
    var params = method.params
    var async = method.async === undefined ? true : false
    
    if (method.constructor != String){
        url = method.url
        callback = method.success
        method = method.method
    }
    if(!error) {
        error = function(e){
            throw e
        }
    }
    async = async ? async : false
    var req = new XMLHttpRequest()
    req.open(method, url, async)
    req.setRequestHeader('Accept', 'text/json')
    req.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200){
                try{
                    if (this.responseXML) callback(this.responseXML)
                    else callback(eval('('+this.responseText+')'))
                } catch (e){
                    console.log('cannot parse json because of '+e)
                    error(e)
                }
            }
            if (this.readyState == 4 && this.status != 200){
                error(this.status)
            }
    }
    req.send(params)
}

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

var cache = {};

this.tmpl = function tmpl(str, data) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn
    if (!/\W/.test(str)){
      try{
        if (!cache[str]){
          cache[str] = tmpl(document.getElementById(str).innerHTML)
        }
        }catch (error){console.log('error when rendering #'+str+' :: '+error.message)}
      
      fn = cache[str] 
    } else {
      fn = 
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
    new Function("obj",
      "var p=[],print=function(){p.push.apply(p,arguments);};" +

      // Introduce the data as local variables using with(){}
      "with(obj){p.push('" +

      // Convert the template into pure JavaScript
    str.replace(/[\r\t\n]/g, " ")
    .replace(/'(?=[^%]*%>)/g,"\t")
    .split("'").join("\\'")
    .split("\t").join("'")
    .replace(/<%=(.+?)%>/g, "',$1,'")
    .split("<%").join("');")
    .split("%>").join("p.push('")
    + "');}return p.join('');");
    }
    // Provide some basic currying to the user
    return data ? fn(data) : fn;
};

HTMLElement.prototype.on = function(event, handler) {
    if (event=='touchend' && !onMobile) event = 'mouseup';
    if (event=='touchstart' && !onMobile) event = 'mousedown';
    this.addEventListener(event, handler);
}

/**
* DEV &  TOOLS
**/
onMobile = navigator.userAgent.indexOf('Android') + navigator.userAgent.indexOf('iPhone;') > 0

if (!onMobile){
    var cacheStatusValues = [];
    cacheStatusValues[0] = 'uncached';
    cacheStatusValues[1] = 'idle';
    cacheStatusValues[2] = 'checking';
    cacheStatusValues[3] = 'downloading';
    cacheStatusValues[4] = 'updateready';
    cacheStatusValues[5] = 'obsolete';

    var cache = window.applicationCache;
    cache.addEventListener('cached', logEvent, false);
    cache.addEventListener('checking', logEvent, false);
    cache.addEventListener('downloading', logEvent, false);
    cache.addEventListener('error', logEvent, false);
    cache.addEventListener('noupdate', logEvent, false);
    cache.addEventListener('obsolete', logEvent, false);
    cache.addEventListener('progress', logEvent, false);
    cache.addEventListener('updateready', logEvent, false);

    function logEvent(e) {
        var online, status, type, message;
        online = (navigator.onLine) ? 'yes' : 'no';
        status = cacheStatusValues[cache.status];
        type = e.type;
        message = 'online: ' + online;
        message+= ', event: ' + type;
        message+= ', status: ' + status;
        if (type == 'error' && navigator.onLine) {
            message+= ' (prolly a syntax error in manifest)';
        }
        console.log(message);
    }
}
window.applicationCache.addEventListener(
    'updateready',
    function(){
        window.applicationCache.swapCache();
        console.log('swap cache has been called');
    },
    false
);

window.log = function(message) {
    if (onMobile)  Lucky.pushCommand('log://dummy?'+encodeURIComponent(message));
    else console.log(message)
}
// ~~~~~~~~~~~~~~~~~~~~ Lucky
Lucky = {
    commandQueue:[],
    currentPage: null,
    onReadyHandlers: [],
    onOrientationChangeHandlers: [],
    handlers : {},
    currentSlide: null,
    storage: window.localStorage,

    //~~~~~~~ SYSTEM ~~~~~~~//
    nextCommand : function(message, args){
        return this.commandQueue.length > 0 ? this.commandQueue.pop() : 'nocommand';
    },
    commandResult : function(type, args){
        if (this.handlers[type]) this.handlers[type](args);
    },
    pushCommand : function(command){
        this.commandQueue.push(command);
    },
    maps : function(query){
        window.open('http://maps.google.com?'+query)
        //this.pushCommand('maps://dummy?'+encodeURI(query));
    },
    showMap: function() {
        this.pushCommand('showMap://dummy');
    },

    hideMap: function() {
        this.pushCommand('hideMap://dummy');
    },

    setMarkers: function(def) {
        this.pushCommand('setMarkers://dummy?');
    },
    
    locate: function(handler){
        Lucky.handlers['locate'] = handler;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
                handler(position.coords)
            })
        }
    },
   
    getContacts : function(){
        if (onMobile) this.pushCommand('contacts://dummy?start') ;
        else {
            Lucky._contacts = [ ]
        }
    },
    stopLocate: function(){
        if (onMobile)this.pushCommand('locate://dummy?stop');
        else console.log("Stopping Localisation : no implemented in webkit mode");
    },
    
    lang: function(handler) {
        this.handlers['lang'] = handler;
        if (onMobile){
            this.pushCommand('lang://dummy');
        } else {
            this.commandResult('lang', 'en');
        }
    },
    reverseGeoCode : function(handler){
        this.handlers['reverseGeoCode'] = handler;
    },
    setMessages: function(messages, lang) {
        if(!messages[lang]) lang = 'en';
        window.lucky_messages = messages[lang];
        $('.i18n').each(function(el) {
            var id = el.id;
            var message = lucky_messages[id];
            if(message) {
                el.innerHTML = message;
            }
        });
    },
    
    getMessage: function(key) {
        return lucky_messages[key];
    },
    onready :function(handler){
        Lucky.onReadyHandlers.push(handler);
    },
    ready : function(){
        this.onReadyHandlers.each(function(handler){
            handler();
        });
        this.pushCommand('ready')
    },
    onorientationchange: function(handler){
        Lucky.onOrientationChangeHandlers.push(handler);
    },
    orientationChange : function( orientation ){
        this.onOrientationChangeHandlers.each(function(handler){
            handler( orientation );
        });
        this.pushCommand('orientationChange');
    },
    //~~~~~~~ UI ~~~~~~~//
    
    show: function(page) {
        Lucky._cleanPage(page);
        new Transition('none', 0.35, 'linear').perform($(page), $(Lucky.currentPage), false);
        Lucky.currentPage = page;
    },
    
    flip: function(page) {
        Lucky._cleanPage(page);
        new Transition('flip', 0.65, 'linear').perform($(page), $(Lucky.currentPage), false);
        Lucky.currentPage = page;
    },
    
    unflip: function(page) {
        Lucky._cleanPage(page);
        new Transition('flip', 0.65, 'linear').perform($(page), $(Lucky.currentPage), true);
        Lucky.currentPage = page;
    },
    
    next: function(page) {
        Lucky._cleanPage(page);
        new Transition('push', 0.35, 'ease').perform($(page), $(Lucky.currentPage), false);
        Lucky.currentPage = page;
    },
    
    prev: function(page) {
        Lucky._cleanPage(page);
        var transition = new Transition('push', 0.35, 'ease');
        transition.perform($(page), $(Lucky.currentPage), true);            
        Lucky.currentPage = page;
        
        Events.fire("Page_Transition", page); 
    },
    
    rotateRight: function(page) {
        Lucky._cleanPage(page);
        new Transition('cube', 0.55, 'ease').perform($(page), $(Lucky.currentPage), false);
        Lucky.currentPage = page;
    },
    
    rotateLeft: function(page) {
        Lucky._cleanPage(page);
        new Transition('cube', 0.55, 'ease').perform($(page), $(Lucky.currentPage), true);
        Lucky.currentPage = page;
    },
    
    fade: function(page) {
        Lucky._cleanPage(page);
        new Transition('dissolve', 0.35, 'linear').perform($(page), $(Lucky.currentPage), false);
        Lucky.currentPage = page;
    },
    
    swap: function(page) {
        Lucky._cleanPage(page);
        new Transition('swap', 0.55, 'linear').perform($(page), $(Lucky.currentPage), false);
        Lucky.currentPage = page;
    },
    
    _cleanPage: function(page) {
        // Clean lists
        $(page).querySelectorAll('.list li').each(function(it) {
            $removeClass(it, 'selected');
        });
    },
    
    currentPanel: null,
    
    openPanel: function(page) {
        var transition = new Transition('slide', 0.35, 'ease');
        transition.direction = 'bottom-top';
        transition.perform($(page), $(Lucky.currentPage), false);
        Lucky.currentPanel = page;      
    },
    
    closePanel: function() {
        var transition = new Transition('slide', 0.35, 'ease');
        transition.direction = 'bottom-top';
        transition.perform($(Lucky.currentPage), $(Lucky.currentPanel), true);
        setTimeout(function() {
            $(Lucky.currentPanel).style.display = '';
            Lucky.currentPanel = null;
        }, 500);        
    },
    
    currentOverlay: null,
    
    showOverlay: function(page, opacity) {
        var el = $(page);
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.opacity = '0';
        el.style.zIndex = '1000';
        el.style.display = 'block';
        setTimeout(function() {
            el.style.webkitTransition = 'opacity .25s linear';
            el.style.opacity = opacity ? opacity : '1';
        }, 0);
        Lucky.currentOverlay = page;
    },  
    
    hideOverlay: function(now) {
        var el = $(Lucky.currentOverlay);
        var onend = function() {
            el.style.webkitTransition = '';
            el.style.display = 'none';
            el.removeEventListener('webkitTransitionEnd', onend, false);
        };
        if(now) {
            el.style.display = 'none';
        } else {
            el.addEventListener('webkitTransitionEnd', onend, false);           
        }
        el.style.opacity = '0';
    },
    _touchStart: function(e) {
        var node = e.target;
        var it = 0;
        while(node != null && it < 10) {
            if(node.tagName) {
                if($hasClass(node, 'button') || $hasClass(node, 'submit-button')) {
                    $addClass(node, 'selected')
                    break;
                }
                if(node.tagName == 'LI' && $hasClass(node.parentNode, 'list')) {
                    node.parentNode.querySelectorAll('li').each(function(it) {
                        $removeClass(it, 'selected');                       
                    });
                    $addClass(node, 'selected')
                    e.preventDefault();
                    break;
                }   
            }
            it++;
            node = node.parentNode;
        }   
    },
    
    _touchEnd: function(e) {    
        var node = e.target;
        var it = 0;
        while(node != null && it < 10) {
            if(node.className) {
                if($hasClass(node, 'button') || $hasClass(node, 'submit-button')) {
                    $removeClass(node, 'selected')
                    break;
                }   
            }
            it++;
            node = node.parentNode;
        }   
    },
    fakeTouch : function(nodeElement){
        if (!onMobile){
            if (nodeElement.hasChildNodes){
                nodeElement.childNodes.each(function(node){
                    if (node.hasChildNodes()) Lucky.fakeTouch(node)
                    if (node.getAttribute){
                        var executable = node.getAttribute('ontouchstart');
                        if (node.getAttribute('ontouchend') != null) executable += ';'+node.getAttribute('ontouchend');
                        if (executable){
                            node.onclick = function(){eval(executable)}
                        }
                    }
                })
            }
        }

    }
}

// ~~~~~~~~~~~~~~~~~~~~
window.onload = function() {
    Lucky.fakeTouch(document);
    document.body.addEventListener('touchstart', Lucky._touchStart, false);
    document.body.addEventListener('touchend', Lucky._touchEnd, false);
    document.body.addEventListener('touchmove', function(e) {
        //e.preventDefault();
    }, false);
    document.body.addEventListener('blur', function() {
        window.scrollTo(0, 0);
    }, true);
    Lucky.ready();
}

// ~~~~~~~~~~~~~~~~~~~~~ Thanks to Apple

// Note: Properties and methods beginning with underbar ("_") are considered private and subject to change in future Dashcode releases.

// Currently supported transition types
Transition.NONE_TYPE = 'none';
Transition.PUSH_TYPE = 'push';
Transition.DISSOLVE_TYPE = 'dissolve';
Transition.SLIDE_TYPE = 'slide';
Transition.FADE_TYPE = 'fade';
Transition.FLIP_TYPE = 'flip';
Transition.CUBE_TYPE = 'cube';
Transition.SWAP_TYPE = 'swap';
Transition.REVOLVE_TYPE = 'revolve';

// Transition timing functions that are defined as part of WebKit CSS animation specification. These are made available for your convenience.
Transition.EASE_TIMING = 'ease';
Transition.LINEAR_TIMING = 'linear';
Transition.EASE_IN_TIMING = 'ease-in';
Transition.EASE_OUT_TIMING = 'ease-out';
Transition.EASE_IN_OUT_TIMING = 'ease-in-out';

// Directions are only supported for certain transition types.  
// Push and Slide support all four directions.
// Flip, Cube, Swap and Revolve support only Right-to-left and Left-to-right
Transition.RIGHT_TO_LEFT_DIRECTION = 'right-left';
Transition.LEFT_TO_RIGHT_DIRECTION = 'left-right';
Transition.TOP_TO_BOTTOM_DIRECTION = 'top-bottom';
Transition.BOTTOM_TO_TOP_DIRECTION = 'bottom-top';

//
// Constructor for Transtition object. You can also use the convenience method CreateTransitionWithProperties()
//
// type         - any of the Transition type constants
// duration     - a float in seconds
// timing       - a valid CSS animation timing function value. For example, 'linear' or 'ease-in-out'
//
// After construction, you can also assign one of the direction constants above to the "direction" property 
// to set the transition direction for transition types that support different directions (see comments above.)
//
function Transition(type, duration, timing)
{
    this.type = type;
    this.setDuration(duration);
    this.timing = timing;
    
    this._useTransforms = Transition.areTransformsSupported();
}

//
// Create a new Transition object and fill its internal properties from the dictionary parameter
//
function CreateTransitionWithProperties(properties)
{
    var transition = new Transition();
    for (var property in properties) {
        if (property == 'duration') {
            transition.setDuration(properties[property]);
        } else {
            transition[property] = properties[property];
        }
    }
    return transition;
}

//
// Both newView and oldView must share the same common parent container element. The transition is
// constrained by the dimensions of the parent container. In particular, the container has
// 'overflow: hidden'. This is especially important when the container edges are not lined with the
// edge of the device viewport.
//
// Be careful that this method actually makes use of these inline CSS properties to make sure that
// all transitions can be performed correctly:
//  - display
//  - zIndex
//  - position
//  - top
//  - width
// If you also make use of these CSS properties out of this transition method, you have to make
// copies of them restore them appropriately.
//
//
// newView - the new view to be shown. Nothing will change if newView is null.
// oldView - the old view to be replaced
// isReverse - if flag is true, it will perform the transition in reverse. Some transitions, for example, the push transition has a reverse.
//
Transition.prototype.perform = function(newView, oldView, isReverse)
{
    if (!newView || !newView.parentNode) return;
    var containerElement = newView.parentNode;
    if (oldView) {
        // Got to execute in the same container
        if (oldView.parentNode != containerElement) return;
        if (oldView == newView) return;
        
        containerElement = oldView.parentNode; // In case there is a push container
        if (containerElement.getAttribute('apple-transition-flip-push-container')) {
            this._pushContainer = containerElement;
            containerElement = this._pushContainer.parentNode;
        }
        else {
            // Clear any residue push container for flip
            this._pushContainer = null;            
        }
        
        var oldStyle = oldView.style;
        // Reset some settings
        oldStyle.zIndex = 0;
        // Since oldView is just taken out of the document flow, make sure its width still looks good just in case width is 'auto' and its children doesn't make up all the width
        this._containerWidth = containerElement.offsetWidth + 'px';
        oldStyle.width = this._containerWidth;
        // This is especially important for reverse since the original value of 'top' is 'auto', which for a view lower in the document flow means that it will come after the newly restored view. Hence, let's set it to a right value before newView is put to 'relative' again.
        oldStyle.top = oldView.offsetTop + 'px';

        if (this._useTransforms) {
            oldStyle.webkitTransitionProperty = 'none'; // disable
            // This also makes sure that we start with an identity matrix to avoid initial performance problem
            oldStyle.webkitTransform = this._translateOp(0, 0);
            oldStyle.webkitBackfaceVisibility = '';
        }
        
        if (!this.type || this.type == Transition.NONE_TYPE || !this._useTransforms) {
            if ((this.type != Transition.FADE_TYPE) && (this.type != Transition.SLIDE_TYPE) || isReverse) {
                oldStyle.display = 'none';
            }
        }
    }
    
    // Make sure that container is constraining the transitions for overflow content
    containerElement.style.overflow = 'hidden';
    var computedStyle = document.defaultView.getComputedStyle(containerElement, null);
    if ((computedStyle.getPropertyValue('position') != 'absolute') && (computedStyle.getPropertyValue('position') != 'relative')) {
        // Assume 'static' since we don't support 'fixed'. 'relative' is less obtrusive then.
        containerElement.style.position = 'relative';
    }
    
    var newStyle = newView.style;
    if (this._useTransforms) {
        // Reset
        newStyle.webkitTransitionProperty = 'none'; // disable
        // This also makes sure that we start with an identity matrix to avoid initial performance problem
        newStyle.webkitTransform = this._translateOp(0, 0);
        newStyle.webkitBackfaceVisibility = '';
        
        // This overcomes a clipping problem
        containerElement.parentNode.style.zIndex = 0;
    }
    
    // Before the new view comes in, remove any previously hard-coded inline value that would have crept in when it was transited out. Because the transition is happening in a container and we are reinstating the position to be 'relative', the new view will resize itself to react to orientation changes (if any).
    newStyle.width = null;
    newStyle.position = 'relative';
    newStyle.display = 'block';

    // Perform the transition
    if (this.type && this.type != Transition.NONE_TYPE && this._useTransforms) {
        this._checkedForEnded = false;
        this._containerElement = containerElement;
        this._newView = newView;
        this._oldView = oldView;
        // Make sure that we make a copy of the newView's inline opacity because we are going to make use of it in various ways, for example, for the fade or revolve transition
        this._previousNewStyleOpacity = newStyle.opacity;
        // Normally, the old view disappears as part of transition. Some transitions like slide/fade requires the old view to be there though.
        this._shouldHideOldView = true;
        
        if (oldView) {                        
            // If the new view is too short to fit the whole view port height, this will even show the Safari toolbar before the transition happens, 
            oldStyle.position = 'absolute';
            
            this._preventEventsInContainer();
            
            this._originalContainerElementHeight = containerElement.style.height;
            containerElement.style.height = Math.max(oldView.offsetHeight, newView.offsetHeight) + 'px';
        }
        
        if (this._pushContainer && (this.type != Transition.FLIP_TYPE)) {
            this._clearPushContainer();
        }
        
        if (this.type == Transition.DISSOLVE_TYPE || this.type == Transition.FADE_TYPE) {
            this._performFadeTransition(isReverse);
        }
        else if (this.type == Transition.PUSH_TYPE || this.type == Transition.SLIDE_TYPE) {
            this._performPushOrSlideTransition(isReverse);
        }
        else if (this.type == Transition.FLIP_TYPE) {
            this._performFlipTransition(isReverse);
        }
        else if (this.type == Transition.CUBE_TYPE) {
            this._performCubeTransition(isReverse);
        }
        else if (this.type == Transition.SWAP_TYPE) {
            this._performSwapTransition(isReverse);
        }
        else if (this.type == Transition.REVOLVE_TYPE) {
            this._performRevolveTransition(isReverse);
        }
    }
    Lucky.fakeTouch(document);
}

Transition.areTransformsSupported = function () {
    if (!Transition._areTransformsSupported) {
        // Our use of transforms and transitions is only officially supported for the iPhone and does not work correctly in desktop WebKit.
        // The commented out test would be more correct if desktop WebKit were also supported.
        /*
        var testElem = document.createElement('div');
        var style = testElem.style;
        style.setProperty('-webkit-transform', 'inherit');
        Transition._areTransformsSupported = style.getPropertyValue('-webkit-transform') == 'inherit';
         */
        
        // But currently, we are using the following test which succeeds on the iPhone but not on the desktop.
        Transition._areTransformsSupported = (window.WebKitCSSMatrix ? true : false);
    }
    return Transition._areTransformsSupported;
}

// Default duration for each transition type, if it is not specified
Transition._DEFAULT_DURATION = {
    'none'      : '0.35',
    'push'      : '0.35',
    'dissolve'  : '0.35',
    'slide'     : '0.35',
    'fade'      : '0.35',
    'flip'      : '0.65',
    'cube'      : '0.55',
    'swap'      : '0.55',
    'revolve'   : '0.35'
}

//
// Returns the duration for the transition.
//
Transition.prototype.getDuration = function()
{
    var duration = this._duration;
    if (duration == '') {
        duration = Transition._DEFAULT_DURATION[this.type];
        if (!duration) duration = '0.3';
    }
    return duration;
}

//
// Sets the duration for the transition.
//
// value - new duration
//
Transition.prototype.setDuration = function(value)
{
    this._duration = value;
}

/////////////////////////////////////////////////////////////////////////////
//
// Start Private methods
//
/////////////////////////////////////////////////////////////////////////////

Transition.prototype._getDurationString = function()
{
    var value = parseFloat(this.getDuration());
    if (!isNaN(value)) {
        value += 's';
    }
    else {
        value = '0s';
    }
    return value;
}

Transition.prototype._getDurationStringForFadingEffect = function()
{
    var value = parseFloat(this.getDuration());
    if (!isNaN(value)) {
        // looks better with slightly longer timing
        value = value * (1+ ((value < 0.25) ? 0.5 : Math.pow(4, -0.25-value))) + 's';
    }
    else {
        value = '0s';
    }
    return value;
}

Transition.prototype._translateOp = function(xPixels, yPixels)
{
    return 'translate(' + xPixels + 'px, ' + yPixels + 'px)';
}

Transition.prototype._rotateOp = function(axis, degree)
{
    return 'rotate' + axis + '(' + degree + 'deg)';
}

Transition.prototype._setupTransition = function(style, property, duration, timing, propertyString, propertyValue)
{
    style.webkitTransitionProperty = property;
    style.webkitTransitionDuration = duration;
    style.webkitTransitionTimingFunction = timing;
    style[propertyString] = propertyValue;
}

Transition.prototype.handleEvent = function(event)
{
    switch (event.type) {
    case 'webkitTransitionEnd' :
        this._transitionEnded(event);
        break;
    case 'webkitAnimationEnd' :
        this._animationEnded(event);
        break;
    }
}

// Prevent user events from interfering from happening during transition
Transition.prototype._preventEventsInContainer = function()
{
    if (!this._maskContainerElement) return;
    
    if (this._mask) this._maskContainerElement.removeChild(this._mask);
    
    this._mask = document.createElement("div");
    this._mask.setAttribute('style', 'position: absolute; top: 0; left: 0; z-index: 1000;');
    this._mask.style.width = this._maskContainerElement.offsetWidth + 'px';
    this._mask.style.height = this._maskContainerElement.offsetHeight + 'px';
    this._maskContainerElement.appendChild(this._mask);
}

// Re-parent children of _pushContainer back to _containerElement whenever the transition is not a flip.
Transition.prototype._clearPushContainer = function()
{
    if (this._pushContainer) {
        this._containerElement.removeChild(this._pushContainer);
    
        var children = this._pushContainer.childNodes;
        for (var i=children.length-1; i>=0; i--) {
            if (children[i] != this._mask) {
                this._containerElement.appendChild(children[i]);
            }
        }
        
        delete this._pushContainer;
    }
}

Transition.prototype._transitionEndedHelper = function()
{
    if (this._shouldHideOldView) {
        this._oldView.style.display = 'none';
    }
    this._newView.style.zIndex = 1;
    this._newView.style.opacity = this._previousNewStyleOpacity;
    
    if (this._maskContainerElement && this._mask) {
        this._maskContainerElement.removeChild(this._mask);
        this._mask = null;
    }
    
    this._containerElement.style.height = this._originalContainerElementHeight;
}

// Callback for end of transition
Transition.prototype._transitionEnded = function(event)
{
    if (!this._checkedForEnded) {
        this._transitionEndedHelper();
        
        if (this.type == Transition.CUBE_TYPE) {
            this._containerElement.style.webkitPerspective = '';
            this._oldView.style.webkitTransformOrigin = '50% 50%';
            this._newView.style.webkitTransformOrigin = '50% 50%';
        }

        this._oldView.style.opacity = '1';
        this._newView.style.opacity = '1';
        
        this._checkedForEnded = true;
    }
}

// A handy method to find the style rule of a CSS animation rule (the one that starts with '@');
Transition._findAnimationRule = function(animationRuleName)
{
    var foundRule = null;
    var styleSheets = document.styleSheets;
    var re = /Parts\/Transitions.css$/;
    for (var i=0; i < styleSheets.length; i++) {
        var styleSheet = styleSheets[i];
        if (re.test(styleSheet.href)) {
            for (var j=0; j < styleSheet.cssRules.length; j++) {
                var rule = styleSheet.cssRules[j];
                // 7 means the keyframe rule
                if (rule.type == 7 && rule.name == animationRuleName) {
                    foundRule = rule;
                    break;
                }
            }
        }
    }
    return foundRule;
}

Transition.prototype._animationEndedHelper = function()
{
    this._transitionEndedHelper();

    Transition._removeClassName(this._oldView, this._oldViewAnimationName);
    Transition._removeClassName(this._newView, this._newViewAnimationName);
}

// Callback for end of animation
Transition.prototype._animationEnded = function(event)
{
    if (!this._checkedForEnded) {
        this._animationEndedHelper();
        
        if (this.type == Transition.FLIP_TYPE) {
            Transition._removeClassName(this._containerElement, 'dashcode-transition-flip-container');
            Transition._removeClassName(this._flipContainer, 'dashcode-transition-flip-container-pushback');
        }
        
        this._checkedForEnded = true;
    }
}

Transition.prototype._performFadeTransition = function(isReverse)
{
    if (this._oldView) {
        var _self = this;
        var newStyle = this._newView.style;
        var oldStyle = this._oldView.style;
        var isDissolve = this.type == Transition.DISSOLVE_TYPE;
        var isSimpleFade = this.type == Transition.FADE_TYPE;

        if (isSimpleFade) {
            if (!isReverse) newStyle.opacity = 0;
        }
        else if (isDissolve) {
            newStyle.opacity = 0;
        }
    
        var durationString = this._getDurationStringForFadingEffect(this.getDuration());
        Transition._addDelayedTransitionCallback(function() {
            if (isDissolve || (isSimpleFade && isReverse)) {
                _self._setupTransition(oldStyle, 'opacity', durationString, _self.timing, 'opacity', 0);
            }
            else {
                _self._shouldHideOldView = false; 
            }

            if (isDissolve || (isSimpleFade && !isReverse)) {
                // _self._previousNewStyleOpacity - restoring the saved inline opacity, instead of blindly blasting it away
                _self._setupTransition(newStyle, 'opacity', durationString, _self.timing, 'opacity', _self._previousNewStyleOpacity);
            }
        });
        
        // Register a callback for the end of the animation for clean up and/or resets
        this._newView.addEventListener('webkitTransitionEnd', this, false);
    }
}

Transition.prototype._performPushOrSlideTransition = function(isReverse)
{
    if (this._oldView) {
        var _self = this;
        var newStyle = this._newView.style;
        var oldStyle = this._oldView.style;
        var isPush = this.type == Transition.PUSH_TYPE;
        var isSlide = this.type == Transition.SLIDE_TYPE;
        var transformX = true;
        
        var factor = isReverse ? -1 : 1;
        var dimension = parseInt(this._containerWidth);
        if (this.direction == Transition.BOTTOM_TO_TOP_DIRECTION) {
            transformX = false;
            dimension = isReverse ? this._newView.offsetHeight : this._oldView.offsetHeight;
        } else if (this.direction == Transition.TOP_TO_BOTTOM_DIRECTION) {
            transformX = false;
            dimension = isReverse ? this._oldView.offsetHeight : this._newView.offsetHeight;
        }
        if (this.direction == Transition.LEFT_TO_RIGHT_DIRECTION || this.direction == Transition.TOP_TO_BOTTOM_DIRECTION) factor *= -1;
        
        if (isPush || (isSlide && !isReverse)) {
            newStyle.webkitTransitionProperty = 'none'; // disable
            var transformOp;
            if (transformX) {
                transformOp = this._translateOp(factor*dimension, 0);
            } else {
                transformOp = this._translateOp(0, factor*dimension);
            }
            newStyle.webkitTransform = transformOp;
        }
        
        Transition._addDelayedTransitionCallback(function() {
            var durationString = _self._getDurationString();
            
            if (isPush || (isSlide && isReverse)) {
                var transformOp;
                if (transformX) {
                    transformOp = _self._translateOp(-1*factor*dimension, 0);
                } else {
                    transformOp = _self._translateOp(0, -1*factor*dimension);
                }
                _self._setupTransition(oldStyle, '-webkit-transform', durationString, _self.timing, 'webkitTransform', transformOp);
            }
            else {
                _self._shouldHideOldView = false; 
            }
            
            if (isPush || (isSlide && !isReverse)) {
                _self._setupTransition(newStyle, '-webkit-transform', durationString, _self.timing, 'webkitTransform', _self._translateOp(0, 0));
            }
        });
        
        // Register a callback for the end of the animation for clean up and/or resets
        this._newView.addEventListener('webkitTransitionEnd', this, false);
    }
}

Transition.prototype._performFlipTransition = function(isReverse)
{
    if (this._oldView) {
        // Using Animation
        var newStyle = this._newView.style;
        var oldStyle = this._oldView.style;
        
        var dimension = parseInt(this._containerWidth);
        if (dimension != 320) {
            if (Transition._containerFlipTranslateZStyle === undefined) {
                var animationRule = Transition._findAnimationRule('dashcode-transition-flip-container-pushback');
                try {
                    Transition._containerFlipTranslateZStyle = animationRule.findRule('50%').style;
                }
                catch (e) {
                    Transition._containerFlipTranslateZStyle = null;
                }
            }
        }
        if (Transition._containerFlipTranslateZStyle) {
            Transition._containerFlipTranslateZStyle.webkitTransform = 'translateZ(' + -1*dimension/2 + 'px)';
        }
        
        // Creating a dynamic container to make flip smoother
        if (!this._pushContainer) {
            this._pushContainer = document.createElement('div');
            // Tag it
            this._pushContainer.setAttribute('apple-transition-flip-push-container', 'true');
            // Spec says that overflow:hidden and preserve-3d don't mix.
            this._pushContainer.setAttribute('style', 'position: relative; top: 0; left: 0; overflow: visible; z-index: 0; -webkit-transform-style: preserve-3d;');
            
            var children = this._containerElement.childNodes;
            for (var i=children.length-1; i>=0; i--) {
                if (children[i] != this._mask) {
                    this._pushContainer.appendChild(children[i]);
                }
            }
            this._containerElement.appendChild(this._pushContainer);
        }
        else {
            // Workaround an animation perspective problem
            this._containerElement.removeChild(this._pushContainer);
            this._containerElement.appendChild(this._pushContainer);
        }
        
        var durationString = this._getDurationString();
        
        var direction = this.direction;
        if (direction != Transition.RIGHT_TO_LEFT_DIRECTION && direction != Transition.LEFT_TO_RIGHT_DIRECTION) direction = Transition.RIGHT_TO_LEFT_DIRECTION;
        var fromRight = ((direction == Transition.RIGHT_TO_LEFT_DIRECTION) && !isReverse) || ((direction == Transition.LEFT_TO_RIGHT_DIRECTION) && isReverse);
        
        oldStyle.webkitAnimationDuration = durationString;
        oldStyle.webkitAnimationTimingFunction = this.timing;
        var oldViewAnimationName = fromRight ? 'dashcode-transition-flip-right-old-view' : 'dashcode-transition-flip-left-old-view';
        Transition._addClassName(this._oldView, oldViewAnimationName);
        newStyle.webkitAnimationDuration = durationString;
        newStyle.webkitAnimationTimingFunction = this.timing;
        var newViewAnimationName = fromRight ? 'dashcode-transition-flip-right-new-view' : 'dashcode-transition-flip-left-new-view';
        Transition._addClassName(this._newView, newViewAnimationName);
        
        this._pushContainer.style.webkitAnimationDuration = durationString
        this._pushContainer.style.webkitAnimationTimingFunction = this.timing;
        Transition._addClassName(this._pushContainer, 'dashcode-transition-flip-container-pushback');
        this._containerElement.style.webkitAnimationDuration = durationString
        this._containerElement.style.webkitAnimationTimingFunction = this.timing;
        Transition._addClassName(this._containerElement, 'dashcode-transition-flip-container');        

        // Register a callback for the end of the animation for clean up
        this._containerElement.addEventListener('webkitAnimationEnd', this, false);
        this._newViewAnimationName = newViewAnimationName;
        this._oldViewAnimationName = oldViewAnimationName;
    }
}

Transition.prototype._performCubeTransition = function(isReverse)
{
    if (this._oldView) {
        var _self = this;
        var newStyle = this._newView.style;
        var oldStyle = this._oldView.style;
        
        var durationString = this._getDurationString();
        var direction = this.direction;
        if (direction != Transition.RIGHT_TO_LEFT_DIRECTION && direction != Transition.LEFT_TO_RIGHT_DIRECTION) direction = Transition.RIGHT_TO_LEFT_DIRECTION;
        var fromRight = ((direction == Transition.RIGHT_TO_LEFT_DIRECTION) && !isReverse) || ((direction == Transition.LEFT_TO_RIGHT_DIRECTION) && isReverse);
        
        this._containerElement.style.webkitPerspective = '800';
        oldStyle.webkitBackfaceVisibility = 'hidden';
        oldStyle.webkitTransformOrigin = fromRight ? '100% 50%' : '0% 50%';
        newStyle.webkitBackfaceVisibility = 'hidden';
        newStyle.webkitTransformOrigin = fromRight ? '0% 50%' : '100% 50%';
        
        var factor = fromRight ? 1 : -1;
        var dimension = parseInt(this._containerWidth);
        
        newStyle.webkitTransitionProperty = 'none'; // disable
        newStyle.webkitTransform = _self._rotateOp('Y', factor*90) + ' translateZ(' + dimension + 'px)';
                
        Transition._addDelayedTransitionCallback(function() {
            var durationString = _self._getDurationString();
            
            _self._setupTransition(oldStyle, '-webkit-transform', durationString, _self.timing, 'webkitTransform', _self._rotateOp('Y', factor*-90) + ' translateZ(' + dimension + 'px)');
            _self._setupTransition(newStyle, '-webkit-transform', durationString, _self.timing, 'webkitTransform', 'rotateY(0deg) translateZ(0px)');
        });
        
        // Register a callback for the end of the animation for clean up and/or resets
        this._newView.addEventListener('webkitTransitionEnd', this, false);
    }
}

Transition.prototype._performSwapTransition = function(isReverse)
{
    if (this._oldView) {
        // Using Animation
        var newStyle = this._newView.style;
        var oldStyle = this._oldView.style;
        
        var durationString = this._getDurationString();
        
        var direction = this.direction;
        if (direction != Transition.RIGHT_TO_LEFT_DIRECTION && direction != Transition.LEFT_TO_RIGHT_DIRECTION) direction = Transition.RIGHT_TO_LEFT_DIRECTION;
        var fromRight = ((direction == Transition.RIGHT_TO_LEFT_DIRECTION) && !isReverse) || ((direction == Transition.LEFT_TO_RIGHT_DIRECTION) && isReverse);
        
        oldStyle.webkitAnimationDuration = durationString;
        oldStyle.webkitAnimationTimingFunction = this.timing;
        var oldViewAnimationName = fromRight ? 'dashcode-transition-swap-right-old-view' : 'dashcode-transition-swap-left-old-view';
        Transition._addClassName(this._oldView, oldViewAnimationName);
        newStyle.webkitAnimationDuration = durationString;
        newStyle.webkitAnimationTimingFunction = this.timing;
        var newViewAnimationName = fromRight ? 'dashcode-transition-swap-right-new-view' : 'dashcode-transition-swap-left-new-view';
        Transition._addClassName(this._newView, newViewAnimationName);

        // Register a callback for the end of the animation for clean up and/or resets
        this._newView.addEventListener('webkitAnimationEnd', this, false);
        this._newViewAnimationName = newViewAnimationName;
        this._oldViewAnimationName = oldViewAnimationName;
    }
}

Transition.prototype._performRevolveTransition = function(isReverse)
{
    if (this._oldView) {
        // Using Animation
        var newStyle = this._newView.style;
        var oldStyle = this._oldView.style;
        
        var durationString = this._getDurationString();
        
        oldStyle.webkitAnimationDuration = durationString;
        oldStyle.webkitAnimationTimingFunction = this.timing;
        var oldViewAnimationName;
        var direction = this.direction;
        if (direction != Transition.RIGHT_TO_LEFT_DIRECTION && direction != Transition.LEFT_TO_RIGHT_DIRECTION) direction = Transition.RIGHT_TO_LEFT_DIRECTION;
        
        if (direction == Transition.RIGHT_TO_LEFT_DIRECTION) {
            oldViewAnimationName = isReverse ? 'dashcode-transition-revolve-right-old-view' : 'dashcode-transition-revolve-right-reverse-old-view';
        }
        else {
            oldViewAnimationName = isReverse ? 'dashcode-transition-revolve-left-old-view' : 'dashcode-transition-revolve-left-reverse-old-view';
        }
        Transition._addClassName(this._oldView, oldViewAnimationName);
        newStyle.webkitAnimationDuration = durationString;
        newStyle.webkitAnimationTimingFunction = this.timing;
        var newViewAnimationName;
        if (direction == Transition.RIGHT_TO_LEFT_DIRECTION) {
            newViewAnimationName = isReverse ? 'dashcode-transition-revolve-right-new-view' : 'dashcode-transition-revolve-right-reverse-new-view';
        }
        else {
            newViewAnimationName = isReverse ? 'dashcode-transition-revolve-left-new-view' : 'dashcode-transition-revolve-left-reverse-new-view';
        }
        Transition._addClassName(this._newView, newViewAnimationName);

        // Register a callback for the end of the animation for clean up and/or resets
        this._newView.addEventListener('webkitAnimationEnd', this, false);
        this._newViewAnimationName = newViewAnimationName;
        this._oldViewAnimationName = oldViewAnimationName;
    }
}

//
// _hasClassName(element, className)
// Checks if an element's class attribute has 'className' (adopted from Prototype framework)
//
// element: element to act on
// className: value to check
//
Transition._hasClassName = function(element, className)
{
    if (element) {
        var elementClassName = element.className;
        return (elementClassName.length > 0 && (elementClassName == className || 
            new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
    }
}

//
// _addClassName(element, className)
// Add 'className' to element if an element's class attribute doesn't already have 'className' (adopted from Prototype framework)
//
// element: element to act on
// className: value to add
//
Transition._addClassName = function(element, className)
{
    if (element) {
        if (!this._hasClassName(element, className)) element.className += (element.className ? ' ' : '') + className;
        return element;
    }
    return null;
}
Transition._addClassName;

//
// _removeClassName(element, className)
// Remove 'className' from element if an element's class attribute has 'className' (adopted from Prototype framework)
//
// element: element to act on
// className: value to remove
//
Transition._removeClassName = function(element, className)
{
    if (element) {
        element.className = element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ');
        element.className = element.className.replace(/^\s+|\s+$/g, ""); // strip whitespace
        return element;
    }
    return null;
}

// Accumulate transitions that will be executed after a 0 delay
Transition._addDelayedTransitionCallback = function(callback)
{
    if (!Transition._delayedCallbacks) {
        Transition._delayedCallbacks = new Array();
        var performDelayedCallbacks = function () {
            var length = Transition._delayedCallbacks.length;
            for (var f=0; f<length; f++) {
                Transition._delayedCallbacks[f]();
            }
            delete Transition._delayedCallbacks;
        }
        setTimeout(performDelayedCallbacks, 0);
    }
    Transition._delayedCallbacks.push(callback);
}

var Events = {
    bind: function( eventName, callback ){
        document.addEventListener( eventName, callback, false);
    },
    fire: function( eventName, eventData ){
        var evt = document.createEvent("Events");
        evt.initEvent( eventName, true, true);
        if( eventData )
            evt.data = eventData;
        document.dispatchEvent(evt);
    }
};

