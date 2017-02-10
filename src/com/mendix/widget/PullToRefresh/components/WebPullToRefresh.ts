import * as Hammer from "hammerjs";

interface WebPullToRefreshOptions {
    contentEl?: HTMLElement | null;
    ptrEl: HTMLElement | null;
    bodyEl?: HTMLElement;
    distanceToRefresh: number;
    loadingFunction: Function;
    resistance: number;
    hammerOptions?: any;
}

export class WebPullToRefresh {
    private defaults: WebPullToRefreshOptions;
    private options: WebPullToRefreshOptions;
    private bodyEl: HTMLElement;
    private pan = {
        distance: 0,
        enabled: false,
        startingPositionY: 0
    };
    private bodyClass: DOMTokenList;

    constructor() {
        this.panStart = this.panStart.bind(this);
        this.panDown = this.panDown.bind(this);
        this._panUp = this._panUp.bind(this);
        this._panEnd = this._panEnd.bind(this);
        this.defaults = {
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
    }

    init(params: { bodyEl: HTMLElement, loadingFunction: Function, hammerOptions?: Object, resistance?: number }) {
        this.bodyEl = params.bodyEl;
        this.bodyClass = this.bodyEl.classList;
        this.options = {
            bodyEl: params.bodyEl,
            contentEl: document.getElementById("content"),
            distanceToRefresh: 70,
            hammerOptions: {},
            loadingFunction: params.loadingFunction,
            ptrEl: document.getElementById("ptr"),
            resistance: 2.5
        };
        if (!this.options.contentEl || !this.options.ptrEl) {
            return;
        }

        this.bodyClass = this.bodyEl.classList;

        const hammer = new Hammer(this.options.contentEl, this.options.hammerOptions);

        hammer.get("pan").set({ direction: Hammer.DIRECTION_VERTICAL });

        hammer.on("panstart", this.panStart);
        hammer.on("pandown", this.panDown);
        hammer.on("panup", this._panUp);
        hammer.on("panend", this._panEnd);
    }

    private panStart() {
        this.pan.startingPositionY = this.bodyEl.scrollTop;

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
            this.options.contentEl.style.transform = this.options.contentEl.style.webkitTransform = "translate3d( 0, "
                + this.pan.distance + "px, 0 )";
            this.options.ptrEl.style.transform = this.options.ptrEl.style.webkitTransform = "translate3d( 0, "
                + (this.pan.distance - this.options.ptrEl.offsetHeight) + "px, 0 )";
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
        // TODO: validation so if contentID or ptrID elements are missing from the document
        if (this.options.contentEl && this.options.ptrEl) {
            this.options.contentEl.style.transform = this.options.contentEl.style.webkitTransform = "";
            this.options.ptrEl.style.transform = this.options.ptrEl.style.webkitTransform = "";
        }
        if (this.bodyEl.classList.contains("ptr-refresh")) {
            this._doLoading();
        } else {
            this._doReset();
        }

        this.pan.distance = 0;
        this.pan.enabled = false;
    }

    private _doLoading() {
        this.bodyClass.add("ptr-loading");
        if (!this.options.loadingFunction) {
            return this._doReset();
        }
        setTimeout(() => {
            const promise = this.options.loadingFunction();
            promise.then(this._doReset);
        }, 1000);
    }

    private _doReset() {
        this.bodyClass.remove("ptr-loading");
        this.bodyClass.remove("ptr-refresh");
        this.bodyClass.add("ptr-reset");

        this.bodyEl.addEventListener("transitionend", this.bodyClassRemove, false);
    }

    private bodyClassRemove() {
        if (this.bodyClass) {
            this.bodyClass.remove("ptr-reset");
            this.bodyEl.removeEventListener("transitionend", this.bodyClassRemove, false);
        }
    }
}
