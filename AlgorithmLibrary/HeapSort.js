// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function HeapSort(am) {
  this.init(am);
}

HeapSort.prototype = new Algorithm();
HeapSort.prototype.constructor = HeapSort;
HeapSort.superclass = Algorithm.prototype;

var CANVAS_HEIGHT;
var CANVAS_WIDTH;

var ARRAY_SIZE = 32;
var ARRAY_SIZE_MAX = 32;
var ARRAY_ELEM_WIDTH = 37;
var ARRAY_ELEM_HEIGHT = 45;
var ARRAY_INITIAL_X = 0;

var ARRAY_Y_POS = 800;
var ARRAY_LABEL_Y_POS = 430;

var HZMOVE_HEAP = -20;
var VZMOVE_HEAP = 20;

var INTERVAL;

HeapSort.prototype.init = function (am) {
  var sc = HeapSort.superclass;
  var fn = sc.init;
  fn.call(this, am);
  this.addControls();
  this.nextIndex = 0;

  this.HeapXPositions = [
    0,                                      450, 
                   200,                                                700, 
          80 ,               320,                              580,                820, 
      20,       140,      260,      380,                  520,       640,      760,    880, 
    -10, 50, 110, 170, 230, 290, 350, 410,              490, 550, 610, 670, 730, 790,850, 910,
  ];

  this.HeapYPositions = [
    0, 100, 170, 170, 240, 240, 240, 240, 310, 310, 310, 310, 310, 310, 310,
    310, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380,
    380, 380,
  ];

  for (let i = 0; i < this.HeapXPositions.length; i++) {
    this.HeapXPositions[i] += HZMOVE_HEAP;
  }

  for (let i = 0; i < this.HeapYPositions.length; i++) {
    this.HeapYPositions[i] += VZMOVE_HEAP;
  }

  // intervals between layers of nodes
  var H_UNIT_LENGTH = 40;
  var LAYER = 5;
  for (let j = 0; j < LAYER; j++) {
    for (let k = 2 ** j; k < 2 ** (j + 1); k++) {
      this.HeapYPositions[k] += H_UNIT_LENGTH * j;
    }
  }
  this.commands = [];
  this.createArray();
};

HeapSort.prototype.addControls = function () {
  this.randomizeArrayButton = addControlToAlgorithmBar(
    "Button",
    "Randomize"
  );

  var algo_btn_width = `9rem`;

  this.randomizeArrayButton.onclick = this.randomizeCallback.bind(this);
  this.randomizeArrayButton.style.width = algo_btn_width;

  this.heapsortButton = addControlToAlgorithmBar("Button", "Build Heap");
  this.heapsortButton.onclick = this.heapsortCallback.bind(this);
  this.heapsortButton.style.width = algo_btn_width;

  this.userUpdateBtn = document.getElementById("userUpdate");
  this.userUpdateBtn.onclick = this.updateCallback.bind(this);

  this.userUpdateBtnTooken = document.getElementById("update-button-token");
  this.userUpdateBtnTooken.style.width = algo_btn_width;

};

