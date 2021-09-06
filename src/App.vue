<template>
    <v-app id="3duf">
        <LayoutSidebar />
    </v-app>
</template>

<script>
import Visualiser from "./components/Visualiser.vue";
import LayoutSidebar from "./views/layouts/SplitLayout.vue";

export default {
    name: "App",
    components: {
        LayoutSidebar
    }
};
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
body {
    overflow: hidden;
    height: 100vh;
}
html {
    overscroll-behavior: none;
}
</style>
