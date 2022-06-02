import { ViewManager } from "@/app";
import paper from "paper";

import * as Colors from "../colors";

export default class AdaptiveGrid {
    private __viewManagerDelegate: ViewManager;
    private __spacing: number;
    private __isAutomaticEnabled: boolean;

    origin: paper.Point;
    thinWidth: number;
    thickWidth: number;
    minSpacing: number;
    maxSpacing: number;
    thickCount: number;
    color: string;

    constructor(viewmanager: ViewManager, minSpacing = 5, maxSpacing = 100, thickCount = 10, origin = [0, 0], thinWidth = 1, thickWidth = 3, color = Colors.BLUE_100) {
        this.__viewManagerDelegate = viewmanager;

        this.origin = new paper.Point(origin[0], origin[1]);
        this.thinWidth = thinWidth; // pixel
        this.thickWidth = thickWidth; // pixels
        this.minSpacing = minSpacing; // pixels
        this.maxSpacing = maxSpacing; // pixels
        this.thickCount = thickCount;
        this.__spacing = 500;
        this.__isAutomaticEnabled = true;
        this.color = color;
    }

    /**
     * Returns the current grid spacing
     *
     * @type {number}
     * @memberof AdaptiveGrid
     */
    get spacing(): number {
        return this.__spacing;
    }

    set spacing(value) {
        // You can have validation code here
        console.log(AdaptiveGrid.isValidZoom(value));
        this.__spacing = value;
    }

    enableAdaptiveGrid(): void  {
        this.__isAutomaticEnabled = true;
    }

    disableAdaptiveGrid(): void  {
        this.__isAutomaticEnabled = false;
    }

    getClosestGridPoint(point: paper.Point) {
        const x = Math.round((point.x - this.origin.x) / this.__spacing) * this.__spacing + this.origin.x;
        const y = Math.round((point.y - this.origin.y) / this.__spacing) * this.__spacing + this.origin.y;
        return new paper.Point(x, y);
    }

    setOrigin(origin: number[]): void  {
        this.origin = new paper.Point(origin[0], origin[1]);
        this.notifyViewManagerToUpdateView();
    }

    setThinWidth(width: number): void  {
        this.thinWidth = width;
        this.notifyViewManagerToUpdateView();
    }

    setThickWidth(width: number): void  {
        this.thickWidth = width;
        this.notifyViewManagerToUpdateView();
    }

    setMinSpacing(pixels: number): void  {
        this.__spacing = pixels;
        this.notifyViewManagerToUpdateView();
    }

    setMaxSpacing(pixels: number): void  {
        this.maxSpacing = pixels;
        this.notifyViewManagerToUpdateView();
    }

    setColor(color: string): void  {
        this.color = color;
        this.notifyViewManagerToUpdateView();
    }

    getSpacing(): number  {
        if (this.__isAutomaticEnabled) {
            const zoomlevel = paper.view.zoom;
            if (zoomlevel <= 0.02) {
                this.__spacing = 1000;
            } else if (zoomlevel <= 0.05) {
                this.__spacing = 500;
            } else if (zoomlevel <= 0.1) {
                this.__spacing = 100;
            } else if (zoomlevel <= 0.6) {
                this.__spacing = 50;
            } else {
                this.__spacing = 5;
            }
            return this.__spacing;
        } else {
            return this.__spacing;
        }
        // console.log("Zoom: " + paper.view.zoom + " Spacing: " + this.__spacing);
    }

    updateGridSpacing(value: number): boolean  {
        if (AdaptiveGrid.isValidZoom(value)) {
            console.log("New spacing value:", value);
            this.__spacing = value;
            return true;
        } else {
            console.error("Inavlid Grid Spacing");
            return false;
        }
    }

    getThinWidth(): number  {
        return this.thinWidth / paper.view.zoom;
    }

    getThickWidth(): number  {
        return this.thickWidth / paper.view.zoom;
    }

    notifyViewManagerToUpdateView(): void  {
        if (this.__viewManagerDelegate) {
            this.__viewManagerDelegate.updateGrid();
        } else {
            console.error("Could not find view manager to send update grid signal");
        }
    }

    static isValidZoom(value: number): boolean  {
        // First check if its a valid number

        // TODO: figure out if we want to round it off

        // Then check if its in bounds

        // TODO: change this to be actually functional
        return true;
    }
}
