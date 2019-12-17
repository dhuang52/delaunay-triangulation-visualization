class Edge {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  eq = (other) => {
    return ( (this.p1.eq(other.p1) && this.p2.eq(other.p2)) ||
             (this.p1.eq(other.p2) && this.p2.eq(other.p1)));
  }

  containsPoint = (p) => {
    return (this.p1.dist(p) + this.p2.dist(p) == this.p1.dist(p2));
  }
}
