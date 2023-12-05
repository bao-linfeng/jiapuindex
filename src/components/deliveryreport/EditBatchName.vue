<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../../store/global.js';
import { createMsg } from '../../util/ADS.js';
import { index } from '../../util/api';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, orgMemberInfo, langData } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    dataKey: String,
    DeliverBatchName: String,
})

const emit = defineEmits(['close', 'save']);
const close = () => {
    emit('close');
}

const save = () => {
    if(!form.value.batchName){
        return createMsg(langData.value['批次名必填!']);
    }
    deliverBatchName();
}

const form = ref({
    'batchName': ''
});

/** 
 * 批次名修改api 
 * @param {string} userKey - 用户key
 * @param {string} newDeliverBatchName - 新批次名
 * @param {string} deliverBatchKey - 交付批次key
 * @returns {Object} {msg: 提示信息，status: 状态}
 */
 const deliverBatchName = async () => {
    const result = await index.deliverBatchName({
        'userKey': userInfo.value.userKey,
        'newDeliverBatchName': form.value.batchName,
        'deliverBatchKey': props.dataKey,
    });
    if(result.status == 200){
        emit('save', {});
    }else{
        createMsg(result.msg);
    }
}

onMounted(() => {
    form.value.batchName = props.DeliverBatchName;
});

</script>

<template>
    <section class="edit-batch-wrap">
        <header class="header">
            <h3>{{langData['编辑']}}</h3>
        </header>
        <main class="main">
            <el-form :model="form">
                <el-form-item :label="langData['批次名']">
                    <el-input v-model="form.batchName" />
                </el-form-item>
                <el-form-item>
                    <el-button @click="close">{{langData['取消']}}</el-button>
                    <el-button type="primary" @click="save">{{langData['确定']}}</el-button>
                </el-form-item>
            </el-form>
        </main>
    </section>
</template>

<style scoped lang="scss">
.edit-batch-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 5rem;
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
}
</style>