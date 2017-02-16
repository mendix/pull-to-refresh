import { RegisterEvents } from "./RegisterEvents";

interface PullToRefreshOptions {
    contentElement?: HTMLElement | null;
    pullElement: HTMLElement | null;
    distanceToRefresh: number;
    loadingFunction: Function;
    resistance: number;
    offsetHeight?: number;
    pullTextElement?: HTMLElement | null;
}

export class PullToRefresh {
    private options: PullToRefreshOptions;
    private bodyElement: HTMLElement;
    private registerEvents: RegisterEvents;
    private pan = {
        distance: 0,
        enabled: false,
        startingPositionY: 0
    };
    private bodyClass: DOMTokenList;

    constructor() {
        this.HandlePanDown = this.HandlePanDown.bind(this);
        this.HandlePanEnd = this.HandlePanEnd.bind(this);
        this.HandlePanUp = this.HandlePanUp.bind(this);
    }

    init(params: { bodyElement: HTMLElement, loadingFunction: Function, resistance?: number }) {
        this.registerEvents = new RegisterEvents();
        this.bodyElement = params.bodyElement;
        this.bodyClass = this.bodyElement.classList;
        this.options = {
            contentElement: document.getElementsByClassName("mx-page")[0] as HTMLElement,
            distanceToRefresh: 70,
            loadingFunction: params.loadingFunction,
            pullElement: document.getElementById("widget-pull-to-refresh"),
            pullTextElement: document.getElementById("widget-pull-to-refresh-text"),
            resistance: 2.5
        };
        if (!this.options.contentElement || !this.options.pullElement) {
            return;
        }

        this.bodyClass = this.bodyElement.classList;

        this.options.contentElement.addEventListener("panup", this.HandlePanUp);
        this.options.contentElement.addEventListener("pandown", this.HandlePanDown);
        this.options.contentElement.addEventListener("pandownend", this.HandlePanEnd);

        this.panStart();
    }

    private HandlePanUp(e: CustomEvent) {
        e.preventDefault();
        if (!this.pan.enabled || this.pan.distance === 0) {
            return;
        }
        const eventDistance = this.registerEvents.touchEndY - this.registerEvents.touchStart.pageY;
        if (this.pan.distance < eventDistance / this.options.resistance) {
            this.pan.distance = 0;
        } else {
            this.pan.distance = eventDistance / this.options.resistance;
        }

        this.setContentPan();
        this.setBodyClass();
    }

    private HandlePanDown(event: TouchEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!this.pan.enabled) {
            return;
        }
        const eventDistance = this.registerEvents.touchEndY - this.registerEvents.touchStart.pageY;
        this.pan.distance = eventDistance / this.options.resistance;

        this.setContentPan();
        this.setBodyClass();
    }

    private HandlePanEnd() {
        if (!this.pan.enabled) {
            return;
        }
        if (this.options.pullElement) {
            this.options.pullElement.style.transform = this.options.pullElement.style.webkitTransform = "";
        }
        if (this.bodyElement.classList.contains("widget-pull-to-refresh-refresh")) {
            this.doLoading();
        } else {
            this.doReset();
        }

        this.pan.distance = 0;
        this.pan.enabled = false;
    }

    private panStart() {
        this.pan.startingPositionY = this.bodyElement.scrollTop;

        if (this.pan.startingPositionY === 0) {
            this.pan.enabled = true;
            this.options.offsetHeight = this.options.pullElement ? this.options.pullElement.offsetHeight : 0;
        }
    }

    private setContentPan() {
        if (this.options.contentElement && this.options.pullElement) {
            this.options.pullElement.style.transform = this.options.pullElement.style.webkitTransform =
                "translate3d( 0, " + this.pan.distance + "px, 0 )";
        }
        if (this.options.pullTextElement) {
            this.options.pullTextElement.innerHTML = this.pan.distance > this.options.distanceToRefresh
                ? "Release to refresh"
                : "Pull to refresh";
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
        if (this.options.contentElement) {
            this.options.contentElement.removeEventListener("panup", this.HandlePanUp);
            this.options.contentElement.removeEventListener("pandown", this.HandlePanDown);
            this.options.contentElement.removeEventListener("pandownend", this.HandlePanEnd);
        }
    // this.bodyElement.addEventListener("transitionend", this.bodyClassRemove, false);
}

    // private bodyClassRemove() {
    //     if (this.bodyClass) {
    //         this.bodyClass.remove("widget-pull-to-refresh-reset");
    //         this.bodyElement.removeEventListener("transitionend", this.bodyClassRemove, false);
    //     }
    // }
}
