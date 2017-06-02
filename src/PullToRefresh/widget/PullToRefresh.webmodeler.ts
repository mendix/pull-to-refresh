import { Component, DOM } from "react";

declare function require(name: string): string;

// tslint:disable-next-line class-name
export class preview extends Component<{}, {}> {

    render() {
        const image = require("./ui/preview.png");

        return DOM.img({ src: image });
    }
}
