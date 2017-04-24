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
    private progressId: number;

    postCreate() {
        this.onRefresh = this.onRefresh.bind(this);
        this.onSyncFailure = this.onSyncFailure.bind(this);

        if (!window.mx.data.synchronizeOffline && !window.mx.data.synchronizeDataWithFiles) {
            domConstruct.create("div", {
                class: "alert alert-danger",
                innerHTML: "The pull to refresh widget is not compatible with this version of Mendix"
            }, this.domNode);
        } else {
            // We share the refresh element across pages. Else the setup and destroy will conflict
            this.setUpWidgetDom();
            this.pullToRefresh.setupEvents();
        }
    }

    uninitialize(): boolean {
        this.pullToRefresh.removeEvents();

        return true;
    }

    private setUpWidgetDom() {
        this.pullToRefreshElement = dojoDom.byId("widget-pull-to-refresh");
        if (!this.pullToRefreshElement) {
            this.pullToRefreshElement = domConstruct.create("div", {
                class: "pull-to-refresh-pull-to-refresh",
                id: "widget-pull-to-refresh",
                innerHTML: `
                    <div class='pull-to-refresh-box'>
                        <div class='pull-to-refresh-content'>
                            <div class='pull-to-refresh-icon'></div>
                            <div class='pull-to-refresh-text'></div>
                        </div>
                    </div>
                `
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
    }

    // Note; this function is hooking into the Mendix private API, this is subject to change without notice!
    // Please do not re-use this. The only supported API is publicly documented at
    // https://apidocs.mendix.com/7/client/
    private onRefresh(callback: () => void) {
        this.progressId = window.mx.ui.showProgress(null, true);
        this.pullToRefresh.removeEvents();
        if (window.mx.data.synchronizeOffline) {
            window.mx.data.synchronizeOffline({ fast: false }, () => this.onSyncSuccess(callback), this.onSyncFailure);
        } else if (window.mx.data.synchronizeDataWithFiles) {
            window.mx.data.synchronizeDataWithFiles(() => this.onSyncSuccess(callback), this.onSyncFailure);
        }
    }

    private onSyncSuccess(callback: () => void) {
        window.mx.ui.reload(() => {
            if (this.progressId || this.progressId === 0) {
                window.mx.ui.hideProgress(this.progressId);
            }
            this.pullToRefresh.setupEvents();
            if (callback) callback();
        });
    }

    private onSyncFailure() {
        if (this.progressId) window.mx.ui.hideProgress(this.progressId);
        window.mx.ui.info(window.mx.ui.translate("mxui.sys.UI", "sync_error"), true);
        this.pullToRefresh.setupEvents();
    }
}

// tslint:disable : only-arrow-functions
dojoDeclare("PullToRefresh.widget.PullToRefresh", [ WidgetBase ], function(Source: any) {
    const result: any = {};
    for (const property in Source.prototype) {
        if (property !== "constructor" && Source.prototype.hasOwnProperty(property)) {
            result[property] = Source.prototype[property];
        }
    }
    return result;
}(PullToRefreshWrapper));
