import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js';
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

// 初始化資料庫
const db = new DB("blog.db");
// 建立文章資料表（如果不存在）
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, title TEXT, body TEXT)");
// 建立使用者資料表（如果不存在）
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT)");

// 初始化路由
const router = new Router();

router.get('/', list) // 文章列表頁面
  .get('/signup', signupUi) // 註冊頁面
  .post('/signup', signup) // 處理註冊
  .get('/login', loginUi) // 登入頁面
  .post('/login', login) // 處理登入
  .get('/logout', logout) // 登出
  .get('/post/new', add) // 新增文章頁面
  .get('/post/:id', show) // 顯示單篇文章
  .post('/post', create) // 處理新增文章
  .get('/list/:user', listUserPosts) // 顯示特定使用者的文章

// 初始化應用程序
const app = new Application();
app.use(Session.initMiddleware()); // 初始化 Session 中介軟體
app.use(router.routes()); // 使用路由
app.use(router.allowedMethods()); // 允許的請求方法

// 執行 SQL 指令的函數
function sqlcmd(sql, arg1) {
  console.log('sql:', sql);
  try {
    var results = db.query(sql, arg1);
    console.log('sqlcmd: results=', results);
    return results;
  } catch (error) {
    console.log('sqlcmd error: ', error);
    throw error;
  }
}

// 查詢文章的函數
function postQuery(sql) {
  let list = [];
  for (const [id, username, title, body] of sqlcmd(sql)) {
    list.push({ id, username, title, body });
  }
  console.log('postQuery: list=', list);
  return list;
}

// 查詢使用者的函數
function userQuery(sql) {
  let list = [];
  for (const [id, username, password, email] of sqlcmd(sql)) {
    list.push({ id, username, password, email });
  }
  console.log('userQuery: list=', list);
  return list;
}

// 解析表單數據的函數
async function parseFormBody(body) {
  const pairs = await body.form();
  const obj = {};
  for (const [key, value] of pairs) {
    obj[key] = value;
  }
  return obj;
}

// 顯示註冊頁面
async function signupUi(ctx) {
  ctx.response.body = await render.signupUi();
}

// 處理註冊邏輯
async function signup(ctx) {
  const body = ctx.request.body;
  if (body.type() === "form") {
    var user = await parseFormBody(body);
    console.log('user=', user);
    var dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}'`);
    console.log('dbUsers=', dbUsers);
    if (dbUsers.length === 0) {
      sqlcmd("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [user.username, user.password, user.email]);
      ctx.response.body = render.success();
    } else 
      ctx.response.body = render.fail();
  }
}

// 顯示登入頁面
async function loginUi(ctx) {
  ctx.response.body = await render.loginUi();
}

// 處理登入邏輯
async function login(ctx) {
  const body = ctx.request.body;
  if (body.type() === "form") {
    var user = await parseFormBody(body);
    var dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}'`);
    var dbUser = dbUsers[0];
    if (dbUser.password === user.password) {
      ctx.state.session.set('user', user);
      console.log('session.user=', await ctx.state.session.get('user'));
      ctx.response.redirect('/');
    } else {
      ctx.response.body = render.fail();
    }
  }
}

// 處理登出邏輯
async function logout(ctx) {
   ctx.state.session.set('user', null);
   ctx.response.redirect('/');
}

// 顯示文章列表
async function list(ctx) {
  let posts = postQuery("SELECT id, username, title, body FROM posts");
  console.log('list:posts=', posts);
  ctx.response.body = await render.list(posts, await ctx.state.session.get('user'));
}

// 顯示特定使用者的文章
async function listUserPosts(ctx) {
  const user = ctx.params.user;
  console.log("listuserposts:hihi");
  let posts = postQuery(`SELECT id, username, title, body FROM posts WHERE username = ?`, [user]);
  let allposts = postQuery("SELECT id, username, title, body FROM posts");
  console.log('list:posts=', posts);
  if (!posts[user]) {
    posts[user] = []; 
  }
  ctx.response.body = await render.listUserPosts(posts, user, allposts);
}

// 顯示新增文章頁面
async function add(ctx) {
  var user = await ctx.state.session.get('user');
  if (user != null) {
    ctx.response.body = await render.newPost();
  } else {
    ctx.response.body = render.fail();
  }
}

// 顯示單篇文章
async function show(ctx) {
  const pid = ctx.params.id;
  let posts = postQuery(`SELECT id, username, title, body FROM posts WHERE id=${pid}`);
  let post = posts[0];
  console.log('show:post=', post);
  if (!post) ctx.throw(404, 'invalid post id');
  ctx.response.body = await render.show(post);
}

// 處理新增文章邏輯
async function create(ctx) {
  const body = ctx.request.body;
  if (body.type() === "form") {
    var post = await parseFormBody(body);
    console.log('create:post=', post);
    var user = await ctx.state.session.get('user');
    if (user != null) {
      console.log('user=', user);
      sqlcmd("INSERT INTO posts (username, title, body) VALUES (?, ?, ?)", [user.username, post.title, post.body]);  
    } else {
      ctx.throw(404, 'not login yet!');
    }
    ctx.response.redirect('/');
  }
}

console.log('Server run at http://127.0.0.1:8000');
await app.listen({ port: 8000 });
