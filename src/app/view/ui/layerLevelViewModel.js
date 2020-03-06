import ko from "knockout";

class LayerLevelViewModel {
    constructor(index) {
        this.levelIndex = ko.observable(index);
    }
}
