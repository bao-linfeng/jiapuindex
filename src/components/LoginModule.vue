<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';

const global = useGlobalStore();
const { time } = storeToRefs(global);
const { changeTime } = global;

defineProps({
  msg: String,
})

const emit = defineEmits(['close'])

const parameter = ref({'account': '', 'password': ''});
const rules = ref({
    account: {
        required: true,
        trigger: ["blur", "input"],
        message: "请输入账号"
    },
    password: {
        required: true,
        trigger: ["blur", "input"],
        message: "请输入密码"
    },
});

const close = () => {
    emit('close');
}

</script>

<template>
  <section class="login-wrap">
    <header class="header">
      <h3 class="title">登录</h3>
    </header>
    <main class="main">
        
    </main>
    <footer class="footer">
    </footer>
  </section>
</template>

<style scoped lang="scss">
.login-wrap{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0.2rem 0.3rem #f0f0f0;
    padding: 2rem;
    border-radius: 0.5rem;
    background: #fff;
    .header{
      display: flex;
      justify-content: center;
      align-items: center;
      .title{
        font-size: 2rem;
      }
    }
    .main{
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 10px 0;
    }
    .footer{
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
