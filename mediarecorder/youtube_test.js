var div_element = document.createElement("div");
    div_element.innerHTML = 
    '<button onclick="startRecording()">Start Recording</button><button onclick="stopRecording()">Stop Recording</button><a href="#" id="downloadlink">Download</a><br /><video id="playback_video" autoplay style="border: 1px solid black;"></video>';
    var parent_object = document.getElementById("pla-shelf");
    parent_object.appendChild(div_element);


    var localStream = null;
  // ==== (1) カメラ映像の取得の準備 ====
  // ==== (2) 録画の準備 ====
  // --- recording ---
  var localVideo = document.getElementById('video-stream html5-main-video');
  var recorder =  null;
  var blobUrl = null;
  var chunks = [];
  var playbackVideo =  document.getElementById('playback_video');
  // ==== (2) 録画の準備 ====
  // ==== (3) ダウンロードの準備 ====
  var anchor = document.getElementById('downloadlink');
  
  // ==== (1) カメラ映像の取得 ====
  // ==== (2) 録画 ====
  // -- 録画開始 --
  function startRecording() {
    localVideo.play();
    if (localVideo) {
      localStream = localVideo.captureStream(); 
    }

    // チェック
    if (! localStream) {
      console.warn('stream not ready');
      return;      
    }
    if (recorder) {
      console.warn('already recording');
      return;
    }
    // recorder = new MediaRecorder(localStream);

     // recorder　=　new MediaRecorder(localStream, {mimeType : "video/webm"});
    
    try {
      recorder = new MediaRecorder(localStream, {mimeType : "video/webm"});
    } catch (e) {
      console.error('Exception while creating MediaRecorder: ' + e);
      return;
    }
    
    chunks = []; // 格納場所をクリア
    
    // 録画進行中に、インターバルに合わせて発生するイベント
    recorder.ondataavailable = function(evt) {
      console.log("data available: evt.data.type=" + evt.data.type + " size=" + evt.data.size);
      chunks.push(evt.data);
    };
    
    // 録画停止時のイベント
    recorder.onstop = function(evt) {
      console.log('recorder.onstop(), so playback');
      recorder = null;
      playRecorded();
    };
    // 録画スタート
    recorder.start(1000); // インターバルは1000ms
    console.log('start recording');
  }
  // -- 録画停止 -- 
  function stopRecording() {
  	localVideo.pause(); 
    if (recorder) {
      recorder.stop();
      console.log("stop recording");
    }
  }
  // -- 再生 --
  function playRecorded() {
    if (! blobUrl) {
      window.URL.revokeObjectURL(blobUrl);
      blobUrl = null;
    }
    // Blob
    var videoBlob = new Blob(chunks, {mimeType : "video/mp4"});
    
    // 再生できるようにURLを生成
    blobUrl = window.URL.createObjectURL(videoBlob);
    
    // ==== (3) ダウンロード ====
    // ダウンロードの準備
    anchor.download = 'capturerecorded.mp4';
    anchor.href = blobUrl;
    // ==== (3) ダウンロード ====
    // 録画した内容を再生
    if (blobUrl) {
      playbackVideo.src = blobUrl;
      
      // 再生終了時の処理
      playbackVideo.onended = function() {
        playbackVideo.pause();
        playbackVideo.src = "";
      };
      // 再生開始
      playbackVideo.play();
    }
  }