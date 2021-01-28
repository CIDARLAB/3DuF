<template>
    <div>
        <span class="mdl-layout-title">Mix</span>
        <nav id="feature-mix" class="mdl-navigation">
            <div class="button_row">
                <a id="bettermixer_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Mixer</a>
                <button id="bettermixer_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="3dmixer_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">3D Mixer</a>
                <button id="3dmixer_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="gradientgenerator_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Gradient Gen</a>
                <button id="gradientgenerator_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>

            <div class="button_row">
                <a id="curvedmixer_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Curved Mixer</a>
                <button id="curvedmixer_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="rotarymixer_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Rotary Mixer</a>
                <button id="rotarymixer_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
        </nav>
        <span class="mdl-layout-title">Control</span>
        <nav id="feature-control" class="mdl-navigation">
            <!--            <div class="button_row">-->
            <!--                <a id="circleValve_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button&#45;&#45;raised feature-button">Circle Valve</a>-->
            <!--                <button id="circleValve_params_button" class="params-button mdl-button mdl-js-button mdl-button&#45;&#45;icon">-->
            <!--                    <i class="material-icons">settings</i>-->
            <!--                </button>-->
            <!--            </div>-->
            <div class="button_row">
                <a id="valve3d_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Valve3D</a>
                <button id="valve3d_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="valve_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Valve</a>
                <button id="valve_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="pump3d_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Pump3D</a>
                <button id="pump3d_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="pump_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Pump</a>
                <button id="pump_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
        </nav>
        <span class="mdl-layout-title">Process</span>
        <nav id="feature-process" class="mdl-navigation">
            <div class="button_row">
                <a id="llchamber_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">LL Chamber</a>
                <button id="llchamber_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>

            <div class="button_row">
                <a id="celltrapl_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Cell Trap</a>
                <button id="celltrapl_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <!-- CK stuff-->
            <div class="button_row">
                <a id="gelchannel_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Gel channel</a>
                <button id="gelchannel_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <!-- endCK stuff-->
            <div class="button_row">
                <a id="diamond_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Diamond Chamber</a>
                <button id="diamond_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="thermoCycler_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">thermoCycler</a>
                <button id="thermoCycler_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="chamber_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Chamber</a>
                <button id="chamber_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="dropletgen_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button&#45;&#45;raised feature-button">Droplet Gen</a>
                <button id="dropletgen_params_button" class="params-button mdl-button mdl-js-button mdl-button&#45;&#45;icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
        </nav>
        <span class="mdl-layout-title">Distribute</span>

        <nav id="feature-distribute" class="mdl-navigation">
            <!-- CK stuff-->
            <div class="button_row">
                <a id="anode_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Anode</a>
                <button id="anode_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="cathode_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Cathode</a>
                <button id="cathode_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <!--end CK stuff-->
            <div class="button_row">
                <a id="port_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Port</a>
                <button id="port_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="via_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button&#45;&#45;raised feature-button">Via</a>
                <button id="via_params_button" class="params-button mdl-button mdl-js-button mdl-button&#45;&#45;icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row" hidden="true">
                <a id="mixer_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Mixer</a>
                <button id="mixer_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="tree_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Tree</a>
                <button id="tree_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="ytree_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Y-Tree</a>
                <button id="ytree_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="mux_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Mux</a>
                <button id="mux_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
            <div class="button_row">
                <a id="transposer_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">Transposer</a>
                <button id="transposer_params_button" class="params-button mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">settings</i>
                </button>
            </div>
        </nav>
    </div>
</template>

<script>
export default {
    name: "LayerToolbar",
    data() {
        return {};
    }
};
</script>

<style lang="scss" scoped>
.md-content {
    width: 75px;
    height: 200px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}
</style>
