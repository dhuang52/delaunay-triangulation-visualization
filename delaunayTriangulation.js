window.onload = () => {
    dt = new DelaunayTriangulation();
}

class DelaunayTriangulation {
  constructor() {
    this.freeze = false;
    this.step = 1;
    // point radius
    this.r = 5;
    this.T = [];
    this.P = [];
    this.PinT = [];
    this.initSuperTriangle();
    this.initVisualization();
  }

  initSuperTriangle = () => {
    let w = $('.planeContainer').width();
    let h = $('.planeContainer').height();
    let p0 = new Point(w / 2.0,     this.r, true);
    let p1 = new Point(this.r,      h - this.r, true);
    let p2 = new Point(w - this.r,  h - this.r, true);
    p0.lexIndex = 0;
    p1.lexIndex = -2;
    p2.lexIndex = -1;
    this.superTriangle = new Triangle(p0, p1, p2);
    this.T.push(this.superTriangle);
    drawTriangle(this.superTriangle);
  }

  initVisualization = () => {
    // let users click in points
    $('.planeContainer').click((e) => {
      if (!this.freeze) {
        const x = e.pageX - $('.planeContainer').position().left - (this.r / 2.0);
        const y = e.pageY - $('.planeContainer').position().top - (this.r / 2.0);

        // "edge" case testing purposes
        // const x = ($('.planeContainer').width() / 2)
        // const y = ($('.planeContainer').height() / 2) + (Math.random() * 200)
        let duplicate = false;
        for(let i = 0; i < this.P.length; i++) {
          duplicate = (this.P[i].x == x && this.P[i].y == y);
          if (duplicate) break;
        }
        let p = new Point(x, y);
        $('.warning').empty();
        if (!duplicate && this.superTriangle.contains(p)) {
          this.P.push(p);
          drawPoint(p, this.r);
        } else {
          warnUser(duplicate ? 'No duplicate points' : 'Point out of bounds of super triangle');
        }
      }
    });

    $('#run').click(() => {
      // freeze the plane so users can no longer add points
      this.freeze = true;
      this.Psort = this.P.sort(function(a,b) {
        if( a.y == b.y) return a.x-b.x;
        return b.y-a.y;
      });
      for(let i = 0; i < this.Psort.length; i++) {
        this.Psort[i].lexIndex = i+1;
      }
      this.initTriangulation();
      initInstructions();
    });
  }

  initTriangulation = () => {
    $('#run').hide();
    $('.instructions').empty();
    $('.instructions').append('<p>Computing a random permutation for the set of points</p>');

    // shuffle points
    this.P = _.shuffle(this.P);

    // clear plane except for super triangle
    $('#plane').empty();
    drawTriangle(this.superTriangle);

    // initialize the buttons used to step through the visualization
    initStepButtons();

    $('#step-button').click(() => {
      updateInstructionHighlight(this.step);
      if(this.step == 1) {
        if(!this.P.length) {
          initFinishInstructions();
          $('#finish-button').click(() => {
            this.removeSuperTriangle();
            initResetButton();
          });
        } else {
          this.trianglesIncidentToP = [];
          $('#red-dot').removeAttr('id');
          $('#test-button').hide();
          $('polygon').removeClass('highlight-triangle');
          this.addPointToTriangulationStep();
          this.step++;
        }
      } else if(this.step == 2) {
        this.pointLocationStep();
        this.step++;
      } else if (this.step == 3) {
        this.addEdgesStep();
        this.step++;
      } else {
        $('#step-button').hide();
        $('#test-button').show();
        this.tempT = this.T;
      }
    });

    $('#test-button').click(() => {
      $('polygon').removeClass('highlight-triangle');
      if(!this.trianglesIncidentToP.length) {
        $('#step-button').show();
        $('#test-button').hide();
        this.step = 1;
      } else {
        this.testEdgesStep();
      }
    });

    $('#flip-button').click(() => {
      if(this.illegalEdge) {
          this.legalizeEdge(this.p, this.illegalEdge);
      } else {
        this.step = 4;
        $('#test-button').prop('disabled', false);
        $('#flip-button').hide();
      }
    });
  }

  addPointToTriangulationStep = () => {
    const p = this.P[this.P.length - 1];
    drawHighlightedPoint(p, this.r);
  }

  pointLocationStep = () => {
    $('#red-dot').remove();
    const p = this.P.pop();
    this.PinT.push(p);
    this.p = p;
    let triangles = [];
    // TODO: update to trapezoidal map or some 2D point query DS
    for(let i = 0; i < this.T.length; i++) {
      if (this.T[i] && this.T[i].contains(p)) {
        triangles.push(i);
      }
    }

    if(triangles.length == 1) {
      // point in triangle
      let t = this.T[triangles[0]];
      drawHighlightedTriangle(t);
      // remove triangles
      this.T = this.T.filter((tri, j) => {return !triangles.includes(j)});
      // add 3 new triangles
      this.T.push(new Triangle(p, t.p1, t.p2));
      this.T.push(new Triangle(p, t.p1, t.p3));
      this.T.push(new Triangle(p, t.p2, t.p3));
      this.trianglesIncidentToP = [this.T[this.T.length-1],
                                   this.T[this.T.length-2],
                                   this.T[this.T.length-3]];
      this.newTrianglesAdded = 3;
    } else if(triangles.length == 2) {
      // point on edge of triangles
      let t1 = this.T[triangles[0]];
      let t2 = this.T[triangles[1]];
      // find shared edge
      let sharedEdge = findSharedEdge(t1, t2);
      if(!sharedEdge) {
        console.log('SOMETHING IS REALLY WRONG');
      }
      drawHighlightedEdge(sharedEdge);
      // find 'opposite' vertices
      let v1 = getVertexOppositeOfEdge(sharedEdge, t1);
      let v2 = getVertexOppositeOfEdge(sharedEdge, t2);
      // remove triangles
      this.T = this.T.filter((tri, j) => { return !triangles.includes(j) });

      // add the 4 new triangles
      this.T.push(new Triangle(p, sharedEdge.p1, v1));
      this.T.push(new Triangle(p, sharedEdge.p1, v2));
      this.T.push(new Triangle(p, sharedEdge.p2, v1));
      this.T.push(new Triangle(p, sharedEdge.p2, v2));
      this.trianglesIncidentToP = [this.T[this.T.length-1],
                                   this.T[this.T.length-2],
                                   this.T[this.T.length-3],
                                   this.T[this.T.length-4]];
      this.newTrianglesAdded = 4;
    } else {
      console.log(triangles);
      console.log('something is wrong... no triangles found/excess triangles found');
    }
    drawHighlightedPoint(p, this.r);
  }

