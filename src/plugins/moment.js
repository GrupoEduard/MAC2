import Vue from 'vue'
import  moment from 'moment';
import 'moment/locale/es';
moment.locale('es');
Object.defineProperty(Vue.prototype, "moment", {
    value: moment
  });