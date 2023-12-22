<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../store/global.js';
import { createMsg } from '../util/ADS.js';
import { index } from '../util/api';
import { ElLoading } from 'element-plus';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, langData, orgList, siteKey } = storeToRefs(global);
const {  } = global;

const props = defineProps({
    catalogKey: String,
})

const emit = defineEmits(['close', 'save']);
const close = () => {
    emit('close');
}

const form = ref({
    'NoIndex': '',
    'explain': '',
});

const catalogKey = ref('');
const genealogyName = ref('');

const getGenealogyDetail = async () => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.getGenealogyDetail({
        'catalogKey': props.catalogKey,
    });
    loading.close();
    if(result.status == 200){
        form.value = {
            'NoIndex': result.data.NoIndex,
            'explain': result.data.explain,
        };
        genealogyName.value = result.data.genealogyName;
    }else{
        createMsg(result.msg);
    }
}

const editData = async () => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.dataEdit({
        'userKey': userInfo.value.userKey,
        'dataKey': catalogKey.value,
        'dataObj': form.value,
        'type': 'index',
    });
    loading.close();
    if(result.status == 200){
        createMsg(langData.value['编辑成功！'], true);
        emit('save', {});
    }else{
        createMsg(result.msg);
    }
}

onMounted(() => {
    catalogKey.value = props.catalogKey;
    getGenealogyDetail();
});

</script>

<template>
    <section class="add-wrap">
        <header class="header">
            <h3>{{langData['编辑']}}</h3>
        </header>
        <main class="main">
            <el-form :model="form" label-width="50px">
                <el-form-item :label="langData['谱ID']">
                    <p>{{catalogKey}}</p>
                </el-form-item>
                <el-form-item :label="langData['谱名']">
                    <p>{{genealogyName}}</p>
                </el-form-item>
                <el-form-item :label="langData['索引']">
                    <el-radio-group v-model="form.NoIndex">
                        <el-radio :label="0">可索引</el-radio>
                        <el-radio :label="1">不可索引</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="langData['说明']">
                    <el-input class="w200" type="textarea" :rows="4" v-model="form.explain" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="editData">{{langData['确定']}}</el-button>
                    <el-button @click="close">{{langData['取消']}}</el-button>
                </el-form-item>
            </el-form>
        </main>
        <footer class="footer">
            
        </footer>
    </section>
</template>

<style scoped lang="scss">
.add-wrap{
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
    .footer{
        height: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
.w200{
    width: 250px;
    font-size: 12px;
}
</style>