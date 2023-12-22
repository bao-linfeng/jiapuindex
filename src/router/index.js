import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router';
import Home from '../pages/Home.vue';
import Overview from '../pages/Overview.vue';
import CatalogDetail from '../pages/CatalogDetail.vue';
import Organization from '../pages/Organization.vue';
import ImageStorageReport from '../pages/ImageStorageReport.vue';
import IndexAllocationAndCompletionReport from '../pages/IndexAllocationAndCompletionReport.vue';
import IndexDeliveryReport from '../pages/IndexDeliveryReport.vue';
import DeliveryReport from '../pages/DeliveryReport.vue';
import YearCompleteReport from '../pages/YearCompleteReport.vue';
import SLA from '../pages/SLA.vue';
import Production from '../pages/Production.vue';
import Metadata from '../pages/Metadata.vue';
import SystemLog from '../pages/SystemLog.vue';
import UpdateLog from '../pages/UpdateLog.vue';
import AnnualTarget from '../pages/AnnualTarget.vue';
import ImageView from '../pages/ImageView.vue';

const routes = [
  {path: '/', component: Home},
  {path: '/overview', component: Overview},
  {path: '/catalogDetail', component: CatalogDetail},
  {path: '/organization', component: Organization},
  {path: '/imageStorageReport', component: ImageStorageReport},
  {path: '/indexAllocationAndCompletionReport', component: IndexAllocationAndCompletionReport},
  {path: '/indexDeliveryReport', component: IndexDeliveryReport},
  {path: '/YearCompleteReport', component: YearCompleteReport},
  {path: '/deliveryReport', component: DeliveryReport},
  {path: '/production', component: Production},
  {path: '/SLA', component: SLA},
  {path: '/metadata', component: Metadata},
  {path: '/AnnualTarget', component: AnnualTarget},
  {path: '/systemLog', component: SystemLog},
  {path: '/UpdateLog', component: UpdateLog},
  {path: '/imageView', component: ImageView},
];

const router = createRouter({
  history: createWebHistory(),
  routes, // `routes: routes` 的缩写
});

export default router;
