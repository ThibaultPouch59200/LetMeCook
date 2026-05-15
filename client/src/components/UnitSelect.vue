<template>
  <select class="input" :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
    <option value="" disabled>Select unit</option>
    <option>g</option>
    <option>kg</option>
    <option>ml</option>
    <option>cl</option>
    <option>L</option>
    <option>pcs</option>
    <option>tbsp</option>
    <option>tsp</option>
  </select>
</template>

<script setup>
defineProps({ modelValue: String })
defineEmits(['update:modelValue'])
</script>
