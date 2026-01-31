<template>
  <div class="p-field">
    <vue-tel-input
      v-model="internalValue"
      :auto-format="true"
      :input-options="inputOptions"
      :valid-characters-only="true"
      :dropdown-options="dropdownOptions"
      @input="onInputChange"
      class="p-inputtext p-component"
    />
    <small v-if="validationMessage" :class="validationClass">{{ validationMessage }}</small>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  inputOptions: {
    type: Object,
    default: () => ({
      showDialCode: true,
      placeholder: 'Introduce tu número de teléfono'
    })
  }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)
const validationMessage = ref('')
const validationClass = ref('')

watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue
  }
)

const onInputChange = () => {
  const number = parsePhoneNumberFromString(internalValue.value)
  if (number && number.isValid()) {
    validationMessage.value = 'Número válido.'
    validationClass.value = 'p-success'
  } else {
    validationMessage.value = 'Número inválido para el país seleccionado.'
    validationClass.value = 'p-error'
  }
  emit('update:modelValue', internalValue.value)
}

const dropdownOptions = {
  showSearchBox: true,
  searchBoxPlaceholder: 'Buscar país...',
  showFlags: true
}
</script>

<style scoped>
.p-field {
  margin-bottom: 1rem;
}
.p-inputtext {
  width: 100%;
  height: 2.3rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #ccc;
}
.p-component {
  font-size: 1rem;
}
.p-error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
.p-success {
  color: green;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>
