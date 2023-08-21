// 誤タップでページ消えるのを防止
window.addEventListener("beforeunload", function(event) {
  event.returnValue = null;
});

const texterea = document.getElementById('input'),
      dbtn = document.getElementById('download');

//バイト数計算
String.prototype.bytes = function () {
  var length = 0;
  for (var i = 0; i < this.length; i++) {
    var c = this.charCodeAt(i);
    if ((c >= 0x0 && c < 0x81) || (c === 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
      length += 1;
    } else {
      length += 2;
    }
  }
  return length;
};

async function convertWord(w) {// ひらがなに変換
  let word = w;
  let ex = word.match(/[0-9ア-ンa-zA-Z#$%&~|@＃＄％＆＋+-]/g)
  word = word.replace(/[0-9ア-ンa-zA-Z#$%&~|@＃＄％＆＋+-]/g,'□')// 無視したい文字を変換
             .replace(/\s+/g,'◇');// 残したい空白文字を変換
  let outputType = 'hiragana';
  let apiUrl = 'https://labs.goo.ne.jp/api/hiragana';
  let appId = 'e344179b84a4d45d20047575a2cf40eec359e8ad7f24e23eaa0acca2777c79c7'
  const params = new URLSearchParams();
  params.append('app_id', appId);
  params.append('sentence', word);
  params.append('output_type', outputType);
  const postResponse = await fetch(apiUrl, {
    method: "POST",
    body: params,
  });
  let result = await postResponse.json()
  result = result['converted'].replace(/[「」\s+]/g,'');
  if (ex) {
    for (let s of ex) {
      result = result.replace('□', s)
    }
  }
  return result;
}

function downLoad() {
  // 一行ずつ配列で取得
  let wordArray = texterea.value.split('\n');
  // 空文字のみの行を削除
  wordArray = wordArray.filter((w) => w.trim());
  // 要素の数をチェック
  if (wordArray.length <= 1) {
    alert("二つ以上要素を追加してください。");
    return;    
  }
  // apiを叩く回数を減らすため一列に(改行は⏎で表す)
  let wordString = "";
  for (let s of wordArray) {
    wordString += s + '⏎';
  }
  wordString = wordString.slice(0, -1);
  // 文字列が長すぎないかチェック
  if(wordString.bytes() > 100000) {
    alert("もっと短くしてください。");
    return;    
  }
  
  dbtn.disabled = true; // ボタンの無効化
  
  convertWord(wordString).then(function(value){
    // 句読点と！？消す
    if(document.getElementById('chk1').checked) {
      value = value.replace(/[！？、。!?]/g, '');
    }
    // 空白文字の管理
    if(document.getElementById('chk2').checked) {
      value = value.replace(/◇/g,'');
    } else {
      value = value.replace(/◇/g,' ');
    }
    // 大文字を小文字に
    if(document.getElementById('chk4').checked) {
      value = value.toLowerCase();
    }
    // 一行ずつに戻す
    let convertedArray = value.split('⏎');
    // tsvファイルのためのデータをつくる
    const header = "title\tkeyword\tdescription\timage\n";
    let data = header;
    if(document.getElementById('chk3').checked) {
      for (let i = 0; i < wordArray.length; i++) {
        data += wordArray[i] + '\t';
        data += convertedArray[i] + '\t';
        if (i == wordArray.length - 1) {
          data += '↺' + wordArray[0] + '\n';
        } else {
          data += '▶' + wordArray[i+1] + '\n';
        }
      }
    } else {
      for (let i = 0; i < wordArray.length; i++) {
        data += wordArray[i] + '\t';
        data += convertedArray[i] + '\n';
      }
    }
    console.log(data)
    // tsvファイルの作成とダウンロード
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, data], { type: "text/tsv" });
    const objectUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    const fileName = "ankey.tsv";
    downloadLink.download = fileName;
    downloadLink.href = objectUrl;
    downloadLink.click();
    downloadLink.remove();
    
    dbtn.disabled = false; // ボタンの有効化
  }).catch((err) =>{
    console.log(err);
    alert("APIが制限に達したようです。時間をおいてから試してください。");
    return;
  })
}

//テキストエリアを空に
function cleartxt() {
  texterea.value = '';
}
