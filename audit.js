const checklisturl = "https://auditrest.azurewebsites.net/api/checklists"
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
  document.getElementById('testbtn').addEventListener('click', TestPost)
}

function GetChecklists() {
  var html = ""
  fetch(checklisturl)
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

function GetQuestions(clid, qgid) {
  var html = "";
  questions = result[clid].questionGroups[qgid].questions
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    html += `<div class="col-10">
              <div class="row">
                <div class="col-lg" style="font-size: 1.2rem;">${i+1}) ${q.text}</div>
                <div class="col-lg" style="font-size: 1rem;">${LoadAnswerType(q.answerType.answerOption, q.questionId)}</div>
              </div>
              <div class="row">
                ${GetSubQuestions(q)}
              </div>
            </div>
            <div class="col-2">
              <p contenteditable="true" id="remark${q.questionId}" style="border: 1px solid darkgreen;">Supplerende bemærkning...</p>
              <input type="file" name="file${q.questionId}" id="file${q.questionId}">
            </div>`
  }
  return html;
}

function GetSubQuestions(question, id) {
  var html = ""
  subquestions = question.subQuestions
  for (let i = 0; i < subquestions.length; i++) {
    const q = subquestions[i];
    html += `
            <div class="col-12">
              <div class="row" style="border: 1px solid black; min-height: 70px; align-items: center;">
              <div class="col-lg" style="font-size: 1rem;">${q.text}</div>
              <div class="col-lg" style="font-size: 0.8rem;">${LoadAnswerType(q.answerType.answerOption, q.questionId)}</div>
              </div>
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
          <div class="col">
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
          </div>
          `

}

TestGet()

function TestGet() {
  fetch(reportsurl['dev'])
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

function TestPost() {
  console.log('POST:')

  fetch(answersurl['dev'], {
      method: 'POST',
      body: `{
        "answer": "OK",
        "remark": "Remark",
        "comment": "Comment",
        "cvr": 12345678,
        "questionId": 20,
        "auditorId": 9,
        "reportId": 1
      }`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(response)
    })
}