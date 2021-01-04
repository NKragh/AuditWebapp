const baseurl = {
  prod: "https://auditrest.azurewebsites.net/api/",
  dev: "http://localhost:51284/api/"
}

window.onload = start

var container = document.getElementById('container')
var checklistcontainer;
var result;

function start() {
  environment = "prod"
  GetChecklists()
  document.getElementById('savebtn').addEventListener('click', Save)
  document.getElementById('completebtn').addEventListener('click', Complete)
}

function GetChecklists() {
  var html = ""
  fetch(baseurl[environment] + "checklists")
    .then(response => response.json())
    .then(data => {
      // console.log(data)
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
    if (ele != null) {
      answer = {
        "answer": ele.value,
        "auditorId": 9,
        "comment": comment.value,
        "cvr": 12345678,
        "questionId": q.questionId,
        "remark": "Remark",
        "reportId": 2
      }
      answers.push(answer)
    }
  }
  return answers
}

function GetAnswers() {
  fetch(baseurl[environment] + "answers")
    .then(response => response.json())
    .then(data => {
      console.log(data)
    })
}

function Save() {
  console.log('POST:')
  fetch(baseurl[environment] + "answers", {
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

function Complete() {
  console.log('POST:')
  fetch(baseurl[environment] + "reports/complete/1", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(response)
      const btncontainer = document.getElementById('buttoncontainer')
      if (response.ok) btncontainer.innerHTML += "<p id='response'>Rapport afsluttet.</p>"
      else btncontainer.innerHTML += `<p id='response'>${response}</p>`
    })

}

function LastAudit() {
  console.log("test")
  const cvr = document.getElementById('CVR').innerHTML
  fetch(baseurl[environment] + "reports/customer/" + cvr)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      const container = document.getElementById('lastaudits')
      container.innerHTML = ""
      const table = document.createElement('div')
      table.classList.add('table')
      var date = data[0].completed.split('T')[0]
      table.appendChild(document.createTextNode(date))
      const link = document.createElement('button')
      // link.href = "C:/Users/nikol/Documents"
      link.addEventListener('click', () => {
        WshShell = new ActiveXObject("WScript.Shell");
        WshShell.Run("explorer.exe")
      })
      link.innerHTML = "Kundemappe"
      table.appendChild(link)
      container.appendChild(table)
      const headers = document.createElement('div')
      headers.classList.add('row')

      const header1 = document.createElement('div')
      header1.innerHTML = "Resultat"
      header1.classList.add('col-2')
      const header2 = document.createElement('div')
      header2.innerHTML = "Bemærkning"
      header2.classList.add('col')
      const header3 = document.createElement('div')
      header3.innerHTML = "Kommentar"
      header3.classList.add('col')
      const header4 = document.createElement('div')
      header4.innerHTML = "Reference"
      header4.classList.add('col-2')
      const header5 = document.createElement('div')
      header5.classList.add('col-1')

      headers.appendChild(header1)
      headers.appendChild(header2)
      headers.appendChild(header3)
      headers.appendChild(header4)
      headers.appendChild(header5)
      table.appendChild(headers)

      for (const j in data[0].questionAnswers) {
        const answer = data[0].questionAnswers[j];
        if (answer.answer !== "OK") {
          const row = document.createElement('div')
          row.classList.add('row')

          const col1 = document.createElement('div')
          col1.innerHTML = answer.answer
          col1.classList.add('col-2')
          const col2 = document.createElement('div')
          col2.innerHTML = answer.remark
          col2.classList.add('col')
          const col3 = document.createElement('div')
          col3.innerHTML = answer.comment
          col3.classList.add('col')
          const col4 = document.createElement('div')
          col4.innerHTML = answer.questionId
          col4.classList.add('col-2')
          const col5 = document.createElement('div')
          const transbtn = document.createElement('button')
          transbtn.id = answer.id
          transbtn.innerHTML = "Overfør"
          transbtn.onclick = (e) => {
            transfer(e)
          }
          col5.appendChild(transbtn)
          col5.classList.add('col-1')

          row.appendChild(col1)
          row.appendChild(col2)
          row.appendChild(col3)
          row.appendChild(col4)
          row.appendChild(col5)
          table.appendChild(row)
        }
      }
    })
  var ele = document.getElementById('lastaudits')
  ele.classList.add('active')

  window.addEventListener('keydown', (e) => {
    if (e.key == "Escape") ele.classList.remove('active')
  })
}

function transfer(e) {
  console.log(e.target.id)
}