<template>
  <div class="not-found page-in" style="padding-top:var(--nav-height)">
    <div class="not-found-inner">
      <span class="nf-404">404</span>
      <h1>Page Not Found</h1>
      <p>你访问的页面不存在或已被移动。</p>
      <router-link to="/" class="btn btn-primary">← 返回首页</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 24px;
}
.not-found-inner {
  max-width: 480px;
}
.nf-404 {
  font-size: clamp(6rem, 15vw, 10rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  display: block;
  margin-bottom: 16px;
}
.not-found h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px;
}
.not-found p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0 0 32px;
}
</style>
