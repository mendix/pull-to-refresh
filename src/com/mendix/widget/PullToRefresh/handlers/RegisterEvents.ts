export class RegisterEvents {
    firstTouch: {
        pageX: number,
        pageY: number
    } = { pageX: 0, pageY: 0 };

    lastTouch: {
        pageX: number,
        pageY: number
    } = { pageX: 0, pageY: 0 };

    private activeGesture: string | null = null;

    constructor(startPan: Function) {
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        window.document.addEventListener("touchstart", (event) => this.handleTouchStart(event, startPan));
        window.document.addEventListener("touchmove", this.handleTouchMove);
        window.document.addEventListener("touchend", this.handleTouchEnd);
        window.document.addEventListener("touchcancel", this.handleTouchEnd);
    }

    private handleTouchStart(event: TouchEvent, panStart: Function) {
        if (event.touches.length !== 1) {
            return;
        }
        this.firstTouch = {
            pageX: event.touches[0].pageX,
            pageY: event.touches[0].pageY
        };
        panStart();
    }

    private handleTouchMove(event: TouchEvent) {
        event.preventDefault();
        const touch = event.touches[0];
        this.lastTouch = {
            pageX: touch.pageX,
            pageY: touch.pageY
        };

        if (this.activeGesture === null && this.firstTouch) {
            this.activeGesture = this.detectGesture();
        }

        if (this.activeGesture) {
            this.fireEvent(event.type, event.target);
        }
    }

    private handleTouchEnd(event: TouchEvent): void {
        if (this.activeGesture) {
            this.fireEvent(event.type, event.target);
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

    private fireEvent(sourceEventType: String, target: EventTarget) {
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
}