HeapSort.prototype.createArray = function () {
  this.arrayData = new Array(ARRAY_SIZE);
  this.arrayRects = new Array(ARRAY_SIZE);
  this.circleObjs = new Array(ARRAY_SIZE);
  this.ArrayXPositions = new Array(ARRAY_SIZE);
  this.oldData = new Array(ARRAY_SIZE);
  this.currentHeapSize = 0;

  for (var i = 1; i < ARRAY_SIZE; i++) {
    this.arrayData[i] = Math.floor(1 + Math.random() * 999);
    this.oldData[i] = this.arrayData[i];

    this.ArrayXPositions[i] = ARRAY_INITIAL_X + i * ARRAY_ELEM_WIDTH;
    this.arrayRects[i] = this.nextIndex++;
    this.circleObjs[i] = this.nextIndex++;
    this.cmd(
      "CreateRectangle",
      this.arrayRects[i],
      this.arrayData[i],
      ARRAY_ELEM_WIDTH,
      ARRAY_ELEM_HEIGHT,
      this.ArrayXPositions[i],
      ARRAY_Y_POS
    );

    this.cmd(
      "SetBackgroundColor",
      this.arrayRects[i],
      "#4d91ff"
    )

    this.cmd(
      "SetForegroundColor",
      this.arrayRects[i],
      "#ffffff"
    )
  }
  this.swapLabel1 = this.nextIndex++;
  this.swapLabel2 = this.nextIndex++;
  this.swapLabel3 = this.nextIndex++;
  this.swapLabel4 = this.nextIndex++;
  this.descriptLabel1 = this.nextIndex++;
  this.descriptLabel2 = this.nextIndex++;
  this.cmd("CreateLabel", this.descriptLabel1, "", 20, 40, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

HeapSort.prototype.heapsortCallback = function (event) {
  this.commands = this.buildHeap("");
  for (var i = ARRAY_SIZE - 1; i > 1; i--) {
    this.swap(i, 1);
    this.cmd("SetAlpha", this.arrayRects[i], 0.6);
    this.cmd("Delete", this.circleObjs[i]);
    this.currentHeapSize = i - 1;
    this.pushDown(1);
  }
  for (i = 1; i < ARRAY_SIZE; i++) {
    this.cmd("SetAlpha", this.arrayRects[i], 1);
  }
  this.cmd("Delete", this.circleObjs[1]);
  this.animationManager.StartNewAnimation(this.commands);
};

HeapSort.prototype.randomizeCallback = function (ignored) {
  this.randomizeArray();
};

HeapSort.prototype.randomizeArray = function () {
  this.commands = new Array();
  this.updateRectangle(ARRAY_SIZE_MAX);
  for (var i = 1; i < ARRAY_SIZE_MAX; i++) {
    this.arrayData[i] = Math.floor(1 + Math.random() * 999);
    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
    this.oldData[i] = this.arrayData[i];
  }

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

HeapSort.prototype.insertInputArrayFalseMsg = function(msg, right) {

  var err_msg = document.querySelector(".err-msg");
  if (right) err_msg.style.color = "#198754";
  else err_msg.style.color = "#DC3545";

  err_msg.style.display = "block";
  err_msg.innerHTML = msg;
}

HeapSort.prototype.checkInputArraySanity= function (array, index) {  
  if (array.length < 2) {
    return false
  }
  if (isNaN(array[index]) && index !== 0) {
    this.insertInputArrayFalseMsg("NaN detected. Check your input.", false);
    return false;
  } else if (array[index] >= 1000 || array[index] < 0) {
    this.insertInputArrayFalseMsg("Number element in array should be within the range of 0 to 1000", false);
    return false;
  }
  return true;
}

HeapSort.prototype.updateCallback = function (ignored) {
  var userArray = document.getElementById("message-text");
  console.log(userArray.value);

  var text_content = userArray.value;

  // sanity check
  console.log(text_content)
  var upArray = userArray.value.split(", ").map(Number);
  console.log(upArray)
  var text_input = document.getElementById("message-text");
  for (var i = 0; i < upArray.length; i++) {
    if (!this.checkInputArraySanity(upArray, i)) {
      text_input.classList.add("is-invalid");
      return;
    }
  }
  if (text_input.classList.contains("is-invalid")) {
    text_input.classList.remove("is-invalid");
    text_input.classList.remove("is-valid");
  }
  console.log(upArray);
  this.insertInputArrayFalseMsg("Valid", true);
  document.querySelector(".needs-validation").removeAttribute("novalidate")
  document.querySelector(".needs-validation").setAttribute("was-validated", "")
  this.updateArray(upArray);
};

HeapSort.prototype.updateArray = function (array) {
  this.commands = new Array();
  this.updateRectangle(array.length);
  for (var i = 1; i < array.length; i++) {
    this.arrayData[i] = array[i];
    console.log(this.arrayData[i]);
    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
    this.oldData[i] = this.arrayData[i];
  }
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

HeapSort.prototype.updateRectangle = function (length) {
  for (var i = 1; i < ARRAY_SIZE; i++) {
    this.cmd("RemoveRectangle", this.arrayRects[i]);
  } //REMOVERECTANGLE       // New Command added to original library
  ARRAY_SIZE = length;
  this.createArray();
};

HeapSort.prototype.reset = function () {
  for (var i = 1; i < ARRAY_SIZE; i++) {
    this.arrayData[i] = this.oldData[i];
    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
  }
  this.commands = new Array();
};

HeapSort.prototype.swap = function (index1, index2) {
  this.cmd("SetText", this.arrayRects[index1], "");
  this.cmd("SetText", this.arrayRects[index2], "");
  this.cmd("SetText", this.circleObjs[index1], "");
  this.cmd("SetText", this.circleObjs[index2], "");
  this.cmd(
    "CreateLabel",
    this.swapLabel1,
    this.arrayData[index1],
    this.ArrayXPositions[index1],
    ARRAY_Y_POS
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel2,
    this.arrayData[index2],
    this.ArrayXPositions[index2],
    ARRAY_Y_POS
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel3,
    this.arrayData[index1],
    this.HeapXPositions[index1],
    this.HeapYPositions[index1]
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel4,
    this.arrayData[index2],
    this.HeapXPositions[index2],
    this.HeapYPositions[index2]
  );
  this.cmd("Move", this.swapLabel1, this.ArrayXPositions[index2], ARRAY_Y_POS);
  this.cmd("Move", this.swapLabel2, this.ArrayXPositions[index1], ARRAY_Y_POS);
  this.cmd(
    "Move",
    this.swapLabel3,
    this.HeapXPositions[index2],
    this.HeapYPositions[index2]
  );
  this.cmd(
    "Move",
    this.swapLabel4,
    this.HeapXPositions[index1],
    this.HeapYPositions[index1]
  );
  var tmp = this.arrayData[index1];
  this.arrayData[index1] = this.arrayData[index2];
  this.arrayData[index2] = tmp;
  this.cmd("Step");
  this.cmd("SetText", this.arrayRects[index1], this.arrayData[index1]);
  this.cmd("SetText", this.arrayRects[index2], this.arrayData[index2]);
  this.cmd("SetText", this.circleObjs[index1], this.arrayData[index1]);
  this.cmd("SetText", this.circleObjs[index2], this.arrayData[index2]);
  this.cmd("Delete", this.swapLabel1);
  this.cmd("Delete", this.swapLabel2);
  this.cmd("Delete", this.swapLabel3);
  this.cmd("Delete", this.swapLabel4);
};

HeapSort.prototype.setIndexHighlight = function (index, highlightVal) {
  this.cmd("SetHighlight", this.circleObjs[index], highlightVal);
  this.cmd("SetHighlight", this.arrayRects[index], highlightVal);
};

HeapSort.prototype.setConnectionHighlight = function (from, to, highlightVal) {
  this.cmd(
    "SetEdgeHighlight",
    this.circleObjs[from],
    this.circleObjs[to],
    highlightVal
  );
};

HeapSort.prototype.pushDown = function (index) {
  var smallestIndex;

  while (true) {
    if (index * 2 > this.currentHeapSize) {
      return;
    }

    smallestIndex = 2 * index;

    if (index * 2 + 1 <= this.currentHeapSize) {
      this.setIndexHighlight(index, 1);
      this.setIndexHighlight(2 * index, 1);
      this.setIndexHighlight(2 * index + 1, 1);
      this.setConnectionHighlight(index, 2 * index, 1);
      this.setConnectionHighlight(index, 2 * index + 1, 1);

      this.cmd("Step");
      this.setIndexHighlight(index, 0);
      this.setIndexHighlight(2 * index, 0);
      this.setIndexHighlight(2 * index + 1, 0);
      this.setConnectionHighlight(index, 2 * index, 0);
      this.setConnectionHighlight(index, 2 * index + 1, 0);

      if (this.arrayData[2 * index + 1] > this.arrayData[2 * index]) {
        smallestIndex = 2 * index + 1;
      }
    }
    this.setIndexHighlight(index, 1);
    this.setIndexHighlight(smallestIndex, 1);
    this.setConnectionHighlight(index, smallestIndex, 1);

    this.cmd("Step");
    this.setIndexHighlight(index, 0);
    this.setIndexHighlight(smallestIndex, 0);
    this.setConnectionHighlight(index, smallestIndex, 0);

    if (this.arrayData[smallestIndex] > this.arrayData[index]) {
      this.swap(smallestIndex, index);
      index = smallestIndex;
    } else {
      return;
    }
  }
};

HeapSort.prototype.buildHeap = function (ignored) {
  this.commands = new Array();
  for (var i = 1; i < ARRAY_SIZE; i++) {
    this.cmd(
      "CreateCircle",
      this.circleObjs[i],
      this.arrayData[i],
      this.HeapXPositions[i],
      this.HeapYPositions[i]
    );

    this.cmd(
      "SetBackgroundColor",
      this.circleObjs[i],
      "#4d91ff"
    )

    this.cmd(
      "SetForegroundColor",
      this.circleObjs[i],
      "#ffffff"
    )

    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
    if (i > 1) {
      this.cmd(
        "Connect",
        this.circleObjs[Math.floor(i / 2)],
        this.circleObjs[i],
        "#4d91ff",
        0,
        0
      );
    }
  }
  this.cmd("Step");
  this.currentHeapSize = ARRAY_SIZE - 1;
  var nextElem = this.currentHeapSize;
  while (nextElem > 0) {
    this.pushDown(nextElem);
    nextElem = nextElem - 1;
  }
  return this.commands;
};


var currentAlg;

function init() {
  var animManag = initCanvas();

  CANVAS_HEIGHT = canvas.height;
  CANVAS_WIDTH = canvas.width;

  ARRAY_INITIAL_X = (CANVAS_WIDTH - ARRAY_SIZE_MAX * ARRAY_ELEM_WIDTH) / 2;

  ARRAY_Y_POS = CANVAS_HEIGHT * 0.85;

  HZMOVE_HEAP = CANVAS_WIDTH / 2 - 450;
  VZMOVE_HEAP = CANVAS_HEIGHT * 0.2 - 150;

  currentAlg = new HeapSort(animManag, canvas.width, canvas.height);
}
