<script setup lang="ts">
import router from '@/router'

async function handleSubmit(event: Event) {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
    })

    router.push('/cookie/protected')

}
</script>

<template>
    <main>
        <h1>SPA - Login - Cookie</h1>
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
