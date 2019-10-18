import {Registry} from "../index";
import Connection from "../core/connection";
import Feature from "../core/feature";
import ChannelTool from "../view/tools/channelTool";
import ComponentPort from "../core/componentPort";

export default class DAFDPlugin {
    static fixLayout(params){

        //Update Params
        let channelid;
        let orificeSize = params["orificeSize"];
        let orificeLength = params["orificeLength"];
        let oilInputWidth = params["oilInputWidth"];
        let waterInputWidth = params["waterInputWidth"];
        let outputWidth = params["outputWidth"];
        let outputLength = params["outputLength"];
        let height = params["height"];


        //Load up all the components and change their positions based on the component dimensions
        let dropgen = Registry.currentDevice.getComponentByName("DropletGen_1");
        let port_in = Registry.currentDevice.getComponentByName("Port_in");
        let port_oil1 = Registry.currentDevice.getComponentByName("Port_oil1");
        let port_oil2 = Registry.currentDevice.getComponentByName("Port_oil2");
        let port_out = Registry.currentDevice.getComponentByName("Port_out");

        let transition_in = Registry.currentDevice.getFeatureByName("Transition_3");
        let transition_oil1 = Registry.currentDevice.getFeatureByName("Transition_6");
        let transition_oil2 = Registry.currentDevice.getFeatureByName("Transition_5");
        let transition_out = Registry.currentDevice.getFeatureByName("Transition_4");

        //Update all the droplet generator params
        dropgen.updateParameter("orificeSize", orificeSize);
        dropgen.updateParameter("orificeLength", orificeLength);
        dropgen.updateParameter("oilInputWidth", oilInputWidth);
        dropgen.updateParameter("waterInputWidth", waterInputWidth);
        dropgen.updateParameter("outputWidth", outputWidth);
        dropgen.updateParameter("outputLength", outputLength);
        dropgen.updateParameter("height", height);

        //Update the transitions
        transition_out.updateParameter("cw2", outputWidth);
        transition_in.updateParameter("cw2", waterInputWidth);
        transition_oil1.updateParameter("cw2", oilInputWidth);
        transition_oil2.updateParameter("cw2", oilInputWidth);

        let componentports = dropgen.ports;
        console.log("component ports:", componentports);
        //Draw the channels
        let startpoint;
        let endpoint;
        let cp;


        //Align ports  to the droplet generator
        let dxpos = dropgen.getPosition()[0];
        let xpos = dxpos + oilInputWidth / 2;
        let ypos = port_oil1.getCenterPosition()[1];
        port_oil1.updateComponetPosition([xpos, ypos]);
        ypos = port_oil2.getCenterPosition()[1];
        port_oil2.updateComponetPosition([xpos, ypos]);

        //Moving teh transistions to align with droplet generators
        ypos = transition_oil1.getValue('position')[1];
        transition_oil1.updateParameter('position', [xpos, ypos]);
        ypos = transition_oil2.getValue('position')[1];
        transition_oil2.updateParameter('position', [xpos, ypos]);

        //Input Channel
        startpoint = port_in.getCenterPosition();
        cp = componentports.get("4");
        endpoint = ComponentPort.calculateAbsolutePosition(cp, dropgen);
        console.log("endpoint", endpoint);
        let newChannel = ChannelTool.createChannel(startpoint, endpoint, "RoundedChannel", "Basic");
        channelid = newChannel.getID();

        Registry.currentLayer.addFeature(newChannel);

        newChannel = Registry.currentDevice.getFeatureByID(channelid);
        newChannel.updateParameter('channelWidth', waterInputWidth);

        //oil top Channel
        startpoint = port_oil1.getCenterPosition();
        cp = componentports.get("1");
        endpoint = ComponentPort.calculateAbsolutePosition(cp, dropgen);
        console.log("endpoint", endpoint);
        newChannel = ChannelTool.createChannel(startpoint, endpoint, "RoundedChannel", "Basic");
        channelid = newChannel.getID();

        Registry.currentLayer.addFeature(newChannel);
        newChannel = Registry.currentDevice.getFeatureByID(channelid);
        newChannel.updateParameter('channelWidth', oilInputWidth);

        //output Channel
        startpoint = port_out.getCenterPosition();
        cp = componentports.get("2");
        endpoint = ComponentPort.calculateAbsolutePosition(cp, dropgen);
        console.log("endpoint", endpoint);
        newChannel = ChannelTool.createChannel(startpoint, endpoint, "RoundedChannel", "Basic");
        channelid = newChannel.getID();

        Registry.currentLayer.addFeature(newChannel);

        newChannel = Registry.currentDevice.getFeatureByID(channelid);
        newChannel.updateParameter('channelWidth', outputWidth);


        //oil bottom Channel
        startpoint = port_oil2.getCenterPosition();
        cp = componentports.get("3");
        console.log("cp", cp);
        endpoint = ComponentPort.calculateAbsolutePosition(cp, dropgen);
        console.log("endpoint", endpoint);
        newChannel = ChannelTool.createChannel(startpoint, endpoint, "RoundedChannel", "Basic");
        channelid = newChannel.getID();

        Registry.currentLayer.addFeature(newChannel);

        newChannel = Registry.currentDevice.getFeatureByID(channelid);
        newChannel.updateParameter('channelWidth', oilInputWidth);

    }

}