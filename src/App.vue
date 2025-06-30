<script setup lang="ts">
import mapboxgl from "mapbox-gl";
import { ref, onMounted } from "vue";
import pwg from "@/utils/core/pwg/pwg-module";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmxpY2tlcjA1NiIsImEiOiJjbGd4OXM1c3cwOWs3M21ta2RiMDhoczVnIn0.lE8NriBf_g3RZWCusw_mZA";

const mapContainer = ref(null);

onMounted(() => {
  const map = new mapboxgl.Map({
    container: "container",
    zoom: 14,
    minZoom: 1,
    center: [118.626926, 28.737245],
    pitchWithRotate: false,
    dragRotate: false,
    style: "mapbox://styles/mapbox/streets-v9",
  });

  console.log(pwg)
});
</script>

<template>
  <div id="container" ref="mapContainer"></div>
</template>

<style scoped>
@import 'mapbox-gl/dist/mapbox-gl.css';

#container {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
