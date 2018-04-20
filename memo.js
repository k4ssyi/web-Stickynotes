//javascript

var memoArray = new Array();

//ドラッグ座標と付箋紙頂点のオフセット
var offsetX = 0;
var offsetY = 0;

//付箋紙ID用のカウンター
var memoCurrentId = 1;

//ドラッグ
function dragMemo(event) {
  //付箋紙のIDを格納
  event.dataTransfer.setData("text", event.target.id);

  //ドラッグした付箋紙の取得
  var memoElement = document.getElementById(event.target.id);
  //ドラッグ座標と付箋紙頂点のオフセットをセット
  offsetX = event.clientX - memoElement.offsetLeft;
  offsetY = event.clientY - memoElement.offsetTop;
}

//ドロップ
function dropMemo(event) {
  //格納されたIDを取り出す
  var id = event.dataTransfer.getData("text");

  //ドラッグした付箋紙の取得
  var memo = memoArray[id];
  //var memoElement = document.getElementById(id);

  //付箋紙の座標をドロップした座標にセット
  memo.move(event.clientX - offsetX, event.clientY - offsetY);
  //memoElement.style.left = event.clientX - offsetX + "px";
  //memoElement.style.top = event.clientY - offsetY + "px";

  //付箋紙情報をローカルストレージに保存
  memo.save();
}

//ドラッグ中
function dragOverMemo(event) {
  //通常のドラッグの動作を禁止
  event.preventDefault();
}

//付箋紙の追加
function addMemo() {
  //入力されたテキストの取得
  var memoText = document.getElementById("memoText").value;

  if (memoText.length > 20) {
    alert("入力された文字が長すぎます");
  } else {
    //選択された色の取得
    var memoColor = "yellow";
    if (document.getElementById('memoY').checked) memoColor = "yellow";
    if (document.getElementById('memoR').checked) memoColor = "red";
    if (document.getElementById('memoG').checked) memoColor = "green";

    //付箋紙オブジェクトの生成
    var memo = new Memo(memoCurrentId, memoText, memoColor, 50, 80);

    //付箋紙DOM要素の生成
    memo.create();

    //付箋紙情報をローカルストレージに保存
    memo.save();

    //付箋紙配列に追加
    memoArray[memo.id] = memo;

    //カウンターのインクリメント
    memoCurrentId++;

    //付箋紙IDカウンターをローカルストレージに保存
    localStorage.setItem("memoCurrentId", memoCurrentId);
  }
}


//Memoクラス
function Memo(id, text, color, x, y) {
  //プロパティ
  this.id = "memo" + id;
  this.text = text;
  this.color = color;
  this.x = x;
  this.y = y;

  //DOM要素を作成するcreateメソッド
  this.create = function() {
    //付箋紙DOM要素の作成
    var memoElement = document.createElement("a");
    memoElement.href = "#";
    memoElement.id = this.id;
    memoElement.className = "memo " + this.color;
    memoElement.draggable = true;
    memoElement.ondragstart = dragMemo;
    memoElement.innerHTML = this.text;

    //付箋エリアに作成した付箋紙を追加
    var memoArea = document.getElementById('memoArea');
    memoArea.appendChild(memoElement);
  }

  //Memoクラスsaveメソッド
  Memo.prototype.save = function() {
    //付箋紙情報をJSON形式で格納
    var memoJSON = {
      "text": this.text,
      "color": this.color,
      "x": this.x,
      "y": this.y
    };

    //JSONオブジェクトを文字列に変換
    var memoStringJSON = JSON.stringify(memoJSON);

    //ローカルストレージに付箋紙情報を保存
    localStorage.setItem(this.id, memoStringJSON);
  };

}


//Memoクラスmoveメソッド
Memo.prototype.move = function(x, y) {
  //付箋紙頂点座標のセット
  this.x = x;
  this.y = y;

  //付箋紙の移動
  var memoElement = document.getElementById(this.id);
  memoElement.style.left = x + "px";
  memoElement.style.top = y + "px";
};

//Memoクラスremoveメソッド
Memo.prototype.remove = function() {
  //DOM要素の取得

  var memoElement = document.getElementById(this.id);

  //付箋紙エリアから子要素を削除
  var memoArea = document.getElementById('memoArea');
  memoArea.removeChild(memoElement);

  //ローカルストレージから付箋紙情報を削除
  localStorage.removeItem(this.id);
};

//ゴミ箱にドロップ
function dropTrash(event) {

  var answer = confirm("削除しますか？");

  if (answer == true) {

    //格納されたIDの取得
    var id = event.dataTransfer.getData("text");

    //付箋紙オブジェクトの取得
    var memo = memoArray[id];

    //DOM要素の削除
    memo.remove();

    //付箋紙オブジェクトの削除
    delete memoArray[id];
  }
}


function loadMemo() {
  //付箋紙IDカウンターの読み込み
  memoCurrentId = localStorage.getItem("memoCurrentId");

  if (memoCurrentId == null) memoCurrentId = 1;

  //全ての付箋紙情報の読み込み
  for (var i = 1; i < memoCurrentId; i++) {
    //付箋紙ID作成
    var memoId = "memo" + i;

    //付箋紙情報(JSON形式)の読み込み
    var memoJSON = localStorage.getItem(memoId);

    //付箋紙情報の取得、付箋紙のセット
    if (memoJSON != null) {
      //JSONの形式の解析
      var memoData = JSON.parse(memoJSON);

      //付箋紙情報の取得
      var memoText = memoData.text;
      var memoColor = memoData.color;
      var memoX = memoData.x;
      var memoY = memoData.y;

      //付箋紙オブジェクトの生成
      var memo = new Memo(i, memoText, memoColor, memoX, memoY);

      //付箋紙要素の作成
      memo.create();
      //付箋紙要素の移動
      memo.move(memo.x, memo.y);
      //連想配列に付箋紙オブジェクトを格納
      memoArray[memo.id] = memo;
    }
  }
}
