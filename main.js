var fileInput = document.getElementById("file-input");
var options = document.getElementById("options");
var buzzKeyInput = document.getElementById("buzz-key");
var buzzKeyDisplay = document.getElementById("buzz-key-display");
var result = document.getElementById("result");
var submitButton = document.getElementById("submit");
var table = document.getElementById("display-segments");
var headers = ["Alternative ID", "Segment Name", "Segment Description"];
var newSegments;
var buzzKey = null;

buzzKeyInput.onkeyup = function(event) {
  buzzKey = event.target.value;
  buzzKeyDisplay.textContent = "Buzz Key: " + buzzKey;
}

fileInput.onchange = function(event) {
  var fileList = fileInput.files;
  var csvFile = fileList[0];
  Papa.parse(csvFile, {
    complete: function(output) {
      newSegments  = output.data.map(function(d) {
        if (d[10] === "TRUE") {
          return {
            alternative_id: d[0],
            segment_name: d[1],
            segment_description: d[5]
          };
        }
      });
      displayOutput(newSegments);
    }
  });
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
  if (buzzKey != null && buzzKey != undefined && !invalid) {
    submitButton.removeEventListener("click", createSegments);
    submitButton.style.display = "none";
    newSegments.forEach(function(d) {
      if (d) { createSegment(d.alternative_id, d.segment_name, d.segment_description); }
    });
  } else {
    alert("Please enter a valid buzz key.")
  }
}
