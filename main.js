var fileInput = document.getElementById("file-input");
var options = document.getElementById("options");
var buzzKeyInput = document.getElementById("buzz-key");
var buzzKeyDisplay = document.getElementById("buzz-key-display");
var result = document.getElementById("result");
var submitButton = document.getElementById("submit");
var table = document.getElementById("display-segments");
var colNameInput = document.getElementById("col-name-input");
var parseButton = document.getElementById("parse");
var headers = ["Alternative ID", "Segment Name", "Segment Description"];
var nameColumns = [2];
var newSegments;
var buzzKey = null;

colNameInput.onkeyup = getNameColumns;
fileInput.onchange = parse;
parseButton.onclick = parse;
buzzKeyInput.onkeyup = function(event) {
  buzzKey = event.target.value;
  buzzKeyDisplay.textContent = "Buzz Key: " + buzzKey;
}

function parse(event) {
  var fileList = fileInput.files;
  var csvFile = fileList[0];
  if (nameColumns.length === 0) { alert("Please specify a column to use as segment name."); return; }
  if (csvFile) {
    Papa.parse(csvFile, {
      complete: function(output) {
        newSegments  = output.data.map(function(d) {
          if (d[10] === "TRUE") {
            return {
              alternative_id: d[0],
              segment_name: nameColumns.map(function(c) { return d[c]; }).join(" "),
              segment_description: d[5]
            };
          }
        });
        displayOutput(newSegments);
      }
    });
  }
}

function createSegment(id, name, desc) {
  var url = "https://"+buzzKey+".api.beeswax.com/rest/segment";
  var data = {
    alternative_id: id,
    segment_name: name,
    segment_description: desc,
    ttl_days: 90
  }
  axios.post(url, data, { withCredentials: true })
  .then(function(res) {
    result.textContent += "Liveramp Segment " + id + ": " + JSON.stringify(res.data) + "\n";
  })
  .catch(function(error) {
    result.textContent += "Error - Liveramp Segment " + id + ": ";
    if (error.response && error.response.data) {
      result.textContent += JSON.stringify(error.response.data) + "\n";
    } else {
      result.textContent += "ensure you have entered a valid buzz key.\n";
    }
  });
}

function displayOutput(newSegments) {
  var headerRow = "<tr><th>"+headers.join("</th><th>")+"</th></tr>";
  var segmentRows = newSegments.map(function(d) {
    if (d) { return "<tr><td>"+d.alternative_id+"</td><td>"+d.segment_name+"</td><td>"+d.segment_description+"</td></tr>"; }
  });
  table.innerHTML = headerRow + segmentRows.join("");
  submitButton.style.display = "inline-block";
  submitButton.addEventListener("click", createSegments);
}

function createSegments() {
  result.textContent = "";
  var invalid = /\W/g.test(buzzKey);
  if (buzzKey != null && buzzKey != '' && !invalid) {
    submitButton.removeEventListener("click", createSegments);
    submitButton.style.display = "none";
    newSegments.forEach(function(d) {
      if (d) { createSegment(d.alternative_id, d.segment_name, d.segment_description); }
    });
  } else {
    alert("Please enter a valid buzz key.")
  }
}

function getNameColumns(event) {
  event.target.value.split(".").join("");
  nameColumns = event.target.value.split(",").map(function(c) {
    if (!isNaN(c) && Number(c) >= 1) { return Number(c) - 1; }
    else if (Number(c) < 1) { return; }
    else { alert(c + " is not a valid number.") }
  });
  nameColumns = nameColumns.filter(function(c) {
    if (c !== undefined) return c;
  });
  console.log("segment name column(s): " + nameColumns);
}
