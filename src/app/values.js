class ParamValue{
	constructor(type, value){
		this.type = type;
		this.value = value;
	}
}

class FloatValue extends ParamValue{
	constructor(value){
		if (!Number.isFinite(value) ||  value < 0) throw new Error("AbsoluteValue must be a finite number >= 0.");
		super("Float", value);
	}
}

class RelativeValue extends ParamValue{
	constructor(value, reference){
		if (!Number.isFinite(value) || value < 0) throw new Error("RelativeValue must be a finite number >= 0.");
	 	super("Relative", value);
	}
}

class IntegerValue extends ParamValue{
	constructor(value){
		if (!Number.isInteger(value) || value < 0) throw new Error("IntegerValue must be an integer >= 0.");
		super("Integer", value);
	}
}

class BooleanValue extends ParamValue{
	constructor(value, reference){
		if (value != false && value != true) throw new Error("BooleanValue must be true or false.");
		super("Boolean", value);
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