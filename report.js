async function generate() {
  await LoadData()
  // generateDOCX()
  generatePDF()
}

var data;
var completed;
var afvigelser;
var observationer;
var forbedringer;
var auditor;
var companyName;
var cvr;
var employees = [];
var answers;

async function LoadData() {
  data = await GetReport()
  completed = new Date(data.completed).toDateString()
  afvigelser = await GetAfvigelser(data)
  observationer = await GetObservationer(data)
  forbedringer = await GetForbedringer(data)

  auditor = data.auditor.name
  companyName = data.companyName
  cvr = data.cvr
  employees = data.employees
  answers = data.questionAnswers
}

async function GetReport() {
  const response = await fetch(baseurl[environment] + "reports/1")
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

function employeeNames() {
  var s = ""
  for (const id in employees) {
    const employee = employees[id];
    s += "\n" + employee.firstName + " " + employee.lastName
  }
  return s
}


function loadActionRows() {
  var rows = [];
  rows.push(['Resultat', 'Bemærkning', 'Kommentar', 'Reference']);
  for (const i in afvigelser) {
    rows.push([afvigelser[i].answer, afvigelser[i].remark, afvigelser[i].comment, afvigelser[i].question])
  }
  for (const i in observationer) {
    rows.push([observationer[i].answer, observationer[i].remark, observationer[i].comment, observationer[i].question])
  }
  for (const i in forbedringer) {
    rows.push([forbedringer[i].answer, forbedringer[i].remark, forbedringer[i].comment, forbedringer[i].question])
  }
  return rows
}

function loadAllRows() {
  var rows = []
  rows.push(['Resultat', 'Bemærkning', 'Kommentar', 'Reference']);
  for (const i in answers) {
    rows.push([answers[i].answer, answers[i].remark, answers[i].comment, answers[i].question])
  }
  return rows
}

function generatePDF() {
  var docDefinition = {
    content: [{
        text: 'Auditrapport',
        style: 'header'
      },
      `Virksomhed: ${companyName}, CVR: ${cvr}`,
      {
        style: 'participants',
        columns: [{
          width: 'auto',
          text: `Auditor: \nDeltagere: `,
        }, {
          text: auditor + employeeNames()
        }]
      },
      {
        text: 'Samling af punkter der kræver handling',
        style: 'subheader'
      },
      {
        style: 'tableExample',
        table: {
          body: loadActionRows()
        },
        pageBreak: 'after'
      },
      {
        style: 'header',
        text: 'Alle resultater'
      },
      {
        style: 'tableExample',
        table: {
          body: loadAllRows()
        }
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      tableExample: {
        margin: [0, 5, 0, 15]
      },
      participants: {
        margin: [0, 5, 0, 5]
      }
    }
  };

  pdfMake.createPdf(docDefinition).download('Rapport.pdf')
}

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

function generateDOCX() {
  loadFile("input.docx", async function (error, content) {
    if (error) {
      throw error
    };

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

    doc.setData({
      auditor: auditor,
      completed: completed,
      companyName: companyName,
      cvr: cvr,
      employees: employees,
      answers: answers,
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