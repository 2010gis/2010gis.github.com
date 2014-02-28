dojo.declare(
    "InfoTip", // 类名
    null, // 无父类，使用null
    {    
        LOCATION: { left: "left", right: "right", top: "top", bottom: "bottom" },
        _isShowing: false,
        _coords: null,
        _height: 0,
        _width: 0,
        _location: "top",
        _padding: 15,
        _xOffset: 0,
        _yOffset: 0,
        _id : "",
        _animationRef: null,
        
        constructor: function(divId, cssClass, mapPosition, useAnimation) {
            this._xOffset = mapPosition.x;
            this._yOffset = mapPosition.y;
            this._id = divId;
            this._animation = useAnimation;
            var a = dojo.doc.createElement("div");
            dojo.attr(a, { id: divId, "class": cssClass, style: "display:none" });
            dojo.doc.body.appendChild(a);
        },
        
        getId: function() {
            return this._id;
        },

        isShowing: function() {
            return this._isShowing;
        },

        setPadding: function(padding) {
            this._padding = padding;
        },

        setLocation: function(location) {
            this._location = location;
        },

        setSize: function(f, g) {
            dojo.style(this._id, { height: g + "px", width: f + "px" }) 
        },

        setContent: function(f) {
            dojo.byId(this._id).innerHTML = f; 
            dojo.style(this._id, "display", "") 
        },

        setClass: function(className) {
            dojo.byId(this._id).className = className;
        },

        show: function(g) {
            this._coords = dojo.coords(this._id);
            this._height = this._coords.h;
            this._width = this._coords.w; 
        
            var h, f;
            switch (this._location) {
                case "left":
                    h = g.y + this._yOffset - (this._height / 2) + "px";
                    f = g.x + this._xOffset - this._width - this._padding + "px";
                    break;

                case "right":
                    h = g.y + this._yOffset - (this._height / 2) + "px";
                    f = g.x + this._xOffset + this._padding + "px"; 
                    break;

                case "bottom":
                    h = g.y + this._yOffset + this._padding + "px";
                    f = g.x + this._xOffset - (this._width / 2) + "px"; 
                    break;

                case "top":
                    h = g.y + this._yOffset - this._height - this._padding + "px"; 
                    f = g.x + this._xOffset - (this._width / 2) + "px";
                    break
            }

            dojo.style(this._id, { left: f, top: h, display: "" });
            if (this._animation) {
                if (this._animationRef != null) {
                    this._animationRef.stop();
                }

                this._animationRef = dojo.fadeIn({ node: this._id, duration: 1000 }).play();
            }
            this._isShowing = true;
        },

        hide: function() {
            if (!this._isShowing) {
                return
            }

            if (this._animation) {
                this._animationRef = dojo.fadeOut({
                    node: this._id,
                    duration: 800,
                    onEnd: function() { this.node.style.display = "none" }
                }).play();
            }
            else {
                dojo.style(this._id, "display", "none");
            }

            this._isShowing = false;
        }
    }
);
