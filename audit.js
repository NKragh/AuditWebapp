const url = "https://auditrest.azurewebsites.net/api/checklists"

window.onload = GetChecklists()

var ele = document.getElementById('container')

var result;

function GetChecklists() {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      result = data;
      for (x in data) {
        ele.innerHTML += `<div class="row"><div class="col-10"><h2>${data[x].name}</h2></div><div class="col-2" style="text-align: center; font-size: 1.5em; font-weight: 600;">Bemærkninger</div></div><hr>`
        ele.innerHTML += GetQuestionGroups(x)
      }

    })
}

function GetQuestionGroups(id) {
  var html = "";
  questionGroups = result[id].questionGroups
  for (x in questionGroups) {
    html += `
            <div class="row">
              <div class="col">
                <div class="row"><h3>${result[id].questionGroups[x].name}</h3></div>
                <div class="row">${GetQuestions(id, x)}</div>
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
                <div class="col" style="font-size: 1.2rem;">${i+1}) ${q.text}</div>
                <div class="col" style="font-size: 0.8rem;">${LoadAnswerType(q.answerType.answerOption, q.questionId)}</div>
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
  //${GetBemærkning()}
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
              <div class="col" style="font-size: 1rem;">${q.text}</div>
              <div class="col">${LoadAnswerType(q.answerType.answerOption, q.subQuestionId)}</div>
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
    case "Satisfaction":
      return LoadAnswerSatisfaction(questionId)
    case "YesNo":
      return LoadAnswerYesNo(questionId)
    default:
      break;
  }
}

function LoadAnswerMain(questionId) {
  return `
          <div class="col">
            <div class="row radiobuttonholder">
              <div class="col">
                <label for="main${questionId+1}">OK</label><br>
                <input type="radio" id="main${questionId+1}" name="main${questionId}" value="OK">
              </div>
              <div class="col">
                <label for="main${questionId+2}">Afvigelse</label><br>
                <input type="radio" id="main${questionId+2}" name="main${questionId}" value="Afvigelse">
              </div>
              <div class="col">
                <label for="main${questionId+3}">Observation</label><br>
                <input type="radio" id="main${questionId+3}" name="main${questionId}" value="Observation">
              </div>
              <div class="col">
                <label for="main${questionId+4}">Forbedring</label><br>
                <input type="radio" id="main${questionId+4}" name="main${questionId}" value="Forbedring">
              </div>
            </div>
          </div>
          `

}

function LoadAnswerSatisfaction(questionId) {
  return `
          <div class="col">
            <div class="row radiobuttonholder">
              <div class="col">
                <label for="satisfaction${questionId+1}">Meget tilfreds</label><br>
                <input type="radio" id="satisfaction${questionId+1}" name="satisfaction${questionId}" value="Meget tilfreds">
              </div>
              <div class="col">
                <label for="satisfaction${questionId+2}">Tilfreds</label><br>
                <input type="radio" id="satisfaction${questionId+2}" name="satisfaction${questionId}" value="Tilfreds">
              </div>
              <div class="col">
                <label for="satisfaction${questionId+3}">Hverken eller</label><br>
                <input type="radio" id="satisfaction${questionId+3}" name="satisfaction${questionId}" value="Hverken eller">
              </div>
              <div class="col">
                <label for="satisfaction${questionId+4}">Utilfreds</label><br>
                <input type="radio" id="satisfaction${questionId+4}" name="satisfaction${questionId}" value="Utilfreds">
              </div>
              <div class="col">
                <label for="satisfaction${questionId+5}">Meget utilfreds</label><br>
                <input type="radio" id="satisfaction${questionId+5}" name="satisfaction${questionId}" value="Meget utilfreds">
              </div>
            </div>
          </div>
          `
}

function LoadAnswerYesNo(questionId) {
  return `
          <div class="row radiobuttonholder">
            <div class="col">
              <label for="satisfaction${questionId+1}">Ja</label><br>
              <input type="radio" id="satisfaction${questionId+1}" name="satisfaction${questionId}" value="Meget tilfreds">
            </div>
            <div class="col">
              <label for="satisfaction${questionId+2}">Nej</label><br>
              <input type="radio" id="satisfaction${questionId+1}" name="satisfaction${questionId}" value="Tilfreds">
            </div>
          </div>
          `
}