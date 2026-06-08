<template>
  <div class="floating-auth" :class="{logged:auth.isLoggedIn}">
    <!-- 未登录：登录按钮 -->
    <button v-if="!auth.isLoggedIn" class="fa-btn" @click="auth.openLogin()" title="登录同步学习进度">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </button>
    <!-- 已登录：用户头像+下拉菜单 -->
    <div v-else class="fa-user" @click="menuOpen=!menuOpen">
      <span class="fa-avatar">{{ auth.user?.username?.charAt(0)?.toUpperCase() }}</span>
    </div>
    <!-- 下拉菜单 -->
    <Transition name="fa-pop">
      <div v-if="menuOpen && auth.isLoggedIn" class="fa-menu">
        <div class="fa-menu-header">
          <span class="fa-menu-avatar">{{ auth.user?.username?.charAt(0)?.toUpperCase() }}</span>
          <div>
            <div class="fa-menu-name">{{ auth.user?.username }}</div>
            <div class="fa-menu-email">{{ auth.user?.email }}</div>
          </div>
        </div>
        <div class="fa-menu-items">
          <button class="fa-menu-item" @click="goProgress">📊 学习进度</button>
          <button class="fa-menu-item" @click="goTutorials">🎓 继续学习</button>
          <button class="fa-menu-item danger" @click="handleLogout">🚪 退出登录</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

function goProgress() { menuOpen.value = false; router.push('/progress') }
function goTutorials() { menuOpen.value = false; router.push('/tutorials') }
function handleLogout() { menuOpen.value = false; auth.logout() }

// 点击外部关闭菜单
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.floating-auth')) menuOpen.value = false
  })
}
</script>

<style scoped>
.floating-auth {
  position: fixed;
  bottom: 100px;
  right: 28px;
  z-index: 99999;
}
.fa-btn {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--primary); color: #fff;
  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(0,113,227,.35);
  transition: all .3s var(--spring-smooth);
}
.fa-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,113,227,.5); }
.fa-btn:active { transform: scale(.96); }

.fa-user {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--bg-card); border: 2px solid var(--primary);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(0,0,0,.15);
  transition: all .3s var(--spring-smooth);
}
.fa-user:hover { transform: scale(1.08); box-shadow: 0 6px 28px var(--glow-primary); }
.fa-avatar { font-size: 1.15rem; font-weight: 800; color: var(--primary); }

/* 下拉菜单 */
.fa-menu {
  position: absolute; bottom: 56px; right: 0;
  width: 240px; background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 14px; box-shadow: 0 16px 48px rgba(0,0,0,.25);
  overflow: hidden;
}
.fa-menu-header {
  display: flex; align-items: center; gap: 12px; padding: 16px;
  border-bottom: 1px solid var(--border);
}
.fa-menu-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  background: linear-gradient(135deg,#0071e3,#5856d6);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 800; flex-shrink: 0;
}
.fa-menu-name { font-size: .88rem; font-weight: 700; color: var(--text); }
.fa-menu-email { font-size: .72rem; color: var(--text-tertiary); }
.fa-menu-items { padding: 6px; }
.fa-menu-item {
  width: 100%; padding: 10px 14px; border: none; border-radius: 8px;
  background: transparent; color: var(--text); font-size: .84rem;
  text-align: left; cursor: pointer; transition: background .15s;
}
.fa-menu-item:hover { background: var(--bg-glass); }
.fa-menu-item.danger { color: var(--danger); }
.fa-menu-item.danger:hover { background: rgba(255,59,48,.08); }

@media(max-width:768px){
  .floating-auth { bottom: 88px; right: 16px; }
  .fa-btn { width: 48px; height: 48px; }
  .fa-user { width: 48px; height: 48px; }
  .fa-avatar { font-size: .95rem; }
}
</style>

<style>
.fa-pop-enter-active{transition:all .3s cubic-bezier(.34,1.56,.64,1)}
.fa-pop-leave-active{transition:all .15s ease}
.fa-pop-enter-from,.fa-pop-leave-to{opacity:0;transform:translateY(8px) scale(.92)}
</style>
