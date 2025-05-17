<script lang="ts" setup>
import { ref } from 'vue';


const token = localStorage.getItem('accessToken')! || sessionStorage.getItem('accessToken')!;

const config: RequestInit = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
};

fetch('http://localhost:3000/protected', config)
    .then((response) => {
        if (!response.ok) {
            if (response.status === 401) {
                return fetch('http://localhost:3000/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refreshToken: localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken'),
                    }),
                    credentials: 'include',
                })
                    .then((res) => {
                        if (!res.ok) {
                            throw new Error('Failed to refresh token');
                        }
                        return res.json();
                    })
                    .then((data) => {
                        sessionStorage.setItem('accessToken', data.accessToken);
                        sessionStorage.setItem('refreshToken', data.refreshToken);

                        localStorage.setItem('accessToken', data.accessToken);
                        localStorage.setItem('refreshToken', data.refreshToken);

                        return fetch('http://localhost:3000/protected', {
                            ...config,
                            headers: {
                                ...config.headers,
                                Authorization: `Bearer ${data.accessToken}`,
                            },
                        });
                    });
            } else {
                console.error('Network response was not ok:', response.statusText);
                throw new Error('Network response was not ok');
            }
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
    <h1>SPA - Protected- Session e Local Storage</h1>
    <p>Protected data: {{ variable }}</p>
</template>
