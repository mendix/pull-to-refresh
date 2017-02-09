import * as Hammer from "hammerjs";


interface WebPullToRefreshOptions {
    contentEl?: HTMLElement | null;
    ptrEl: HTMLElement | null;
    bodyEl: HTMLElement;
    distanceToRefresh: number;
    loadingFunction: Function;
    resistance: number;
    hammerOptions?: any;
}

export class WebPullToRefresh {
    private defaults: WebPullToRefreshOptions;
    private options: WebPullToRefreshOptions;
    private pan = {
        distance: 0,
        enabled: false,
        startingPositionY: 0
    };
    private bodyClass = this.defaults.bodyEl.classList;

    constructor() {
        // TODO: REDO
        // const contentNode = document.getElementById("content");
        // const ptrElHtml = `<div id="ptr"><span class="glyphicon glyphicon-repeat"></span>
        //     <div class="loading"><span id="l1"></span><span id="l2"></span><span id="l3"></span></div></div>`;
        // const ptrElNew = (new DOMParser()).parseFromString(ptrElHtml, "text/html");
        // document.body.insertBefore(ptrElNew, contentNode);

        this.defaults = {
            bodyEl: document.body,
            contentEl: document.getElementById("content"),
            distanceToRefresh: 70,
            loadingFunction: () => null,
            ptrEl: document.getElementById("ptr"),
            resistance: 2.5
        };
        this.pan = {
            distance: 0,
            enabled: false,
            startingPositionY: 0
        };

        this.bodyClass = this.defaults.bodyEl.classList;
    }

    init(params: any) {
        this.options = {
            bodyEl: this.defaults.bodyEl,
            contentEl: document.getElementById("content"),
            distanceToRefresh: params.distanceToRefresh || this.defaults.distanceToRefresh,
            hammerOptions: params.hammerOptions || {},
            loadingFunction: params.loadingFunction || this.defaults.loadingFunction,
            ptrEl: document.getElementById("ptr"),
            resistance: params.resistance || this.defaults.resistance
        };
        if (!this.options.contentEl || !this.options.ptrEl) {
            return;
        }

        this.bodyClass = this.options.bodyEl.classList;

        const hammer = new Hammer(this.options.contentEl, this.options.hammerOptions);

        hammer.get("pan").set({ direction: Hammer.DIRECTION_VERTICAL });

        hammer.on("panstart", this.panStart);
        hammer.on("pandown", this.panDown);
        hammer.on("panup", this._panUp);
        hammer.on("panend", this._panEnd);
    }

    private panStart() {
        this.pan.startingPositionY = this.options.bodyEl.scrollTop;

        if (this.pan.startingPositionY === 0) {
            this.pan.enabled = true;
        }
    }

    private panDown(event: HammerInput) {
        if (!this.pan.enabled) {
            return;
        }

        event.preventDefault();
        this.pan.distance = event.distance / this.options.resistance;

        this._setContentPan();
        this._setBodyClass();
    }

    private _panUp(e: HammerInput) {
        if (!this.pan.enabled || this.pan.distance === 0) {
            return;
        }

        e.preventDefault();

        if (this.pan.distance < e.distance / this.options.resistance) {
            this.pan.distance = 0;
        } else {
            this.pan.distance = e.distance / this.options.resistance;
        }

        this._setContentPan();
        this._setBodyClass();
    }

    private _setContentPan() {
        if (this.options.contentEl && this.options.ptrEl) {
            this.options.contentEl.style.transform = this.options.contentEl.style.webkitTransform = "translate3d( 0, " + this.pan.distance + "px, 0 )";
            this.options.ptrEl.style.transform = this.options.ptrEl.style.webkitTransform = "translate3d( 0, " + (this.pan.distance - this.options.ptrEl.offsetHeight) + "px, 0 )";
        }
    }

    private _setBodyClass() {
        if (this.pan.distance > this.options.distanceToRefresh) {
            this.bodyClass.add("ptr-refresh");
        } else {
            this.bodyClass.remove("ptr-refresh");
        }
    }

    private _panEnd(event: HammerInput) {
        if (!this.pan.enabled) {
            return;
        }

        event.preventDefault();
        if (this.options.contentEl && this.options.ptrEl) { // TODO: validation so if contentID or ptrID elements are missing from the document
            this.options.contentEl.style.transform = this.options.contentEl.style.webkitTransform = "";
            this.options.ptrEl.style.transform = this.options.ptrEl.style.webkitTransform = "";
        }

        if (this.options.bodyEl.classList.contains("ptr-refresh")) {
            this._doLoading();
        } else {
            this._doReset();
        }

        this.pan.distance = 0;
        this.pan.enabled = false;
    }

    private _doLoading() {
        this.bodyClass.add("ptr-loading");

        // If no valid loading function exists, just reset elements
        if (!this.options.loadingFunction) {
            return this._doReset();
        }

        // For UX continuity, make sure we show loading for at least one second before resetting
        setTimeout(
            // Once actual loading is complete, reset pull to refresh
            this.options.loadingFunction().then(this._doReset)
            , 1000);
    }

    private _doReset() {
        this.bodyClass.remove("ptr-loading");
        this.bodyClass.remove("ptr-refresh");
        this.bodyClass.add("ptr-reset");

        this.options.bodyEl.addEventListener("transitionend", this.bodyClassRemove, false);
    }

    private bodyClassRemove() {
        this.bodyClass.remove("ptr-reset");
        this.options.bodyEl.removeEventListener("transitionend", this.bodyClassRemove, false);
    }


}
