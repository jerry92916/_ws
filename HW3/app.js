import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js';
import { DB } from "https://deno.land/x/sqlite/mod.ts";

// 初始化資料庫，如果表 posts 不存在則建立
const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, title TEXT, body TEXT)");

// 建立路由器，負責處理 HTTP 請求
const router = new Router();

// 定義路由及其對應的處理函式
router.get('/', userList)             // 顯示所有使用者
  .get('/:user/', list)              // 顯示特定使用者的文章列表
  .get('/:user/post/new', add)       // 顯示新增文章的表單
  .get('/:user/post/:id', show)      // 顯示特定文章內容
  .post('/:user/post', create);      // 處理新增文章的請求

// 建立應用程序實例
const app = new Application();
app.use(router.routes());             // 使用路由器的路由
app.use(router.allowedMethods());     // 允許的 HTTP 方法

// 定義 query 函式，用於執行 SQL 查詢
function query(sql, args = []) {
  let list = [];
  for (const [id, user, title, body] of db.query(sql, args)) {
    list.push({ id, user, title, body });
  }
  return list;
}

// 顯示所有使用者的文章列表
async function userList(ctx) {
  let users = query(`SELECT DISTINCT user FROM posts`); // 查詢所有不同的使用者
  ctx.response.body = await render.userList(users);     // 使用 render 模組生成 HTML
}

// 顯示特定使用者的文章列表
async function list(ctx) {
  const user = ctx.params.user; // 獲取路由中的使用者名稱
  console.log('user=', user);
  let posts = query(`SELECT id, user, title, body FROM posts WHERE user = ?`, [user]);

  console.log('list:posts=', posts);
  ctx.response.body = await render.list(user, posts); // 使用 render 模組生成 HTML
}

// 顯示新增文章的表單頁面
async function add(ctx) {
  const user = ctx.params.user;
  console.log('add:user=', user);
  ctx.response.body = await render.newPost(user); // 使用 render 模組生成新增文章表單
}

// 顯示特定文章的內容
async function show(ctx) {
  const user = ctx.params.user;
  const pid = ctx.params.id;
  let posts = query(`SELECT id, user, title, body FROM posts WHERE id=${pid}`);
  let post = posts[0];
  console.log('show:post=', post);
  if (!post) ctx.throw(404, 'invalid post id'); // 如果文章不存在，返回 404 錯誤
  ctx.response.body = await render.show(user, post); // 使用 render 模組生成 HTML
}

// 處理新增文章的請求
async function create(ctx) {
  const user = ctx.params.user || 'jerry'; // 獲取使用者名稱，為'jerry'
  const body = ctx.request.body();       // 獲取請求體
  if (body.type === "form") {           // 確保請求內容為表單類型
    const pairs = await body.form();
    const post = {};
    for (const [key, value] of pairs) {
      post[key] = value;                // 將表單內容存入 post 物件
    }
    let posts = query(`SELECT id, user, title, body FROM posts WHERE user=?`, [user]);
    if (!posts[user]) {
      posts[user] = [];                 // 初始化使用者的文章列表
    }
    console.log('create:post=', post);
    db.query("INSERT INTO posts (user, title, body) VALUES (?, ?, ?)", [user, post.title, post.body]);
    ctx.response.redirect(`/${user}/`); // 重導回使用者的文章列表頁面
  }
}

// 啟動伺服器，監聽 8000 埠
console.log('Server running at http://127.0.0.1:8000');
await app.listen({ port: 8000 });

