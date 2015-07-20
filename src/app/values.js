class ParamValue{
	constructor(type, value){
		this.type = type;
		this.value = value;
	}
}

class FloatValue extends ParamValue{
	constructor(value){
		super("Float", value);
		if (this.isInvalid(value)) throw new Error("AbsoluteValue must be a finite number >= 0.");
	}

	isInvalid(value){
		if (!Number.isFinite(value) ||  value < 0) return true;
		else return false;
	}
}

class StringValue extends ParamValue{
	constructor(value){
		super("String", value);
		if (this.isInvalid(value)) throw new Error("StringValue must be a string.");
	}

	isInvalid(value){
		if(typeof value != "string") return true;
		else return false;
	}
}

class RelativeValue extends ParamValue{
	constructor(value, reference){
	 	super("Relative", value);
	 	if (this.isInvalid(value)) throw new Error("RelativeValue must be a finite number >= 0.");
	}

	isInvalid(value){
		if (!Number.isFinite(value) || value < 0) return true;
		else return false;
	}
}

class IntegerValue extends ParamValue{
	constructor(value){
		super("Integer", value);
		if (this.isInvalid(value)) throw new Error("IntegerValue must be an integer >= 0.");
	}

	isInvalid(value){
		if (!Number.isInteger(value) || value <0) return true;
		else return false;
	}
}

class BooleanValue extends ParamValue{
	constructor(value, reference){
		super("Boolean", value);
		if (this.isInvalid(value)) throw new Error("BooleanValue must be true or false.");
	}

	isInvalid(value){
		if (value === false || value === true) return false;
		else return true;
	}
}

class PointValue extends ParamValue{
	constructor(value, reference){
		if (value.length != 2 || !Number.isFinite(value[0]) || !Number.isFinite(value[1])) throw new Error("PointValue must be a coordinate represented by a two-member array of finite numbers, ex. [1,3]");
		super("Point", value);
	}
}

class Connection{
	constructor(type, reference){
		this.type = type;
		this.value = value;
	}
}

exports.ParamValue = ParamValue;
exports.RelativeValue = RelativeValue;
exports.FloatValue = FloatValue;
exports.IntegerValue = IntegerValue;
exports.BooleanValue = BooleanValue;
exports.PointValue = PointValue;
exports.StringValue = StringValue;