import { ComponentAPI } from "../src/componentAPI";
import paper from "paper";
import * as fs from "fs";

//To run, change filepath, outputFilePath, navigate to scripts directory, and run ts-node offset.ts in the terminal

const filePath = "./result.json";
const outputFilePath = "./result2_modified.json";
const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

// paper.setup([135000, 85000]);

const scope1 = new paper.PaperScope()

for (const key in jsonData.components) {
    const position = jsonData.components[key].params.position;

    const params = jsonData.components[key].params;
    const MintType = String(ComponentAPI.getTypeForMINT(jsonData.components[key].entity));
    const component = ComponentAPI.library[MintType]?.object;
    const offset = component.getDrawOffset(params);

    jsonData.components[key].params.position = [position[0] + offset[0], position[1] - offset[1]];

    console.log(MintType);
    console.log(offset);
}

fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2), "utf-8");
