class Point {
  constructor(x, y, isInfinite=false) {
    this.x = x;
    this.y = y;
    this.isInfinite = isInfinite;
  }

  eq = (other) => {
    return (this.x == other.x && this.y == other.y);
  }

  dist = (other) => {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }

  isLexicographicallyLessThan = (other) => {
    if(other.isInfinite && !this.isInfinite) {
      return true;
    } else if(this.y > other.y) {
      return true;
    } else if(this.y == other.y && this.x < other.x) {
      return true;
    }
    return false;
  }
}
