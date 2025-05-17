<script setup lang="ts">
import router from '@/router'

async function handleSubmit(event: Event) {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
    })

    const data = await response.json()

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('refreshToken', data.refreshToken);

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);


    router.push('/session-local-storage/protected')

}
</script>

<template>
    <main>
        <h1>SPA - Login - Session e Local Storage</h1>
        <form @submit="handleSubmit">
            <div>
                <label for="email">email</label>
                <input type="text" id="email" name="email" required value="user@user.com" />
            </div>
            <div>
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required value="password" />
            </div>
            <button type="submit">Login</button>
        </form>
    </main>
</template>
