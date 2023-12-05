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
    'ImageAudit': '',
    'Completeness': '',
    'WrongName': '',
    'Linking': '',
    'Surname': '',
    'AKA': '',
    'GivenName': '',
    'Gender': '',
    'BirthDate': '',
    'BirthPlace': '',
    'DeathDate': '',
    'DeathAge': '',
    'MigrationTo': '',
    'MigrationFrom': '',
    'Relationship': '',
});

const updateData = async () => {
    const result = await index.updateSLA({
        'userKey': userInfo.value.userKey,
        'SLAKey': originKey.value,
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
    if(props.originData._key){
        originKey.value = props.originData._key;
        form.value = {
            'ImageAudit': props.originData.ImageAudit,
            'Completeness': props.originData.Completeness,
            'WrongName': props.originData.WrongName,
            'Linking': props.originData.Linking,
            'Surname': props.originData.Surname,
            'AKA': props.originData.AKA,
            'GivenName': props.originData.GivenName,
            'Gender': props.originData.Gender,
            'BirthDate': props.originData.BirthDate,
            'BirthPlace': props.originData.BirthPlace,
            'DeathDate': props.originData.DeathDate,
            'DeathAge': props.originData.DeathAge,
            'MigrationTo': props.originData.MigrationTo,
            'MigrationFrom': props.originData.MigrationFrom,
            'Relationship': props.originData.Relationship,
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
                <el-form-item label="ImageAudit">
                    <el-input type="text" v-model="form.ImageAudit" />
                </el-form-item>
                <el-form-item label="Completeness">
                    <el-input type="text" v-model="form.Completeness" />
                </el-form-item>
                <el-form-item label="Wrong Name">
                    <el-input type="text" v-model="form.WrongName" />
                </el-form-item>
                <el-form-item label="Linking">
                    <el-input type="text" v-model="form.Linking" />
                </el-form-item>
                <el-form-item label="Surname">
                    <el-input type="text" v-model="form.Surname" />
                </el-form-item>
                <el-form-item label="AKA">
                    <el-input type="text" v-model="form.AKA" />
                </el-form-item>
                <el-form-item label="Given Name">
                    <el-input type="text" v-model="form.GivenName" />
                </el-form-item>
                <el-form-item label="Gender">
                    <el-input type="text" v-model="form.Gender" />
                </el-form-item>
                <el-form-item label="Birth Date">
                    <el-input type="text" v-model="form.BirthDate" />
                </el-form-item>
                <el-form-item label="Birth Place">
                    <el-input type="text" v-model="form.BirthPlace" />
                </el-form-item>
                <el-form-item label="Death Date">
                    <el-input type="text" v-model="form.DeathDate" />
                </el-form-item>
                <el-form-item label="Death Age">
                    <el-input type="text" v-model="form.DeathAge" />
                </el-form-item>
                <el-form-item label="Migration To">
                    <el-input type="text" v-model="form.MigrationTo" />
                </el-form-item>
                <el-form-item label="Migration From">
                    <el-input type="text" v-model="form.MigrationFrom" />
                </el-form-item>
                <el-form-item label="Relationship">
                    <el-input type="text" v-model="form.Relationship" />
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