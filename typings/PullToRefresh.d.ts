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
