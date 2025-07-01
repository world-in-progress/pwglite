<script setup lang="ts">
import mapboxgl from "mapbox-gl";
import { ref, onMounted } from "vue";
// import pwg from "@/utils/core/pwg/pwg-module";
import pwglite from "@/utils/core/pwg/pwglite";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmxpY2tlcjA1NiIsImEiOiJjbGd4OXM1c3cwOWs3M21ta2RiMDhoczVnIn0.lE8NriBf_g3RZWCusw_mZA";

const mapContainer = ref(null);
const builds = ref<{ name: string; label: string }[]>([]);
let pwg;
// const builds = ref([
//   "建筑物",
//   "道路",
//   "桥梁",
//   "隧道",
//   "公园",
//   "水体",
//   "绿地",
//   "其他",
// ]);

const onCreateClassChanged = (event: Event) => {
  const selectedOptions = (event.target as HTMLSelectElement).selectedOptions;
  for (let i = 0; i < selectedOptions.length; i++) {
    const item = selectedOptions[i];
    console.log("选中对象：", item.textContent);
    // pwg.activateBuild(item.textContent)
    pwg.changeMode("create", { name: item.value });
  }
};

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

  pwg = new pwglite(map);

  builds.value = pwg.getAllBuilds();

  pwg.on("draw.create", (e) => {
    pwg.changeMode("edit", {featureId: e})
    console.log(pwg.getAllFeatures());
  });

  pwg.on("draw.remove", (e) => {
    console.log(e);
  });
});
</script>

<template>
  <div id="app">
    <!-- 侧边栏 -->
    <div id="sidebar">
      <div class="sidebar-header">对象列表</div>
      <select id="h_create_calss_list" multiple @change="onCreateClassChanged">
        <option v-for="(build, index) in builds" :key="index" :value="build.name">
          {{ build.label }}
        </option>
      </select>
    </div>

    <!-- 地图容器 -->
    <div id="container" ref="mapContainer"></div>
  </div>
</template>

<style scoped>
@import "mapbox-gl/dist/mapbox-gl.css";

#app {
  display: flex;
  height: 100vh;
  background-color: #1e1e1e; /* 深色背景 */
}

#sidebar {
  width: 300px;
  height: 100%;
  background-color: #252526; /* 深灰色背景 */
  color: #d4d4d4; /* 浅灰色文字 */
  border-right: 1px solid #3c3c3c; /* 分隔线 */
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
}

.sidebar-header {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10px;
  border-bottom: 1px solid #3c3c3c;
  padding-bottom: 5px;
}

#h_create_calss_list {
  width: 100%;
  height: 400px;
  background-color: #1e1e1e; /* 深色背景 */
  color: #d4d4d4; /* 浅灰色文字 */
  border: 1px solid #3c3c3c; /* 边框 */
  border-radius: 4px;
  padding: 5px;
  font-size: 14px;
  outline: none;
}

#h_create_calss_list option {
  background-color: #252526; /* 深灰色背景 */
  color: #d4d4d4; /* 浅灰色文字 */
  padding: 5px;
}

#h_create_calss_list option:hover {
  background-color: #3c3c3c; /* 鼠标悬停效果 */
}

#container {
  flex: 1;
  position: relative;
}
</style>
