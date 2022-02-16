import * as Colors from "../colors";
import paper from "paper";
import Registry from "../../core/registry";

export default class ComponentPortRenderer2D {
    static renderComponentPort(componentport, draworigin, rotation, portrendersize = 500) {
        const xpos = draworigin[0];
        const ypos = draworigin[1];
        const point = new paper.Point(xpos + componentport.x, ypos + componentport.y);

        const circle = paper.Path.Circle(point, portrendersize);

        circle.rotate(rotation, new paper.Point(draworigin[0], draworigin[1]));

        circle.fillColor = Colors.BLACK;

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

    static renderComponentPorts(component) {
        const rendersize = ComponentPortRenderer2D.getSizeforZoomLevel();
        const componentports = component.ports;
        const ret = [];
        const rotation = component.getRotation();
        const currPos = component.getValue("position");
        const position = [currPos[0] - component.offset[0], currPos[1] - component.offset[1]];
        console.log("comp pos: ", currPos);
        console.log("offset: ", component.offset);
        console.log("position: ", position);
        for (const key of componentports.keys()) {
            const componentport = componentports.get(key);
            const render = ComponentPortRenderer2D.renderComponentPort(componentport, position, rotation, rendersize);
            render.renderid = componentport.id;
            component.attachComponentPortRender(key, render);
            ret.push(render);
        }
        return ret;
    }
}
