import Template from "./template";
import paper from "paper";

export default class NewComponent extends Template{
	constructor(){
		super();
	}

	__setupDefinitions() {
		/*
		3Duf contains many versions of mixers (regular mixer, circular mixer).
		However, one type of mixer missing is the SHARP ZIGZAG mixer. This feature 
		is included in qRT-PCR devices.
		*/


		this.__unique = {

		};

		this._heritanle = {

		};

		this.__defaults = {

		};

		this.__units = {


		};

		this.__minimum = {


		};

		this.__maximum = {


		};

		this.__placementTool = "Existing Tools | Custom Tool";

		this.__featureParams = {
			"<Drawing Code Variable Name>" : "<Parameter Name>"
		};

		this.__targetParams = {
			"<Drawing Code Variable Name>" : "<Parameter Name>"
		};

	}

	render2D(params, key) {

	}

	render2DTarget(key, params){

	}
}