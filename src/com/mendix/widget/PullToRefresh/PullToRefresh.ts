import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";

import { unmountComponentAtNode } from "react-dom";

import { WebPullToRefresh } from "./components/WebPullToRefresh";
import "./ui/PullToRefresh.css";

class PullToRefresh extends WidgetBase {

    private contextObject: mendix.lib.MxObject;

    postCreate() {
        // TODO use react when interacting with the dom !!
        const contentNode = document.getElementById("content");
        const wrapper = document.createElement("div");
        wrapper.id = "ptr";
        wrapper.innerHTML = `<span class="glyphicon glyphicon-repeat pull-to-refresh"></span>`;
        document.body.insertBefore(wrapper, contentNode);
    }

    update(contextObject: mendix.lib.MxObject, callback?: Function) {
        this.contextObject = contextObject;
        this.updateRendering();

        if (callback) {
            callback();
        }
    }

    uninitialize(): boolean {
        unmountComponentAtNode(this.domNode);

        return true;
    }

    private updateRendering() {
        (new WebPullToRefresh()).init({
            bodyEl: document.body,
            loadingFunction: this.refreshPage
        });
    }

    private refreshPage() {
        return (new Promise<string>(() => {
            mx.ui.reload();
        }));
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
}(PullToRefresh));
