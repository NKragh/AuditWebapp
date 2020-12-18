const checklisturl = {
  prod: "https://auditrest.azurewebsites.net/api/checklists",
  dev: "http://localhost:51284/api/checklists"
}
const reportsurl = {
  prod: "https://auditrest.azurewebsites.net/api/reports",
  dev: "http://localhost:51284/api/reports"
}
const answersurl = {
  prod: "https://auditrest.azurewebsites.net/api/answers",
  dev: "http://localhost:51284/api/answers"
}

document.onload = start()

var container = document.getElementById('container')
var checklistcontainer;
var result;

function start() {
  GetChecklists()
  document.getElementById('savebtn').addEventListener('click', Post)

}

function GetChecklists() {
  var html = ""
  fetch(checklisturl['prod'])
    .then(response => response.json())
    .then(data => {
      console.log(data)
      result = data;
      html += `<div class="row">
               <div class="col-10">
               <div class="row">`
      for (x in data) {
        html += `<div class="col-4 checklistheader" onclick="ChecklistClicked(this)" id="${x}" name="checklist">${data[x].name}</div>`
      }
      html += `</div>
               </div>
               <div class="col-2" style="text-align: center; font-size: 1.5em; font-weight: 600;">Bemærkninger</div>
               </div>
               <hr>
               <div id="checklistcontainer"></div>`
      container.innerHTML += html
      document.querySelector('div.checklistheader').click()
    })
}

function ChecklistClicked(checklist) {
  var id = checklist.id

  html = GetQuestionGroups(id)
  document.getElementById('checklistcontainer').innerHTML = html
}

function GetQuestionGroups(id) {
  var html = "";
  questionGroups = result[id].questionGroups
  for (let i = 0; i < questionGroups.length; i++) {
    html += `
            <div class="row">
              <div class="col">
                <div class="row"><h3>${result[id].questionGroups[i].name}</h3></div>
                <div class="row">${GetQuestions(id, i)}</div>
              </div>
            </div>`
  }
  return html;
}

var allQuestions = []

function GetQuestions(clid, qgid) {
  var html = "";
  questions = result[clid].questionGroups[qgid].questions
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    allQuestions.push(q)
    html += `<div class="col-10">
              <div class="row">
                <div class="col-lg">${i+1}) ${q.text} <button onclick="ToggleSubQuestions(${q.questionId})">i</button></div>
                <div class="col">${LoadAnswerType(q.answerType.answerOption, q.questionId)}</div>
              </div>
              <div class="row" id="subquestions${q.questionId}"></div>
            </div>
            <div class="col-2">
              <textarea id="remark${q.questionId}" class="remarkfield" placeholder="Supplerende bemærkning..."></textarea>
              <input type="file" name="file${q.questionId}" id="file${q.questionId}">
            </div>`;
  }
  return html;
}

function ToggleSubQuestions(questionId) {
  html = document.getElementById("subquestions" + questionId).innerHTML
  if (html == "") {
    html = GetSubQuestions(questionId)
  } else {
    html = ""
  }
  document.getElementById("subquestions" + questionId).innerHTML = html
}

function GetSubQuestions(id) {
  var html = ""

  allQuestions.forEach(question => {
    if (question.questionId == id) {
      subquestions = question.subQuestions
    }
  });

  for (let i = 0; i < subquestions.length; i++) {
    const q = subquestions[i];
    html += `
            <div class="col-10">
              <div class="row" style="border: 1px solid black; min-height: 70px; align-items: center;">
                <div class="col-lg" style="font-size: 1rem;">${q.text}</div>
                <div class="col-lg" style="font-size: 0.8rem;">${LoadAnswerType(q.answerType.answerOption, q.questionId)}</div>
              </div>
            </div>
            <div class="col-2">
              <textarea id="remark${q.questionId}" class="remarkfield" placeholder="Supplerende bemærkning..."></textarea>
              <input type="file" name="file${q.questionId}" id="file${q.questionId}">
            </div>
            `
  }
  return html;
}

function LoadAnswerType(answerType, questionId) {
  switch (answerType) {
    case "Main":
      return LoadAnswerMain(questionId)
    default:
      break;
  }
}

function LoadAnswerMain(questionId) {
  return `
            <div class="row radiobuttonholder">
              <div class="col">
                <label for="main${questionId}_1">OK</label><br>
                <input type="radio" id="main${questionId}_1" name="main${questionId}" value="OK">
              </div>
              <div class="col">
                <label for="main${questionId}_2">Afvigelse</label><br>
                <input type="radio" id="main${questionId}_2" name="main${questionId}" value="Afvigelse">
              </div>
              <div class="col">
                <label for="main${questionId}_3">Observation</label><br>
                <input type="radio" id="main${questionId}_3" name="main${questionId}" value="Observation">
              </div>
              <div class="col">
                <label for="main${questionId}4">Forbedring</label><br>
                <input type="radio" id="main${questionId}4" name="main${questionId}" value="Forbedring">
              </div>
              <div class="col">
                <label for="main${questionId}_5">Ikke relevant</label><br>
                <input type="radio" id="main${questionId}_5" name="main${questionId}" value="Ikke relevant">
              </div>
            </div>
          `
}


