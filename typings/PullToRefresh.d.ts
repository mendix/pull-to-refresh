declare module "react-pull-to-refresh" {

    interface PullToRefreshProps {
        onRefresh: Function,
        icon?: React.ReactElement<any>,
        loading?: React.ReactElement<any>,
        disabled?: boolean,
        className?: string,
        style?: Object,
        distanceToRefresh?: number,
        resistance?: number,
        hammerOptions?: Object
    }

    var pulltorefreshInstance: React.ComponentClass<PullToRefreshProps>;
    export = pulltorefreshInstance;
}

declare module "pulltorefreshjs" {
    interface ptr {
        init(...args: any[]): any
    }
    var ptr_: ptr;

    export = ptr_;
}

declare module "PullToRefreshJS" {
    interface ptr {
        init(...args: any[]): any
    }
    var ptr_: ptr;

    export = ptr_;
}
