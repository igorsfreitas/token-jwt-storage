<script lang="ts" setup>
import { ref } from 'vue';

const config: RequestInit = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    },
    credentials: 'include',
};

fetch('http://localhost:3000/protected', config)
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');    
        }
        return response;
    })
    .then((response) => response.json())
    .then((data) => {
        console.log('Protected data:', data);
        // Handle the protected data here
        variable.value = data;
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
    });
const variable = ref('')
</script>

<template>
    <h1>SPA - Protected- Cookie</h1>
    <p>Protected data: {{ variable }}</p>
</template>
