<template>
  <Teleport to="body">
    <Transition name="auth-fade">
      <div v-if="auth.showLoginModal" class="auth-overlay" @click.self="auth.closeLogin()">
        <div class="auth-card">
          <div class="auth-header">
            <h3>{{ isRegister ? '注册账号' : '登录' }}</h3>
            <p class="auth-sub">{{ isRegister ? '创建账号，同步学习进度到云端' : '登录后同步学习进度，跨设备继续学习' }}</p>
          </div>
          <form class="auth-form" @submit.prevent="handleSubmit">
            <div v-if="isRegister" class="auth-field">
              <label>用户名</label>
              <input v-model="form.username" type="text" placeholder="2-20个字符" required minlength="2" maxlength="20" autocomplete="username" />
            </div>
            <div class="auth-field">
              <label>邮箱</label>
              <input v-model="form.email" type="email" placeholder="your@email.com" required autocomplete="email" />
            </div>
            <div class="auth-field">
              <label>密码</label>
              <input v-model="form.password" type="password" placeholder="至少6个字符" required minlength="6" autocomplete="current-password" />
            </div>
            <div v-if="error" class="auth-error">{{ error }}</div>
            <button type="submit" class="auth-btn" :disabled="loading">
              {{ loading ? '处理中...' : (isRegister ? '注册' : '登录') }}
            </button>
          </form>
          <div class="auth-footer">
            <button class="auth-switch" @click="isRegister = !isRegister; error = ''">
              {{ isRegister ? '已有账号？去登录 →' : '没有账号？去注册 →' }}
            </button>
          </div>
          <button class="auth-close" @click="auth.closeLogin()" aria-label="关闭">
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2l-10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isRegister = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const err = isRegister.value
      ? await auth.register(form.username, form.email, form.password)
      : await auth.login(form.email, form.password)
    if (err) { error.value = err; return }
    auth.closeLogin()
    // 登录后同步本地进度
    await syncAfterLogin()
  } finally {
    loading.value = false
  }
}

async function syncAfterLogin() {
  // 进度已通过 auth store 的 login/register → loadProgressIntoStore 自动加载
  // 此处无需额外操作
}
</script>

<style scoped>
.auth-overlay {
  position: fixed; inset: 0; z-index: 1000001;
  background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.auth-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; width: 100%; max-width: 400px;
  padding: 32px 28px 24px; position: relative;
  box-shadow: 0 24px 80px rgba(0,0,0,.3);
}
.auth-header { text-align: center; margin-bottom: 24px; }
.auth-header h3 { margin: 0; font-size: 1.3rem; font-weight: 700; color: var(--text); }
.auth-sub { margin: 6px 0 0; font-size: .82rem; color: var(--text-secondary); line-height: 1.5; }
.auth-form { display: flex; flex-direction: column; gap: 14px; }
.auth-field { display: flex; flex-direction: column; gap: 4px; }
.auth-field label { font-size: .76rem; font-weight: 600; color: var(--text-secondary); }
.auth-field input {
  padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border);
  background: var(--bg-glass); color: var(--text); font-size: .9rem;
  transition: border-color .2s; outline: none;
}
.auth-field input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--focus-ring); }
.auth-error { padding: 8px 12px; background: rgba(255,59,48,.1); border-radius: 8px; color: var(--danger,#ff3b30); font-size: .8rem; }
.auth-btn {
  padding: 12px; border-radius: 10px; border: none;
  background: var(--primary); color: #fff; font-size: .95rem; font-weight: 700;
  cursor: pointer; transition: all .2s; margin-top: 4px;
}
.auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px var(--glow-primary); }
.auth-btn:disabled { opacity: .6; cursor: not-allowed; }
.auth-footer { text-align: center; margin-top: 16px; }
.auth-switch { background: none; border: none; color: var(--primary); font-size: .82rem; cursor: pointer; font-weight: 600; }
.auth-switch:hover { text-decoration: underline; }
.auth-close { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; border: none; background: transparent; color: var(--text-tertiary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.auth-close:hover { background: var(--bg-glass); color: var(--text); }

@media(max-width:640px){
  .auth-card { padding: 24px 20px 20px; border-radius: 20px 20px 0 0; max-height: 90vh; overflow-y: auto; }
  .auth-overlay { align-items: flex-end; padding: 0; }
}
</style>

<style>
.auth-fade-enter-active{transition:opacity .4s cubic-bezier(.34,1.56,.64,1),backdrop-filter .4s ease}
.auth-fade-enter-active .auth-card{transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .4s ease}
.auth-fade-enter-from{opacity:0;backdrop-filter:blur(0px)}
.auth-fade-enter-from .auth-card{opacity:0;transform:translateY(100%) scale(.9)}
@media(min-width:640px){.auth-fade-enter-from .auth-card{transform:translateY(20px) scale(.92)}}
.auth-fade-leave-active{transition:opacity .2s ease}
.auth-fade-leave-active .auth-card{transition:transform .2s ease,opacity .2s ease}
.auth-fade-leave-to{opacity:0}
.auth-fade-leave-to .auth-card{opacity:0;transform:translateY(10px) scale(.95)}
</style>