  addEdgesStep = () => {
    $('polygon').removeClass('highlight-triangle');
    for(let i = 0; i < this.newTrianglesAdded; i++) {
      let t = this.T[this.T.length - i - 1];
      drawTriangle(t);
    }
  }

  testEdgesStep = () => {
    let t = this.trianglesIncidentToP.pop();
    drawHighlightedTriangle(t);
    let isLegal = true;
    for(let i = 0; i < this.PinT.length; i++) {
      if(!t.isPointVertex(this.PinT[i]) && t.circumcircleContains(this.PinT[i])) {
        isLegal = false;
        break;
      }
    }
    let edgeFromSuperTriangle = (t.e3.eq(this.superTriangle.e1) ||
                                 t.e3.eq(this.superTriangle.e2) ||
                                 t.e3.eq(this.superTriangle.e3));
    if(!isLegal && !edgeFromSuperTriangle) {
      $('#test-button').prop('disabled', true);
      $('#flip-button').show();
      this.illegalTriangle = t;
      this.illegalEdge = t.e3;
      drawHighlightedEdge(this.illegalEdge);

      this.step = 5;
      updateInstructionHighlight(this.step);
    }
  }

  legalizeEdge = (p, e) => {
    let t1 = this.illegalTriangle;

    // remove triangle
    this.T = this.T.filter((tri) => { return !tri.eq(t1) });
    this.trianglesIncidentToP = this.trianglesIncidentToP.filter((tri) => { return !tri.eq(t1) });

    // get other triangle incident to illegal edge
    let k = this.getTriangleIncidentToEdge(this.illegalEdge);
    let t2 = this.T[k];

    // remove that triangle
    this.T = this.T.filter((tri) => { return !tri.eq(t2) });
    this.trianglesIncidentToP = this.trianglesIncidentToP.filter((tri) => { return !tri.eq(t2) });

    // page 204-205 of Computational Geometry: Algorithms and Applications
    let v2 = getVertexOppositeOfEdge(this.illegalEdge, t2);
    let edgeCase = (this.illegalEdge.p1.isInfinite || this.illegalEdge.p2.isInfinite) && !(this.illegalEdge.p1.isInfinite && this.illegalEdge.p2.isInfinite);
    if(edgeCase) {
      let i = this.illegalEdge.p1.lexIndex;
      let j = this.illegalEdge.p2.lexIndex;
      let min_ij = Math.min(i, j);
      let k = v2.lexIndex;
      let l = p.lexIndex;
      let min_kl = Math.min(k, l);

      if(min_kl < min_ij) {
        // edge is legal, add back removed triangles
        this.T.push(t1);
        this.T.push(t2);
      } else {
        // edge is illegal
        // add 2 new triangles
        let newt1 = new Triangle(p, t1.p3, v2);
        let newt2 = new Triangle(p, t1.p2, v2);
        this.T.push(newt1);
        this.T.push(newt2);
        this.trianglesIncidentToP.push(newt1);
        this.trianglesIncidentToP.push(newt2);
      }
    } else {
      // add 2 new triangles
      let newt1 = new Triangle(p, t1.p3, v2);
      let newt2 = new Triangle(p, t1.p2, v2);
      this.T.push(newt1);
      this.T.push(newt2);
      this.trianglesIncidentToP.push(newt1);
      this.trianglesIncidentToP.push(newt2);
    }

    this.redrawT();
    drawHighlightedPoint(p, this.r);
    this.illegalEdge = null;
    $('#test-button').prop('disabled', false);
    $('#flip-button').hide();
    this.step = 4;
    updateInstructionHighlight(this.step);
  }

  removeSuperTriangle = () => {
    $('#finish-button').remove();
    this.T = this.T.filter((t) => { return !t.containsSuperTriangleVertex(); });
    this.redrawT(false);
  }

  redrawT = (redrawSuperTriangle=true) => {
    $('#plane').empty();
    if(redrawSuperTriangle) {
      drawTriangle(this.superTriangle);
    }

    for(let i = 0; i < this.PinT.length; i++) {
      drawPoint(this.PinT[i], this.r);
    }

    for(let i = 0; i < this.T.length; i++) {
      if (this.T[i]){
        drawTriangle(this.T[i]);
      }
    }
  }

  getTriangleIncidentToEdge = (e) => {
    for(let i = 0; i < this.T.length; i++) {
      let t = this.T[i];
      if(!t) continue;
      let isIncident = (e.eq(t.e1) || e.eq(t.e2) || e.eq(t.e3));
      if(isIncident) {
        return i;
      }
    }
  }
}
