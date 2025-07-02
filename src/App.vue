<script setup lang="ts">
import mapboxgl from "mapbox-gl";
import { ref, onMounted } from "vue";
import PWGDraw from "@/utils/core/pwg/pwg-draw";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmxpY2tlcjA1NiIsImEiOiJjbGd4OXM1c3cwOWs3M21ta2RiMDhoczVnIn0.lE8NriBf_g3RZWCusw_mZA";

const mapContainer = ref(null);
const builds = ref<{ name: string; label: string }[]>([]);
const features = ref<{ id: string; type: string }[]>([]);

const highlightedFeatureId = ref<string | null>(null);
const hiddenFeatures = ref<Set<string>>(new Set());

let pwg: PWGDraw | undefined;

const onCreateClassChanged = (event: Event) => {
  const selectedOptions = (event.target as HTMLSelectElement).selectedOptions;
  for (let i = 0; i < selectedOptions.length; i++) {
    const item = selectedOptions[i];
    console.log("选中对象：", item.textContent);
    // 清除之前的高亮
    highlightedFeatureId.value = null;
    pwg?.changeMode("create", { name: item.value });
  }
};

const selectFeatureById = (id: string) => {
  highlightedFeatureId.value = id;
  pwg?.changeMode("edit", { featureId: id });
};

const deleteFeatureById = (id: string) => {
  if (highlightedFeatureId.value === id) {
    highlightedFeatureId.value = null;
  }
  let result = pwg?.removeFeatureById(id);
  console.log(result)
};

// 切换feature的显隐状态
const toggleFeatureVisibility = (id: string) => {

  if (hiddenFeatures.value.has(id)) {
    // 如果特征已隐藏，则显示它
    hiddenFeatures.value.delete(id);
    console.log("显示对象：", id);
  } else {
    // 如果特征可见，则隐藏它
    hiddenFeatures.value.add(id);
    //pwg?.hideFeature(feature.id);
    console.log("隐藏对象：", id);
  }
};

// 更新feature列表的函数
const updateFeaturesList = () => {
  if (pwg) {
    features.value = pwg.getAllFeatures() || [];
  }
};

onMounted(() => {
  const map = new mapboxgl.Map({
    container: "container",
    zoom: 14,
    minZoom: 1,
    center: [118.626926, 28.737245],
    // pitchWithRotate: false,
    // dragRotate: false,
    style: "mapbox://styles/mapbox/streets-v9",
  });

  pwg = new PWGDraw(map);

  builds.value = pwg.getAllBuilds();

  pwg.on("draw.create", (e) => {
    updateFeaturesList();
    highlightedFeatureId.value = e.featureId;
    pwg?.changeMode("edit", e);
  });

  pwg.on("draw.remove", (e) => {
    updateFeaturesList();
    if (highlightedFeatureId.value === e.featureId) {
      highlightedFeatureId.value = null;
    }
  });

  pwg.on("draw.select", (e) => {
    highlightedFeatureId.value = e.featureId;
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.key === "Esc") {
      pwg?.changeMode("none");
    }
  });

  updateFeaturesList();
});
</script>

<template>
  <div id="app">
    <div id="sidebar">
      <div class="sidebar-header">对象列表</div>
      <select id="h_create_calss_list" multiple @change="onCreateClassChanged">
        <option
          v-for="(build, index) in builds"
          :key="index"
          :value="build.name"
        >
          {{ build.label }}
        </option>
      </select>

      <div class="sidebar-header" style="margin-top: 15px">绘制对象列表</div>
      <div id="features-list">
        <div
          v-for="(feature, index) in features"
          :key="feature.id"
          class="feature-item"
          :class="{
            'feature-highlighted': feature.id === highlightedFeatureId,
            'feature-hidden': hiddenFeatures.has(feature.id),
          }"
          @click="selectFeatureById(feature.id)"
        >
          <div class="feature-content">
            {{ feature.id }}
          </div>
          <div class="feature-actions">
            <button
              class="feature-action-btn visibility-btn"
              :title="hiddenFeatures.has(feature.id) ? '显示' : '隐藏'"
              @click.stop="toggleFeatureVisibility(feature.id)"
            >
              <span v-if="hiddenFeatures.has(feature.id)">👁️‍🗨️</span>
              <span v-else>👁️</span>
            </button>
            <button
              class="feature-action-btn delete-btn"
              title="删除"
              @click.stop="deleteFeatureById(feature.id)"
            >
              🗑️
            </button>
          </div>
        </div>
        <div v-if="features.length === 0" class="no-features">暂无绘制对象</div>
      </div>
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
  height: 200px; /* 调整高度留出空间给新列表 */
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

/* 列表样式 */
#features-list {
  width: 100%;
  height: 200px;
  background-color: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  padding: 5px;
  overflow-y: auto;
}

.feature-item {
  padding: 8px;
  margin: 2px 0;
  background-color: #2d2d2d;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feature-item:hover {
  background-color: #3c3c3c;
}

.feature-content {
  flex-grow: 1;
}

.feature-actions {
  display: flex;
  gap: 4px;
}

.feature-action-btn {
  background-color: transparent;
  border: none;
  border-radius: 3px;
  color: #d4d4d4;
  cursor: pointer;
  padding: 2px 5px;
  font-size: 12px;
  transition: all 0.2s;
}

.feature-action-btn:hover {
  background-color: #454545;
}

.delete-btn:hover {
  background-color: rgba(255, 70, 70, 0.3);
}

/* 高亮样式 */
.feature-highlighted {
  background-color: #0e639c;
  border-left: 3px solid #1c9fff;
  box-shadow: 0 0 3px rgba(28, 159, 255, 0.5);
}

/* 隐藏特征样式 */
.feature-hidden {
  opacity: 0.5;
  font-style: italic;
  border-left: 3px solid #aaaaaa;
}

.no-features {
  padding: 10px;
  text-align: center;
  color: #888;
  font-style: italic;
}

#container {
  flex: 1;
  position: relative;
}
</style>
