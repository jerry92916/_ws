import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js';

// 模擬資料，表示部落格的文章列表
const posts = [
  {id:0, title:'aaa', body:'aaaaa', created_at:new Date().toLocaleString()},
  {id:1, title:'bbb', body:'bbbbb', created_at:new Date().toLocaleString()}
];

// 建立路由器，負責處理不同的 HTTP 請求
const router = new Router();

// 定義路由及其對應的處理函式
router.get('/', list)              // 顯示文章列表
  .get('/post/new', add)          // 顯示新增文章的表單
  .get('/post/:id', show)         // 顯示特定文章的內容
  .post('/post', create);         // 處理新增文章的請求

// 建立應用程序實例
const app = new Application();
app.use(router.routes());         // 使用路由器的路由
app.use(router.allowedMethods()); // 允許的方法，例如 GET、POST 等

// 處理顯示文章列表的請求
async function list(ctx) {
  ctx.response.body = await render.list(posts); // 使用 render 模組生成 HTML
}

// 處理顯示新增文章表單的請求
async function add(ctx) {
  ctx.response.body = await render.newPost(); // 使用 render 模組生成新增文章的表單
}

// 處理顯示特定文章的請求
async function show(ctx) {
  const id = ctx.params.id;        // 從路由參數中取得文章 ID
  const post = posts[id];         // 根據 ID 取得文章資料
  if (!post) ctx.throw(404, 'invalid post id'); // 如果文章不存在，回傳 404 錯誤
  ctx.response.body = await render.show(post); // 使用 render 模組生成文章內容的 HTML
}

// 處理新增文章的請求
async function create(ctx) {
  const body = ctx.request.body(); // 取得請求的 body
  if (body.type === "form") {     // 確保資料格式為表單
    const pairs = await body.form(); // 取得表單內容
    const post = {};               // 新文章物件
    for (const [key, value] of pairs) {
      post[key] = value;          // 將表單欄位存入文章物件
    }
    console.log('post=', post);
    const id = posts.push(post) - 1; // 將新文章加入列表並取得 ID
    post.created_at = new Date().toLocaleString(); // 設定建立時間
    post.id = id;                  // 設定文章 ID
    ctx.response.redirect('/');   // 重導回文章列表頁面
  }
}

// 啟動伺服器，監聽 8000 埠
console.log('Server run at http://127.0.0.1:8000');
await app.listen({ port: 8000 });