function Answers() {
  var answers = []
  for (let i = 0; i < allQuestions.length; i++) {
    const q = allQuestions[i];
    ele = document.querySelector(`input[name="main${q.questionId}"]:checked`)
    comment = document.querySelector(`textarea#remark${q.questionId}`)
    if (ele != null && ele.value != "OK") {
      answer = {
        "answer": ele.value,
        "auditorId": 9,
        "comment": comment.value,
        "cvr": 12345678,
        "questionId": q.questionId,
        "remark": "Remark",
        "reportId": 1
      }
      answers.push(answer)
    }
  }
  return answers
}

function GetAnswers() {
  fetch(reportsurl['prod'])
    .then(response => response.json())
    .then(data => {
      console.log(data[0].questionAnswers)
    })
}

/*
  answer = {
    "answer": "OK",
    "auditorId": 9,
    "comment": "Comment",
    "cvr": 12345678,
    "questionId": 20,
    "remark": "Remark",
    "reportId": 1
  }
*/

/*
`{
        "answer": "OK",
        "remark": "Remark",
        "comment": "Comment",
        "cvr": 12345678,
        "questionId": 20,
        "auditorId": 9,
        "reportId": 1
      }`
*/

function Post() {
  console.log('POST:')
  fetch(answersurl['prod'], {
      method: 'POST',
      body: JSON.stringify(Answers()),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(response)
      const btncontainer = document.getElementById('buttoncontainer')
      if (response.ok) btncontainer.innerHTML += "<p id='response'>Svar gemt succesfuldt.</p>"
      else btncontainer.innerHTML += `<p id='response'>${response}</p>`
    })
}

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

function generate() {
  loadFile("input.docx", async function (error, content) {
    if (error) {
      throw error
    };

    // The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
    function replaceErrors(key, value) {
      if (value instanceof Error) {
        return Object.getOwnPropertyNames(value).reduce(function (error, key) {
          error[key] = value[key];
          return error;
        }, {});
      }
      return value;
    }

    function errorHandler(error) {
      console.log(JSON.stringify({
        error: error
      }, replaceErrors));

      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map(function (error) {
          return error.properties.explanation;
        }).join("\n");
        console.log('errorMessages', errorMessages);
        // errorMessages is a humanly readable message looking like this :
        // 'The tag beginning with "foobar" is unopened'
      }
      throw error;
    }

    var zip = new PizZip(content);
    var doc;
    try {
      doc = new window.docxtemplater(zip);
    } catch (error) {
      // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
      errorHandler(error);
    }

    const data = await GetReport()
    const completed = new Date(data.completed).toDateString()
    const afvigelser = await GetAfvigelser(data)
    const observationer = await GetObservationer(data)
    const forbedringer = await GetForbedringer(data)

    doc.setData({
      auditor: data.auditor.name,
      completed: completed,
      companyName: data.companyName,
      cvr: data.cvr,
      employees: data.employees,
      answers: data.questionAnswers,
      afvigelser: afvigelser,
      observationer: observationer,
      forbedringer: forbedringer
    });
    try {
      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      doc.render();
    } catch (error) {
      // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
      errorHandler(error);
    }

    var out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }) //Output the document using Data-URI
    saveAs(out, "Rapport.docx")
  })
}

/*
[{
        "answer": "Afvigelse",
        "auditorId": 9,
        "comment": "",
        "cvr": 12345678,
        "questionId": 1,
        "remark": "Remark",
        "reportId": 1
      }, {
        "answer": "Observation",
        "auditorId": 9,
        "comment": "",
        "cvr": 12345678,
        "questionId": 5,
        "remark": "Remark",
        "reportId": 1
      }, {
        "answer": "Forbedring",
        "auditorId": 9,
        "comment": "",
        "cvr": 12345678,
        "questionId": 20,
        "remark": "Remark",
        "reportId": 1
      }]
*/

async function GetReport() {
  const response = await fetch(reportsurl['prod'] + "/1")
  const json = await response.json()
  console.log(json)
  return json
}

function GetAfvigelser(data) {
  const result = data.questionAnswers.filter(answer => answer.answer == "Afvigelse")
  return result
}

function GetObservationer(data) {
  const result = data.questionAnswers.filter(answer => answer.answer == "Observation")
  return result
}

function GetForbedringer(data) {
  const result = data.questionAnswers.filter(answer => answer.answer == "Forbedring")
  return result
}