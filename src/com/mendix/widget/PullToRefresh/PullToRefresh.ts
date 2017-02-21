import * as dojoDeclare from "dojo/_base/declare";
import * as dojoWindow from "dojo/_base/window";
import * as dojoDom from "dojo/dom";
import * as domConstruct from "dojo/dom-construct";
import * as WidgetBase from "mxui/widget/_WidgetBase";

import { PullToRefresh } from "./handlers/PullToRefresh";

import "./ui/PullToRefresh.css";

class PullToRefreshWrapper extends WidgetBase {

    private contextObject: mendix.lib.MxObject;

    postCreate() {
        if (!dojoDom.byId("widget-pull-to-refresh")) {
            domConstruct.create("div", {
                id: "widget-pull-to-refresh",
                innerHTML: "<span class='glyphicon glyphicon-repeat pull-to-refresh'></span>" +
                "<div id='widget-pull-to-refresh-text'>Pull to refresh</div>"
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
        (new PullToRefresh()).init({
            bodyElement: dojoWindow.body(),
            loadingFunction: () => mx.ui.reload()
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
