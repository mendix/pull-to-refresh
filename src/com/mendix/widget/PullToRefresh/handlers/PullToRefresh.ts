import * as domClass from "dojo/dom-class";
import * as domStyle from "dojo/dom-style";

interface Settings {
    thresholdDistance: number;
    maximumDistance: number;
    reloadDistance: number;
    mainElement: HTMLElement;
    triggerElement: HTMLElement;
    pullToRefreshElement: HTMLElement;
    classPrefix: string;
    cssProp: string;
    iconArrow: string;
    iconRefreshing: string;
    pullToRefreshText: string;
    releaseToRefreshText: string;
    refreshText: string;
    refreshTimeout: number;
    onRefresh: ((value: Function) => Promise<void>) | ((value: Function) => void);
    resistanceFunction: (value: number) => number;
}

export class PullToRefresh {
    private settings: Settings;
    private pullStart: {
        screenX: number;
        screenY: number;
    };
    private pullMoveY: number;
    private distance = 0;
    private distanceResisted = 0;
    private state: "pending" | "pulling" | "releasing" | "refreshing" | "scrolling";
    private setup: boolean;
    private enable: boolean;
    private timeout: number;
    private updating: boolean;
    private lastDistance = 0;

    constructor(params: { pullToRefreshElement: HTMLElement, mainElement: HTMLElement }) {
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onReset = this.onReset.bind(this);

        this.settings = {
            classPrefix: "pull-to-refresh-",
            cssProp: "min-height",
            iconArrow: "&#8675;",
            iconRefreshing: "&hellip;",
            mainElement: params.mainElement,
            maximumDistance: 150,
            onRefresh: () => { mx.ui.reload(); },
            pullToRefreshElement: params.pullToRefreshElement,
            pullToRefreshText: "Pull to refresh",
            refreshText: "Refreshing",
            refreshTimeout: 500,
            releaseToRefreshText: "Release to refresh",
            reloadDistance: 50,
            resistanceFunction: (distance) => Math.min(1, distance / 2.5),
            thresholdDistance: 80,
            triggerElement: params.mainElement
        };
        this.state = "pending";
        this.pullStart = { screenX: 0, screenY: 0 };
    }

    setupEvents() {
        window.addEventListener("touchstart", this.onTouchStart);
        window.addEventListener("touchend", this.onTouchEnd);
        (window.addEventListener as WhatWGAddEventListener)("touchmove", this.onTouchMove, { passive: false });
        this.setup = true;
    }

    removeEvents() {
        window.removeEventListener("touchstart", this.onTouchStart);
        window.removeEventListener("touchend", this.onTouchEnd);
        (window.removeEventListener as WhatWGAddEventListener)("touchmove", this.onTouchMove, { passive: false });
        this.setup = false;
    }

    private update() {
        const {
            classPrefix,
            pullToRefreshElement,
            iconArrow,
            iconRefreshing,
            refreshText,
            pullToRefreshText,
            releaseToRefreshText
        } = this.settings;

        const iconElement = pullToRefreshElement.querySelector(`.${classPrefix}icon`);
        const textElement = pullToRefreshElement.querySelector(`.${classPrefix}text`);
        if (iconElement && textElement) {
            if (this.state === "refreshing") {
                iconElement.innerHTML = iconRefreshing;
                textElement.innerHTML = refreshText;
            } else {
                iconElement.innerHTML = iconArrow;
            }
            if (this.state === "releasing") {
                textElement.innerHTML = releaseToRefreshText;
            }
            if (this.state === "pulling" || this.state === "pending") {
                textElement.innerHTML = pullToRefreshText;
            }
        }
    }

    private onReset() {
        const { cssProp, pullToRefreshElement, classPrefix } = this.settings;
        domClass.remove(pullToRefreshElement.id, `${classPrefix}refresh`);
        domStyle.set(pullToRefreshElement, cssProp, "0px");

        this.state = "pending";
    }

    private onTouchStart(event: TouchEvent) {
        if (this.state !== "pending") return;
        if (this.isScrollActive(event.target as HTMLElement)) {
            this.state = "scrolling";
            return;
        }

        clearTimeout(this.timeout);

        this.pullStart.screenX = event.touches[0].screenX;
        this.pullStart.screenY = event.touches[0].screenY;
        this.enable = this.settings.triggerElement.contains(event.target as Node);
        this.state = "pending";
        this.lastDistance = 0;
        this.update();
    }

    private onTouchMove(event: TouchEvent) {
        const { pullToRefreshElement, maximumDistance, thresholdDistance, cssProp, classPrefix } = this.settings;
        const touch = event.touches[0];
        const touchElement = document.elementFromPoint(touch.clientX, touch.clientY);
        this.pullMoveY = event.touches[0].screenY;

        if (!this.enable || this.state === "refreshing" || this.updating || this.state === "scrolling") return;

        if (this.isScrollActive(touchElement as HTMLElement)) return;

        if (this.state === "pending") {
            domClass.add(pullToRefreshElement.id, `${classPrefix}pull`);
            this.state = "pulling";
            this.update();
        }
        if (this.pullStart.screenY && this.pullMoveY) {
            this.distance = this.pullMoveY - this.pullStart.screenY;
        }
        if (this.distance > 0 && Math.abs(this.lastDistance - this.distance) > 1) {
            this.lastDistance = this.distance;
            event.preventDefault();
            domStyle.set(pullToRefreshElement, cssProp, `${this.distanceResisted}px`);
            this.distanceResisted = this.settings.resistanceFunction(this.distance / thresholdDistance)
                * Math.min(maximumDistance, this.distance);

            if (this.state === "pulling" && this.distanceResisted > thresholdDistance) {
                domClass.add(pullToRefreshElement.id, `${classPrefix}release`);
                this.state = "releasing";
                this.update();
            }

            if (this.state === "releasing" && this.distanceResisted < thresholdDistance) {
                domClass.remove(pullToRefreshElement.id, `${classPrefix}release`);
                this.state = "pulling";
                this.update();
            }
        }
    }

    private onTouchEnd() {
        const { pullToRefreshElement, onRefresh, cssProp, classPrefix } = this.settings;

        if (this.state === "releasing" && this.distanceResisted > this.settings.thresholdDistance) {
            this.state = "refreshing";

            domStyle.set(pullToRefreshElement, cssProp, `${this.settings.reloadDistance}px`);
            domClass.add(pullToRefreshElement.id, `${classPrefix}refresh`);

            this.timeout = setTimeout(() => {
                const afterRefresh = onRefresh(this.onReset);
                if (afterRefresh && typeof afterRefresh.then === "function") {
                    afterRefresh.then(() => this.onReset());
                }
                if (!afterRefresh && !onRefresh.length) {
                    this.onReset();
                }
            }, this.settings.refreshTimeout);
        } else {
            if (this.state === "refreshing") return;

            domStyle.set(pullToRefreshElement, cssProp, "0px");
            this.state = "pending";
        }

        this.update();
        domClass.remove(pullToRefreshElement.id, `${classPrefix}release ${classPrefix}pull`);
        this.pullStart.screenY = this.pullStart.screenX = this.pullMoveY = 0;
        this.distance = this.distanceResisted = 0;
    }

    private isScrollActive(element: HTMLElement | null): boolean {
        if (element === null) {
            return false;
        }
        if (element.scrollTop > 5 ) {
            return true;
        } else {
            return this.isScrollActive(element.parentNode as HTMLElement);
        }
    }
}
