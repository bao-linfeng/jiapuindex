<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../../store/global.js';
import { createMsg } from '../../util/ADS.js';
import { index } from '../../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, langData } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    originData: Object,
})

const emit = defineEmits(['close', 'save']);
const close = () => {
    emit('close');
}

const save = () => {
    if(originKey.value){
        updateData();
    }
}

const originKey = ref('');
const form = ref({
    'JHNodeCount': '',
    'regularNodeCount': '',
    'totalPersonCount': '',
    'maleCount': '',
    'femaleCount': '',
    'bxCount': '',
    'deadCount': '',
    'deliveryMemo': '',
});

const updateData = async () => {
    const result = await index.updateProduction({
        'userKey': userInfo.value.userKey,
        'gcKey': originKey.value,
        'patchData': form.value,
    });
    if(result.status == 200){
        createMsg(langData.value['编辑成功！'], true);
        emit('save', {});
    }else{
        createMsg(result.msg);
    }
}

onMounted(() => {
    if(props.originData.gcKey){
        originKey.value = props.originData.gcKey;
        form.value = {
            'JHNodeCount': Number(props.originData.JHNodeCount),
            'regularNodeCount': Number(props.originData.regularNodeCount),
            'totalPersonCount': Number(props.originData.totalPersonCount),
            'maleCount': Number(props.originData.maleCount),
            'femaleCount': Number(props.originData.femaleCount),
            'bxCount': Number(props.originData.bxCount),
            'deadCount': Number(props.originData.deadCount),
            'deliveryMemo': props.originData.deliveryMemo,
        };
    }
});

</script>

<template>
    <section class="edit-production-wrap">
        <header class="header">
            <h3>{{originKey ? langData['编辑'] : langData['新增']}}</h3>
        </header>
        <main class="main">
            <el-form :model="form" label-width="200px">
                <el-form-item :label="langData['#节点']">
                    <el-input type="Number" v-model="form.JHNodeCount" />
                </el-form-item>
                <el-form-item :label="langData['常规节点']">
                    <el-input type="Number" v-model="form.regularNodeCount" />
                </el-form-item>
                <el-form-item :label="langData['总人数']">
                    <el-input type="Number" v-model="form.totalPersonCount" />
                </el-form-item>
                <el-form-item :label="langData['男性']">
                    <el-input type="Number" v-model="form.maleCount" />
                </el-form-item>
                <el-form-item :label="langData['女性']">
                    <el-input type="Number" v-model="form.femaleCount" />
                </el-form-item>
                <el-form-item :label="langData['性别未知']">
                    <el-input type="Number" v-model="form.bxCount" />
                </el-form-item>
                <el-form-item :label="langData['去世节点数']">
                    <el-input type="Number" v-model="form.deadCount" />
                </el-form-item>
                <el-form-item :label="langData['交付备注']">
                    <el-input type="text" v-model="form.deliveryMemo" />
                </el-form-item>
                <el-form-item>
                    <el-button @click="close">{{langData['取消']}}</el-button>
                    <el-button type="primary" @click="save">{{langData['确定']}}</el-button>
                </el-form-item>
            </el-form>
        </main>
        <footer class="footer">
            
        </footer>
    </section>
</template>

<style scoped lang="scss">
.edit-production-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 2rem;
    background: #fff;
    z-index: 1000;
    border-radius: 5px;
    box-shadow: 0 0 1px 2px #ddd;
    .header{
        height: 6rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .main{

    }
    .footer{
        height: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>