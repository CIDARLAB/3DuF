import * as Colors from "../colors";
import paper from "paper";
import Registry from "../../core/registry";
import  Component  from "@/app/core/component";
import ComponentPort from "@/app/core/componentPort";
import { Point } from "@/app/core/init";

export default class ComponentPortRenderer2D {
    static renderComponentPort(componentport: ComponentPort, draworigin: Point, rotation: number, mirrorByX: number, mirrorByY: number, portrendersize: number = 500) {
        const xpos = draworigin[0];
        const ypos = draworigin[1];
        let point = new paper.Point(xpos + componentport.x, ypos + componentport.y);

        //Mirror the point
        if(mirrorByX) point.x = xpos - componentport.x;
        if (mirrorByY) point.y = ypos - componentport.y;


        const circle = new paper.Path.Circle(point, portrendersize);

        circle.rotate(rotation, new paper.Point(draworigin[0], draworigin[1]));
        

        circle.fillColor = new paper.Color(Colors.BLACK);

        return circle;
    }

    static getSizeforZoomLevel() {
        const zoomlevel = paper.view.zoom;
        let ret = 5 / zoomlevel;
        if (ret > 500) {
            ret = 500;
        }
        return ret;
    }

    static renderComponentPorts(component: Component) {
        const rendersize = ComponentPortRenderer2D.getSizeforZoomLevel();
        const componentports = component.ports;
        const ret = [];
        const rotation = component.getRotation();
        const mirrorByX = component.getMirrorByX();
        const mirrorByY = component.getMirrorByY();
        const currPos = component.getValue("position");
        component.setOffset();
        const position: Point = [currPos[0] - component.offset[0], currPos[1] - component.offset[1]];
        for (const key of componentports.keys()) {
            const componentport = componentports.get(key);
            if (componentport === undefined) {
                console.error(`component ${component.id} has no port ${key}`);
                continue;
            }
            const render = ComponentPortRenderer2D.renderComponentPort(componentport, position, rotation, mirrorByX, mirrorByY, rendersize);
            // TODO - Figure out how to fix this or keep track of this
            // render["renderid"] = componentport.id;
            component.attachComponentPortRender(key, render);
            ret.push(render);
        }
        return ret;
    }

}
