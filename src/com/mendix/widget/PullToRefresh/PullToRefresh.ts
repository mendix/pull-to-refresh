import * as dojoDeclare from "dojo/_base/declare";
import * as dojoDom from "dojo/dom";
import * as domConstruct from "dojo/dom-construct";
import * as WidgetBase from "mxui/widget/_WidgetBase";

import { PullToRefresh } from "./handlers/PullToRefresh";

import "./ui/PullToRefresh.css";

class PullToRefreshWrapper extends WidgetBase {
    private pullToRefreshText: string;
    private releaseToRefreshText: string;
    private refreshText: string;

    private pullToRefreshElement: HTMLElement;
    private pullToRefresh: PullToRefresh;

    postCreate() {
        // We share the refresh element across pages. Else the setup and destroy will conflict
        this.pullToRefreshElement = dojoDom.byId("widget-pull-to-refresh");
        if (!this.pullToRefreshElement) {
            this.pullToRefreshElement = domConstruct.create("div", {
                class: "pull-to-refresh-pull-to-refresh",
                id: "widget-pull-to-refresh",
                innerHTML: `<div class='pull-to-refresh-box'><div class='pull-to-refresh-content'>
                    <div class='pull-to-refresh-icon'></div>
                    <div class='pull-to-refresh-text'></div>
                </div></div>`
            }, document.body, "first");
        }

        this.pullToRefresh = new PullToRefresh({
            mainElement: document.body,
            onRefresh: this.onRefresh,
            pullToRefreshElement: this.pullToRefreshElement,
            pullToRefreshText: this.pullToRefreshText,
            refreshText: this.refreshText,
            releaseToRefreshText: this.releaseToRefreshText
        });

        this.pullToRefresh.setupEvents();
    }

    uninitialize(): boolean {
        this.pullToRefresh.removeEvents();

        return true;
    }

    private onRefresh(callback: () => void) {
        window.mx.data.synchronizeDataWithFiles(() => window.mx.ui.reload(callback), (error) => {
            logger.error(error);
            window.mx.ui.info(window.mx.ui.translate("mxui.sys.UI", "sync_error"), true);
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
