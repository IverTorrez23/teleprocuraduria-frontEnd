/* eslint-disable vue/no-reserved-component-names */
/* eslint-disable vue/multi-word-component-names */
import type { App } from 'vue'

import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/aura-light-green/theme.css'

import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Ripple from 'primevue/ripple'
import StyleClass from 'primevue/styleclass'
import FloatLabel from 'primevue/floatlabel'

import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import Password from 'primevue/password'
import Dialog from 'primevue/dialog'
import AnimateOnScroll from 'primevue/animateonscroll'
import Panel from 'primevue/panel'
import Tooltip from 'primevue/tooltip'
import BadgeDirective from 'primevue/badgedirective'
import Card from 'primevue/card'
import ToastService from 'primevue/toastservice'
import DialogService from 'primevue/dialogservice'
import ConfirmationService from 'primevue/confirmationservice'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import FileUpload from 'primevue/fileupload'
import Toolbar from 'primevue/toolbar'
import Column from 'primevue/column'
import Rating from 'primevue/rating'
import InputNumber from 'primevue/inputnumber'
import RadioButton from 'primevue/radiobutton'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Checkbox from 'primevue/checkbox'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
//import Editor from 'primevue/editor'
import ColorPicker from 'primevue/colorpicker'
import TreeSelect from 'primevue/treeselect'
import Breadcrumb from 'primevue/breadcrumb'
import Avatar from 'primevue/avatar'
import Message from 'primevue/message'

import InputOtp from 'primevue/inputotp'

import Calendar from 'primevue/calendar'
import { esLocaleEspanol } from '@/constants/localeEspanol'
import ProgressSpinner from 'primevue/progressspinner'
import TreeTable from 'primevue/treetable'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import ConfirmPopup from 'primevue/confirmpopup'
import InputSwitch from 'primevue/inputswitch'

export function setupPrimeVue(app: App) {
  app.use(PrimeVue, {
    ripple: true,
    locale: esLocaleEspanol
  })
  app.use(ToastService)
  app.use(DialogService)
  app.use(ConfirmationService)

  app.directive('tooltip', Tooltip)
  app.directive('badge', BadgeDirective)
  app.directive('ripple', Ripple)
  app.directive('styleclass', StyleClass)
  app.directive('animateonscroll', AnimateOnScroll)

  app.component('Button', Button)

  app.component('Divider', Divider)
  app.component('FloatLabel', FloatLabel)

  app.component('IconField', IconField)
  app.component('InputIcon', InputIcon)
  app.component('InputText', InputText)
  app.component('Menubar', Menubar)
  app.component('Password', Password)
  app.component('Dialog', Dialog)
  app.component('Panel', Panel)
  app.component('Card', Card)
  app.component('Textarea', Textarea)
  app.component('Toast', Toast)
  app.component('FileUpload', FileUpload)
  app.component('Toolbar', Toolbar)
  app.component('Column', Column)
  app.component('Rating', Rating)
  app.component('InputNumber', InputNumber)
  app.component('RadioButton', RadioButton)
  app.component('Dropdown', Dropdown)
  app.component('DataTable', DataTable)
  app.component('Checkbox', Checkbox)
  app.component('Skeleton', Skeleton)
  app.component('Tag', Tag)
  //app.component('Editor', Editor)
  app.component('ColorPicker', ColorPicker)
  app.component('TreeSelect', TreeSelect)
  app.component('Breadcrumb', Breadcrumb)
  app.component('Avatar', Avatar)
  app.component('Message', Message)
  app.component('Calendar', Calendar)
  app.component('ProgressSpinner', ProgressSpinner)
  app.component('TreeTable', TreeTable)
  app.component('Splitter', Splitter)
  app.component('SplitterPanel', SplitterPanel)
  app.component('ColumnGroup', ColumnGroup)
  app.component('Row', Row)
  app.component('TabPanel', TabPanel)
  app.component('TabView', TabView)
  app.component('InputOtp', InputOtp)
  app.component('ConfirmPopup', ConfirmPopup)
  app.component('InputSwitch', InputSwitch)
}
