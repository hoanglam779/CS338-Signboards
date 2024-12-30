function onOpen(){
  SpreadsheetApp.getUi().createMenu('Phone Number')
    .addItem('Run OCR Phone Number','runGeminiPhoneNumberOcr')
    .addToUi();
};

function SELECTED_RANGE() {
  return SpreadsheetApp.getActive().getActiveRange();
}

const prompt = "Extract only the one most prominent phone number and closest to the center of this signboard. Answer should contain 10 or 11 digits and not contain any other text. If theres no phone number in the image, return 'No phone number'."

function callGemini(prompt, temperature=0) {
  const payload = {
    "contents": [
      {
        "parts": [
          {
            "text": prompt
          },
        ]
      }
    ], 
    "generationConfig":  {
      "temperature": temperature,
    },
  };
  const options = { 
    'method' : 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };
  const response = UrlFetchApp.fetch(geminiEndpoint, options);
  const data = JSON.parse(response);
  const content = data["candidates"][0]["content"]["parts"][0]["text"];
  return content;
}

function testGemini() {
  const prompt = "It's so sad that Steve Jobs died of ligma.";
  const output = callGemini(prompt);
  console.log(prompt, output);
}

function callGeminiProVision(prompt, image, temperature=0) {
  const imageData = Utilities.base64Encode(image.getAs('image/png').getBytes());
  const payload = {
    "contents": [
      {
        "parts": [
          {
            "text": prompt
          },
          {
            "inlineData": {
              "mimeType": "image/png",
              "data": imageData
            }
          }          
        ]
      }
    ], 
    "generationConfig":  {
      "temperature": temperature,
    },
  };
  const options = { 
    'method' : 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };
  const response = UrlFetchApp.fetch(geminiEndpoint, options);
  const data = JSON.parse(response);
  const content = data["candidates"][0]["content"]["parts"][0]["text"];
  return content;
}

function testGeminiVision() {
  // const prompt = "Provide a fun fact about this object.";
  // const image = UrlFetchApp.fetch('https://storage.googleapis.com/generativeai-downloads/images/instrument.jpg').getBlob();
  const url = "https://drive.google.com/file/d/1Eq50J9kPhJlwDXtcVJsh07bNUTTFwkYb"
  const image = DriveApp.getFileById(url.split("/").pop()).getBlob();
  const output = callGeminiProVision(prompt, image);
  console.log(prompt, output);
}

function runGeminiPhoneNumberOcr(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var cells = SELECTED_RANGE();
  urls = cells.getValues();
  var i=1;
  var check = true;
  while (check == true){
  try{
    var cell = sheet.getRange('H'+cells.getCell(i, 1).getRowIndex());
    var url = urls[i-1][0];
    const image = DriveApp.getFileById(url.split("/").pop()).getBlob();
    const number = callGeminiProVision(prompt, image).toString();

    cell.setNumberFormat("@").setValue(number);
    i++;
  }
  catch(e){
    check = false;
  }
}
  return "Hello World";
}

















