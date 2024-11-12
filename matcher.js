

function matchDifference(array1, array2) {
    const titlesArray1 = array1.map(match => match.title);
    const titlesArray2 = array2.map(match => match.title);

    // Find matches in array1 not in array2 based on title
    // const diffArray1 = array1.filter(match => !titlesArray2.includes(match.title));

    // Find matches in array2 not in array1 based on title
    const diffArray2 = array2.filter(match => !titlesArray1.includes(match.title));

    // Combine both differences
    return [...diffArray2];
  }
  
  // const array1 = [
  //   { jx: "hello" },
  //   { jx: "bye" }
  // ];
  
  // const array2 = [
  //   { jx: "bye", lm: "come" },
  //   { jx: "hello", lm: "bye" },
  //   { jx: "welcome" },
  // ];
  
  // console.log(arrayDifference(array1, array2));
  // // Output: [ { jx: "bye" } ]
  
  module.exports = matchDifference