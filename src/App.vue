<script setup lang="ts">
import mapboxgl from "mapbox-gl";
import { ref, onMounted } from "vue";
// import pwg from "@/utils/core/pwg/pwg-module";
import PWGLite from "@/utils/core/pwg/pwglite";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmxpY2tlcjA1NiIsImEiOiJjbGd4OXM1c3cwOWs3M21ta2RiMDhoczVnIn0.lE8NriBf_g3RZWCusw_mZA";

const mapContainer = ref(null);
const builds = ref<{ name: string; label: string }[]>([]);
// 用户绘制的图形列表
const features = ref<any[]>([]);
// 高亮特征的ID
const highlightedFeatureId = ref<string | null>(null);
// 跟踪隐藏的特征
const hiddenFeatures = ref<Set<string>>(new Set());

let pwg: PWGLite | undefined;

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

// 选中feature时激活编辑模式
const onFeatureSelected = (feature: any) => {
  console.log("选中要编辑的对象：", feature);
  // 设置当前高亮的特征ID
  highlightedFeatureId.value = feature.id;
  pwg?.changeMode("edit", feature);
};

// 删除选中的feature
const deleteFeature = (feature: any, event: Event) => {
  // 阻止事件冒泡，避免触发选中事件
  event.stopPropagation();
  console.log("删除对象：", feature);
  //pwg?.removeFeature(feature.id);
  // 如果删除的是高亮特征，清除高亮状态
  if (highlightedFeatureId.value === feature.id) {
    highlightedFeatureId.value = null;
  }
};

// 切换feature的显隐状态
const toggleFeatureVisibility = (feature: any, event: Event) => {
  // 阻止事件冒泡，避免触发选中事件
  event.stopPropagation();
  
  if (hiddenFeatures.value.has(feature.id)) {
    // 如果特征已隐藏，则显示它
    hiddenFeatures.value.delete(feature.id);
    //pwg?.showFeature(feature.id);
    console.log("显示对象：", feature);
  } else {
    // 如果特征可见，则隐藏它
    hiddenFeatures.value.add(feature.id);
    //pwg?.hideFeature(feature.id);
    console.log("隐藏对象：", feature);
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
    pitchWithRotate: false,
    dragRotate: false,
    style: "mapbox://styles/mapbox/streets-v9",
  });

  pwg = new PWGLite(map);

  builds.value = pwg.getAllBuilds();

  pwg.on("draw.create", (e) => {
    // 设置新创建的特征为高亮状态
    highlightedFeatureId.value = e.id;
    pwg?.changeMode("edit", e);
    console.log(pwg?.getAllFeatures());
    // 更新features列表
    updateFeaturesList();
  });

  pwg.on("draw.remove", (e) => {
    // 如果删除的是高亮特征，清除高亮状态
    if (highlightedFeatureId.value === e.id) {
      highlightedFeatureId.value = null;
    }
    // 如果删除的特征在隐藏列表中，也要移除
    if (hiddenFeatures.value.has(e.id)) {
      hiddenFeatures.value.delete(e.id);
    }
    console.log(e);
    // 更新features列表
    updateFeaturesList();
  });

  pwg.on("draw.update", () => {
    // 更新features列表
    updateFeaturesList();
  });
  
  // 初始化特征列表
  updateFeaturesList();
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

      <!-- 用户绘制的图形列表 -->
      <div class="sidebar-header" style="margin-top: 15px;">绘制对象列表</div>
      <div id="features-list">
        <div 
          v-for="(feature, index) in features" 
          :key="feature.id" 
          class="feature-item"
          :class="{
            'feature-highlighted': feature.id === highlightedFeatureId,
            'feature-hidden': hiddenFeatures.has(feature.id)
          }"
          @click="onFeatureSelected(feature)"
        >
          <div class="feature-content">
            {{ feature.properties?.name || feature.properties?.type || '未命名对象' }} #{{ index + 1 }}
          </div>
          <div class="feature-actions">
            <button 
              class="feature-action-btn visibility-btn" 
              :title="hiddenFeatures.has(feature.id) ? '显示' : '隐藏'" 
              @click="toggleFeatureVisibility(feature, $event)"
            >
              <span v-if="hiddenFeatures.has(feature.id)">👁️‍🗨️</span>
              <span v-else>👁️</span>
            </button>
            <button 
              class="feature-action-btn delete-btn" 
              title="删除" 
              @click="deleteFeature(feature, $event)"
            >
              🗑️
            </button>
          </div>
        </div>
        <div v-if="features.length === 0" class="no-features">
          暂无绘制对象
        </div>
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