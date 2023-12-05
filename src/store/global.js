import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getValue, createMsg, setValue } from '../util/ADS.js';

export const useGlobalStore = defineStore('global', () => {
  const origin = ref(window.location.origin || '');
  const pathActive = ref('/');
  const token = ref(getValue('token') || '');
  const userInfo = ref(getValue('userInfo') ? JSON.parse(getValue('userInfo')) : {});
  const orgMemberInfo = ref(getValue('userInfo') ? JSON.parse(getValue('orgMemberInfo')) : {});
  const orgList = ref(getValue('orgList') ? JSON.parse(getValue('orgList')) : []);
  const orgObj = ref(getValue('orgObj') ? JSON.parse(getValue('orgObj')) : {});
  const lanType = ref(getValue('lanType') || '');
  const langData = ref({});
  const indexStatisticsData = ref(0);
  const indexLogCount = ref(0);
  const saveProperyValue = (data, f = false) => {
    switch(data.label){
      case 'token':
        token.value = data.value;
        break;
      case 'userInfo':
        userInfo.value = data.value;
        break;
      case 'orgMemberInfo':
        orgMemberInfo.value = data.value;
        break;
      case 'pathActive':
        pathActive.value = data.value;
        break;
      case 'orgList':
        orgList.value = data.value;
        break;
      case 'orgObj':
        orgObj.value = data.value;
        break;
      case 'lanType':
        lanType.value = data.value;
        break;
      case 'langData':
        langData.value = data.value;
        break;
      case 'indexStatisticsData':
        indexStatisticsData.value = data.value;
        break;
      case 'indexLogCount':
        indexLogCount.value = data.value;
        break;
      default:
        console.log('未定义属性');
    }
    if(f){
      setValue(data.label, f == 'dep' ? JSON.stringify(data.value) : data.value);
    }
  }

  return { 
    token, 
    userInfo,
    origin,
    pathActive,
    orgMemberInfo,
    orgList,
    orgObj,
    lanType,
    langData,
    saveProperyValue,
    indexStatisticsData,
    indexLogCount,
  };
});
