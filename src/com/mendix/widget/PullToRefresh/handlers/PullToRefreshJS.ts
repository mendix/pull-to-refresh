
/* eslint-disable import/no-unresolved */
import * as domConstruct from "dojo/dom-construct";

interface SettingOptions {
    distThreshold: number;
    distMax: number;
    distReload: number;
    mainElement: HTMLElement;
    triggerElement: HTMLElement;
    ptrElement: HTMLElement;
    classPrefix: string;
    cssProp: string;
    iconArrow: string;
    iconRefreshing: string;
    instructionsPullToRefresh: string;
    instructionsReleaseToRefresh: string;
    instructionsRefreshing: string;
    refreshTimeout: number;
    onInit: () => void;
    onRefresh: ((value: Function) => Promise<void>) | ((value: Function) => void);
    resistanceFunction: (value: number) => number;
}
let eventsSetUp: boolean;

export class PullToRefreshJS {
    private settings: SettingOptions;
    private pullStartY: number;
    private pullMoveY: number;
    private dist = 0;
    private distResisted = 0;
    private state = "pending";
    private _setup: boolean;
    private _enable: boolean;
    private _timeout: number;

    constructor() {
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onReset = this.onReset.bind(this);
    }

    init(params: { ptrElement: HTMLElement, onRefresh: () => void, mainElement: HTMLElement }) {
        this.settings = {
            distThreshold: 80,
            distMax: 200,
            distReload: 50,
            mainElement: document.body,
            triggerElement: document.body,
            ptrElement: params.ptrElement,
            classPrefix: "ptr--",
            cssProp: "min-height",
            iconArrow: "&#8675;",
            iconRefreshing: "&hellip;",
            instructionsPullToRefresh: "Pull to refresh",
            instructionsReleaseToRefresh: "Release to refresh",
            instructionsRefreshing: "Refreshing",
            refreshTimeout: 500,
            onInit: () => { },
            onRefresh: params.onRefresh,
            resistanceFunction: (distance) => Math.min(1, distance / 2.5)
        };
        if (!eventsSetUp) {
            this.removeEvents();
            this.setupEvents();
            eventsSetUp = true;
        }
    }

    private update() {
        const {
            classPrefix,
            ptrElement,
            iconArrow,
            iconRefreshing,
            instructionsRefreshing,
            instructionsPullToRefresh,
            instructionsReleaseToRefresh
        } = this.settings;

        const iconEl = ptrElement.querySelector(`.${classPrefix}icon`);
        const textEl = ptrElement.querySelector(`.${classPrefix}text`);
        if (iconEl) {
            if (this.state === "refreshing") {
                iconEl.innerHTML = iconRefreshing;
            } else {
                iconEl.innerHTML = iconArrow;
            }
        }
        if (textEl) {
            if (this.state === "releasing") {
                textEl.innerHTML = instructionsReleaseToRefresh;
            }

            if (this.state === "pulling" || this.state === "pending") {
                textEl.innerHTML = instructionsPullToRefresh;
            }

            if (this.state === "refreshing") {
                textEl.innerHTML = instructionsRefreshing;
            }
        }
    }

    private onReset() {
        const { cssProp, ptrElement, classPrefix } = this.settings;

        ptrElement.classList.remove(`${classPrefix}refresh`);
        ptrElement.style[cssProp as any] = "0px";

        this.state = "pending";
    }

    private onTouchStart(event: TouchEvent) {
        const { triggerElement } = this.settings;

        if (!window.scrollY) {
            this.pullStartY = event.touches[0].screenY;
        }

        if (this.state !== "pending") {
            return;
        }

        clearTimeout(this._timeout);

        this._enable = triggerElement.contains(event.target as Node);
        this.state = "pending";
        this.update();
    }

    private onTouchMove(event: TouchEvent) {
        const {
            ptrElement, resistanceFunction, distMax, distThreshold, cssProp, classPrefix
        } = this.settings;

        if (!this.pullStartY) {
            if (!window.scrollY) {
                this.pullStartY = event.touches[0].screenY;
            }
        } else {
            this.pullMoveY = event.touches[0].screenY;
        }

        if (!this._enable || this.state === "refreshing") {
            if (!window.scrollY && this.pullStartY < this.pullMoveY) {
                event.preventDefault();
            }

            return;
        }

        if (this.state === "pending") {
            ptrElement.classList.add(`${classPrefix}pull`);
            this.state = "pulling";
            this.update();
        }

        if (this.pullStartY && this.pullMoveY) {
            this.dist = this.pullMoveY - this.pullStartY;
        }

        if (this.dist > 0) {
            event.preventDefault();

            ptrElement.style[cssProp as any] = `${this.distResisted}px`;

            this.distResisted = resistanceFunction(this.dist / distThreshold)
                * Math.min(distMax, this.dist);

            if (this.state === "pulling" && this.distResisted > distThreshold) {
                ptrElement.classList.add(`${classPrefix}release`);
                this.state = "releasing";
                this.update();
            }

            if (this.state === "releasing" && this.distResisted < distThreshold) {
                ptrElement.classList.remove(`${classPrefix}release`);
                this.state = "pulling";
                this.update();
            }
        }
    }

    private onTouchEnd() {
        const {
            ptrElement, onRefresh, refreshTimeout, distThreshold, distReload, cssProp, classPrefix
        } = this.settings;

        if (this.state === "releasing" && this.distResisted > distThreshold) {
            this.state = "refreshing";

            ptrElement.style[cssProp as any] = `${distReload}px`;
            ptrElement.classList.add(`${classPrefix}refresh`);

            this._timeout = setTimeout(() => {
                const retval = onRefresh(this.onReset);

                if (retval && typeof retval.then === "function") { // Promises
                    retval.then(() => this.onReset());
                }

                if (!retval && !onRefresh.length) {
                    this.onReset();
                }
            }, refreshTimeout);
        } else {
            if (this.state === "refreshing") {
                return;
            }
            ptrElement.style[cssProp as any] = "0px";
            this.state = "pending";
        }

        this.update();

        ptrElement.classList.remove(`${classPrefix}release`);
        ptrElement.classList.remove(`${classPrefix}pull`);

        this.pullStartY = this.pullMoveY = 0;
        this.dist = this.distResisted = 0;
    }

    private setupEvents() {
        window.addEventListener("touchend", this.onTouchEnd);
        (window.addEventListener as WhatWGAddEventListener)("touchmove", this.onTouchMove, { passive: false });
        window.addEventListener("touchstart", this.onTouchStart);
        this._setup = true;
    }

    private removeEvents() {
        window.removeEventListener("touchstart", this.onTouchStart);
        window.removeEventListener("touchend", this.onTouchEnd);
        (window.removeEventListener as WhatWGAddEventListener)("touchmove", this.onTouchMove, { passive: false });
    }
}
