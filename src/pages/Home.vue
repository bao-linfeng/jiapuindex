<script setup>
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { useRoute, useRouter } from 'vue-router';
import { user, index } from '../util/api';
import { getQueryVariable, setValue, createMsg, openLogin } from '../util/ADS.js';
import LoginModule from '../components/LoginModule.vue';

const global = useGlobalStore();
const { token, userInfo, origin, langData, lanType, orgMemberInfo } = storeToRefs(global);
const { saveProperyValue } = global;

const router = useRouter();

defineProps({
  msg: String,
});

// 登录模块
const isLigin = ref(0);
const toggleLogin = (i) => {
  isLigin.value = i;
}

onMounted(() => {
  const TOKEN = getQueryVariable('token');
  if(TOKEN){
    saveProperyValue({'label': 'token','value': TOKEN}, true);
    getUserInfo(TOKEN);
  }
  if(token.value){
    getOrgList();
  }
});

const getUserInfo = async () => {
  const data = await user.getUserInfo(token.value);
  if(data.statusCode == 200){
    let result = data.result;

    saveProperyValue({'label': 'userInfo','value': {
      'userKey': result._key,
      'userName': result.profile.trueName || result.profile.nickName,
      'avatar': result.profile.avatar,
    }}, 'dep');
    router.push('/');
    getOrgMemberInfo(result._key);
    getOrgList();
  }else{
    createMsg(result.msg);
  }
}

const getOrgMemberInfo = async (userKey) => {
  const result = await index.orgMemberInfo({'userKey': userKey});
  if(result.status == 200){
    saveProperyValue({'value': result.data || {}, 'label': 'orgMemberInfo'}, 'dep');
    if(result.data.role){
      orgMemberInfo.value.englishName == 'FS' && orgMemberInfo.value.role == 2 ? router.push('/SLA') : router.push('/overview');
    }else{
      createMsg(langData.value['您还不是机构成员，请联系你的管理员！']);
    }
  }else{
    createMsg(result.msg);
  }
}

const getOrgList = async () => {
    const result = await index.getOrgList({'userKey': userInfo.value.userKey});
    if(result.status == 200){
      let O = {};
        result.data.map((ele) => {
            ele.label = lanType.value == 'en' ? ele.englishName : ele.orgName;
            ele.value = ele.orgKey;
            O[ele.orgKey] = lanType.value == 'en' ? ele.englishName : ele.orgName;
            return ele;
        });
        saveProperyValue({'value': result.data, 'label': 'orgList'}, 'dep');
        saveProperyValue({'value': O, 'label': 'orgObj'}, 'dep');
    }else{
        createMsg(result.msg);
    }
}

const login = () => {
  if(token.value){
    if(orgMemberInfo.value.role){
      orgMemberInfo.value.englishName == 'FS' && orgMemberInfo.value.role == 2 ? router.push('/SLA') : router.push('/overview');
    }else{
      createMsg(langData.value['您还不是机构成员，请联系你的管理员！']);
      logout();
    }
  }else{
    openLogin(lanType.value);
  }
}

const logout = () => {
    saveProperyValue({'label': 'token', 'value': ''});
    saveProperyValue({'label': 'userInfo', 'value': ''});
    localStorage.clear();
    router.push('/');
}

</script>

<template>
  <div class="home-wrap">
    <img v-if="lanType != 'zh'" class="login" @click="login" src="../assets/login.svg" alt="">
    <img v-else class="login" @click="login" src="../assets/loginZH.svg" alt="">
  </div>
  <LoginModule v-if="isLigin" @close="toggleLogin(0)" />
</template>

<style scoped lang="scss">
.home-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background: url('../assets/home-bg.png') 50% 50% no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  .login{
    position: absolute;
    bottom: 200px;
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;
  }
}
</style>
