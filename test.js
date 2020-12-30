const baseurl = {
  prod: "https://auditrest.azurewebsites.net/api/",
  dev: "http://localhost:51284/api/"
}
environment = "prod"

function LastAudit() {
  console.log("test")
  const cvr = document.getElementById('CVR').innerHTML
  fetch(baseurl[environment] + "reports/customer/" + cvr)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      const container = document.getElementById('container')
      const table = document.createElement('div')
      table.classList.add('table')
      var date = data[0].completed.split('T')[0]
      table.appendChild(document.createTextNode(date))
      container.appendChild(table)
      for (const j in data[0].questionAnswers) {
        const answer = data[0].questionAnswers[j];
        if (answer.answer !== "OK") {
          const row = document.createElement('div')
          row.classList.add('row')

          const col1 = document.createElement('div')
          col1.innerHTML = answer.answer
          col1.classList.add('col')
          const col2 = document.createElement('div')
          col2.innerHTML = answer.remark
          col2.classList.add('col')
          const col3 = document.createElement('div')
          col3.innerHTML = answer.comment
          col3.classList.add('col')
          const col4 = document.createElement('div')
          col4.innerHTML = answer.questionId
          col4.classList.add('col')

          row.appendChild(col1)
          row.appendChild(col2)
          row.appendChild(col3)
          row.appendChild(col4)
          table.appendChild(row)
        }
      }

    })
}