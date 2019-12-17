drawPoint = (p, r) => {
  let point = document.createElement('circle');
  point.setAttribute('cx', p.x);
  point.setAttribute('cy', p.y);
  point.setAttribute('r', r);
  point.setAttribute('fill', 'black');
  document.getElementById('plane').appendChild(point);
  $('.planeContainer').html($('.planeContainer').html());
}

drawEdge = (e) => {
  let edge = document.createElement('line');
  edge.setAttribute('x1', e.p1.x);
  edge.setAttribute('y1', e.p1.y);
  edge.setAttribute('x2', e.p2.x);
  edge.setAttribute('y2', e.p2.y);
  edge.setAttribute('class', 'edge');
  document.getElementById('plane').appendChild(edge);
  $('.planeContainer').html($('.planeContainer').html());
}

drawTriangle = (t) => {
  let triangle = document.createElement('polygon');
  let coord1 = t.p1.x + ', ' + t.p1.y;
  let coord2 = t.p2.x + ', ' + t.p2.y;
  let coord3 = t.p3.x + ', ' + t.p3.y;
  triangle.setAttribute('points', coord1 + ' ' + coord2 + ' ' + coord3);
  triangle.setAttribute('class', 'triangle');
  triangle.setAttribute('id', t.id);
  document.getElementById('plane').appendChild(triangle);
  $('.planeContainer').html($('.planeContainer').html());
}

drawHighlightedTriangle = (t) => {
  $(document.getElementById(t.id)).addClass('highlight-triangle');
}

drawHighlightedEdge = (e) => {
  drawEdge(e);
  $('#plane').children().last().attr('class', 'highlight-edge');
}

drawHighlightedPoint = (p, r) => {
  drawPoint(p, r);
  $('#plane').children().last().attr('id', 'red-dot');
}

findSharedEdge = (t1, t2) => {
  let sharedEdge;
  for(let i = 0; i < t1.edges.length; i++) {
    for(let j = 0; j < t2.edges.length; j++) {
      if(t1.edges[i].eq(t2.edges[j])) {
        sharedEdge = t1.edges[i];
        break;
      }
    }
  }
  return sharedEdge;
}

getVertexOppositeOfEdge = (e, t) => {
  return t.vertices.filter((v) => { return !v.eq(e.p1) && !v.eq(e.p2) })[0];
}

initInstructions = () => {
  $('.warning').empty();
  let stepMap = {
    1: 'Add point to triangulation',
    2: 'Locate triangle containing point',
    3: 'Update triangulation and add edges',
    4: 'Test if edges are legal',
    5: 'Flip edge',
    6: 'Remove super triangle',
  };
  $('.instructions').empty();
  for(let i = 1; i <= 6; i++) {
    let intstruction = document.createElement('p');
    intstruction.setAttribute('id', 'step-'+i);
    intstruction.innerHTML = i + '.) ' + stepMap[i];
    $('.instructions').append(intstruction);
  }
  $('.legend').show();
}

initFinishInstructions = () => {
  updateInstructionHighlight(6);
  $('#step-button').hide();
  let finishButton = document.createElement('button');
  finishButton.setAttribute('id', 'finish-button');
  finishButton.setAttribute('class', 'btn btn-success');
  finishButton.innerHTML = 'Finish Triangulation';
  $('.instructions').prepend(finishButton);
}

initResetButton = () => {
  let resetButton = document.createElement('button');
  resetButton.setAttribute('id', 'reset-button');
  resetButton.setAttribute('class', 'btn btn-primary');
  resetButton.innerHTML = 'Reset';
  $('.instructions').append(resetButton);
  $('#reset-button').click(() => {
    location.reload();
  });
}

initStepButtons = () => {
  let stepButton = document.createElement('button');
  stepButton.setAttribute('id', 'step-button');
  stepButton.setAttribute('class', 'btn btn-success');
  stepButton.innerHTML = 'Next Step';
  let testEdgeButton = document.createElement('button');
  testEdgeButton.setAttribute('id', 'test-button');
  testEdgeButton.setAttribute('class', 'btn btn-primary');
  testEdgeButton.style.display = 'none';
  testEdgeButton.innerHTML = 'Test Edge';
  let flipEdgeButton = document.createElement('button');
  flipEdgeButton.setAttribute('id', 'flip-button');
  flipEdgeButton.setAttribute('class', 'btn btn-warning');
  flipEdgeButton.style.display = 'none';
  flipEdgeButton.innerHTML = 'Flip Edge';
  $('.instructions').before(stepButton);
  $('.instructions').before(testEdgeButton);
  $('.instructions').before(flipEdgeButton);
}

warnUser = (msg) => {
  let warning = document.createElement('p');
  warning.innerHTML = msg;
  warning.setAttribute('class', 'warning');
  $('.warning').append(warning);
}

updateInstructionHighlight = (step) => {
  $('.current-step').removeAttr('class');
  $('#step-'+step).addClass('current-step');
}
