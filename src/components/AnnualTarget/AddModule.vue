<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '../../store/global.js';
import { createMsg } from '../../util/ADS.js';
import { index } from '../../util/api';
import { ElLoading } from 'element-plus';

const router = useRouter();

const global = useGlobalStore();
const { userInfo, langData, orgList } = storeToRefs(global);
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
        editData();
    }else{
        addData();
    }
}

const orgListArr = ref([]);
const originKey = ref('');
const form = ref({
    'year': new Date().getFullYear()+'',
    'orgKey': '',
    'targetNumber': ''
});

const addData = async () => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    const result = await index.addTarget({
        'userKey': userInfo.value.userKey,
        'type': '1',
        'orgKey': form.value.orgKey,
        'targetNumber': Number(form.value.targetNumber),
        'year': form.value.year,
    });
    loading.close();
    if(result.status == 200){
        createMsg(langData.value['新增成功!'], true);
        emit('save', {});
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
    const result = await index.updateTarget({
        'userKey': userInfo.value.userKey,
        'targetKey': originKey.value,
        'targetNumber': Number(form.value.targetNumber),
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
    orgListArr.value = orgList.value.filter((ele) => {
        return ele.label != 'FS';
    });

    if(props.originData._key){
        originKey.value = props.originData._key;
        form.value = {
            'year': props.originData.year+'',
            'orgKey': props.originData.orgKey,
            'targetNumber': props.originData.targetNumber
        };
    }
});

</script>

<template>
    <section class="add-wrap">
        <header class="header">
            <h3>{{originKey ? langData['编辑'] : langData['新增']}}</h3>
        </header>
        <main class="main">
            <el-form :model="form" label-width="82px">
                <el-form-item :label="langData['年份']">
                    <el-date-picker
                        class="w150"
                        v-model="form.year"
                        value-format="YYYY"
                        type="year"
                        :placeholder="langData['年份']"
                        :disabled="!!originKey"
                    />
                </el-form-item>
                <el-form-item :label="langData['机构']">
                    <el-select v-model="form.orgKey" class="w150" :placeholder="langData['机构列表']" :disabled="!!originKey">
                        <el-option v-for="item in orgListArr" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="langData['目标节点数']">
                    <el-input class="w150" type="Number" v-model="form.targetNumber" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="save">{{langData['确定']}}</el-button>
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
</style>