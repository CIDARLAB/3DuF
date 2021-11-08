import { Request, Response, NextFunction } from "express";

import Port from "../library/port";
import BetterMixer from "../library/betterMixer";
import Chamber from "../library/chamber";
import Channel from "../library/channel";
import Connection from "../library/connection";
import CurvedMixer from "../library/curvedMixer";
import DiamondReactionChamber from "../library/diamondReactionChamber";
import DropletGenerator from "../library/dropletGenerator";
import GradientGenerator from "../library/gradientGenerator";
import Mux from "../library/mux";
import Pump from "../library/pump";
import Pump3D from "../library/pump3D";
import RectValve from "../library/rectValve";
import RotaryMixer from "../library/rotaryMixer";
import Transposer from "../library/transposer";
import Valve from "../library/valve";
import Valve3D from "../library/valve3D";
import Via from "../library/via";
import Tree from "../library/tree";
import YTree from "../library/ytree";
import Node from "../library/node";
import CellTrapS from "../library/celltrapS";
import CellTrapL from "../library/celltrapL";
import LogicArray from "../library/logicArray";
import PicoInjection from "../library/picoinjection";
import DropletGeneratorFlowFocus from "../library/dropletGeneratorFlowFocus";
import DropletGeneratorT from "../library/dropletGeneratorT";
import Filter from "../library/filter";
import Merger from "../library/merger";
import ThreeDMux from "../library/threeDMux";
import CapacitanceSensor from "../library/capacitancesensor";
import Sorter from "../library/sorter";
import Splitter from "../library/splitter";

import paper, { Key } from "paper";

paper.setup(new paper.Size([640, 480]));

let primitive_map = new Map();

let port = new Port();
let better_mixer = new BetterMixer();
let cell_trap_l = new CellTrapL();
let chamber = new Chamber();
let channel = new Channel();
let connection = new Connection();
let curved_mixer = new CurvedMixer();
let diamond_reaction_chamber = new DiamondReactionChamber();
let droplet_generator = new DropletGenerator();
let gradient_generator = new GradientGenerator();
let mux = new Mux();
let pump = new Pump();
let pump3D = new Pump3D();
let rect_valve = new RectValve();
let rotary_mixer = new RotaryMixer();
let transposer = new Transposer();
let valve = new Valve();
let valve3D = new Valve3D();
let via = new Via();
let tree = new Tree();
let ytree = new YTree();
let node = new Node();
let squareCellTrap = new CellTrapS();
let logicarray = new LogicArray();
let picoinjector = new PicoInjection();
let flowfocusdroplet = new DropletGeneratorFlowFocus();
let drolett = new DropletGeneratorT();
let filter = new Filter();
let merger = new Merger();
let threedmux = new ThreeDMux();
let capsensor = new CapacitanceSensor();
let sorter = new Sorter();
let splitter = new Splitter();

primitive_map.set(port.mint, port);
primitive_map.set(better_mixer.mint, better_mixer);
primitive_map.set(cell_trap_l.mint, cell_trap_l);
primitive_map.set(chamber.mint, chamber);
primitive_map.set(channel.mint, channel);
primitive_map.set(connection.mint, connection);
primitive_map.set(curved_mixer.mint, curved_mixer);
primitive_map.set(diamond_reaction_chamber.mint, diamond_reaction_chamber);
primitive_map.set(droplet_generator.mint, droplet_generator);
primitive_map.set(gradient_generator.mint, gradient_generator);
primitive_map.set(mux.mint, mux);
primitive_map.set(pump.mint, pump);
primitive_map.set(pump3D.mint, pump3D);
primitive_map.set(rect_valve.mint, rect_valve);
primitive_map.set(rotary_mixer.mint, rotary_mixer);
primitive_map.set(transposer.mint, transposer);
primitive_map.set(valve.mint, valve);
primitive_map.set(valve3D.mint, valve3D);
primitive_map.set(via.mint, via);
primitive_map.set(tree.mint, tree);
primitive_map.set(ytree.mint, ytree);
primitive_map.set(node.mint, node);
primitive_map.set(threedmux.mint, threedmux);
primitive_map.set(merger.mint, merger);
primitive_map.set(filter.mint, filter);
primitive_map.set(drolett.mint, drolett);
primitive_map.set(flowfocusdroplet.mint, flowfocusdroplet);
primitive_map.set(picoinjector.mint, picoinjector);
primitive_map.set(logicarray.mint, logicarray);
primitive_map.set(squareCellTrap.mint, squareCellTrap);
primitive_map.set(capsensor.mint, capsensor);
primitive_map.set(sorter.mint, sorter);
primitive_map.set(splitter.mint, splitter);
console.log(primitive_map.keys());

const getDimensions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let primitive = req.query.mint;
  let key = primitive;
  let technology = primitive_map.get(key);
  if (!primitive_map.has(key)) {
    res.send("MINT Not found");
    console.error("Could not find MINT:", key);
  }

  let params_text = req.query.params as string;
  let params = JSON.parse(params_text);
  console.log("Params:", params);
  params["position"] = [0, 0];
  params["color"] = "#FFF";
    params["rotation"] = 0;

  let renderkeys = technology.renderKeys;
  let features = [];
  for (let i = 0; i < renderkeys.length; i++) {
    if (renderkeys[i] == "INVERSE") {
      continue;
    }
    console.log("Rendering layer: " + renderkeys[i]);
    let feature = technology.render2D(params, renderkeys[i]);
    features.push(feature);
  }
  let unitedBounds = features.reduce((bbox, item) => {
    return !bbox ? item.bounds : bbox.unite(item.bounds);
  }, null);
  let xspan = unitedBounds.width;
  let yspan = unitedBounds.height;
  // console.log("Dimensions:",xspan, yspan);
  let ret = { "x-span": xspan, "y-span": yspan };
  console.log("Dimensions:", primitive, ret);
  res.send(ret);
};

const getTerminals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let primitive = req.query.mint;
  let key = primitive;
  let technology = primitive_map.get(key);
  if (!primitive_map.has(key)) {
    res.send("MINT Not found");
    console.error("Could not find MINT:", key);
  }

  let params_text = req.query.params as string;
  let params = JSON.parse(params_text);
  console.log("Params:", params);
  params["position"] = [0, 0];
  params["color"] = "#FFF";

  // console.log("Dimensions:",xspan, yspan);
  let ports = technology.getPorts(params);
  let ret = [];
  for (let i = 0; i < ports.length; i++) {
    let port = ports[i];
    let drawoffsets = technology.getDrawOffset(params);
    port.x = Math.round(port.x + drawoffsets[0]);
    port.y = Math.round(port.y + drawoffsets[1]);
    ret.push(port.toInterchangeV1());
  }
  console.log("Terminals:", primitive, ret);
  res.send(ret);
};

const getDefaults = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.query, req.query.mint, req.query["mint"]);
  let primitive = req.query.mint;
  let key = primitive;
  if (primitive_map.has(key)) {
    let technology = primitive_map.get(key);
    console.log("Defaults:", primitive, technology.defaults);
    res.send(technology.defaults);
  } else {
    console.error("Could not find mint key: ", key);
    res.send("Not found");
  }
};

export default { getDimensions, getTerminals, getDefaults };
