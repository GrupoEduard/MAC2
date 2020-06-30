<template>
  <div class="about">
    <h1>Hola 2.0</h1>
  </div>
</template>
<script>
import LocalWatcher from "../sync/localwatcher";
const icons = [
  null,
  "mdi-file-pdf-box",
  "mdi-image",
  "mdi-movie",
  "mdi-file-presentation-box"
];
import "@/plugins/vue-socket.io";
export default {
  name: "sync",
  layout: "navbar",
  
};
</script>