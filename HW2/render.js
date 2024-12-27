// 定義 layout 函式，生成基本的 HTML 頁面框架
export function layout(title, content) {
    return `
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          padding: 80px;
          font: 16px Helvetica, Arial;
        }
    
        h1 {
          font-size: 2em;
        }
    
        h2 {
          font-size: 1.2em;
        }
    
        #posts {
          margin: 0;
          padding: 0;
        }
    
        #posts li {
          margin: 40px 0;
          padding: 0;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
          list-style: none;
        }
    
        #posts li:last-child {
          border-bottom: none;
        }
    
        textarea {
          width: 500px;
          height: 300px;
        }
    
        input[type=text],
        textarea {
          border: 1px solid #eee;
          border-top-color: #ddd;
          border-left-color: #ddd;
          border-radius: 2px;
          padding: 15px;
          font-size: .8em;
        }
    
        input[type=text] {
          width: 500px;
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

// 定義 list 函式，生成文章列表頁面
export function list(posts) {
    let list = []
    for (let post of posts) {
      const formattedDate = post.created_at; // 格式化日期
      list.push(`
      <li>
        <h2>${ post.title }</h2>
        <p><a href="/post/${post.id}">Read post</a></p>
        <p>Created at: ${formattedDate}</p>
      </li>
      `)
    }
    let content = `
    <h1>Posts</h1>
    <p>You have <strong>${posts.length}</strong> posts!</p>
    <p><a href="/post/new">Create a Post</a></p>
    <ul id="posts">
      ${list.join('\n')}
    </ul>
    `
    return layout('Posts', content) // 使用 layout 函式包裝內容
}

// 定義 newPost 函式，生成新增文章的表單頁面
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

// 定義 show 函式，生成特定文章的顯示頁面
export function show(post) {
    const formattedDate = post.created_at; // 格式化日期
    return layout(post.title, `
      <h1>${post.title}</h1>
      <pre>${post.body}</pre>
      <pre>created at ${formattedDate}</pre>
    `)
}
