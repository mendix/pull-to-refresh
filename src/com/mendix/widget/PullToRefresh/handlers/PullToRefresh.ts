interface PullToRefreshOptions {
    contentEl?: HTMLElement | null;
    ptrEl: HTMLElement | null;
    bodyEl?: HTMLElement;
    distanceToRefresh: number;
    loadingFunction: Function;
    resistance: number;
}

export class PullToRefresh {
    private options: PullToRefreshOptions;
    private bodyEl: HTMLElement;
    private pan = {
        distance: 0,
        enabled: false,
        startingPositionY: 0
    };
    private bodyClass: DOMTokenList;

    private firstTouch: {
        pageX: number,
        pageY: number
    } = { pageX: 0, pageY: 0 };

    private lastTouch: {
        pageX: number,
        pageY: number
    } = { pageX: 0, pageY: 0 };

    private activeGesture: string | null = null;

    constructor() {
        this.HandlePanDown = this.HandlePanDown.bind(this);
        this.HandlePanEnd = this.HandlePanEnd.bind(this);
        this.HandlePanUp = this.HandlePanUp.bind(this);

        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    init(params: { bodyEl: HTMLElement, loadingFunction: Function, resistance?: number }) {
        window.document.addEventListener("touchstart", this.handleTouchStart, { passive: true } as any);
        window.document.addEventListener("touchmove", this.handleTouchMove, { passive: true } as any);
        window.document.addEventListener("touchend", this.handleTouchEnd);
        window.document.addEventListener("touchcancel", this.handleTouchEnd);

        this.bodyEl = params.bodyEl;
        this.bodyClass = this.bodyEl.classList;
        this.options = {
            bodyEl: params.bodyEl,
            contentEl: document.getElementsByClassName("mx-page")[0] as any,
            distanceToRefresh: 40,
            loadingFunction: params.loadingFunction,
            ptrEl: document.getElementById("widget-pull-to-refresh"),
            resistance: 2.5
        };
        if (!this.options.contentEl || !this.options.ptrEl) {
            return;
        }

        this.bodyClass = this.bodyEl.classList;

        this.options.contentEl.addEventListener("panup", this.HandlePanUp);
        this.options.contentEl.addEventListener("pandown", this.HandlePanDown);
        this.options.contentEl.addEventListener("pandownend", this.HandlePanEnd);
    }

    private handleTouchStart(e: any) {
        if (e.touches.length !== 1) {
            return;
        }
        this.firstTouch = {
            pageX: e.touches[0].pageX,
            pageY: e.touches[0].pageY
        };
        this.panStart();
    }

    private handleTouchMove(e: any) {
        const touch = e.touches[0];
        this.lastTouch = {
            pageX: touch.pageX,
            pageY: touch.pageY
        };

        if (this.activeGesture === null && this.firstTouch) {
            this.activeGesture = this.detectGesture();
        }

        if (this.activeGesture) {
            this.fireEvent(e.type, e.target);
        }
    }

    private handleTouchEnd(e: Event): void {
        if (this.activeGesture) {
            this.fireEvent(e.type, e.target);
        }

        this.activeGesture = null;
        this.firstTouch = { pageX: 0, pageY: 0 };
    }

    private detectGesture() {
        const deltaX = Math.abs(this.lastTouch.pageX - this.firstTouch.pageX);
        const deltaY = Math.abs(this.lastTouch.pageY - this.firstTouch.pageY);

        if (deltaY <= 40 && deltaX > 40) {
            return "horizontal";
        }

        if (deltaX <= 40 && deltaY > 40) {
            return "vertical";
        }

        return null;
    }

    private fireEvent(sourceEventType: any, target: any) {
        const direction = this.activeGesture === "horizontal"
            ? this.lastTouch.pageX > this.firstTouch.pageX ? "right" : "left"
            : this.lastTouch.pageY > this.firstTouch.pageY ? "down" : "up";

        let eventType = "";
        if (sourceEventType === "touchend") {
            eventType = "end";
        } else if (sourceEventType === "touchcancel") {
            eventType = "cancel";
        }

        const eventName = "pan" + direction + eventType;
        const event = new CustomEvent(eventName, {
            bubbles: true,
            detail: {
                originPageX: this.firstTouch.pageX,
                originPageY: this.firstTouch.pageY,
                pageX: this.lastTouch.pageX,
                pageY: this.lastTouch.pageY
            }
        });

        target.dispatchEvent(event);
    }


    private HandlePanUp(e: any) {
        e.preventDefault();
        if (!this.pan.enabled || this.pan.distance === 0) {
            return;
        }
        const eventDistance = this.lastTouch.pageY - this.firstTouch.pageY;
        if (this.pan.distance < eventDistance / this.options.resistance) {
            this.pan.distance = 0;
        } else {
            this.pan.distance = eventDistance / this.options.resistance;
        }

        this.setContentPan();
        this.setBodyClass();
    }

    private HandlePanDown(event: Event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!this.pan.enabled) {
            return;
        }
        const eventDistance = this.lastTouch.pageY - this.firstTouch.pageY;
        this.pan.distance = eventDistance / this.options.resistance;

        this.setContentPan();
        this.setBodyClass();
    }

    private HandlePanEnd(event: Event) {
        event.preventDefault();
        if (!this.pan.enabled) {
            return;
        }
        // TODO: validation so if contentID or ptrID elements are missing from the document
        if (this.options.contentEl && this.options.ptrEl) {
            this.options.ptrEl.style.transform = this.options.ptrEl.style.webkitTransform = "";
        }
        if (this.bodyEl.classList.contains("widget-pull-to-refresh-refresh")) {
            this.doLoading();
        } else {
            this.doReset();
        }

        this.pan.distance = 0;
        this.pan.enabled = false;
    }

    private panStart() {
        this.pan.startingPositionY = this.bodyEl.scrollTop;

        if (this.pan.startingPositionY === 0) {
            this.pan.enabled = true;
        }
    }

    private setContentPan() {
        if (this.options.contentEl && this.options.ptrEl) {
            this.options.ptrEl.style.transform = this.options.ptrEl.style.webkitTransform = "translate3d( 0, " +
                (this.pan.distance - this.options.ptrEl.offsetHeight) + "px, 0 )";

        }
    }

    private setBodyClass() {
        if (this.pan.distance > this.options.distanceToRefresh) {
            this.bodyClass.add("widget-pull-to-refresh-refresh");
        } else {
            this.bodyClass.remove("widget-pull-to-refresh-refresh");
        }
    }

    private doLoading() {
        this.bodyClass.add("widget-pull-to-refresh-loading");
        if (!this.options.loadingFunction) {
            return this.doReset();
        }
        setTimeout(() => {
            const promise = this.options.loadingFunction();
            promise.then(this.doReset);
        }, 1000);
    }

    private doReset() {
        this.bodyClass.remove("widget-pull-to-refresh-loading");
        this.bodyClass.remove("widget-pull-to-refresh-refresh");
        this.bodyClass.add("widget-pull-to-refresh-reset");

        this.bodyEl.addEventListener("transitionend", this.bodyClassRemove, false);
    }

    private bodyClassRemove() {
        if (this.bodyClass) {
            this.bodyClass.remove("widget-pull-to-refresh-reset");
            this.bodyEl.removeEventListener("transitionend", this.bodyClassRemove, false);
        }
    }
}
