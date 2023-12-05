<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { setValue } from '../util/ADS.js';

const router = useRouter();

const global = useGlobalStore();
const { userInfo } = storeToRefs(global);
const {  } = global;


</script>

<template>
    <section class="card-wrap">
        <header class="header">
            <h3>家谱索引</h3>
        </header>
        <main class="main"></main>
        <footer class="footer"></footer>
    </section>
</template>

<style scoped lang="scss">
.card-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    background: #fff;
    .header{
        
    }
    .main{
        
    }
    .footer{
        
    }
}
</style>