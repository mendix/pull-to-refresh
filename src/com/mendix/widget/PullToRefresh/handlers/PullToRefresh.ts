import * as domClass from "dojo/dom-class";

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
    iconElement: Element | null;
    iconRefreshing: string;
    pullToRefreshText: string;
    releaseToRefreshText: string;
    refreshText: string;
    onRefresh: (callback: () => void) => void;
    resistanceFunction: (value: number) => number;
    textElement: Element | null;
}
type State = "pending" | "pulling" | "releaseToRefresh" | "refreshing" | "scrolling";

interface Params {
    onRefresh: (callback: () => void) => void;
    mainElement: HTMLElement;
    pullToRefreshElement: HTMLElement;
    pullToRefreshText?: string;
    releaseToRefreshText?: string;
    refreshText?: string;
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
    private state: State;
    private enable: boolean;
    private lastDistance = 0;

    constructor(params: Params) {
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.resetDom = this.resetDom.bind(this);
        const classPrefix = "pull-to-refresh-";
        this.settings = {
            classPrefix,
            cssProp: "min-height",
            iconArrow: "&#8675;",
            iconElement: params.pullToRefreshElement.querySelector(`.${classPrefix}icon`),
            iconRefreshing: "&hellip;",
            mainElement: params.mainElement,
            maximumDistance: 150,
            onRefresh: params.onRefresh,
            pullToRefreshElement: params.pullToRefreshElement,
            pullToRefreshText: params.pullToRefreshText || "",
            refreshText: params.refreshText || "",
            releaseToRefreshText: params.releaseToRefreshText || "",
            reloadDistance: 50,
            resistanceFunction: (distance) => Math.min(1, distance / 2.5),
            textElement: params.pullToRefreshElement.querySelector(`.${classPrefix}text`),
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
    }

    removeEvents() {
        window.removeEventListener("touchstart", this.onTouchStart);
        window.removeEventListener("touchend", this.onTouchEnd);
        (window.removeEventListener as WhatWGAddEventListener)("touchmove", this.onTouchMove, { passive: false });
    }

    private update(nextState: State) {
        const { iconElement, textElement, pullToRefreshElement, classPrefix, iconRefreshing, iconArrow,
            refreshText, pullToRefreshText, releaseToRefreshText, reloadDistance } = this.settings;

        if (iconElement && textElement && nextState !== this.state ) {
            if (nextState === "refreshing") {
                pullToRefreshElement.style.minHeight = `${reloadDistance}px`;
                domClass.replace(pullToRefreshElement, `${classPrefix}refresh`, `${classPrefix}release`);
                iconElement.innerHTML = iconRefreshing;
                textElement.innerHTML = refreshText;
            } else {
                iconElement.innerHTML = iconArrow;
            }

            if (nextState === "releaseToRefresh") {
                domClass.add(pullToRefreshElement, `${classPrefix}release`);
                textElement.innerHTML = releaseToRefreshText;
            } else if (nextState === "pulling" || nextState === "pending") {
                textElement.innerHTML = pullToRefreshText;
            }
            if (nextState === "pulling") {
                domClass.replace(pullToRefreshElement, `${classPrefix}pull`, `${classPrefix}release`);
            }
        }
        this.state = nextState;
    }

    private onTouchStart(event: TouchEvent) {
        this.state = "pending";
        if (this.isScrollActive(event.target as HTMLElement)) {
            this.state = "scrolling";
            return;
        }

        this.pullStart.screenX = event.touches[0].screenX;
        this.pullStart.screenY = event.touches[0].screenY;
        this.enable = this.settings.triggerElement.contains(event.target as Node);
        this.lastDistance = 0;
        this.distanceResisted = 0;
        this.update("pending");
    }

    private onTouchMove(event: TouchEvent) {
        if (!this.enable || this.state === "refreshing" || this.state === "scrolling") return;
        const { pullToRefreshElement, maximumDistance, thresholdDistance } = this.settings;
        this.pullMoveY = event.touches[0].screenY;

        if (this.state === "pending") {
            this.update("pulling");
        }
        if (this.pullStart.screenY && this.pullMoveY) {
            this.distance = this.pullMoveY - this.pullStart.screenY;
        }
        if (this.distance > 0 && Math.abs(this.lastDistance - this.distance) > 1) {
            event.preventDefault();
            const distanceResisted = this.settings.resistanceFunction(this.distance / thresholdDistance)
                * Math.min(maximumDistance, this.distance);

            this.lastDistance = this.distance;
            if (this.distanceResisted !== distanceResisted) {
               pullToRefreshElement.style.minHeight = `${this.distanceResisted}px`;
            }
            if (this.state === "pulling" && distanceResisted > thresholdDistance) {
                this.update( "releaseToRefresh");
            }

            if (this.state === "releaseToRefresh" && distanceResisted < thresholdDistance) {
                this.update("pulling");
            }
            this.distanceResisted = distanceResisted;
        }
    }

    private onTouchEnd() {
        const { pullToRefreshElement, onRefresh, classPrefix } = this.settings;
        if (this.state === "releaseToRefresh") {

            pullToRefreshElement.style.minHeight = `${this.settings.reloadDistance}px`;
            domClass.add(pullToRefreshElement, `${classPrefix}refresh`);

            onRefresh(() => this.resetDom());
            this.update("refreshing");
        } else if (this.state === "refreshing") {
            return;
        } else {
            this.resetDom();
        }
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

    private resetDom() {
        const { pullToRefreshElement, classPrefix } = this.settings;
        domClass.remove(pullToRefreshElement, `${classPrefix}release ${classPrefix}pull ${classPrefix}refresh`);
        pullToRefreshElement.style.minHeight = "0px";
        this.pullStart = { screenY: 0, screenX: 0 };
        this.lastDistance = 0;
        this.distance = 0;
        this.distanceResisted = 0;
        this.pullMoveY = 0;
        this.state = "pending";
    }
}
