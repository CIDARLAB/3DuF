import * as Colors from "../colors";
import paper from "paper";
import * as Registry from "../../core/registry";

export default class ComponentPortRenderer2D {
    static renderComponentPort(componentport, draworigin, rotation, portrendersize = 500) {
        // console.log("Rendering...", componentport, topleftposition, centerposition,rotation);
        let xpos = draworigin[0];
        let ypos = draworigin[1];
        let point = new paper.Point(xpos + componentport.x, ypos + componentport.y);

        let circle = paper.Path.Circle(point, portrendersize);

        circle.rotate(rotation, new paper.Point(draworigin[0], draworigin[1]));

        circle.fillColor = Colors.BLACK;

        return circle;
    }

    static getSizeforZoomLevel() {
        let zoomlevel = paper.view.zoom;
        // console.log("Zoomlevel:", zoomlevel);
        let ret = 5 / zoomlevel;
        if (ret > 500) {
            ret = 500;
        }
        return ret;
    }

    static renderComponentPorts(component) {
        let rendersize = ComponentPortRenderer2D.getSizeforZoomLevel();
        let componentports = component.ports;
        let ret = [];
        for (let key of componentports.keys()) {
            let position = component.getValue("position");
            let rotation = component.getRotation();
            let componentport = componentports.get(key);
            let render = ComponentPortRenderer2D.renderComponentPort(componentport, position, rotation, rendersize);
            render.renderid = componentport.id;
            component.attachComponentPortRender(key, render);
            ret.push(render);
        }
        return ret;
    }
}
