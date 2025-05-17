import { createRouter, createWebHistory } from "vue-router";
import LoginSessionLocalStorage from "../views/session-local-storage/Login.vue";
import LoginCookie from "../views/cookie/Login.vue";
import ProtectedSessionLocalStorage from "../views/session-local-storage/Protected.vue";
import ProtectedCookie from "../views/cookie/Protected.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/session-local-storage/login",
      name: "session-local-storage-login",
      component: LoginSessionLocalStorage,
    },
    {
      path: "/session-local-storage/protected",
      name: "session-local-storage-protected",
      component: ProtectedSessionLocalStorage,
    },
    {
      path: "/cookie/login",
      name: "cookie-login",
      component: LoginCookie,
    },
    {
      path: "/cookie/protected",
      name: "cookie-protected",
      component: ProtectedCookie
    }
  ],
});

router.beforeEach(async (to, from, next) => {
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");

  //este try catch é para evitar erro caso não esteja rodando o exemplo de cookie
  //ao rodar o exemplo de session ou local storage, o csrf token não é necessário
  try {
    if (!csrfToken) {
      const response = await fetch("http://localhost:3000/csrf-token", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      const meta = document.createElement("meta");
      meta.name = "csrf-token";
      meta.content = data.csrfToken;
      document.head.appendChild(meta);
    }
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
  }

  next();
});

export default router;
