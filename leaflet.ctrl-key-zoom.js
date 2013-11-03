if(typeof L !== "undefined") {
    initCtrlKeyZoomPlugin(L);
} else if(typeof define !== "undefined") {
    define(["lib/leaflet"], initCtrlKeyZoomPlugin);
} else throw Error("Leflet.ctrl-zoom-plugin wasn't able to find the Leaflet library");

function initCtrlKeyZoomPlugin(L){
    function checkKey(e) {
        /// cmd key codes for different browsers
        var keyCodes = [17, 157, 224, 91, 93, 18];
        if (e.ctrlKey || e.metaKey || keyCodes.indexOf(e.keyCode) !== -1) {
            return true;
        }

        return false;
    }
    L.Map.BoxZoom.prototype._onMouseDown = function (e) {
        if (!checkKey(e) || ((e.which !== 1) && (e.button !== 1))) { return false; }

        L.DomUtil.disableTextSelection();
        L.DomUtil.disableImageDrag();

        this._startLayerPoint = this._map.mouseEventToLayerPoint(e);

        this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
        L.DomUtil.setPosition(this._box, this._startLayerPoint);

        //TODO refactor: move cursor to styles
        this._container.style.cursor = 'crosshair'; 

        L.DomEvent
            .on(document, 'mousemove', this._onMouseMove, this)
            .on(document, 'mouseup', this._onMouseUp, this)
            .on(document, 'keydown', this._onKeyDown, this);

        this._map.fire('boxzoomstart');
    };

    L.Control.Zoom.prototype._zoomIn = function (e) {
        this._map.zoomIn(checkKey(e) ? 3 : 1);
    };

    L.Control.Zoom.prototype._zoomOut = function (e) {
        this._map.zoomOut(checkKey(e) ? 3 : 1);
    };

    L.Draggable.prototype._onDown = function (e) {
        if (checkKey(e) || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }

        L.DomEvent
                .stopPropagation(e);

        if (L.Draggable._disabled) { return; }

        L.DomUtil.disableImageDrag();
        L.DomUtil.disableTextSelection();

        var first = e.touches ? e.touches[0] : e,
            el = first.target;

        // if touching a link, highlight it
        if (L.Browser.touch && el.tagName.toLowerCase() === 'a') {
                L.DomUtil.addClass(el, 'leaflet-active');
        }

        this._moved = false;

        if (this._moving) { return; }

        this._startPoint = new L.Point(first.clientX, first.clientY);
        this._startPos = this._newPos = L.DomUtil.getPosition(this._element);

        L.DomEvent
            .on(document, L.Draggable.MOVE[e.type], this._onMove, this)
            .on(document, L.Draggable.END[e.type], this._onUp, this);
    };
};