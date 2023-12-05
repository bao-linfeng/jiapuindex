<script setup>
import { ref, onMounted, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from './store/global.js';
import { getQueryVariable, setValue, createMsg, initLogin, getValue } from './util/ADS.js';
import AnchorModule from './components/AnchorModule.vue';
import {lang} from './language/lang.js';
import { ElNotification } from 'element-plus';

const route = useRoute();

const global = useGlobalStore();
const { pathActive, lanType, langData, userInfo } = storeToRefs(global);
const { saveProperyValue } = global;

let socket;
const initSocketIO = () => {
  saveProperyValue({'label': 'socket', 'value': inject('socket')});
    socket = inject('socket');
    socket.on("connect", (res) => {
      console.log(socket);
      socket.emit("login", {'userKey': userInfo.value.userKey, 'siteKey': '1528234980', 'type': 'index'});
      socket.emit("indexData", {'userKey': userInfo.value.userKey});
    });

    socket.on("indexStatisticsData", (data) => {
      console.log(data);
      saveProperyValue({'value': data.indexStatisticsData, 'label': 'indexStatisticsData'});
      saveProperyValue({'value': data.indexLogCount, 'label': 'indexLogCount'});
      if(data.msg){
        ElNotification({
          title: '消息通知',
          message: data.msg,
          type: 'success',
          duration: 0,
        })
        // let notification = new Notification('消息通知', {'body': data.msg});
        // notification.onclick = () => {
        //   router.push('/imageCenter?g='+data.catalogKey+'&v='+data.volumeKey+'&s=');
        // }
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(reason);
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });
    
    socket.on("connect_error", (error) => {
      console.log(error);
    });
}

onMounted(() => {
  getNavigatorLanguage();
  initLogin();
  initSocketIO();
});

const getNavigatorLanguage = () => {
    let lan = getValue('lanType') || navigator.language;
    console.log(lan);
    saveProperyValue({'value': lan.indexOf('zh') > -1 ? 'zh' : 'en', 'label': 'lanType'}, true);
    saveProperyValue({'value': lang[lanType.value], 'label': 'langData'});
    document.title = langData.value['家谱索引'];
}

watch(() => route, (to, from) => {
  console.log(to.path);
  saveProperyValue({'label': 'pathActive', 'value': to.path});
  socket.emit("login", {'userKey': userInfo.value.userKey, 'siteKey': '1528234980', 'type': 'index'});
  socket.emit("indexData", {'userKey': userInfo.value.userKey});
},{deep: true});

</script>

<template>
  <AnchorModule v-show="['/', '/imageView'].indexOf(pathActive) === -1" />
  <div class="app-wrap" :class="{active: ['/', '/imageView'].indexOf(pathActive) === -1}">
    <router-view></router-view>
  </div>
</template>

<style>
.app-wrap{
  position: relative;
  width: 100%;
}
.app-wrap.active{
    width: calc(100% - 22rem);
}
.orange-background{
    background: #ED7D31 !important;
    /* color: #000 !important; */
}
.green-background{
  background: #92D050 !important;
}
.center .el-form-item__content{
  justify-content: center !important;
}
.cell-blue{
  color: #358acd;
}
.w150{
  width: 150px !important;
}
.red-color{
  color: #f00;
}
</style>
