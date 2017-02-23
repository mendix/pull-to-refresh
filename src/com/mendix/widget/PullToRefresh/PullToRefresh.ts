import * as dojoDeclare from "dojo/_base/declare";
import * as dojoWindow from "dojo/_base/window";
import * as dojoDom from "dojo/dom";
import * as domConstruct from "dojo/dom-construct";
import * as WidgetBase from "mxui/widget/_WidgetBase";
import { PullToRefreshJS } from "./handlers/PullToRefreshJS";
import "./ui/PullToRefresh.css";

class PullToRefreshWrapper extends WidgetBase {

    private contextObject: mendix.lib.MxObject;
    private ptrElement: HTMLElement;

    postCreate() {
        if (!dojoDom.byId("widget-pull-to-refresh")) {
            this.ptrElement = domConstruct.create("div", {
                class: "ptr--ptr",
                id: "widget-pull-to-refresh",
                innerHTML: `<div class='ptr--box'><div class='ptr--content'>
                    <div class='ptr--icon'></div>
                    <div class='ptr--text'></div>
                </div></div>`
            }, dojoWindow.body(), "first");
        }
    }

    update(contextObject: mendix.lib.MxObject, callback?: () => void ) {
        this.contextObject = contextObject;
        this.updateRendering();

        if (callback) {
            callback();
        }
    }

    private updateRendering() {
       this.destroyEvents =  new PullToRefreshJS().init({
            mainElement: dojoWindow.body() as HTMLElement,
            onRefresh: () => { mx.ui.reload(); },
            ptrElement: this.ptrElement
        });
    }
}

// tslint:disable : only-arrow-functions
dojoDeclare("com.mendix.widget.PullToRefresh.PullToRefresh", [ WidgetBase ], function(Source: any) {
    const result: any = {};
    for (const property in Source.prototype) {
        if (property !== "constructor" && Source.prototype.hasOwnProperty(property)) {
            result[property] = Source.prototype[property];
        }
    }
    return result;
}(PullToRefreshWrapper));
