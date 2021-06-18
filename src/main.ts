import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";
import Vuetify from "vuetify/lib";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import ToggleButton from "vue-js-toggle-button";

Vue.config.productionTip = false;

Vue.use(Vuetify);
Vue.use(ToggleButton);

export default new Vuetify({
    icons: {
        iconfont: "mdiSvg"
    }
});
new Vue({
    vuetify,
    render: h => h(App)
}).$mount("#app");
