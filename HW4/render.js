export function layout(title, content) {
    return `
    <html>
    <head>
      <title>${title}</title>
      <style>
        /* 設定頁面樣式 */
        body {
          padding: 80px;
          font: 16px Helvetica, Arial;
        }
    
        h1 {
          font-size: 2em; /* 標題大小 */
        }
    
        h2 {
          font-size: 1.2em; /* 副標題大小 */
        }
        h3 {
          font-size: 1em; /* 次標題大小 */
        }
    
        #posts {
          margin: 0;
          padding: 0;
        }
    
        #posts li {
          margin: 40px 0;
          padding: 0;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee; /* 每篇文章分隔線 */
          list-style: none; /* 移除項目符號 */
        }
    
        #posts li:last-child {
          border-bottom: none; /* 最後一篇文章無分隔線 */
        }
    
        textarea {
          width: 500px;
          height: 300px; /* 設定文字區域大小 */
        }
    
        input[type=text],input[type=password],
        textarea {
          border: 1px solid #eee;
          border-top-color: #ddd;
          border-left-color: #ddd;
          border-radius: 2px; /* 設定圓角 */
          padding: 15px;
          font-size: .8em;
        }
    
        input[type=text],input[type=password] {
          width: 500px; /* 設定文字輸入框寬度 */
        }
      </style>
    </head>
    <body>
      <section id="content">
        ${content}
      </section>
    </body>
    </html>
    `
  }

  // 用於顯示使用者貼文列表的函數
  export function listUserPosts(posts, user,allposts) {
    console.log('listUserPost: user=', user)
    let list = []
    for (let post of posts) {
      list.push(`
      <li>
        <h2>${ post.title } -- by ${post.username}</h2>
        <p><a href="/post/${post.id}">Read post</a></p>
      </li>
      `)
    }
    for (let apost of allposts) {
      if(user===apost.username){
      list.push(`
      <li>
        <h3>${apost.title} -- by ${apost.username}</h3>
        <p>${apost.body}</p>
      </li>
      `)
      }
    }
    let content = `
    <h1>${user}的貼文</h1>
    <p>${(posts.username==null)?'<a href="/login">Login</a> to Create a Post!':'Welcome '+user.username+', You may <a href="/post/new">Create a Post</a> or <a href="/logout">Logout</a> !'}</p>
    <p>There are <strong>${list.length}</strong> posts!</p>
    <ul id="posts">
      ${list.join('\n')}
    </ul>
    `
    return layout('Post', content)
  }

  // 用於顯示登入介面的函數
  export function loginUi() {
    return layout('Login', `
    <h1>Login</h1>
    <form action="/login" method="post">
      <p><input type="text" placeholder="username" name="username"></p>
      <p><input type="password" placeholder="password" name="password"></p>
      <p><input type="submit" value="Login"></p>
      <p>New user? <a href="/signup">Create an account</p>
    </form>
    `)
  }

  // 用於顯示註冊介面的函數
  export function signupUi() {
    return layout('Signup', `
    <h1>Signup</h1>
    <form action="/signup" method="post">
      <p><input type="text" placeholder="username" name="username"></p>
      <p><input type="password" placeholder="password" name="password"></p>
      <p><input type="text" placeholder="email" name="email"></p>
      <p><input type="submit" value="Signup"></p>
    </form>
    `)
  }

  // 用於顯示成功訊息的函數
  export function success() {
    return layout('Success', `
    <h1>Success!</h1>
    You may <a href="/">read all Post</a> / <a href="/login">login</a> again !
    `)
  }

  // 用於顯示失敗訊息的函數
  export function fail() {
    return layout('Fail', `
    <h1>Fail!</h1>
    You may <a href="/">read all Post</a> or <a href="JavaScript:window.history.back()">go back</a> !
    `)
  }

  // 用於顯示所有貼文的函數
  export function list(posts, user) {
    console.log('list: user=', user)
    let list = []
    for (let post of posts) {
      list.push(`
      <li>
        <h2>${ post.title } -- by <a href="/list/${post.username}">${post.username}</a></h2>
        <p><a href="/post/${post.id}">Read post</a></p>
      </li>
      `)
    }
    let content = `
    <h1>Posts</h1>
    <p>${(user==null)?'<a href="/login">Login</a> to Create a Post!':'Welcome '+user.username+', You may <a href="/post/new">Create a Post</a> or <a href="/logout">Logout</a> !'}</p>
    <p>There are <strong>${posts.length}</strong> posts!</p>
    <ul id="posts">
      ${list.join('\n')}
    </ul>
    `
    return layout('Posts', content)
  }

  // 用於顯示新增貼文介面的函數
  export function newPost() {
    return layout('New Post', `
    <h1>New Post</h1>
    <p>Create a new post.</p>
    <form action="/post" method="post">
      <p><input type="text" placeholder="Title" name="title"></p>
      <p><textarea placeholder="Contents" name="body"></textarea></p>
      <p><input type="submit" value="Create"></p>
    </form>
    `)
  }

  // 用於顯示單篇貼文的函數
  export function show(post) {
    return layout(post.title, `
      <h1>${post.title} -- by ${post.username}</h1>
      <p>${post.body}</p>
    `)
  }
