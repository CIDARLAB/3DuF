import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";
<<<<<<< HEAD

Vue.config.productionTip = false;

=======
import Vuetify from "vuetify";

Vue.config.productionTip = false;
Vue.use(Vuetify);
export default new Vuetify({
    icons: {
        iconfont: "mdiSvg"
    }
});
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
new Vue({
    vuetify,
    render: h => h(App)
}).$mount("#app");
