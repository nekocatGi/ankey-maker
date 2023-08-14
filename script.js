//誤タップでページ消えるのを防止
window.addEventListener("beforeunload", function(event) {
  event.returnValue = null;
});

async function convertWord(w) {
  //gooひらがな化APIで変換したいテキスト
  let word = w;
  let ex = word.match(/[0-9ア-ンa-z]/g)
  word = word.replace(/[0-9ア-ンa-z]/g,'□')
  //ひらがなに変換したい場合は「hiragana」、カタカナに変換したい場合は「katakana」設定
  let outputType = 'hiragana';
  //gooのひらがなAPIのリクエストURLとappIDを設定(***部分にIDセット)
  let apiUrl = 'https://labs.goo.ne.jp/api/hiragana';
  let appId = '5cf24ad2470cc60b85b23a14a2d5b756c542904c9ae3061ac08760abb73c6c2f';
  const params = new URLSearchParams();
  params.append('app_id', appId);
  params.append('sentence', word);
  params.append('output_type', outputType);
  const postResponse = await fetch(apiUrl, {
    method: "POST",   // HTTP-Methodを指定する！
    body: params,     // リクエストボディーにURLSearchParamsを設定
  });
  let result = await postResponse.json()
  result = result['converted'].replace(/\s+/g,'');
  for (let s of ex) {
    result = result.replace('□',s)
  }
  alert(result);
}

function onLoad() {
  convertWord('デカライン高架下')
}
