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
const { } = global;

const props = defineProps({
    dataKey: String,
})

const emit = defineEmits(['close', 'save']);
const close = () => {
    emit('close');
}

const save = () => {
    if(form.value.examineType == 2){
        if(!form.value.notes){
            return createMsg(langData.value['打回时必填原因!']);
        }
    }
    SLACheck();
}

const form = ref({
    'examineType': 3,
    'notes': ''
});

/** 
 * SLA审核api 
 * @param {string} userKey - 用户key
 * @param {string} SLAKey - SLA key
 * @param {string} status - 状态
 * @param {string} returnReason - 打回原因
 * @returns {Object} {msg: 提示信息，status: 状态}
 */
 const SLACheck = async () => {
    const result = await index.SLACheck({
        'userKey': userInfo.value.userKey,
        'SLAKey': props.dataKey,
        'status': form.value.examineType,
        'returnReason': form.value.notes,
    });
    if(result.status == 200){
        emit('save', {});
    }else{
        createMsg(result.msg);
    }
}

onMounted(() => {

});

</script>

<template>
    <section class="examine-wrap">
        <header class="header">
            <h3>{{langData['审核']}}</h3>
        </header>
        <main class="main">
            <p class="desc">{{langData['操作审核后不可撤回，请谨慎操作。']}}</p>
            <el-form :model="form">
                <el-form-item :label="langData['审核结果']">
                    <el-radio-group v-model="form.examineType">
                        <el-radio :label="3">{{langData['通过']}}</el-radio>
                        <el-radio :label="5">{{langData['有条件通过']}}</el-radio>
                        <el-radio :label="4">{{langData['打回']}}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="langData['审核说明']">
                    <el-input v-model="form.notes" :rows="3" type="textarea" />
                </el-form-item>
                <!-- <el-form-item>
                    <el-button type="primary" @click="save">{{langData['确定']}}</el-button>
                    <el-button @click="close">{{langData['取消']}}</el-button>
                </el-form-item> -->
            </el-form>
        </main>
        <footer class="footer">
            <el-button type="primary" @click="save">{{langData['确定']}}</el-button>
            <el-button @click="close">{{langData['取消']}}</el-button>
        </footer>
    </section>
</template>

<style scoped lang="scss">
.examine-wrap{
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
        .desc{
            height: 3rem;
            line-height: 3rem;
            margin-bottom: 2rem;
        }
    }
    .footer{
        padding-bottom: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>