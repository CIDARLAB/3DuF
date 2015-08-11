class FeatureSet {
    constructor(name, definitions, tools, renderers2D, renderers3D) {
        this.__name;
        this.__definitions = definitions;
        this.__tools = tools;
        this.__renderers2D = renderers2D;
        this.__renderers3D = renderers3D;
        this.__checkDefinitions();
    }

    containsDefinition(featureTypeString) {
        if (this.__definitions.hasOwnProperty(featureTypeString)) return true;
        else return false;
    }

    getDefinition(typeString){
        return this.__definitions[typeString];
    }

    getRenderer3D(typeString){
        return this.__renderers3D[typeString];
    }

    getRenderer2D(typeString){
        return this.__renderers2D[typeString];
    }

    getTool(typeString){
        return this.__tools[typeString];
    }

    getDefinitions() {
        return this.__definitions;
    }

    getName() {
        return this.__name;
    }

    getTools() {
        return this.__tools;
    }

    getRenderers2D() {
        return this.__renderers2D;
    }

    getRenderers3D() {
        return this.__renderers3D;
    }

    __checkDefinitions() {
        for (let key in this.__definitions) {
            if (!this.__tools.hasOwnProperty(key) || !this.__renderers2D.hasOwnProperty(key) || !this.__renderers3D.hasOwnProperty(key)) {
                throw new Error("Feature set does not contain a renderer or tool definition for: " + key);
            }
        }
    }
}

module.exports = FeatureSet;