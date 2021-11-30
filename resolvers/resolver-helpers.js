export const mileTimesToArrayOfObjects = (arr) => {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
      result.push([])
      arr[i].map((m, j) => {
        m = {lat: m[0], lng: m[1], elev: m[2]}
        result[i].push(m)
      });
    };
    return result;
  };