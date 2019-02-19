const Colors = require("../colors");
import paper from 'paper';


export default class ComponentPortRenderer2D{

    static renderComponentPort(componentport, draworigin, rotation){
        // console.log("Rendering...", componentport, topleftposition, centerposition,rotation);
        let xpos = draworigin[0];
        let ypos = draworigin[1];
        let point = new paper.Point(
            xpos + componentport.x,
            ypos + componentport.y
        );

        let circle = paper.Path.Circle(point, 500);

        circle.rotate(rotation, new paper.Point(draworigin[0], draworigin[1]));

        circle.fillColor = Colors.BLACK;

        return circle;
    }

    static renderComponentPorts(component){
        let componentports = component.ports;
        let ret = [];
        for(let key of componentports.keys()){
            let position = component.getValue("position");
            let rotation = component.getRotation();
            let componentport = componentports.get(key);
            let render = ComponentPortRenderer2D.renderComponentPort(componentport, position, rotation);
            render.renderid = componentport.id;
            component.attachComponentPortRender(key, render);
            ret.push(render);
        }
        return ret;
    }
}
