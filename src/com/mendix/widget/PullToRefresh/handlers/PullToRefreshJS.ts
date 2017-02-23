
interface SettingOptions { // TODO: Pick one... settings or options hehehe
    distThreshold: number; //TODO: What's dist?
    distMax: number;
    distReload: number;
    mainElement: HTMLElement;
    triggerElement: HTMLElement;
    ptrElement: HTMLElement; // TODO: rename
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
let eventsSetUp: boolean; // TODO: I get the purpose of the global, but seems better to create the events on widget creation
// TODO: and destroy them on destruction

export class PullToRefreshJS {
    private settings: SettingOptions;
    private pullStartY: number;
    private pullMoveY: number;
    private dist = 0;
    private distResisted = 0;
    private state = "pending";
    private _setup: boolean; // TODO: why the _ ?
    private _enable: boolean;
    private _timeout: number;

    constructor() {
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onReset = this.onReset.bind(this);
    }

    // TODO: Why? This is what the constructor is for... initializing
    init(params: { ptrElement: HTMLElement, onRefresh: () => void, mainElement: HTMLElement }) {
        this.settings = {
            distThreshold: 80,
            distMax: 150,
            distReload: 50,
            mainElement: document.body, // TODO: And here's document.body... so what is the point of mainElement?
            triggerElement: document.body,
            ptrElement: params.ptrElement,
            classPrefix: "ptr--", // TODO: Sucks
            cssProp: "min-height",
            iconArrow: "&#8675;",
            iconRefreshing: "&hellip;",
            instructionsPullToRefresh: "Pull to refresh", // TODO: hmm maybe pullToRefreshText? Better, no?
            instructionsReleaseToRefresh: "Release to refresh", // TODO: Check above
            instructionsRefreshing: "Refreshing", // TODO: Check above
            refreshTimeout: 500,
            onInit: () => { },
            onRefresh: params.onRefresh, // TODO: inline here what u added in updateRendering
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

        const iconEl = ptrElement.querySelector(`.${classPrefix}icon`); // TODO: conventional naming
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
        // TODO: Why not dojolize all this?
        ptrElement.classList.remove(`${classPrefix}refresh`);
        ptrElement.style[cssProp as any] = "0px";

        this.state = "pending";
    }

    private onTouchStart(event: TouchEvent) {
        const { triggerElement } = this.settings;

        if (!window.scrollY) { // TODO: will always be 0 since the window is rarely scrolled
            this.pullStartY = event.touches[0].screenY;
        }

        if (this.state !== "pending") { // TODO: Why not have this at the top
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
        } = this.settings; // TODO: Can fit on one line

        if (!this.pullStartY) { // TODO: What are the odds of this happening?
            if (!window.scrollY) { // TODO: Will always be true as far as I can see
                this.pullStartY = event.touches[0].screenY;
            }
        } else {
            this.pullMoveY = event.touches[0].screenY;
        }

        if (!this._enable || this.state === "refreshing") {
            if (!window.scrollY && this.pullStartY < this.pullMoveY) { // TODO: Don't think it'll ever be true
                event.preventDefault();
            }

            return;
        }

        if (this.state === "pending") {
            ptrElement.classList.add(`${classPrefix}pull`);
            this.state = "pulling";
            this.update();
        }
        // TODO: If the above is true, why let it continue after this point? Maybe do if...else not sure

        if (this.pullStartY && this.pullMoveY) {
            this.dist = this.pullMoveY - this.pullStartY; // TODO: Wonder what this dist thing means... distance?
        }

        if (this.dist > 0) {
            event.preventDefault();
            ptrElement.style[cssProp as any] = `${this.distResisted}px`; // TODO: Please dojolize, if u want
            this.distResisted = resistanceFunction(this.dist / distThreshold)
                * Math.min(distMax, this.dist);

            if (this.state === "pulling" && this.distResisted > distThreshold) {
                ptrElement.classList.add(`${classPrefix}release`);
                this.state = "releasing";
                this.update();
            }
            // TODO: maybe if...else cos I don't think both can be true
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
        } = this.settings; // TODO: inline

        if (this.state === "releasing" && this.distResisted > distThreshold) {
            this.state = "refreshing";

            ptrElement.style[cssProp as any] = `${distReload}px`;
            ptrElement.classList.add(`${classPrefix}refresh`);

            this._timeout = setTimeout(() => {
                const retval = onRefresh(this.onReset); // TODO: it's like u copied these names from the lib

                if (retval && typeof retval.then === "function") { // Promises
                    retval.then(() => this.onReset()); // TODO: onRefresh doesn't return a promise, so why the then??
                }

                if (!retval && !onRefresh.length) {
                    this.onReset();
                }
            }, refreshTimeout); // TODO: Why the fresh timeout?
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
