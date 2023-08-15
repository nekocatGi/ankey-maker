//誤タップでページ消えるのを防止
window.addEventListener("beforeunload", function(event) {
  event.returnValue = null;
});

let data,
    dbtn = document.getElementById('download');

async function convertWord(w) {
  let word = w;
  let ex = word.match(/[0-9ア-ンa-zA-Z#$%&~|@+-]/g)
  word = word.replace(/[0-9ア-ンa-zA-Z#$%&~|@+-]/g,'□')
             .replace(/\s+/g,'◇');
  let outputType = 'hiragana';
  let apiUrl = 'https://labs.goo.ne.jp/api/hiragana';
  let appId = 'e344179b84a4d45d20047575a2cf40eec359e8ad7f24e23eaa0acca2777c79c7'
  //'e344179b84a4d45d20047575a2cf40eec359e8ad7f24e23eaa0acca2777c79c7'
  //'5cf24ad2470cc60b85b23a14a2d5b756c542904c9ae3061ac08760abb73c6c2f'
  const params = new URLSearchParams();
  params.append('app_id', appId);
  params.append('sentence', word);
  params.append('output_type', outputType);
  const postResponse = await fetch(apiUrl, {
    method: "POST",
    body: params,
  });
  let result = await postResponse.json()
  result = result['converted'].replace(/\s+/g,'').replace(/「/g,'').replace(/」/g,'');
  if (ex) {
    for (let s of ex) {
      result = result.replace('□',s)
    }
  }
  return result;
}

function downLoad() {
  const word = document.getElementById('input').value.replace(/\n/g, '■');
  let test = word.substring(word.indexOf('■') + 1);
  test = test.replace(/■/g, '');
  if (word.indexOf('■') == -1 || test == '') {
    alert("二つ以上要素を追加してください。");
    return;
  }
  dbtn.disabled = true;
  
  const header = "title\tkeyword\tdescription\timage\n"
  data = header;
  convertWord(word).then(function (value) {
    if(document.getElementById('chk1').checked) {
      value = value.replace(/[!"#$%&'()=~|`{}+*<>?_！”＃＄％＆’（）＝～｜‘｛＋＊｝＜＞？＿＠＾；：、。・￥@;:,.-^]/g, '')
    }
    if(document.getElementById('chk2').checked) {
      value = value.toLowerCase()
    }
    value = value.replace(/◇/g,' ')
    let arr1 = word.split('■');
    let arr2 = value.split('■');
    arr1 = arr1.filter((w) => w !== '');
    arr2 = arr2.filter((w) => w !== '');
    for (let i = 0; i < arr1.length; i++) {
      data += arr1[i] + '\t';
      data += arr2[i] + '\n';
    }
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, data], { type: "text/tsv" });
    const objectUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    const fileName = "ankey.tsv";
    downloadLink.download = fileName;
    downloadLink.href = objectUrl;
    downloadLink.click();
    downloadLink.remove();

    dbtn.disabled = false
  }).catch((err) =>{
    alert("APIが制限に達したようです。時間をおいてから試してください。");
    return;
  })
}

function cleartxt() {
  document.getElementById('input').value = ''
}
