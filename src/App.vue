<template>
  <div id="app">
    <header class="header">
      <h1>国文汇通检测</h1>
    </header>
    <main class="main">
      <div class="container">
        <h2>文本检测与分析</h2>
        <div class="content">
          <p>欢迎使用国文汇通检测系统</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

.header {
  background-color: #1890ff;
  color: white;
  padding: 20px;
  text-align: center;
}

.header h1 {
  font-size: 24px;
}

.main {
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.container h2 {
  margin-bottom: 20px;
  color: #333;
}

.content {
  color: #666;
}
</style>
