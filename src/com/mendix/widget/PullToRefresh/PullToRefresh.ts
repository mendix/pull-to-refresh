import * as dojoDeclare from "dojo/_base/declare";
import * as dojoWindow from "dojo/_base/window";
import * as dojoDom from "dojo/dom";
import * as domConstruct from "dojo/dom-construct";
import * as WidgetBase from "mxui/widget/_WidgetBase";
import { PullToRefreshJS } from "./handlers/PullToRefreshJS";

import "./ui/PullToRefresh.css";

class PullToRefreshWrapper extends WidgetBase {

    private contextObject: mendix.lib.MxObject; // TODO: What's the purpose of this? Ditch
    private ptrElement: HTMLElement; // TODO: rename to something clearer

    postCreate() {
        if (!dojoDom.byId("widget-pull-to-refresh")) {
            // TODO: Ditch all this ptr stuff or other unclear abbreviations. Stick to convention
            this.ptrElement = domConstruct.create("div", {
                class: "ptr--ptr",
                id: "widget-pull-to-refresh",
                innerHTML: `<div class='ptr--box'><div class='ptr--content'>
                    <div class='ptr--icon'></div>
                    <div class='ptr--text'></div>
                </div></div>`
            }, dojoWindow.body(), "first"); // TODO: why not use document.body?
        }
    }
    // TODO: Widget doesn't need context so u don't need this. Ditch it, move updateRendering to postCreate
    update(contextObject: mendix.lib.MxObject, callback?: () => void ) {
        this.contextObject = contextObject;
        this.updateRendering();

        if (callback) {
            callback();
        }
    }

    private updateRendering() {
        new PullToRefreshJS().init({
            mainElement: dojoWindow.body() as HTMLElement, // TODO: why not use document.body? In fact, do this in class constructor
            onRefresh: () => { mx.ui.reload(); }, // TODO: Why do this here? Is it ever going to change? Put in class
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
