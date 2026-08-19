import BlackBox from "./blackBox";

/**
 * Built-in black-box placeholder for user-designed parts (Neptune LFR DIYcomponent).
 * Same geometry/ports as BlackBox; mint entity is DIYCOMPONENT so Fluigi/MINT
 * round-trips resolve without a custom JSON library entry.
 */
export default class DIYComponent extends BlackBox {
    __setupDefinitions(): void {
        super.__setupDefinitions();
        this.__mint = "DIYCOMPONENT";
    }
}
