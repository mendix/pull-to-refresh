export class RegisterEvents {
    touchStart = { pageX: 0, pageY: 0 };
    touchEndY = 0;
    private verticalGestureEnabled: boolean;

    constructor() {
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        window.document.addEventListener("touchstart", this.handleTouchStart);
        window.document.addEventListener("touchmove", this.handleTouchMove);
        window.document.addEventListener("touchend", this.handleTouchEnd);
        window.document.addEventListener("touchcancel", this.handleTouchEnd);
    }

    private handleTouchStart(event: TouchEvent) {
        if (event.touches.length !== 1) {
            return;
        }
        this.touchStart = event.touches[0];
    }

    private handleTouchMove(event: TouchEvent) {
        event.preventDefault();
        this.touchEndY = event.touches[0].pageY;

        if (!this.verticalGestureEnabled) {
            this.verticalGestureEnabled = this.verticalGesture(event.touches[0]);
        }
        if (this.verticalGestureEnabled) {
            this.fireEvent(event);
        }
    }

    private handleTouchEnd(event: TouchEvent) {
        if (this.verticalGestureEnabled) {
            this.fireEvent(event);
            this.verticalGestureEnabled = false;
            this.touchStart = { pageX: 0, pageY: 0 };
            this.destroy();
        }
    }

    private verticalGesture(touch: Touch) {
        const deltaX = Math.abs(touch.pageX - this.touchStart.pageX);
        const deltaY = Math.abs(touch.pageY - this.touchStart.pageY);

        return (deltaX <= 40 && deltaY > 40);
    }

    private fireEvent(event: TouchEvent) {
        if (!this.verticalGestureEnabled) {
            return;
        }

        const { type, target } = event;
        const currentTouch = event.touches[0];
        const direction = currentTouch && currentTouch.pageY < this.touchStart.pageY ? "up" : "down";

        let eventName = `pan${direction}`;
        if (type === "touchend") {
            eventName += "end";
        } else if (type === "touchcancel") {
            eventName += "cancel";
        }

        const customEvent = new CustomEvent(eventName, {
            bubbles: true,
            detail: {
                originPageX: this.touchStart.pageX,
                originPageY: this.touchStart.pageY,
                pageX: currentTouch ? currentTouch.pageX : undefined,
                pageY: currentTouch ? currentTouch.pageY : undefined
            }
        });

        target.dispatchEvent(customEvent);
    }

    private destroy() {
        window.document.removeEventListener("touchstart", this.handleTouchStart);
        window.document.removeEventListener("touchmove", this.handleTouchMove);
        window.document.removeEventListener("touchend", this.handleTouchEnd);
        window.document.removeEventListener("touchcancel", this.handleTouchEnd);
    }
}
