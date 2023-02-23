import { Request, Response, NextFunction } from "express";
import { ComponentAPI } from "../componentAPI";

import paper, { Key } from "paper";

paper.setup(new paper.Size([64000, 48000]));

const getDimensions = async (req: Request, res: Response, next: NextFunction) => {
    let primitive = req.query.mint;
    let key = primitive as string;
    let technology = ComponentAPI.getComponentWithMINT(key);

    if (technology === null) {
        console.error("Could not find MINT:", key);
        return res.status(400).send({ message: `MINT Not found - ${key}` });
    }

    let params_text = req.query.params as string;
    let params = JSON.parse(params_text);
    console.log("Params:", params);
    params["position"] = [0, 0];
    params["color"] = "#FFF";
    params["rotation"] = 0;

    let ret = technology.getDimensions(params);
    console.log("Dimensions:", primitive, ret);
    return res.send({"x-span":ret.xspan, "y-span":ret.yspan});
};

const getTerminals = async (req: Request, res: Response, next: NextFunction) => {
    let primitive = req.query.mint;
    let key = primitive as string;
    let technology = ComponentAPI.getComponentWithMINT(key);

    if (technology === null) {
        console.error("Could not find MINT:", key);
        return res.status(400).send({ message: `MINT Not found - ${key}` });
    }

    let params_text = req.query.params as string;
    let params = JSON.parse(params_text);
    console.log("Params:", params);
    params["position"] = [0, 0];
    params["color"] = "#FFF";

    // console.log("Dimensions:",xspan, yspan);
    let ports = technology.getPorts(params);
    const drawoffsets = technology.getDrawOffset(params);

    let ret = [];
    for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        port.x = Math.floor(port.x + drawoffsets[0]);
        port.y = Math.floor(port.y + drawoffsets[1]);
        ret.push(port.toInterchangeV1());
    }
    console.log("Terminals:", primitive, ret);
    res.send(ret);
};

const getDefaults = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.query, req.query.mint, req.query["mint"]);
    let primitive = req.query.mint;
    let key = primitive as string;
    let technology = ComponentAPI.getComponentWithMINT(key);

    if (technology === null) {
        console.error("Could not find MINT:", key);
        return res.status(400).send({ message: `MINT Not found - ${key}` });
    }
    console.log("Defaults:", primitive, technology.defaults);
    return res.send(technology.defaults);
};

export default { getDimensions, getTerminals, getDefaults };
