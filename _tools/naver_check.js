// 네이버 발행 글 ↔ _naver/<슬러그>/post.txt 대조 (NAVER_BLOG.md §8). 사용: node _tools/naver_check.js . <슬러그>:<logNo> ...
const fs=require("fs"),path=require("path");
const [root,...pairs]=process.argv.slice(2); // pairs: slug:logNo
const UA={headers:{"User-Agent":"Mozilla/5.0"}};
const dec=s=>s.replace(/<[^>]+>/g,"").replace(/&nbsp;|​/g," ").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&middot;/g,"·").replace(/&amp;/g,"&");
const norm=s=>s.split("**").join("").replace(/\s+/g,"");
(async()=>{for(const p of pairs){const [slug,log]=p.split(":");
 const raw=fs.readFileSync(path.join(root,"_naver",slug,"post.txt"),"utf8").replace(/\r/g,"");
 const parts=raw.split(/^\[(제목|본문|카테고리|태그)\]$/m);
 const sec=n=>{const i=parts.indexOf(n);return i>=0?parts[i+1].trim():""};
 const body=sec("본문"),title=sec("제목"),tags=sec("태그").split(/,\s*/).filter(Boolean);
 const photos=(body.match(/^\[사진 \d+\]$/gm)||[]).length;
 const want=norm(body.split("\n").filter(l=>!/^\[사진 \d+\]$/.test(l)).join(""));
 const html=await (await fetch(`https://blog.naver.com/PostView.naver?blogId=nahonse&logNo=${log}`,UA)).text();
 const t=(html.match(/<div class="se-module se-module-text[\s\S]*?<\/div>/g)||[]).filter(m=>!m.includes("se-title-text")).map(dec).join("");
 const got=norm(t);
 const imgs=(html.match(/se-image-resource/g)||[]).length;
 const gtitle=dec((html.match(/se-title-text[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/)||[])[1]||"");
 const link=/href="https?:\/\/nahonse\.kr\//.test(html);
 const tj=await (await fetch(`https://blog.naver.com/BlogTagListInfo.naver?blogId=nahonse&logNoList=${log}&logType=mylog`,UA)).text();
 const gtags=[...tj.matchAll(/"tagName":"([^"]*)"/g)].map(m=>{try{return decodeURIComponent(m[1].replace(/\+/g," "))}catch{return m[1]}});
 let diff="";if(want!==got){let i=0;while(want[i]===got[i])i++;diff=` 처음 다른 곳(${i}): 원고「${want.slice(i,i+25)}」 / 발행「${got.slice(i,i+25)}」`;}
 console.log(`${slug} (${log})\n  제목 ${norm(gtitle)===norm(title)?"같음":"다름: "+gtitle}\n  사진 원고 ${photos} / 발행 ${imgs}\n  본문 ${want===got?"같음":"다름"}${diff}\n  사이트 링크 ${link?"걸림":"없음"}\n  태그 원고 [${tags}] / 발행 [${gtags}]`);
}})();
