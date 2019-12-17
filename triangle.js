class Triangle {
  // p1, p2, p3 are all Point objects
  constructor(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.e1 = new Edge(p1, p2);
    this.e2 = new Edge(p1, p3);
    this.e3 = new Edge(p2, p3);

    this.id = ('p1' + Math.floor(p1.x) + Math.floor(p1.y) + Math.floor(p2.x) +
                Math.floor(p2.y) + Math.floor(p3.x) + Math.floor(p3.y));
    this.vertices = [p1, p2, p3];
    this.edges = [this.e1, this.e2, this.e3];
    this.isCCW = ((this.p2.x - this.p1.x) * (this.p3.y - this.p1.y) -
                  (this.p3.x - this.p1.x) * (this.p2.y - this.p1.y) > 0);
  }

  eq = (other) => {
    let c1 = this.p1.eq(other.p1) || this.p1.eq(other.p2) || this.p1.eq(other.p3);
    let c2 = this.p2.eq(other.p1) || this.p2.eq(other.p2) || this.p2.eq(other.p3);
    let c3 = this.p3.eq(other.p1) || this.p3.eq(other.p2) || this.p3.eq(other.p3);
    return c1 && c2 && c3;
  }

  isPointVertex = (p) => {
    return p.eq(this.p1) || p.eq(this.p2) || p.eq(this.p3);
  }

  sign = (p1, p2, p3) => {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  }

  // https://stackoverflow.com/a/2049593
  contains = (p) => {
    let d1 = this.sign(p, this.p1, this.p2);
    let d2 = this.sign(p, this.p2, this.p3);
    let d3 = this.sign(p, this.p3, this.p1);

    let has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    let has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
  }

  // https://stackoverflow.com/a/44875841
  circumcircleContains = (p) => {
    let ax_ = this.p1.x - p.x;
    let ay_ = this.p1.y - p.y;
    let bx_ = this.p2.x - p.x;
    let by_ = this.p2.y - p.y;
    let cx_ = this.p3.x - p.x;
    let cy_ = this.p3.y - p.y;
    let ans = ((ax_*ax_ + ay_*ay_) * (bx_*cy_-cx_*by_) -
               (bx_*bx_ + by_*by_) * (ax_*cy_-cx_*ay_) +
               (cx_*cx_ + cy_*cy_) * (ax_*by_-bx_*ay_));
    return this.isCCW ? ans > 0 : ans < 0;
  }

  containsSuperTriangleVertex = () => {
    return this.p1.isInfinite || this.p2.isInfinite || this.p3.isInfinite;
  }
}
