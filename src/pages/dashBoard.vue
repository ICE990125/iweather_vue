<template>
  <q-page>
    <q-scroll-area style="height: 100vh" :thumb-style="{ width: '0px' }">
      <div class="row items-stretch home-page__container">
        <!-- main -->
        <div class="col-xs-12 col-sm-6 col-md-9 q-pa-sm">
          <ice-main :visible="ready" @open-map="openMap = true"></ice-main>
        </div>
        <!-- aqi -->
        <div class="col-xs-12 col-sm-6 col-md-3 q-pa-sm">
          <ice-air :visible="ready"></ice-air>
        </div>
        <!-- 小时概述 -->
        <div class="col-xs-12 col-sm-12 col-md-9 q-pa-sm card">
          <ice-hourly :visible="ready"></ice-hourly>
        </div>
        <!-- 日月升落 -->
        <div class="col-xs-12 col-sm-6 col-md-3 q-pa-sm card">
          <ice-astronomy :visible="ready"></ice-astronomy>
        </div>
        <!-- 逐天 -->
        <div class="col-xs-12 col-sm-12 col-md-5 q-pa-sm card_2">
          <ice-daily :visible="ready"></ice-daily>
        </div>
      </div>
    </q-scroll-area>

    <!-- 底部悬浮按钮 -->
    <q-page-sticky
      v-if="!$q.screen.xs"
      style="z-index: 999"
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn fab icon="search" color="primary" @click="openMap = true" />
    </q-page-sticky>

    <!-- 地图选点-->
    <ice-map
      v-model="openMap"
      @confirm="confirm"
      :lat="loc.latitude"
      :lng="loc.longitude"
      :addr="loc.address"
      :city="loc.city"
    ></ice-map>
  </q-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'dashBoardPage',
});
</script>

<script lang="ts" setup>
import iceMain from 'components/ice-main.vue';
import iceAir from 'components/ice-air.vue';
import iceAstronomy from 'components/ice-astronomy.vue';
import iceHourly from 'components/ice-hourly.vue';
import iceDaily from 'components/ice-daily.vue';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import iceMap from 'src/components/ice-map.vue';
import { useLocationStore, useWeatherStore } from 'stores/stores';

const location = useLocationStore();
const openMap = ref(false);

function confirm(e: IMapData) {
  location.changeLocation(e);
}

const { ready } = storeToRefs(useWeatherStore());
const { current: loc } = storeToRefs(location);

if (process.env.NODE_ENV === 'development') {
  useWeatherStore().getAllWeather();
} else {
  location.getLocation();
}
</script>

<style lang="scss" scoped>
@mixin bs {
  box-sizing: border-box;
}

.home-page__container {
  $height: 300px;
  $height_2: 360px;
  @include bs;

  @media screen and (max-width: 600px) {
    padding-bottom: 72px; // 这是 tabbar 高度
  }

  .card {
    height: $height;
    @include bs;
  }

  .card_2 {
    height: $height_2;
    @include bs;
  }
}
</style>

