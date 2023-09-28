import { Elysia } from "elysia";
import html from "@elysiajs/html";
import * as elements from "typed-html";
import { Post, PostsDatabase } from "./posts";
import * as sass from "sass";
import { TagsDatabase } from "./tags";

const app = new Elysia()
    .use(html())
    .decorate('posts', new PostsDatabase("posts"))
    .decorate('tags', new TagsDatabase("posts"))
    .get("/", ({set}) => set.redirect = "/posts")
    .get("/posts", ({html, query}) => html(
        <BaseHtml>
            <div class="content">
                <Header selectedTag={query.tag ?? undefined}/>
                <div id="posts" hx-get={"/api/posts?tag="+query.tag} hx-trigger="load" hx-swap="innerHTML"></div>
                <div id="table-of-contents" class="flex-col items-start gap-4">
                    <h1>Table of contents</h1>
                    <div hx-get={"/api/tags?tag="+query.tag} hx-trigger="load" hx-swap="outerHTML">Loading...</div>
                </div>
                <Footer/>
            </div>
        </BaseHtml>
    ))
    .get("/api/posts", async ({posts, query}) => <PostList posts={await posts.list(query.tag)}/>)
    .get("/api/tags", async ({tags, query}) => <TagsList tags={await tags.list()} selected={query.tag}/>)
    .get("/styles.css", () =>
        new Response(sass.compile("styles/all.scss").css, {headers: {'Content-Type': 'text/css'}})
    )
    .get("/art/:file", ({params: {file}}) => Bun.file(`art/${file}`))
    .listen(3000, ({ hostname, port }) => {
        console.log(`🔗 Running at http://${hostname}:${port}`)
    });

const BaseHtml = ({children}: elements.Children) => "<!DOCTYPE html>" + (
    <html lang="en">
    <head>
        <title>Moomba's Seaside Port</title>
        <link rel="stylesheet" href="styles.css"/>
        <script src="https://unpkg.com/htmx.org@1.9.5"></script>
    </head>
    <body>
    {children}
    </body>
    </html>
);

const PostItem = ({contentHtml, tags, createdAt}: Post) => (
    <div class="post">
        <small>{createdAt}</small>
        <div class="post__content">
            {contentHtml}
            <TagsList tags={tags}/>
        </div>
    </div>
);

const PostList = ({posts}: { posts: Post[] }) => (
    <div>
        {posts.map((post) => <PostItem {...post}/>)}
    </div>
)

const TagsList = ({tags, selected}: { tags: string[], selected?: string | null }) => (
    <div class="flex-row flex-wrap whitespace-nowrap gap-3">
        {tags.map((tag) => <a href={"?tag=" + tag} class={tag === selected ? 'selected' : ''}>{"#"+tag}</a>)}
    </div>
)

const Header = ({selectedTag}: {selectedTag?: string}) => (
    <div id="header">
        <div class="title">Moomba's Seaside Port</div>
        <div class="navigation flex-row items-start gap-9">
            <ul>
                <li>Posts</li>
                <li>About Me</li>
                <li>Gallery</li>
            </ul>
            <ul>
                <li><a href="/posts" class={!selectedTag ? 'selected' : ''}>#all</a></li>
                <li><a href="/posts?tag=shadowhaven" class={selectedTag == 'shadowhaven' ? 'selected' : ''}>#shadowhaven</a></li>
                <li><a href="/posts?tag=tgom" class={selectedTag == 'tgom' ? 'selected' : ''}>#tgom</a></li>
            </ul>
        </div>
        <img class="art" src="/art/art1@2x.png" alt="A road leading to a castle in the distance."/>
    </div>
);

const Footer = () => (
    <div id="footer" class="flex-col">
        <div class="cut-line"></div>
        <div class="flex-row items-start justify-between p-5">
            <div class="flex-col items-start gap-4">
                <p>© 2023 Aleksander Długosz</p>
                <p><q>Raiders roll</q></p>
            </div>
            <div class="flex-col items-start gap-5">
                <a class="link-email" href="mailto:olekdlugi@gmail.com"
                   target="_blank">olekdlugi@gmail.com</a>
                <a class="link-phone" href="tel:+48505873740" target="_blank">+48 505 873 740</a>
                <a class="link-linkedin" href="https://www.linkedin.com/in/adlugosz/"
                   target="_blank">in/adlugosz</a>
            </div>
        </div>
    </div>
);